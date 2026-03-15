
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { url, strategy = 'mobile' } = await req.json()

        if (!url) {
            throw new Error('URL is required')
        }

        const apiKey = Deno.env.get('PSI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
        if (!apiKey) {
            throw new Error('PSI_API_KEY or GOOGLE_API_KEY not configured');
        }

        console.log(`[Analyze Site] Analyzing ${url} with strategy ${strategy}...`)

        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=seo&locale=pt-BR`;

        console.log(`[Analyze Site] Fetching from Google PSI...`)

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error(`[Analyze Site] Google API Error:`, data);
            return new Response(JSON.stringify({ error: data.error, details: data }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        console.log(`[Analyze Site] Success! Score: ${data.lighthouseResult?.categories?.performance?.score}`);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error(`[Analyze Site] Error:`, error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
