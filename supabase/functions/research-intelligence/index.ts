import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
    type: 'benchmark' | 'personas' | 'market';
    segment: string;
    competitors?: string[]; // URLs or names
    objective?: string;
    context?: any;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, segment, competitors, objective, context }: ResearchRequest = await req.json();

        const FIRE_CRAWL_API_KEY = Deno.env.get('FIRE_CRAWL_API_KEY');
        const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        if (!TAVILY_API_KEY) throw new Error('Tavily API Key not configured');

        let researchResults = "";

        // 1. Tavily Search for broader context
        console.log(`Searching Tavily for: ${segment} ${type}...`);
        const tavilyRes = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: `Market research ${type} for ${segment} in Brazil 2025 ${objective || ''}`,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5
            })
        });

        const tavilyData = await tavilyRes.json();
        researchResults += `\n[TAVILY MARKET SEARCH]:\n${tavilyData.answer || 'No direct answer'}\n`;
        researchResults += tavilyData.results?.map((r: any) => `- ${r.title}: ${r.content}`).join('\n') || '';

        // 2. Firecrawl Scraping (if competitors provided)
        if (competitors && competitors.length > 0 && FIRE_CRAWL_API_KEY) {
            console.log(`Scraping competitors: ${competitors.join(', ')}...`);
            for (const url of competitors.slice(0, 2)) { // Limit to 2 for performance
                try {
                    const fcRes = await fetch('https://api.firecrawl.dev/v0/scrape', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${FIRE_CRAWL_API_KEY}`
                        },
                        body: JSON.stringify({
                            url: url.startsWith('http') ? url : `https://${url}`,
                            pageOptions: { onlyMainContent: true }
                        })
                    });
                    const fcData = await fcRes.json();
                    if (fcData.success) {
                        researchResults += `\n\n[FIRECRAWL SCRAPE - ${url}]:\n${fcData.data.content.substring(0, 3000)}...`;
                    }
                } catch (e) {
                    console.error(`Failed to scrape ${url}:`, e);
                }
            }
        }

        // 3. GPT-4o Processing (Synthesis)
        console.log('Synthesizing research with GPT...');
        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Você é um Analista de Inteligência de Mercado Sênior. 
            Sua tarefa é sintetizar dados brutos brutos de pesquisa (Tavily e Firecrawl) em um relatório estratégico para o mercado brasileiro.
            - Se o tipo for 'personas': Gere obrigatoriamente 3 personas ICPS detalhadas. Inclua dores_principais, ganhos_desejados, objecoes_compra, gatilhos_mentais e canais_favoritos.
            - Se o tipo for 'benchmark' ou 'market': Inclua obrigatoriamente de 3 a 5 concorrentes reais. Para cada um: nome, url, pontos_fortes, pontos_fracos, diferencial e posicionamento.
            Responda APENAS com um JSON estruturado seguindo o tipo solicitado: ${type}.`
                    },
                    {
                        role: 'user',
                        content: `Dados da Pesquisa:\n${researchResults}\n\nObjetivo: Gerar um ${type} para o segmento ${segment}.`
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const chatData = await chatRes.json();
        const synthesis = JSON.parse(chatData.choices[0].message.content);

        return new Response(JSON.stringify(synthesis), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Research Intelligence Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})
