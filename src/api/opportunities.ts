import { supabase } from "@/integrations/supabase/client";
import {
  Opportunity,
  OpportunityStage,
  LeadSource,
  OpportunityData,
  isValidOpportunityTransition,
} from "@/types/pipeline";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateOpportunityInput {
  client_name: string;
  client_email?: string;
  client_company?: string;
  client_site?: string;
  client_logo?: string;
  trade_name?: string;
  type?: string;
  lead_source?: LeadSource;
  source?: string;
  pipeline_stage?: OpportunityStage;
  diagnostico_id?: string;
  opportunity_data?: Partial<OpportunityData>;
  enrichment_data?: any;
  meeting_recording_id?: string;
  analyst_email?: string;
  organization_id?: string;
  client_id?: string;
}

export interface OpportunityRow extends Opportunity {
  // Derived/joined fields for UI
  display_name: string;
  days_in_stage: number;
  diagnostico_score?: number | null;
  diagnostico_tipo?: string | null;
  proposal_count?: number;
}

// ============================================================================
// CREATE
// ============================================================================

export async function createOpportunity(
  input: CreateOpportunityInput
): Promise<{ opportunity: Opportunity | null; error?: string }> {
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      client_name: input.client_name,
      client_email: input.client_email || null,
      client_company: input.client_company || null,
      client_site: input.client_site || null,
      client_logo: input.client_logo || null,
      trade_name: input.trade_name || null,
      type: input.type || 'consulting',
      lead_source: input.lead_source || 'manual',
      source: input.source || null,
      pipeline_stage: input.pipeline_stage || 'lead_inbound',
      diagnostico_id: input.diagnostico_id || null,
      opportunity_data: (input.opportunity_data || {}) as any,
      enrichment_data: input.enrichment_data || null,
      meeting_recording_id: input.meeting_recording_id || null,
      analyst_email: input.analyst_email || 'giulliano@revhackers.com',
      organization_id: input.organization_id || null,
      client_id: input.client_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Opportunities] Create error:', error.message);
    return { opportunity: null, error: error.message };
  }

  // Insert initial stage history
  await insertOpportunityStageHistory({
    opportunityId: (data as any).id,
    fromStage: null,
    toStage: input.pipeline_stage || 'lead_inbound',
    notes: `Oportunidade criada - fonte: ${input.lead_source || 'manual'}`,
  });

  return { opportunity: data as unknown as Opportunity };
}

// ============================================================================
// READ
// ============================================================================

export async function getAllOpportunities(): Promise<OpportunityRow[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      diagnosticos ( score, tipo )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Opportunities] Fetch error:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    display_name: row.trade_name || row.client_company || row.client_name,
    days_in_stage: daysSince(row.updated_at),
    diagnostico_score: row.diagnosticos?.score || null,
    diagnostico_tipo: row.diagnosticos?.tipo || null,
    opportunity_data: row.opportunity_data || {},
    diagnosticos: undefined, // clean join
  }));
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Opportunities] Fetch by ID error:', error.message);
    return null;
  }

  return data as unknown as Opportunity;
}

