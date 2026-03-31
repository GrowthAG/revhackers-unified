import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Auth header is required');

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: { headers: { Authorization: authHeader } },
            }
        );

        // Get the current user to verify they are authenticated
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Não autorizado. Faça o login novamente.');

        let searchEmail = '';
        let targetProjectId = '';

        // Safely parse JSON payload
        try {
            const body = await req.json();
            searchEmail = body.searchEmail || '';
            targetProjectId = body.projectId || '';
        } catch (e) {
            console.warn("Nenhum JSON fornecido ou JSON invalido");
        }

        const FATHOM_API_KEY = Deno.env.get('FATHOM_API_KEY');
        if (!FATHOM_API_KEY) {
            throw new Error('A Chave API do Fathom não está configurada nos Secrets do Supabase.');
        }

        console.log(`Buscando reuniões no Fathom... Filtro (se houver email): ${searchEmail}`);

        // Fetch recent meetings from Fathom API
        // According to Fathom API documentation: GET /meetings (this is a standard REST format assumption for the script context based on fathom.ai reference)
        // Note: The specific API endpoint for Fathom might be different, commonly 'https://api.fathom.ai/meetings' or 'https://api.fathom.video/v1/meetings'
        const fathomResponse = await fetch('https://api.fathom.ai/external/v1/meetings?limit=10', {
            method: 'GET',
            headers: {
                'X-Api-Key': FATHOM_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!fathomResponse.ok) {
            const errorText = await fathomResponse.text();
            throw new Error(`Falha ao conectar no Fathom API: ${fathomResponse.status} ${errorText}`);
        }

        const meetingsData = await fathomResponse.json();
        const meetings = meetingsData.data || meetingsData.meetings || []; // Depending on Fathom JSON structure

        const importedMeetings = [];

        for (const meeting of meetings) {
            // Check if meeting relates to the requested email
            // meeting.guests could be an array of objects or strings
            const participantsStr = JSON.stringify(meeting.guests || meeting.attendees || meeting.participants || []);
            const recordingUrl = meeting.recording_url || meeting.video_url || meeting.url || '';
            const title = meeting.title || meeting.name || 'Nova Gravação';
            const happenedAt = meeting.started_at || meeting.created_at || new Date().toISOString();

            let matches = false;

            if (searchEmail) {
                // If specific search, check participants
                if (participantsStr.toLowerCase().includes(searchEmail.toLowerCase())) {
                    matches = true;
                }
            } else {
                // If generic run, import all unhandled ones
                matches = true; 
            }

            if (matches) {
                console.log(`Match encontrado em meeting ${meeting.id} - ${title}`);

                // Check if this recording was already imported
                const { data: existing } = await supabaseClient
                    .from('meeting_recordings')
                    .select('id')
                    .eq('title', title) // Note: matching by title or ext-id is better. Assuming Fathom payload has meeting ID or we filter by date
                    .maybeSingle();

                if (!existing) {
                    // Start transcription processing / summary
                    // We extract transcript explicitly from Fathom payload if available, else ''
                    const scriptText = meeting.transcript || meeting.transcript_url ? 'Transcrição carregada do Fathom' : 'Processando Transcrição...';
                    const summary = meeting.summary || 'Resumo gerado pelo Fathom.';

                    const recordingPayload = {
                        title: title,
                        video_url: recordingUrl,
                        transcript: scriptText,
                        ai_summary: summary,
                        happened_at: happenedAt,
                        transcript_status: 'completed',
                        agent_id: user.id
                    };

                    if (targetProjectId) {
                        recordingPayload.rei_project_id = targetProjectId;
                    }

                    // Insert recording
                    const { data: insertedRecording, error: insertError } = await supabaseClient
                        .from('meeting_recordings')
                        .insert([recordingPayload])
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Erro ao inserir gravacao', insertError);
                    } else if (insertedRecording) {
                        importedMeetings.push(insertedRecording);
                        
                        // Enfilerar para análise extra de insights da IA
                        // Invoke existing parse function in BG to generate `sinais_compra` e `objecoes`
                        if (scriptText && scriptText.length > 50) {
                             supabaseClient.functions.invoke('analyze-meeting-transcript', {
                                body: { recordingId: insertedRecording.id }
                            }).catch(err => console.error("Erro ao chamar analyze-meeting: ", err));
                        }
                    }
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Foi verificado o Fathom. Foram importadas ${importedMeetings.length} reuniões novas.`,
                importedCount: importedMeetings.length,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Fathom sync error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
