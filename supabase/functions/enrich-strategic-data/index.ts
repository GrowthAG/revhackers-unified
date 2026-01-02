import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { segment, ticket, objective, isB2B, enrichmentType }: EnrichmentRequest = await req.json();

        if (!segment) {
            throw new Error('Segment is required');
        }

        const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

        if (!PERPLEXITY_API_KEY) {
            console.warn('PERPLEXITY_API_KEY not set, returning empty enrichment');
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

        // Execute requested enrichments
        if (enrichmentType === 'all' || enrichmentType === 'benchmark') {
            results.benchmark = await enrichBenchmark(PERPLEXITY_API_KEY, segment, ticket, isB2B);
        }

        if (enrichmentType === 'all' || enrichmentType === 'personas') {
            results.personas = await enrichPersonas(PERPLEXITY_API_KEY, segment, ticket, objective);
        }

        if (enrichmentType === 'all' || enrichmentType === 'market') {
            results.market = await enrichMarket(PERPLEXITY_API_KEY, segment);
        }

        console.log('Strategic enrichment completed for segment:', segment);

        return new Response(JSON.stringify(results), {
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

async function callPerplexity(apiKey: string, prompt: string): Promise<any> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sonar-reasoning-pro',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um consultor de negócios especializado em estratégia de Revenue Operations. Sempre responda APENAS com JSON válido, sem markdown, sem explicações adicionais.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 2000,
        }),
    });

    if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No content in response');
    }

    // Clean potential markdown wrappers and <think> blocks from sonar-reasoning-pro
    let cleanContent = content.trim();

    // Remove <think>...</think> blocks (reasoning from sonar-reasoning-pro)
    const thinkRegex = /<think>[\s\S]*?<\/think>/gi;
    cleanContent = cleanContent.replace(thinkRegex, '').trim();

    // Remove markdown code blocks
    if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
    cleanContent = cleanContent.trim();

    // Try to extract JSON object from the content if it contains other text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanContent = jsonMatch[0];
    }

    try {
        return JSON.parse(cleanContent);
    } catch (parseError) {
        console.error('Failed to parse Perplexity response:', cleanContent.substring(0, 200));
        throw new Error('Invalid JSON response from Perplexity');
    }
}

async function enrichBenchmark(apiKey: string, segment: string, ticket?: string, isB2B?: boolean): Promise<any> {
    const prompt = `
Pesquise benchmarks de mercado para empresas do segmento: ${segment}
${ticket ? `Ticket Médio: ${ticket}` : ''}
Modelo: ${isB2B ? 'B2B' : 'B2C/Misto'}

Retorne um JSON com esta estrutura:
{
  "cac_medio": "Valor médio de CAC do setor (ex: R$ 150 - R$ 300)",
  "taxa_conversao": "Taxa de conversão média de lead para cliente (ex: 3% - 8%)",
  "ciclo_vendas": "Ciclo de vendas médio em dias (ex: 30-60 dias)",
  "ltv_cac_ratio": "Ratio LTV/CAC saudável para o setor (ex: 3:1)",
  "ferramentas_principais": {
    "crm": ["HubSpot", "Pipedrive", "Salesforce"],
    "automacao": ["ActiveCampaign", "RD Station"],
    "ads": ["Meta Ads", "Google Ads", "LinkedIn Ads"]
  },
  "fonte": "Fonte ou base da pesquisa"
}`;

    try {
        return await callPerplexity(apiKey, prompt);
    } catch (error) {
        console.error('Benchmark enrichment failed:', error);
        return null;
    }
}

async function enrichPersonas(apiKey: string, segment: string, ticket?: string, objective?: string): Promise<any> {
    const prompt = `
Para uma empresa do segmento: ${segment}
${ticket ? `Ticket Médio: ${ticket}` : ''}
${objective ? `Objetivo Principal: ${objective}` : ''}

Gere 2 personas detalhadas do cliente ideal (ICP) para este negócio.

Retorne um JSON com esta estrutura:
{
  "personas": [
    {
      "nome": "Nome fictício representativo (ex: Carlos, o Diretor de Vendas)",
      "cargo": "Cargo típico",
      "idade": "Faixa etária",
      "empresa_tipo": "Tipo de empresa onde trabalha",
      "dores": ["Dor 1", "Dor 2", "Dor 3"],
      "motivacoes": ["Motivação 1", "Motivação 2"],
      "objecoes": ["Objeção comum 1", "Objeção comum 2"],
      "canais_preferidos": ["LinkedIn", "Email", "WhatsApp"],
      "gatilhos_compra": ["Quando busca solução", "Evento gatilho"]
    }
  ]
}`;

    try {
        return await callPerplexity(apiKey, prompt);
    } catch (error) {
        console.error('Personas enrichment failed:', error);
        return null;
    }
}

async function enrichMarket(apiKey: string, segment: string): Promise<any> {
    const prompt = `
Pesquise sobre o mercado de: ${segment} no Brasil em 2024-2025.

Retorne um JSON com esta estrutura:
{
  "tendencias": [
    { "titulo": "Tendência 1", "descricao": "Breve descrição" },
    { "titulo": "Tendência 2", "descricao": "Breve descrição" },
    { "titulo": "Tendência 3", "descricao": "Breve descrição" }
  ],
  "concorrentes_referencia": [
    { "nome": "Empresa 1", "diferencial": "O que fazem bem" },
    { "nome": "Empresa 2", "diferencial": "O que fazem bem" },
    { "nome": "Empresa 3", "diferencial": "O que fazem bem" }
  ],
  "oportunidades": ["Oportunidade 1", "Oportunidade 2"],
  "ameacas": ["Desafio/Ameaça 1", "Desafio/Ameaça 2"],
  "tamanho_mercado": "Estimativa do TAM/SAM se disponível"
}`;

    try {
        return await callPerplexity(apiKey, prompt);
    } catch (error) {
        console.error('Market enrichment failed:', error);
        return null;
    }
}
