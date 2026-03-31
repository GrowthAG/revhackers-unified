// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

async function withAutoRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`[Auto-Retry] Falha na rede/OpenAI. Tentativa ${i + 1} de ${retries}. Aguardando ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error("Unreachable");
}

/**
 * generate-success-plan
 *
 * Gera automaticamente os criterios de sucesso e plano de mitigacao de riscos
 * para um success_plan (strategic_plans com plan_type='success_plan').
 *
 * Frameworks aplicados:
 *   - Lincoln Murphy: Desired Outcome = Required Outcome + Appropriate Experience
 *   - Donna Weber: Onboarding Orquestrado (6 fases)
 *   - Aaron Ross: Receita Previsivel (Pipeline Velocity, 3 tipos de lead)
 *
 * Input: { success_plan_id } ou { project_id } ou { opportunity_id }
 * Output: Atualiza success_criteria_data e risk_mitigation_data no success_plan
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// -- Em-dash purge utility --
function purgeEmDashes(obj: any): any {
    if (typeof obj === 'string') return obj.replace(/\u2014/g, '-').replace(/\u2013/g, '-')
    if (Array.isArray(obj)) return obj.map(purgeEmDashes)
    if (obj && typeof obj === 'object') {
        const cleaned: any = {}
        for (const [k, v] of Object.entries(obj)) {
            cleaned[k] = purgeEmDashes(v)
        }
        return cleaned
    }
    return obj
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''

    if (!OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY nao configurada' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // AUTH GATE
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim()
        if (token !== SUPABASE_SERVICE_KEY) {
            const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Token invalido.' }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }
    } else {
        return new Response(JSON.stringify({ error: 'Autorizacao necessaria.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    try {
        const body = await req.json()
        const { success_plan_id, project_id, opportunity_id } = body

        // 1. Localizar o success_plan
        let plan: any = null

        if (success_plan_id) {
            const { data } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('id', success_plan_id)
                .eq('plan_type', 'success_plan')
                .single()
            plan = data
        } else if (project_id) {
            const { data } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('rei_project_id', project_id)
                .eq('plan_type', 'success_plan')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            plan = data
        } else if (opportunity_id) {
            const { data } = await supabase
                .from('strategic_plans')
                .select('*')
                .eq('opportunity_id', opportunity_id)
                .eq('plan_type', 'success_plan')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            plan = data
        }

        if (!plan) {
            return new Response(JSON.stringify({ error: 'Success plan nao encontrado' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        console.log(`[generate-success-plan] Gerando para plan ${plan.id}`)

        // 2. Coletar contexto rico
        const diagData = plan.diagnostic_data || {}
        const enrichment = diagData.enrichment || {}
        const marketData = diagData.market_data || {}
        const siteAnalysis = diagData.site_analysis || {}
        const diagRespostas = diagData.diagnostico_respostas || {}
        const oppSignals = diagData.opportunity_signals || {}
        const oppType = diagData.opportunity_type || 'consulting'

        // Buscar dados do projeto (se existir)
        let projectData: any = null
        if (plan.rei_project_id) {
            const { data } = await supabase
                .from('rei_projects')
                .select('client_name, client_company, client_site, type, status')
                .eq('id', plan.rei_project_id)
                .single()
            projectData = data
        }

        // Buscar dados da opportunity (se existir)
        let oppData: any = null
        if (plan.opportunity_id) {
            const { data } = await supabase
                .from('opportunities')
                .select('client_name, client_company, type, lead_source, opportunity_data, enrichment_data')
                .eq('id', plan.opportunity_id)
                .single()
            oppData = data
        }

        // Buscar meeting transcript (se houver)
        let meetingContext = ''
        if (plan.opportunity_id) {
            const { data: opp } = await supabase
                .from('opportunities')
                .select('meeting_recording_id')
                .eq('id', plan.opportunity_id)
                .single()

            if (opp?.meeting_recording_id) {
                const { data: meeting } = await supabase
                    .from('meeting_recordings')
                    .select('transcript, ai_insights')
                    .eq('id', opp.meeting_recording_id)
                    .single()

                if (meeting) {
                    const insights = meeting.ai_insights || {}
                    meetingContext = [
                        insights.resumo_executivo ? `Resumo da Reuniao: ${insights.resumo_executivo}` : '',
                        insights.gargalos ? `Gargalos Identificados: ${JSON.stringify(insights.gargalos)}` : '',
                        insights.objecoes ? `Objecoes do Cliente: ${JSON.stringify(insights.objecoes)}` : '',
                        insights.sentimento ? `Sentimento: ${insights.sentimento}` : '',
                        insights.score_qualificacao ? `Score de Qualificacao: ${insights.score_qualificacao}` : '',
                        meeting.transcript ? `Transcricao (resumo): ${String(meeting.transcript).substring(0, 3000)}` : '',
                    ].filter(Boolean).join('\n')
                }
            }
        }

        // Buscar strategic plan existente (se ja tiver plano estrategico gerado)
        let strategicPlanContext = ''
        if (plan.rei_project_id) {
            const { data: stratPlan } = await supabase
                .from('strategic_plans')
                .select('diagnostic_data, roadmap_data, okr_data')
                .eq('rei_project_id', plan.rei_project_id)
                .eq('plan_type', 'strategic')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (stratPlan?.diagnostic_data) {
                const sd = stratPlan.diagnostic_data as any
                strategicPlanContext = [
                    sd.summary ? `Plano Estrategico - Resumo: ${sd.summary}` : '',
                    sd.pillars ? `Pilares: ${JSON.stringify(sd.pillars)}` : '',
                    sd.roadmap_phases ? `Roadmap: ${JSON.stringify(sd.roadmap_phases)}` : '',
                    sd.okrs ? `OKRs: ${JSON.stringify(sd.okrs)}` : '',
                    sd.risks ? `Riscos do Plano: ${JSON.stringify(sd.risks)}` : '',
                    sd.quick_wins ? `Quick Wins: ${JSON.stringify(sd.quick_wins)}` : '',
                ].filter(Boolean).join('\n')
            }
        }

        // 3. Montar o prompt
        const clientName = projectData?.client_name || oppData?.client_name || 'Cliente'
        const clientCompany = projectData?.client_company || oppData?.client_company || 'Empresa'
        const projectType = projectData?.type || oppType || 'consulting'

        const cnpjInfo = enrichment.cnpj
            ? `Empresa: ${enrichment.cnpj.razao_social || ''} | Porte: ${enrichment.cnpj.porte || ''} | CNAE: ${enrichment.cnpj.cnae_principal?.descricao || ''} | Capital Social: ${enrichment.cnpj.capital_social || ''} | UF: ${enrichment.cnpj.uf || ''}`
            : ''

        const siteInfo = enrichment.site_perf || siteAnalysis
            ? `Site Performance: Score ${(enrichment.site_perf || siteAnalysis)?.performance_score || 'N/A'}/100 | SEO ${(enrichment.site_perf || siteAnalysis)?.seo_score || 'N/A'}/100 | Rating: ${(enrichment.site_perf || siteAnalysis)?.rating || 'N/A'}`
            : ''

        const diagScore = diagRespostas.score || diagData.diagnostico_score || null
        const maturityLevel = diagRespostas.maturity_level || diagRespostas.result_details?.level || null

        const systemPrompt = `Voce e um Customer Success Strategist senior especializado em onboarding de clientes B2B.

