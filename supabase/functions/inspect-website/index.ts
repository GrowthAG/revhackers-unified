// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import * as cheerio from "npm:cheerio"

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://www.revhackers.com.br',
    'https://revhackers.com.br',
    'https://app.revhackers.com.br',
    'https://app.revhackers.com'
];

function getCorsHeaders(req: Request) {
    const origin = req.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const origin = req.headers.get('Origin') || '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        console.warn(`[Shield] Rejected request from invalid origin: ${origin}`);
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: corsHeaders });
    }

    try {
        const clone = await req.clone();
        const textPayload = await clone.text();
        if (textPayload.length > 50000) {
            console.warn(`[Shield] Payload too large: ${textPayload.length} bytes`);
            return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: corsHeaders });
        }
        
        const { url, enriched } = JSON.parse(textPayload);

        if (!url) {
            throw new Error('URL is required')
        }

        // Ensure protocol
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        console.log(`[inspect-website] Fetching URL: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${targetUrl}: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract basic meta
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';

        // Extract headings
        const h1: string[] = [];
        $('h1').each((_: any, el: any) => { h1.push($(el).text().trim().replace(/\s+/g, ' ')); });
        const h2: string[] = [];
        $('h2').each((_: any, el: any) => { h2.push($(el).text().trim().replace(/\s+/g, ' ')); });

        // Check for common scripts and tools
        const hasPixel = html.includes('fbevents.js') || html.includes('fbq(');
        const hasGTM = html.includes('gtm.js') || html.includes('googletagmanager');
        const hasRD = html.includes('rdstation') || html.includes('rd-station');
        const hasHubspot = html.includes('hs-scripts') || html.includes('hubspot');
        const hasActiveCampaign = html.includes('vtrack') || html.includes('activecampaign');
        const hasWordPress = html.includes('wp-content') || html.includes('wp-includes');
        const hasGoogleAnalytics = html.includes('gtag') || html.includes('google-analytics') || html.includes('ga.js');
        const hasBlog = $('a[href*="/blog"]').length > 0 || $('a[href*="/artigos"]').length > 0;
        const hasChatbot = html.includes('tawk') || html.includes('intercom') || html.includes('drift') || html.includes('zendesk') || html.includes('crisp');

        // Extract body text for enriched analysis (first 3000 chars)
        let bodyText = '';
        if (enriched) {
            const paragraphs: string[] = [];
            $('p, li').each((_: any, el: any) => {
                const text = $(el).text().trim().replace(/\s+/g, ' ');
                if (text.length > 20) paragraphs.push(text);
            });
            bodyText = paragraphs.slice(0, 30).join('\n').substring(0, 3000);
        }

        // @ts-ignore - Deno is available in Edge Functions runtime
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        const extractedData = {
            title,
            description,
            h1: h1.slice(0, 3),
            h2: h2.slice(0, 8),
            hasPixel,
            hasGTM,
            hasGoogleAnalytics,
            hasRD,
            hasHubspot,
            hasActiveCampaign,
            hasWordPress,
            hasBlog,
            hasChatbot,
        };

        if (!OPENAI_API_KEY) {
            console.warn('[inspect-website] OPENAI_API_KEY is not set. Returning pure scraping data.');
            return new Response(JSON.stringify({
                success: true,
                data: extractedData,
                ai_analysis: null
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`[inspect-website] Calling OpenAI (enriched=${!!enriched})...`);

        // Tools summary for AI context
        const toolsSummary = [
            hasPixel ? 'Meta Pixel' : null,
            hasGTM ? 'Google Tag Manager' : null,
            hasGoogleAnalytics ? 'Google Analytics' : null,
            hasRD ? 'RD Station' : null,
            hasHubspot ? 'HubSpot' : null,
            hasActiveCampaign ? 'ActiveCampaign' : null,
            hasWordPress ? 'WordPress' : null,
            hasBlog ? 'Blog ativo' : null,
            hasChatbot ? 'Chatbot' : null,
        ].filter(Boolean).join(', ') || 'Nenhuma ferramenta detectada';

        // Base data context (shared between both modes)
        const dataContext = `Site Alvo: ${targetUrl}

-- Dados brutos extraidos (SEO/Tags) --
Titulo SEO: ${title}
Meta Descricao: ${description}
Principais Titulos (H1): ${h1.slice(0, 3).join(' | ')}
Subtitulos (H2): ${h2.slice(0, 8).join(' | ')}

-- Ferramentas e Integrações Detectadas --
${toolsSummary}

-- Dados Tecnicos --
Pixel da Meta (Facebook): ${hasPixel ? 'Instalado' : 'NAO INSTALADO'}
Google Tag Manager: ${hasGTM ? 'Instalado' : 'NAO INSTALADO'}
RD Station: ${hasRD ? 'Encontrado' : 'Nao Encontrado'}
HubSpot: ${hasHubspot ? 'Encontrado' : 'Nao Encontrado'}
Blog: ${hasBlog ? 'Encontrado' : 'Nao Encontrado'}
Chatbot: ${hasChatbot ? 'Encontrado' : 'Nao Encontrado'}`;

        let prompt: string;

        if (enriched) {
            // ENRICHED MODE: Full business context extraction for strategic planning
            prompt = `Voce e um Consultor Senior de Growth e Revenue Operations.
Sua tarefa e analisar os dados extraidos do site de um cliente e extrair o MAXIMO de contexto de negocio possivel para alimentar um planejamento estrategico.

${dataContext}

-- Conteudo do Site (Texto extraido) --
${bodyText || '(Nao foi possivel extrair texto do corpo)'}

REGRA: NUNCA use o caractere em dash (travessao longo). Use apenas hifen simples (-), dois pontos (:), ponto (.) ou virgula (,).
AVALIAÇÃO DE MATURIDADE: Um site só pode receber status "avançada" se tiver Pixel E Google Tag Manager E Ferramenta de Automação/CRM detectados simultaneamente. Caso não possua ferramentas avançadas, force status "básica" ou "intermediária".

Retorne a analise em um objeto JSON exato com TODOS os campos abaixo. Para as notas de \`technical_scores\` (0 a 100), estime-as validando rigorosamente a presenca de ferramentas, uso de titulos e metatags.
{
  "proposta_de_valor_clara": true ou false,
  "resumo_proposta": "Resuma o que a empresa faz/vende em 1-2 frases curtas e diretas.",
  "segmento": "Segmento de mercado (ex: 'SaaS B2B', 'E-commerce moda', 'Consultoria financeira', 'Industria metalurgica')",
  "publico_alvo": "Quem e o cliente ideal da empresa baseado no conteudo do site",
  "produtos_servicos": ["Lista", "dos", "principais", "produtos", "ou", "servicos"],
  "diferenciais": "O que a empresa destaca como diferencial competitivo no site",
  "maturidade_digital": "basica, intermediaria ou avancada - baseado ESTRITAMENTE no checklist de ferramentas acima.",
  "tom_comunicacao": "formal, informal, tecnico ou aspiracional",
  "pontos_fracos_site": ["Lista de problemas observados: falta de CTA, sem blog, design datado, mensagem confusa, etc"],
  "ferramentas_detectadas": "${toolsSummary}",
  "problema_identificado": "Principal gap de conversao ou posicionamento observado no site",
  "oportunidades_estrategicas": ["Lista de 3-5 oportunidades de growth baseadas na analise"],
  "tech_stack": ["Google Analytics", "Meta Pixel", "WordPress"],
  "technical_scores": {
    "performance": 85,
    "seo": 92,
    "accessibility": 88,
    "bestPractices": 90
  }
}`;
        } else {
            // STANDARD MODE: Quick ice-breaker dossier (original behavior)
            prompt = `Voce e um Consultor Senior de RevOps (Revenue Operations).
Sua tarefa e analisar os dados extraidos da pagina inicial (Home Page) de um lead B2B e fornecer um "Micro-Dossie de Gelo" para um vendedor usar na reuniao de vendas que fara com essa empresa.

${dataContext}

Por favor, seja direto, sem floreios, com tom serio e focado em gargalos (Gaps).
REGRA: NUNCA use o caractere em dash (travessao longo). Use apenas hifen simples (-), dois pontos (:), ponto (.) ou virgula (,).

Retorne a analise em um objeto JSON exato:
{
  "proposta_de_valor_clara": true ou false,
  "resumo_proposta": "Resuma o que a empresa vende em apenas 1 frase curta baseada nos titulos (H1/H2).",
  "problema_identificado": "A mensagem do site foca demais no produto e pouco na dor do cliente? Ha jargoes demais? Aponte a pior falha de conversao percebida nos textos extraidos.",
  "sugestao_quebra_gelo": "De UMA frase tatica em primeira pessoa que o vendedor pode usar para abrir a reuniao."
}`;
        }

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.4',
                messages: [
                    { role: 'system', content: 'Responda APENAS com o JSON solicitado, válido e sem marcações Markdown.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

        if (!aiResponse.ok) {
            console.error('[inspect-website] OpenAI Error:', await aiResponse.text());
            throw new Error('Falha ao processar análise via OpenAI');
        }

        const aiData = await aiResponse.json();
        let ai_analysis = null;

        if (aiData.choices && aiData.choices[0] && aiData.choices[0].message) {
            try {
                ai_analysis = JSON.parse(aiData.choices[0].message.content);
            } catch (e) {
                console.error('[inspect-website] Failed to parse OpenAI response:', aiData.choices[0].message.content);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            data: extractedData,
            ai_analysis
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        console.error('[inspect-website] Execution failed:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
