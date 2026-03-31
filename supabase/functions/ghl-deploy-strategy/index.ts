// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req: Request) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const reqBody = await req.json();
        const { projectId } = reqBody;

        if (!projectId) {
            return new Response(JSON.stringify({ error: "Missing projectId parameter" }), { status: 400, headers: corsHeaders });
        }

        // Initialize Supabase Admin Client
        // @ts-ignore
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

        // 1. Load the Project & Strategic Plan
        const { data: project, error: projErr } = await supabase
            .from('rei_projects')
            .select('client_id, name')
            .eq('id', projectId)
            .single();

        if (projErr || !project) {
            throw new Error("Project not found.");
        }

        const clientId = project.client_id;
        
        const { data: planArray, error: planErr } = await supabase
            .from('strategic_plans')
            .select('personas_data, okrs')
            .eq('rei_project_id', projectId)
            .eq('status', 'approved') // Only deploy approved plans
            .order('generated_at', { ascending: false })
            .limit(1);

        if (planErr || !planArray || planArray.length === 0) {
            throw new Error("Não foi possível encontrar um Plano Estratégico Aprovado para este projeto.");
        }

        const plan = planArray[0];

        // 2. Load the Organization (Multi-Tenant mapping) to find Oauth Token
        const { data: orgs, error: orgErr } = await supabase
            .from('organizations')
            .select('id, settings')
            .contains('settings', { hub_client_id: clientId });

        if (orgErr || !orgs || orgs.length === 0) {
            throw new Error("Este cliente não possui uma subconta vinculada e ativada no motor Cloud da Funnels. Por favor, provisione a subconta primeiro.");
        }

        const org = orgs[0];
        const ghlLocationId = org.settings?.ghl_location_id;
        const ghlAccessToken = org.settings?.access_token;

        if (!ghlLocationId) {
            throw new Error("Subconta da Funnels (Location ID) não encontrada nas configurações da organização.");
        }

        // 3. Prepare the Variables (Custom Values Payload)
        // We map the personas and OKRs into flat strings for GHL injection
        const customValuesToInject: { name: string, value: string }[] = [];

        if (plan.personas_data && plan.personas_data.length > 0) {
            const masterPersona = plan.personas_data[0];
            customValuesToInject.push({ name: "Hub Persona Name", value: masterPersona.nome || "Não Definido" });
            customValuesToInject.push({ name: "Hub Persona Cargo", value: masterPersona.cargo || "Não Definido" });
            if (masterPersona.desafios && masterPersona.desafios.length > 0) {
                customValuesToInject.push({ name: "Hub Persona Dor Principal", value: masterPersona.desafios[0] });
            }
        }

        if (plan.okrs && plan.okrs.length > 0) {
            customValuesToInject.push({ name: "Hub OKR Principal", value: plan.okrs[0].objective || "Não Definido" });
        }

        customValuesToInject.push({ name: "Hub Status de Projeto", value: "Ativado via Deploy V2" });

        if (customValuesToInject.length === 0) {
            throw new Error("O plano estratégico aprovado está em branco nas variáveis cruciais (Personas/OKRs).");
        }

        // 4. API Logic: To avoid 409 Conflicts, we must GET existing custom values first
        // @ts-ignore
        const fallbackKey = Deno.env.get('GHL_AGENCY_API_KEY');
        const apiHeaders = {
            'Authorization': ghlAccessToken ? `Bearer ${ghlAccessToken}` : `Bearer ${fallbackKey}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const getCvResponse = await fetch(`https://services.leadconnectorhq.com/locations/${ghlLocationId}/customValues`, {
            method: 'GET',
            headers: apiHeaders
        });

        if (!getCvResponse.ok) {
            const errBody = await getCvResponse.text();
            throw new Error(`Falha ao ler variáveis da Subconta: ${errBody} (Token expirado ou permissões insuficientes)`);
        }

        const existingCvData = await getCvResponse.json();
        const existingValuesList: { id: string, name: string }[] = existingCvData.customValues || [];
        
        // Cria um mapa para busca rápida: Mapeia Nome -> ID
        const existingValuesMap = new Map<string, string>();
        existingValuesList.forEach(cv => {
            existingValuesMap.set(cv.name, cv.id);
        });

        // 5. Inject Sequence (POST/PUT Custom Values) with Sleep
        let successCount = 0;
        let errorCount = 0;

        for (const item of customValuesToInject) {
            const existingId = existingValuesMap.get(item.name);

            try {
                if (existingId) {
                    // Update existing
                    await fetch(`https://services.leadconnectorhq.com/locations/${ghlLocationId}/customValues/${existingId}`, {
                        method: 'PUT',
                        headers: apiHeaders,
                        body: JSON.stringify({ name: item.name, value: item.value })
                    });
                } else {
                    // Create new
                    await fetch(`https://services.leadconnectorhq.com/locations/${ghlLocationId}/customValues`, {
                        method: 'POST',
                        headers: apiHeaders,
                        body: JSON.stringify({ name: item.name, value: item.value })
                    });
                }
                successCount++;
            } catch (injectionErr) {
                console.error(`Error injecting ${item.name}:`, injectionErr);
                errorCount++;
            }

            // Sleep 350ms to obey Funnels' strict rate limits
            await sleep(350);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Deploy Concluído. ${successCount} Variáveis sincronizadas.`,
            stats: { success: successCount, failed: errorCount }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error("GHL Deploy Strategy Errored:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
