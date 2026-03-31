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
        // @ts-ignore
        const clientId = Deno.env.get('GHL_CLIENT_ID');
        // @ts-ignore
        const clientSecret = Deno.env.get('GHL_CLIENT_SECRET');

        if (!clientId || !clientSecret) {
            console.error("Missing GHL_CLIENT_ID or GHL_CLIENT_SECRET in Edge Function Env.");
            return new Response(JSON.stringify({ error: "GHL_CLIENT_ID ou GHL_CLIENT_SECRET ausentes no cofre." }), { status: 500, headers: corsHeaders });
        }

        // Initialize Supabase Admin Client
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

        // 1. Fetch all Active Organizations that have a refresh_token
        // Supabase select with JSONB is tricky to filter strictly, so we fetch all actives and filter in memory since agencies rarely exceed 500 active clients.
        const { data: orgs, error: fetchError } = await supabase
            .from('organizations')
            .select('id, name, settings')
            .eq('status', 'active');

        if (fetchError) throw fetchError;

        const refreshableOrgs = orgs?.filter(org => org.settings && org.settings.refresh_token) || [];

        if (refreshableOrgs.length === 0) {
            return new Response(JSON.stringify({ message: "Nenhuma organização ativa com refresh_token encontrada para atualizar." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const results = [];

        // 2. Refresh each token sequentially to avoid aggressive rate-limits
        for (const org of refreshableOrgs) {
            const currentToken = org.settings.refresh_token;

            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', currentToken);

            try {
                const ghlResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: params.toString()
                });

                if (!ghlResponse.ok) {
                    const errText = await ghlResponse.text();
                    console.error(`Falha no Refresh da Org ${org.name} (${org.id}):`, errText);
                    results.push({ orgId: org.id, name: org.name, status: 'failed', error: errText });
                    continue; // Pule para o próximo cliente, não pare o loop.
                }

                const data = await ghlResponse.json();
                const { access_token, refresh_token: new_refresh_token } = data;

                // 3. Update the database for this specific org
                const currentSettings = org.settings || {};
                currentSettings.access_token = access_token;
                
                // Sempre salve o novo refresh_token, pois a GHL emite um novo a cada refresh
                if (new_refresh_token) {
                    currentSettings.refresh_token = new_refresh_token;
                }
                
                currentSettings.auth_updated_at = new Date().toISOString();

                const { error: updateError } = await supabase
                    .from('organizations')
                    .update({ settings: currentSettings })
                    .eq('id', org.id);

                if (updateError) {
                    console.error(`Erro salvando token no Banco para Org ${org.name}:`, updateError);
                    results.push({ orgId: org.id, name: org.name, status: 'failed', error: 'Db update failed: ' + updateError.message });
                } else {
                    results.push({ orgId: org.id, name: org.name, status: 'success' });
                }

                // Sleep de 100ms para poupar a rede (Rate Limit protection)
                await new Promise(r => setTimeout(r, 100));

            } catch (networkErr: any) {
                 console.error(`Erro de rede no Refresh da Org ${org.name}:`, networkErr);
                 results.push({ orgId: org.id, name: org.name, status: 'failed', error: networkErr.message });
            }
        }

        const successful = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        return new Response(JSON.stringify({ 
            message: `Refresh operation completed. ${successful} sucedidos, ${failed} falhos.`,
            results
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error("GHL OAuth Refresh Errored:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
