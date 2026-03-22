/**
 * ghlRelay.ts
 *
 * Frontend utility for sending events to GoHighLevel via the
 * ghl-outbound-relay Supabase Edge Function.
 *
 * Replaces all hardcoded fetch('https://services.leadconnectorhq.com/...') calls.
 * GHL URLs never appear in the frontend bundle.
 *
 * Usage:
 *   import { sendToGHL } from '@/lib/ghlRelay';
 *   await sendToGHL('contact_form', { name, email, message });
 *   await sendToGHL('rei_completed', { companyName, email, score, ... });
 *   await sendToGHL('score_captured', { email, score, type: 'growth' });
 */

import { supabase } from '@/integrations/supabase/client';

export type GHLEventType =
    | 'rei_completed'
    | 'contact_form'
    | 'newsletter'
    | 'roi_calculator'
    | 'score_captured'
    | 'lead_capture'
    | 'download'
    | 'email_material';

/**
 * Send an event to GHL via the server-side relay.
 * Never throws - GHL is a non-critical enrichment channel.
 * Returns true if the relay was reached (regardless of GHL response).
 */
export async function sendToGHL(
    eventType: GHLEventType,
    payload: Record<string, unknown>,
): Promise<boolean> {
    try {
        const { error } = await supabase.functions.invoke('ghl-outbound-relay', {
            body: { eventType, payload },
        });

        if (error) {
            console.warn('[ghlRelay] Relay error (non-critical):', error.message);
            return false;
        }

        return true;
    } catch (err: any) {
        // Never propagate GHL failures to the UI - this is CRM enrichment, not core flow
        console.warn('[ghlRelay] Failed to reach relay (non-critical):', err?.message ?? err);
        return false;
    }
}
