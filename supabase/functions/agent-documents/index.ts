import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (jsonErr) {
            console.error('Request JSON parse error:', jsonErr);
            throw new Error('Payload JSON inválido');
        }

        const { action, agentId, documents, query } = body || {};
        console.log(`[EDGE] Req: action=${action}, agentId=${agentId}`);
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const userJwt = req.headers.get('Authorization')!;

        if (!openaiKey || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !userJwt) {
            console.error('[EDGE] Config missing');
            throw new Error('Ambiente não configurado corretamente');
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: userJwt } },
        });

        // ACTION: Ping (Verificação de Saúde + Diagnóstico) - MOVED UP TO BYPASS AGENT CHECK FOR DEFAULT
        if (action === 'ping') {
            if (!agentId || agentId === 'default') {
                return new Response(JSON.stringify({ success: true, documentCount: 0, filenames: [] }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const { count, error: countError } = await supabaseAdmin
                .from('agent_documents')
                .select('*', { count: 'exact', head: true })
                .eq('agent_id', agentId);

            const { data: filenamesData, error: filenamesError } = await supabaseAdmin
                .from('agent_documents')
                .select('filename')
                .eq('agent_id', agentId);

            if (filenamesError) console.error('[PING] Filenames Error:', filenamesError);

            const uniqueFilenames = filenamesData
                ? Array.from(new Set(filenamesData.map((d: any) => d.filename))).filter(Boolean) as string[]
                : [];

            console.log(`[PING] Agent ${agentId} Summary:`, { count, files: uniqueFilenames.length });

            return new Response(JSON.stringify({
                success: true,
                message: 'Pong! Conexão ativa.',
                agentId,
                documentCount: count || 0,
                filenames: uniqueFilenames,
                timestamp: new Date().toISOString(),
                countError: countError ? countError.message : null
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('[EDGE] Verificando acesso...');
        const { data: agentData, error: agentError } = await supabaseUser
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .single();

        if (agentError || !agentData) {
            console.error('[EDGE] Access Denied:', agentError);
            throw new Error('Acesso negado.');
        }
        console.log('[EDGE] Acesso OK.');

        // ACTION: Upload and process documents
        if (action === 'upload') {
            if (!agentId || !documents || !Array.isArray(documents)) {
                throw new Error('agentId e lista de documentos são obrigatórios');
            }

            const allChunks: any[] = [];
            function chunkText(text: string, chunkSize = 1500, overlap = 200): string[] {
                const result: string[] = [];
                let start = 0;
                while (start < text.length) {
                    const end = Math.min(start + chunkSize, text.length);
                    result.push(text.slice(start, end));
                    start += chunkSize - overlap;
                }
                return result;
            }

            for (const doc of documents) {
                const sanitizedContent = (doc.content || '').replace(/\0/g, '');
                const chunks = chunkText(sanitizedContent);
                chunks.forEach((c, i) => {
                    allChunks.push({
                        filename: doc.filename,
                        content: c,
                        chunk_index: i,
                        total_chunks: chunks.length
                    });
                });
            }

            if (allChunks.length === 0) {
                return new Response(JSON.stringify({ success: true, message: 'Nada para processar' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const BATCH_SIZE = 5;
            for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
                const batch = allChunks.slice(i, i + BATCH_SIZE);
                const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'text-embedding-3-small', input: batch.map(b => b.content.slice(0, 8000)) }),
                });

                const embedData = await embedRes.json();
                if (!embedRes.ok) throw new Error(`OpenAI Error: ${embedData.error?.message}`);

                const rowsToInsert = batch.map((item, idx) => ({
                    agent_id: agentId,
                    filename: item.filename,
                    content: String(item.content || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim(),
                    embedding: embedData.data[idx].embedding,
                    metadata: { chunk_index: item.chunk_index, total_chunks: item.total_chunks }
                }));

                const { error: dbError } = await supabaseAdmin.from('agent_documents').insert(rowsToInsert);
                if (dbError) throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
            }

            return new Response(JSON.stringify({ success: true, count: allChunks.length }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // ACTION: Upload pre-chunked segments (Client-side processing)
        if (action === 'upload_chunks') {
            if (!agentId || !documents || !Array.isArray(documents)) {
                throw new Error('agentId e lista de documentos (chunks) são obrigatórios');
            }

            const allChunks = documents;

            if (allChunks.length === 0) {
                return new Response(JSON.stringify({ success: true, message: 'Nada para processar' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            console.log(`[EDGE] Processing ${allChunks.length} pre-chunked segments for agent ${agentId}`);

            const BATCH_SIZE = 10;
            for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
                const batch = allChunks.slice(i, i + BATCH_SIZE);

                const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'text-embedding-3-small', input: batch.map((b: any) => b.content.slice(0, 8000)) }),
                });

                const embedData = await embedRes.json();
                if (!embedRes.ok) throw new Error(`OpenAI Error: ${embedData.error?.message}`);

                const rowsToInsert = batch.map((item: any, idx: number) => ({
                    agent_id: agentId,
                    filename: item.filename,
                    content: String(item.content || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim(),
                    embedding: embedData.data[idx].embedding,
                    metadata: item.metadata || {}
                }));

                const { error: dbError } = await supabaseAdmin.from('agent_documents').insert(rowsToInsert);
                if (dbError) throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
            }

            return new Response(JSON.stringify({ success: true, count: allChunks.length }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // ACTION: Search
        if (action === 'search') {
            if (!agentId || !query) throw new Error('agentId e query são obrigatórios');

            const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
            });

            const embedData = await embedRes.json();
            if (!embedRes.ok) throw new Error('Falha ao gerar embedding para busca');

            const { data: matches, error: searchError } = await supabaseAdmin.rpc('match_agent_documents', {
                query_embedding: embedData.data[0].embedding,
                match_threshold: 0.25,
                match_count: 10,
                filter_agent_id: agentId
            });

            if (searchError) throw searchError;

            return new Response(JSON.stringify({ success: true, matches }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // ACTION: List
        if (action === 'list') {
            const { data: docs, error: listError } = await supabaseAdmin
                .from('agent_documents')
                .select('id, filename, content, metadata')
                .eq('agent_id', agentId)
                .order('created_at', { ascending: true });

            if (listError) throw listError;
            return new Response(JSON.stringify({ success: true, documents: docs }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // ACTION: Delete
        if (action === 'delete') {
            const { error: delError } = await supabaseAdmin.from('agent_documents').delete().eq('agent_id', agentId);
            if (delError) throw delError;
            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Ação inválida');

    } catch (error: any) {
        console.error('Final Edge Function Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message || 'Erro interno desconhecido' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
