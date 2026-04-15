// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticate, requireRoleIn, toErrorResponse } from "../_shared/require-role.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Autorizacao: apenas admin/super_admin podem provisionar subcontas GHL.
        // Operacao consome cota do Agency API e cria recursos compartilhados.
        const auth = await authenticate(req);
        requireRoleIn(auth, ['admin', 'super_admin']);

        const reqBody = await req.json();
        const { clientId } = reqBody;

        if (!clientId) {
            return new Response(JSON.stringify({ error: "Missing clientId parameter" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

        const { data: client, error: clientErr } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (clientErr || !client) {
            return new Response(JSON.stringify({ error: "Client not found in the Hub database." }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // @ts-ignore
        const companyId = Deno.env.get('GHL_COMPANY_ID');
        // @ts-ignore
        const agencyApiKey = Deno.env.get('GHL_AGENCY_API_KEY');

        if (!companyId || !agencyApiKey) {
            return new Response(JSON.stringify({ error: "GHL_COMPANY_ID or GHL_AGENCY_API_KEY missing in Edge Function Environment." }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[GHL-CREATE-LOCATION] caller=${auth.callerId ?? 'service'} role=${auth.callerRole} clientId=${clientId}`);

        const locationPayload = {
            companyId: companyId,
            name: client.trade_name || client.name,
            address: client.address || "",
            city: client.city || "",
            state: client.state || "",
            country: "BR",
            postalCode: client.cep ? client.cep.replace(/\D/g, '') : "",
            website: client.website || "",
            timezone: "America/Sao_Paulo",
            firstName: client.name.split(' ')[0],
            lastName: client.name.split(' ').slice(1).join(' ') || "Hub",
            email: client.email,
        };

        const response = await fetch('https://services.leadconnectorhq.com/locations/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${agencyApiKey}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(locationPayload)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Funnels API Failed: ${errBody}`);
        }

        const funnelsData = await response.json();
        const newLocationId = funnelsData.location?.id;

        if (!newLocationId) {
            throw new Error("API returned success but no Location ID was found.");
        }

        const { data: existingOrg } = await supabase
            .from('organizations')
            .select('id, settings')
            .eq('name', client.name)
            .single();

        let syncedOrgData = null;

        if (existingOrg) {
            const updatedSettings = existingOrg.settings || {};
            updatedSettings.ghl_location_id = newLocationId;

            const { data: updatedOrg, error: orgUpdateErr } = await supabase
                .from('organizations')
                .update({ settings: updatedSettings })
                .eq('id', existingOrg.id)
                .select()
                .single();

            if (orgUpdateErr) throw orgUpdateErr;
            syncedOrgData = updatedOrg;
        } else {
            const newOrgPayload = {
                name: client.trade_name || client.company || client.name,
                slug: (client.trade_name || client.company || client.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                is_master: false,
                settings: {
                    ghl_location_id: newLocationId,
                    hub_client_id: client.id,
                }
            };

            const { data: insertedOrg, error: orgInsertErr } = await supabase
                .from('organizations')
                .insert(newOrgPayload)
                .select()
                .single();

            if (orgInsertErr) throw orgInsertErr;
            syncedOrgData = insertedOrg;
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Subconta provisionada com sucesso!",
            locationId: newLocationId,
            organizationId: syncedOrgData.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err) {
        return toErrorResponse(err, corsHeaders);
    }
});
