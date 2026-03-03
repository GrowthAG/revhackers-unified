declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Supabase client (service_role for DB writes) ──────────────────────────────
function getSupabaseAdmin() {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
}

// ── Persist meetings to database ──────────────────────────────────────────────
async function persistMeetings(meetings: any[]): Promise<void> {
    if (!meetings.length) return;
    const supabase = getSupabaseAdmin();

    const rows = meetings.map(m => ({
        google_event_id: m.google_event_id,
        title: m.title,
        description: m.description || '',
        meeting_type: m.meeting_type,
        meeting_date: m.meeting_date,
        duration_minutes: m.duration_minutes,
        status: m.status || 'confirmed',
        meet_link: m.meet_link,
        video_url: m.video_url,
        drive_file_id: m.drive_file_id,
        thumbnail_url: m.thumbnail_url,
        has_recording: !!m.drive_file_id,
        client_name: m.client_name,
        client_email: m.client_email,
        client_contact_name: m.client_contact_name,
        organizer_email: m.organizer_email || '',
        attendees: m.attendees || [],
        event_notes: m.event_notes || '',
        synced_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('client_meetings').upsert(rows, { onConflict: 'google_event_id' });
    if (error) console.error('[persist] Batch upsert error:', error.message);
    else console.log(`[persist] Upserted ${meetings.length} meetings`);
}

// ── OAuth2 helpers ─────────────────────────────────────────────────────────────
const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/drive',
].join(' ');

function getOAuthConfig() {
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI') ||
        `https://eqspbruarsdybpfeijnf.supabase.co/functions/v1/google-meetings/callback`;
    return { clientId, clientSecret, redirectUri };
}

// Generate OAuth2 authorization URL
function getAuthUrl(): string {
    const { clientId, redirectUri } = getOAuthConfig();
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange auth code for tokens
async function exchangeCodeForTokens(code: string): Promise<any> {
    const { clientId, clientSecret, redirectUri } = getOAuthConfig();
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Token exchange failed: ${err}`);
    }
    return res.json();
}

// Refresh access token using refresh_token
async function refreshAccessToken(refreshToken: string): Promise<string> {
    const { clientId, clientSecret } = getOAuthConfig();
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Token refresh failed: ${err}`);
    }
    const data = await res.json();
    return data.access_token;
}

// ── Google API helpers ─────────────────────────────────────────────────────────
async function fetchCalendarEvents(token: string, maxResults = 50): Promise<any[]> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${ninetyDaysAgo}` +
        `&q=meet.google.com`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        console.error('[Calendar] Error:', await res.text());
        return [];
    }
    const data = await res.json();
    return (data.items || []).filter((e: any) =>
        e.conferenceData?.conferenceSolution?.name === 'Google Meet' || e.hangoutLink
    );
}

// ── Auto-share recording as "anyone with link can view" ───────────────────────
async function shareRecordingPublicly(token: string, fileId: string): Promise<boolean> {
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: 'reader', type: 'anyone' }),
        });
        if (!res.ok) {
            console.error(`[share] Error sharing ${fileId}:`, await res.text());
            return false;
        }
        console.log(`[share] File ${fileId} shared publicly`);
        return true;
    } catch (e: any) {
        console.error(`[share] Exception sharing ${fileId}:`, e.message);
        return false;
    }
}

// Generate embed URL for Drive video
function getDriveEmbedUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
}

async function fetchDriveRecordings(token: string): Promise<any[]> {
    const url = `https://www.googleapis.com/drive/v3/files?` +
        `q=${encodeURIComponent("mimeType='video/mp4' and fullText contains 'Meet Recording'")}` +
        `&fields=files(id,name,webViewLink,webContentLink,thumbnailLink,createdTime,size,shared)` +
        `&orderBy=createdTime desc&pageSize=50`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        console.error('[Drive] Error:', await res.text());
        return [];
    }
    const data = await res.json();
    return data.files || [];
}

