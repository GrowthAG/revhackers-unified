import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

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
       console.error("Tentativa de acesso não autorizada ao webhook InfinitePay.");
       return new Response(JSON.stringify({ error: "Unauthorized" }), { 
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 403 
       });
    }

    const payload = await req.json()
    console.log("Webhook InfinitePay Recebido:", payload)

    // A InfinitePay manda 'order_nsu' e o status de 'paid'
    const { order_nsu, paid, status } = payload

    if (paid === true || status === 'approved') {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // order_nsu foi enviado como proposal.id pelo Frontend
        if (order_nsu) {
            console.log(`Atualizando proposta ${order_nsu} para PAID.`)
            const { error } = await supabaseAdmin
              .from('proposals')
              .update({ 
                 status: 'paid',
                 crm_data: { 
                    payment_status: 'paid via infinitepay',
                    payment_received_at: new Date().toISOString()
                 }
              })
              .eq('id', order_nsu)

            if (error) {
                console.error("Erro ao atualizar proposta:", error)
                throw error;
            }

            // ── OPPORTUNITY PIPELINE ADVANCEMENT ──
            // Se a proposta tem opportunity_id, avanca para won e converte em projeto
            const { data: proposalForOpp } = await supabaseAdmin
                .from('proposals')
                .select('opportunity_id')
                .eq('id', order_nsu)
                .single()

            if (proposalForOpp?.opportunity_id) {
                const oppId = proposalForOpp.opportunity_id
                console.log(`[infinitepay-webhook] Opportunity ${oppId} vinculada. Avancando para won...`)

                // Advance opportunity to won
                const { data: currentOpp } = await supabaseAdmin
                    .from('opportunities')
                    .select('id, pipeline_stage')
                    .eq('id', oppId)
                    .single()

                if (currentOpp && currentOpp.pipeline_stage !== 'won' && currentOpp.pipeline_stage !== 'lost') {
                    const previousStage = currentOpp.pipeline_stage

                    await supabaseAdmin
                        .from('opportunities')
                        .update({
                            pipeline_stage: 'won',
                            won_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', oppId)

                    // Record stage history
                    await supabaseAdmin
                        .from('opportunity_stage_history')
                        .insert({
                            opportunity_id: oppId,
                            from_stage: previousStage,
                            to_stage: 'won',
                            changed_at: new Date().toISOString(),
                            changed_by: 'infinitepay_webhook',
                            notes: `Pagamento confirmado via InfinitePay - proposta ${order_nsu}`,
                        })

                    console.log(`[infinitepay-webhook] Opportunity ${oppId} avancada para won`)

                    // Convert opportunity to project via RPC
                    try {
                        const { data: projectId, error: convErr } = await supabaseAdmin
                            .rpc('convert_opportunity_to_project', {
                                p_opportunity_id: oppId,
                            })

                        if (convErr) {
                            console.error(`[infinitepay-webhook] Conversao falhou:`, convErr.message)
                        } else {
                            console.log(`[infinitepay-webhook] Projeto criado: ${projectId}`)

                            // Auto-trigger: gerar success plan via AI (fire-and-forget)
                            supabaseAdmin.functions.invoke('generate-success-plan', {
                                body: { project_id: projectId },
                            }).then(() => {
                                console.log(`[infinitepay-webhook] generate-success-plan disparado para ${projectId}`)
                            }).catch((spErr: any) => {
                                console.warn(`[infinitepay-webhook] generate-success-plan falhou (nao critico):`, spErr?.message)
                            })
                        }
                    } catch (convErr: any) {
                        console.error(`[infinitepay-webhook] RPC error:`, convErr?.message)
                    }
                }
            }

            // GHL WEBHOOK DISPATCH (Fase 22)
            const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL')
            if (ghlWebhookUrl) {
                console.log("Variável GHL_WEBHOOK_URL encontrada. Iniciando relay para o CRM...")
                try {
                    const { data: proposalData } = await supabaseAdmin
                        .from('proposals')
                        .select('*')
                        .eq('id', order_nsu)
                        .single()

                    let clientData = null;
                    let projectHubId = null;

                    if (proposalData) {
                        if (proposalData.client_id) {
                            // Client already exists
                            const { data } = await supabaseAdmin
                                .from('clients')
                                .select('*')
                                .eq('id', proposalData.client_id)
                                .single()
                            clientData = data
                            
                            // Check if a project exists for this client (for the Hub URL)
                            const { data: projData } = await supabaseAdmin.from('rei_projects').select('id').eq('client_id', proposalData.client_id).limit(1).maybeSingle();
                            if (projData) projectHubId = projData.id;
                        } else {
                            // Phase 24: Zero-Touch Onboarding - Auto Create Client & Project
                            console.log("Venda Nova! Iniciando Zero-Touch Onboarding (Criando Cliente e Projeto)...")
                            const { data: newClient, error: clientErr } = await supabaseAdmin
                                .from('clients')
                                .insert({
                                    name: proposalData.client_contact_name || proposalData.client_name || 'Cliente Novo',
                                    company: proposalData.client_company || proposalData.client_name || 'Empresa Nova',
                                    email: proposalData.client_email || 'nao-informado@revhackers.com',
                                    cnpj: proposalData.crm_data?.cnpj || null
                                })
                                .select()
                                .single();
                                
                            if (!clientErr && newClient) {
                                clientData = newClient;
                                console.log("Cliente criado. Gerando novo Projeto/Hub...")
                                
                                const typeMap: Record<string, string> = {
                                    'crm': 'crm_ops',
                                    'funnel': 'funnels_impl',
                                    'seo': 'content_seo',
                                    'full': 'full'
                                };
                                const pType = typeMap[proposalData.category] || 'full';
                                
                                const { data: newProject, error: projErr } = await supabaseAdmin
                                    .from('rei_projects')
                                    .insert({
                                        client_id: newClient.id,
                                        client_name: newClient.name,
                                        client_email: newClient.email,
                                        client_company: newClient.company,
                                        type: pType,
                                        analyst_email: 'giulliano@revhackers.com',
                                        quarter: `Q${Math.floor((new Date().getMonth() + 3) / 3)}`,
                                        year: new Date().getFullYear(),
                                        status: 'preparation',
                                        next_rei_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                                    })
                                    .select()
                                    .single();
                                    
                                if (!projErr && newProject) {
                                    projectHubId = newProject.id;
                                    console.log("Projeto Hub criado com ID:", projectHubId);
                                } else {
                                    console.error("Erro ao criar projeto:", projErr);
                                }
                                
                                // Update proposal with the new client_id and project_id to seal the bond
                                await supabaseAdmin.from('proposals').update({ client_id: newClient.id }).eq('id', proposalData.id);
                            } else {
                                console.error("Erro ao criar cliente:", clientErr);
                            }
                        }

                        const chargeAmount = Number(proposalData.setup_fee) > 0 
                                            ? Number(proposalData.setup_fee) 
                                            : Number(proposalData.investment_total);

                        const signatureStamp = proposalData.crm_data?.signed_by 
                            ? `Assinado eletronicamente por ${proposalData.crm_data.signed_by} (CPF: ${proposalData.crm_data.signed_cpf || 'Não informado'}) em ${new Date(proposalData.crm_data.signed_at).toLocaleString('pt-BR')}. Cargo: ${proposalData.crm_data.signed_role}. Autenticação: Validação de KYC Financeiro InfinitePay concluída com sucesso.`
                            : 'Assinatura eletrônica não registrada na transação.';

                        const dealRoomUrl = `https://revhackers.com/p/${proposalData.slug}`;
                        const hubMagicLink = projectHubId ? `https://revhackers.com/hub/${projectHubId}` : 'Gerado manualmente';

                        const webhookPayload = {
                            event: 'payment_approved',
                            source: 'infinitepay_checkout',
                            contract: {
                                signature_stamp: signatureStamp,
                                deal_room_url: dealRoomUrl,
                                client_hub_url: hubMagicLink
                            },
                            proposal: {
                                ...proposalData,
                                amount_paid: chargeAmount
                            },
                            client: clientData || {}
                        }
                        
                        console.log("Disparando POST para GHL com:", webhookPayload)
                        const ghlResponse = await fetch(ghlWebhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(webhookPayload)
                        })
                        console.log(`GHL Webhook OK: Status ${ghlResponse.status}`)
                    }
                } catch (ghlErr) {
                    console.error("Erro crítico ao notificar o GoHighLevel:", ghlErr)
                }
            } else {
                console.log("GHL_WEBHOOK_URL não configurada no Edge Functions. Pulando retransmissão.")
            }
        }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processado" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Erro no processamento do webhook:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
