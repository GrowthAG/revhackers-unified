// ==============================================================================
// CLICKUP PROVISION — Sprint & Task Provisioner
//
// Materializa sprints + tarefas no ClickUp a partir dos templates definidos
// em task-templates.ts. Cada tipo de projeto (consulting, site, linkedin,
// founder, crm_ops) x duracao gera um conjunto previsivel de sprints e
// tarefas operacionais.
//
// Pre-requisito:
//   - clickup_integrations.workspace_status = 'ready'
//   - clickup_folder_id preenchido (criado pelo clickup-orchestrator)
//   - rei_projects.type e duration_days preenchidos
//
// Apos criar os templates base, opcionalmente enriquece com tarefas do
// plano estrategico (strategic_plans.roadmap_data) quando disponivel,
// adicionando tag [AI] para diferenciar.
//
// Idempotente: se sprints_status ja eh 'ready', retorna sem recriar.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { ensureHubProjectIdField, buildCustomFieldsPayload } from "../_shared/clickup-custom-fields.ts";
import { getProjectTemplate, RECURRING_TASKS } from "./task-templates.ts";
import type { ProjectType, DurationDays, SprintTemplate, TaskTemplate } from "./task-templates.ts";

// @ts-ignore Deno runtime
const CLICKUP_API_KEY = Deno.env.get('CLICKUP_API_KEY') || 'pk_84197570_GYIBMGTI4Z9MCTUUVG6T8THHO6YJR0BB';
// @ts-ignore Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore Deno runtime
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

// Mapeamento de prioridade interna -> ClickUp API
// ClickUp: 1=urgent, 2=high, 3=normal, 4=low
const PRIORITY_MAP: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4 };

// ==============================================================================
// Helpers
// ==============================================================================

