// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * fill-rei-from-transcript
 *
 * Triggered when a meeting_recording reaches transcript_status = 'completed'.
 * Uses GPT to extract structured REI entities from the transcript and
 * auto-populates the matching rei_responses.responses.form_data fields.
 *
 * Trigger mechanisms:
 *   1. Database webhook: trigger on meeting_recordings.transcript_status = 'completed'
 *   2. Called directly by process-meeting-audio after kickoff classification
 *
 * Input body:
 *   { recordingId: string, projectId?: string }
 *
 * Output:
 *   { success: boolean, fieldsPopulated: number, reiResponseId: string }
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maps REI field names to human-readable extraction hints for the GPT prompt
const REI_FIELD_MAP: Record<string, string> = {
    // Consulting REI fields (camelCase)
    companyName:         'nome da empresa do cliente',
    companySite:         'site ou URL da empresa',
    email:               'email do contato principal',
    sector:              'setor ou segmento de mercado (ex: SaaS B2B, Varejo, Fintech)',
    companySize:         'tamanho da empresa (ex: 1-10, 11-50, 51-200 funcionarios)',
    annualRevenue:       'faturamento anual ou MRR (ex: acima-10m, 5m-10m, 1m-5m, 500k-1m, abaixo-500k)',
    currentCRM:          'CRM atual utilizado (ex: HubSpot, Salesforce, Pipedrive, nao utiliza)',
    mainChallenge:       'principal desafio ou dor do cliente em suas proprias palavras',
    biggestPain:         'maior dor operacional mencionada',
    teamSize:            'tamanho do time comercial ou de vendas',
    monthlyRevenue:      'receita mensal ou MRR declarado',
    hasPlans:            'se possui planejamento estruturado: structured, informal ou none_plan',
    hasMarketingMaterials: 'se possui materiais de marketing: complete_kit, partial, minimal',
    // Founder REI fields
    fullName:            'nome completo do fundador ou responsavel',
    linkedinUrl:         'URL do LinkedIn do fundador',
    currentRole:         'cargo atual',
    // Dev REI fields
    projectName:         'nome do projeto ou produto digital',
    projectType:         'tipo de projeto (ex: landing page, ecommerce, SaaS)',
    targetAudience:      'publico-alvo do projeto',
    // crm_ops fields (snake_case with revops_ prefix)
    revops_empresa:      'nome da empresa',
    revops_segmento:     'segmento de mercado',
    revops_crm_atual:    'CRM atual',
    revops_tamanho_time: 'tamanho do time',
    revops_faturamento:  'faturamento ou receita',
    revops_maior_dor:    'maior dor operacional',
    revops_canais_aquisicao: 'canais de aquisicao de clientes',
};

