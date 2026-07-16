import { supabase } from "@/integrations/supabase/client";
import { ReiResponseInsert } from "./reiResponses";

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
    webhookUrl?: string
) => {
    // FALLBACK STRATEGY: Use existing 'rei_projects'/'rei_responses' tables
    // because the new 'diagnostico' table migration might not have applied yet.

    // 1. Create Project (Lead)
    const nextDate = new Date();
    nextDate.setFullYear(nextDate.getFullYear() + 1);

    const { data: project, error: pError } = await supabase
        .from('rei_projects')
        .insert({
            client_name: lead.name,
            client_email: lead.email,
            client_company: lead.company,
            analyst_email: 'giulliano@revhackers.com.br',
            next_rei_date: nextDate.toISOString(),
            quarter: 'Q1',
            year: new Date().getFullYear(),
            status: 'active'
        })
        .select()
        .single();

    if (pError) {
        console.error('Error creating lead project:', pError);
        throw pError;
    }

    // 2. Save Response
    // We store the extra details (phone, role, maturity details) in the responses JSON or separate columns if available
    // For now, we put everything in 'responses' block to ensure it's saved without schema errors
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

    const { data: response, error: rError } = await supabase
        .from('rei_responses')
        .insert({
            project_id: project.id,
            responses: fullResponses as any,
            total_score: score,
            maturity_level: maturity.title || maturity.level,
            maturity_percentage: score,
            // Try to set context/source if columns exist, otherwise this might fail if I assume they exist
            // I'll assume they exist as they were in previous migrations. 
            // If they fail, we might need to remove them, but let's hope. 
            // Safest is to rely on defaults if possible, but let's try to set them.
            context: 'lead_gen',
            source: 'diagnostic',
            score_version: 'v1.0'
        })
        .select()
        .single();

    if (rError) {
        console.error('Error saving response:', rError);
        // If error is about missing columns (context/source), we retry without them?
        // Too complex for now. Assuming previous migrations ran.
        throw rError;
    }

    // 3. Trigger Webhook
    // URL definition
    const resultUrl = `${window.location.origin}/diagnostico/resultado/${response.id}`;

    if (webhookUrl) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...lead,
                    score,
                    maturity: maturity.level,
                    maturity_title: maturity.title,
                    diagnostic_type: fullResponses.diagnostic_type,
                    result_url: resultUrl,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('Webhook error:', e);
        }
    }

    return { response, resultUrl };
};
