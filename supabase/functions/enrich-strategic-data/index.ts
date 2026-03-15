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
    rei_responses?: any; // Contexto completo do diagnóstico
    competitors?: { nome: string, url?: string }[]; // New field
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { segment, ticket, objective, isB2B, enrichmentType, rei_responses, competitors }: EnrichmentRequest = await req.json();

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

        // Prepare context string from REI responses for better AI context
        const reiContext = rei_responses ? JSON.stringify(rei_responses) : '';

        // Execute requested enrichments
        if (enrichmentType === 'all' || enrichmentType === 'benchmark') {
            results.benchmark = await enrichBenchmark(OPENAI_API_KEY, segment, ticket, isB2B, reiContext);
        }

        if (enrichmentType === 'all' || enrichmentType === 'personas') {
            results.personas = await enrichPersonas(OPENAI_API_KEY, segment, ticket, objective, reiContext);
        }

        if (enrichmentType === 'all' || enrichmentType === 'market') {
            // Pass competitors to market enrichment
            results.market = await enrichMarket(OPENAI_API_KEY, segment, reiContext, competitors);
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
// OPENAI API CALL (GPT-4o-mini — replaces Perplexity sonar-reasoning-pro)
// ============================================================

async function callOpenAI(apiKey: string, prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-5.4',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um consultor de negócios sênior, especialista em análise de mercado, construção de personas e estratégia de crescimento (Growth Hacking). Responda sempre com dados técnicos, realistas e focados no mercado brasileiro. A resposta DEVE ser APENAS um JSON válido. Não inclua blocos ```json nem explicações extras.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
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
    } catch (parseError) {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('Invalid JSON response from OpenAI');
    }
}

async function enrichBenchmark(apiKey: string, segment: string, ticket?: string, isB2B?: boolean, context?: string): Promise<any> {
    const prompt = `
Contexto do Cliente (REI): ${context || 'N/A'}
Segmento de Atuação: ${segment}
${ticket ? `Ticket Médio: ${ticket}` : ''}
Modelo de Negócio: ${isB2B ? 'B2B (Business to Business)' : 'B2C (Business to Consumer)'}

OBJETIVO: Gerar benchmarks REAIS e atualizados do mercado brasileiro para este segmento específico. Não invente números, use médias de mercado aceitáveis.

Retorne um JSON EXATAMENTE com esta estrutura (respeite as chaves):
{
  "cac_medio": "Valor monetário estimado (ex: R$ 250,00)",
  "taxa_conversao": "Porcentagem média (Lead -> Cliente) (ex: 2.5%)",
  "ciclo_vendas": "Tempo médio (ex: 45 dias)",
  "ltv_cac_ratio": "Ratio ideal (ex: 4:1)",
  "ferramentas_principais": {
    "crm": ["Nome Ferramenta 1", "Nome Ferramenta 2"],
    "automacao": ["Nome Ferramenta 1", "Nome Ferramenta 2"],
    "ads": ["Canal 1", "Canal 2"]
  },
  "comparativo_mercado": "Uma frase curta comparando a dificuldade deste nicho (ex: 'Alta competitividade no Google Ads, sugerimos foco em LinkedIn')."
}`;

    try {
        return await callOpenAI(apiKey, prompt);
    } catch (error) {
        console.error('Benchmark enrichment failed:', error);
        return null;
    }
}

