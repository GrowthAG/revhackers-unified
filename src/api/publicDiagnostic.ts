import { supabase } from "@/integrations/supabase/client";
import { sendToGHL, GHLEventType } from "@/lib/ghlRelay";

export interface DiagnosticLead {
    name: string;
    email: string;
    company: string;
}

/**
 * submitPublicDiagnostic
 *
 * Fluxo correto (v2 - sem poluir rei_projects):
 *   1. Cria registro em `diagnosticos` (tabela de assessments)
 *   2. Cria `opportunity` vinculada ao diagnostico (pipeline pre-venda)
 *   3. Registra historico de stage
 *   4. Dispara relay para GHL
 *
 * A pagina de resultado le de `diagnosticos` via ID retornado.
 */
export const submitPublicDiagnostic = async (
    lead: DiagnosticLead & { phone?: string, role?: string, linkedin?: string },
    answers: Record<string, any>,
    score: number,
    maturity: { level: string; description: string; action: string; color: string; title?: string },
    ghlEventType?: GHLEventType
) => {
    const diagnosticType = answers.diagnostic_type || 'growth';

    // Build full response payload
    const fullResponses = {
        ...answers,
        lead_details: {
            phone: lead.phone,
            role: lead.role,
            linkedin: lead.linkedin,
        },
        result_details: maturity,
        diagnostic_type: diagnosticType,
    };

    // Mapeamento correto dos protocolos REI oficiais
    type OfficialREIType = 'consulting' | 'crm_ops' | 'founder' | 'site';
    const diagToProjectMap: Record<string, OfficialREIType> = {
        growth: 'consulting',
        revenue: 'crm_ops',
        founder: 'founder',
        site: 'site',
    };
    const officialProjectType = diagToProjectMap[diagnosticType] || 'consulting';

    // 1. Criar registro em `diagnosticos` (entidade correta para assessments)
    const { data: diagData, error: diagError } = await supabase
        .from('diagnosticos')
        .insert({
            email: lead.email || 'sem-email@lead.local',
            tipo: diagnosticType,
            score,
            respostas: {
                ...fullResponses,
                lead_name: lead.name,
                lead_company: lead.company,
                maturity_level: maturity.title || maturity.level,
            },
        })
        .select('id')
        .single();

    if (diagError) {
        console.error('[publicDiagnostic] Erro ao criar diagnostico:', diagError);
        throw diagError;
    }

    const diagnosticoId = (diagData as any).id;

    // 2. Criar opportunity vinculada (pipeline pre-venda)
    const DIAG_TYPE_TO_SOURCE: Record<string, string> = {
        growth: 'diagnostico_growth',
        revenue: 'diagnostico_revenue',
        founder: 'diagnostico_founder',
        site: 'diagnostico_site',
    };
    const leadSource = DIAG_TYPE_TO_SOURCE[diagnosticType] || 'diagnostico_growth';

    // Check se ja existe opportunity para este email
    let opportunityId: string | null = null;

    if (lead.email && lead.email !== 'sem-email@lead.local') {
        const { data: existing } = await supabase
            .from('opportunities')
            .select('id')
            .eq('client_email', lead.email.toLowerCase())
            .not('pipeline_stage', 'eq', 'lost')
            .limit(1)
            .maybeSingle();

        if (existing) {
            // Atualizar opportunity existente com o novo diagnostico
            opportunityId = (existing as any).id;
            await supabase
                .from('opportunities')
                .update({
                    diagnostico_id: diagnosticoId,
                    pipeline_stage: 'diagnostic_done',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', opportunityId);

            // Historico
            await supabase.from('opportunity_stage_history').insert({
                opportunity_id: opportunityId,
                from_stage: null,
                to_stage: 'diagnostic_done',
                changed_at: new Date().toISOString(),
                changed_by: 'public_diagnostic',
                notes: `Diagnostico ${diagnosticType} vinculado - score ${score}`,
            });
        }
    }

    if (!opportunityId) {
        // Criar nova opportunity com a tipagem oficial e o intelligence data (handoff)
        const { data: oppData, error: oppError } = await supabase
            .from('opportunities')
            .insert({
                client_name: lead.name || lead.company || 'Novo Lead B2B',
                client_email: lead.email?.toLowerCase() || null,
                client_company: lead.company || null,
                type: officialProjectType,
                lead_source: leadSource,
                pipeline_stage: 'diagnostic_done',
                diagnostico_id: diagnosticoId,
                analyst_email: 'giulliano@revhackers.com.br',
                opportunity_data: fullResponses // Injeção inteligente para pre-fill automático futuro
            })
            .select('id')
            .single();

        if (oppError) {
            console.error('[publicDiagnostic] Erro ao criar opportunity:', oppError);
            // Nao throw - diagnostico ja foi salvo, opportunity e secundaria
        } else {
            opportunityId = (oppData as any).id;

            // Historico inicial
            await supabase.from('opportunity_stage_history').insert({
                opportunity_id: opportunityId,
                from_stage: null,
                to_stage: 'diagnostic_done',
                changed_at: new Date().toISOString(),
                changed_by: 'public_diagnostic',
                notes: `Opportunity criada via diagnostico publico ${diagnosticType} - score ${score}`,
            });
        }
    }

    // 3. GHL relay
    const resultUrl = `${window.location.origin}/diagnostico/resultado/${diagnosticoId}`;

    if (ghlEventType) {
        await sendToGHL(ghlEventType, {
            ...lead,
            score,
            maturity: maturity.level,
            maturity_title: maturity.title,
            diagnostic_type: diagnosticType,
            result_url: resultUrl,
            timestamp: new Date().toISOString(),
        });
    }

    // Retorna diagnostico_id como ID do resultado (a pagina de resultado le de diagnosticos)
    return { response: { id: diagnosticoId }, resultUrl };
};
