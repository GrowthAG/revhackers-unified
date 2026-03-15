import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================
// PERPLEXITY API CALL (follows enrich-strategic-data pattern)
// ============================================================

async function callPerplexity(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.1,
        }),
    });

    if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No content in Perplexity response');
    }

    let cleanContent = content.trim();

    // Remove <think>...</think> blocks (reasoning from sonar-reasoning models)
    const thinkRegex = /<think>[\s\S]*?<\/think>/gi;
    cleanContent = cleanContent.replace(thinkRegex, '').trim();

    // Remove markdown code blocks
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
        console.error('Failed to parse Perplexity response:', cleanContent.substring(0, 200));
        throw new Error('Failed to parse AI response as JSON');
    }
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `Você é um analista de inteligência de mercado sênior focado em B2B e SaaS.
Analise o segmento e objetivo fornecidos.
Retorne APENAS um JSON válido (sem markdown) seguindo estritamente este esquema:
{
    "industry_trends": ["Tendência 1", "Tendência 2"],
    "competitor_benchmarks": [
        {"company_name": "Empresa A", "key_metric": "CAC estimado R$ X", "strategy_insight": "Usa estratégia Y"},
        {"company_name": "Empresa B", "key_metric": "Ticket Médio", "strategy_insight": "Foco em Enterprise"},
        {"company_name": "Empresa C", "key_metric": "Growth Rate", "strategy_insight": "PLG"}
    ],
    "market_sizing": {
        "tam": "Descrição do Mercado Total",
        "sam": "Descrição do Mercado Endereçável",
        "som": "Descrição do Mercado que podemos capturar"
    },
    "personas": [
        {
            "name": "Nome da Persona 1",
            "role": "Cargo (ex: Diretor Comercial)",
            "pain": "Principal dor específica (ex: Falta de visibilidade)",
            "trigger": "Gatilho de compra (ex: Troca de gestão)",
            "message": "Pitch de 1 frase para essa persona",
            "wiifm": "O que ela ganha pessoalmente (ex: Promoção, menos estresse)"
        },
        { "name": "Nome 2", "role": "Cargo 2", "pain": "Dor 2", "trigger": "Gatilho 2", "message": "Msg 2", "wiifm": "Ganho 2" },
        { "name": "Nome 3", "role": "Cargo 3", "pain": "Dor 3", "trigger": "Gatilho 3", "message": "Msg 3", "wiifm": "Ganho 3" }
    ],
    "strategic_advice": "Um conselho matador em português focado em crescimento."
}`;

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { segment, objective } = await req.json();

        if (!segment || !objective) {
            throw new Error('Missing required fields: segment, objective');
        }

        const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
        if (!apiKey) {
            throw new Error('PERPLEXITY_API_KEY not configured');
        }

        console.log(`[market-intelligence] Processing: segment="${segment}", objective="${objective}"`);

        const result = await callPerplexity(
            apiKey,
            SYSTEM_PROMPT,
            `Segmento: ${segment}. Objetivo: ${objective}`
        );

        console.log(`[market-intelligence] Success: ${result.competitor_benchmarks?.length || 0} competitors found`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`[market-intelligence] Error:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
