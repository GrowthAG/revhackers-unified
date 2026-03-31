import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EnrichmentType = 'benchmark' | 'personas' | 'market' | 'all';

interface EnrichmentRequest {
    segment: string;
    ticket?: string;
    objective?: string;
    isB2B?: boolean;
    enrichmentType: EnrichmentType;
    rei_responses?: any;
    competitors?: { nome: string, url?: string }[];
    siteAnalysis?: any;
    projectType?: string;
}

// Build structured client context from REI responses + site analysis
function buildClientContext(rei: any, siteAnalysis: any, segment: string, objective?: string, projectType?: string): string {
    if (!rei && !siteAnalysis) return '';

    const lines: string[] = [];
    lines.push('<CONTEXTO_REAL_DO_CLIENTE>');

    // Company identification
    const company = rei?.companyName || rei?.revops_empresa || rei?.nome_empresa || rei?.empresa || '';
    const site = rei?.companySite || rei?.revops_site || rei?.site || '';
    if (company) lines.push(`Empresa: ${company}`);
    if (site) lines.push(`Site: ${site}`);
    lines.push(`Segmento: ${segment}`);
    if (objective) lines.push(`Objetivo Principal: ${objective}`);
    if (projectType) lines.push(`Tipo de Projeto: ${projectType}`);

    // Team and structure
    const teamSize = rei?.teamSize || rei?.revops_tamanho_time || rei?.tamanho_time || '';
    const revenue = rei?.monthlyRevenue || rei?.revops_faturamento || rei?.faturamento || '';
    const budget = rei?.budget || rei?.revops_budget || rei?.orcamento || '';
    if (teamSize) lines.push(`Tamanho do time: ${teamSize}`);
    if (revenue) lines.push(`Faturamento: ${revenue}`);
    if (budget) lines.push(`Budget disponivel: ${budget}`);

    // Current tools and stack
    const crm = rei?.currentCRM || rei?.revops_crm_atual || rei?.crm || '';
    const tools = rei?.currentTools || rei?.revops_ferramentas || rei?.ferramentas || '';
    const adsChannels = rei?.adsChannels || rei?.revops_canais_aquisicao || rei?.canais || '';
    if (crm) lines.push(`CRM atual: ${crm}`);
    if (tools) lines.push(`Ferramentas em uso: ${typeof tools === 'object' ? JSON.stringify(tools) : tools}`);
    if (adsChannels) lines.push(`Canais de aquisicao: ${typeof adsChannels === 'object' ? JSON.stringify(adsChannels) : adsChannels}`);

    // Pain points and challenges
    const mainPain = rei?.mainChallenge || rei?.revops_maior_dor || rei?.maiorDor || rei?.biggestPain || '';
    const bottleneck = rei?.bottleneck || rei?.revops_gargalo || rei?.gargalo || '';
    if (mainPain) lines.push(`Dor principal: ${mainPain}`);
    if (bottleneck) lines.push(`Gargalo operacional: ${bottleneck}`);

    // Metrics
    const conversionRate = rei?.conversionRate || rei?.revops_taxa_conversao || '';
    const avgTicket = rei?.avgTicket || rei?.revops_ticket_medio || rei?.ticketMedio || '';
    const salesCycle = rei?.salesCycle || rei?.revops_ciclo_vendas || '';
    if (conversionRate) lines.push(`Taxa de conversao atual: ${conversionRate}`);
    if (avgTicket) lines.push(`Ticket medio: ${avgTicket}`);
    if (salesCycle) lines.push(`Ciclo de vendas: ${salesCycle}`);

    // Site analysis data
    if (siteAnalysis && typeof siteAnalysis === 'object') {
        lines.push('');
        lines.push('--- Analise do Site do Cliente ---');
        if (siteAnalysis.resumo_proposta) lines.push(`Proposta de valor: ${siteAnalysis.resumo_proposta}`);
        if (siteAnalysis.publico_alvo) lines.push(`Publico-alvo identificado: ${siteAnalysis.publico_alvo}`);
        if (siteAnalysis.produtos_servicos) {
            const prods = Array.isArray(siteAnalysis.produtos_servicos) ? siteAnalysis.produtos_servicos.join(', ') : siteAnalysis.produtos_servicos;
            lines.push(`Produtos/Servicos: ${prods}`);
        }
        if (siteAnalysis.diferenciais) lines.push(`Diferenciais: ${siteAnalysis.diferenciais}`);
        if (siteAnalysis.maturidade_digital) lines.push(`Maturidade digital: ${siteAnalysis.maturidade_digital}`);
        if (siteAnalysis.tom_comunicacao) lines.push(`Tom de comunicacao: ${siteAnalysis.tom_comunicacao}`);
        if (siteAnalysis.pontos_fracos_site) {
            const fraq = Array.isArray(siteAnalysis.pontos_fracos_site) ? siteAnalysis.pontos_fracos_site.join(', ') : siteAnalysis.pontos_fracos_site;
            lines.push(`Pontos fracos do site: ${fraq}`);
        }
        if (siteAnalysis.oportunidades_estrategicas) {
            const oport = Array.isArray(siteAnalysis.oportunidades_estrategicas) ? siteAnalysis.oportunidades_estrategicas.join(', ') : siteAnalysis.oportunidades_estrategicas;
            lines.push(`Oportunidades estrategicas: ${oport}`);
        }
    }

    lines.push('</CONTEXTO_REAL_DO_CLIENTE>');
    return lines.join('\n');
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // ============================================================
    // AUTH GATE - JWT required
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
        const { segment, ticket, objective, isB2B, enrichmentType, rei_responses, competitors, siteAnalysis, projectType }: EnrichmentRequest = await req.json();

        if (!segment) {
            throw new Error('Segment is required');
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        if (!OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set, returning empty enrichment');
            return new Response(JSON.stringify({
                error: 'API not configured',
                benchmark: null,
                personas: null,
                market: null
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const results: any = {};

        // Build structured client context instead of raw JSON dump
        const clientContext = buildClientContext(rei_responses, siteAnalysis, segment, objective, projectType);

        // Execute requested enrichments
        if (enrichmentType === 'all' || enrichmentType === 'benchmark') {
            results.benchmark = await enrichBenchmark(OPENAI_API_KEY, segment, ticket, isB2B, clientContext);
        }

        if (enrichmentType === 'all' || enrichmentType === 'personas') {
            results.personas = await enrichPersonas(OPENAI_API_KEY, segment, ticket, objective, clientContext);
        }

        if (enrichmentType === 'all' || enrichmentType === 'market') {
            results.market = await enrichMarket(OPENAI_API_KEY, segment, clientContext, competitors);
        }

        console.log('Strategic enrichment completed for segment:', segment);

        return new Response(JSON.stringify({ result: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('enrich-strategic-data error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

// ============================================================
// OPENAI API CALL (GPT-4o-mini - replaces Perplexity sonar-reasoning-pro)
// ============================================================

async function callOpenAI(apiKey: string, prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-5.4-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Você é o Diretor de Inteligência Estratégica da RevHackers. Você analisa mercados, constrói ICPs e gera benchmarks. Seus dados são baseados no mercado brasileiro real. NUNCA gere conteúdo genérico. USE A BUSCA NA WEB (`web_search_preview`) APENAS em fontes verdadeiras e portais verificados para achar preços e TAM/SAM. Você possui um FILTRO ANTI-FAKENEWS rígido: Se não achar o dado real na web, declare que o dado é indisponível. Nunca invente. A resposta deve seguir a tipagem JSON solicitada rigorosamente.'
                },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            tools: [{ type: 'web_search_preview' }],
            web_search_preview: true
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

    try {
        return JSON.parse(cleanContent);
    } catch (parseError) {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('GPT Structured Output falhou na validação do JSON');
    }
}

async function enrichBenchmark(apiKey: string, segment: string, ticket?: string, isB2B?: boolean, context?: string): Promise<any> {
    const prompt = `Você é o Head de Inteligência de Mercado da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Sua missão é gerar benchmarks CIRÚRGICOS e REALISTAS para o cliente abaixo, comparando com o mercado brasileiro REAL.

${context || ''}

Segmento de Atuação: ${segment}
${ticket ? `Ticket Médio informado pelo cliente: ${ticket}` : ''}
Modelo de Negócio: ${isB2B ? 'B2B (Business to Business)' : 'B2C (Business to Consumer)'}

INSTRUÇÕES CRÍTICAS:
- IDENTIFIQUE o segmento real do cliente a partir do nome da empresa e do site ANTES de gerar qualquer dado.
- PROIBIDO USAR INTERVALOS GENÉRICOS DE PREÇO. Em vez de "R$ 800 a R$ 2.500", você DEVE fornecer o VALOR EXATO MÉDIO CALCULADO (ex: "R$ 1.250,00"). Aja como um analista de RevOps que cruzou os dados e chegou a um número consolidado.
- Se o cliente informou ticket médio, CRM atual ou taxa de conversão, USE esses dados para contextualizar.
- Compare os números do cliente com os benchmarks do segmento - aponte onde ele está acima ou abaixo do mercado.
- As ferramentas sugeridas devem considerar as que o cliente JÁ usa (se informadas) e propor evoluções realistas.
- O comparativo de mercado deve citar concorrentes reais do segmento no Brasil.
- NUNCA use o caractere em dash (travessão longo) - use apenas hífen simples (-), dois pontos (:) ou ponto (.).
- REGRA DE ORTOGRAFIA: todo texto DEVE usar português brasileiro correto com TODOS os acentos obrigatórios.

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "cac_medio": "Valor monetário ÚNICO (ex: R$ 450,00). É ESTRITAMENTE PROIBIDO usar ranges genéricos como 'R$ 300 - 800'. Dê sempre o valor consolidado da média brasileira no segmento.",
  "taxa_conversao": "Porcentagem média única Lead -> Cliente do segmento (ex: 2.5%). Sem ranges.",
  "ciclo_vendas": "Tempo médio único do segmento (ex: 45 dias). Sem ranges.",
  "ltv_cac_ratio": "Ratio ideal para o segmento (ex: 4:1)",
  "ferramentas_principais": {
    "crm": ["Ferramenta real 1", "Ferramenta real 2"],
    "automacao": ["Ferramenta real 1", "Ferramenta real 2"],
    "ads": ["Canal mais eficiente 1", "Canal 2"]
  },
  "comparativo_mercado": "Análise de 2-3 frases comparando o cenário competitivo do segmento. Cite empresas reais e tendências. Aponte onde o cliente pode se diferenciar."
}`;

    try {
        return await callOpenAI(apiKey, prompt);
    } catch (error) {
        console.error('Benchmark enrichment failed:', error);
        return null;
    }
}

async function enrichPersonas(apiKey: string, segment: string, ticket?: string, objective?: string, context?: string): Promise<any> {
    const prompt = `Você é o Estrategista de ICP (Ideal Customer Profile) da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Sua missão é criar 3 Buyer Personas ULTRA-REALISTAS que representem os compradores REAIS dos produtos e serviços DESTE cliente.

ATENÇÃO MÁXIMA: Não confunda o projeto/serviço que a RevHackers está prestando (ex: crm_ops, consultoria) com o que o cliente vende. As personas devem ser os clientes DO cliente, baseadas firmemente na Análise do Site e no Segmento informados abaixo. IDENTIFIQUE o segmento real do cliente a partir do nome/site ANTES de gerar qualquer persona.

${context || ''}

Segmento: ${segment}
${ticket ? `Ticket Médio: ${ticket}` : ''}
${objective ? `Objetivo Estratégico: ${objective}` : ''}

INSTRUÇÕES CRÍTICAS DE PERSONALIZAÇÃO:
- PRIMEIRO identifique o que o cliente realmente vende/faz (a partir do nome da empresa e site). SÓ DEPOIS crie personas que sejam compradores desse produto/serviço.
- Se o contexto menciona produtos/serviços específicos, as personas DEVEM ser compradores IGUAIS aos que compram esses produtos.
- Se o contexto menciona público-alvo, as personas DEVEM estar nesse público.
- Se o contexto menciona tom de comunicação ou segmento, as dores e gatilhos devem refletir isso.
- Cada persona deve ser PSICOLOGICAMENTE distinta: um decisor (C-level), um influenciador técnico, um usuário final.
- Nomes brasileiros realistas. Bios que refletem carreiras brasileiras.
- O pitch_elevador deve ser uma frase que a equipe comercial do cliente poderia usar LITERALMENTE.
- NUNCA use o caractere em dash (travessão longo) - use apenas hífen simples (-), dois pontos (:) ou ponto (.).
- REGRA DE ORTOGRAFIA: todo texto DEVE usar português brasileiro correto com TODOS os acentos obrigatórios (é, á, ã, õ, ç, ê, ô, ú, í). Palavras como "negociação", "operação", "atualização", "previsão" DEVEM ter acentos.

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "personas": [
    {
      "nome": "Nome Sobrenome (brasileiro realista)",
      "cargo": "Cargo real no mercado brasileiro",
      "idade": "Ex: 35-45 anos",
      "genero": "M ou F",
      "bio_curta": "2-3 frases sobre trajetória, empresa onde trabalha (tipo realista) e momento de carreira. Conecte ao segmento do cliente.",
      "dores_principais": ["Dor profunda 1 conectada ao produto/serviço do cliente", "Dor 2 específica do cargo", "Dor 3 do mercado"],
      "ganhos_desejados": ["Ganho pessoal que o produto/serviço resolve", "Ganho profissional mensurável"],
      "objecoes_compra": ["Objeção real que este perfil teria ao avaliar o cliente", "Objeção financeira ou política"],
      "gatilhos_mentais": ["Gatilho que mais funciona para este perfil (ex: Autoridade, Prova Social, Urgência)", "Segundo gatilho"],
      "canais_favoritos": ["Canal real onde este perfil consome conteúdo", "Segundo canal", "Terceiro canal"],
      "pitch_elevador": "Uma frase direta, consultiva e de alto impacto que o vendedor do cliente usaria para este perfil."
    }
  ]
}
Gere EXATAMENTE 3 personas com TODOS os campos preenchidos. Todo texto DEVE ter acentuação correta em português.`;

    try {
        const result = await callOpenAI(apiKey, prompt);

        // Add robust avatar URLs ensuring gender match
        if (result?.personas && Array.isArray(result.personas)) {
            result.personas = result.personas.map((persona: any) => {
                // Remove prompt leaking if present (AI sometimes copies the instruction)
                let cleanBio = persona.bio_curta || '';
                if (cleanBio.includes('Pesquise o que')) {
                    cleanBio = cleanBio.split('- Empresa:')[0] + '.';
                }
                if (cleanBio.includes('Insight as service')) {
                    cleanBio = cleanBio.replace(/Software, Consultoria, Educação.*gerar análise\./gi, '').trim();
                }

                return {
                    ...persona,
                    bio_curta: cleanBio,
                    foto_url: null // Frontend usa iniciais do nome como avatar
                };
            });
        }

        return result;
    } catch (error) {
        console.error('Personas enrichment failed:', error);
        return null;
    }
}

async function enrichMarket(apiKey: string, segment: string, context?: string, competitors?: { nome: string, url?: string }[]): Promise<any> {

    let competitorsContext = '';
    if (competitors && competitors.length > 0) {
        competitorsContext = `
CONCORRENTES INFORMADOS PELO CLIENTE (ANALISE COM PRIORIDADE TOTAL):
${competitors.map(c => `- ${c.nome}${c.url ? ' (' + c.url + ')' : ''}`).join('\n')}

Voce DEVE analisar especificamente estes concorrentes acima com dados reais.
Se houver menos de 3 citados, complemente com outros players REAIS e RELEVANTES do segmento no Brasil.
`;
    }

    const prompt = `Você é o Analista de Inteligência Competitiva da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Sua missão é entregar uma análise de mercado estilo McKinsey/Bain, mas PERSONALIZADA para o negócio REAL deste cliente.

IMPORTANTE: PRIMEIRO identifique o que o cliente realmente faz/vende (a partir do nome da empresa e site no contexto abaixo). SÓ DEPOIS gere análise de mercado ESPECÍFICA para esse segmento.

${context || ''}

Mercado Alvo: ${segment} (Brasil)
${competitorsContext}

INSTRUÇÕES CRÍTICAS DE PERSONALIZAÇÃO:
- As tendências devem ser relevantes ao segmento ESPECÍFICO do cliente, não tendências genéricas de "B2B".
- Os concorrentes devem ser empresas REAIS que competem no mesmo espaço que o cliente.
- O SWOT deve refletir as oportunidades e ameaças para ESTE cliente especificamente, baseado nos pontos fracos/fortes identificados.
- O TAM/SAM/SOM deve usar dados realistas do mercado brasileiro para este segmento.
- Se a análise do site revelou pontos fracos ou diferenciais, use isso para contextualizar as oportunidades.
- NUNCA use o caractere em dash (travessão longo) - use apenas hífen simples (-), dois pontos (:) ou ponto (.).
- REGRA DE ORTOGRAFIA: todo texto DEVE usar português brasileiro correto com TODOS os acentos obrigatórios.

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "tendencias_2025": [
    { "titulo": "Tendência real e específica do segmento", "impacto": "Alto/Médio/Baixo", "descricao": "Explicação de 2-3 frases com dados concretos e impacto no negócio do cliente." }
  ],
  "concorrentes_benchmark": [
    {
      "nome": "Nome Real do Concorrente",
      "url": "URL se conhecida",
      "pontos_fortes": "2-3 forças específicas observáveis",
      "pontos_fracos": "2-3 fraquezas identificáveis",
      "diferencial": "O moat real deles - o que os torna difíceis de copiar",
      "posicionamento": "Como se posicionam no mercado e qual público atendem"
    }
  ],
  "analise_swot_rapida": {
    "oportunidades": ["Oportunidade específica para o cliente baseada no contexto", "Oportunidade 2 com base no mercado", "Oportunidade 3"],
    "ameacas": ["Ameaça real baseada na concorrência identificada", "Ameaça 2 de mercado"]
  },
  "tam_sam_som": {
    "tam": "Mercado Total com valor estimado em reais para o segmento no Brasil",
    "sam": "Mercado Endereçável com valor - o que o cliente poderia atingir",
    "som": "Mercado Capturável em 12-24 meses com a estratégia RevHackers"
  }
}
Gere de 3 a 5 concorrentes reais e pelo menos 3 tendências. Todo texto DEVE ter acentuação correta em português.`;

    try {
        return await callOpenAI(apiKey, prompt);
    } catch (error) {
        console.error('Market enrichment failed:', error);
        return null;
    }
}
