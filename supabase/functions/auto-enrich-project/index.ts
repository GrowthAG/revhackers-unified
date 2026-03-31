// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * auto-enrich-project
 *
 * Orquestra o enriquecimento automatico de uma oportunidade ou projeto:
 *   1. Busca CNPJ do cliente via BrasilAPI (Receita Federal - gratis)
 *   2. Busca performance do site via Google PageSpeed Insights (gratis)
 *   3. Salva em opportunities.enrichment_data OU rei_projects.enrichment_data
 *
 * Aceita: { opportunity_id } para pre-venda OU { project_id } para execucao.
 * Se ambos forem passados, opportunity_id tem prioridade.
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// -- BrasilAPI CNPJ --

async function fetchCnpjData(cnpj: string): Promise<any | null> {
    const clean = cnpj.replace(/\D/g, '')
    if (clean.length !== 14) return null

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
            signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) return null
        const data = await res.json()

        return {
            cnpj: data.cnpj,
            razao_social: data.razao_social,
            nome_fantasia: data.nome_fantasia || null,
            situacao_cadastral: data.descricao_situacao_cadastral,
            data_abertura: data.data_inicio_atividade,
            natureza_juridica: data.natureza_juridica,
            porte: data.porte,
            capital_social: data.capital_social,
            cnae_principal: data.cnae_fiscal
                ? {
                    codigo: String(data.cnae_fiscal),
                    descricao: data.cnae_fiscal_descricao,
                  }
                : null,
            cnaes_secundarios: (data.cnaes_secundarios || [])
                .slice(0, 5)
                .map((c: any) => ({ codigo: String(c.codigo), descricao: c.descricao })),
            municipio: data.municipio,
            uf: data.uf,
            email: data.email || null,
            telefone: data.ddd_telefone_1
                ? `(${data.ddd_telefone_1}) ${data.telefone_1}`.trim()
                : null,
            qsa: (data.qsa || []).slice(0, 5).map((s: any) => ({
                nome: s.nome_socio,
                qualificacao: s.qualificacao_socio,
            })),
        }
    } catch {
        return null
    }
}

// -- Google PageSpeed Insights --

async function fetchSitePerf(url: string, apiKey: string): Promise<any | null> {
    if (!url || !apiKey) return null

    try {
        const siteUrl = url.startsWith('http') ? url : `https://${url}`

        const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&key=${apiKey}&strategy=mobile&category=performance&category=seo`

        const res = await fetch(psiUrl, { signal: AbortSignal.timeout(20000) })
        if (!res.ok) return null
        const data = await res.json()

        const cats = data.lighthouseResult?.categories ?? {}
        const audits = data.lighthouseResult?.audits ?? {}

        if (typeof cats.performance?.score !== 'number') {
            console.warn(`[auto-enrich] PSI nao retornou score valido para ${url}. Ignorando.`);
            return null;
        }

        return {
            url: siteUrl,
            performance_score: Math.round((cats.performance?.score ?? 0) * 100),
            seo_score:         Math.round((cats.seo?.score ?? 0) * 100),
            lcp: audits['largest-contentful-paint']?.displayValue ?? null,
            fid: audits['max-potential-fid']?.displayValue ?? null,
            cls: audits['cumulative-layout-shift']?.displayValue ?? null,
            fcp: audits['first-contentful-paint']?.displayValue ?? null,
            tti: audits['interactive']?.displayValue ?? null,
            speed_index: audits['speed-index']?.displayValue ?? null,
            rating: cats.performance?.score >= 0.9 ? 'Excelente'
                  : cats.performance?.score >= 0.5 ? 'Precisa melhorar'
                  : 'Critico',
        }
    } catch {
        return null
    }
}

// -- Main Handler --

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // AUTH GATE
    const authHeader = req.headers.get('Authorization');
    // @ts-ignore
    const SUPABASE_URL         = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim()
        if (token !== SUPABASE_SERVICE_KEY) {
            const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Token invalido ou expirado.' }), {
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
    // @ts-ignore
    const PSI_API_KEY = Deno.env.get('PSI_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY') ?? ''

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    try {
        const body = await req.json()
        const opportunityId = body.opportunity_id
        const projectId = body.project_id

        if (!opportunityId && !projectId) {
            return new Response(JSON.stringify({ error: 'opportunity_id ou project_id obrigatorio' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Determina a tabela e o ID alvo
        const isOpportunity = !!opportunityId
        const targetTable = isOpportunity ? 'opportunities' : 'rei_projects'
        const targetId = opportunityId || projectId

        console.log(`[auto-enrich] Starting enrichment for ${targetTable}/${targetId}`)

        // 1. Busca o registro
        const { data: record, error: fetchErr } = await supabase
            .from(targetTable)
            .select('id, client_id, client_site, client_company, client_name, enrichment_data')
            .eq('id', targetId)
            .single()

        if (fetchErr || !record) {
            throw new Error(`Registro nao encontrado em ${targetTable}: ${fetchErr?.message}`)
        }

        // 2. Busca CNPJ (via client FK ou via enrichment_data existente)
        let cnpjData = null
        const existingCnpj = (record as any).enrichment_data?.cnpj?.cnpj
            || (record as any).enrichment_data?.cnpj

        if (existingCnpj && typeof existingCnpj === 'string') {
            // Re-enrich com CNPJ ja conhecido
            console.log(`[auto-enrich] Re-fetching known CNPJ ${existingCnpj}...`)
            cnpjData = await fetchCnpjData(existingCnpj)
        } else if ((record as any).client_id) {
            const { data: client } = await supabase
                .from('clients')
                .select('cnpj')
                .eq('id', (record as any).client_id)
                .single()

            if (client?.cnpj) {
                console.log(`[auto-enrich] Fetching CNPJ ${client.cnpj}...`)
                cnpjData = await fetchCnpjData(client.cnpj)
            }
        }

        if (cnpjData) {
            console.log(`[auto-enrich] CNPJ OK: ${cnpjData.razao_social}`)
        }

        // 3. Busca performance do site
        let sitePerf = null
        if ((record as any).client_site && PSI_API_KEY) {
            console.log(`[auto-enrich] Fetching PSI for ${(record as any).client_site}...`)
            sitePerf = await fetchSitePerf((record as any).client_site, PSI_API_KEY)
            if (sitePerf) {
                console.log(`[auto-enrich] PSI OK: score ${sitePerf.performance_score}`)
            }
        }

        // 4. Merge com enrichment_data existente e salva
        const existingEnrichment = (record as any).enrichment_data || {}
        const enrichmentData = {
            ...existingEnrichment,
            enriched_at: new Date().toISOString(),
            ...(cnpjData  ? { cnpj:      cnpjData  } : {}),
            ...(sitePerf  ? { site_perf: sitePerf  } : {}),
        }

        const { error: updateErr } = await supabase
            .from(targetTable)
            .update({ enrichment_data: enrichmentData })
            .eq('id', targetId)

        if (updateErr) throw new Error(`Falha ao salvar: ${updateErr.message}`)

        console.log(`[auto-enrich] Done for ${targetTable}/${targetId}. cnpj=${!!cnpjData} site_perf=${!!sitePerf}`)

        return new Response(JSON.stringify({
            success: true,
            enriched: {
                cnpj:      !!cnpjData,
                site_perf: !!sitePerf,
            },
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err: any) {
        console.error('[auto-enrich] Error:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