async function enrichPersonas(apiKey: string, segment: string, ticket?: string, objective?: string, context?: string): Promise<any> {
    const prompt = `
Contexto do Cliente (REI): ${context || 'N/A'}
Segmento: ${segment}
${ticket ? `Ticket Médio: ${ticket}` : ''}
${objective ? `Objetivo Estratégico: ${objective}` : ''}

Tarefa: Desenvolver 3 Buyer Personas (ICPs) extremamente detalhadas para este negócio, com foco e nomes brasileiros.
A análise deve ser profunda e psicológica, identificando motivadores reais de compra.

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "personas": [
    {
      "nome": "Nome Sobrenome (Brasileiro)",
      "cargo": "Cargo Profissional",
      "idade": "Ex: 35-45 anos",
      "genero": "M ou F",
      "bio_curta": "Resumo da trajetória e momento de carreira.",
      "dores_principais": ["Dor profunda 1", "Dor profunda 2", "Dor profunda 3"],
      "ganhos_desejados": ["O que ele quer ganhar 1", "O que ele quer ganhar 2"],
      "objecoes_compra": ["Objeção tática 1", "Objeção financeira 2"],
      "gatilhos_mentais": ["Gatilho que mais funciona (ex: Autoridade)", "Prova Social"],
      "canais_favoritos": ["LinkedIn", "Portais do Setor", "Grupos WhatsApp"],
      "pitch_elevador": "Uma frase de alto impacto que fala diretamente à dor deste perfil."
    }
  ]
}
Gere obrigatoriamente 3 personas detalhadas.`;

    try {
        const result = await callOpenAI(apiKey, prompt);

        // Add robust avatar URLs
        if (result?.personas && Array.isArray(result.personas)) {
            result.personas = result.personas.map((persona: any) => {
                const gender = persona.genero?.toLowerCase().startsWith('f') ? 'women' : 'men';
                const avatarId = Math.floor(Math.random() * 75) + 1;
                return {
                    ...persona,
                    foto_url: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`
                };
            });
        }

        return result;
    } catch (error) {
        console.error('Personas enrichment failed:', error);
        return null;
    }
}

// Updated enrichMarket to use Competitors
async function enrichMarket(apiKey: string, segment: string, context?: string, competitors?: { nome: string, url?: string }[]): Promise<any> {

    let competitorsContext = '';
    if (competitors && competitors.length > 0) {
        competitorsContext = `
CONCORRENTES MENCIONADOS PELO CLIENTE (PRIORIDADE TOTAL NA ANÁLISE):
${competitors.map(c => `- ${c.nome} ${c.url ? '(' + c.url + ')' : ''}`).join('\n')}

IMPORTANTE: Você deve analisar especificamente estes concorrentes acima, listando seus posicionamentos reais.
Se houver menos de 3 citados, complemente com outros players REAIS e RELEVANTES do mercado.
`;
    }

    const prompt = `
Contexto do Cliente: ${context || 'N/A'}
Mercado Alvo: ${segment} (Brasil)
${competitorsContext}

Tarefa: Análise estratégica de mercado e competitiva estilo "Consultoria Premium".
Analise os concorrentes citados com dados realistas.

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "tendencias_2025": [
    { "titulo": "Nome da Tendência", "impacto": "Alto/Médio/Baixo", "descricao": "Explicação estratégica detalhada." },
    { "titulo": "Nome da Tendência", "impacto": "Alto/Médio/Baixo", "descricao": "Explicação estratégica detalhada." }
  ],
  "concorrentes_benchmark": [
    {
      "nome": "Nome do Concorrente",
      "url": "URL se conhecida",
      "pontos_fortes": "Lista de forças",
      "pontos_fracos": "Lista de fraquezas",
      "diferencial": "O 'moat' deles",
      "posicionamento": "Como eles se vendem no mercado"
    }
  ],
  "analise_swot_rapida": {
    "oportunidades": ["Oportunidade 1", "Oportunidade 2"],
    "ameacas": ["Ameaça 1", "Ameaça 2"]
  },
  "tam_sam_som": {
    "tam": "Valor ou descrição do Mercado Total",
    "sam": "Valor ou descrição do Mercado Endereçável",
    "som": "Valor ou descrição do Mercado que podemos capturar"
  }
}
Gere de 3 a 5 concorrentes reais.`;

    try {
        return await callOpenAI(apiKey, prompt);
    } catch (error) {
        console.error('Market enrichment failed:', error);
        return null;
    }
}
