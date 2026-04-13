import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Hash, Send, Loader2, MessageSquare, Zap,
  FolderKanban, CheckSquare, GitBranch, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import {
  getConversations, getMessages, sendMessage, markAsRead,
  autoJoinSystemChannels, getTeamMembers, searchEntities, getProjectChannels,
  type HubConversation, type HubMessage, type TeamMember, type EntityRef
} from '@/api/hubMessaging';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// Parseia o conteudo e renderiza @mencoes e #referencias como chips
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(@\w+|#\w+:\w+\[[^\]]+\]|#\w[\w-]*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="inline-flex items-center bg-[#00CC6A]/10 text-[#00CC6A] font-black px-1.5 rounded text-[13px]">
              {part}
            </span>
          );
        }
        // #tipo:id[label]
        const refMatch = part.match(/^#(\w+):(\w+)\[([^\]]+)\]$/);
        if (refMatch) {
          const [, tipo, , label] = refMatch;
          const icon = tipo === 'projeto' ? <FolderKanban className="w-3 h-3" /> :
                       tipo === 'tarefa' ? <CheckSquare className="w-3 h-3" /> :
                       tipo === 'sprint' ? <GitBranch className="w-3 h-3" /> : null;
          return (
            <span key={i} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 font-black px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-zinc-200 transition-colors">
              {icon}{label}
            </span>
          );
        }
        if (part.startsWith('#')) {
          return <span key={i} className="inline-flex items-center bg-zinc-100 text-zinc-700 font-black px-1.5 rounded text-xs">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// Avatar inicial
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'xs' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-6 h-6 text-[9px]';
  return (
    <div className={cn('rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center font-black text-zinc-600 uppercase shrink-0', sz)}>
      {(name || '?').charAt(0)}
    </div>
  );
}

// MentionPicker
function MentionPicker({ members, query, onSelect }: {
  members: TeamMember[];
  query: string;
  onSelect: (member: TeamMember) => void;
}) {
  const filtered = members.filter(m =>
    (m.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.username || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  if (!filtered.length) return null;

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-white border border-zinc-200 shadow-sm rounded-xl w-72 max-h-52 overflow-y-auto z-50">
      <div className="px-3 py-2 border-b border-zinc-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mencionar membro</p>
      </div>
      {filtered.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 text-left transition-colors"
        >
          <Avatar name={m.full_name || m.email} size="xs" />
          <div className="min-w-0">
            <p className="text-xs font-black text-zinc-900 truncate">{m.full_name || m.email}</p>
            {m.job_title && <p className="text-[10px] text-zinc-400 truncate">{m.job_title}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}

// EntityPicker
function EntityPicker({ entities, onSelect }: {
  entities: EntityRef[];
  onSelect: (entity: EntityRef) => void;
}) {
  if (!entities.length) return null;

  const typeIcon = (type: EntityRef['type']) => {
    if (type === 'projeto') return <FolderKanban className="w-3.5 h-3.5 text-zinc-500" />;
    if (type === 'tarefa') return <CheckSquare className="w-3.5 h-3.5 text-zinc-500" />;
    if (type === 'sprint') return <GitBranch className="w-3.5 h-3.5 text-zinc-500" />;
    return <Hash className="w-3.5 h-3.5 text-zinc-500" />;
  };

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-white border border-zinc-200 shadow-sm rounded-xl w-80 max-h-52 overflow-y-auto z-50">
      <div className="px-3 py-2 border-b border-zinc-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Referenciar entidade</p>
      </div>
      {entities.map(e => (
        <button
          key={`${e.type}-${e.id}`}
          onClick={() => onSelect(e)}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 text-left transition-colors"
        >
          {typeIcon(e.type)}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-zinc-900 truncate">{e.label}</p>
            {e.sublabel && <p className="text-[10px] text-zinc-400 capitalize truncate">{e.sublabel}</p>}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 shrink-0">{e.type}</span>
        </button>
      ))}
    </div>
  );
}

export default function HubMessaging() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [teamConvs, setTeamConvs] = useState<HubConversation[]>([]);
  const [projectConvs, setProjectConvs] = useState<HubConversation[]>([]);
  const [activeConv, setActiveConv] = useState<HubConversation | null>(null);
  const [messages, setMessages] = useState<HubMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [teamExpanded, setTeamExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // Pickers
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showMention, setShowMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showEntity, setShowEntity] = useState(false);
  const [entityResults, setEntityResults] = useState<EntityRef[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const senderName = userProfile?.full_name || user?.email?.split('@')[0] || 'Membro';

  // Init: join canais fixos + carrega membros + conversas
  useEffect(() => {
    if (!user?.id) return;
    autoJoinSystemChannels(user.id).catch(() => {});
    getTeamMembers().then(setMembers).catch(() => {});

    Promise.all([getConversations(), getProjectChannels()]).then(([all, proj]) => {
      const team = all.filter(c => c.type === 'channel');
      setTeamConvs(team);
      setProjectConvs(proj);
      if (team.length > 0 && !activeConv) setActiveConv(team[0]);
    }).catch(console.error);
  }, [user?.id]);

  // Carrega mensagens ao trocar canal + real-time
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    setMessages([]);

    getMessages(activeConv.id, 100).then(data => {
      setMessages(data);
      setLoadingMsgs(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
    }).catch(() => setLoadingMsgs(false));

    if (user?.id) markAsRead(activeConv.id, user.id).catch(() => {});

    const ch = supabase
      .channel(`hub-${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'hub_messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as HubMessage]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [activeConv?.id]);

  // Detecta @ e # no input para abrir pickers
  const handleInputChange = useCallback((val: string) => {
    setInput(val);

    // Detecta @ no final da palavra atual
    const atMatch = val.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMention(true);
      setShowEntity(false);
      return;
    }

    // Detecta # no final da palavra atual
    const hashMatch = val.match(/#(\w*)$/);
    if (hashMatch) {
      const q = hashMatch[1];
      setShowMention(false);
      setShowEntity(true);
      searchEntities(q, activeConv?.project_id).then(setEntityResults).catch(() => {});
      return;
    }

    setShowMention(false);
    setShowEntity(false);
  }, [activeConv?.project_id]);

  const insertMention = (member: TeamMember) => {
    const handle = member.username || (member.full_name || '').split(' ')[0].toLowerCase();
    const newVal = input.replace(/@\w*$/, `@${handle} `);
    setInput(newVal);
    setShowMention(false);
    inputRef.current?.focus();
  };

  const insertEntity = (entity: EntityRef) => {
    const ref = `#${entity.type}:${entity.id}[${entity.label}]`;
    const newVal = input.replace(/#\w*$/, `${ref} `);
    setInput(newVal);
    setShowEntity(false);
    setEntityResults([]);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      await sendMessage(activeConv.id, content, senderName, user?.id);
    } catch {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMention || showEntity) {
      if (e.key === 'Escape') { setShowMention(false); setShowEntity(false); }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Agrupa mensagens por data
  const grouped: { date: string; msgs: HubMessage[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  });

  const selectConv = (conv: HubConversation) => {
    setActiveConv(conv);
    setShowMention(false);
    setShowEntity(false);
  };

  return (
    <AdminPageLayout title="Mensagens" description="Hub de comunicacao interna do time">
      <div className="flex h-[calc(100vh-140px)] border border-zinc-200 overflow-hidden bg-white">

        {/* ---- Sidebar ---- */}
        <aside className="w-64 shrink-0 bg-zinc-950 flex flex-col border-r border-zinc-800">

          {/* Header */}
          <div className="px-4 py-4 border-b border-zinc-800">
            <p className="text-xs font-black uppercase tracking-widest text-white">RevHackers Hub</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Comunicacao interna do time</p>
          </div>

          <div className="flex-1 overflow-y-auto py-3">

            {/* Canais do time */}
            <div className="mb-4">
              <button
                onClick={() => setTeamExpanded(v => !v)}
                className="w-full flex items-center gap-1.5 px-4 py-1 text-left"
              >
                {teamExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Canais do Time</span>
              </button>
              {teamExpanded && teamConvs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => selectConv(conv)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-4 py-1.5 text-left transition-colors group',
                    activeConv?.id === conv.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  )}
                >
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[13px] font-medium truncate">{conv.name.toLowerCase()}</span>
                </button>
              ))}
            </div>

            {/* Canais de Projeto */}
            {projectConvs.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setProjectsExpanded(v => !v)}
                  className="w-full flex items-center gap-1.5 px-4 py-1 text-left"
                >
                  {projectsExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Projetos</span>
                </button>
                {projectsExpanded && projectConvs.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-1.5 text-left transition-colors group',
                      activeConv?.id === conv.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    )}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0 text-[#00CC6A]" />
                    <span className="text-[13px] font-medium truncate">{conv.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Usuario */}
          <div className="px-4 py-3 border-t border-zinc-800 flex items-center gap-2.5">
            <Avatar name={senderName} size="xs" />
            <div className="min-w-0">
              <p className="text-xs font-black text-zinc-300 truncate">{senderName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
        </aside>

        {/* ---- Area principal ---- */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Header do canal */}
              <div className="px-6 py-3.5 border-b border-zinc-100 flex items-center gap-3 shrink-0 bg-white">
                {activeConv.type === 'project'
                  ? <Zap className="w-4 h-4 text-[#00CC6A] shrink-0" />
                  : <Hash className="w-4 h-4 text-zinc-400 shrink-0" />
                }
                <div>
                  <h2 className="text-sm font-black text-zinc-900">{activeConv.name}</h2>
                  {activeConv.description && (
                    <p className="text-[11px] text-zinc-400">{activeConv.description}</p>
                  )}
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center pb-8">
                    <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-4">
                      {activeConv.type === 'project'
                        ? <Zap className="w-5 h-5 text-[#00CC6A]" strokeWidth={1.5} />
                        : <MessageSquare className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
                      }
                    </div>
                    <p className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-1">
                      {activeConv.type === 'project' ? activeConv.name : `#${activeConv.name.toLowerCase()}`}
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                      {activeConv.type === 'project'
                        ? 'Canal do projeto. Use @ para mencionar membros e # para referenciar tasks, sprints e docs.'
                        : 'Inicio do canal. Seja o primeiro a enviar uma mensagem.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grouped.map(group => (
                      <div key={group.date}>
                        {/* Separador de data */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-px bg-zinc-100" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 shrink-0">{group.date}</span>
                          <div className="flex-1 h-px bg-zinc-100" />
                        </div>

                        <div className="space-y-0.5">
                          {group.msgs.map((msg, i) => {
                            const prev = i > 0 ? group.msgs[i - 1] : null;
                            const isSame = prev?.sender_name === msg.sender_name && !prev?.is_system_event && !msg.is_system_event;
                            const isSystem = msg.is_system_event;

                            if (isSystem) {
                              return (
                                <div key={msg.id} className="flex items-center gap-3 py-1.5">
                                  <div className="flex-1 h-px bg-zinc-100" />
                                  <p className="text-[11px] text-zinc-400 shrink-0 max-w-md text-center px-2">{msg.content}</p>
                                  <div className="flex-1 h-px bg-zinc-100" />
                                </div>
                              );
                            }

                            return (
                              <div key={msg.id} className={cn('flex gap-3 group px-1 py-0.5 rounded hover:bg-zinc-50 transition-colors', isSame ? '' : 'mt-3')}>
                                <div className="w-8 shrink-0 flex justify-center pt-0.5">
                                  {!isSame && <Avatar name={msg.sender_name || '?'} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {!isSame && (
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                      <span className="text-[13px] font-black text-zinc-900">{msg.sender_name || 'Membro'}</span>
                                      <span className="text-[11px] text-zinc-400">{formatTime(msg.created_at)}</span>
                                    </div>
                                  )}
                                  <div className="text-[14px] text-zinc-700 leading-relaxed break-words">
                                    <MessageContent content={msg.content} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="px-6 py-4 border-t border-zinc-100 shrink-0 relative">
                {/* MentionPicker */}
                {showMention && (
                  <MentionPicker
                    members={members}
                    query={mentionQuery}
                    onSelect={insertMention}
                  />
                )}
                {/* EntityPicker */}
                {showEntity && entityResults.length > 0 && (
                  <EntityPicker
                    entities={entityResults}
                    onSelect={insertEntity}
                  />
                )}

                <div className="border border-zinc-200 bg-white focus-within:border-zinc-400 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Mensagem em ${activeConv.type === 'project' ? activeConv.name : '#' + activeConv.name.toLowerCase()}...`}
                    rows={1}
                    className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-relaxed px-4 pt-3 pb-2 min-h-[44px] max-h-[160px]"
                    style={{ height: 'auto' }}
                    onInput={e => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.min(t.scrollHeight, 160) + 'px';
                    }}
                  />
                  <div className="flex items-center justify-between px-3 pb-2">
                    <p className="text-[10px] text-zinc-400">
                      <span className="font-black">@</span> mencionar  <span className="font-black ml-2">#</span> referenciar  <span className="ml-2 text-zinc-300">Enter para enviar</span>
                    </p>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="w-8 h-8 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 flex items-center justify-center transition-colors shrink-0"
                    >
                      {sending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                        : <Send className="w-3.5 h-3.5 text-white" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 text-zinc-200 mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Selecione um canal</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}