export async function getOpportunitiesByStage(stage: OpportunityStage): Promise<OpportunityRow[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      diagnosticos ( score, tipo )
    `)
    .eq('pipeline_stage', stage)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Opportunities] Fetch by stage error:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    display_name: row.trade_name || row.client_company || row.client_name,
    days_in_stage: daysSince(row.updated_at),
    diagnostico_score: row.diagnosticos?.score || null,
    diagnostico_tipo: row.diagnosticos?.tipo || null,
    diagnosticos: undefined,
  }));
}

// ============================================================================
// UPDATE
// ============================================================================

export async function updateOpportunity(
  id: string,
  updates: Partial<Opportunity>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('opportunities')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id);

  if (error) {
    console.error('[Opportunities] Update error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// ADVANCE STAGE
// ============================================================================

export async function advanceOpportunityStage(
  opportunityId: string,
  newStage: OpportunityStage,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Fetch current stage
  const { data: opp, error: fetchErr } = await supabase
    .from('opportunities')
    .select('id, pipeline_stage')
    .eq('id', opportunityId)
    .single();

  if (fetchErr || !opp) {
    return { success: false, error: fetchErr?.message || 'Oportunidade nao encontrada' };
  }

  const currentStage = (opp as any).pipeline_stage as OpportunityStage | null;

  // 2. Validate transition
  // if (currentStage && !isValidOpportunityTransition(currentStage, newStage)) {
  //   return {
  //     success: false,
  //     error: `Transicao invalida: ${currentStage} -> ${newStage}`,
  //   };
  // }

  // 3. Build update payload
  const updatePayload: any = {
    pipeline_stage: newStage,
    updated_at: new Date().toISOString(),
  };

  if (newStage === 'won') {
    updatePayload.won_at = new Date().toISOString();
  }

  if (newStage === 'lost') {
    updatePayload.lost_at = new Date().toISOString();
  }

  // 4. Update
  const { error: updateErr } = await supabase
    .from('opportunities')
    .update(updatePayload)
    .eq('id', opportunityId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 5. Record history
  await insertOpportunityStageHistory({
    opportunityId,
    fromStage: currentStage,
    toStage: newStage,
    notes: notes || undefined,
  });

  return { success: true };
}

// ============================================================================
// CONVERT TO PROJECT (calls Supabase RPC for atomicity)
// ============================================================================

export async function convertOpportunityToProject(
  opportunityId: string,
  analystEmail?: string
): Promise<{ projectId: string | null; error?: string }> {
  const { data, error } = await supabase
    .rpc('convert_opportunity_to_project', {
      p_opportunity_id: opportunityId,
      p_analyst_email: analystEmail || 'giulliano@revhackers.com',
    });

  if (error) {
    console.error('[Opportunities] Convert to project error:', error.message);
    return { projectId: null, error: error.message };
  }

  const projectId = data as string;

  // 1. Handover Automático (Horizonte 1) - Injetar o contexto de vendas na operação
  if (projectId) {
    try {
      const { data: opp } = await supabase
        .from('opportunities')
        .select('opportunity_data')
        .eq('id', opportunityId)
        .single();
        
      if (opp && opp.opportunity_data) {
        const oppData = opp.opportunity_data as any;
        
        // Extrai as dores (Bleeding Cost) e objeçoes que basearam o fechamento
        const bleedingCost = oppData.dor_principal || oppData.pitch_summary || "Oportunidade convertida. Verificar notas de vendas.";
        const objecoes = oppData.objecoes_detectadas?.length > 0 ? oppData.objecoes_detectadas.join(', ') : 'Nenhuma objeção mapeada na inteligência de vendas';
        const setupFee = oppData.contract_data?.setup_fee ? `Setup: R$ ${oppData.contract_data.setup_fee}` : '';
        const retainerFee = oppData.contract_data?.retainer_fee ? `MRR: R$ ${oppData.contract_data.retainer_fee}` : '';
        
        // Cria a Task Urgent (The Handover Briefing) no quadro do time de Execução
        await supabase.from('orqflow_tasks').insert({
          project_id: projectId,
          title: '[HANDOVER] Revisar Bleeding Cost & Alinhamento',
          description: `**BLEEDING COST (Por que o cliente comprou):**\n${bleedingCost}\n\n**Condições Comercias:**\n${setupFee} | ${retainerFee}\n\n**Objeções Superadas:**\n${objecoes}\n\n_Handover Bridge automático do Revenue Cockpit._`,
          status: 'todo',
          priority: 'urgent',
          assignee_email: analystEmail || 'giulliano@revhackers.com',
        });
        console.log('[Opportunities] Handover Bridge executado com sucesso para o Projeto:', projectId);
      }
    } catch (handoverErr) {
      console.warn('[Opportunities] Falha no Handover Bridge (não critico):', handoverErr);
    }
  }

  // 2. Auto-trigger: gerar success plan via AI (nao bloqueia o fluxo principal)
  if (projectId) {
    supabase.functions.invoke('generate-success-plan', {
      body: { project_id: projectId },
    }).then((res) => {
      if (res.error) {
        console.warn('[Opportunities] generate-success-plan falhou (nao critico):', res.error.message);
      } else {
        console.log('[Opportunities] Success plan gerado automaticamente para projeto', projectId);
      }
    }).catch((err) => {
      console.warn('[Opportunities] generate-success-plan error (nao critico):', err?.message);
    });
  }

  return { projectId };
}

// ============================================================================
// LINK DIAGNOSTIC TO OPPORTUNITY
// ============================================================================

export async function linkDiagnosticToOpportunity(params: {
  diagnosticoId: string;
  diagnosticType: string;
  score: number;
  leadName: string;
  leadEmail: string;
  leadCompany: string;
}): Promise<{ opportunityId: string | null; error?: string }> {
  const { diagnosticoId, diagnosticType, score, leadName, leadEmail, leadCompany } = params;

  const DIAG_TYPE_TO_SOURCE: Record<string, LeadSource> = {
    growth: 'diagnostico_growth',
    revenue: 'diagnostico_revenue',
    founder: 'diagnostico_founder',
    site: 'diagnostico_site',
  };

  const leadSource = DIAG_TYPE_TO_SOURCE[diagnosticType] || 'diagnostico_growth';

  // Check if opportunity already exists for this email
  const { data: existing } = await supabase
    .from('opportunities')
    .select('id')
    .eq('client_email', leadEmail)
    .in('pipeline_stage', ['lead_inbound', 'lead_qualified'])
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Update existing opportunity with diagnostic data
    await supabase
      .from('opportunities')
      .update({
        diagnostico_id: diagnosticoId,
        pipeline_stage: 'diagnostic_done',
        updated_at: new Date().toISOString(),
      })
      .eq('id', (existing as any).id);

    await insertOpportunityStageHistory({
      opportunityId: (existing as any).id,
      fromStage: 'lead_inbound',
      toStage: 'diagnostic_done',
      notes: `Diagnostico ${diagnosticType} vinculado - score ${score}`,
    });

    return { opportunityId: (existing as any).id };
  }

  // Create new opportunity
  const result = await createOpportunity({
    client_name: leadName || leadCompany,
    client_email: leadEmail,
    client_company: leadCompany,
    type: diagnosticType === 'founder' ? 'founder' : 'consulting',
    lead_source: leadSource,
    pipeline_stage: 'diagnostic_done',
    diagnostico_id: diagnosticoId,
  });

  return { opportunityId: result.opportunity?.id || null, error: result.error };
}

// ============================================================================
// STAGE HISTORY
// ============================================================================

export async function insertOpportunityStageHistory(params: {
  opportunityId: string;
  fromStage: OpportunityStage | null;
  toStage: OpportunityStage;
  notes?: string;
  changedBy?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('opportunity_stage_history')
    .insert({
      opportunity_id: params.opportunityId,
      from_stage: params.fromStage || null,
      to_stage: params.toStage,
      changed_at: new Date().toISOString(),
      changed_by: params.changedBy || null,
      notes: params.notes || null,
    });

  if (error) {
    console.error('[Opportunities] Failed to insert stage history:', error.message);
  }
}

export async function getOpportunityStageHistory(opportunityId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('opportunity_stage_history')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('changed_at', { ascending: true });

  if (error) {
    console.error('[Opportunities] Fetch history error:', error.message);
    return [];
  }

  return data || [];
}

// ============================================================================
// FUNNEL METRICS
// ============================================================================

export async function getOpportunityFunnelMetrics(): Promise<{
  stage_counts: Record<string, number>;
  total_pipeline_value: number;
}> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, pipeline_stage, opportunity_data');

  if (error) {
    console.error('[Opportunities] Funnel metrics error:', error.message);
    return { stage_counts: {}, total_pipeline_value: 0 };
  }

  const counts: Record<string, number> = {};
  let pipelineValue = 0;

  for (const row of data || []) {
    const stage = (row as any).pipeline_stage;
    counts[stage] = (counts[stage] || 0) + 1;

    const oppData = (row as any).opportunity_data as OpportunityData | null;
    if (oppData?.investimento_estimado) {
      const avg = (oppData.investimento_estimado.range_min + oppData.investimento_estimado.range_max) / 2;
      if (avg > 0 && stage !== 'lost') {
        pipelineValue += avg;
      }
    }
  }

  return { stage_counts: counts, total_pipeline_value: pipelineValue };
}

// ============================================================================
// HELPERS
// ============================================================================

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
