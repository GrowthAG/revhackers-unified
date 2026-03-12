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

        const criticalErrors: string[] = [];

        // 3. Notion API helpers
        const notionHeaders = {
            'Authorization': `Bearer ${notionApiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
        };

        const notionPost = async (endpoint: string, body: any) => {
            const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
                method: 'POST',
                headers: notionHeaders,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Notion API Error [${response.status}] (${endpoint}): ${errText}`);
            }
            return await response.json();
        };

        // ==========================================
        // ETAPA 0: BUSCAR CLIENTE EXISTENTE NO NOTION
        // Estratégia: search API busca páginas pelo nome da empresa.
        // Se encontrar uma página cujo parent seja o banco Clientes,
        // usamos o ID dela para criar as relações em Sprint e Task.
        // Isso funciona com a API atual (2022-06-28) sem precisar criar cliente novo.
        // ==========================================
        let clientPageId = '';

        if (dbClientsId && companyName) {
            console.log(`Buscando cliente existente: "${companyName}"...`);
            try {
                const searchResult = await notionPost('/search', {
                    query: companyName,
                    filter: { value: 'page', property: 'object' },
                    page_size: 10,
                });

                // Normaliza ID do banco Clientes para comparação (remove hífens)
                const normalizedClientsId = dbClientsId.replace(/-/g, '');

                const match = searchResult?.results?.find((page: any) => {
                    const parentDbId = (page.parent?.database_id || '').replace(/-/g, '');
                    return parentDbId === normalizedClientsId;
                });

                if (match) {
                    clientPageId = match.id;
                    console.log(`✅ Cliente encontrado no Notion: ${clientPageId}`);
                } else {
                    console.log(`ℹ️ Cliente não encontrado no Notion — Sprint/Task criados sem vínculo de cliente.`);
                    console.log(`   Dica: Crie o cliente "${companyName}" manualmente no banco Clientes para habilitar o vínculo.`);
                }
            } catch (e: any) {
                // Search error não é crítico — continua sem clientPageId
                console.warn(`⚠️ Busca de cliente falhou (não crítico): ${e.message}`);
            }
        }

        // ==========================================
        // ETAPA 1: CRIAR SPRINT
        // DB: 🗓️ Sprints — prop título: "Sprint"
        // Relações: Cliente → Clientes DB (vincula se cliente foi encontrado)
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

            // Vincula cliente se encontrado via search
            if (clientPageId) {
                sprintProperties["Cliente"] = { relation: [{ id: clientPageId }] };
            }

            try {
                const newSprint = await notionPost('/pages', {
                    parent: { database_id: dbSprintsId },
                    properties: sprintProperties,
                });
                sprintPageId = newSprint.id;
                console.log(`✅ Sprint criada: ${sprintPageId}${clientPageId ? ' (com vínculo de cliente)' : ''}`);
            } catch (e: any) {
                console.error("Erro ao criar Sprint:", e.message);
                criticalErrors.push(`Sprint Error: ${e.message}`);
            }
        }

        // ==========================================
        // ETAPA 2: CRIAR TASK (vinculada à Sprint + Cliente)
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

            if (sprintPageId) {
                taskProperties["Sprint"] = { relation: [{ id: sprintPageId }] };
            }

            // Vincula cliente se encontrado via search
            if (clientPageId) {
                taskProperties["Cliente"] = { relation: [{ id: clientPageId }] };
            }

            try {
                const newTask = await notionPost('/pages', {
                    parent: { database_id: dbTasksId },
                    properties: taskProperties,
                    children: childrenBlocks,
                });
                console.log(`✅ Task criada: ${newTask.id}${clientPageId ? ' (com vínculo de cliente)' : ''}`);
            } catch (e: any) {
                console.error("Erro ao criar Task:", e.message);
                criticalErrors.push(`Task Error: ${e.message}`);
            }
        }

        // Retorna resultado
        // Sprint é o mínimo necessário — se criou Sprint, é sucesso
        if (criticalErrors.length > 0 && !sprintPageId) {
            return new Response(
                JSON.stringify({ error: 'Falha ao criar Sprint no Notion', details: criticalErrors }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
            );
        }

        return new Response(
            JSON.stringify({ success: true, sprintPageId, clientPageId: clientPageId || null }),
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
