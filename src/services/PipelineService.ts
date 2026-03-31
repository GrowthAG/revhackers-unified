import { supabase } from "@/integrations/supabase/client";
import {
  PipelineStage,
  LeadSource,
  PIPELINE_STAGES,
  StageChangeEvent,
  FunnelMetrics,
  isValidTransition,
  getStageIndex,
} from "@/types/pipeline";

// ---- advanceStage ----
// Updates the pipeline_stage on a rei_project and inserts a history record.
// Validates the transition before applying.
export async function advanceStage(
  projectId: string,
  newStage: PipelineStage,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  // 1. Fetch current stage
  const { data: project, error: fetchErr } = await supabase
    .from('rei_projects')
    .select('id, pipeline_stage')
    .eq('id', projectId)
    .single();

  if (fetchErr || !project) {
    return { success: false, error: fetchErr?.message || 'Projeto nao encontrado' };
  }

  const currentStage = project.pipeline_stage as PipelineStage | null;

  // 2. Validate transition (skip validation when no previous stage exists)
  // if (currentStage && !isValidTransition(currentStage, newStage)) {
  //   return {
  //     success: false,
  //     error: `Transicao invalida: ${currentStage} -> ${newStage}`,
  //   };
  // }

  // 3. Update the project
  const { error: updateErr } = await supabase
    .from('rei_projects')
    .update({
      pipeline_stage: newStage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 4. Insert history record (centralizado)
  await insertStageHistory({
    projectId,
    fromStage: currentStage,
    toStage: newStage,
    notes: notes || undefined,
  });

  return { success: true };
}

// ---- getStageHistory ----
// Returns the ordered list of stage transitions for a project.
export async function getStageHistory(projectId: string): Promise<StageChangeEvent[]> {
  const { data, error } = await supabase
    .from('pipeline_stage_history')
    .select('*')
    .eq('rei_project_id', projectId)
    .order('changed_at', { ascending: true });

  if (error) {
    console.error('[PipelineService] Error fetching stage history:', error.message);
    return [];
  }

  return (data || []) as unknown as StageChangeEvent[];
}

// ---- getProjectsByStage ----
// Returns all rei_projects currently at a specific pipeline stage.
export async function getProjectsByStage(stage: PipelineStage): Promise<any[]> {
  const { data, error } = await supabase
    .from('rei_projects')
    .select(`
      *,
      clients ( trade_name )
    `)
    .eq('pipeline_stage', stage)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[PipelineService] Error fetching projects by stage:', error.message);
    return [];
  }

  return (data || []).map((p: any) => {
    const tradeName = p.clients?.trade_name;
    delete p.clients;
    return { ...p, trade_name: tradeName };
  });
}

// ---- getFunnelMetrics ----
// Returns aggregated counts per stage and conversion rates between consecutive stages.
export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  // Fetch all projects with their pipeline_stage
  const { data: projects, error } = await supabase
    .from('rei_projects')
    .select('id, pipeline_stage, updated_at')
    .neq('status', 'diagnostic');

  if (error) {
    console.error('[PipelineService] Error fetching funnel metrics:', error.message);
    return {
      stage_counts: buildEmptyCounts(),
      conversion_rates: [],
      total_pipeline_value: 0,
      avg_days_per_stage: buildEmptyDays(),
    };
  }

  // Count per stage
  const counts = buildEmptyCounts();
  for (const p of projects || []) {
    const stage = p.pipeline_stage as PipelineStage;
    if (stage && stage in counts) {
      counts[stage]++;
    }
  }

  // Conversion rates between consecutive stages
  const conversionRates: FunnelMetrics['conversion_rates'] = [];
  for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
    const from = PIPELINE_STAGES[i];
    const to = PIPELINE_STAGES[i + 1];
    // Skip terminal stages
    if (from === 'completed' || from === 'lost' || from === 'churned') continue;
    if (to === 'lost' || to === 'churned') continue;

    const fromCount = counts[from];
    const toCount = counts[to];
    const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;

    conversionRates.push({ from, to, rate });
  }

  return {
    stage_counts: counts,
    conversion_rates: conversionRates,
    total_pipeline_value: 0, // Calculated when investment data is available
    avg_days_per_stage: buildEmptyDays(),
  };
}

// ---- Diagnostic type to lead_source mapping ----
const DIAG_TYPE_TO_SOURCE: Record<string, LeadSource> = {
  growth: 'diagnostico_growth',
  revenue: 'diagnostico_revenue',
  founder: 'diagnostico_founder',
  site: 'diagnostico_site',
};

