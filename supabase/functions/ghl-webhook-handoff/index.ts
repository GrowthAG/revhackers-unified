// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * ghl-webhook-handoff
 *
 * Recebe webhooks do GoHighLevel e cria oportunidades no RevHackers Hub.
 *
 * FLUXO REAL:
 *   1. Visitante faz diagnostico no site (score page)
 *   2. Visitante agenda call de diagnostico no calendario GHL
 *   3. GHL dispara webhook para esta function
 *   4. Function cria oportunidade com status='lead' (SEM tasks, SEM sprint)
 *   5. Lead aparece no Deal Rooms (RevenueCockpit)
 *   6. Admin qualifica manualmente quando cliente assina
 *   7. Qualificacao injeta tasks e muda status='active'
 *
 * EVENTOS SUPORTADOS:
 *   - appointment_booked: Agendamento no calendario (cria lead)
 *   - deal_won: Deal ganho no pipeline GHL (qualifica para active)
 *   - contact_created: Contato criado no GHL (cria lead leve)
 *
 * Nao usa JWT porque webhooks GHL sao anonimos.
 * Seguranca: validacao por secret header ou payload structure.
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // ── WEBHOOK SECRET VALIDATION ──────────────────────────────────────
    // GHL deve enviar ?secret=XXXXXX na URL ou header X-Webhook-Secret.
    // Sem isso, qualquer pessoa pode injetar dados falsos no pipeline.
    // @ts-ignore
    const WEBHOOK_SECRET = Deno.env.get('GHL_WEBHOOK_SECRET') || ''
    if (WEBHOOK_SECRET) {
        const url = new URL(req.url)
        const paramSecret = url.searchParams.get('secret') || ''
        const headerSecret = req.headers.get('x-webhook-secret') || ''
        if (paramSecret !== WEBHOOK_SECRET && headerSecret !== WEBHOOK_SECRET) {
            console.error('[ghl-handoff] Rejected: invalid or missing webhook secret')
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
    }

    try {
        const payload = await req.json()

        // Extrair dados do webhook GHL (varios formatos possiveis)
        const contactName = payload.contact_name || payload.full_name || payload.name
            || payload.first_name
            || payload.customData?.contact_name
            || 'Contato GHL'

        const contactEmail = payload.email || payload.contact_email
            || payload.customData?.email
            || null

        const companyName = payload.company_name || payload.company
            || payload.customData?.company_name
            || payload.customData?.company
            || null

        const phone = payload.phone || payload.contact_phone
            || payload.customData?.phone
            || null

        const appointmentDate = payload.appointment_date || payload.selected_slot
            || payload.start_time || payload.customData?.appointment_date
            || null

        const calendarName = payload.calendar_name || payload.calendar
            || payload.customData?.calendar_name
            || null

        const ghlContactId = payload.contact_id || payload.id
            || payload.customData?.contact_id
            || null

        // Tipo de diagnostico - detectado via UTM campaign ou custom field
        // GHL captura UTMs automaticamente do iframe embed
        // utm_campaign=growth|founder|revenue|site|general
        const diagnosticType = payload.utm_campaign
            || payload.utmCampaign
            || payload.customData?.utm_campaign
            || payload.attribution?.utmCampaign
            || payload.diagnostic_type
            || payload.customData?.diagnostic_type
            || payload.custom_fields?.diagnostic_type
            || calendarName
            || null

        // UTM source para confirmar origem (revhackers_hub = veio do nosso site)
        const utmSource = payload.utm_source
            || payload.utmSource
            || payload.customData?.utm_source
            || payload.attribution?.utmSource
            || null

        // Score do diagnostico (se disponivel via custom field)
        const diagnosticScore = payload.diagnostic_score
            || payload.customData?.diagnostic_score
            || payload.custom_fields?.diagnostic_score
            || null

        // Detectar tipo de evento
        const eventType = detectEventType(payload)

        console.log(`[ghl-handoff] Event: ${eventType} | Contact: ${contactName} | Email: ${contactEmail} | Company: ${companyName} | Diagnostic: ${diagnosticType} | Source: ${utmSource}`)

        // ── ANTI-RACE CONDITION (GoHighLevel Double Firing) ────────────────
        // GHL dispara 'contact_created' e 'appointment_booked' no exato mesmo milissegundo.
        // Para evitar que os dois passem pelo SELECT e deem INSERT duplo, atrasamos o contato leve.
        if (eventType === 'contact_created') {
            console.log(`[ghl-handoff] Atrasando contact_created em 2.5s para evitar corrida com agendamentos...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        // ── APPOINTMENT BOOKED: Criar lead ──────────────────────────
        if (eventType === 'appointment_booked' || eventType === 'contact_created') {

            // 1. Verificar se ja existe um projeto para este email (evitar duplicatas)
            if (contactEmail) {
                const { data: existing } = await supabase
                    .from('rei_projects')
                    .select('id, status')
                    .eq('client_email', contactEmail.toLowerCase())
                    .in('status', ['lead', 'active'])
                    .limit(1)
                    .single()

                if (existing) {
                    console.log(`[ghl-handoff] Lead ja existe para ${contactEmail}: ${existing.id} (${existing.status})`)
                    return respond(200, {
                        success: true,
                        action: 'skipped',
                        message: `Lead ja existe com status '${existing.status}'`,
                        project_id: existing.id,
                    })
                }
            }

            // 2. Buscar ou criar cliente
            let clientId = null
            if (contactEmail) {
                const { data: existingClient } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('email', contactEmail.toLowerCase())
                    .limit(1)
                    .single()

                if (existingClient) {
                    clientId = existingClient.id
                } else {
                    const { data: newClient } = await supabase
                        .from('clients')
                        .insert({
                            company: companyName || contactName,
                            name: contactName,
                            email: contactEmail.toLowerCase(),
                            phone: phone,
                            status: 'lead',
                        })
                        .select('id')
                        .single()

                    clientId = newClient?.id || null
                }
            }

            // 3. Criar oportunidade como LEAD (sem tasks, sem sprint)
            // Mapear diagnostic_type para REI type
            const typeMap: Record<string, string> = {
                growth: 'consulting',
                founder: 'founder',
                revenue: 'consulting',
                site: 'dev',
            }
            const reiType = diagnosticType ? (typeMap[diagnosticType.toLowerCase()] || null) : null

            const { data: project, error: projectError } = await supabase
                .from('rei_projects')
                .insert({
                    client_name: contactName,
                    client_email: contactEmail?.toLowerCase() || null,
                    client_company: companyName || null,
                    client_id: clientId,
                    type: reiType,
                    status: 'lead',
                    source: 'ghl',
                    pipeline_stage: 'lead_qualified',
                    lead_source: 'ghl_calendar',
                    analyst_email: 'giulliano@revhackers.com.br',
                    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
                    year: new Date().getFullYear(),
                    next_rei_date: appointmentDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                } as any)
                .select('id')
                .single()

            if (projectError) throw new Error(`Erro ao criar lead: ${projectError.message}`)

            console.log(`[ghl-handoff] Lead criado: ${project.id} | ${contactName} | ${companyName || 'sem empresa'}`)

            // Record pipeline stage history for new lead
            try {
                await supabase
                    .from('pipeline_stage_history')
                    .insert({
                        rei_project_id: project.id,
                        from_stage: null,
                        to_stage: 'lead_qualified',
                        changed_at: new Date().toISOString(),
                        changed_by: 'ghl_webhook',
                        notes: 'Lead created from GHL calendar booking',
                    })
                console.log(`[ghl-handoff] Pipeline stage history recorded: null -> lead_qualified for ${project.id}`)
            } catch (historyErr: any) {
                console.error(`[ghl-handoff] Failed to record pipeline history (non-critical): ${historyErr?.message}`)
            }

            // 4. Auto-enrich em background (CNPJ + PSI) - fire and forget
            supabase.functions.invoke('auto-enrich-project', {
                body: { project_id: project.id }
            }).catch((err: any) => {
                console.warn(`[ghl-handoff] auto-enrich falhou (nao critico): ${err?.message}`)
            })

            return respond(200, {
                success: true,
                action: 'lead_created',
                project_id: project.id,
                client_id: clientId,
                event_type: eventType,
                contact: { name: contactName, email: contactEmail, company: companyName },
            })
        }

        // ── DEAL WON: Qualificar lead existente ──────────────────────
        if (eventType === 'deal_won') {
            if (!contactEmail) {
                return respond(400, { error: 'deal_won requer email para localizar o lead' })
            }

            const { data: lead } = await supabase
                .from('rei_projects')
                .select('id, status, pipeline_stage')
                .eq('client_email', contactEmail.toLowerCase())
                .eq('status', 'lead')
                .limit(1)
                .single()

            if (!lead) {
                console.log(`[ghl-handoff] deal_won mas nenhum lead encontrado para ${contactEmail}. Criando projeto direto.`)

                // Criar direto como active (deal ja foi ganho)
                const { data: project } = await supabase
                    .from('rei_projects')
                    .insert({
                        client_name: contactName,
                        client_email: contactEmail.toLowerCase(),
                        client_company: companyName,
                        status: 'active',
                        source: 'ghl',
                        pipeline_stage: 'won',
                        lead_source: 'ghl_calendar',
                        analyst_email: 'giulliano@revhackers.com.br',
                        quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
                        year: new Date().getFullYear(),
                        next_rei_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    })
                    .select('id')
                    .single()

                if (project?.id) {
                    try {
                        await supabase
                            .from('pipeline_stage_history')
                            .insert({
                                rei_project_id: project.id,
                                from_stage: null,
                                to_stage: 'won',
                                changed_at: new Date().toISOString(),
                                changed_by: 'ghl_webhook',
                                notes: 'Project created directly from GHL deal_won (no prior lead)',
                            })
                    } catch (historyErr: any) {
                        console.error(`[ghl-handoff] Failed to record pipeline history (non-critical): ${historyErr?.message}`)
                    }
                }

                return respond(200, {
                    success: true,
                    action: 'project_created_direct',
                    project_id: project?.id,
                })
            }

            // Qualificar: lead -> active
            const previousStage = lead.pipeline_stage || 'lead_qualified'
            await supabase
                .from('rei_projects')
                .update({ status: 'active', pipeline_stage: 'won' })
                .eq('id', lead.id)

            try {
                await supabase
                    .from('pipeline_stage_history')
                    .insert({
                        rei_project_id: lead.id,
                        from_stage: previousStage,
                        to_stage: 'won',
                        changed_at: new Date().toISOString(),
                        changed_by: 'ghl_webhook',
                        notes: 'Lead qualified to won via GHL deal_won event',
                    })
                console.log(`[ghl-handoff] Pipeline stage history recorded: ${previousStage} -> won for ${lead.id}`)
            } catch (historyErr: any) {
                console.error(`[ghl-handoff] Failed to record pipeline history (non-critical): ${historyErr?.message}`)
            }

            // Injetar tasks via edge function
            supabase.functions.invoke('generate-project-tasks', {
                body: { project_id: lead.id }
            }).catch((err: any) => {
                console.warn(`[ghl-handoff] generate-project-tasks falhou: ${err?.message}`)
            })

            console.log(`[ghl-handoff] Lead ${lead.id} qualificado para active via deal_won`)

            return respond(200, {
                success: true,
                action: 'lead_qualified',
                project_id: lead.id,
            })
        }

        // Evento nao reconhecido - logar e ignorar
        console.log(`[ghl-handoff] Evento ignorado: ${eventType}`, JSON.stringify(payload).substring(0, 500))
        return respond(200, { success: true, action: 'ignored', event_type: eventType })

    } catch (err: any) {
        console.error('[ghl-handoff] Error:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

// ── Helpers ──────────────────────────────────────────────────────

function detectEventType(payload: any): string {
    // GHL envia diferentes campos dependendo do trigger
    if (payload.event_type) return payload.event_type
    if (payload.type) return payload.type

    // Heuristica: se tem appointment_date ou calendar, e agendamento
    if (payload.appointment_date || payload.selected_slot || payload.calendar_name || payload.start_time) {
        return 'appointment_booked'
    }

    // Se tem status won
    if (payload.status === 'won' || payload.pipeline_stage === 'won') {
        return 'deal_won'
    }

    // Se tem contact_id mas nao os outros, e criacao de contato
    if (payload.contact_id || payload.id) {
        return 'contact_created'
    }

    return 'unknown'
}

function respond(status: number, body: any) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Content-Type': 'application/json',
        },
    })
}
