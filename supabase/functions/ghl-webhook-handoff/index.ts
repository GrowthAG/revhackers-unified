// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Supabase Edge Function: GHL Inbound Handoff
// Listens to GoHighLevel "Deal Won" Webhook -> Creates Client -> Creates REI Project -> Creates Sprint 01 -> Creates Onboarding Tasks.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Define exact CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS options preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse GHL Webhook JSON Body
    const payload = await req.json()
    
    // Extracted Fields from GHL Standard Opportunity/Workflow Webhook
    const companyName = payload.company_name || payload.customData?.company_name || 'Agência Cliente GHL';
    const clientEmail = payload.email || payload.customData?.email || 'admin@client.com';
    const projectName = payload.opportunity_name || payload.customData?.project_name || `Projeto de Growth - ${companyName}`;
    
    // Only proceed if it's actually won or if triggered via specific workflow
    if (payload.status !== 'won' && !payload.force_handoff) {
      return new Response(JSON.stringify({ message: "Ignored: Deal is not WON" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 3. Initialize Supabase Admin Client
    // We MUST use the SERVICE_ROLE key because unauthenticated webhooks hit RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`[ghl-webhook-handoff] Inbound handoff started for: ${companyName}`);

    // 4. Create or Find Client
    let clientId;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', clientEmail)
      .limit(1)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          company: companyName,
          email: clientEmail,
          status: 'active'
        })
        .select()
        .single();
        
      if (clientError) throw new Error(`Client Error: ${clientError.message}`);
      clientId = newClient.id;
    }

    // 5. Create the REI Project
    const { data: newProject, error: projectError } = await supabase
      .from('rei_projects')
      .insert({
        title: projectName,
        client_id: clientId,
        status: 'prospect', // Or 'active' depending on pipeline
        objective: 'Criado magicamente via GHL Handoff Edge Function'
      })
      .select()
      .single();

    if (projectError) throw new Error(`Project Error: ${projectError.message}`);
    const projectId = newProject.id;

    // 6. Create Orqflow Sprint 01
    const { data: sprint, error: sprintError } = await supabase
      .from('orqflow_sprints')
      .insert({
        project_id: projectId,
        name: 'Sprint 01: Onboarding e Setup Clínico',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      })
      .select()
      .single();
      
    if (sprintError) throw new Error(`Sprint Error: ${sprintError.message}`);

    // 7. Inject Default Onboarding Tasks (The click-up magic)
    const onboardingTasks = [
      {
        project_id: projectId,
        sprint_id: sprint.id,
        title: 'Kickoff Call',
        status: 'todo',
        priority: 'urgent',
        content: { "type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Call inicial para alinhamento estratégico."}]}] }
      },
      {
        project_id: projectId,
        sprint_id: sprint.id,
        title: 'Conectar Google Ads e Meta Business',
        status: 'todo',
        priority: 'high',
        content: { "type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Revisar permissões concedidas."}]}] }
      },
      {
        project_id: projectId,
        sprint_id: sprint.id,
        title: 'Preenchimento do Briefing Raio-X',
        status: 'doing',
        priority: 'medium',
        content: { "type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Cliente está preenchendo as respostas."}]}] }
      }
    ];

    const { error: tasksError } = await supabase
      .from('orqflow_tasks')
      .insert(onboardingTasks);
      
    if (tasksError) throw new Error(`Tasks Error: ${tasksError.message}`);

    console.log(`[ghl-webhook-handoff] Handoff completed, orqflow environment set up for: ${projectId}`);

    // 8. Return Success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Handoff to Orqflow completed successfully.",
        project_id: projectId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[ghl-webhook-handoff] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
