import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, role, redirectTo } = await req.json();

        if (!email) {
            throw new Error('O e-mail é obrigatório para o convite.');
        }

        // Connect with Service Role (Admin Powers)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                }
            }
        );

        console.log(`[INVITE-MEMBER] Disparando Link Magico via API do Supabase Admin para: ${email}`);

        // Generate Invite Link (Admin Auth Route)
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { 
                role: role || 'user',
                invited: true
            },
            redirectTo: redirectTo || `${Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173'}/auth/reset-password`
        });

        if (error) {
            console.error('[INVITE-MEMBER] Falha de comunicação com o Auth Server:', error);
            throw error;
        }

        // O Frontend já está gravando na tabela invitations internamente.
        // Mas a porta de segurança do provedor de Auth é quem envia o e-mail real.
        console.log(`[INVITE-MEMBER] E-mail despachado para ${email}.`);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'E-mail de convite enviado via Supabase Auth!',
                userId: data.user.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error('[INVITE-MEMBER] Erro de Servidor:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Erro ao comunicar com provedor SMTP.' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
