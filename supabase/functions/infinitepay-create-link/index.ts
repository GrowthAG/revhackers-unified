import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, order_nsu, redirect_url } = await req.json()

    console.log("Generating link for NSU:", order_nsu, "Amount:", amount)

    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/infinitepay-webhook`;

    const payload = {
      handle: "usefunnels",
      order_nsu: order_nsu,
      redirect_url: redirect_url,
      webhook_url: webhookUrl,
      items: [
        {
          quantity: 1,
          price: amount,
          description: `Setup Estratégico RevHackers`
        }
      ]
    }

    const ipResponse = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await ipResponse.json()

    if (!ipResponse.ok) {
        console.error("InfinitePay Link Error:", data)
    }

    // Return the response back to the client
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Proxy Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
