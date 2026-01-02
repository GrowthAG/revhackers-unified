import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { messages, contextType, contextId, agentId, provider = 'openai', model } = await req.json();

        // 1. Fetch Agent configuration
        let agentSystemPrompt = "Você é um assistente útil da RevHackers.";
        if (agentId) {
            const { data: agent } = await supabaseClient
                .from('agents')
                .select('system_prompt')
                .eq('id', agentId)
                .single();
            if (agent) agentSystemPrompt = agent.system_prompt;
        }

        // 2. Build Context
        let contextData = "";
        if (contextType === 'article' && contextId) {
            contextData = `Contexto Adicional: O usuário está lendo o artigo ID ${contextId}.`;
        }
        const finalSystemPrompt = `${agentSystemPrompt}\n\n${contextData}`;

        // 3. Routing Logic
        let apiUrl = 'https://api.openai.com/v1/chat/completions';
        let apiKey = Deno.env.get('OPENAI_API_KEY');
        let requestBody: any = {};
        let headers: any = {
            'Content-Type': 'application/json',
        };

        switch (provider) {
            case 'openai':
                apiUrl = 'https://api.openai.com/v1/chat/completions';
                apiKey = Deno.env.get('OPENAI_API_KEY');
                requestBody = {
                    model: model || 'gpt-4o',
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        ...messages
                    ],
                    stream: true,
                };
                headers['Authorization'] = `Bearer ${apiKey}`;
                break;

            case 'anthropic':
                apiUrl = 'https://api.anthropic.com/v1/messages';
                apiKey = Deno.env.get('ANTHROPIC_API_KEY');
                requestBody = {
                    model: model || 'claude-3-opus-20240229',
                    max_tokens: 4096,
                    system: finalSystemPrompt,
                    messages: messages.map((m: any) => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })), // Anthropic doesn't support system role in messages array
                    stream: true,
                };
                headers['x-api-key'] = apiKey;
                headers['anthropic-version'] = '2023-06-01';
                break;

            case 'perplexity': // Uses OpenAI-compatible endpoint
                apiUrl = 'https://api.perplexity.ai/chat/completions';
                apiKey = Deno.env.get('PERPLEXITY_API_KEY');
                requestBody = {
                    model: model || 'sonar-reasoning-pro',
                    messages: [
                        { role: 'system', content: finalSystemPrompt },
                        ...messages
                    ],
                    stream: true,
                };
                headers['Authorization'] = `Bearer ${apiKey}`;
                break;

            case 'google': // Gemini (via Google AI Studio REST API)
                // Simplified implementation for Gemini
                apiKey = Deno.env.get('GOOGLE_API_KEY');
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:streamGenerateContent?key=${apiKey}`;
                requestBody = {
                    contents: messages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
                    systemInstruction: { parts: [{ text: finalSystemPrompt }] },
                };
                // Note: Gemini streaming format is different, might need a specialized transformer. 
                // For now, let's keep it simple or stick to standard providers if complexity is high.
                // We will skip Gemini implementation in this iteration to avoid stream breaking, focusing on OpenAI/Perplexity/Anthropic.
                throw new Error("Gemini provider pending verified streaming implementation.");

            default:
                throw new Error(`Provider ${provider} not supported.`);
        }

        if (!apiKey) throw new Error(`Missing API Key for ${provider}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const err = await response.text();
            return new Response(err, { status: 500, headers: corsHeaders });
        }

        // Stream passthrough
        return new Response(response.body, {
            headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
