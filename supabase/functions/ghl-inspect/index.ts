// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // @ts-ignore
    const API_KEY = Deno.env.get('GHL_AGENCY_API_KEY') || '';
    // @ts-ignore
    const LOC_REVHACKERS = Deno.env.get('GHL_LOCATION_REVHACKERS') || '';
    // @ts-ignore
    const LOC_FUNNELS = Deno.env.get('GHL_LOCATION_FUNNELS') || '';
    // @ts-ignore
    const PIT_FUNNELS = Deno.env.get('GHL_PIT_FUNNELS') || '';

    const results: any = { revhackers: {}, funnels: {} };

    for (const [label, locationId] of [['revhackers', LOC_REVHACKERS], ['funnels', LOC_FUNNELS]]) {
        if (!locationId) {
            results[label] = { error: `Location ID nao configurado (GHL_LOCATION_${label.toUpperCase()})` };
            continue;
        }

        const token = label === 'funnels' && PIT_FUNNELS ? PIT_FUNNELS : API_KEY;

        try {
            const pipelinesRes = await fetch(
                `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${locationId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-07-28', 'Accept': 'application/json' },
                }
            );

            let pipelines: any[] = [];
            if (pipelinesRes.ok) {
                const data = await pipelinesRes.json();
                pipelines = (data.pipelines || []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    stages: (p.stages || []).map((s: any) => ({ id: s.id, name: s.name, position: s.position })),
                }));
            } else {
                pipelines = [{ error: `${pipelinesRes.status}: ${await pipelinesRes.text()}` }];
            }

            const fieldsRes = await fetch(
                `https://services.leadconnectorhq.com/locations/${locationId}/customFields`,
                {
                    headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-07-28', 'Accept': 'application/json' },
                }
            );

            let customFields: any[] = [];
            if (fieldsRes.ok) {
                const data = await fieldsRes.json();
                customFields = (data.customFields || []).map((f: any) => ({
                    id: f.id, name: f.name, fieldKey: f.fieldKey, dataType: f.dataType,
                }));
            } else {
                customFields = [{ error: `${fieldsRes.status}: ${await fieldsRes.text()}` }];
            }

            results[label] = { locationId, pipelines, customFields };
        } catch (err: any) {
            results[label] = { error: err.message };
        }
    }

    return new Response(JSON.stringify(results, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });
});
