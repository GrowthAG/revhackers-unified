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
        // Extract env variables and strictly format as UUIDs for Notion Endpoint
        const formatNotionId = (id: string | undefined): string => {
            if (!id) return '';
            const cleanId = id.replace(/-/g, '');
            if (cleanId.length === 32) {
                return `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20, 32)}`;
            }
            return id;
        };

        // 2. Fetch Secrets
        const notionApiKey = Deno.env.get('NOTION_API_KEY')?.trim() || '';
        const dbClientsId = formatNotionId(Deno.env.get('NOTION_DB_CLIENTS')?.trim());
        const dbSprintsId = formatNotionId(Deno.env.get('NOTION_DB_SPRINTS')?.trim());
        const dbTasksId = formatNotionId(Deno.env.get('NOTION_DB_TASKS')?.trim());

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
                    'Notion-Version': '2025-09-03'
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
        // CRM Ops uses revops_* prefix; other REIs use flat camelCase/snake fields
        const clientEmail = data.revops_email || data.email || `temp-${projectId}@client.com`;
        const companyName = data.revops_empresa || data.company_name || data.client_company || data.companyName || `Cliente (Pendente Nome) - ${projectId}`;

        // Array para coletar erros
        const syncErrors: string[] = [];

        // Helper universal para tentar propriedades de Título customizadas (bypass do Notion)
        const createPageWithFallback = async (dbId: string, titleProps: string[], titleContent: string, extraPayload: any = {}) => {
            let lastErr: any;
            for (const prop of titleProps) {
                try {
                    const payload = {
                        parent: { database_id: dbId },
                        properties: { [prop]: { title: [{ text: { content: titleContent } }] } },
                        ...extraPayload
                    };
                    return await notionPost('/pages', payload);
                } catch (e: any) {
                    lastErr = e;
                    // Se o erro for de propriedade não encontrada, prossegue para a próxima tentativa do array
                    if (e.message?.includes('not a property that exists') || e.message?.includes('validation_error')) {
                        continue;
                    }
                    // Se a database inteira não existir, interrompe o fallback imediatamente, pois não vai funfar com nenhuma prop
                    throw e;
                }
            }
            throw new Error(`As propriedades [${titleProps.join(', ')}] não foram encontradas na Base ${dbId}. Erro Notion Final: ${lastErr?.message}`);
        };

        // Cria novo cliente diretamente
        // NOTION_DB_CLIENTS deve apontar para o data source "🏢 Projetos" (filho do Spaces db)
        // Título da propriedade nesse data source é "Cliente"
        let clientPageId = '';
        if (dbClientsId) {
            console.log(`Criando novo Cliente: ${companyName} (${clientEmail})`);
            try {
                const newClient = await createPageWithFallback(
                    dbClientsId,
                    ["Cliente", "Nome", "Name", "Projeto", "Company", "Title", "Empresa"],
                    companyName
                );
                clientPageId = newClient.id;
                console.log(`Cliente criado: ${newClient.id}`);
            } catch (e: any) {
                console.error("Falha fatal ao criar cliente novo:", e);
                syncErrors.push(`Cliente Error: ${e.message}`);
            }
        }

        // ==========================================
        // ETAPA 2: CRIAR A SPRINT
        // ==========================================
        let sprintPageId = '';
        if (dbSprintsId) {
            console.log(`Criando nova Sprint...`);
            const sprintName = `${companyName.toUpperCase()} - Sprint 1 (Onboarding)`;
            try {
                const newSprint = await createPageWithFallback(
                    dbSprintsId,
                    ["Sprint", "Sprints", "Nome", "Name", "Projeto", "Title"],
                    sprintName
                );
                sprintPageId = newSprint.id;
            } catch (e: any) {
                console.error("Erro ao criar Sprint:", e);
                syncErrors.push(`Sprint Error: ${e.message}`);
            }
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

            try {
                const extraPayload = { children: childrenBlocks };
                const newTask = await createPageWithFallback(
                    dbTasksId,
                    ["Tarefa", "Name", "Nome", "Task", "Title", "Projeto"],
                    taskTitle,
                    extraPayload
                );
                console.log(`Task criada com sucesso: ${newTask.id}`);
            } catch (e: any) {
                console.error("Erro absoluto ao criar Task:", e);
                syncErrors.push(`Task Error: ${e.message}`);
            }
        }

        if (syncErrors.length > 0) {
            return new Response(
                JSON.stringify({ error: 'Partial or total failure linking with Notion', details: syncErrors }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
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
