import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Create Supabase admin client
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

        // Get the payload
        const { userId } = await req.json();

        if (!userId) {
            throw new Error('O campo userId é obigatório para a deleção.');
        }

        console.log(`[DELETE-USER] Iniciando remoção segura do usuário: ${userId}`);

        // 1. Delete from Auth Users (Admin Level)
        const { data, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('[DELETE-USER] Erro ao deletar no admin:', deleteError);
            throw deleteError;
        }

        // 2. Clear from public profiles (Fallback if no cascade delete)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('[DELETE-USER] Aviso: Perfil pode já ter sido apagado em cascata.', profileError);
        }

        console.log(`[DELETE-USER] Usuário ${userId} removido com sucesso.`);

        // Return success
        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'Usuário removido permanentemente da plataforma.' 
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error('[DELETE-USER] Fatal Error:', error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: error.message || 'Falha interna ao remover usuário no backend.' 
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Force 200 so the client receives the JSON payload instead of a generic network exception.
            }
        );
    }
});
