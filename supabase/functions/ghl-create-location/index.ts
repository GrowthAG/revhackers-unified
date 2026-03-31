// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const reqBody = await req.json();
        const { clientId } = reqBody;

        if (!clientId) {
            return new Response(JSON.stringify({ error: "Missing clientId parameter" }), { status: 400, headers: corsHeaders });
        }

        // Initialize Supabase Admin Client
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

        // 1. Fetch Client Data
        const { data: client, error: clientErr } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (clientErr || !client) {
            return new Response(JSON.stringify({ error: "Client not found in the Hub database." }), { status: 404, headers: corsHeaders });
        }

        // 2. Load the Agency Master Keys from Env
        // @ts-ignore
        const companyId = Deno.env.get('GHL_COMPANY_ID');
        // @ts-ignore
        const agencyApiKey = Deno.env.get('GHL_AGENCY_API_KEY');

        if (!companyId || !agencyApiKey) {
            return new Response(JSON.stringify({ error: "GHL_COMPANY_ID or GHL_AGENCY_API_KEY (V1 or V2 token) is missing in Edge Function Environment. Cannot provision subaccount without Agency Authorization." }), { status: 500, headers: corsHeaders });
        }

        // 3. Prepare Payload for Funnels (GHL) API V2
        // We use the most basic required data to create the skeleton
        const locationPayload = {
            companyId: companyId,
            name: client.trade_name || client.name,
            address: client.address || "",
            city: client.city || "",
            state: client.state || "",
            country: "BR", // Defaulting to Brazil for Hub RevHackers
            postalCode: client.cep ? client.cep.replace(/\D/g, '') : "",
            website: client.website || "",
            timezone: "America/Sao_Paulo",
            firstName: client.name.split(' ')[0],
            lastName: client.name.split(' ').slice(1).join(' ') || "Hub",
            email: client.email,
        };

        // 4. Send POST to Funnels (GHL)
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

        // 5. Connect the Subaccount strictly to the Master Architecture Database ('organizations' table)
        // First check if an organization already exists for this client (unlikely on creation, but safe)
        const { data: existingOrg } = await supabase
            .from('organizations')
            .select('id, settings')
            .eq('name', client.name) // name match
            .single();

        let syncedOrgData = null;

        if (existingOrg) {
            // Update the existing organization with the new Location ID
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
            // Create a brand new Client in the 'organizations' table using the correct Multi-Tenant schema
            const newOrgPayload = {
                name: client.trade_name || client.company || client.name,
                slug: (client.trade_name || client.company || client.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                is_master: false, // It's a client subaccount
                settings: {
                    ghl_location_id: newLocationId,
                    hub_client_id: client.id, // Traceability backwards
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

    } catch (err: any) {
        console.error("GHL Create Location Errored:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
