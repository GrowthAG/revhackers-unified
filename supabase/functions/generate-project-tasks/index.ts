// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "npm:@supabase/supabase-js@2"

async function withAutoRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`[Auto-Retry] Falha na rede/OpenAI. Tentativa ${i + 1} de ${retries}. Aguardando ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error("Unreachable");
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

interface GenerateTasksPayload {
  projectId: string;
  sprintId?: string | null;
  createSprints?: boolean;
  overwrite?: boolean;
}

interface GeneratedTask {
  title: string;
  phase_label: string;
  status: 'todo' | 'backlog';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimated_hours: number;
  briefing: {
    context: string;
    deliverable: string;
    why: string;
    how: string;
  };
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function purgeEmDashes(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/\u2014/g, '-');
  if (Array.isArray(value)) return value.map(purgeEmDashes);
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = purgeEmDashes(v);
    }
    return result;
  }
  return value;
}

function sanitizeAnswers(raw: Record<string, unknown>): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return raw;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('_') || key === 'id' || key === 'project_id' || key === 'metadata') continue;
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

/** Converte o briefing gerado pelo GPT em JSON Tiptap compativel com OrqflowEditor */
function buildTiptapContent(briefing: GeneratedTask['briefing']): object {
  const section = (heading: string, body: string) => ([
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: heading }]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: body }]
    }
  ]);

  return {
    type: 'doc',
    content: [
      ...section('Contexto do Cliente', briefing.context),
      ...section('O que Entregar', briefing.deliverable),
      ...section('Por que Importa', briefing.why),
      ...section('Como Fazer', briefing.how),
    ]
  };
}

/** Mapeia duracao do projeto para numero de tarefas a gerar */
function calcTaskCount(projectType: string, duration: string): number {
  const dur = (duration || '').toLowerCase();
  if (projectType === 'consulting' || projectType === 'crm_ops') {
    if (dur.includes('90') || dur.includes('tres') || dur.includes('3 mes')) return 21;
    if (dur.includes('60') || dur.includes('dois') || dur.includes('2 mes')) return 15;
    return 12;
  }
  if (projectType === 'founder') return 12;
  if (projectType === 'dev' || projectType === 'site') return 10;
  return 15;
}

// -------------------------------------------------------------------------
// Main handler
// -------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Acesso Negado: JWT ausente.');

    // @ts-ignore
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Variaveis de ambiente nao configuradas no servidor.');
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Acesso Negado: Token invalido. ' + (authError?.message || ''));

    // --- Payload ---
    const payload: GenerateTasksPayload = await req.json();
    const { projectId, sprintId, createSprints = false, overwrite = false } = payload;

    if (!projectId) throw new Error('projectId e obrigatorio.');

    console.log(`[generate-project-tasks] Iniciando para project: ${projectId}`);

    // --- Guard: evitar duplicacao ---
    if (!overwrite) {
      const existingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/orqflow_tasks?project_id=eq.${projectId}&select=id&limit=1`,
        { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Accept': 'application/json' } }
      );
      if (existingRes.ok) {
        const existing: unknown[] = await existingRes.json();
        if (existing && existing.length > 0) {
          return new Response(
            JSON.stringify({ skipped: true, reason: 'tasks_exist', message: 'Este projeto ja tem tarefas. Envie overwrite: true para forcar a regeneracao.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // --- Fetch: projeto ---
    const projectRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rei_projects?id=eq.${projectId}&select=type,client_name,client_company,trade_name,project_duration,client_email&limit=1`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Accept': 'application/json' } }
    );
    const projects: any[] = projectRes.ok ? await projectRes.json() : [];
    const project = projects[0] || {};
    const projectType = project.type || 'consulting';
    const clientName = project.trade_name || project.client_name || 'Cliente';
    const clientCompany = project.client_company || '';
    const projectDuration = project.project_duration || '90 dias';

    // --- Fetch: REI responses ---
    let cleanResponses: Record<string, unknown> = {};
    let maturityLevel = '';
    const reiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rei_responses?project_id=eq.${projectId}&order=created_at.desc&limit=1&select=responses,maturity_level,total_score`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Accept': 'application/json' } }
    );
    if (reiRes.ok) {
      const reiData: any[] = await reiRes.json();
      if (reiData && reiData.length > 0) {
        cleanResponses = sanitizeAnswers(reiData[0].responses || {});
        maturityLevel = reiData[0].maturity_level || '';
      }
    }

    // --- Fetch: plano estrategico ---
    let roadmapPhases: any[] = [];
    let thesisPillars: any[] = [];
    let quickWins: any[] = [];
    let risks: any[] = [];
    let contextMirror = '';

    const planRes = await fetch(
      `${SUPABASE_URL}/rest/v1/strategic_plans?rei_project_id=eq.${projectId}&order=created_at.desc&limit=1&select=diagnostic_data,roadmap_data,onboarding_data`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Accept': 'application/json' } }
    );
    if (planRes.ok) {
      const plans: any[] = await planRes.json();
      if (plans && plans.length > 0) {
        const diag = plans[0].diagnostic_data || {};
        roadmapPhases = diag.roadmap_phases || diag.phases || [];
        thesisPillars = diag.thesis_pillars || diag.pillars || [];
        quickWins = diag.quick_wins || [];
        risks = diag.risks || [];
        contextMirror = diag.context_mirror || '';
        console.log(`[generate-project-tasks] Plano estrategico carregado: ${roadmapPhases.length} fases encontradas.`);
      } else {
        console.log('[generate-project-tasks] Nenhum plano estrategico encontrado - prosseguindo apenas com REI.');
      }
    }

    // --- Fetch: transcricao da reuniao ---
    let transcriptText = '';
    const recRes = await fetch(
      `${SUPABASE_URL}/rest/v1/meeting_recordings?rei_project_id=eq.${projectId}&transcript_status=eq.completed&order=happened_at.desc&limit=1&select=transcript,ai_insights`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Accept': 'application/json' } }
    );
    if (recRes.ok) {
      const recs: any[] = await recRes.json();
      if (recs && recs.length > 0) {
        const rec = recs[0];
        const parts: string[] = [];
        if (rec.transcript) parts.push(rec.transcript.substring(0, 8000));
        const ai = rec.ai_insights;
        if (ai) {
          if (ai.resumo_executivo) parts.push(`Resumo da reuniao: ${ai.resumo_executivo}`);
          if (ai.kickoff_data?.gargalos_atuais?.length) parts.push(`Gargalos: ${ai.kickoff_data.gargalos_atuais.join(', ')}`);
          if (ai.kickoff_data?.definicao_sucesso) parts.push(`Definicao de sucesso: ${ai.kickoff_data.definicao_sucesso}`);
          if (ai.acoes_proximas?.length) parts.push(`Proximas acoes acordadas: ${ai.acoes_proximas.join('; ')}`);
          if (ai.inteligencia_estrategica?.stack_tecnologica?.length) parts.push(`Stack tecnologica: ${ai.inteligencia_estrategica.stack_tecnologica.join(', ')}`);
          if (ai.inteligencia_estrategica?.desafios_especificos?.length) parts.push(`Desafios especificos: ${ai.inteligencia_estrategica.desafios_especificos.join(', ')}`);
        }
        transcriptText = parts.join('\n');
        console.log(`[generate-project-tasks] Transcricao carregada: ${transcriptText.length} chars.`);
      }
    }

    // --- Construir contexto do roadmap para o prompt ---
    const taskCount = calcTaskCount(projectType, projectDuration);

    const roadmapBlock = roadmapPhases.length > 0
      ? roadmapPhases.map((phase: any, i: number) => {
          const items = (phase.items || phase.deliverables || []).join(', ');
          const title = phase.title || phase.name || `Fase ${i + 1}`;
          return `Fase ${i + 1} - ${title}: ${items}`;
        }).join('\n')
      : 'Roadmap nao disponivel - use as respostas do REI para inferir as fases.';

    const pillarsBlock = thesisPillars.length > 0
      ? thesisPillars.map((p: any) => `- ${p.title || p.name}: ${p.description || ''}`).join('\n')
      : '';

    const quickWinsBlock = quickWins.length > 0
      ? quickWins.slice(0, 5).map((q: any) => `- Dia ${q.day || ''}: ${q.action || q.title || ''} (${q.owner || ''})`).join('\n')
      : '';

    const risksBlock = risks.length > 0
      ? risks.slice(0, 4).map((r: any) => `- [${r.severity || 'medio'}] ${r.text || r.description || ''}`).join('\n')
      : '';

    const isCrmOps = projectType === 'crm_ops';
    const isFounder = projectType === 'founder';
    const isDev = projectType === 'dev' || projectType === 'site';

    const projectTypeLabel =
      isCrmOps ? 'RevOps / CRM / Automacao Comercial' :
      isFounder ? 'Personal Branding / LinkedIn Authority' :
      isDev ? 'Desenvolvimento de Site / Landing Page' :
      'Consultoria 360 / Growth Marketing';

    // --- GPT Prompt ---
    const systemPrompt = `Voce e um Gerente de Projetos Senior especializado em projetos de growth e marketing digital.
Sua unica saida deve ser um JSON valido no formato: { "tasks": [ ...array de tarefas... ] }
NENHUM texto fora do JSON. NENHUM markdown. NENHUM comentario.
NUNCA use o caractere em dash (U+2014). Use apenas hifen simples (-), dois pontos (:) ou ponto final.`;

    const userPrompt = `CLIENTE: ${clientName}${clientCompany ? ` (${clientCompany})` : ''}
TIPO DE PROJETO: ${projectTypeLabel}
DURACAO: ${projectDuration}
MATURIDADE REI: ${maturityLevel}

${contextMirror ? `ESPELHO DE CONTEXTO (diagnostico do cliente):
${contextMirror}

` : ''}RESPOSTAS DO DIAGNOSTICO REI:
${JSON.stringify(cleanResponses, null, 2).substring(0, 4000)}

ROADMAP ESTRATEGICO:
${roadmapBlock}

${pillarsBlock ? `PILARES DA SOLUCAO:
${pillarsBlock}

` : ''}${quickWinsBlock ? `QUICK WINS (primeiras acoes):
${quickWinsBlock}

` : ''}${risksBlock ? `RISCOS CRITICOS IDENTIFICADOS:
${risksBlock}

` : ''}${transcriptText ? `TRANSCRICAO / INTELIGENCIA DA REUNIAO:
${transcriptText.substring(0, 3000)}

` : ''}INSTRUCAO PRINCIPAL (MÉTODO TASK-TO-PROBLEM):
Gere exatamente ${taskCount} tarefas operacionais e altamente especificas para este cliente.
A regra suprema deste projeto é a "Ancoragem no Diagnóstico" (Task-to-Problem Mapping). Nós não prescrevemos tarefas teóricas. Cada tarefa DEVE existir exclusivamente para matar um "Gargalo" ou "Risco" que o cliente relatou nos dados acima.
Distribua as tarefas pelas fases do roadmap.
Tarefas da Fase 1 (primeiros 30 dias): status "todo", prioridade "urgent" ou "high".
Tarefas das Fases 2 e 3: status "backlog", prioridade "high" ou "medium".

SCHEMA OBRIGATORIO para cada tarefa no array:
{
  "title": "Titulo objetivo da tarefa (maximo 80 caracteres)",
  "phase_label": "Fase 1 - [nome]" | "Fase 2 - [nome]" | "Fase 3 - [nome]",
  "status": "todo" | "backlog",
  "priority": "urgent" | "high" | "medium" | "low",
  "estimated_hours": numero inteiro entre 1 e 40,
  "briefing": {
    "context": "Contexto especifico do cliente (Ex: 'O cliente usa RD Station mas não tem CRM integrado, conforme diagnóstico')",
    "deliverable": "O que exatamente deve ser entregue - especifico e mensuravel",
    "why": "QUAL GARGALO/DOR do diagnóstico esta tarefa resolve? Cite o problema narrado pelo cliente explicitamente.",
    "how": "Como executar: passos, ferramentas, referencias (minimo 3 passos práticos)"
  }
}

Retorne: { "tasks": [ ...${taskCount} tarefas... ] }`;

    // --- Chamada OpenAI ---
    console.log(`[generate-project-tasks] Chamando GPT-5.4 para gerar ${taskCount} tarefas...`);
    const openaiRes = await withAutoRetry(() => fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    }));

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI error ${openaiRes.status}: ${errText.substring(0, 200)}`);
    }

    const openaiData = await openaiRes.json();
    const rawContent = openaiData.choices?.[0]?.message?.content || '{}';

    let parsed: { tasks: GeneratedTask[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error('GPT retornou JSON invalido. Tente novamente.');
    }

    const generatedTasks: GeneratedTask[] = parsed.tasks || [];
    if (generatedTasks.length === 0) {
      throw new Error('GPT nao gerou nenhuma tarefa. Verifique o contexto do projeto.');
    }

    console.log(`[generate-project-tasks] GPT gerou ${generatedTasks.length} tarefas.`);

    // --- Criacao de Sprints por Fase (opcional) ---
    const sprintIdByPhaseLabel: Record<string, string> = {};

    if (createSprints && roadmapPhases.length > 0) {
      const today = new Date();
      const totalDays = parseInt(projectDuration) || 90;
      const phaseDays = Math.floor(totalDays / roadmapPhases.length);

      const sprintsToInsert = roadmapPhases.map((phase: any, idx: number) => ({
        project_id: projectId,
        name: phase.title || phase.name || `Fase ${idx + 1}`,
        status: idx === 0 ? 'active' : 'planned',
        start_date: new Date(today.getTime() + idx * phaseDays * 86400000).toISOString(),
        end_date: new Date(today.getTime() + (idx + 1) * phaseDays * 86400000).toISOString(),
      }));

      const { data: createdSprints, error: sprintErr } = await supabaseAdmin
        .from('orqflow_sprints')
        .insert(sprintsToInsert)
        .select('id, name');

      if (!sprintErr && createdSprints) {
        createdSprints.forEach((s: any, idx: number) => {
          sprintIdByPhaseLabel[`Fase ${idx + 1}`] = s.id;
        });
        console.log(`[generate-project-tasks] ${createdSprints.length} ciclos criados.`);
      }
    }

    // --- Montar e inserir tarefas ---
    const tasksToInsert = generatedTasks.map((t: GeneratedTask, idx: number) => {
      // Determinar sprint: por fase criada, ou pelo sprintId manual, ou null
      const phaseKey = (t.phase_label || '').match(/Fase (\d)/)?.[1];
      const resolvedSprintId =
        (phaseKey && sprintIdByPhaseLabel[`Fase ${phaseKey}`]) ||
        sprintId ||
        null;

      const cleanBriefing = {
        context: String(t.briefing?.context || ''),
        deliverable: String(t.briefing?.deliverable || ''),
        why: String(t.briefing?.why || ''),
        how: String(t.briefing?.how || ''),
      };

      return {
        project_id: projectId,
        sprint_id: resolvedSprintId,
        title: String((purgeEmDashes(t.title) as string)).substring(0, 255),
        status: (['todo', 'backlog', 'doing', 'review', 'done'].includes(t.status) ? t.status : 'backlog'),
        priority: (['urgent', 'high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium'),
        position_order: idx * 1000,
        estimated_hours: Number(t.estimated_hours) || null,
        content: purgeEmDashes(buildTiptapContent(cleanBriefing)),
      };
    });

    // Batch insert em lotes de 20
    const BATCH_SIZE = 20;
    let insertedCount = 0;
    for (let i = 0; i < tasksToInsert.length; i += BATCH_SIZE) {
      const batch = tasksToInsert.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await supabaseAdmin.from('orqflow_tasks').insert(batch);
      if (insertErr) throw new Error(`Erro ao inserir tarefas (lote ${i}): ${insertErr.message}`);
      insertedCount += batch.length;
    }

    console.log(`[generate-project-tasks] ${insertedCount} tarefas inseridas com sucesso.`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        sprints_created: Object.keys(sprintIdByPhaseLabel).length,
        project_type: projectType,
        client: clientName,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[generate-project-tasks] Error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
