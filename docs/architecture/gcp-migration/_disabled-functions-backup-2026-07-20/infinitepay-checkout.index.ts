// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

console.log("Hello from InfinitePay Checkout Edge Function!")

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { method, payload } = await req.json()
        const INFINITEPAY_API_KEY = Deno.env.get('INFINITEPAY_API_KEY')
        const INFINITEPAY_ENV = Deno.env.get('INFINITEPAY_ENV') || 'sandbox' // 'sandbox' or 'production'

        const baseUrl = INFINITEPAY_ENV === 'production'
            ? 'https://api.infinitepay.io/v2'
            : 'https://sandbox.api.infinitepay.io/v2'

        if (!INFINITEPAY_API_KEY) {
            throw new Error('Chave da InfinitePay não configurada no servidor.')
        }

        // Exemplo simplificado de Proxy Autenticado:
        // No mundo real, a InfinitePay tem endpoints de /transactions para cartão e /pix/orders para PIX.

        let responseData = {};

        if (method === 'pix') {
            // Criar cobrança PIX
            const res = await fetch(`${baseUrl}/pix/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${INFINITEPAY_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "amount": payload.amount,
                    "description": payload.description || "Pagamento RevHackers",
                    "payer": payload.payer || { "name": "Client", "document": "00000000000" }
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(JSON.stringify(data))
            responseData = data;

        } else if (method === 'credit_card') {
            // Processar Token do Cartão
            // V2: POST /transactions
            const res = await fetch(`${baseUrl}/transactions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${INFINITEPAY_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "amount": payload.amount,
                    "capture": true,
                    "token": payload.token,
                    "installments": payload.installments || 1,
                    "payment_method": "credit",
                    "billing_details": payload.billing_details
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(JSON.stringify(data))
            responseData = data;

            // Update Supabase Project Status IF approved
            if (data.status === 'approved' && payload.proposal_id) {
                 const supabaseAdmin = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                 )
                 await supabaseAdmin.from('proposals').update({ status: 'paid', crm_data: { deal_signed: true, infinitepay_tx: data.id } }).eq('id', payload.proposal_id)
            }
        }

        return new Response(JSON.stringify({ success: true, method, data: responseData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
