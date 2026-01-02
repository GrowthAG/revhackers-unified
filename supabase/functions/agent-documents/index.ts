import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        let body;
        try { body = await req.json(); }
        catch (jsonErr) { throw new Error('Payload JSON inválido'); }

        const { action, agentId, documents } = body || {};
        console.log(`[EDGE] Req: action=${action}, agentId=${agentId}`);

        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const userJwt = req.headers.get('Authorization')!;

        if (!openaiKey || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !userJwt) {
            throw new Error('Ambiente não configurado corretamente');
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: userJwt } },
        });

        // ACTION: Ping (Health & Diagnostics)
        if (action === 'ping') {
            if (!agentId || agentId === 'default') {
                return new Response(JSON.stringify({ success: true, documentCount: 0, filenames: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            const { count } = await supabaseAdmin.from('agent_documents').select('*', { count: 'exact', head: true }).eq('agent_id', agentId);
            const { data: filenamesData } = await supabaseAdmin.from('agent_documents').select('filename').eq('agent_id', agentId);

            const uniqueFilenames = filenamesData ? Array.from(new Set(filenamesData.map((d: any) => d.filename))).filter(Boolean) : [];

            return new Response(JSON.stringify({
                success: true,
                message: 'Pong! Conexão ativa.',
                documentCount: count || 0,
                filenames: uniqueFilenames,
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Security Check: Verify Ownership
        const { data: agentData, error: agentError } = await supabaseUser
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .single();

        if (agentError || !agentData) {
            console.error('[EDGE] Access Denied:', agentError);
            throw new Error('Acesso negado ou agente não encontrado.');
        }

        // ACTION: Upload (Strictly via Chunks)
        if (action === 'upload_chunks') {
            if (!documents || !Array.isArray(documents)) throw new Error('Documentos (chunks) obrigatórios');
            if (documents.length === 0) return new Response(JSON.stringify({ success: true, message: 'Nada para processar' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

            console.log(`[EDGE] Processing ${documents.length} chunks for agent ${agentId}`);

            // Validate Structure
            const validChunks = documents.filter((d: any) => d.content && d.filename);
            if (validChunks.length === 0) throw new Error('Nenhum chunk válido encontrado');

            // Generate Embeddings (Batching)
            const BATCH_SIZE = 10;
            for (let i = 0; i < validChunks.length; i += BATCH_SIZE) {
                const batch = validChunks.slice(i, i + BATCH_SIZE);

                const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'text-embedding-3-small', input: batch.map((b: any) => b.content.slice(0, 8000)) }),
                });

                if (!embedRes.ok) {
                    const err = await embedRes.json();
                    throw new Error(`OpenAI Error: ${err.error?.message}`);
                }
                const embedData = await embedRes.json();

                const rowsToInsert = batch.map((item: any, idx: number) => ({
                    agent_id: agentId,
                    filename: item.filename,
                    content: String(item.content).replace(/\0/g, '').trim(),
                    embedding: embedData.data[idx].embedding,
                    metadata: item.metadata || {}
                }));

                const { error: dbError } = await supabaseAdmin.from('agent_documents').insert(rowsToInsert);
                if (dbError) throw new Error(`DB Error: ${dbError.message}`);
            }

            return new Response(JSON.stringify({ success: true, count: validChunks.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // ACTION: List
        if (action === 'list') {
            const { data: docs, error: listError } = await supabaseAdmin
                .from('agent_documents')
                .select('id, filename, content, metadata')
                .eq('agent_id', agentId)
                .order('created_at', { ascending: true });

            if (listError) throw listError;
            return new Response(JSON.stringify({ success: true, documents: docs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // ACTION: Delete
        if (action === 'delete') {
            const { error: delError } = await supabaseAdmin.from('agent_documents').delete().eq('agent_id', agentId);
            if (delError) throw delError;
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        throw new Error(`Ação inválida: ${action}`);

    } catch (error: any) {
        console.error('Final Edge Function Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
