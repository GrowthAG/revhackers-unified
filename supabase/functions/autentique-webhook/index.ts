import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const secretKey = Deno.env.get('WEBHOOK_SECRET_KEY');
    const providedSecret = req.headers.get('x-webhook-secret');

    // Autenticação Zero-Trust: Ninguém toca nesse endpoint sem o Secret.
    if (!secretKey || providedSecret !== secretKey) {
       console.error("Tentativa de acesso não autorizada ao webhook Autentique.");
       return new Response(JSON.stringify({ error: "Unauthorized" }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 403 
       });
    }

    const payload = await req.json()
    console.log('Autentique Webhook received:', JSON.stringify(payload))

    // Autentique payload structure check (document.id or raw id)
    // Sometimes it's inside `document`, sometimes at root. Let's gracefully extract.
    const documentId = payload?.document?.id || payload?.id;

    if (!documentId) {
       console.log('No document ID found in payload, ignoring.');
       return new Response(JSON.stringify({ status: 'ignored', reason: 'no_document_id' }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200 
       });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the project that has this autentique_document_id in opportunity_data
    const { data: projects, error: fetchError } = await supabaseAdmin
      .from('rei_projects')
      .select('id, opportunity_data')
      .contains('opportunity_data', { autentique_document_id: documentId });

    if (fetchError || !projects || projects.length === 0) {
      console.error('Project with document ID not found:', documentId);
      return new Response(JSON.stringify({ status: 'ignored', reason: 'project_not_found' }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200 
      });
    }

    const project = projects[0];

    // Check if it's already marked as signed
    if (project.opportunity_data?.kickoff_signed) {
        return new Response(JSON.stringify({ status: 'ignored', reason: 'already_signed' }), { 
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200 
        });
    }

    // Update the project to set kickoff_signed = true
    const updatedOpportunityData = {
        ...project.opportunity_data,
        kickoff_signed: true,
        kickoff_signed_at: new Date().toISOString()
    };

    const { error: updateError } = await supabaseAdmin
      .from('rei_projects')
      .update({ opportunity_data: updatedOpportunityData })
      .eq('id', project.id);

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw updateError;
    }

    console.log(`Successfully marked project ${project.id} as kickoff_signed for document ${documentId}`);

    return new Response(JSON.stringify({ status: 'success', project_id: project.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
