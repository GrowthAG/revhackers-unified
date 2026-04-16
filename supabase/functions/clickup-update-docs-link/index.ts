import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const clickupToken = Deno.env.get('CLICKUP_API_TOKEN') || '';

        if (!clickupToken) throw new Error('Missing CLICKUP_API_TOKEN');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Security: Verificacao do usuario logado que esta disparando isso
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Auth token');

        // Extract plan ID
        const { planId } = await req.json();
        if (!planId) throw new Error('Missing planId');

        // Fetch plan and project
        const { data: plan, error: planErr } = await supabase
            .from('strategic_plans')
            .select('access_token, rei_project_id')
            .eq('id', planId)
            .single();

        if (planErr || !plan) throw new Error(`Plan not found: ${planErr?.message}`);

        const { data: project, error: projErr } = await supabase
            .from('rei_projects')
            .select('clickup_docs_task_id')
            .eq('id', plan.rei_project_id)
            .single();

        if (projErr || !project || !project.clickup_docs_task_id) {
            console.log(`No clickup_docs_task_id for project ${plan.rei_project_id}. Skipping.`);
            return new Response(JSON.stringify({ success: true, message: 'No docs task to update' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Construct Docs Link
        const appUrl = Deno.env.get('APP_URL') || 'https://hub.revhackers.com.br';
        const publicDocsLink = `${appUrl}/plan/${plan.access_token}`;

        // Get Task from ClickUp
        const taskRes = await fetch(`https://api.clickup.com/api/v2/task/${project.clickup_docs_task_id}`, {
            headers: {
                'Authorization': clickupToken
            }
        });
        const taskData = await taskRes.json();
        
        let newDescription = taskData.description || '';

        // Replace the placeholder or append
        const placeholderMsg = "Central de Documentação";
        
        const descriptionHeader = `📚 **Portal de Documentação Oficial do Cliente**\nAcesse o Plano Estratégico Aprovado aqui:\n[Link do Portal](${publicDocsLink})\n\n`;
        
        if (newDescription.includes(publicDocsLink)) {
            // Already updated
            return new Response(JSON.stringify({ success: true, message: 'Already updated' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } else {
            newDescription = descriptionHeader + newDescription;
        }

        // Update task
        const updateRes = await fetch(`https://api.clickup.com/api/v2/task/${project.clickup_docs_task_id}`, {
            method: 'PUT',
            headers: {
                'Authorization': clickupToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: newDescription
            })
        });

        if (!updateRes.ok) throw new Error(`ClickUp API Error: ${await updateRes.text()}`);

        // Update idempotency column
        await supabase
            .from('strategic_plans')
            .update({ clickup_docs_updated_at: new Date().toISOString() })
            .eq('id', planId);

        return new Response(JSON.stringify({ success: true, link: publicDocsLink }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
