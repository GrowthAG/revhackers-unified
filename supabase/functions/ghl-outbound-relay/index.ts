// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * ghl-outbound-relay
 *
 * Centralized proxy for ALL outbound GoHighLevel webhook calls.
 * Replaces 12+ hardcoded GHL URLs scattered across the frontend bundle.
 *
 * WHY THIS EXISTS:
 *   - GHL webhook URLs in frontend bundle = anyone can POST to your GHL account
 *   - URL changes require frontend redeployment
 *   - No logging, no rate limiting, no validation on raw frontend calls
 *
 * NOW:
 *   - Frontend calls /ghl-outbound-relay with { eventType, payload }
 *   - This function routes to the correct GHL webhook via Supabase Secrets
 *   - GHL URLs never appear in the JS bundle
 *
 * Supabase Secrets required:
 *   GHL_WEBHOOK_REI          → webhook for REI/kickoff completions
 *   GHL_WEBHOOK_CONTACT      → webhook for contact forms, newsletter, ROI calc
 *   GHL_WEBHOOK_SCORE        → webhook for score pages (Growth, Site, Revenue, Founder)
 *   GHL_WEBHOOK_DOWNLOAD     → webhook for material downloads
 *   GHL_WEBHOOK_EMAIL        → webhook for email material delivery
 *
 * Migration from frontend: replace every hardcoded fetch('https://services.leadconnectorhq.com/...')
 * with a call to sendToGHL(eventType, payload) from src/lib/ghlRelay.ts
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Event types the frontend is allowed to send
const ALLOWED_EVENT_TYPES = [
    'rei_completed',      // REI form or wizard completed
    'contact_form',       // Contact form submitted
    'newsletter',         // Newsletter sign-up
    'roi_calculator',     // ROI calculator lead captured
    'score_captured',     // Growth/Site/Revenue/Founder score page lead
    'lead_capture',       // Lead capture modal
    'download',           // Material download
    'email_material',     // Email material delivery
] as const;

type EventType = typeof ALLOWED_EVENT_TYPES[number];

// Map event type to the Supabase Secret name that holds the GHL URL
const EVENT_TO_SECRET: Record<EventType, string> = {
    rei_completed:   'GHL_WEBHOOK_REI',
    contact_form:    'GHL_WEBHOOK_CONTACT',
    newsletter:      'GHL_WEBHOOK_CONTACT',
    roi_calculator:  'GHL_WEBHOOK_CONTACT',
    score_captured:  'GHL_WEBHOOK_SCORE',
    lead_capture:    'GHL_WEBHOOK_SCORE',
    download:        'GHL_WEBHOOK_DOWNLOAD',
    email_material:  'GHL_WEBHOOK_EMAIL',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { eventType, payload } = body as { eventType: string; payload: Record<string, unknown> };

        // Validate event type
        if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType as EventType)) {
            return new Response(JSON.stringify({
                error: `eventType invalido. Valores aceitos: ${ALLOWED_EVENT_TYPES.join(', ')}`,
            }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (!payload || typeof payload !== 'object') {
            return new Response(JSON.stringify({ error: 'payload (object) obrigatorio' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Payload size guard
        if (JSON.stringify(payload).length > 20_000) {
            return new Response(JSON.stringify({ error: 'Payload excede 20KB' }), {
                status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Resolve GHL webhook URL from Secrets
        const secretName = EVENT_TO_SECRET[eventType as EventType];
        // @ts-ignore
        const ghlUrl = Deno.env.get(secretName);

        if (!ghlUrl) {
            console.warn(`[ghl-outbound-relay] Secret ${secretName} not configured. Event ${eventType} dropped.`);
            // Return 200 to avoid frontend errors - GHL is non-critical (CRM enrichment, not core flow)
            return new Response(JSON.stringify({ success: false, reason: `${secretName} nao configurado nos Supabase Secrets` }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Validate it's actually a GHL URL (security: don't allow SSRF via misconfigured secrets)
        const GHL_URL_PATTERN = /^https:\/\/services\.leadconnectorhq\.com\/hooks\//;
        if (!GHL_URL_PATTERN.test(ghlUrl)) {
            console.error(`[ghl-outbound-relay] Secret ${secretName} contains invalid URL pattern`);
            return new Response(JSON.stringify({ error: 'Configuracao de webhook invalida' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[ghl-outbound-relay] Relaying ${eventType} to GHL via ${secretName}`);

        // Relay to GHL
        const ghlResponse = await fetch(ghlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...payload,
                _source: 'revhackers-app',
                _event_type: eventType,
                _relayed_at: new Date().toISOString(),
            }),
        });

        if (!ghlResponse.ok) {
            const errText = await ghlResponse.text();
            console.error(`[ghl-outbound-relay] GHL returned ${ghlResponse.status}: ${errText.substring(0, 200)}`);
            // Still return 200 to frontend - GHL failure is not user-facing
            return new Response(JSON.stringify({ success: false, ghl_status: ghlResponse.status }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, eventType }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error('[ghl-outbound-relay] Error:', err.message);
        // Never propagate GHL errors to users
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
