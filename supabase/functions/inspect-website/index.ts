import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as cheerio from "npm:cheerio"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { url } = await req.json()

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

        // @ts-ignore - Deno is available in Edge Functions runtime
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        const extractedData = {
            title,
            description,
            h1: h1.slice(0, 3),
            h2: h2.slice(0, 5),
            hasPixel,
            hasGTM,
            hasRD,
            hasHubspot,
            hasActiveCampaign,
            hasWordPress
        };

        if (!OPENAI_API_KEY) {
            console.warn('[inspect-website] OPENAI_API_KEY is not set. Returning pure scraping data.');
            return new Response(JSON.stringify({
                success: true,
                data: extractedData,
                ai_analysis: null
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log('[inspect-website] Calling OpenAI for Value Proposition analysis...');

        // Prepare OpenAI prompt
        const prompt = `Você é um Consultor Sênior de RevOps (Revenue Operations). 
Sua tarefa é analisar os dados extraídos da página inicial (Home Page) de um lead B2B e fornecer um "Micro-Dossiê de Gelo" para um vendedor usar na reunião de vendas que fará com essa empresa.

Site Alvo: ${targetUrl}

-- Dados brutos extraídos (SEO/Tags) --
Título SEO: ${title}
Meta Descrição: ${description}
Principais Títulos (H1): ${h1.slice(0, 3).join(' | ')}
Subtítulos (H2): ${h2.slice(0, 5).join(' | ')}

-- Dados Técnicos Extras (Scraping) --
Pixel da Meta (Facebook): ${hasPixel ? 'Instalado' : 'NÃO INSTALADO'}
Google Tag Manager: ${hasGTM ? 'Instalado' : 'NÃO INSTALADO'}
RD Station (Automação de Marketing Mkt): ${hasRD ? 'Encontrado' : 'Não Encontrado'}
HubSpot: ${hasHubspot ? 'Encontrado' : 'Não Encontrado'}

Por favor, seja direto, sem floreios, com tom sério e focado em gargalos (Gaps).
Retorne a análise em um objeto JSON exato:
{
  "proposta_de_valor_clara": true ou false,
  "resumo_proposta": "Resuma o que a empresa vende em apenas 1 frase curta baseada nos títulos (H1/H2).",
  "problema_identificado": "A mensagem do site foca demais no produto e pouco na dor do cliente? Há jargões demais? Aponte a pior falha de conversão percebida nos textos extraídos.",
  "sugestao_quebra_gelo": "Dê UMA frase tática em primeira pessoa que o vendedor pode usar para abrir a reunião. Ex: 'João, vi que o site de vocês tem uma proposta super legal no H1, mas notei que estão sem Pixel e GTM, devem estar desperdiçando tráfego nas campanhas...'"
}`;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
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
