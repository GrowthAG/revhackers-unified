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
        const body = await req.json();
        const { code, redirect_uri } = body;

        if (!code || !redirect_uri) {
             throw new Error("Missing 'code' or 'redirect_uri'");
        }

        // @ts-ignore
        const clientId = Deno.env.get('GHL_CLIENT_ID');
        // @ts-ignore
        const clientSecret = Deno.env.get('GHL_CLIENT_SECRET');

        if (!clientId || !clientSecret) {
            console.error("Missing GHL_CLIENT_ID or GHL_CLIENT_SECRET in Edge Function Env.");
            throw new Error("Agência (Hub Master) não configurou o aplicativo Privado OAuth no Cofre.");
        }

        // 1. Exchange the Authorization Code for Tokens
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirect_uri);

        const ghlResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params.toString()
        });

        if (!ghlResponse.ok) {
            const errorText = await ghlResponse.text();
            console.error("GHL Auth Error:", errorText);
            throw new Error(`Falha no handshake da HighLevel: ${ghlResponse.statusText}`);
        }

        const data = await ghlResponse.json();
        const { access_token, refresh_token, locationId, expires_in, scope } = data;

        if (!locationId) {
             throw new Error("Handshake invalid: did not return a Location ID.");
        }

        // 2. Persist the Tokens in the Supabase "organizations" table
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

        // Find the organization with this ghl_location_id
        const { data: orgs, error: fetchError } = await supabase
            .from('organizations')
            .select('id, settings')
            .eq('status', 'active');

        if (fetchError) throw fetchError;

        const targetOrg = orgs?.find(o => o.settings && o.settings.ghl_location_id === locationId);

        if (!targetOrg) {
             console.warn(`OAuth Success but no organization found configured with locationId: ${locationId}`);
             // Rebotar os tokens pro frontend de qualquer jeito pra quem sabe salvar de fallback
             return new Response(JSON.stringify({ 
                 success: true, 
                 locationId, 
                 access_token, 
                 refresh_token, 
                 scope,
                 message: 'Tokens gerados, mas nenhum cliente criado no Hub contém este Location ID. Você deve configurar a subconta no Hub antes de logar!' 
             }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. Update the Organization settings
        const currentSettings = targetOrg.settings || {};
        currentSettings.access_token = access_token;
        currentSettings.refresh_token = refresh_token;
        currentSettings.auth_updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
            .from('organizations')
            .update({ settings: currentSettings })
            .eq('id', targetOrg.id);

        if (updateError) {
             throw updateError;
        }

        return new Response(JSON.stringify({ 
            success: true, 
            locationId,
            access_token,
            updatedOrgId: targetOrg.id,
            message: 'Handshake concluído com sucesso e gravado no Hub!' 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error("GHL OAuth Callback Errored:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
