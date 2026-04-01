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

        console.log(`[INVITE-MEMBER] Disparando convite via Supabase Admin para: ${email}`);

        // ── Determine redirect URL ──────────────────────────────────────────
        // Priority: 1) caller-supplied redirectTo, 2) env var, 3) safe prod default
        // NOTE: This URL must be in the Supabase allowlist (Authentication → URL Configuration)
        const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://revhackers.com.br';
        const finalRedirectTo = redirectTo || `${siteUrl}/reset-password`;

        console.log(`[INVITE-MEMBER] redirectTo final: ${finalRedirectTo}`);

        // Generate Invite Link (Admin Auth Route)
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { 
                role: role || 'user',
                invited: true  // Flag used by the frontend to show "Create password" copy
            },
            redirectTo: finalRedirectTo
        });

        if (error) {
            console.error('[INVITE-MEMBER] Falha de comunicação com o Auth Server:', error);
            throw error;
        }

        console.log(`[INVITE-MEMBER] E-mail de convite despachado para ${email}.`);

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
