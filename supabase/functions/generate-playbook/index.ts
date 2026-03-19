import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeneratePlaybookParams {
  projectId: string;
  framework: string; // The specific playbook framework to focus on (e.g. Sales SLA, Mkt Inbound, Outbound)
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: GeneratePlaybookParams = await req.json();
    const { projectId, framework } = payload;

    if (!projectId) {
      throw new Error('projectId is required');
    }

    // @ts-ignore
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('API keys are not configured on the server');
    }

    // Initialize Supabase Admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log(`[generate-playbook] Fetching data for project: ${projectId}, framework: ${framework}`);

    // 1. Fetch the REI Responses (Raw diagnostic data)
    const { data: reiResponses, error: reiError } = await supabase
      .from('rei_responses')
      .select('responses')
      .eq('project_id', projectId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (reiError && reiError.code !== 'PGRST116') throw reiError;

    // 2. Fetch the Strategic Plan (RevHackers strategy)
    const { data: strategicPlan, error: planError } = await supabase
      .from('strategic_plans')
      .select('diagnostic_data, roadmap_data, goals_data, persona_data')
      .eq('rei_project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError && planError.code !== 'PGRST116') throw planError;

    const rawDiagnostic = reiResponses?.responses || {};
    const strategy = strategicPlan || {};

    // --- INTEGRATION: Notion Transcript Search ---
    let transcriptText = "";
    // @ts-ignore
    const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');

    if (NOTION_API_KEY) {
        try {
            const contactEmail = rawDiagnostic.email || rawDiagnostic.email_responsavel || rawDiagnostic.contato || '';
            const companyName = rawDiagnostic.empresa || rawDiagnostic.nome_empresa || rawDiagnostic.company || rawDiagnostic.projectName || '';
            const founderName = rawDiagnostic.fullName || rawDiagnostic.nome || '';
            
            const searchQueries = [contactEmail, companyName, founderName].filter(Boolean);

            if (searchQueries.length > 0) {
                let notionPageFound = false;
                for (const query of searchQueries) {
                    if (notionPageFound || !query) continue;
                    
                    const searchRes = await fetch('https://api.notion.com/v1/search', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${NOTION_API_KEY.trim()}`,
                            'Notion-Version': '2022-06-28',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: query,
                            sort: { direction: 'descending', timestamp: 'last_edited_time' },
                            page_size: 1
                        })
                    });

                    if (searchRes.ok) {
                        const searchData = await searchRes.json();
                        if (searchData.results && searchData.results.length > 0) {
                            const pageId = searchData.results[0].id;

                            const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=200`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${NOTION_API_KEY.trim()}`,
                                    'Notion-Version': '2022-06-28',
                                }
                            });

                            if (blocksRes.ok) {
                                const blocksData = await blocksRes.json();
                                const extractedText = blocksData.results.map((b: any) => {
                                  const type = b.type;
                                  if (b[type]?.rich_text) {
                                      return b[type].rich_text.map((t: any) => t.plain_text).join('');
                                  }
                                  return '';
                                }).filter(Boolean).join('\n');
                                
                                transcriptText = extractedText;
                                notionPageFound = true;
                            }
                        }
                    }
                } 
            }
        } catch (e: any) {
            console.error('[generate-playbook] Error Notion flow:', e.message);
        }
    }
    // --- END INTEGRATION ---

    // 3. Construct the Rigid Consulting Prompt
    const systemPrompt = `
Você é um Sênior Revenue Architect da RevHackers atuando diretamente com base nos frameworks da Winning By Design e metodologias de Growth High-Ticket. O seu objetivo é escrever o primeiro draft (Heavy Lifting 80%) de um "Playbook de Execução" detalhado para o cliente.

Você não deve usar linguagem genérica ou teórica. Deve usar uma comunicação direta, tática e voltada para diretores C-Level e coordenadores (Tom assertivo, implacável e focado em Receita).

O consultor selecionou o seguinte FOCO ESTRATÉGICO para este playbook: "${framework}"

# CONTEXTO DO CLIENTE (ZERO DATA ENTRY)
## Transcrições de Reuniões Anteriores (Call Transcripts via Notion AI):
${transcriptText ? transcriptText.substring(0, 10000) : 'Nenhuma transcrição encontrada.'}

## Respostas Brutas do Diagnóstico Inicial:
${JSON.stringify(rawDiagnostic)}

## O Plano Estratégico Oficial já aprovado:
Objetivos e Metas: ${JSON.stringify(strategy.goals_data || {})}
Roadmap: ${JSON.stringify(strategy.roadmap_data || {})}
Persona/ICP Mapeado: ${JSON.stringify(strategy.persona_data || {})}

# REGRAS DE ESTRUTURA PARA O PLAYBOOK:
- Formato: Retorne ESTRITAMENTE em Markdown limpo (sem blockquotes excessivos, focado em headers h1, h2, h3).
- Utilize metodologias provadas: se for vendas, fale de BANT-C ou SPICED; se for MKT, fale de SLA, Handoff e Funil Bowtie.
- Evite blá-blá-blá introdutório. O documento já entra focado nos processos de forma modular.
- Inclua áreas para:
  1. O Processo Técnico (Etapas claras).
  2. SLA de Receita (Acordos de serviço entre áreas).
  3. Matriz de Qualificação ou Regras de Contato (se aplicável ao Foco).
  4. Rotina de Gestão (Como o líder deve olhar os números semanalmente e mensalmente).
- Mantenha áreas parametrizáveis se necessário (ex: [Nome da Ferramenta]) para o consultor humano preencher depois, sendo este playbook um "Rascunho Premium" de 80%.

GERAR O PLAYBOOK EM MARKDOWN:`;


    // 4. Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', 
        messages: [
          { role: 'system', content: 'Você é um arquiteto de receita letal.' },
          { role: 'user', content: systemPrompt }
        ],
        temperature: 0.6,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const markdownOutput = data.choices[0].message.content;

    return new Response(JSON.stringify({ markdown: markdownOutput }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[generate-playbook] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
