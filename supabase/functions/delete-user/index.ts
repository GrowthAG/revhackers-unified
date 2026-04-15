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
        // Step 1: Extrair JWT.
        const authHeader = req.headers.get('Authorization') ?? '';
        if (!authHeader.startsWith('Bearer ')) {
            return json(401, { error: 'Authorization header ausente ou invalido' });
        }

        // Step 2: Client ancorado no JWT do chamador.
        const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
        if (userErr || !userData?.user) {
            return json(401, { error: 'JWT invalido ou expirado' });
        }
        const callerId = userData.user.id;

        // Step 3: Lookup role do chamador.
        const { data: callerProfile, error: profErr } = await supabaseUser
            .from('profiles')
            .select('role')
            .eq('id', callerId)
            .single();

        if (profErr || !callerProfile) {
            return json(403, { error: 'Perfil do solicitante nao encontrado' });
        }

        if (callerProfile.role !== 'super_admin') {
            return json(403, { error: 'Apenas super_admin pode deletar usuarios' });
        }

        // Step 4: Validar payload.
        const { userId } = await req.json();
        if (!userId) {
            return json(400, { error: 'O campo userId e obrigatorio' });
        }

        // Defesa: impede auto-delecao do super_admin que dispara a chamada.
        if (userId === callerId) {
            return json(400, { error: 'Voce nao pode deletar a si proprio' });
        }

        // Step 5: Elevar para SERVICE_ROLE apenas apos validacao.
        const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        console.log(`[DELETE-USER] caller=${callerId} (super_admin) target=${userId}`);

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) {
            console.error('[DELETE-USER] Auth admin error:', deleteError);
            return json(500, { error: deleteError.message });
        }

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            // Nao fatal: linha pode ter sido apagada em cascata.
            console.warn('[DELETE-USER] Profile cleanup warning:', profileError);
        }

        return json(200, {
            success: true,
            message: 'Usuario removido permanentemente',
        });

    } catch (error: any) {
        console.error('[DELETE-USER] Unexpected error:', error);
        return json(500, { error: error.message || 'Erro interno ao remover usuario' });
    }
});
