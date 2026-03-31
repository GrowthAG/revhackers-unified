import { supabase } from "@/integrations/supabase/client";

/**
 * Success Plan API
 *
 * Gerencia success plans (strategic_plans com plan_type='success_plan').
 * O success plan e criado automaticamente pela RPC convert_opportunity_to_project
 * e carrega toda a inteligencia pre-venda para o pos-venda.
 *
 * Lifecycle:
 *   1. Criado automaticamente no handoff (opportunity -> project)
 *   2. AI gera success_criteria e risk_mitigation via edge function
 *   3. CSM revisa e ajusta
 *   4. Cliente visualiza na apresentacao
 *   5. Acompanhamento via health score e milestones
 */

export interface SuccessPlan {
    id: string;
    rei_project_id: string | null;
    client_id: string | null;
    opportunity_id: string | null;
    plan_type: string;
    status: string | null;
    diagnostic_data: any;
    success_criteria_data: any;
    risk_mitigation_data: any;
    collaboration_metadata: any;
    created_at: string | null;
    updated_at: string | null;
}

export interface SuccessCriteria {
    status: string;
    required_outcome: string | null;
    appropriate_experience: string | null;
    success_milestones: SuccessMilestone[];
    ttfv_target_days: number;
    health_dimensions: {
        adoption: number;
        engagement: number;
        growth: number;
        sentiment: number;
    };
}

export interface SuccessMilestone {
    name: string;
    target_date: string;
    metric: string;
    threshold: number;
    completed?: boolean;
    completed_at?: string;
}

/**
 * Busca o success plan vinculado a um projeto
 */
export async function getSuccessPlanByProject(projectId: string): Promise<SuccessPlan | null> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('rei_project_id', projectId)
        .eq('plan_type', 'success_plan')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[successPlan] Erro ao buscar por projeto:', error);
        return null;
    }

    return data as SuccessPlan | null;
}

/**
 * Busca o success plan vinculado a uma opportunity
 */
export async function getSuccessPlanByOpportunity(opportunityId: string): Promise<SuccessPlan | null> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .eq('plan_type', 'success_plan')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[successPlan] Erro ao buscar por opportunity:', error);
        return null;
    }

    return data as SuccessPlan | null;
}

/**
 * Atualiza os criterios de sucesso (apos geracao por AI ou edicao manual)
 */
export async function updateSuccessCriteria(
    planId: string,
    criteria: Partial<SuccessCriteria>
): Promise<boolean> {
    const { data: current } = await supabase
        .from('strategic_plans')
        .select('success_criteria_data')
        .eq('id', planId)
        .single();

    const merged = {
        ...(current?.success_criteria_data as any || {}),
        ...criteria,
        status: 'generated',
    };

    const { error } = await supabase
        .from('strategic_plans')
        .update({
            success_criteria_data: merged,
            updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

    if (error) {
        console.error('[successPlan] Erro ao atualizar criteria:', error);
        return false;
    }

    return true;
}

/**
 * Atualiza dados de mitigacao de risco
 */
export async function updateRiskMitigation(
    planId: string,
    riskData: any
): Promise<boolean> {
    const { data: current } = await supabase
        .from('strategic_plans')
        .select('risk_mitigation_data')
        .eq('id', planId)
        .single();

    const merged = {
        ...(current?.risk_mitigation_data as any || {}),
        ...riskData,
        status: 'generated',
    };

    const { error } = await supabase
        .from('strategic_plans')
        .update({
            risk_mitigation_data: merged,
            updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

    if (error) {
        console.error('[successPlan] Erro ao atualizar risks:', error);
        return false;
    }

    return true;
}

/**
 * Marca um milestone como concluido
 */
export async function completeMilestone(
    planId: string,
    milestoneIndex: number
): Promise<boolean> {
    const { data } = await supabase
        .from('strategic_plans')
        .select('success_criteria_data')
        .eq('id', planId)
        .single();

    if (!data) return false;

    const criteria = data.success_criteria_data as any || {};
    const milestones = criteria.success_milestones || [];

    if (milestoneIndex >= 0 && milestoneIndex < milestones.length) {
        milestones[milestoneIndex] = {
            ...milestones[milestoneIndex],
            completed: true,
            completed_at: new Date().toISOString(),
        };
    }

    const { error } = await supabase
        .from('strategic_plans')
        .update({
            success_criteria_data: { ...criteria, success_milestones: milestones },
            updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

    if (error) {
        console.error('[successPlan] Erro ao completar milestone:', error);
        return false;
    }

    return true;
}

/**
 * Registra uma review no collaboration_metadata
 */
export async function addReview(
    planId: string,
    reviewer: string,
    status: 'approved' | 'needs_changes' | 'commented',
    notes: string
): Promise<boolean> {
    const { data } = await supabase
        .from('strategic_plans')
        .select('collaboration_metadata')
        .eq('id', planId)
        .single();

    if (!data) return false;

    const meta = data.collaboration_metadata as any || {};
    const reviews = meta.reviews || [];

    reviews.push({
        reviewer,
        reviewed_at: new Date().toISOString(),
        status,
        notes,
    });

    const updatedMeta = {
        ...meta,
        reviews,
        version: (meta.version || 1) + 1,
        handoff_status: status === 'approved' ? 'completed' : meta.handoff_status,
    };

    const { error } = await supabase
        .from('strategic_plans')
        .update({
            collaboration_metadata: updatedMeta,
            status: status === 'approved' ? 'approved' : 'review',
            updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

    if (error) {
        console.error('[successPlan] Erro ao adicionar review:', error);
        return false;
    }

    return true;
}

/**
 * Calcula health score baseado nas dimensoes
 * Retorna 0-100
 */
export function calculateHealthScore(dimensions: {
    adoption: number;
    engagement: number;
    growth: number;
    sentiment: number;
}): number {
    const weights = {
        adoption: 0.30,
        engagement: 0.25,
        growth: 0.25,
        sentiment: 0.20,
    };

    return Math.round(
        (dimensions.adoption * weights.adoption) +
        (dimensions.engagement * weights.engagement) +
        (dimensions.growth * weights.growth) +
        (dimensions.sentiment * weights.sentiment)
    );
}

/**
 * Determina o Success Vector (direcional, nao snapshot)
 * Baseado em Lincoln Murphy: o cliente esta se movendo na direcao certa?
 */
export function getSuccessVector(
    currentHealth: number,
    previousHealth: number,
    milestonesCompleted: number,
    totalMilestones: number
): 'accelerating' | 'on_track' | 'stalling' | 'at_risk' | 'critical' {
    const delta = currentHealth - previousHealth;
    const milestoneRate = totalMilestones > 0 ? milestonesCompleted / totalMilestones : 0;

    if (currentHealth >= 80 && delta >= 0) return 'accelerating';
    if (currentHealth >= 60 && delta >= -5) return 'on_track';
    if (currentHealth >= 40 || (delta >= -10 && milestoneRate > 0.3)) return 'stalling';
    if (currentHealth >= 20) return 'at_risk';
    return 'critical';
}