Voce aplica os seguintes frameworks:
- Lincoln Murphy (Desired Outcome): O sucesso do cliente = Resultado Necessario + Experiencia Apropriada
- Donna Weber (Onboarding Orquestrado): 6 fases (Embark, Handoff, Kickoff, Adopt, Review, Expand)
- Aaron Ross (Receita Previsivel): Pipeline Velocity, segmentacao de leads, especializacao de papeis
- Kahneman (Vieses Cognitivos): Loss aversion, anchoring, status quo bias na adocao

REGRAS CRITICAS:
1. Todo conteudo em portugues do Brasil.
2. NUNCA use o caractere em dash (traco longo). Use hifen simples (-) como separador.
3. Seja especifico e acionavel. Nada generico. Siga o Schema JSON estritamente.
4. Milestones devem ter metricas mensuráveis com thresholds numericos exatos e calculados considerando faturamento e metas.
5. TTFV (Time to First Value) e critico: o cliente deve sentir valor nos primeiros 14 dias.
6. Riscos devem ser baseados no contexto real do cliente, nao genericos.`

        const userPrompt = `Gere o Success Plan completo para este cliente:

## DADOS DO CLIENTE
- Nome: ${clientName}
- Empresa: ${clientCompany}
- Tipo de Projeto: ${projectType}
${cnpjInfo ? `- Dados Empresariais: ${cnpjInfo}` : ''}
${siteInfo ? `- ${siteInfo}` : ''}
${diagScore ? `- Score do Diagnostico: ${diagScore}/100` : ''}
${maturityLevel ? `- Nivel de Maturidade: ${maturityLevel}` : ''}

