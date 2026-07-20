// ==============================================================================
// CLICKUP SPRINT ORCHESTRATOR
// Disparado apos a aprovacao do plano estrategico
// (StrategicPlanPresentation.tsx, dentro do onSuccess da assinatura).
//
// Le strategic_plans.roadmap_data.roadmap_phases e materializa cada fase
// como uma List no folder ja existente no ClickUp (criado previamente pelo
// clickup-orchestrator no pos-kickoff). Cada item da fase vira uma task.
//
// Pre-requisito: clickup_integrations.workspace_status = 'ready' e
// clickup_folder_id preenchido. Se nao existir, retorna erro explicito.
//
// Idempotente: se sprints_status ja eh 'ready', retorna sem recriar.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { ensureHubProjectIdField, buildCustomFieldsPayload } from "../_shared/clickup-custom-fields.ts";

// @ts-ignore Deno runtime
const CLICKUP_API_KEY = Deno.env.get('CLICKUP_API_KEY');
// @ts-ignore Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore Deno runtime
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

async function clickupFetch(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        const wait = 500 * Math.pow(2, i);
        console.warn(`[clickup] ${url} retornou ${res.status}, retry em ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
        lastError = new Error(`ClickUp ${res.status}: ${await res.text()}`);
        continue;
      }
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

interface RoadmapPhase {
  name?: string;
  title?: string;
  items?: string[];
}

interface SprintListRecord {
  phase_name: string;
  phase_title: string;
  list_id: string;
  task_ids: string[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!CLICKUP_API_KEY) {
    console.error('[clickup-sprint-orchestrator] env ausente: CLICKUP_API_KEY');
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

    // 1. Cria run de observabilidade
    const { data: runRow } = await supabase
      .from('clickup_orchestrator_runs')
      .insert({
        rei_project_id: projectId,
        kind: 'sprint_setup',
        triggered_by: body.triggered_by || 'plan_approval',
        status: 'in_progress',
      })
      .select('id')
      .single();
    runId = runRow?.id ?? null;

    // 2. Busca integracao existente (precisa ter folder criado antes)
    const { data: integration, error: integrationError } = await supabase
      .from('clickup_integrations')
      .select('id, clickup_folder_id, workspace_status, sprints_status, sprint_lists')
      .eq('rei_project_id', projectId)
      .maybeSingle();

    if (integrationError) {
      throw new Error(`Erro ao buscar clickup_integrations: ${integrationError.message}`);
    }

    if (!integration || !integration.clickup_folder_id || integration.workspace_status !== 'ready') {
      throw new Error(
        'Workspace do ClickUp nao esta pronto. O kickoff precisa ter sido assinado antes da aprovacao do plano.'
      );
    }

    // 3. Idempotencia: se ja esta pronto, retorna
    if (integration.sprints_status === 'ready') {
      console.log(`[clickup-sprint-orchestrator] sprints ja criadas para ${projectId}, skip`);
      if (runId) {
        await supabase
          .from('clickup_orchestrator_runs')
          .update({
            status: 'skipped',
            folder_id: integration.clickup_folder_id,
            duration_ms: Date.now() - t0,
          })
          .eq('id', runId);
      }
      return json({
        message: 'Sprints ja criadas, retornando estado salvo.',
        folderId: integration.clickup_folder_id,
        sprintLists: integration.sprint_lists,
        skipped: true,
      });
    }

    // 4. Marca como 'creating' para evitar race condition em chamadas concorrentes
    await supabase
      .from('clickup_integrations')
      .update({ sprints_status: 'creating', updated_at: new Date().toISOString() })
      .eq('id', integration.id);

    // X. Garante o Custom Field hub_project_id
    let hubProjectIdFieldId: string | null = null;
    try {
      const folderRes = await clickupFetch(`${CLICKUP_API_BASE}/folder/${integration.clickup_folder_id}`, {
          headers: { 'Authorization': CLICKUP_API_KEY! }
      });
      const folderData = await folderRes.json();
      const spaceId = folderData.space?.id;
      if (spaceId) {
          hubProjectIdFieldId = await ensureHubProjectIdField(spaceId, CLICKUP_API_KEY!);
          console.log(`[clickup-sprint-orchestrator] Field hub_project_id garantido no space ${spaceId} (${hubProjectIdFieldId})`);
      }
    } catch(err) {
      console.warn(`[clickup-sprint-orchestrator] Aviso: falha ao garantir custom field: ${err}`);
    }

    // 5. Busca o plano estrategico aprovado
    const { data: plan, error: planError } = await supabase
      .from('strategic_plans')
      .select('id, roadmap_data, status')
      .eq('rei_project_id', projectId)
      .eq('plan_type', 'strategic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError) {
      throw new Error(`Erro ao buscar strategic_plans: ${planError.message}`);
    }
    if (!plan) {
      throw new Error(`Plano estrategico nao encontrado para o projeto ${projectId}`);
    }

    // 6. Extrai e NORMALIZA as fases do roadmap (resiliência contra variações do GPT)
    const roadmapData: any = plan.roadmap_data || {};

    // O GPT pode gerar como 'roadmap_phases', 'phases', ou 'sprints'
    let rawPhases: any[] = Array.isArray(roadmapData.roadmap_phases)
      ? roadmapData.roadmap_phases
      : Array.isArray(roadmapData.phases)
        ? roadmapData.phases
        : Array.isArray(roadmapData.sprints)
          ? roadmapData.sprints
          : [];

    // Normaliza cada fase: GPT pode usar 'tasks' em vez de 'items', 'description' em vez de 'title'
    const normalizedPhases: RoadmapPhase[] = rawPhases.map((p: any, idx: number) => ({
      name: p.name || p.sprint_name || `Sprint ${String(idx + 1).padStart(2, '0')}`,
      title: p.title || p.description || p.objetivo || '',
      items: Array.isArray(p.items)
        ? p.items.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
        : Array.isArray(p.tasks)
          ? p.tasks.map((t: any) => typeof t === 'string' ? t : t.name || t.title || String(t)).filter((s: string) => s.trim().length > 0)
          : Array.isArray(p.deliverables)
            ? p.deliverables.filter((i: any) => typeof i === 'string' && i.trim().length > 0)
            : [],
    }));

    // Filtra fases inválidas (sem items reais ou sem identificação)
    const phases: RoadmapPhase[] = normalizedPhases.filter(p =>
      p.items && p.items.length > 0 && (p.name || p.title)
    );

    if (phases.length === 0) {
      const debugInfo = JSON.stringify(Object.keys(roadmapData)).substring(0, 200);
      throw new Error(`roadmap_phases sem fases válidas com items. Keys disponíveis: ${debugInfo}. Raw phases count: ${rawPhases.length}`);
    }

    console.log(`[clickup-sprint-orchestrator] ${rawPhases.length} fases brutas → ${phases.length} válidas`);

    // 7. Para cada fase: cria List, depois cria Tasks dentro dela
    const sprintLists: SprintListRecord[] = [];
    const listIdsCreated: string[] = [];
    let totalTasksCreated = 0;
    let totalTasksExpected = 0;

    for (const phase of phases) {
      const phaseName = phase.name || 'Sprint';
      const phaseTitle = phase.title || '';
      const listName = phaseTitle ? `${phaseName}: ${phaseTitle}` : phaseName;
      const items = Array.isArray(phase.items) ? phase.items : [];
      totalTasksExpected += items.length;

      // Cria List
      const listRes = await clickupFetch(
        `${CLICKUP_API_BASE}/folder/${integration.clickup_folder_id}/list`,
        {
          method: 'POST',
          headers: {
            'Authorization': CLICKUP_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: listName }),
        }
      );

      if (!listRes.ok) {
        const errText = await listRes.text();
        console.error(`[clickup-sprint-orchestrator] falha ao criar list '${listName}': ${errText}`);
        continue;
      }

      const list = await listRes.json();
      const listId: string = list.id;
      listIdsCreated.push(listId);

      const taskIds: string[] = [];

      // Cria tasks dentro da list
      for (const item of items) {
        const taskName = String(item).substring(0, 500);

        const bodyPayload: any = {
            name: taskName,
            description: `Tarefa gerada a partir do plano estrategico aprovado.\n\nFase: ${phaseName}${phaseTitle ? ' - ' + phaseTitle : ''}`,
        };

        if (hubProjectIdFieldId && projectId) {
            bodyPayload.custom_fields = buildCustomFieldsPayload(projectId, hubProjectIdFieldId);
        }

        const taskRes = await clickupFetch(
          `${CLICKUP_API_BASE}/list/${listId}/task`,
          {
            method: 'POST',
            headers: {
              'Authorization': CLICKUP_API_KEY!,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
          }
        );

        if (taskRes.ok) {
          const task = await taskRes.json();
          taskIds.push(task.id);
          totalTasksCreated += 1;
        } else {
          console.warn(`[clickup-sprint-orchestrator] falha ao criar task '${taskName}': ${await taskRes.text()}`);
        }
      }

      sprintLists.push({
        phase_name: phaseName,
        phase_title: phaseTitle,
        list_id: listId,
        task_ids: taskIds,
      });
    }

    // 8. Persiste resultado final
    const finalStatus = listIdsCreated.length === phases.length && totalTasksCreated === totalTasksExpected
      ? 'ready'
      : listIdsCreated.length > 0
        ? 'ready' // tem pelo menos algo criado, marca ready mas log de run conta como partial
        : 'failed';

    await supabase
      .from('clickup_integrations')
      .update({
        sprints_status: finalStatus,
        sprint_lists: sprintLists,
        last_error: finalStatus === 'failed' ? 'Nenhuma list foi criada no ClickUp.' : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    // 9. Fecha run
    const runStatus =
      totalTasksCreated === totalTasksExpected && listIdsCreated.length === phases.length
        ? 'success'
        : 'partial';

    if (runId) {
      await supabase
        .from('clickup_orchestrator_runs')
        .update({
          status: runStatus,
          folder_id: integration.clickup_folder_id,
          list_ids_created: listIdsCreated,
          tasks_created_count: totalTasksCreated,
          duration_ms: Date.now() - t0,
        })
        .eq('id', runId);
    }

    console.log(
      `[clickup-sprint-orchestrator] concluido. lists=${listIdsCreated.length}/${phases.length} tasks=${totalTasksCreated}/${totalTasksExpected}`
    );

    return json({
      message: 'Sprints materializadas no ClickUp.',
      folderId: integration.clickup_folder_id,
      sprintLists,
      listsCreated: listIdsCreated.length,
      tasksCreated: totalTasksCreated,
      tasksExpected: totalTasksExpected,
    });
  } catch (error: any) {
    console.error('[clickup-sprint-orchestrator] erro:', error);

    if (projectId) {
      await supabase
        .from('clickup_integrations')
        .update({
          sprints_status: 'failed',
          last_error: String(error?.message || error),
          updated_at: new Date().toISOString(),
        })
        .eq('rei_project_id', projectId);
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
