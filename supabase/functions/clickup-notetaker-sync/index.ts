// =============================================================================
// clickup-notetaker-sync
//
// Puxa notas de reunioes do ClickUp NoteTaker e vincula ao projeto no Hub.
//
// O ClickUp NoteTaker salva anotacoes como Docs dentro do workspace.
// Esta funcao:
//   1. Lista Docs recentes nas pastas de clientes vinculados.
//   2. Identifica quais sao notas de reuniao (titulo com padrao de meeting).
//   3. Extrai conteudo, participantes e metadados.
//   4. Salva em meeting_recordings vinculado ao rei_project correspondente.
//
// Pode ser acionada de 3 formas:
//   A) Manual: POST com { project_id } para sincronizar um projeto especifico.
//   B) Cron: POST com { sync_all: true } para varrer todos os projetos ativos.
//   C) Webhook: Chamada pelo clickup-sync quando detecta taskCreated com tag
//      "notetaker" ou doc criado na pasta do cliente.
//
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// @ts-ignore Deno runtime
const CLICKUP_API_KEY = Deno.env.get('CLICKUP_API_KEY');
// @ts-ignore Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore Deno runtime
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
// @ts-ignore Deno runtime
const CLICKUP_WORKSPACE_ID = Deno.env.get('CLICKUP_WORKSPACE_ID') ?? '84197570';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

// ---------------------------------------------------------------------------
// ClickUp API Helper com Retry
// ---------------------------------------------------------------------------

async function clickupFetch(url: string, init?: RequestInit, attempts = 3): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          'Authorization': CLICKUP_API_KEY,
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      });
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        const wait = 500 * Math.pow(2, i);
        await new Promise(r => setTimeout(r, wait));
        lastError = new Error(`ClickUp ${res.status}: ${await res.text()}`);
        continue;
      }
      return res; // 4xx non-retryable
    } catch (err: any) {
      lastError = err;
      const wait = 500 * Math.pow(2, i);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastError || new Error(`ClickUp fetch failed: ${url}`);
}

// ---------------------------------------------------------------------------
// Detecta se um Doc eh uma nota de reuniao do NoteTaker
// Padroes conhecidos do ClickUp NoteTaker:
//   - "Meeting Notes - [date]"
//   - "Call with [name] - [date]"
//   - "[Meeting Title] - Meeting Notes"
//   - Docs com content contendo "Attendees:", "Action Items:", "Summary:"
// ---------------------------------------------------------------------------

function isNotetakerDoc(doc: any): boolean {
  const name = (doc.name || '').toLowerCase();
  const notetakerPatterns = [
    'meeting notes',
    'call with',
    'notas da reuniao',
    'notas de reuniao',
    'meeting summary',
    'ai notetaker',
    'notetaker',
  ];
  return notetakerPatterns.some(p => name.includes(p));
}

// ---------------------------------------------------------------------------
// Extrai participantes/emails do conteudo do Doc
// ---------------------------------------------------------------------------

function extractParticipants(content: string): string[] {
  const emails: string[] = [];
  // Match email addresses
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
  const matches = content.match(emailRegex);
  if (matches) {
    emails.push(...matches);
  }
  return [...new Set(emails)];
}

// ---------------------------------------------------------------------------
// Extrai action items do doc
// ---------------------------------------------------------------------------

