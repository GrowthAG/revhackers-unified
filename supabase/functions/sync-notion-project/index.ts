import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        const {
            phase,          // 'setup' | 'enrich' (obrigatório)
            projectId,      // UUID do rei_projects (obrigatório)
            type,           // REI type: crm_ops, consulting, founder, etc.
            data,           // Respostas do formulário REI (fase enrich)
            scoreResult,    // Score calculado (fase enrich, opcional)
            companyName: companyNameOverride,  // Nome da empresa (fase setup)
            clientName: clientNameOverride,    // Nome do cliente (fase setup)
        } = payload;

        if (!projectId) throw new Error('projectId é obrigatório.');
        if (!phase) throw new Error('phase é obrigatório: "setup" ou "enrich".');

        // 1. Secrets
        const notionApiKey = Deno.env.get('NOTION_API_KEY')?.trim() || '';
        const dbClientsId = Deno.env.get('NOTION_DB_CLIENTS')?.trim() || '';
        const dbSprintsId = Deno.env.get('NOTION_DB_SPRINTS')?.trim() || '';
        const dbTasksId = Deno.env.get('NOTION_DB_TASKS')?.trim() || '';

        if (!notionApiKey) throw new Error('NOTION_API_KEY não configurada.');
        if (!dbSprintsId) throw new Error('NOTION_DB_SPRINTS não configurada.');

        console.log(`[Notion Sync] phase=${phase} project=${projectId} type=${type}`);

        // 2. Supabase admin (para ler/atualizar rei_projects)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        // 3. Helpers Notion
        const notionHeaders = {
            'Authorization': `Bearer ${notionApiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
        };

        const notionPost = async (endpoint: string, body: any) => {
            const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
                method: 'POST', headers: notionHeaders, body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Notion API Error [${res.status}] (${endpoint}): ${errText}`);
            }
            return await res.json();
        };

        const notionPatch = async (pageId: string, body: any) => {
            const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
                method: 'PATCH', headers: notionHeaders, body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Notion PATCH Error [${res.status}]: ${errText}`);
            }
            return await res.json();
        };

        // 4. Busca cliente existente no Notion por nome
        const findNotionClient = async (name: string): Promise<string> => {
            if (!name || !dbClientsId) return '';
            try {
                const searchResult = await notionPost('/search', {
                    query: name,
                    filter: { value: 'page', property: 'object' },
                    page_size: 10,
                });
                const normalizedClientsId = dbClientsId.replace(/-/g, '');
                const match = searchResult?.results?.find((page: any) => {
                    const parentDbId = (page.parent?.database_id || '').replace(/-/g, '');
                    return parentDbId === normalizedClientsId;
                });
                if (match) {
                    console.log(`✅ Cliente encontrado no Notion: ${match.id}`);
                    return match.id;
                }
                console.log(`ℹ️ Cliente não encontrado no Notion para: "${name}"`);
            } catch (e: any) {
                console.warn(`⚠️ Busca de cliente falhou (não crítico): ${e.message}`);
            }
            return '';
        };

        // ==========================================
        // FASE SETUP — chamada quando admin cria o projeto
        // Cria Sprint imediatamente com dados básicos
        // Salva notion_sprint_id no rei_projects para uso na fase enrich
        // ==========================================
        if (phase === 'setup') {
            const companyName = companyNameOverride || clientNameOverride || `Cliente - ${projectId}`;
            console.log(`[Setup] Criando Sprint para: ${companyName}`);

            const clientPageId = await findNotionClient(companyName);
            const sprintName = `${companyName.toUpperCase()} - Sprint 1 (Onboarding)`;

            const sprintProperties: Record<string, any> = {
                "Sprint": { title: [{ text: { content: sprintName } }] },
                "Status": { status: { name: "Planejado" } },
                "Número": { number: 1 },
                "Meta da Sprint": {
                    rich_text: [{ text: { content: `Onboarding e setup inicial para ${companyName}` } }]
                },
            };

            if (clientPageId) {
                sprintProperties["Cliente"] = { relation: [{ id: clientPageId }] };
            }

            const newSprint = await notionPost('/pages', {
                parent: { database_id: dbSprintsId },
                properties: sprintProperties,
            });
            const sprintPageId = newSprint.id;
            console.log(`✅ Sprint criada: ${sprintPageId}${clientPageId ? ' (com vínculo de cliente)' : ''}`);

            // Persiste o sprint ID no projeto para uso na fase enrich
            const { error: updateError } = await supabase
                .from('rei_projects')
                .update({ notion_sprint_id: sprintPageId })
                .eq('id', projectId);

            if (updateError) {
                console.warn(`⚠️ Não foi possível salvar notion_sprint_id: ${updateError.message}`);
            } else {
                console.log(`✅ notion_sprint_id salvo no projeto ${projectId}`);
            }

            return new Response(
                JSON.stringify({ success: true, sprintPageId, clientPageId: clientPageId || null }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // ==========================================
        // FASE ENRICH — chamada quando cliente preenche o REI
        // Busca Sprint criada no setup, atualiza meta com dados reais,
        // cria Task com todo o conteúdo do formulário
        // ==========================================
        if (phase === 'enrich') {
            if (!dbTasksId) throw new Error('NOTION_DB_TASKS não configurada.');
            if (!data) throw new Error('data é obrigatório na fase enrich.');

            // Extrai nome da empresa das respostas do REI
            const companyName = data.revops_empresa || data.company_name || data.client_company
                || data.companyName || companyNameOverride || `Cliente - ${projectId}`;

            // Busca sprint ID salvo na fase setup
            const { data: project, error: projectError } = await supabase
                .from('rei_projects')
                .select('notion_sprint_id, client_name, client_company')
                .eq('id', projectId)
                .single();

            if (projectError) {
                console.warn(`⚠️ Não foi possível buscar projeto: ${projectError.message}`);
            }

            let sprintPageId = project?.notion_sprint_id || '';
            const resolvedCompany = companyName
                || project?.client_company || project?.client_name || `Cliente - ${projectId}`;

            // Busca cliente (mais chances de existir agora que o admin já teve tempo de criar)
            const clientPageId = await findNotionClient(resolvedCompany);

            // --- Sprint: atualiza se existe, cria se não existe ---
            if (sprintPageId) {
                console.log(`[Enrich] Atualizando Sprint existente: ${sprintPageId}`);

                // Extrai meta real das respostas do REI
                const goalText = data.revops_objetivo_principal || data.objective
                    || data.mainGoal || data.objetivo || data.goal
                    || `Onboarding ${type} — ${resolvedCompany}`;

                const updateProps: Record<string, any> = {
                    "Meta da Sprint": {
                        rich_text: [{ text: { content: goalText.substring(0, 2000) } }]
                    },
                };

                // Adiciona vínculo de cliente se encontrado e ainda não estava linkado
                if (clientPageId) {
                    updateProps["Cliente"] = { relation: [{ id: clientPageId }] };
                }

                try {
                    await notionPatch(sprintPageId, { properties: updateProps });
                    console.log(`✅ Sprint atualizada com meta do REI`);
                } catch (e: any) {
                    console.warn(`⚠️ Não foi possível atualizar Sprint: ${e.message}`);
                }
            } else {
                // Fallback: fase setup não rodou — cria Sprint agora
                console.log(`[Enrich] Sprint não encontrada, criando como fallback...`);

                const goalText = data.revops_objetivo_principal || data.objective
                    || data.mainGoal || data.objetivo || data.goal
                    || `Onboarding e setup inicial para ${resolvedCompany}`;

                const sprintProperties: Record<string, any> = {
                    "Sprint": { title: [{ text: { content: `${resolvedCompany.toUpperCase()} - Sprint 1 (Onboarding)` } }] },
                    "Status": { status: { name: "Planejado" } },
                    "Número": { number: 1 },
                    "Meta da Sprint": {
                        rich_text: [{ text: { content: goalText.substring(0, 2000) } }]
                    },
                };

                if (clientPageId) {
                    sprintProperties["Cliente"] = { relation: [{ id: clientPageId }] };
                }

                const newSprint = await notionPost('/pages', {
                    parent: { database_id: dbSprintsId },
                    properties: sprintProperties,
                });
                sprintPageId = newSprint.id;
                console.log(`✅ Sprint criada (fallback): ${sprintPageId}`);
            }

            // --- Task: cria com todos os dados do REI ---
            console.log(`[Enrich] Criando Task de Onboarding...`);

            const taskTitles: Record<string, string> = {
                'crm_ops': 'Onboarding Técnico e Setup de CRM',
                'funnel': 'Setup de Funil e Automação',
                'funnels_impl': 'Setup de Funil e Automação',
                'dev': 'Projeto e Briefing de Dev',
                'founder': 'Onboarding Founder Protocol',
                'site': 'Site Score Analysis',
                'consulting': 'Onboarding Consulting 360°',
                'content_seo': 'Setup SEO & Autenticidade',
                'training': 'Onboarding Treinamento In-Company',
            };
            const taskTitle = taskTitles[type] || 'Onboarding e Planejamento';

            // Formata dados do REI como bullet points legíveis
            const formattedLines = Object.entries(data).map(([key, value]) => {
                const label = key.replace(/_/g, ' ').toUpperCase();
                if (Array.isArray(value)) {
                    if (value.length === 0) return `• ${label}: (vazio)`;
                    if (typeof value[0] === 'string') {
                        return `• ${label}:\n  - ${(value as string[]).join('\n  - ')}`;
                    }
                    if (typeof value[0] === 'object') {
                        const desc = value.map(v =>
                            JSON.stringify(v).replace(/["{}\[\]]/g, '').replace(/:/g, ': ')
                        ).join('\n  - ');
                        return `• ${label}:\n  - ${desc}`;
                    }
                    return `• ${label}: (vazio)`;
                }
                return `• ${label}: ${value || 'Não informado'}`;
            });

            const childrenBlocks: any[] = [
                {
                    object: 'block', type: 'heading_2',
                    heading_2: { rich_text: [{ type: 'text', text: { content: '📋 Resumo do Formulário REI' } }] },
                },
                {
                    object: 'block', type: 'paragraph',
                    paragraph: { rich_text: [{ type: 'text', text: { content: `Modalidade "${type}". Dados coletados no onboarding:` } }] },
                },
            ];

            let currentChunk = '';
            for (const line of formattedLines) {
                if (currentChunk.length + line.length > 1800) {
                    childrenBlocks.push({
                        object: 'block', type: 'paragraph',
                        paragraph: { rich_text: [{ type: 'text', text: { content: currentChunk } }] },
                    });
                    currentChunk = '';
                }
                currentChunk += line + '\n\n';
            }
            if (currentChunk) {
                childrenBlocks.push({
                    object: 'block', type: 'paragraph',
                    paragraph: { rich_text: [{ type: 'text', text: { content: currentChunk } }] },
                });
            }

            const taskProperties: Record<string, any> = {
                "Tarefa": { title: [{ text: { content: taskTitle } }] },
                "Status": { status: { name: "Backlog" } },
                "Prioridade": { select: { name: "🟠 Alta" } },
                "Tipo": { select: { name: "📋 Reunião" } },
            };

            if (sprintPageId) taskProperties["Sprint"] = { relation: [{ id: sprintPageId }] };
            if (clientPageId) taskProperties["Cliente"] = { relation: [{ id: clientPageId }] };

            const newTask = await notionPost('/pages', {
                parent: { database_id: dbTasksId },
                properties: taskProperties,
                children: childrenBlocks,
            });
            console.log(`✅ Task criada: ${newTask.id}${clientPageId ? ' (com vínculo de cliente)' : ''}`);

            return new Response(
                JSON.stringify({
                    success: true,
                    sprintPageId,
                    taskId: newTask.id,
                    clientPageId: clientPageId || null,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        throw new Error(`Fase inválida: "${phase}". Use "setup" (criação do projeto) ou "enrich" (submissão do REI).`);

    } catch (error: any) {
        console.error('Erro fatal no Notion Sync:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
