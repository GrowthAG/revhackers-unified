import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
    type: 'benchmark' | 'personas' | 'market';
    segment: string;
    competitors?: { nome: string, url?: string }[];
    objective?: string;
    context?: any;
}

// ============================================================
// OPENAI API CALL (GPT-5.4 - Deep Research synthesis)
// ============================================================

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-5.4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.4,
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
// TYPE-SPECIFIC PROMPTS (Deep Research - more detailed than enrich)
// ============================================================

function getBenchmarkPrompt(segment: string, objective?: string, context?: any): string {
    return `Segmento: ${segment}
Objetivo: ${objective || 'crescimento'}
${context ? `Contexto adicional do diagnóstico: ${JSON.stringify(context).substring(0, 2000)}` : ''}

Tarefa: Gere um BENCHMARK DE MERCADO profundo e detalhado para este segmento no Brasil.
Use dados realistas baseados no conhecimento de mercado. Cite empresas reais.

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "cac_medio": "Valor monetário (ex: R$ 350,00)",
  "taxa_conversao": "Porcentagem (ex: 2.8%)",
  "ciclo_vendas": "Tempo (ex: 45 dias)",
  "ltv_cac_ratio": "Ratio (ex: 4:1)",
  "ferramentas_principais": {
    "crm": ["CRM 1", "CRM 2", "CRM 3"],
    "automacao": ["Ferramenta 1", "Ferramenta 2"],
    "ads": ["Canal 1", "Canal 2"]
  },
  "comparativo_mercado": "Análise de 3-4 frases sobre o cenário competitivo deste segmento",
  "fonte": "Deep Research GPT-5.4"
}`;
}

function getPersonasPrompt(segment: string, objective?: string, context?: any): string {
    return `Segmento: ${segment}
Objetivo: ${objective || 'crescimento'}
${context ? `Contexto adicional do diagnóstico: ${JSON.stringify(context).substring(0, 2000)}` : ''}

Tarefa: Crie 3 BUYER PERSONAS ultra-detalhadas para este mercado no Brasil.
Cada persona deve ser psicologicamente realista, com nomes brasileiros, e ter profundidade analítica.

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "personas": [
    {
      "nome": "Nome Sobrenome Brasileiro",
      "cargo": "Cargo (ex: VP de Vendas)",
      "idade": "Ex: 38-45 anos",
      "genero": "M ou F",
      "bio_curta": "2-3 frases sobre trajetória e momento de carreira",
      "empresa_tipo": "Tipo de empresa (ex: SaaS B2B com 50-200 funcionários)",
      "dores_principais": ["Dor profunda 1 (específica ao cargo)", "Dor 2", "Dor 3"],
      "ganhos_desejados": ["Ganho pessoal 1", "Ganho profissional 2"],
      "objecoes_compra": ["Objeção tática 1", "Objeção financeira 2", "Objeção política 3"],
      "gatilhos_mentais": ["Gatilho 1 (ex: Autoridade)", "Gatilho 2 (ex: Escassez)"],
      "canais_favoritos": ["Canal 1 (ex: LinkedIn)", "Canal 2", "Canal 3"],
      "pitch_elevador": "Uma frase de alto impacto para essa persona"
    }
  ]
}
Gere EXATAMENTE 3 personas com todos os campos preenchidos.`;
}

function getMarketPrompt(segment: string, competitors?: { nome: string, url?: string }[], objective?: string, context?: any): string {
    let competitorsBlock = '';
    if (competitors && competitors.length > 0) {
        competitorsBlock = `
CONCORRENTES CITADOS PELO CLIENTE (analise estes com PRIORIDADE):
${competitors.map(c => `- ${c.nome}${c.url ? ' (' + c.url + ')' : ''}`).join('\n')}
`;
    }

    return `Segmento: ${segment} (Brasil)
Objetivo: ${objective || 'crescimento'}
${competitorsBlock}
${context ? `Contexto do diagnóstico: ${JSON.stringify(context).substring(0, 2000)}` : ''}

Tarefa: Análise de INTELIGÊNCIA DE MERCADO profunda, estilo consultoria McKinsey/Bain.
Analise os concorrentes citados com dados realistas. Complemente com 2-3 concorrentes reais se necessário.

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "tendencias_2025": [
    { "titulo": "Tendência real", "impacto": "Alto/Médio/Baixo", "descricao": "Explicação de 2-3 frases com dados" }
  ],
  "concorrentes_benchmark": [
    {
      "nome": "Nome Real",
      "url": "URL se conhecida",
      "pontos_fortes": "2-3 forças específicas",
      "pontos_fracos": "2-3 fraquezas identificáveis",
      "diferencial": "O moat deles",
      "posicionamento": "Como se posicionam no mercado"
    }
  ],
  "analise_swot_rapida": {
    "oportunidades": ["Oportunidade específica 1", "Oportunidade 2", "Oportunidade 3"],
    "ameacas": ["Ameaça real 1", "Ameaça 2"]
  },
  "tam_sam_som": {
    "tam": "Mercado Total com valor estimado",
    "sam": "Mercado Endereçável com valor",
    "som": "Mercado Capturável em 12-24 meses"
  }
}
Gere de 3 a 5 concorrentes reais e pelo menos 3 tendências.`;
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, segment, competitors, objective, context }: ResearchRequest = await req.json();

        if (!type || !segment) {
            throw new Error('Missing required fields: type, segment');
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`[research-intelligence] Deep ${type} research for: ${segment}`);

        const systemPrompt = `Você é um Analista de Inteligência de Mercado Sênior com 15+ anos de experiência em consultoria estratégica.
Sua especialidade é análise competitiva, market sizing e buyer persona development para o mercado brasileiro B2B.
Responda APENAS com JSON válido. Sem markdown, sem explicações extras. Dados realistas e específicos.
NUNCA use o caractere em dash (travessão longo) - use apenas hífen simples (-), dois pontos (:) ou ponto (.).`;

        let userPrompt: string;
        switch (type) {
            case 'benchmark':
                userPrompt = getBenchmarkPrompt(segment, objective, context);
                break;
            case 'personas':
                userPrompt = getPersonasPrompt(segment, objective, context);
                break;
            case 'market':
                userPrompt = getMarketPrompt(segment, competitors, objective, context);
                break;
            default:
                throw new Error(`Invalid research type: ${type}`);
        }

        const result = await callOpenAI(apiKey, systemPrompt, userPrompt);

        // Add avatar URLs for personas
        if (type === 'personas' && result?.personas && Array.isArray(result.personas)) {
            result.personas = result.personas.map((persona: any) => {
                const gender = persona.genero?.toLowerCase().startsWith('f') ? 'women' : 'men';
                const avatarId = Math.floor(Math.random() * 75) + 1;
                return {
                    ...persona,
                    foto_url: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`
                };
            });
        }

        console.log(`[research-intelligence] Deep ${type} completed successfully`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('[research-intelligence] Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})
