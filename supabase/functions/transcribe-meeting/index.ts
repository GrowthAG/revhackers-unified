// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Transcribe Meeting
 * 
 * STRATEGY:
 * 1. First try Google Meet API (FREE with Workspace Business Standard+)
 * 2. If not available, fallback to OpenAI Whisper (~$0.006/min)
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { recordingId, forceWhisper = false } = await req.json();

        if (!recordingId) {
            throw new Error('recordingId is required');
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get recording details
        const { data: recording, error: recordingError } = await supabaseClient
            .from('meeting_recordings')
            .select('*, scheduled_meetings(*)')
            .eq('id', recordingId)
            .single();

        if (recordingError || !recording) {
            throw new Error('Recording not found');
        }

        if (recording.transcript_status === 'completed') {
            return new Response(JSON.stringify({
                success: true,
                message: 'Already transcribed',
                transcript: recording.transcript,
                source: 'cache',
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Update status to processing
        await supabaseClient
            .from('meeting_recordings')
            .update({ transcript_status: 'processing' })
            .eq('id', recordingId);

        // Get Google access token
        const { data: integration } = await supabaseClient
            .from('integrations')
            .select('*')
            .eq('provider', 'google')
            .single();

        if (!integration) {
            throw new Error('Google integration not found');
        }

        let accessToken = integration.access_token;

        // Refresh if needed
        if (new Date(integration.expires_at) <= new Date()) {
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
                    client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
                    refresh_token: integration.refresh_token,
                    grant_type: 'refresh_token',
                }),
            });
            const refreshData = await refreshResponse.json();
            if (refreshData.access_token) {
                accessToken = refreshData.access_token;
            }
        }

        let transcript = '';
        let transcriptSource = 'unknown';

        // ========================================
        // STRATEGY 1: Try Google Meet API (FREE)
        // ========================================
        if (!forceWhisper) {
            try {
                console.log('Trying Google Meet native transcription...');

                // Search for conference records matching the meeting time
                const meetingTime = recording.happened_at || recording.scheduled_meetings?.start_time;

                if (meetingTime) {
                    // List conference records
                    const conferenceRes = await fetch(
                        `https://meet.googleapis.com/v2/conferenceRecords?filter=start_time>="${new Date(new Date(meetingTime).getTime() - 60 * 60 * 1000).toISOString()}"`,
                        { headers: { 'Authorization': `Bearer ${accessToken}` } }
                    );

                    if (conferenceRes.ok) {
                        const conferenceData = await conferenceRes.json();
                        const conferences = conferenceData.conferenceRecords || [];

                        for (const conf of conferences) {
                            // Get transcripts for this conference
                            const transcriptsRes = await fetch(
                                `https://meet.googleapis.com/v2/${conf.name}/transcripts`,
                                { headers: { 'Authorization': `Bearer ${accessToken}` } }
                            );

                            if (transcriptsRes.ok) {
                                const transcriptsData = await transcriptsRes.json();
                                const transcripts = transcriptsData.transcripts || [];

                                if (transcripts.length > 0) {
                                    // Get transcript entries
                                    const entriesRes = await fetch(
                                        `https://meet.googleapis.com/v2/${transcripts[0].name}/entries`,
                                        { headers: { 'Authorization': `Bearer ${accessToken}` } }
                                    );

                                    if (entriesRes.ok) {
                                        const entriesData = await entriesRes.json();
                                        const entries = entriesData.transcriptEntries || [];

                                        // Format transcript with speaker names
                                        transcript = entries.map((e: any) => {
                                            const speaker = e.participant?.displayName || 'Participante';
                                            return `${speaker}: ${e.text}`;
                                        }).join('\n');

                                        transcriptSource = 'google_meet_native';
                                        console.log('[transcribe-meeting] Got native transcript from Google Meet API');
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (googleError: any) {
                console.log('Google Meet API not available:', googleError.message);
            }
        }

        // ========================================
        // STRATEGY 2: Fallback to Whisper (PAID)
        // ========================================
        if (!transcript) {
            console.log('Falling back to Whisper API...');

            const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
            if (!OPENAI_API_KEY) {
                throw new Error('No transcript available and OPENAI_API_KEY not configured for fallback');
            }

            // Download audio from Google Drive
            const driveResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${recording.drive_file_id}?alt=media`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            if (!driveResponse.ok) {
                throw new Error(`Failed to download file: ${driveResponse.statusText}`);
            }

            const audioBlob = await driveResponse.blob();

            // Send to OpenAI Whisper API
            const formData = new FormData();
            formData.append('file', audioBlob, 'meeting.mp4');
            formData.append('model', 'whisper-1');
            formData.append('language', 'pt');

            const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
                body: formData,
            });

            if (!whisperResponse.ok) {
                throw new Error(`Whisper API error: ${await whisperResponse.text()}`);
            }

            const whisperResult = await whisperResponse.json();
            transcript = whisperResult.text;
            transcriptSource = 'openai_whisper';
            console.log('[transcribe-meeting] Got transcript from Whisper');
        }

        // Update recording with transcript
        await supabaseClient
            .from('meeting_recordings')
            .update({
                transcript: transcript,
                transcript_status: 'completed',
                transcribed_at: new Date().toISOString(),
            })
            .eq('id', recordingId);

        // Trigger AI analysis
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-meeting-transcript`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recordingId }),
        }).catch(console.error);

        return new Response(JSON.stringify({
            success: true,
            message: 'Transcription completed',
            source: transcriptSource,
            transcript_length: transcript.length,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Transcription error:', error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