## INTELIGENCIA PRE-VENDA
${oppSignals ? `Sinais da Oportunidade: ${JSON.stringify(oppSignals).substring(0, 2000)}` : 'Sem dados de oportunidade'}

## DIAGNOSTICO
${Object.keys(diagRespostas).length > 0 ? JSON.stringify(diagRespostas).substring(0, 3000) : 'Sem diagnostico'}

${meetingContext ? `## CONTEXTO DA REUNIAO\n${meetingContext}` : ''}

${strategicPlanContext ? `## PLANO ESTRATEGICO EXISTENTE\n${strategicPlanContext}` : ''}

${Object.keys(marketData).length > 0 ? `## DADOS DE MERCADO\n${JSON.stringify(marketData).substring(0, 1500)}` : ''}

## INSTRUCOES DE OUTPUT

Retorne um JSON com esta estrutura EXATA:

{
  "success_criteria": {
    "required_outcome": "string - O que o cliente PRECISA alcançar (resultado de negocio, ex: 'Aumentar pipeline qualificado em 40% em 90 dias')",
    "appropriate_experience": "string - COMO o cliente quer alcançar (experiencia ideal, ex: 'Processo claro, sem complexidade tecnica, com visibilidade total do funil')",
    "desired_outcome_statement": "string - Frase que une required_outcome + appropriate_experience",
    "ttfv_target_days": number (7-21),
    "ttfv_definition": "string - O que significa 'primeiro valor' para este cliente especifico",
    "success_milestones": [
      {
        "name": "string - Nome do milestone",
        "phase": "embark | kickoff | adopt | review | expand",
        "target_day": number (dia relativo ao kickoff),
        "metric": "string - O que medir",
        "threshold": number,
        "unit": "string (%, R$, leads, reunioes, etc)",
        "owner": "revhackers | cliente | ambos",
        "description": "string - O que precisa acontecer"
      }
    ],
    "health_dimensions": {
      "adoption": {
        "weight": 0.30,
        "indicators": ["string - indicador mensuravel 1", "string - indicador 2"],
        "initial_score": number (0-100, estimativa baseada no diagnostico)
      },
      "engagement": {
        "weight": 0.25,
        "indicators": ["string", "string"],
        "initial_score": number (0-100)
      },
      "growth": {
        "weight": 0.25,
        "indicators": ["string", "string"],
        "initial_score": number (0-100)
      },
      "sentiment": {
        "weight": 0.20,
        "indicators": ["string", "string"],
        "initial_score": number (0-100)
      }
    },
    "onboarding_phases": [
      {
        "phase": "embark | kickoff | adopt | review | expand",
        "name": "string - Nome da fase",
        "duration_days": number,
        "objectives": ["string"],
        "deliverables": ["string"],
        "success_signal": "string - Como saber que a fase foi bem sucedida"
      }
    ]
  },
  "risk_mitigation": {
    "risks": [
      {
        "category": "adoption | technical | organizational | financial | timeline",
        "title": "string - Titulo do risco",
        "description": "string - Descricao detalhada",
        "probability": "high | medium | low",
        "impact": "critical | high | medium | low",
        "mitigation": "string - Acao preventiva",
        "contingency": "string - Plano B se o risco se materializar",
        "owner": "revhackers | cliente | ambos"
      }
    ],
    "red_flags": [
      {
        "signal": "string - Sinal de alerta observavel",
        "trigger_action": "string - O que fazer quando detectado",
        "escalation": "string - Para quem escalar"
      }
    ],
    "churn_prevention": {
      "early_warning_signals": ["string - sinais de churn nos primeiros 30 dias"],
      "intervention_playbook": "string - Protocolo de intervencao"
    }
  }
}

