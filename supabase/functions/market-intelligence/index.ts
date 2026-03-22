// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================
// OPENAI API CALL (GPT-4.5-preview Nativo)
// ============================================================

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4.5-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No content in OpenAI response');
    }

    let cleanContent = content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
    cleanContent = cleanContent.trim();

    // Try to extract JSON object
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanContent = jsonMatch[0];
    }

    try {
        return JSON.parse(cleanContent);
    } catch {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('Failed to parse AI response as JSON');
    }
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `Voce e o Head de Inteligencia de Mercado da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Voce tem 15+ anos de experiencia em consultoria estrategica e analise competitiva.
Sua especialidade e transformar dados brutos de diagnostico em inteligencia acionavel.

REGRAS ABSOLUTAS:
- Todas as respostas em portugues brasileiro.
- Responda APENAS com JSON valido, sem texto adicional.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).
- Baseie-se em dados reais de mercado. Cite empresas reais do segmento no Brasil.
- Seja especifico nos numeros e metricas. Nao use placeholders genericos.
- PERSONALIZE tudo ao contexto do cliente. Se recebeu dados do site, diagnostico ou concorrentes, USE-OS.`;

// Sanitiza um campo de texto para injecao segura no prompt
// Remove caracteres que podem escapar o contexto JSON ou injetar instrucoes
function sanitizeField(value: unknown, maxLength = 300): string {
    if (value === null || value === undefined) return '';
    const str = String(value)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
        .replace(/```/g, "'''")                              // evita code blocks que confundem o LLM
        .substring(0, maxLength)
        .trim();
    return str;
}

// Build rich context from all available client data
function buildUserPrompt(segment: string, objective: string, reiResponses?: any, siteAnalysis?: any, competitors?: { nome: string, url?: string }[]): string {
    const lines: string[] = [];

    lines.push(`Segmento: ${sanitizeField(segment, 150)}`);
    lines.push(`Objetivo Estrategico: ${sanitizeField(objective, 200)}`);

    // Extract key client data from REI responses
    if (reiResponses && typeof reiResponses === 'object') {
        const company  = sanitizeField(reiResponses.companyName  || reiResponses.revops_empresa       || reiResponses.nome_empresa || '');
        const crm      = sanitizeField(reiResponses.currentCRM   || reiResponses.revops_crm_atual     || '');
        const teamSize = sanitizeField(reiResponses.teamSize      || reiResponses.revops_tamanho_time  || '');
        const revenue  = sanitizeField(reiResponses.monthlyRevenue|| reiResponses.revops_faturamento   || '');
        const mainPain = sanitizeField(reiResponses.mainChallenge || reiResponses.revops_maior_dor     || reiResponses.biggestPain || '', 400);
        const channels = reiResponses.adsChannels || reiResponses.revops_canais_aquisicao || '';

        if (company)   lines.push(`Empresa: ${company}`);
        if (crm)       lines.push(`CRM atual: ${crm}`);
        if (teamSize)  lines.push(`Tamanho do time: ${teamSize}`);
        if (revenue)   lines.push(`Faturamento: ${revenue}`);
        if (mainPain)  lines.push(`Dor principal: ${mainPain}`);
        if (channels)  lines.push(`Canais de aquisicao: ${sanitizeField(typeof channels === 'object' ? JSON.stringify(channels) : channels, 200)}`);
    }

    // Site analysis context
    if (siteAnalysis && typeof siteAnalysis === 'object') {
        lines.push('');
        lines.push('--- Dados do site do cliente ---');
        if (siteAnalysis.resumo_proposta)   lines.push(`Proposta de valor: ${sanitizeField(siteAnalysis.resumo_proposta, 300)}`);
        if (siteAnalysis.publico_alvo)      lines.push(`Publico-alvo: ${sanitizeField(siteAnalysis.publico_alvo, 200)}`);
        if (siteAnalysis.produtos_servicos) {
            const prods = Array.isArray(siteAnalysis.produtos_servicos)
                ? siteAnalysis.produtos_servicos.slice(0, 10).map((p: unknown) => sanitizeField(p, 80)).join(', ')
                : sanitizeField(siteAnalysis.produtos_servicos, 300);
            lines.push(`Produtos/Servicos: ${prods}`);
        }
        if (siteAnalysis.maturidade_digital) lines.push(`Maturidade digital: ${sanitizeField(siteAnalysis.maturidade_digital, 100)}`);
        if (siteAnalysis.pontos_fracos_site) {
            const fraq = Array.isArray(siteAnalysis.pontos_fracos_site)
                ? siteAnalysis.pontos_fracos_site.slice(0, 5).map((p: unknown) => sanitizeField(p, 100)).join(', ')
                : sanitizeField(siteAnalysis.pontos_fracos_site, 300);
            lines.push(`Pontos fracos do site: ${fraq}`);
        }
    }

    // Competitors - limitar a 10 e sanitizar nome/URL individualmente
    if (competitors && competitors.length > 0) {
        lines.push('');
        lines.push('--- Concorrentes citados pelo cliente ---');
        competitors.slice(0, 10).forEach(c => {
            const nome = sanitizeField(c.nome, 100);
            const urlSafe = c.url ? sanitizeField(c.url, 100) : '';
            lines.push(`- ${nome}${urlSafe ? ' (' + urlSafe + ')' : ''}`);
        });
        lines.push('PRIORIDADE: Analise estes concorrentes especificamente. Complemente com outros players reais se necessario.');
    }

    lines.push('');
    lines.push(`INSTRUCAO CRITICA: Personalize TODA a analise ao negocio real deste cliente. As personas devem ser compradores dos produtos/servicos dele. Os concorrentes devem ser do mesmo espaco. O conselho estrategico deve atacar a dor principal.`);

    lines.push('');
    lines.push(`Retorne um JSON com esta estrutura:
{
    "industry_trends": ["Tendencia especifica do segmento 1", "Tendencia 2", "Tendencia 3"],
    "competitor_benchmarks": [
        {"company_name": "Empresa real do segmento", "key_metric": "Metrica chave com numero (ex: CAC R$ 350)", "strategy_insight": "Estrategia observavel que funciona para eles"},
        {"company_name": "Empresa 2", "key_metric": "Metrica 2", "strategy_insight": "Insight 2"},
        {"company_name": "Empresa 3", "key_metric": "Metrica 3", "strategy_insight": "Insight 3"}
    ],
    "market_sizing": {
        "tam": "Mercado Total do segmento no Brasil com valor estimado",
        "sam": "Mercado Enderecavel considerando o posicionamento do cliente",
        "som": "Mercado Capturavel em 12-24 meses com estrategia RevHackers"
    },
    "personas": [
        {
            "name": "Nome brasileiro realista",
            "role": "Cargo (ex: Diretor Comercial)",
            "pain": "Dor principal conectada ao produto/servico do cliente",
            "trigger": "Gatilho de compra especifico (ex: Troca de gestao, perda de receita)",
            "message": "Pitch de 1 frase que o vendedor do cliente usaria",
            "wiifm": "Ganho pessoal concreto (ex: Bater meta com menos esforco)"
        }
    ],
    "strategic_advice": "Conselho estrategico direto e personalizado para ESTE cliente, baseado nos dados reais fornecidos. 2-3 frases."
}
Gere EXATAMENTE 3 personas e 3 concorrentes no minimo.`);

    return lines.join('\n');
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // ============================================================
    // AUTH GATE - JWT required (Phase 2)
    // Only authenticated RevHackers users can trigger intelligence.
    // Drops unauthenticated requests immediately - no processing cost.
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Autorizacao necessaria.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // @ts-ignore
    const SUPABASE_URL_AUTH = Deno.env.get('SUPABASE_URL') ?? '';
    // @ts-ignore
    const SUPABASE_SERVICE_KEY_AUTH = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAuth = createClient(SUPABASE_URL_AUTH, SUPABASE_SERVICE_KEY_AUTH);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
        authHeader.replace('Bearer ', '').trim()
    );
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Token invalido ou expirado.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();
        const { segment, objective, rei_responses, siteAnalysis, competitors, projectId } = body;

        if (!segment || !objective) {
            throw new Error('Missing required fields: segment, objective');
        }

        // Validacao de tipos basicos para evitar que undefined seja injetado como string "undefined"
        if (typeof segment !== 'string' || typeof objective !== 'string') {
            throw new Error('segment e objective devem ser strings');
        }

        // Limite de tamanho do payload para evitar abuso de custo de API
        const payloadSize = JSON.stringify(body).length;
        if (payloadSize > 50_000) {
            throw new Error('Payload excede o limite de 50KB');
        }

        // @ts-ignore - Supabase Deno environment
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured in Supabase Secrets');
        }

        console.log(`[market-intelligence] Processing via GPT-4.5: segment="${segment}", objective="${objective}"`);

        const userPrompt = buildUserPrompt(segment, objective, rei_responses, siteAnalysis, competitors);

        const result = await callOpenAI(apiKey, SYSTEM_PROMPT, userPrompt);

        // Validate required fields
        const validated = {
            industry_trends: Array.isArray(result.industry_trends) ? result.industry_trends : [],
            competitor_benchmarks: Array.isArray(result.competitor_benchmarks) ? result.competitor_benchmarks.slice(0, 5) : [],
            market_sizing: result.market_sizing || { tam: '', sam: '', som: '' },
            personas: Array.isArray(result.personas) ? result.personas.slice(0, 3) : [],
            strategic_advice: result.strategic_advice || ''
        };

        console.log(`[market-intelligence] Success: ${validated.competitor_benchmarks.length} competitors, ${validated.personas.length} personas`);

        if (projectId) {
            const { error: updateError } = await supabaseAuth
                .from('rei_projects')
                .update({ market_data: validated, market_data_updated_at: new Date().toISOString() } as any)
                .eq('id', projectId);

            if (updateError) {
                console.error(`[market-intelligence] Failed to persist data for project ${projectId}:`, updateError.message);
            } else {
                console.log(`[market-intelligence] Persisted market_data to project ${projectId}`);
            }
        }

        return new Response(JSON.stringify(validated), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        const error = err as Error;
        console.error(`[market-intelligence] Error:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
