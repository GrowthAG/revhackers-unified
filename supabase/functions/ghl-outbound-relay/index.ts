// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * ghl-outbound-relay
 *
 * Centralized proxy for ALL outbound GoHighLevel webhook calls.
 * Supports MULTI-TENANT: if organization_id is provided, looks up
 * webhook URLs from organizations.settings before falling back to global secrets.
 *
 * WHY THIS EXISTS:
 *   - GHL webhook URLs in frontend bundle = anyone can POST to your GHL account
 *   - URL changes require frontend redeployment
 *   - No logging, no rate limiting, no validation on raw frontend calls
 *
 * MULTI-TENANT FLOW:
 *   1. Frontend sends { eventType, payload, organizationId? }
 *   2. If organizationId provided, lookup organizations.settings.ghl_webhooks[eventType]
 *   3. If no org URL found, fall back to global Supabase Secrets
 *   4. GHL URLs never appear in the JS bundle
 *
 * Supabase Secrets (global fallback - RevHackers subconta):
 *   GHL_WEBHOOK_REI          - webhook for REI/kickoff completions
 *   GHL_WEBHOOK_CONTACT      - webhook for contact forms, newsletter, ROI calc
 *   GHL_WEBHOOK_SCORE        - webhook for score pages (Growth, Site, Revenue, Founder)
 *   GHL_WEBHOOK_DOWNLOAD     - webhook for material downloads
 *   GHL_WEBHOOK_EMAIL        - webhook for email material delivery
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

    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    try {
        const body = await req.json();
        const { eventType, payload, organizationId } = body as {
            eventType: string;
            payload: Record<string, unknown>;
            organizationId?: string;
        };

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

        // -- MULTI-TENANT: Try org-specific webhook URL first --
        let ghlUrl: string | null = null;
        let resolvedVia = 'none';

        // Map event types to settings keys in organizations.settings.ghl_webhooks
        const EVENT_TO_SETTINGS_KEY: Record<EventType, string> = {
            rei_completed:   'rei',
            contact_form:    'contact',
            newsletter:      'contact',
            roi_calculator:  'contact',
            score_captured:  'score',
            lead_capture:    'score',
            download:        'download',
            email_material:  'email',
        };

        if (organizationId) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            });

            const { data: org } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', organizationId)
                .single();

            const settingsKey = EVENT_TO_SETTINGS_KEY[eventType as EventType];
            const orgUrl = org?.settings?.ghl_webhooks?.[settingsKey];

            if (orgUrl) {
                ghlUrl = orgUrl;
                resolvedVia = `org:${organizationId}`;
                console.log(`[ghl-outbound-relay] Resolved URL from org settings (${settingsKey})`);
            }
        }

        // Fallback: global Supabase Secrets (RevHackers subconta)
        if (!ghlUrl) {
            const secretName = EVENT_TO_SECRET[eventType as EventType];
            // @ts-ignore
            ghlUrl = Deno.env.get(secretName) || null;
            if (ghlUrl) resolvedVia = `secret:${secretName}`;
        }

        if (!ghlUrl) {
            console.warn(`[ghl-outbound-relay] No URL found for ${eventType} (org: ${organizationId || 'none'}). Event dropped.`);
            return new Response(JSON.stringify({ success: false, reason: 'Nenhuma URL de webhook configurada' }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Validate it's actually a GHL URL (security: don't allow SSRF via misconfigured secrets)
        const GHL_URL_PATTERN = /^https:\/\/services\.leadconnectorhq\.com\/hooks\//;
        if (!GHL_URL_PATTERN.test(ghlUrl)) {
            console.error(`[ghl-outbound-relay] ${resolvedVia} contains invalid URL pattern`);
            return new Response(JSON.stringify({ error: 'Configuracao de webhook invalida' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[ghl-outbound-relay] Relaying ${eventType} to GHL via ${resolvedVia}`);

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
