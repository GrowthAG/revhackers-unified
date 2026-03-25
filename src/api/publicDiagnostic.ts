import { supabase } from "@/integrations/supabase/client";
import { ReiResponseInsert } from "./reiResponses";
import { sendToGHL, GHLEventType } from "@/lib/ghlRelay";
import { linkDiagnosticToPipeline } from "@/services/PipelineService";

export interface DiagnosticLead {
    name: string;
    email: string;
    company: string;
}

export const submitPublicDiagnostic = async (
    lead: DiagnosticLead & { phone?: string, role?: string, linkedin?: string },
    answers: Record<string, any>,
    score: number,
    maturity: { level: string; description: string; action: string; color: string; title?: string },
    ghlEventType?: GHLEventType
) => {
    // USE RPC to bypass RLS issues securely (SECURITY DEFINER)
    const fullResponses = {
        ...answers,
        lead_details: {
            phone: lead.phone,
            role: lead.role,
            linkedin: lead.linkedin
        },
        result_details: maturity,
        diagnostic_type: answers.diagnostic_type || 'Diagnostic'
    };

    const { data, error } = await supabase.rpc('create_diagnostic_entry', {
        p_lead_name: lead.name,
        p_lead_email: lead.email,
        p_lead_company: lead.company,
        p_responses: fullResponses,
        p_score: score,
        p_maturity_level: maturity.title || maturity.level
    });

    if (error) {
        console.error('Error submitting diagnostic via RPC:', error);
        throw error;
    }

    // Cast data to expected type
    const { project_id, response_id } = data as { project_id: string, response_id: string };

    // 2. Link the diagnostic project to the pipeline (non-blocking)
    const diagnosticType = answers.diagnostic_type || 'growth';
    linkDiagnosticToPipeline({
        projectId: project_id,
        diagnosticType,
        score,
        leadName: lead.name,
        leadEmail: lead.email,
        leadCompany: lead.company,
    }).catch((err) => {
        console.error('[publicDiagnostic] Pipeline link failed (non-blocking):', err);
    });

    // 3. Trigger GHL relay
    const resultUrl = `${window.location.origin}/diagnostico/resultado/${response_id}`;

    if (ghlEventType) {
        await sendToGHL(ghlEventType, {
            ...lead,
            score,
            maturity: maturity.level,
            maturity_title: maturity.title,
            diagnostic_type: fullResponses.diagnostic_type,
            result_url: resultUrl,
            timestamp: new Date().toISOString()
        });
    }

    // Return structure matching what UI expects (UI doesn't strictly check project object, just success)
    return { response: { id: response_id }, resultUrl };
};
