// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * ghl-webhook-handoff
 *
 * Recebe webhooks do GoHighLevel e cria oportunidades no RevHackers Hub.
 *
 * FLUXO:
 *   1. Visitante agenda call no calendario GHL
 *   2. GHL dispara webhook para esta function
 *   3. Function cria OPPORTUNITY com pipeline_stage='lead_qualified'
 *   4. Lead aparece no RevenueCockpit (secao Diagnostico)
 *   5. Admin trabalha o lead no War Room
 *   6. Quando deal fecha, convert_opportunity_to_project cria o projeto
 *
 * EVENTOS:
 *   - appointment_booked: Agendamento (cria opportunity)
 *   - deal_won: Deal ganho (avanca opportunity para won + cria projeto)
 *   - contact_created: Contato criado (cria opportunity leve)
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

    // -- WEBHOOK SECRET VALIDATION (OBRIGATORIO, apenas via header) --
    // @ts-ignore
    const WEBHOOK_SECRET = Deno.env.get('GHL_WEBHOOK_SECRET') || ''
    if (!WEBHOOK_SECRET) {
        console.error('[ghl-handoff] GHL_WEBHOOK_SECRET nao configurado. Rejeitando.')
        return new Response(JSON.stringify({ error: 'Webhook secret nao configurado' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
    const headerSecret = req.headers.get('x-webhook-secret') || ''
    if (headerSecret !== WEBHOOK_SECRET) {
        console.error('[ghl-handoff] Rejected: invalid or missing webhook secret')
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    try {
        const payload = await req.json()

        // Extrair dados do webhook GHL
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

        const calendarName = payload.calendar_name || payload.calendar
            || payload.customData?.calendar_name
            || null

        const ghlContactId = payload.contact_id || payload.id
            || payload.customData?.contact_id
            || null

        // Location ID (identifica a subconta GHL - multi-tenant)
        const locationId = payload.location_id || payload.locationId
            || payload.location?.id
            || payload.customData?.location_id
            || null

        // Tipo de diagnostico via UTM
        const diagnosticType = payload.utm_campaign
            || payload.utmCampaign
            || payload.customData?.utm_campaign
            || payload.attribution?.utmCampaign
            || payload.diagnostic_type
            || payload.customData?.diagnostic_type
            || payload.custom_fields?.diagnostic_type
            || calendarName
            || null

        const eventType = detectEventType(payload)

        // ── Extração financeira (auditado + campos criados via API GHL 15/04/2026) ──
        //
        // RevHackers (oFTw9DcsKRUj6xCiq4mb):
        //   opportunity.mrr               (MONETORY)  ID: SLNVPTeKbwQmTK2nLhOY
        //   opportunity.durao_meses       (NUMERICAL) ID: 2G4di6h3xv8SnYhepnIv
        //   opportunity.hub_project_id    (TEXT)       ID: oZv5ftBubon8Nmn6fWQr  ← NOVO
        //   opportunity.contract_start_date (DATE)     ID: 2dr9wzTRQYHmMLrRxJK2  ← NOVO
        //   opportunity.renewal_date      (DATE)       ID: tZTKTbFePJysocWaz50O  ← NOVO
        //
        // Funnels (S7HEFAz97UKuC8NLHMmI):
        //   opportunity.mrr               (MONETORY)  ID: sfoqdLRZqLWvE8fLmVPJ  ← NOVO
        //   opportunity.contract_duration_months (NUM) ID: iuuumGsW7LqLotA5rALE  ← NOVO
        //   opportunity.hub_project_id    (TEXT)       ID: CMcraKg2YezLWNJJ6M0y  ← NOVO
        //   opportunity.data_de_incio_do_contrato (DATE) — já existia

        // Helper: extrair valor de custom field por ID do array do GHL
        const getOppCustomField = (fieldId: string): number | string | null => {
            const cf = payload.customFields ?? payload.custom_fields ?? []
            const found = cf.find((f: Record<string, unknown>) => f.id === fieldId)
            if (!found) return null
            return found.fieldValueNumber ?? found.fieldValueString ?? found.value ?? null
        }

        // MRR: busca por ID em ambas subcontas
        const mrr = Number(
            getOppCustomField('SLNVPTeKbwQmTK2nLhOY')  // RevHackers
            ?? getOppCustomField('sfoqdLRZqLWvE8fLmVPJ')  // Funnels
            ?? payload.customData?.mrr
            ?? payload.mrr
            ?? 0
        ) || null

        // Duração do contrato em meses
        const contractMonths = Number(
            getOppCustomField('2G4di6h3xv8SnYhepnIv')  // RevHackers
            ?? getOppCustomField('iuuumGsW7LqLotA5rALE')  // Funnels
            ?? payload.customData?.contract_duration_months
            ?? payload.customData?.contract_months
            ?? 0
        ) || null

        // Valor total do deal (campo nativo GHL = monetaryValue)
        const dealValue = Number(
            payload.monetaryValue
            ?? payload.monetary_value
            ?? payload.value
            ?? payload.customData?.value
            ?? 0
        ) || null

        // TCV: se temos mrr E meses, calcula; senão usa o monetaryValue direto
        const tcv = mrr && contractMonths ? (mrr * contractMonths) : dealValue

        // Datas de contrato (para client_accounts)
        const contractStartDate = (
            getOppCustomField('2dr9wzTRQYHmMLrRxJK2')  // RevHackers: contract_start_date
            ?? getOppCustomField('bY1bxgElioieDZlds7fu')  // Funnels: data_de_incio_do_contrato
            ?? payload.customData?.contract_start_date
            ?? null
        ) as string | null
        const renewalDate = (
            getOppCustomField('tZTKTbFePJysocWaz50O')  // RevHackers: renewal_date
            ?? getOppCustomField('lfr3qQ5GIyHY6OTPn0mB')  // Funnels: data_de_renovao
            ?? payload.customData?.renewal_date
            ?? null
        ) as string | null

        // Web Crypto API signature mapping
        // MODULO 1: Deterministic Idempotency Key (Remove volatile timestamp to prevent duplicate firing on webhook retries)
        const idempotencyKeyRaw = `${eventType}|${ghlContactId ?? contactEmail}|${payload.opportunity_id ?? payload.deal_id ?? ''}|deterministic`
        const msgUint8 = new TextEncoder().encode(idempotencyKeyRaw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const idempotencyKey = `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`

        let financialMissing = false;
        if (eventType === 'deal_won' && !mrr && !contractMonths && !dealValue) {
            financialMissing = true;
            console.warn(`[ghl-handoff] AVISO: Deal Won sem dados financeiros (MRR/TCV) no payload para ${contactEmail}`);
        }

        const typeMap: Record<string, string> = {
            growth: 'consulting',
            founder: 'linkedin',
            revenue: 'consulting',
            site: 'dev',
        }
        const reiType = diagnosticType ? (typeMap[diagnosticType.toLowerCase()] || 'consulting') : 'consulting'

        console.log(`[ghl-handoff] Event: ${eventType} | Contact: ${contactName} | Email: ${contactEmail} | Company: ${companyName} | Location: ${locationId}`)

        // -- MULTI-TENANT: Resolver organization via GHL location_id --
        let organizationId: string | null = null
        if (locationId) {
            const { data: org } = await supabase
                .from('organizations')
                .select('id, name')
                .eq('settings->>ghl_location_id', locationId)
                .limit(1)
                .single()

            if (org) {
                organizationId = org.id
                console.log(`[ghl-handoff] Matched org: ${org.name} (${org.id}) via location ${locationId}`)
            } else {
                console.warn(`[ghl-handoff] No org found for location_id ${locationId}. Opportunity will be created without org.`)
            }
        }

        // -- ANTI-RACE (GHL Double Firing) --
        if (eventType === 'contact_created') {
            console.log(`[ghl-handoff] Atrasando contact_created em 2.5s para evitar corrida...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        // -- APPOINTMENT BOOKED / CONTACT CREATED: Criar opportunity --
        if (eventType === 'appointment_booked' || eventType === 'contact_created') {

            // 1. Verificar se ja existe opportunity para este email
            if (contactEmail) {
                const { data: existing } = await supabase
                    .from('opportunities')
                    .select('id, pipeline_stage')
                    .eq('client_email', contactEmail.toLowerCase())
                    .not('pipeline_stage', 'eq', 'lost')
                    .limit(1)
                    .single()

                if (existing) {
                    console.log(`[ghl-handoff] Opportunity ja existe para ${contactEmail}: ${existing.id} (${existing.pipeline_stage})`)
                    return respond(200, {
                        success: true,
                        action: 'skipped',
                        message: `Opportunity ja existe com stage '${existing.pipeline_stage}'`,
                        opportunity_id: existing.id,
                    })
                }
            }

            // 2. Criar opportunity (entidade de venda)
            const { data: opportunity, error: oppError } = await supabase
                .from('opportunities')
                .insert({
                    client_name: contactName,
                    client_email: contactEmail?.toLowerCase() || null,
                    client_company: companyName || null,
                    type: reiType,
                    source: 'ghl',
                    pipeline_stage: 'lead_qualified',
                    lead_source: 'ghl_calendar',
                    analyst_email: 'giulliano@revhackers.com.br',
                    organization_id: organizationId,
                    mrr: mrr,
                    tcv: tcv,
                    contract_duration_months: contractMonths,
                    opportunity_data: {
                        ghl_contact_id: ghlContactId,
                        ghl_location_id: locationId,
                        phone: phone,
                        calendar_name: calendarName,
                        diagnostic_type: diagnosticType,
                        financial_missing: financialMissing
                    },
                })
                .select('id')
                .single()

            if (oppError) throw new Error(`Erro ao criar opportunity: ${oppError.message}`)

            console.log(`[ghl-handoff] Opportunity criada: ${opportunity.id} | ${contactName}`)

            // 4. Registrar historico
            try {
                await supabase
                    .from('opportunity_stage_history')
                    .insert({
                        opportunity_id: opportunity.id,
                        from_stage: null,
                        to_stage: 'lead_qualified',
                        changed_at: new Date().toISOString(),
                        changed_by: 'ghl_webhook',
                        notes: `Lead criado via GHL ${eventType}`,
                    })
            } catch (historyErr: any) {
                console.error(`[ghl-handoff] History error (nao critico): ${historyErr?.message}`)
            }

            // 5. Auto-enrich em background
            supabase.functions.invoke('auto-enrich-project', {
                body: { opportunity_id: opportunity.id }
            }).catch((err: any) => {
                console.warn(`[ghl-handoff] auto-enrich falhou (nao critico): ${err?.message}`)
            })

            return respond(200, {
                success: true,
                action: 'opportunity_created',
                opportunity_id: opportunity.id,
                event_type: eventType,
                contact: { name: contactName, email: contactEmail, company: companyName },
            })
        }

        // -- DEAL WON: Converter opportunity em projeto --
        if (eventType === 'deal_won') {
            if (!contactEmail) {
                return respond(400, { error: 'deal_won requer email para localizar a opportunity' })
            }

            const { data: opp } = await supabase
                .from('opportunities')
                .select('id, pipeline_stage')
                .eq('client_email', contactEmail.toLowerCase())
                .not('pipeline_stage', 'in', '("won","lost")')
                .limit(1)
                .single()

            if (!opp) {
                console.log(`[ghl-handoff] deal_won sem opportunity para ${contactEmail}. Criando opportunity + projeto.`)

                // Criar opportunity ja como won
                const { data: newOpp } = await supabase
                    .from('opportunities')
                    .insert({
                        client_name: contactName,
                        client_email: contactEmail.toLowerCase(),
                        client_company: companyName,
                        type: 'consulting',
                        source: 'ghl',
                        pipeline_stage: 'won',
                        lead_source: 'ghl_calendar',
                        analyst_email: 'giulliano@revhackers.com.br',
                        organization_id: organizationId,
                        mrr: mrr,
                        tcv: tcv,
                        contract_duration_months: contractMonths,
                        won_at: new Date().toISOString(),
                        opportunity_data: {
                            financial_missing: financialMissing
                        }
                    })
                    .select('id')
                    .single()

                if (newOpp) {
                    // Converter atomicamente em projeto (v2: idempotente + sprints)
                    const { data: convResult, error: rpcErr } = await supabase.rpc('convert_opportunity_to_project_v2', {
                        p_opportunity_id: newOpp.id,
                        p_analyst_email: 'giulliano@revhackers.com',
                        p_idempotency_key: idempotencyKey,
                        p_mrr: mrr,
                        p_tcv: tcv,
                        p_contract_months: contractMonths
                    })

                    if (rpcErr) {
                        console.error(`[ghl-handoff] RPC failed for new opp: ${rpcErr.message}`)
                    }
                    
                    if (convResult?.already_processed) {
                        console.log(`[ghl-handoff] Idempotency hit: Already processed project ${convResult.project_id}`)
                        return respond(200, { success: true, action: 'skipped', message: 'idempotent' })
                    }

                    const projectId = convResult?.project_id || null

                    // Upsert client_accounts (visao unificada RevHackers + Funnels)
                    // Roteia contact_id pelo location de origem
                    const isFunnels = locationId === 'S7HEFAz97UKuC8NLHMmI'
                    if (contactEmail) {
                        const { error: caErr } = await supabase
                            .from('client_accounts' as any)
                            .upsert({
                                client_email: contactEmail.toLowerCase(),
                                client_name: contactName,
                                client_company: companyName || null,
                                ...(isFunnels
                                    ? { funnels_contact_id: ghlContactId, funnels_opportunity_id: newOpp.id }
                                    : { revhackers_contact_id: ghlContactId, revhackers_opportunity_id: newOpp.id }),
                                has_consulting: reiType === 'consulting',
                                has_software: reiType !== 'consulting',
                                consulting_value: reiType === 'consulting' ? tcv : 0,
                                software_value: reiType === 'consulting' ? 0 : tcv,
                                consulting_mrr: reiType === 'consulting' ? mrr : 0,
                                software_mrr: reiType === 'consulting' ? 0 : mrr,
                                consulting_status: reiType === 'consulting' ? 'active' : null,
                                consulting_start_date: reiType === 'consulting' ? (contractStartDate || new Date().toISOString()) : null,
                                software_activation_date: reiType !== 'consulting' ? (contractStartDate || new Date().toISOString()) : null,
                                software_renewal_date: reiType !== 'consulting' ? renewalDate : null,
                            }, { onConflict: 'client_email' })
                        if (caErr) console.error('[ghl-handoff] client_accounts upsert FALHOU:', caErr.message)
                        else console.log('[ghl-handoff] client_accounts upserted com sucesso para', contactEmail)
                    }

                    // Auto-trigger: gerar success plan via AI (fire-and-forget)
                    if (projectId) {
                        supabase.functions.invoke('generate-success-plan', {
                            body: { project_id: projectId },
                        }).catch((spErr: any) => {
                            console.warn(`[ghl-handoff] generate-success-plan falhou (nao critico):`, spErr?.message)
                        })

                        // Write-back: gravar hub_project_id na opportunity do GHL
                        writeBackHubProjectId(locationId, payload.opportunity_id || payload.deal_id, projectId)
                            .catch((wbErr: any) => console.warn(`[ghl-handoff] write-back falhou (nao critico):`, wbErr?.message))
                    }

                    return respond(200, {
                        success: true,
                        action: 'opportunity_and_project_created',
                        opportunity_id: newOpp.id,
                        project_id: projectId,
                    })
                }


                return respond(200, { success: true, action: 'deal_won_no_opportunity' })
            }

            // Avancar opportunity para won
            const previousStage = opp.pipeline_stage
            await supabase
                .from('opportunities')
                .update({
                    pipeline_stage: 'won',
                    won_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', opp.id)

            // Registrar historico
            try {
                await supabase
                    .from('opportunity_stage_history')
                    .insert({
                        opportunity_id: opp.id,
                        from_stage: previousStage,
                        to_stage: 'won',
                        changed_at: new Date().toISOString(),
                        changed_by: 'ghl_webhook',
                        notes: 'Deal won via GHL webhook',
                    })
            } catch (historyErr: any) {
                console.error(`[ghl-handoff] History error: ${historyErr?.message}`)
            }

            // Converter em projeto via RPC v2 (idempotente + sprints automaticos)
            let projectId = null
            try {
                const { data: result, error: rpcError } = await supabase.rpc('convert_opportunity_to_project_v2', {
                    p_opportunity_id: opp.id,
                    p_analyst_email: 'giulliano@revhackers.com',
                    p_idempotency_key: idempotencyKey,
                    p_mrr: mrr,
                    p_tcv: tcv,
                    p_contract_months: contractMonths
                })
                if (rpcError) {
                    console.error(`[ghl-handoff] RPC convert_opportunity_to_project_v2 falhou: ${rpcError.message}`)
                } else if (result?.already_processed) {
                    console.log(`[ghl-handoff] Idempotency hit: Already processed project ${result.project_id}`)
                    return respond(200, { success: true, action: 'skipped', message: 'idempotent' })
                } else {
                    projectId = result?.project_id || null
                    console.log(`[ghl-handoff] Opportunity ${opp.id} convertida em projeto ${projectId} (sprints: ${result?.sprints_created || 0})`)
                }

                // Upsert client_accounts (awaited — crítico para observabilidade)
                const isFunnelsOpp = locationId === 'S7HEFAz97UKuC8NLHMmI'
                if (contactEmail) {
                    const { error: caErr } = await supabase
                        .from('client_accounts' as any)
                        .upsert({
                            client_email: contactEmail.toLowerCase(),
                            client_name: contactName,
                            client_company: companyName || null,
                            ...(isFunnelsOpp
                                ? { funnels_contact_id: ghlContactId, funnels_opportunity_id: opp.id }
                                : { revhackers_contact_id: ghlContactId, revhackers_opportunity_id: opp.id }),
                            has_consulting: reiType === 'consulting',
                            has_software: reiType !== 'consulting',
                            consulting_value: reiType === 'consulting' ? tcv : 0,
                            software_value: reiType === 'consulting' ? 0 : tcv,
                            consulting_mrr: reiType === 'consulting' ? mrr : 0,
                            software_mrr: reiType === 'consulting' ? 0 : mrr,
                            consulting_status: reiType === 'consulting' ? 'active' : null,
                            consulting_start_date: reiType === 'consulting' ? (contractStartDate || new Date().toISOString()) : null,
                            software_activation_date: reiType !== 'consulting' ? (contractStartDate || new Date().toISOString()) : null,
                            software_renewal_date: reiType !== 'consulting' ? renewalDate : null,
                        }, { onConflict: 'client_email' })
                    if (caErr) console.error('[ghl-handoff] client_accounts upsert FALHOU:', caErr.message)
                    else console.log('[ghl-handoff] client_accounts upserted com sucesso para', contactEmail)
                }

                // Auto-trigger: gerar success plan via AI (fire-and-forget)
                if (projectId) {
                    supabase.functions.invoke('generate-success-plan', {
                        body: { project_id: projectId },
                    }).catch((spErr: any) => {
                        console.warn(`[ghl-handoff] generate-success-plan falhou (nao critico):`, spErr?.message)
                    })

                    // Write-back: gravar hub_project_id na opportunity do GHL
                    writeBackHubProjectId(locationId, payload.opportunity_id || payload.deal_id, projectId)
                        .catch((wbErr: any) => console.warn(`[ghl-handoff] write-back falhou (nao critico):`, wbErr?.message))
                }
            } catch (convErr: any) {
                console.error(`[ghl-handoff] Conversao falhou: ${convErr?.message}`)
            }

            return respond(200, {
                success: true,
                action: 'deal_won_converted',
                opportunity_id: opp.id,
                project_id: projectId,
            })
        }

        // Evento nao reconhecido
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

// -- Helpers --

// GHL Write-back: gravar hub_project_id na opportunity original
// Mapeamento de location → PIT key + custom field ID
const GHL_CONFIG: Record<string, { pitKey: string; hubProjectFieldId: string }> = {
    'S7HEFAz97UKuC8NLHMmI': { // Funnels
        // @ts-ignore
        pitKey: Deno.env.get('GHL_PIT_FUNNELS') || '',
        hubProjectFieldId: 'CMcraKg2YezLWNJJ6M0y',
    },
    'oFTw9DcsKRUj6xCiq4mb': { // RevHackers
        // @ts-ignore
        pitKey: Deno.env.get('GHL_PIT_REVHACKERS') || '',
        hubProjectFieldId: 'oZv5ftBubon8Nmn6fWQr',
    },
}

async function writeBackHubProjectId(
    locationId: string | null,
    ghlOpportunityId: string | null | undefined,
    hubProjectId: string
): Promise<void> {
    if (!locationId || !ghlOpportunityId) {
        console.log('[ghl-handoff] write-back skipped: missing locationId or opportunityId')
        return
    }
    const config = GHL_CONFIG[locationId]
    if (!config?.pitKey) {
        console.warn(`[ghl-handoff] write-back skipped: no PIT key for location ${locationId}`)
        return
    }

    const resp = await fetch(
        `https://services.leadconnectorhq.com/opportunities/${ghlOpportunityId}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${config.pitKey}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                customFields: [
                    {
                        id: config.hubProjectFieldId,
                        field_value: hubProjectId,
                    },
                ],
            }),
        }
    )

    if (!resp.ok) {
        const text = await resp.text()
        console.error(`[ghl-handoff] write-back HTTP ${resp.status}: ${text}`)
    } else {
        console.log(`[ghl-handoff] ✅ write-back: hub_project_id=${hubProjectId} → GHL opp ${ghlOpportunityId}`)
    }
}

function detectEventType(payload: any): string {
    if (payload.event_type) return payload.event_type
    if (payload.type) return payload.type

    if (payload.appointment_date || payload.selected_slot || payload.calendar_name || payload.start_time) {
        return 'appointment_booked'
    }

    if (payload.status === 'won' || payload.pipeline_stage === 'won') {
        return 'deal_won'
    }

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
