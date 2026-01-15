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
        const { cnpj } = await req.json()

        if (!cnpj) {
            return new Response(
                JSON.stringify({ error: 'CNPJ é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const cleanCnpj = cnpj.replace(/\D/g, '')
        console.log(`Searching CNPJ: ${cleanCnpj}`)

        // Call BrasilAPI
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)

        if (!response.ok) {
            console.error('BrasilAPI Error:', response.status, response.statusText)
            return new Response(
                JSON.stringify({ error: 'CNPJ não encontrado ou erro na API externa' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const data = await response.json()

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