async function clickupFetch(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        const wait = 500 * Math.pow(2, i);
        console.warn(`[clickup-provision] ${url} retornou ${res.status}, retry em ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
        lastError = new Error(`ClickUp ${res.status}: ${await res.text()}`);
        continue;
      }
      // 4xx (exceto 429) — nao retenta
      return res;
    } catch (err) {
      lastError = err;
      const wait = 500 * Math.pow(2, i);
      console.warn(`[clickup-provision] fetch falhou, retry em ${wait}ms`, err);
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

// Valida se tipo e duracao sao combinacoes validas
function isValidCombination(type: string, duration: number): boolean {
  const validCombinations: Record<string, number[]> = {
    consulting: [30, 60, 90, 180, 360],
    site: [30, 60],
    linkedin: [90, 180, 360],
    crm_ops: [30, 60, 90],
  };
  return validCombinations[type]?.includes(duration) ?? false;
}

// Extrai duracao como INT de project_duration TEXT ou duration_days INT
function extractDurationDays(project: any): number | null {
  // Prioridade 1: duration_days (INT) ja existe
  if (project.duration_days && typeof project.duration_days === 'number') {
    return project.duration_days;
  }
  // Prioridade 2: parsear project_duration TEXT (ex: "90 dias", "90", "180")
  if (project.project_duration) {
    const match = String(project.project_duration).match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  // Fallback
  return null;
}

interface SprintListRecord {
  sprint_index: number;
  sprint_theme: string;
  sprint_goal: string;
  list_id: string;
  task_count: number;
  task_ids: string[];
}

// ==============================================================================
// Handler
// ==============================================================================

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!CLICKUP_API_KEY) {
    console.error('[clickup-provision] env ausente: CLICKUP_API_KEY');
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

    // 2. Busca dados do projeto
    const { data: project, error: projectError } = await supabase
      .from('rei_projects')
      .select(`
        id, client_name, client_company, trade_name, type, 
        duration_days, project_duration, ghl_opportunity_id, organization_id,
        organizations ( slug, settings )
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Projeto nao encontrado: ${projectError?.message || projectId}`);
    }

    const projectType = (project as any).type as string;
    const durationDays = extractDurationDays(project);

    if (!durationDays) {
      throw new Error(
        `Projeto ${projectId} nao tem duration_days definido. ` +
        `Defina a duracao do projeto antes de provisionar as sprints.`
      );
    }

    if (!isValidCombination(projectType, durationDays)) {
      throw new Error(
        `Combinacao invalida: type=${projectType}, duration=${durationDays}. ` +
        `Combinacoes validas: consulting(30-360), site(30-60), linkedin(90-360), crm_ops(30-90).`
      );
    }

    console.log(`[clickup-provision] Projeto ${projectId}: type=${projectType}, duration=${durationDays}d`);

    // 3. Busca integracao existente (precisa folder criado pelo clickup-orchestrator)
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
        'Workspace do ClickUp nao esta pronto. O folder do cliente precisa ter sido criado antes.'
      );
    }

    // 4. Idempotencia: se ja esta pronto, retorna
    if (integration.sprints_status === 'ready') {
      console.log(`[clickup-provision] sprints ja criadas para ${projectId}, skip`);
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

    // 5. Marca como 'creating' para evitar race condition
    await supabase
      .from('clickup_integrations')
      .update({ sprints_status: 'creating', updated_at: new Date().toISOString() })
      .eq('id', integration.id);

    // 6. Gera template baseado no tipo + duracao
    const template = getProjectTemplate(
      projectType as ProjectType,
      durationDays as DurationDays,
    );

    console.log(
      `[clickup-provision] Template gerado: ${template.sprint_count} sprints, ` +
      `tier=${template.tier}, tipo=${template.type}`
    );

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
          console.log(`[clickup-provision] Field hub_project_id garantido no space ${spaceId} (${hubProjectIdFieldId})`);
      }
    } catch(err) {
      console.warn(`[clickup-provision] Aviso: falha ao garantir custom field: ${err}`);
    }

    // 7. Busca tarefas extras do plano estrategico (se existir)
    let aiTasks: { sprintIndex: number; name: string; description: string }[] = [];
    const { data: plan } = await supabase
      .from('strategic_plans')
      .select('roadmap_data')
      .eq('rei_project_id', projectId)
      .eq('plan_type', 'strategic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (plan?.roadmap_data) {
      const rd: any = plan.roadmap_data;
      const phases: any[] = rd.roadmap_phases || rd.phases || rd.sprints || [];

      phases.forEach((phase: any, idx: number) => {
        const items = phase.items || phase.tasks || phase.deliverables || [];
        items.forEach((item: any) => {
          const taskName = typeof item === 'string' ? item : (item.name || item.title || String(item));
          if (taskName.trim().length > 0) {
            aiTasks.push({
              sprintIndex: idx + 1,
              name: `[AI] ${taskName}`.substring(0, 500),
              description: `Tarefa gerada pela IA com base no plano estrategico aprovado.\n\nFase: ${phase.name || phase.title || `Sprint ${idx + 1}`}`,
            });
          }
        });
      });

      console.log(`[clickup-provision] ${aiTasks.length} tarefas extras do plano estrategico`);
    }

    // 8. Cria Lists (sprints) e Tasks no ClickUp
    const sprintLists: SprintListRecord[] = [];
    const listIdsCreated: string[] = [];
    let totalTasksCreated = 0;
    let totalTasksExpected = 0;

    for (const sprint of template.sprints) {
      const listName = `Sprint ${String(sprint.index).padStart(2, '0')} — ${sprint.theme}`;

      // Conta total esperado (template + AI + recorrentes ja incluso)
      const sprintAiTasks = aiTasks.filter(t => t.sprintIndex === sprint.index);
      totalTasksExpected += sprint.tasks.length + sprintAiTasks.length;

      // Cria List no ClickUp
      const listRes = await clickupFetch(
        `${CLICKUP_API_BASE}/folder/${integration.clickup_folder_id}/list`,
        {
          method: 'POST',
          headers: {
            'Authorization': CLICKUP_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: listName,
            content: sprint.goal,
          }),
        }
      );

      if (!listRes.ok) {
        const errText = await listRes.text();
        console.error(`[clickup-provision] falha ao criar list '${listName}': ${errText}`);
        continue;
      }

      const list = await listRes.json();
      const listId: string = list.id;
      listIdsCreated.push(listId);

      const taskIds: string[] = [];

      // Cria tasks do template
      for (const task of sprint.tasks) {
        const taskId = await createClickUpTask(listId, task);
        if (taskId) {
          taskIds.push(taskId);
          totalTasksCreated++;
        }
      }

      // Cria a "Task Zero" (Central de Documentacao) no sprint 1
      if (sprint.index === 1) {
          const appUrl = Deno.env.get('HUB_APP_URL') || 'https://hub.revhackers.com';
          const taskZeroId = await createClickUpTask(listId, {
              name: "Central de Documentação do Projeto",
              description: `Acesse a Central de Documentação e visualização financeira deste projeto em operacao:\n\n${appUrl}/admin/projects/${projectId}\n\n(Link interno. O app do cliente é gerado após envio do plano estratégico).`,
              priority: 1,
              tag: 'hub_docs'
          });
          if (taskZeroId) {
              await supabase.from('rei_projects').update({ clickup_docs_task_id: taskZeroId }).eq('id', projectId);
              taskIds.push(taskZeroId);
              totalTasksCreated++;
              console.log(`[clickup-provision] Task Zero provisionada com sucesso: ${taskZeroId}`);
          }
      }

      // Cria tasks do plano estrategico (AI)
      for (const aiTask of sprintAiTasks) {
        const taskId = await createClickUpTask(listId, {
          name: aiTask.name,
          description: aiTask.description,
          priority: 3,
          tag: 'ai-generated',
        });
        if (taskId) {
          taskIds.push(taskId);
          totalTasksCreated++;
        }
      }

      sprintLists.push({
        sprint_index: sprint.index,
        sprint_theme: sprint.theme,
        sprint_goal: sprint.goal,
        list_id: listId,
        task_count: taskIds.length,
        task_ids: taskIds,
      });

      console.log(
        `[clickup-provision] Sprint ${sprint.index}/${template.sprint_count} criada: ` +
        `${taskIds.length} tasks (list=${listId})`
      );
    }

    // 9. Persiste resultado
    const finalStatus = listIdsCreated.length > 0 ? 'ready' : 'failed';

    await supabase
      .from('clickup_integrations')
      .update({
        sprints_status: finalStatus,
        sprint_lists: sprintLists,
        last_error: finalStatus === 'failed' ? 'Nenhuma list foi criada no ClickUp.' : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    // 10. Fecha run
    const runStatus =
      totalTasksCreated === totalTasksExpected && listIdsCreated.length === template.sprint_count
        ? 'success'
        : listIdsCreated.length > 0
          ? 'partial'
          : 'failed';

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

    // 11. Write-back das URLs mestre pro GHL (Workflow "Round-Trip")
    if ((project as any)?.ghl_opportunity_id && (project as any)?.organizations?.settings) {
      const org = (project as any).organizations;
      const settings = org.settings;
      const slug = org.slug;
      
      const clickupWorkspaceField = settings.ghl_opp_custom_fields?.clickup_workspace;
      const clickupDocsField = settings.ghl_opp_custom_fields?.clickup_docs;

      if (clickupWorkspaceField && clickupDocsField) {
        // Obter chave da API via env baseada no slug
        let ghlToken = '';
        if (slug === 'growth-funnels') ghlToken = Deno.env.get('GHL_PIT_FUNNELS') || '';
        if (slug === 'revhackers') ghlToken = Deno.env.get('GHL_PIT_REVHACKERS') || '';
        
        if (ghlToken) {
          const workspaceUrl = `https://app.clickup.com/v/l/f/${integration.clickup_folder_id}`;
          const docsUrl = `https://app.clickup.com/v/l/f/${integration.clickup_folder_id}`;
          
          console.log(`[clickup-provision] Enviando URLs Write-Back pro GHL (Opp: ${(project as any).ghl_opportunity_id})...`);
          
          try {
            const csPipelineId = settings.ghl_pipelines?.cs_journey_pipeline;
            const csOnboardingStageId = settings.ghl_pipelines?.cs_journey_stages?.onboarding;

            const updatePayload: any = {
              customFields: [
                { id: clickupWorkspaceField, field_value: workspaceUrl },
                { id: clickupDocsField, field_value: docsUrl }
              ]
            };

            // Se os IDs do Pipeline CS estiverem parametrizados, move o Card pra lá
            if (csPipelineId && csOnboardingStageId) {
              updatePayload.pipelineId = csPipelineId;
              updatePayload.pipelineStageId = csOnboardingStageId;
              console.log(`[clickup-provision] Enviando Opportunity para CS Pipeline (Pipeline: ${csPipelineId}, Stage: ${csOnboardingStageId})`);
            }
            
            const ghlRes = await fetch(`https://services.leadconnectorhq.com/opportunities/${(project as any).ghl_opportunity_id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${ghlToken}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(updatePayload)
            });
            
            if (!ghlRes.ok) {
              const errTxt = await ghlRes.text();
              console.error(`[clickup-provision] Falha no write-back GHL: ${errTxt}`);
            } else {
              console.log(`[clickup-provision] Write-Back URLs pro GHL com sucesso!`);
            }
          } catch(err) {
            console.error(`[clickup-provision] Excecao no write-back GHL:`, err);
          }
        } else {
          console.warn(`[clickup-provision] Nenhuma chave GHL_PIT configurada para a subconta ${slug}`);
        }
      }
    }

    const summary = {
      message: 'Sprints provisionadas com sucesso no ClickUp.',
      project: {
        id: projectId,
        type: projectType,
        duration_days: durationDays,
        tier: template.tier,
      },
      clickup: {
        folderId: integration.clickup_folder_id,
        sprintsCreated: listIdsCreated.length,
        sprintsExpected: template.sprint_count,
        tasksCreated: totalTasksCreated,
        tasksExpected: totalTasksExpected,
        aiTasksAdded: aiTasks.length,
      },
      sprintLists,
    };

    console.log(`[clickup-provision] concluido:`, JSON.stringify(summary.clickup));
    return json(summary);

  } catch (error: any) {
    console.error('[clickup-provision] erro:', error);

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

  // Funcao auxiliar: cria uma task no ClickUp e retorna o ID
  async function createClickUpTask(
    listId: string,
    task: TaskTemplate | { name: string; description: string; priority: number; tag: string },
  ): Promise<string | null> {
    
    const bodyPayload: any = {
      name: task.name,
      description: task.description,
      priority: PRIORITY_MAP[task.priority] ?? 3,
      tags: [task.tag],
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
      const t = await taskRes.json();
      return t.id;
    } else {
      console.warn(
        `[clickup-provision] falha ao criar task '${task.name}': ${await taskRes.text()}`
      );
      return null;
    }
  }
});
