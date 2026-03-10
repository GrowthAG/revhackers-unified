import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // 1. Handle CORS preflight options
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        const { projectId, type, data } = payload;

        // 2. Fetch Secrets
        const notionApiKey = Deno.env.get('NOTION_API_KEY');
        const dbClientsId = Deno.env.get('NOTION_DB_CLIENTS');
        const dbSprintsId = Deno.env.get('NOTION_DB_SPRINTS');
        const dbTasksId = Deno.env.get('NOTION_DB_TASKS');

        if (!notionApiKey) {
            throw new Error('As váriaveis de Integração do Notion não foram configuradas.');
        }

        console.log(`[Notion Sync] Processing project ${projectId} of type ${type}`);

        // --- 3. Notion API Helpers ---
        // Funções auxiliares para montar as Requests POST do Notion
        const notionPost = async (endpoint: string, body: any) => {
            const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${notionApiKey}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Notion API Error (${endpoint}): ${errText}`);
            }
            return await response.json();
        };

        const notionSearch = async (body: any) => notionPost('/search', body);

        // ==========================================
        // ETAPA 1: CRIAR OU ENCONTRAR O CLIENTE 
        // ==========================================
        const clientEmail = data.email || `temp-${projectId}@client.com`;
        const companyName = data.company_name || data.client_company || `Cliente (Pendente Nome) - ${projectId}`; // No nosso REI às vezes o nome via da base de projects 

        // Busca se já existe um cliente
        let clientPageId = '';

        // 1.1 Se o banco Cliente Existir
        if (dbClientsId) {
            const searchClients = await notionPost(`/databases/${dbClientsId}/query`, {
                filter: {
                    property: "Nome", // ATENÇÃO: Supomos que a coluna de nome no quadro de Clientes se chama "Nome"
                    title: {
                        contains: companyName
                    }
                }
            });

            if (searchClients.results && searchClients.results.length > 0) {
                clientPageId = searchClients.results[0].id;
                console.log(`Cliente encontrado: ${clientPageId}`);
            } else {
                // Cria novo cliente
                console.log(`Criando novo Cliente...`);
                const newClient = await notionPost('/pages', {
                    parent: { database_id: dbClientsId },
                    properties: {
                        "Name": { // Try standard 'Name' first
                            title: [{ text: { content: companyName } }]
                        },
                        "Status": {
                            select: { name: "Ativo" } // Based on the screenshot "Ativo" is a status
                        }
                    }
                });
                clientPageId = newClient.id;
            }
        }

        // ==========================================
        // ETAPA 2: CRIAR A SPRINT
        // ==========================================
        let sprintPageId = '';
        if (dbSprintsId) {
            console.log(`Criando nova Sprint (Onboarding 90)...`);
            const sprintName = `${companyName.toUpperCase()} - Sprint 1 (Onboarding)`;
            const newSprintPayload: any = {
                parent: { database_id: dbSprintsId },
                properties: {
                    "Name": { // Presumindo nome padrão
                        title: [{ text: { content: sprintName } }]
                    },
                    "Status": {
                        select: { name: "Ativo" } // Baseado na cor AZUL do print
                    }
                }
            };

            // Linkar com o cliente se a relation (Relation) existir
            if (clientPageId) {
                // Nome padrão da property que liga Sprint com Cliente (no print está listado embaixo de REVHACKER - pode ser "Cliente" ou "Projetos")
                newSprintPayload.properties["Cliente"] = {
                    relation: [{ id: clientPageId }]
                };
            }

            const newSprint = await notionPost('/pages', newSprintPayload);
            sprintPageId = newSprint.id;
        }


        // ==========================================
        // ETAPA 3: CRIAR AS TASKS COM RESUMO
        // ==========================================
        if (dbTasksId) {
            console.log(`Criando Task de Review e Onboarding...`);

            // Mapeando Títulos Baseados no Tipo
            const taskTitles: Record<string, string> = {
                'crm_ops': "Onboarding Técnico e Setup de CRM",
                'funnel': "Setup de Funil e Automação",
                'dev': "Projeto e Briefing de Dev",
                'founder': "Onboarding Founder Protocol",
                'site': "Site Score Analysis",
            };
            const taskTitle = taskTitles[type] || "Onboarding e Planejamento";

            // Formatando o payload text completo em Bullet points textuais simples
            const formattedLines = Object.entries(data).map(([key, value]) => {
                const label = key.replace(/_/g, ' ').toUpperCase();
                if (Array.isArray(value)) {
                    if (value.length > 0 && typeof value[0] === 'string') {
                        return `* ${label}:\n  - ${value.join('\n  - ')}`;
                    }
                    if (value.length > 0 && typeof value[0] === 'object') {
                        const listDesc = value.map(v => JSON.stringify(v).replace(/["{}]/g, '').replace(/:/g, ': ')).join('\n  - ');
                        return `* ${label}:\n  - ${listDesc}`;
                    }
                    return `* ${label}: (vazio)`;
                }
                return `* ${label}: ${value || 'Não informado'}`;
            });

            // Preparando blocos do Notion, respeitando o limite da API (Max 2000 chars por RichText)
            const childrenBlocks: any[] = [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: "Resumo do Formulário REI" } }]
                    }
                },
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: `Este projeto foi prospectado na modalidade ${type}. Abaixo os dados de onboarding mapeados:` } }]
                    }
                }
            ];

            // Acumulando as linhas em chunks de até 1800 caracteres e empurrando como blocos de parágrafos adicionais
            let currentChunk = "";
            for (const line of formattedLines) {
                if (currentChunk.length + line.length > 1800) {
                    childrenBlocks.push({
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [{ type: 'text', text: { content: currentChunk } }]
                        }
                    });
                    currentChunk = "";
                }
                currentChunk += line + "\n\n";
            }
            if (currentChunk) {
                childrenBlocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: currentChunk } }]
                    }
                });
            }

            const newTaskPayload: any = {
                parent: { database_id: dbTasksId },
                properties: {
                    "Tarefa": { // Nome da coluna Tarefa do print "Tarefas por Status"
                        title: [{ text: { content: taskTitle } }]
                    },
                    "Status": {
                        status: { name: "Backlog" } // Usa a property Status vermelho Backlog do Notion
                    }
                },
                children: childrenBlocks
            };

            if (clientPageId) {
                newTaskPayload.properties["Cliente"] = { relation: [{ id: clientPageId }] };
            }
            if (sprintPageId) {
                newTaskPayload.properties["Sprints"] = { relation: [{ id: sprintPageId }] }; // Linka com a task da Sprint
            }

            const newTask = await notionPost('/pages', newTaskPayload);
            console.log(`Task criada com sucesso: ${newTask.id}`);
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Sync with Notion Complete' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (error: any) {
        console.error("Erro no Webhook Nativo:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
