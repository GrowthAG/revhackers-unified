import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from seed-db!")

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // Seed Agent
        const { data, error } = await supabaseAdmin
            .from('agents')
            .upsert({
                id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                name: 'RevAssistant',
                role: 'Assistente Geral',
                model: 'claude-3-5-sonnet',
                system_prompt: 'Você é um assistente útil e inteligente da RevHackers.'
            }, { onConflict: 'id' })
            .select()

        if (error) {
            throw error
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Database seeded successfully!', data }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        })
    }
})
