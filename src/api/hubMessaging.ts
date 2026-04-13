import { supabase } from '@/integrations/supabase/client';

export type HubConversation = {
  id: string;
  type: 'channel' | 'direct' | 'project';
  name: string;
  slug: string;
  description?: string;
  project_id?: string;
  is_system: boolean;
  created_at: string;
  unread_count?: number;
  last_message?: string;
  last_message_at?: string;
};

export type HubMessage = {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_name?: string;
  content: string;
  is_system_event: boolean;
  metadata?: Record<string, any>;
  created_at: string;
};

export async function getConversations(): Promise<HubConversation[]> {
  const { data, error } = await (supabase
    .from('hub_conversations' as any) as any)
    .select('*')
    .order('is_system', { ascending: false })
    .order('name');
  if (error) throw error;
  return (data || []) as HubConversation[];
}

export async function getMessages(conversationId: string, limit = 50): Promise<HubMessage[]> {
  const { data, error } = await (supabase
    .from('hub_messages' as any) as any)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data || []) as HubMessage[];
}

export async function sendMessage(
  conversationId: string,
  content: string,
  senderName: string,
  senderId?: string
): Promise<HubMessage> {
  const { data, error } = await (supabase
    .from('hub_messages' as any) as any)
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: senderName,
      content,
      is_system_event: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as HubMessage;
}

export async function postSystemEvent(
  conversationId: string,
  content: string,
  metadata?: Record<string, any>
): Promise<void> {
  await (supabase.from('hub_messages' as any) as any).insert({
    conversation_id: conversationId,
    sender_name: 'Sistema',
    content,
    is_system_event: true,
    metadata: metadata || {},
  });
}

export async function getOrCreateProjectChannel(
  projectId: string,
  projectName: string
): Promise<HubConversation | null> {
  const slug = `project-${projectId}`;
  const { data: existing } = await (supabase
    .from('hub_conversations' as any) as any)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (existing) return existing as HubConversation;

  const { data, error } = await (supabase
    .from('hub_conversations' as any) as any)
    .insert({
      type: 'project',
      name: projectName,
      slug,
      description: `Canal do projeto ${projectName}`,
      project_id: projectId,
      is_system: false,
    })
    .select()
    .single();
  if (error) return null;
  return data as HubConversation;
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await (supabase
    .from('hub_conversation_members' as any) as any)
    .upsert({
      conversation_id: conversationId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id,user_id' });
}

// Garante que o usuario e membro de todos os canais fixos do sistema
// Chamado uma vez ao abrir a pagina de mensagens
export async function autoJoinSystemChannels(userId: string): Promise<void> {
  const { data: systemChannels } = await (supabase
    .from('hub_conversations' as any) as any)
    .select('id')
    .eq('is_system', true);

  if (!systemChannels?.length) return;

  const rows = systemChannels.map((c: any) => ({
    conversation_id: c.id,
    user_id: userId,
    joined_at: new Date().toISOString(),
    last_read_at: new Date().toISOString(),
  }));

  await (supabase
    .from('hub_conversation_members' as any) as any)
    .upsert(rows, { onConflict: 'conversation_id,user_id', ignoreDuplicates: true });
}

// --- Entidades referenciaveis ---

export type TeamMember = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  job_title: string | null;
  email: string;
};

export type EntityRef = {
  id: string;
  type: 'projeto' | 'tarefa' | 'sprint' | 'doc';
  label: string;
  sublabel?: string;
};

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, job_title, email')
    .eq('is_active', true)
    .order('full_name');
  if (error) return [];
  return (data || []) as TeamMember[];
}

export async function searchEntities(query: string, projectId?: string): Promise<EntityRef[]> {
  const results: EntityRef[] = [];
  const q = query.toLowerCase();

  // Projetos
  const { data: projects } = await supabase
    .from('rei_projects')
    .select('id, client_company, trade_name, client_name, type')
    .in('pipeline_stage', ['won', 'onboarding', 'active'])
    .limit(5);

  (projects || []).forEach((p: any) => {
    const name = p.trade_name || p.client_company || p.client_name || '';
    if (name.toLowerCase().includes(q)) {
      results.push({ id: p.id, type: 'projeto', label: name, sublabel: p.type });
    }
  });

  // Tasks (filtradas por projeto se houver)
  const taskQuery = (supabase
    .from('orqflow_tasks' as any) as any)
    .select('id, title, status, project_id')
    .ilike('title', `%${query}%`)
    .limit(8);
  if (projectId) taskQuery.eq('project_id', projectId);
  const { data: tasks } = await taskQuery;
  ((tasks || []) as any[]).forEach((t: any) => {
    results.push({ id: t.id, type: 'tarefa', label: t.title, sublabel: t.status });
  });

  // Sprints
  const sprintQuery = (supabase
    .from('orqflow_sprints' as any) as any)
    .select('id, name, status, project_id')
    .ilike('name', `%${query}%`)
    .limit(5);
  if (projectId) sprintQuery.eq('project_id', projectId);
  const { data: sprints } = await sprintQuery;
  ((sprints || []) as any[]).forEach((s: any) => {
    results.push({ id: s.id, type: 'sprint', label: s.name, sublabel: s.status });
  });

  return results;
}

export async function getProjectChannels(): Promise<HubConversation[]> {
  const { data } = await (supabase
    .from('hub_conversations' as any) as any)
    .select('*')
    .eq('type', 'project')
    .order('name');
  return (data || []) as HubConversation[];
}
