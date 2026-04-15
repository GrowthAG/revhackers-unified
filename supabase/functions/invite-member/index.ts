import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Step 1: Extract caller JWT.
        const authHeader = req.headers.get('Authorization') ?? '';
        if (!authHeader.startsWith('Bearer ')) {
            return json(401, { error: 'Authorization header ausente ou invalido' });
        }

        // Step 2: Client ancorado ao JWT do chamador (respeita RLS e popula auth.uid()).
        const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
        if (userErr || !userData?.user) {
            return json(401, { error: 'JWT invalido ou expirado' });
        }
        const callerId = userData.user.id;

        // Step 3: Lookup role do chamador via profiles (com JWT dele, nao service role).
        const { data: callerProfile, error: profErr } = await supabaseUser
            .from('profiles')
            .select('role')
            .eq('id', callerId)
            .single();

        if (profErr || !callerProfile) {
            return json(403, { error: 'Perfil do solicitante nao encontrado' });
        }

        const callerRole = callerProfile.role as string | null;
        const allowedCallerRoles = ['super_admin', 'admin'];
        if (!callerRole || !allowedCallerRoles.includes(callerRole)) {
            return json(403, { error: 'Permissao insuficiente para convidar usuarios' });
        }

        // Step 4: Validar payload.
        const { email, role: requestedRole, redirectTo } = await req.json();
        if (!email) {
            return json(400, { error: 'O campo email e obrigatorio' });
        }
        const finalRole = (requestedRole as string) || 'user';

        // Step 5: Escalacao de privilegio: apenas super_admin pode conceder admin/super_admin.
        const elevatedRoles = ['admin', 'super_admin'];
        if (elevatedRoles.includes(finalRole) && callerRole !== 'super_admin') {
            return json(403, {
                error: 'Apenas super_admin pode conceder roles admin ou super_admin',
            });
        }

        // Step 6: Agora sim, elevar para SERVICE_ROLE para disparar convite no Auth.
        const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://revhackers.com.br';
        const finalRedirectTo = redirectTo || `${siteUrl}/reset-password`;

        console.log(
            `[INVITE-MEMBER] caller=${callerId} callerRole=${callerRole} invitee=${email} newRole=${finalRole}`
        );

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                role: finalRole,
                invited: true,
            },
            redirectTo: finalRedirectTo,
        });

        if (error) {
            console.error('[INVITE-MEMBER] Auth server error:', error);
            return json(500, { error: error.message });
        }

        return json(200, {
            success: true,
            message: 'E-mail de convite enviado via Supabase Auth',
            userId: data.user.id,
        });

    } catch (error: any) {
        console.error('[INVITE-MEMBER] Unexpected error:', error);
        return json(500, { error: error.message || 'Erro interno ao processar convite' });
    }
});
