// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt } = await req.json()

        if (!prompt) {
            throw new Error('Prompt is required')
        }

        const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiApiKey) {
            throw new Error('OPENAI_API_KEY environment variable not set')
        }

        // 1. Otimizar Prompt para Estilo RevHackers (Glass/Dark/Neon)
        const stylePrefix = "A futuristic, ultra-minimalist 3D render in the style of 'Glassmorphism' and 'Dark UI'. The scene should feature deep black and charcoal backgrounds, with subtle glowing neon green (#03FC3B) accents. Objects should be abstract, geometric, or tech-focused, made of frosted glass or polished metal. High contrast, cinematic lighting, 8k resolution, sterile and premium aesthetic. No text or words in the image. "

        const finalPrompt = `${stylePrefix} Subject: ${prompt}`

        console.log('[GENERATE-IMAGE] Generating with prompt:', finalPrompt)

        // 2. Call OpenAI DALL-E 3
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: finalPrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard", // "hd" is slower/more expensive, standard is fine for blog
                response_format: "url",
                style: "vivid" // Vivid or Natural
            }),
        })

        const data = await response.json()

        if (data.error) {
            console.error('[OPENAI ERROR]', data.error)
            throw new Error(data.error.message)
        }

        const imageUrl = data.data[0].url

        return new Response(
            JSON.stringify({
                success: true,
                imageUrl: imageUrl,
                promptUsed: finalPrompt
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