REGRAS:
- Gere EXATAMENTE 6-8 milestones cobrindo todas as fases do onboarding
- Gere EXATAMENTE 4-6 riscos baseados no contexto REAL (nao genericos)
- Gere EXATAMENTE 3-5 red flags especificos para este tipo de projeto
- Gere EXATAMENTE 5 fases de onboarding (embark, kickoff, adopt, review, expand)
- Todos os milestones devem ter metricas NUMERICAS mensuráveis
- TTFV deve ser realista para o tipo de projeto (CRM: 14d, Founder: 21d, Dev: 7d)
- Health scores iniciais baseados no diagnostico real (se disponivel)
- NUNCA use em dash. Use hifen simples.`

        // 4. Chamar GPT
        console.log(`[generate-success-plan] Chamando GPT-5.4...`)

        const openaiResponse = await withAutoRetry(() => fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-5.4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                reasoning_effort: 'high',
            }),
        }));

        if (!openaiResponse.ok) {
            const errText = await openaiResponse.text()
            console.error(`[generate-success-plan] OpenAI error: ${errText}`)
            throw new Error(`OpenAI API error: ${openaiResponse.status}`)
        }

        const openaiData = await openaiResponse.json()
        const rawContent = openaiData.choices?.[0]?.message?.content || '{}'

        let result: any
        try {
            result = JSON.parse(rawContent)
        } catch (parseErr) {
            console.error('[generate-success-plan] JSON parse failed:', rawContent.substring(0, 500))
            throw new Error('Resposta da AI nao e JSON valido')
        }

        // 5. Purge em-dashes
        result = purgeEmDashes(result)

        console.log(`[generate-success-plan] AI gerou: ${result.success_criteria?.success_milestones?.length || 0} milestones, ${result.risk_mitigation?.risks?.length || 0} riscos`)

        // 6. Defensive fallbacks
        const successCriteria = result.success_criteria || {}
        const riskMitigation = result.risk_mitigation || {}

        // Garantir estrutura minima
        if (!successCriteria.success_milestones || !Array.isArray(successCriteria.success_milestones)) {
            successCriteria.success_milestones = []
        }
        if (!successCriteria.health_dimensions) {
            successCriteria.health_dimensions = {
                adoption: { weight: 0.30, indicators: [], initial_score: 50 },
                engagement: { weight: 0.25, indicators: [], initial_score: 50 },
                growth: { weight: 0.25, indicators: [], initial_score: 50 },
                sentiment: { weight: 0.20, indicators: [], initial_score: 50 },
            }
        }
        if (!successCriteria.onboarding_phases || !Array.isArray(successCriteria.onboarding_phases)) {
            successCriteria.onboarding_phases = []
        }
        if (!riskMitigation.risks || !Array.isArray(riskMitigation.risks)) {
            riskMitigation.risks = []
        }
        if (!riskMitigation.red_flags || !Array.isArray(riskMitigation.red_flags)) {
            riskMitigation.red_flags = []
        }

        // Marcar como gerado
        successCriteria.status = 'generated'
        successCriteria.generated_at = new Date().toISOString()
        successCriteria.model = 'gpt-5.4'
        riskMitigation.status = 'generated'
        riskMitigation.generated_at = new Date().toISOString()

        // 7. Salvar no success_plan
        const { error: updateErr } = await supabase
            .from('strategic_plans')
            .update({
                success_criteria_data: successCriteria,
                risk_mitigation_data: riskMitigation,
                status: 'generated',
                updated_at: new Date().toISOString(),
            })
            .eq('id', plan.id)

        if (updateErr) {
            console.error('[generate-success-plan] Erro ao salvar:', updateErr)
            throw new Error(`Falha ao salvar: ${updateErr.message}`)
        }

        console.log(`[generate-success-plan] Success plan ${plan.id} gerado e salvo com sucesso`)

        return new Response(JSON.stringify({
            success: true,
            plan_id: plan.id,
            milestones_count: successCriteria.success_milestones.length,
            risks_count: riskMitigation.risks.length,
            ttfv_days: successCriteria.ttfv_target_days,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err: any) {
        console.error('[generate-success-plan] Error:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