function extractActionItems(content: string): string[] {
  const items: string[] = [];
  // Match lines after "Action Items" header
  const actionSection = content.split(/action items|itens de a[cç][aã]o|next steps|proximos passos/i)[1];
  if (actionSection) {
    const lines = actionSection.split('\n');
    for (const line of lines) {
      const trimmed = line.replace(/^[\s\-\*\[\]xX]+/, '').trim();
      if (trimmed.length > 5 && trimmed.length < 300) {
        items.push(trimmed);
      }
      // Stop at next section header
      if (/^#{1,3}\s/.test(line) && items.length > 0) break;
    }
  }
  return items.slice(0, 20); // max 20 items
}

// ---------------------------------------------------------------------------
// Busca Docs em uma pasta ClickUp
// ---------------------------------------------------------------------------

async function getDocsForWorkspace(workspaceId: string): Promise<any[]> {
  try {
    const res = await clickupFetch(`${CLICKUP_API_BASE}/team/${workspaceId}/doc`);
    if (!res.ok) {
      console.error(`[notetaker-sync] Falha ao listar docs: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.docs || [];
  } catch (err: any) {
    console.error(`[notetaker-sync] Erro ao listar docs:`, err.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Busca conteudo de um Doc (pages)
// ---------------------------------------------------------------------------

async function getDocContent(workspaceId: string, docId: string): Promise<string> {
  try {
    const res = await clickupFetch(`${CLICKUP_API_BASE}/team/${workspaceId}/doc/${docId}/page`);
    if (!res.ok) {
      console.error(`[notetaker-sync] Falha ao ler doc ${docId}: ${res.status}`);
      return '';
    }
    const data = await res.json();
    const pages = data.pages || [];
    // Concatenate all page content
    return pages.map((p: any) => p.content || p.text || '').join('\n\n');
  } catch (err: any) {
    console.error(`[notetaker-sync] Erro ao ler doc ${docId}:`, err.message);
    return '';
  }
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { project_id, sync_all } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Buscar projetos para sincronizar
    let projects: any[] = [];

    if (project_id) {
      // Sincroniza um projeto especifico
      const { data } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_email, client_company, trade_name, clickup_folder_id')
        .eq('id', project_id)
        .single();
      if (data) projects = [data];
    } else if (sync_all) {
      // Sincroniza todos os projetos ativos com folder vinculado
      const { data } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_email, client_company, trade_name, clickup_folder_id')
        .in('pipeline_stage', ['onboarding', 'active'])
        .not('clickup_folder_id', 'is', null);
      if (data) projects = data;
    } else {
      return new Response(JSON.stringify({ error: 'Envie project_id ou sync_all: true' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (projects.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: 'Nenhum projeto para sincronizar' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!CLICKUP_API_KEY) {
      return new Response(JSON.stringify({ error: 'CLICKUP_API_KEY nao configurada no servidor.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Workspace ID via env var (fallback para workspace Customer Centric)
    const workspaceId = CLICKUP_WORKSPACE_ID;

    // Buscar todos os docs do workspace
    const allDocs = await getDocsForWorkspace(workspaceId);
    console.log(`[notetaker-sync] ${allDocs.length} docs encontrados no workspace`);

    // Filtrar apenas docs de notetaker
    const notetakerDocs = allDocs.filter(isNotetakerDoc);
    console.log(`[notetaker-sync] ${notetakerDocs.length} docs de notetaker identificados`);

    let imported = 0;
    let skipped = 0;

    for (const project of projects) {
      const folderId = project.clickup_folder_id;
      if (!folderId) continue;

      // Filtrar docs que pertencem a pasta do projeto
      // Docs do ClickUp podem ter parent_id ou folder apontando pra pasta
      const projectDocs = notetakerDocs.filter((doc: any) => {
        // Check se o doc pertence a pasta do projeto
        return doc.workspace_id === workspaceId && (
          doc.parent?.id === folderId ||
          doc.parent_id === folderId ||
          (doc.list?.folder?.id === folderId)
        );
      });

      // Se nenhum filtro por folder funcionou, tenta match por nome do cliente no titulo
      let docsToProcess = projectDocs;
      if (docsToProcess.length === 0) {
        const clientNames = [
          project.trade_name,
          project.client_company,
          project.client_name,
        ].filter(Boolean).map((n: string) => n.toLowerCase());

        docsToProcess = notetakerDocs.filter((doc: any) => {
          const docName = (doc.name || '').toLowerCase();
          return clientNames.some(name => docName.includes(name));
        });
      }

      for (const doc of docsToProcess) {
        const docId = doc.id;
        
        // Verifica se ja foi importado (deduplica por clickup_doc_id)
        const { data: existing } = await supabase
          .from('meeting_recordings')
          .select('id')
          .eq('clickup_doc_id', docId)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        // Busca conteudo do doc
        const content = await getDocContent(workspaceId, docId);
        if (!content || content.length < 20) {
          skipped++;
          continue;
        }

        // Extrai metadados
        const participants = extractParticipants(content);
        const actionItems = extractActionItems(content);
        const createdAt = doc.date_created
          ? new Date(parseInt(doc.date_created)).toISOString()
          : new Date().toISOString();

        // Insere no meeting_recordings
        const { data: inserted, error: insertErr } = await supabase
          .from('meeting_recordings')
          .insert({
            title: doc.name || 'Reuniao sem titulo',
            transcript: content,
            ai_summary: content.substring(0, 500),
            happened_at: createdAt,
            transcript_status: 'completed',
            rei_project_id: project.id,
            clickup_doc_id: docId,
            participants: participants,
            meeting_type: 'cs_call',
            tags: ['clickup-notetaker', 'auto-import'],
          })
          .select()
          .single();

        if (insertErr) {
          console.error(`[notetaker-sync] Erro ao salvar doc ${docId}:`, insertErr.message);
          continue;
        }

        console.log(`[notetaker-sync] Importado: "${doc.name}" -> projeto ${project.trade_name || project.client_name}`);
        imported++;

        // Cria tasks de action items no orqflow se existirem
        if (actionItems.length > 0) {
          const tasks = actionItems.map(item => ({
            project_id: project.id,
            title: item,
            status: 'todo',
            priority: 'medium',
            description: `Combinado na reuniao: ${doc.name}`,
          }));
          await supabase.from('orqflow_tasks').insert(tasks).catch(err =>
            console.error('[notetaker-sync] Erro ao criar tasks:', err)
          );
          console.log(`[notetaker-sync] ${tasks.length} action items criados para ${project.trade_name || project.client_name}`);
        }

        // Dispara analise de transcript se tiver conteudo suficiente
        if (content.length > 200) {
          supabase.functions.invoke('analyze-meeting-transcript', {
            body: { recordingId: inserted.id }
          }).catch(err => console.error('[notetaker-sync] Erro ao chamar analise:', err));
        }
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      projects_scanned: projects.length,
      docs_found: notetakerDocs.length,
      imported,
      skipped,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[notetaker-sync] Erro:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
