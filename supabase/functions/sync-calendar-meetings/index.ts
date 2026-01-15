// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sync Calendar Meetings
 * 
 * This function syncs upcoming Google Calendar events that have Google Meet links.
 * It stores them in the scheduled_meetings table for reminder sending and recording sync.
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
                error: 'Google integration not found. Please connect Google Workspace first.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Check if token is expired and refresh if needed
        let accessToken = integration.access_token;
        const expiresAt = new Date(integration.expires_at);

        if (expiresAt <= new Date()) {
            // Token expired, refresh it
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

                // Update token in database
                await supabaseClient
                    .from('integrations')
                    .update({
                        access_token: refreshData.access_token,
                        expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
                    })
                    .eq('id', integration.id);
            }
        }

        // Fetch calendar events for next 24 hours
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const calendarResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${now.toISOString()}&timeMax=${tomorrow.toISOString()}&singleEvents=true&orderBy=startTime`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            }
        );

        if (!calendarResponse.ok) {
            const errorText = await calendarResponse.text();
            throw new Error(`Calendar API error: ${errorText}`);
        }

        const calendarData = await calendarResponse.json();
        const events = calendarData.items || [];

        // Filter events with Google Meet links
        const meetEvents = events.filter((event: any) =>
            event.hangoutLink ||
            event.conferenceData?.entryPoints?.some((ep: any) => ep.entryPointType === 'video')
        );

        let synced = 0;
        let skipped = 0;

        for (const event of meetEvents) {
            const meetUrl = event.hangoutLink ||
                event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;

            if (!meetUrl) continue;

            const attendees = (event.attendees || []).map((a: any) => ({
                email: a.email,
                displayName: a.displayName,
                responseStatus: a.responseStatus,
            }));

            // Upsert into scheduled_meetings
            const { error: upsertError } = await supabaseClient
                .from('scheduled_meetings')
                .upsert({
                    google_event_id: event.id,
                    organizer_email: event.organizer?.email,
                    meet_url: meetUrl,
                    title: event.summary || 'Reunião sem título',
                    start_time: event.start?.dateTime || event.start?.date,
                    end_time: event.end?.dateTime || event.end?.date,
                    attendees: attendees,
                }, { onConflict: 'google_event_id' });

            if (upsertError) {
                console.error('Error upserting event:', upsertError);
                skipped++;
            } else {
                synced++;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Synced ${synced} meetings, skipped ${skipped}`,
            total_events: events.length,
            meet_events: meetEvents.length,
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
