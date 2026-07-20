// ==============================================================================
// CLICKUP WORKSPACE SETUP
// Disparado apos a assinatura do kickoff (PublicKickoffValidation.tsx).
// Cria o folder do cliente no ClickUp e registra a integracao em
// clickup_integrations. NAO cria tarefas. As tarefas sao criadas depois
// pelo clickup-sprint-orchestrator, apos a aprovacao do plano estrategico.
//
// Idempotente: se ja existe uma linha em clickup_integrations com status
// 'ready' para o project_id, retorna o folder existente e marca o run como
// 'skipped'. Seguro para retry.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// @ts-ignore Deno runtime
const CLICKUP_API_KEY = Deno.env.get('CLICKUP_API_KEY');
// @ts-ignore Deno runtime
const CLICKUP_SPACE_ID = Deno.env.get('CLICKUP_SPACE_ID') || '90175101115';
// @ts-ignore Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore Deno runtime
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

// ==============================================================================
// Helpers
// ==============================================================================

async function clickupFetch(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      // 429 e 5xx justificam retry com backoff exponencial
      if (res.status === 429 || res.status >= 500) {
        const wait = 500 * Math.pow(2, i);
        console.warn(`[clickup] ${url} retornou ${res.status}, retry em ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
        lastError = new Error(`ClickUp ${res.status}: ${await res.text()}`);
        continue;
      }
      // 4xx (exceto 429) nao deve retentar
      return res;
    } catch (err) {
      lastError = err;
      const wait = 500 * Math.pow(2, i);
      console.warn(`[clickup] fetch falhou, retry em ${wait}ms`, err);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError || new Error(`ClickUp ${url} falhou apos ${attempts} tentativas`);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

// ==============================================================================
// Handler
// ==============================================================================

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Valida envs criticas de seguranca antes de qualquer trabalho
  if (!CLICKUP_API_KEY || !CLICKUP_SPACE_ID) {
    console.error('[clickup-orchestrator] envs ausentes: CLICKUP_API_KEY ou CLICKUP_SPACE_ID');
    return json({ error: 'ClickUp nao configurado. Contate o admin.' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const t0 = Date.now();
  let projectId: string | null = null;
  let runId: string | null = null;

  try {
    const body = await req.json();
    projectId = body.project_id;

    if (!projectId) {
      return json({ error: 'project_id e obrigatorio' }, 400);
    }

    // 1. Busca dados do projeto
    const { data: project, error: projectError } = await supabase
      .from('rei_projects')
      .select('id, client_name, client_company, trade_name, type')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Projeto nao encontrado: ${projectError?.message || projectId}`);
    }

    const clientName =
      (project as any).trade_name ||
      (project as any).client_company ||
      (project as any).client_name ||
      `Cliente ${String(projectId).substring(0, 8)}`;

    // 2. Cria registro de run para observabilidade
    const { data: runRow } = await supabase
      .from('clickup_orchestrator_runs')
      .insert({
        rei_project_id: projectId,
        kind: 'workspace_setup',
        triggered_by: body.triggered_by || 'kickoff_signature',
        status: 'in_progress',
      })
      .select('id')
      .single();
    runId = runRow?.id ?? null;

    // 3. Idempotencia: se ja existe integracao com workspace pronto, retorna
    const { data: existing } = await supabase
      .from('clickup_integrations')
      .select('id, clickup_folder_id, workspace_status')
      .eq('rei_project_id', projectId)
      .maybeSingle();

    if (existing && existing.workspace_status === 'ready' && existing.clickup_folder_id) {
      console.log(`[clickup-orchestrator] workspace ja existe para ${projectId}, retornando existente`);
      if (runId) {
        await supabase
          .from('clickup_orchestrator_runs')
          .update({
            status: 'skipped',
            folder_id: existing.clickup_folder_id,
            duration_ms: Date.now() - t0,
          })
          .eq('id', runId);
      }
      return json({
        message: 'Workspace ja existente, retornando estado salvo.',
        folderId: existing.clickup_folder_id,
        skipped: true,
      });
    }

    // 4. Cria folder no ClickUp
    console.log(`[clickup-orchestrator] criando folder para ${clientName} no space ${CLICKUP_SPACE_ID}`);
    const folderRes = await clickupFetch(
      `${CLICKUP_API_BASE}/space/${CLICKUP_SPACE_ID}/folder`,
      {
        method: 'POST',
        headers: {
          'Authorization': CLICKUP_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clientName,
          override_statuses: true,
          statuses: [
            { status: "Backlog", color: "#b9bdcf", type: "open" },
            { status: "A Fazer", color: "#f2d600", type: "custom" },
            { status: "Em Progresso", color: "#00a2ff", type: "custom" },
            { status: "Em Revisão", color: "#eb5a46", type: "custom" },
            { status: "Aguardando Cliente", color: "#c377e0", type: "custom" },
            { status: "Concluído", color: "#61bd4f", type: "closed" }
          ]
        }),
      }
    );

    if (!folderRes.ok) {
      throw new Error(`ClickUp retornou ${folderRes.status}: ${await folderRes.text()}`);
    }

    const folder = await folderRes.json();
    const folderId: string = folder.id;

    // 5. Persiste integracao (upsert cobre retry)
    const { error: upsertError } = await supabase
      .from('clickup_integrations')
      .upsert(
        {
          rei_project_id: projectId,
          clickup_folder_id: folderId,
          clickup_space_id: CLICKUP_SPACE_ID,
          workspace_status: 'ready',
          sprints_status: 'pending',
          last_error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'rei_project_id' }
      );

    if (upsertError) {
      throw new Error(`Falha ao persistir clickup_integrations: ${upsertError.message}`);
    }

    // 6. Fecha run como success
    if (runId) {
      await supabase
        .from('clickup_orchestrator_runs')
        .update({
          status: 'success',
          folder_id: folderId,
          duration_ms: Date.now() - t0,
        })
        .eq('id', runId);
    }

    console.log(`[clickup-orchestrator] workspace pronto. folder=${folderId} projeto=${projectId}`);
    return json({
      message: 'Workspace criado com sucesso no ClickUp.',
      folderId,
      skipped: false,
    });
  } catch (error: any) {
    console.error('[clickup-orchestrator] erro:', error);

    // Marca integracao como failed (se projectId ja foi lido)
    if (projectId) {
      await supabase
        .from('clickup_integrations')
        .upsert(
          {
            rei_project_id: projectId,
            workspace_status: 'failed',
            last_error: String(error?.message || error),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'rei_project_id' }
        );
    }

    if (runId) {
      await supabase
        .from('clickup_orchestrator_runs')
        .update({
          status: 'failed',
          error_message: String(error?.message || error),
          duration_ms: Date.now() - t0,
        })
        .eq('id', runId);
    }

    return json({ error: String(error?.message || error) }, 500);
  }
});