function matchRecordingToEvent(recordings: any[], events: any[]): any[] {
    const INTERNAL_EMAILS = ['giulliano@revhackers.com.br', 'giulliano@usefunnels.io'];

    return events.map((event: any) => {
        const eventDate = new Date(event.start?.dateTime || event.start?.date).toISOString().slice(0, 10);
        const eventTitle = event.summary || 'Reunião';

        // Match recording: same date, and if multiple recordings on same day, try title match
        const sameDayRecordings = recordings.filter((r: any) =>
            new Date(r.createdTime).toISOString().slice(0, 10) === eventDate
        );
        const recording = sameDayRecordings.length === 1
            ? sameDayRecordings[0]
            : sameDayRecordings.find((r: any) => {
                const recName = (r.name || '').toLowerCase();
                return recName.includes(eventTitle.toLowerCase().slice(0, 15));
            }) || sameDayRecordings[0] || null;

        const attendees = (event.attendees || []).filter((a: any) =>
            !INTERNAL_EMAILS.includes(a.email?.toLowerCase()) &&
            !a.email?.includes('calendar.google.com') && !a.self
        );

        const organizer = event.organizer?.email || '';

        const clientAttendee = attendees[0] || null;
        let clientName = '';
        const clientEmail = clientAttendee?.email || '';
        if (clientEmail) {
            const domain = clientEmail.split('@')[1]?.split('.')[0] || '';
            if (!['gmail', 'outlook', 'hotmail', 'yahoo', 'icloud'].includes(domain))
                clientName = domain.charAt(0).toUpperCase() + domain.slice(1);
        }

        // Classificação pelo padrão: "Revhacker > Tipo NomeCliente"
        let meetingType = 'outro';
        const tl = eventTitle.toLowerCase();

        // Padrão principal: "Revhacker > Proposta/Kickoff/Planejamento ..."
        if (tl.includes('proposta') || tl.includes('diagnóstico') || tl.includes('diagnostico') || tl.includes('discovery') || tl.includes('rei'))
            meetingType = 'proposta';
        else if (tl.includes('kickoff') || tl.includes('onboarding') || tl.includes('boas-vindas'))
            meetingType = 'kickoff';
        else if (tl.includes('planejamento') || tl.includes('estratégia') || tl.includes('estrategia') || tl.includes('planning'))
            meetingType = 'planejamento';
        else if (tl.includes('review') || tl.includes('follow') || tl.includes('acompanhamento'))
            meetingType = 'review';
        else if (tl.includes('suporte') || tl.includes('dúvida') || tl.includes('duvida'))
            meetingType = 'suporte';

        // Extrair nome do cliente do título "Revhacker > Tipo NomeCliente"
        const titleMatch = eventTitle.match(/revhacker[s]?\s*>\s*\w+\s+(.+)/i);
        if (titleMatch && !clientName) {
            clientName = titleMatch[1].trim();
        }

        const dur = event.end?.dateTime && event.start?.dateTime
            ? new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime() : 0;

        return {
            google_event_id: event.id,
            title: eventTitle,
            meeting_type: meetingType,
            meeting_date: event.start?.dateTime || event.start?.date,
            duration_minutes: Math.round(dur / 60000),
            meet_link: event.hangoutLink || '',
            video_url: recording?.webViewLink || '',
            video_embed_url: recording?.id ? getDriveEmbedUrl(recording.id) : '',
            drive_file_id: recording?.id || '',
            thumbnail_url: recording?.thumbnailLink || '',
            recording_shared: recording?.shared || false,
            attendees: attendees.map((a: any) => ({ email: a.email, name: a.displayName || '', status: a.responseStatus || '' })),
            client_name: clientName,
            client_email: clientEmail,
            client_contact_name: clientAttendee?.displayName || '',
            organizer_email: organizer,
            description: event.description || '',
            event_notes: event.description || '',
            status: event.status || 'confirmed',
            recording_size_bytes: recording?.size ? parseInt(recording.size) : 0,
        };
    });
}

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
    const url = new URL(req.url);

    // Handle CORS
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // ═══ OAuth2 callback (GET from Google redirect) ═══
    if (url.pathname.endsWith('/callback') && req.method === 'GET') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
            return new Response(`<h2>Erro: ${error}</h2><p>Feche esta aba e tente novamente.</p>`, {
                headers: { 'Content-Type': 'text/html' },
            });
        }

        if (!code) {
            return new Response('<h2>Código de autorização não encontrado</h2>', {
                headers: { 'Content-Type': 'text/html' },
            });
        }

        try {
            const tokens = await exchangeCodeForTokens(code);
            console.log('[google-meetings] Tokens received:', Object.keys(tokens));

            // Return the refresh token for the admin to store
            return new Response(`
<!DOCTYPE html>
<html>
<head><title>Google Meet Autorizado</title><style>
body { font-family: system-ui; max-width:600px; margin:80px auto; padding:20px; text-align:center; }
.token { background:#f4f4f5; border:1px solid #e4e4e7; padding:12px; font-family:monospace; font-size:12px; word-break:break-all; border-radius:8px; margin:16px 0; }
.btn { background:#18181b; color:#fff; border:none; padding:12px 24px; font-size:14px; font-weight:700; cursor:pointer; border-radius:6px; }
h1 { color:#18181b; font-size:24px; }
p { color:#71717a; }
</style></head>
<body>
<h1>✅ Autorizado com sucesso!</h1>
<p>Copie o <strong>Refresh Token</strong> abaixo e cole no terminal quando solicitado:</p>
<div class="token" id="rt">${tokens.refresh_token || 'ATENÇÃO: refresh_token não foi retornado. Tente novamente com prompt=consent.'}</div>
<button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('rt').textContent)">📋 Copiar Token</button>
<p style="margin-top:24px; font-size:12px;">Você pode fechar esta aba depois de copiar.</p>
</body>
</html>`, {
                headers: { 'Content-Type': 'text/html' },
            });
        } catch (e: any) {
            return new Response(`<h2>Erro ao trocar código</h2><pre>${e.message}</pre>`, {
                headers: { 'Content-Type': 'text/html' },
            });
        }
    }

    // ═══ POST endpoints ═══
    try {
        const body = await req.json();
        const { action, client_email } = body;

        // Action: get_auth_url — returns URL for admin to authorize
        if (action === 'auth_url') {
            return new Response(JSON.stringify({ success: true, url: getAuthUrl() }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Action: list — fetch meetings using refresh token
        if (action === 'list' || action === 'recordings') {
            const REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN');
            if (!REFRESH_TOKEN) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'GOOGLE_REFRESH_TOKEN não configurado. Use action=auth_url para autorizar.',
                    needs_auth: true,
                }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const token = await refreshAccessToken(REFRESH_TOKEN);
            console.log(`[google-meetings] Access token refreshed, action=${action}`);

            if (action === 'recordings') {
                const recordings = await fetchDriveRecordings(token);
                return new Response(JSON.stringify({ success: true, data: recordings }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const [events, recordings] = await Promise.all([
                fetchCalendarEvents(token),
                fetchDriveRecordings(token),
            ]);

            console.log(`[google-meetings] Found ${events.length} events, ${recordings.length} recordings`);

            let meetings = matchRecordingToEvent(recordings, events);

            // Auto-share gravações não compartilhadas (background)
            const unsharedRecordings = recordings.filter((r: any) => !r.shared && r.id);
            if (unsharedRecordings.length > 0) {
                Promise.all(unsharedRecordings.map((r: any) => shareRecordingPublicly(token, r.id)))
                    .then(results => console.log(`[share] ${results.filter(Boolean).length}/${unsharedRecordings.length} shared`))
                    .catch(e => console.error('[share] Background error:', e.message));
            }

            // Persistir todas as reuniões no banco (async, não bloqueia resposta)
            persistMeetings(meetings).catch(e => console.error('[persist] Background error:', e.message));

            if (client_email) {
                meetings = meetings.filter((m: any) =>
                    m.attendees?.some((a: any) => a.email?.toLowerCase() === client_email.toLowerCase())
                );
            }

            return new Response(JSON.stringify({ success: true, data: meetings }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, error: 'Ação inválida. Use: auth_url, list, recordings' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (e: any) {
        console.error('[google-meetings] Error:', e.message);
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