// Fields that can be inferred even from a short transcript
const HIGH_CONFIDENCE_FIELDS = ['companyName', 'sector', 'mainChallenge', 'currentCRM', 'biggestPain', 'revops_empresa', 'revops_maior_dor'];

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { recordingId, projectId: bodyProjectId } = body;

        if (!recordingId) {
            throw new Error('recordingId e obrigatorio');
        }

        // @ts-ignore - Supabase Deno environment
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        // @ts-ignore - Supabase Deno environment
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
        // @ts-ignore - Supabase Deno environment
        const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY nao configurado');
        if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Supabase env vars ausentes');

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // ============================================================
        // STEP 1: Load the recording
        // ============================================================
        const { data: recording, error: recError } = await supabase
            .from('meeting_recordings')
            .select('id, transcript, ai_insights, ai_summary, rei_project_id, client_id, title')
            .eq('id', recordingId)
            .single();

        if (recError || !recording) {
            throw new Error(`Recording nao encontrado: ${recError?.message}`);
        }

        const projectId: string | null = bodyProjectId || recording.rei_project_id || null;

        if (!projectId) {
            console.log('[fill-rei-from-transcript] No project linked to recording - skipping');
            return new Response(JSON.stringify({ success: false, reason: 'No project linked' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!recording.transcript || recording.transcript.length < 100) {
            console.log('[fill-rei-from-transcript] Transcript too short or missing - skipping');
            return new Response(JSON.stringify({ success: false, reason: 'Transcript insuficiente' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ============================================================
        // STEP 2: Load existing REI response for this project (if any)
        // ============================================================
        const { data: existingResponse } = await supabase
            .from('rei_responses')
            .select('id, responses, context')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        const existingFormData: Record<string, any> = existingResponse?.responses?.form_data || {};

        // Determine REI type from stored diagnostic_type
        const reiType: string = existingResponse?.responses?.diagnostic_type || 'consulting';

        // Select relevant fields based on REI type
        const targetFields = Object.keys(REI_FIELD_MAP).filter(field => {
            if (reiType === 'crm_ops') return field.startsWith('revops_');
            if (reiType === 'founder') return ['fullName', 'linkedinUrl', 'currentRole', 'email', 'mainChallenge', 'sector', 'companyName'].includes(field);
            if (reiType === 'dev') return ['projectName', 'projectType', 'targetAudience', 'email', 'companyName', 'mainChallenge'].includes(field);
            // consulting (default)
            return !field.startsWith('revops_');
        });

        // Only extract fields not already populated
        const emptyFields = targetFields.filter(f => !existingFormData[f] || existingFormData[f] === '');

        if (emptyFields.length === 0) {
            console.log('[fill-rei-from-transcript] All target fields already populated - nothing to do');
            return new Response(JSON.stringify({ success: true, fieldsPopulated: 0, reason: 'All fields already populated' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[fill-rei-from-transcript] Extracting ${emptyFields.length} fields from transcript for project ${projectId}`);

        // ============================================================
        // STEP 3: GPT Entity Extraction
        // ============================================================
        const fieldDescriptions = emptyFields
            .map(f => `"${f}": "${REI_FIELD_MAP[f]}"`)
            .join(',\n  ');

        // Build context from AI insights if available to improve extraction
        let insightContext = '';
        if (recording.ai_insights) {
            const ins = recording.ai_insights;
            if (ins.cliente?.empresa) insightContext += `\nEmpresa identificada: ${ins.cliente.empresa}`;
            if (ins.cliente?.segmento_mercado) insightContext += `\nSegmento identificado: ${ins.cliente.segmento_mercado}`;
            if (ins.inteligencia_estrategica?.desafios_especificos?.length) {
                insightContext += `\nDesafios ja extraidos: ${ins.inteligencia_estrategica.desafios_especificos.join(', ')}`;
            }
            if (ins.kickoff_data?.gargalos_atuais?.length) {
                insightContext += `\nGargalos ja extraidos: ${ins.kickoff_data.gargalos_atuais.join(', ')}`;
            }
        }

        const systemPrompt = `Você é um especialista em análise de dados comerciais B2B. Aja como um extrator de alta precisão de transcrições de reuniões.
Nunca invente informações (evite alucinações). Se a informação não foi dita pelo cliente, assinalar como valor vazio.
Mantenha nomes próprios exatamente como mencionados. Siga estritamente as tipagens dos campos.`

        const userPrompt = `Reuniao: ${recording.title || 'Sem titulo'}
${insightContext}

Transcricao (primeiros 12000 caracteres):
${recording.transcript.substring(0, 12000)}

Extraia os seguintes campos (retorne null se nao encontrado):
{
  ${fieldDescriptions}
}

Valores validos para campos especificos:
- annualRevenue: "acima-10m" | "5m-10m" | "1m-5m" | "500k-1m" | "abaixo-500k"
- hasPlans: "structured" | "informal" | "none_plan"
- hasMarketingMaterials: "complete_kit" | "partial" | "minimal"
- currentCRM: nome do CRM ou "nao-utilizo"`;

        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.4-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
                max_tokens: 1000,
            }),
        });

        if (!gptResponse.ok) {
            const errText = await gptResponse.text();
            throw new Error(`GPT API error: ${gptResponse.status} - ${errText.substring(0, 200)}`);
        }

        const gptResult = await gptResponse.json();
        const rawContent: string = gptResult.choices?.[0]?.message?.content || '';

        let extracted: Record<string, any> = {};
        try {
            extracted = JSON.parse(rawContent);
        } catch (parseErr) {
            console.error('[fill-rei-from-transcript] Failed to parse GPT response:', rawContent.substring(0, 300));
            throw new Error('GPT Structured Output falhou na validação do JSON.');
        }

        // ============================================================
        // STEP 4: Merge extracted fields into form_data (null = skip)
        // ============================================================
        const newFields: Record<string, any> = {};
        let fieldsPopulated = 0;

        for (const [field, value] of Object.entries(extracted)) {
            if (value === null || value === undefined || value === '') continue;
            if (typeof value === 'string' && value.trim() === '') continue;
            // Only fill fields that were empty (never overwrite existing data)
            if (emptyFields.includes(field)) {
                newFields[field] = value;
                fieldsPopulated++;
            }
        }

        if (fieldsPopulated === 0) {
            console.log('[fill-rei-from-transcript] No new fields extracted from transcript');
            return new Response(JSON.stringify({ success: true, fieldsPopulated: 0, reason: 'Nenhum campo extraido' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[fill-rei-from-transcript] Extracted ${fieldsPopulated} fields: ${Object.keys(newFields).join(', ')}`);

        // ============================================================
        // STEP 5: Persist - update or create rei_response
        // ============================================================
        const mergedFormData = { ...existingFormData, ...newFields };

        let reiResponseId: string | null = existingResponse?.id || null;

        if (existingResponse) {
            // Update existing response - merge into responses JSONB
            const { error: updateError } = await supabase
                .from('rei_responses')
                .update({
                    responses: {
                        ...existingResponse.responses,
                        form_data: mergedFormData,
                        transcript_autofill_at: new Date().toISOString(),
                        transcript_source_recording: recordingId,
                    },
                })
                .eq('id', existingResponse.id);

            if (updateError) throw new Error(`Erro ao atualizar rei_response: ${updateError.message}`);
            console.log(`[fill-rei-from-transcript] Updated existing rei_response ${existingResponse.id}`);

        } else {
            // No REI response yet - create a skeleton one so the data is not lost
            const { data: newResp, error: insertError } = await supabase
                .from('rei_responses')
                .insert({
                    project_id: projectId,
                    context: 'internal',
                    responses: {
                        form_data: mergedFormData,
                        diagnostic_type: reiType,
                        transcript_autofill_at: new Date().toISOString(),
                        transcript_source_recording: recordingId,
                        auto_created: true,
                    },
                    total_score: 0,
                    maturity_level: 'Em Desenvolvimento',
                    maturity_percentage: 0,
                    source: 'rei',
                    completed_at: new Date().toISOString(),
                } as any)
                .select('id')
                .single();

            if (insertError) throw new Error(`Erro ao criar rei_response: ${insertError.message}`);
            reiResponseId = newResp?.id || null;
            console.log(`[fill-rei-from-transcript] Created new skeleton rei_response ${reiResponseId}`);
        }

        // Also update the recording with project link (in case it wasn't set)
        if (!recording.rei_project_id && projectId) {
            await supabase
                .from('meeting_recordings')
                .update({ rei_project_id: projectId })
                .eq('id', recordingId);
        }

        return new Response(JSON.stringify({
            success: true,
            fieldsPopulated,
            fieldsExtracted: Object.keys(newFields),
            reiResponseId,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[fill-rei-from-transcript] Error:', error.message);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
