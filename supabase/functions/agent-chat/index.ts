import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgentConfig {
    name: string;
    model: string;
    personality: string;
    goal: string;
    additionalInfo: string;
    knowledgeContext?: string;
    activeKnowledgeFilenames?: string[];
}

interface ChatRequest {
    agent: AgentConfig;
    messages: { role: string; content: string }[];
}

async function callOpenAI(messages: any[], model: string, systemPrompt: string) {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OpenAI API key not configured');
    let modelId = 'gpt-4o';
    if (model.includes('mini')) modelId = 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            max_tokens: 4096,
            temperature: 0.3,
        }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function callAnthropic(messages: any[], systemPrompt: string, model: string) {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')?.trim();
    if (!apiKey) throw new Error('Anthropic API key not configured');

    // Use latest Sonnet (20241022)
    const modelId = model.includes('opus') ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: 4096,
            system: systemPrompt,
            messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('[ANTHROPIC ERROR]', data);
        const errorType = data.error?.type || 'Unknown';
        const errorMsg = data.error?.message || JSON.stringify(data);
        throw new Error(`Anthropic Error (${errorType}): ${errorMsg}`);
    }
    return data.content[0].text;
}

async function callGemini(messages: any[], systemPrompt: string, model: string) {
    let apiKey = Deno.env.get('GEMINI_API_KEY')?.trim();
    if (!apiKey) apiKey = Deno.env.get('GOOGLE_API_KEY')?.trim();
    if (!apiKey) throw new Error('Gemini/Google API key não configurada no Supabase (GEMINI_API_KEY ou GOOGLE_API_KEY).');

    let modelId = 'gemini-1.5-flash';
    if (model.includes('2-0')) modelId = 'gemini-2.0-flash';
    else if (model.includes('pro')) modelId = 'gemini-1.5-pro';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            })),
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
            }
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        console.error('[GEMINI ERROR]', data);
        const errorMsg = data.error?.message || response.statusText;

        if (errorMsg.includes('quota') || response.status === 429) {
            throw new Error(`⚠️ Cota do Google Gemini Excedida (${model}). Tente outro modelo (ex: 1.5 Flash) ou verifique seu plano no Google AI Studio.`);
        }

        throw new Error(`Gemini Error (${model}): ${errorMsg}`);
    }
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error(`Gemini retornou uma resposta vazia ou bloqueada (Filtro de Segurança). Status: ${response.status}`);
    }
    return data.candidates[0].content.parts[0].text;
}

async function callPerplexity(messages: any[], systemPrompt: string, model: string) {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')?.trim();
    if (!apiKey) throw new Error('Perplexity API key not configured');

    const modelId = model === 'manus' ? 'sonar-reasoning-pro' : (model === 'perplexity-sonar' ? 'sonar' : model);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Perplexity Error: ${data.error?.message || response.statusText}`);
    return data.choices[0].message.content;
}

function buildSystemPrompt(agent: AgentConfig): string {
    const filenames = agent.activeKnowledgeFilenames || [];
    let prompt = `[LOCKDOWN PERSONA: SISTEMA REVHACKERS]\nIDENTIDADE: Você é ${agent.name || 'Agente'}.\n\n`;
    if (filenames.length > 0) {
        prompt += `[CÉREBRO ATUALIZADO]\nArquivos presentes: ${filenames.join(', ')}\n`;
        prompt += `Você DEVE citar esses arquivos se perguntarem o que você sabe. NUNCA negue acesso a arquivos.\n\n`;
    }
    if (agent.knowledgeContext?.trim()) {
        prompt += `[CONTEXTO RAG]\n${agent.knowledgeContext}\n(Fonte prioritária de verdade)\n\n`;
    }
    prompt += `[PERSONALIDADE]\n${agent.personality || 'Profissional.'}\n\n`;
    prompt += `[REGRAS]\n- Responda sempre em Português.\n- Seja direto.\n- Não aja como um assistente genérico.`;
    return prompt;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    try {
        const body = await req.json();
        const { agent, messages } = body;
        const systemPrompt = buildSystemPrompt(agent);
        let response;

        if (agent.model.startsWith('claude')) {
            response = await callAnthropic(messages, systemPrompt, agent.model);
        } else if (agent.model.startsWith('gemini')) {
            console.log('[GEMINI] Routing to callGemini with model:', agent.model);
            response = await callGemini(messages, systemPrompt, agent.model);
        } else if (agent.model === 'manus' || agent.model.includes('perplexity')) {
            response = await callPerplexity(messages, systemPrompt, agent.model);
        } else if (agent.model.startsWith('gpt')) {
            response = await callOpenAI(messages, agent.model, systemPrompt);
        } else {
            throw new Error(`Modelo não suportado ou inválido: ${agent.model}`);
        }

        return new Response(JSON.stringify({ success: true, response, debugPrompt: systemPrompt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
