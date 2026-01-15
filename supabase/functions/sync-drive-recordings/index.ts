// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sync Drive Recordings
 * 
 * This function scans the "Meet Recordings" folder in Google Drive
 * and syncs any new recordings to the meeting_recordings table.
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get Google integration token
        const { data: integration, error: integrationError } = await supabaseClient
            .from('integrations')
            .select('*')
            .eq('provider', 'google')
            .single();

        if (integrationError || !integration) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Google integration not found'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        let accessToken = integration.access_token;
        const expiresAt = new Date(integration.expires_at);

        // Refresh token if expired
        if (expiresAt <= new Date()) {
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
                await supabaseClient
                    .from('integrations')
                    .update({
                        access_token: refreshData.access_token,
                        expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
                    })
                    .eq('id', integration.id);
            }
        }

        // Search for Meet Recordings folder
        const folderSearchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?` +
            `q=name='Meet Recordings' and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        const folderData = await folderSearchResponse.json();
        const meetFolder = folderData.files?.[0];

        if (!meetFolder) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No Meet Recordings folder found. Recordings will appear after first meeting is recorded.',
                synced: 0,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Get recordings from the folder (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const recordingsResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?` +
            `q='${meetFolder.id}' in parents and modifiedTime > '${sevenDaysAgo}'` +
            `&fields=files(id,name,webViewLink,webContentLink,size,createdTime,videoMediaMetadata)` +
            `&orderBy=createdTime desc`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        const recordingsData = await recordingsResponse.json();
        const recordings = recordingsData.files || [];

        let synced = 0;
        let existing = 0;

        for (const file of recordings) {
            // Check if already exists
            const { data: existingRec } = await supabaseClient
                .from('meeting_recordings')
                .select('id')
                .eq('drive_file_id', file.id)
                .single();

            if (existingRec) {
                existing++;
                continue;
            }

            // Extract duration from video metadata (in milliseconds)
            const durationMs = file.videoMediaMetadata?.durationMillis || 0;
            const durationSeconds = Math.round(durationMs / 1000);

            // Try to match with scheduled meeting by title/date
            let scheduledMeetingId = null;
            const fileDate = new Date(file.createdTime);

            const { data: matchingMeeting } = await supabaseClient
                .from('scheduled_meetings')
                .select('id')
                .gte('start_time', new Date(fileDate.getTime() - 2 * 60 * 60 * 1000).toISOString())
                .lte('start_time', new Date(fileDate.getTime() + 2 * 60 * 60 * 1000).toISOString())
                .limit(1)
                .single();

            if (matchingMeeting) {
                scheduledMeetingId = matchingMeeting.id;
            }

            // Insert new recording
            const { error: insertError } = await supabaseClient
                .from('meeting_recordings')
                .insert({
                    scheduled_meeting_id: scheduledMeetingId,
                    drive_file_id: file.id,
                    drive_file_name: file.name,
                    drive_web_view_link: file.webViewLink,
                    drive_download_link: file.webContentLink,
                    title: file.name.replace('.mp4', '').replace(/_/g, ' '),
                    duration_seconds: durationSeconds,
                    file_size_bytes: parseInt(file.size || '0'),
                    happened_at: file.createdTime,
                    transcript_status: 'pending',
                });

            if (insertError) {
                console.error('Error inserting recording:', insertError);
            } else {
                synced++;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Synced ${synced} new recordings, ${existing} already existed`,
            total_found: recordings.length,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Sync error:', error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