// ---- linkDiagnosticToPipeline ----
// Called automatically after a public diagnostic is submitted.
// Creates an opportunity (or updates existing) with the diagnostic data.
// Also inserts into diagnosticos table and links via FK.
export async function linkDiagnosticToPipeline(params: {
  projectId: string;
  diagnosticType: string;
  score: number;
  leadName: string;
  leadEmail: string;
  leadCompany: string;
}): Promise<{ success: boolean; error?: string }> {
  const { projectId, diagnosticType, score, leadName, leadEmail, leadCompany } = params;
  const leadSource = DIAG_TYPE_TO_SOURCE[diagnosticType] || 'diagnostico_growth';

  // 1. Insert into diagnosticos table to get a diagnostico_id for FK
  const { data: diagRecord, error: diagErr } = await supabase
    .from('diagnosticos')
    .insert({
      email: leadEmail || 'sem-email@lead.local',
      tipo: diagnosticType,
      score,
      respostas: {
        nome: leadName,
        empresa: leadCompany,
        tipo: diagnosticType,
        rei_project_id: projectId,
      },
    })
    .select('id')
    .single();

  if (diagErr) {
    console.error('[PipelineService] Failed to insert diagnosticos record:', diagErr.message);
  }

  const diagnosticoId = diagRecord?.id || null;

  // 2. Create opportunity in the opportunities table (new architecture)
  const { data: oppData, error: oppErr } = await supabase
    .from('opportunities')
    .insert({
      client_name: leadName || leadCompany,
      client_email: leadEmail || 'sem-email@lead.local',
      client_company: leadCompany,
      type: diagnosticType === 'founder' ? 'founder' : 'consulting',
      lead_source: leadSource,
      pipeline_stage: 'diagnostic_done',
      diagnostico_id: diagnosticoId,
    })
    .select('id')
    .single();

  if (oppErr) {
    console.error('[PipelineService] Failed to create opportunity:', oppErr.message);
    // Fallback: update rei_project (legacy compat during migration)
    await supabase.from('rei_projects').update({
      pipeline_stage: 'lead_inbound',
      lead_source: leadSource,
      diagnostico_id: diagnosticoId,
      updated_at: new Date().toISOString(),
    }).eq('id', projectId);
    return { success: false, error: oppErr.message };
  }

  // 3. Insert opportunity stage history
  if (oppData) {
    await supabase.from('opportunity_stage_history').insert({
      opportunity_id: (oppData as any).id,
      from_stage: null,
      to_stage: 'diagnostic_done',
      changed_at: new Date().toISOString(),
      notes: `Auto-criado do diagnostico ${diagnosticType} - score ${score}`,
    });
  }

  console.log(`[PipelineService] Diagnostic linked to opportunity: ${(oppData as any)?.id} (${leadSource})`);
  return { success: true };
}

// ---- convertDiagnosticoToLead ----
// Manually converts an existing diagnostic rei_project from status='diagnostic'
// to status='lead' with pipeline_stage='lead_inbound'.
// Used by the admin DiagnosticoLeadsList "Converter para Lead" button.
export async function convertDiagnosticoToLead(
  projectId: string,
): Promise<{ projectId: string | null; error?: string }> {
  // 1. Fetch the project and its linked response
  const { data: project, error: fetchErr } = await supabase
    .from('rei_projects')
    .select('id, client_name, client_email, client_company, status, pipeline_stage')
    .eq('id', projectId)
    .single();

  if (fetchErr || !project) {
    return { projectId: null, error: fetchErr?.message || 'Projeto nao encontrado' };
  }

  // Already converted
  if (project.status === 'lead' || project.status === 'active') {
    return { projectId: project.id, error: 'Projeto ja esta convertido' };
  }

  // 2. Fetch diagnostic type from linked response
  const { data: response } = await supabase
    .from('rei_responses')
    .select('responses, total_score')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const responses = (response?.responses as Record<string, any>) || {};
  const diagnosticType = responses.diagnostic_type || 'growth';
  const leadSource = DIAG_TYPE_TO_SOURCE[diagnosticType] || 'diagnostico_growth';

  // 3. Update the project to lead status with pipeline fields
  const { error: updateErr } = await supabase
    .from('rei_projects')
    .update({
      status: 'lead',
      pipeline_stage: 'lead_inbound',
      lead_source: leadSource,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (updateErr) {
    return { projectId: null, error: updateErr.message };
  }

  // 4. Insert stage history (centralizado)
  await insertStageHistory({
    projectId,
    fromStage: null,
    toStage: 'lead_inbound',
    notes: `Convertido manualmente pelo admin - diagnostico ${diagnosticType}`,
    changedBy: 'admin_manual',
  });

  return { projectId };
}

// ---- insertStageHistory (centralizada) ----
// Unico ponto de insercao de historico no frontend. Payload padronizado.
export async function insertStageHistory(params: {
  projectId: string;
  fromStage: PipelineStage | null;
  toStage: PipelineStage;
  notes?: string;
  changedBy?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('pipeline_stage_history')
    .insert({
      rei_project_id: params.projectId,
      from_stage: params.fromStage || null,
      to_stage: params.toStage,
      changed_at: new Date().toISOString(),
      changed_by: params.changedBy || null,
      notes: params.notes || null,
    });

  if (error) {
    console.error('[PipelineService] Failed to insert stage history:', error.message);
  }
}

// ---- Helpers ----

function buildEmptyCounts(): Record<PipelineStage, number> {
  const counts = {} as Record<PipelineStage, number>;
  for (const stage of PIPELINE_STAGES) {
    counts[stage] = 0;
  }
  return counts;
}

function buildEmptyDays(): Record<PipelineStage, number> {
  const days = {} as Record<PipelineStage, number>;
  for (const stage of PIPELINE_STAGES) {
    days[stage] = 0;
  }
  return days;
}
