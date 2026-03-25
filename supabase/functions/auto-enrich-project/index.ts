// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * auto-enrich-project
 *
 * Orquestra o enriquecimento automatico de um projeto apos criacao:
 *   1. Busca CNPJ do cliente via BrasilAPI (Receita Federal - gratis)
 *   2. Busca performance do site via Google PageSpeed Insights (gratis)
 *   3. Salva tudo em rei_projects.enrichment_data (JSONB)
 *
 * Projetado para ser chamado em fire-and-forget apos createReiProject.
 * Nao bloqueia o fluxo de criacao do projeto.
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── BrasilAPI CNPJ ──────────────────────────────────────────────────────────

async function fetchCnpjData(cnpj: string): Promise<any | null> {
    const clean = cnpj.replace(/\D/g, '')
    if (clean.length !== 14) return null

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
            signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) return null
        const data = await res.json()

        // Extrai apenas os campos uteis para nao inflar o JSONB
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

// ── Google PageSpeed Insights ─────────────────────────────────────────────────

async function fetchSitePerf(url: string, apiKey: string): Promise<any | null> {
    if (!url || !apiKey) return null

    try {
        // Garante que a URL tem protocolo
        const siteUrl = url.startsWith('http') ? url : `https://${url}`

        const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&key=${apiKey}&strategy=mobile&category=performance&category=seo`

        const res = await fetch(psiUrl, { signal: AbortSignal.timeout(20000) })
        if (!res.ok) return null
        const data = await res.json()

        const cats = data.lighthouseResult?.categories ?? {}
        const audits = data.lighthouseResult?.audits ?? {}

        // Se o Lighthouse falhou ou retornou um site nao analisavel (erro falso-positivo), abortar
        if (typeof cats.performance?.score !== 'number') {
            console.warn(`[auto-enrich] PSI nao retornou um score valido para ${url}. Ignorando.`);
            return null;
        }

        return {
            url: siteUrl,
            performance_score: Math.round((cats.performance?.score ?? 0) * 100),
            seo_score:         Math.round((cats.seo?.score ?? 0) * 100),
            // Core Web Vitals
            lcp: audits['largest-contentful-paint']?.displayValue ?? null,
            fid: audits['max-potential-fid']?.displayValue ?? null,
            cls: audits['cumulative-layout-shift']?.displayValue ?? null,
            fcp: audits['first-contentful-paint']?.displayValue ?? null,
            tti: audits['interactive']?.displayValue ?? null,
            // Speed index
            speed_index: audits['speed-index']?.displayValue ?? null,
            // Classificacao simplificada
            rating: cats.performance?.score >= 0.9 ? 'Excelente'
                  : cats.performance?.score >= 0.5 ? 'Precisa melhorar'
                  : 'Critico',
        }
    } catch {
        return null
    }
}

// ── Main Handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // ============================================================
    // AUTH GATE - JWT ou Service Role Key
    // Aceita chamadas do frontend (JWT de usuario) e de outras
    // edge functions (service role key via supabase.functions.invoke)
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    // @ts-ignore
    const SUPABASE_URL         = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim()
        // Se o token NAO for o service role key, validar como JWT de usuario
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
        // Se for service role key, passou - e uma chamada interna confiavel
    } else {
        return new Response(JSON.stringify({ error: 'Autorizacao necessaria.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
    // @ts-ignore
    const PSI_API_KEY          = Deno.env.get('PSI_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY') ?? ''

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    try {
        const { project_id } = await req.json()

        if (!project_id) {
            return new Response(JSON.stringify({ error: 'project_id obrigatorio' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        console.log(`[auto-enrich] Starting enrichment for project ${project_id}`)

        // 1. Busca o projeto com o cliente vinculado
        const { data: project, error: projErr } = await supabase
            .from('rei_projects')
            .select('id, client_id, client_site, client_company, client_name')
            .eq('id', project_id)
            .single()

        if (projErr || !project) {
            throw new Error(`Projeto nao encontrado: ${projErr?.message}`)
        }

        // 2. Busca CNPJ do cliente vinculado
        let cnpjData = null
        if (project.client_id) {
            const { data: client } = await supabase
                .from('clients')
                .select('cnpj')
                .eq('id', project.client_id)
                .single()

            if (client?.cnpj) {
                console.log(`[auto-enrich] Fetching CNPJ ${client.cnpj}...`)
                cnpjData = await fetchCnpjData(client.cnpj)
                if (cnpjData) {
                    console.log(`[auto-enrich] CNPJ OK: ${cnpjData.razao_social}`)
                }
            }
        }

        // 3. Busca performance do site
        let sitePerf = null
        if (project.client_site && PSI_API_KEY) {
            console.log(`[auto-enrich] Fetching PSI for ${project.client_site}...`)
            sitePerf = await fetchSitePerf(project.client_site, PSI_API_KEY)
            if (sitePerf) {
                console.log(`[auto-enrich] PSI OK: score ${sitePerf.performance_score}`)
            }
        }

        // 4. Monta e salva enrichment_data
        const enrichmentData = {
            enriched_at: new Date().toISOString(),
            ...(cnpjData  ? { cnpj:      cnpjData  } : {}),
            ...(sitePerf  ? { site_perf: sitePerf  } : {}),
        }

        const { error: updateErr } = await supabase
            .from('rei_projects')
            .update({ enrichment_data: enrichmentData } as any)
            .eq('id', project_id)

        if (updateErr) throw new Error(`Falha ao salvar: ${updateErr.message}`)

        console.log(`[auto-enrich] Done for project ${project_id}. cnpj=${!!cnpjData} site_perf=${!!sitePerf}`)

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
