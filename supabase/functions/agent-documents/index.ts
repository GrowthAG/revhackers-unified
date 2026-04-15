// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { authenticate, requireRoleIn, AuthError, toErrorResponse } from "../_shared/require-role.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        // Todas as acoes exigem autenticacao. service_role bypassa (chamadas internas).
        const auth = await authenticate(req);

        let body;
        try { body = await req.json(); }
        catch (jsonErr) { throw new AuthError(400, 'Payload JSON invalido'); }

        const { action, agentId } = body || {};
        console.log(`[agent-documents] caller=${auth.callerId ?? 'service'} role=${auth.callerRole} action=${action} agentId=${agentId}`);

        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const userJwt = req.headers.get('Authorization')!;

        if (!openaiKey || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
            throw new Error('Ambiente nao configurado corretamente');
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const supabaseUser = auth.isServiceRole
            ? supabaseAdmin
            : createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: userJwt } },
            });

        // Helper: valida que o caller tem acesso ao agentId especifico.
        // service_role e admin/super_admin bypassam. User comum precisa ser dono do agente via RLS.
        const assertAgentAccess = async () => {
            if (auth.isServiceRole) return;
            if (['admin', 'super_admin'].includes(auth.callerRole ?? '')) return;
            if (!agentId || agentId === 'default') return;

            const { data: agentRow, error: agentErr } = await supabaseUser
                .from('agents')
                .select('id')
                .eq('id', agentId)
                .single();

            if (agentErr || !agentRow) {
                throw new AuthError(403, 'Acesso negado ou agente nao encontrado');
            }
        };

        // ACTION: Ping (Health & Diagnostics)
        // Antes: retornava counts/filenames sem checar ownership -> vazava dados.
        // Agora: ownership check vem ANTES de qualquer query.
        if (action === 'ping') {
            if (!agentId || agentId === 'default') {
                return new Response(JSON.stringify({ success: true, documentCount: 0, filenames: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            await assertAgentAccess();

            const { count: directCount } = await supabaseAdmin.from('agent_documents').select('*', { count: 'exact', head: true }).eq('agent_id', agentId);

            const { data: linkedLibs } = await supabaseAdmin.from('agent_libraries').select('library_id').eq('agent_id', agentId);
            let libraryCount = 0;
            if (linkedLibs?.length) {
                const libIds = linkedLibs.map((l: any) => l.library_id);
                const { count: libDocsCount } = await supabaseAdmin.from('agent_documents').select('*', { count: 'exact', head: true }).in('library_id', libIds);
                libraryCount = libDocsCount || 0;
            }

            const { data: filenamesData } = await supabaseAdmin.from('agent_documents').select('filename').or(`agent_id.eq.${agentId}${linkedLibs?.length ? `,library_id.in.(${linkedLibs.map(l => l.library_id).join(',')})` : ''}`);

            const uniqueFilenames = filenamesData ? Array.from(new Set(filenamesData.map((d: any) => d.filename))).filter(Boolean) : [];

            return new Response(JSON.stringify({
                success: true,
                message: 'Pong! Conexao ativa.',
                documentCount: (directCount || 0) + libraryCount,
                filenames: uniqueFilenames,
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Para todas as acoes abaixo que operam sobre um agentId especifico,
        // ownership check e obrigatorio.
        await assertAgentAccess();

        // ACTION: Upload (Strictly via Chunks)
        if (action === 'upload_chunks') {
            const { documents, libraryId } = body;
            if (!documents || !Array.isArray(documents)) throw new AuthError(400, 'Documentos (chunks) obrigatorios');
            if (documents.length === 0) return new Response(JSON.stringify({ success: true, message: 'Nada para processar' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            if (!agentId && !libraryId) throw new AuthError(400, 'AgentId ou LibraryId e obrigatorio');

            const validChunks = documents.filter((d: any) => d.content && d.filename);
            if (validChunks.length === 0) throw new AuthError(400, 'Nenhum chunk valido encontrado');

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
                    agent_id: agentId || null,
                    library_id: libraryId || null,
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

        // ACTION: Crawl (Fetch URL & Extract Text)
        if (action === 'crawl') {
            const { url } = body;
            if (!url) throw new AuthError(400, 'URL obrigatoria');

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Falha ao acessar URL: ${res.statusText}`);
                const html = await res.text();

                let text = html
                    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                    .replace(/<[^>]+>/g, "\n")
                    .replace(/&nbsp;/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

                return new Response(JSON.stringify({ success: true, content: text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            } catch (err: any) {
                return new Response(JSON.stringify({ success: false, error: err.message }), {
                    status: 502,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // ACTION: List
        if (action === 'list') {
            const { data: linkedLibs } = await supabaseAdmin.from('agent_libraries').select('library_id').eq('agent_id', agentId);
            const libIds = linkedLibs?.map((l: any) => l.library_id) || [];

            let query = supabaseAdmin
                .from('agent_documents')
                .select('id, filename, content, metadata, library_id, agent_id');

            if (libIds.length > 0) {
                query = query.or(`agent_id.eq.${agentId},library_id.in.(${libIds.join(',')})`);
            } else {
                query = query.eq('agent_id', agentId);
            }

            const { data: docs, error: listError } = await query.order('created_at', { ascending: true });

            if (listError) throw listError;
            return new Response(JSON.stringify({ success: true, documents: docs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // --- LIBRARY ACTIONS ---
        // Biblioteca e recurso global compartilhado entre agentes.
        // Criacao/atribuicao restrita a admin/super_admin.

        if (action === 'create_library') {
            requireRoleIn(auth, ['admin', 'super_admin']);
            const { name, description } = body;
            if (!name) throw new AuthError(400, 'Nome da biblioteca e obrigatorio');

            const { data, error } = await supabaseAdmin
                .from('knowledge_libraries')
                .insert({ name, description })
                .select()
                .single();

            if (error) throw error;
            return new Response(JSON.stringify({ success: true, library: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (action === 'list_libraries') {
            // Autenticado basta; biblioteca e recurso nominalmente publico dentro do hub.
            const { data, error } = await supabaseAdmin
                .from('knowledge_libraries')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return new Response(JSON.stringify({ success: true, libraries: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (action === 'assign_library') {
            requireRoleIn(auth, ['admin', 'super_admin']);
            const { libraryId } = body;
            if (!agentId || !libraryId) throw new AuthError(400, 'AgentId e LibraryId sao obrigatorios');

            const { error } = await supabaseAdmin
                .from('agent_libraries')
                .upsert({ agent_id: agentId, library_id: libraryId }, { onConflict: 'agent_id, library_id' });

            if (error) throw error;
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (action === 'delete') {
            const { error: delError } = await supabaseAdmin.from('agent_documents').delete().eq('agent_id', agentId);
            if (delError) throw delError;
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        throw new AuthError(400, `Acao invalida: ${action}`);

    } catch (err) {
        return toErrorResponse(err, corsHeaders);
    }
});
