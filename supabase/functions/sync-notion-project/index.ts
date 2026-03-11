import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
        const { projectId, type, data } = payload;

        // 1. Secrets
        const notionApiKey = Deno.env.get('NOTION_API_KEY')?.trim() || '';
        const dbClientsId = Deno.env.get('NOTION_DB_CLIENTS')?.trim() || '';
        const dbSprintsId = Deno.env.get('NOTION_DB_SPRINTS')?.trim() || '';
        const dbTasksId = Deno.env.get('NOTION_DB_TASKS')?.trim() || '';

        if (!notionApiKey) {
            throw new Error('NOTION_API_KEY não configurada.');
        }

        console.log(`[Notion Sync] project=${projectId} type=${type}`);

        // 2. Extract client info — CRM Ops usa revops_* prefix, demais usam camelCase/snake
        const clientEmail = data.revops_email || data.email || `temp-${projectId}@client.com`;
        const companyName = data.revops_empresa || data.company_name || data.client_company
            || data.companyName || `Cliente - ${projectId}`;

        const syncErrors: string[] = [];

        // 3. Notion API helper
        // notionVersion: '2022-06-28' para DBs simples, '2025-09-03' para multi-source (Clientes)
        const notionPost = async (endpoint: string, body: any, notionVersion = '2022-06-28') => {
            const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${notionApiKey}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': notionVersion,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Notion API Error [${response.status}] (${endpoint}): ${errText}`);
            }
            return await response.json();
        };

        // Child data source ID do banco "🏢 Projetos" (dentro do multi-source Spaces/Clientes)
        // Necessário para criar páginas com Notion-Version 2025-09-03
        const DB_CLIENTS_CHILD_SOURCE = '2f6bdc72-e039-81da-b2b7-000beb70fc16';

        // ==========================================
        // ETAPA 1: CRIAR CLIENTE
        // DB: 🏢 Spaces (Clientes) — prop título: "Cliente"
        // ==========================================
        let clientPageId = '';
        if (dbClientsId) {
            console.log(`Criando Cliente: ${companyName}`);
            try {
                // O banco Clientes é multi-source → requer Notion-Version 2025-09-03
                // e usa o child data source ID como database_id
                const clientPage = await notionPost('/pages', {
                    parent: { database_id: DB_CLIENTS_CHILD_SOURCE },
                    properties: {
                        "Cliente": { title: [{ text: { content: companyName } }] },
                        "Status": { status: { name: "Ativo" } },
                    },
                }, '2025-09-03');
                clientPageId = clientPage.id;
                console.log(`✅ Cliente criado: ${clientPageId}`);
            } catch (e: any) {
                console.error("Erro ao criar Cliente:", e.message);
                syncErrors.push(`Cliente Error: ${e.message}`);
            }
        }

        // ==========================================
        // ETAPA 2: CRIAR SPRINT (vinculada ao Cliente)
        // DB: 🗓️ Sprints — prop título: "Sprint"
        // Relações: Cliente → Clientes DB
        // ==========================================
        let sprintPageId = '';
        if (dbSprintsId) {
            console.log(`Criando Sprint para ${companyName}...`);
            const sprintName = `${companyName.toUpperCase()} - Sprint 1 (Onboarding)`;

            const sprintProperties: Record<string, any> = {
                "Sprint": { title: [{ text: { content: sprintName } }] },
                "Status": { status: { name: "Planejado" } },
                "Número": { number: 1 },
                "Meta da Sprint": {
                    rich_text: [{ text: { content: `Onboarding e setup inicial para ${companyName}` } }]
                },
            };

            // Vincula ao cliente se foi criado com sucesso
            if (clientPageId) {
                sprintProperties["Cliente"] = { relation: [{ id: clientPageId }] };
            }

            try {
                const newSprint = await notionPost('/pages', {
                    parent: { database_id: dbSprintsId },
                    properties: sprintProperties,
                });
                sprintPageId = newSprint.id;
                console.log(`✅ Sprint criada: ${sprintPageId}`);
            } catch (e: any) {
                console.error("Erro ao criar Sprint:", e.message);
                syncErrors.push(`Sprint Error: ${e.message}`);
            }
        }

        // ==========================================
        // ETAPA 3: CRIAR TASK (vinculada à Sprint + Cliente)
        // DB: ✅ Tasks — prop título: "Tarefa"
        // Relações: Sprint → Sprints DB, Cliente → Clientes DB
        // ==========================================
        if (dbTasksId) {
            console.log(`Criando Task de Onboarding...`);

            const taskTitles: Record<string, string> = {
                'crm_ops': 'Onboarding Técnico e Setup de CRM',
                'funnel': 'Setup de Funil e Automação',
                'dev': 'Projeto e Briefing de Dev',
                'founder': 'Onboarding Founder Protocol',
                'site': 'Site Score Analysis',
            };
            const taskTitle = taskTitles[type] || 'Onboarding e Planejamento';

            // Formata dados do formulário como bullet points legíveis
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

            // Monta blocos de conteúdo respeitando limite de 2000 chars por rich_text
            const childrenBlocks: any[] = [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: '📋 Resumo do Formulário REI' } }],
                    },
                },
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{
                            type: 'text',
                            text: { content: `Projeto prospectado na modalidade "${type}". Dados coletados no onboarding:` },
                        }],
                    },
                },
            ];

            // Chunks de até 1800 chars para não exceder limite da API
            let currentChunk = '';
            for (const line of formattedLines) {
                if (currentChunk.length + line.length > 1800) {
                    childrenBlocks.push({
                        object: 'block',
                        type: 'paragraph',
                        paragraph: { rich_text: [{ type: 'text', text: { content: currentChunk } }] },
                    });
                    currentChunk = '';
                }
                currentChunk += line + '\n\n';
            }
            if (currentChunk) {
                childrenBlocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: { rich_text: [{ type: 'text', text: { content: currentChunk } }] },
                });
            }

            const taskProperties: Record<string, any> = {
                "Tarefa": { title: [{ text: { content: taskTitle } }] },
                "Status": { status: { name: "Backlog" } },
                "Prioridade": { select: { name: "🟠 Alta" } },
                "Tipo": { select: { name: "📋 Reunião" } },
            };

            // Vincula ao sprint e ao cliente se existirem
            if (sprintPageId) {
                taskProperties["Sprint"] = { relation: [{ id: sprintPageId }] };
            }
            if (clientPageId) {
                taskProperties["Cliente"] = { relation: [{ id: clientPageId }] };
            }

            try {
                const newTask = await notionPost('/pages', {
                    parent: { database_id: dbTasksId },
                    properties: taskProperties,
                    children: childrenBlocks,
                });
                console.log(`✅ Task criada: ${newTask.id}`);
            } catch (e: any) {
                console.error("Erro ao criar Task:", e.message);
                syncErrors.push(`Task Error: ${e.message}`);
            }
        }

        // Retorna resultado
        if (syncErrors.length > 0) {
            return new Response(
                JSON.stringify({
                    error: 'Partial or total failure syncing with Notion',
                    details: syncErrors,
                    partial: { clientPageId, sprintPageId },
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Sync with Notion complete',
                clientPageId,
                sprintPageId,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        );

    } catch (error: any) {
        console.error('Erro fatal no Notion Sync:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
