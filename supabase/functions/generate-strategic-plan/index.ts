import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateParams {
  rei_responses: any;
  segment?: string;
  objective?: string;
  isB2B?: boolean;
  projectType?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rei_responses, segment, objective, isB2B, projectType }: GenerateParams = await req.json();

    if (!rei_responses) {
      throw new Error('rei_responses is required');
    }

    // @ts-ignore
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured on the server');
    }

    console.log('[generate-strategic-plan] Initiating generation for segment:', segment);

    // Sanitize REI responses to remove noise, empty fields, and internal UI state
    // This ensures the AI only sees real data and saves tokens
    const sanitizeAnswers = (raw: any) => {
      if (!raw || typeof raw !== 'object') return raw;
      const cleaned: any = {};

      for (const [key, value] of Object.entries(raw)) {
        // Ignore internal metadata, boolean flags, or empty strings
        if (key.startsWith('_') || key === 'id' || key === 'project_id' || key === 'metadata') continue;
        if (value === '' || value === null || value === undefined) continue;
        if (Array.isArray(value) && value.length === 0) continue;
        if (typeof value === 'object' && Object.keys(value).length === 0) continue;

        cleaned[key] = value;
      }
      return cleaned;
    };

    const cleanResponses = sanitizeAnswers(rei_responses);
    const scoringContext = rei_responses.radar_data ? `Radar de Maturidade: ${JSON.stringify(rei_responses.radar_data)}` : '';
    // Type detection — use only projectType field (string matching is fragile and causes false positives)
    const isCrmOps  = projectType === 'crm_ops';
    const isFounder = projectType === 'founder';
    const isDev     = projectType === 'dev' || projectType === 'site';

    // --- INTEGRATION: Notion Transcript Search ---
    let transcriptText = "";
    // @ts-ignore
    const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');

    if (NOTION_API_KEY) {
        try {
            // Find contact identifiers to query Notion
            // CRM Ops uses revops_* prefix; other REIs use flat camelCase/snake fields
            const contactEmail = cleanResponses.revops_email || cleanResponses.email || cleanResponses.email_responsavel || cleanResponses.contato || '';
            const companyName = cleanResponses.revops_empresa || cleanResponses.nome_empresa || cleanResponses.empresa || cleanResponses.company || '';
            const searchQuery = contactEmail || companyName;

            console.log('[generate-strategic-plan] Initiating Notion Transcript Search for:', searchQuery);

            if (searchQuery) {
                // 1. Search for the Page
                const searchRes = await fetch('https://api.notion.com/v1/search', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${NOTION_API_KEY.trim()}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: searchQuery,
                        sort: { direction: 'descending', timestamp: 'last_edited_time' },
                        page_size: 1
                    })
                });

                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.results && searchData.results.length > 0) {
                        const pageId = searchData.results[0].id;
                        console.log('[generate-strategic-plan] Notion Page Found:', pageId);

                        // 2. Fetch the Blocks (Content)
                        const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${NOTION_API_KEY.trim()}`,
                                'Notion-Version': '2022-06-28',
                            }
                        });

                        if (blocksRes.ok) {
                            const blocksData = await blocksRes.json();
                            // Parse blocks into a clean string (Supports Paragraphs, Bulleted Lists, and Headings)
                            const extractedText = blocksData.results.map((b: any) => {
                              const type = b.type;
                              if (b[type]?.rich_text) {
                                  return b[type].rich_text.map((t: any) => t.plain_text).join('');
                              }
                              return '';
                            }).filter(Boolean).join('\n');
                            
                            transcriptText = extractedText;
                            console.log(`[generate-strategic-plan] Transcript Loaded: ${transcriptText.length} characters`);
                        } else {
                            console.log('[generate-strategic-plan] Failed to fetch blocks for page');
                        }
                    } else {
                        console.log('[generate-strategic-plan] No Notion Page matched the query.');
                    }
                } else {
                    console.log('[generate-strategic-plan] Notion API Search Failed HTTP', searchRes.status);
                }
            }
        } catch (e: any) {
            console.error('[generate-strategic-plan] Error during Notion flow:', e.message);
            // Non-blocking error. Will continue without transcript.
        }
    } else {
        console.log('[generate-strategic-plan] WARNING: NOTION_API_KEY missing in environment. Transcripts skipped.');
    }
    // --- END INTEGRATION ---


    let strategicContext = `Crie um plano estratégico de Growth altamente tático e contextualizado (90 dias).
Você DEVE basear cada insight, cada risco e cada etapa do roadmap ESPECIFICAMENTE nas dores relatadas nas respostas e na transcrição da call.
LEI IMUTÁVEL: NUNCA crie cenários genéricos de "aumentar vendas" ou "melhorar processos". Cite QUAIS processos estão ruins segundo o cliente. Diga QUANTO é o budget, QUAL ferramenta eles usam atualmente, QUAL é o tamanho do time.
Estruture o plano em 3 ciclos de 30 dias: Fundação → Execução → Escala. Os OKRs devem ter metas de CAC, LTV e ROAS onde aplicável.`;

    if (isCrmOps) {
      strategicContext = `Crie um Roadmap cirúrgico focado EXATAMENTE em 90 DIAS de implementação de RevOps/CRM "World-Class".
O roadmap deve transformar o caos atual (vide respostas e transcrição) em uma máquina previsível:
1. Mês 1 (Fundação Operacional): Centralizar os dados fragmentados do cliente, mapear processos As-Is e configurar o Blueprint do CRM.
2. Mês 2 (SLA e Automações): Speed to lead, automação de Hand-off MKT→SDR→Closer e dashboards de pipeline.
3. Mês 3 (Governança e Retenção): Rito de Pipeline Review semanal, Data Hygiene e Onboarding do CS.
LEI IMUTÁVEL: Seja ABSURDAMENTE específico. Se o cliente reclamou de leads frios, escreva "Filtro de Leads Frios com Lead Scoring no Funnels". Nomeie TODAS as ferramentas, cargos e gargalos citados. Os OKRs devem ter métricas de Win Rate, Velocidade do Pipeline e % de preenchimento do CRM.`;
    } else if (isFounder) {
      strategicContext = `Crie um Protocolo de Autoridade Digital e Personal Branding para EXATAMENTE 90 dias no LinkedIn.
ATENÇÃO CRÍTICA: Este é um Founder Protocol — o cliente é o produto. NÃO é um plano de empresa. Não crie OKRs de "aumentar vendas da empresa" ou "implementar CRM". O foco é 100% na pessoa, na audiência e na conversão de autoridade em oportunidade.
Estruture em 3 fases:
1. Mês 1 (Posicionamento e Identidade): Definir nicho de autoridade, POV único, ICP do perfil pessoal. Calibrar bio, headline, conteúdo fixado e banner do LinkedIn com base nos dados do cliente.
2. Mês 2 (Máquina de Conteúdo): Cadência 3x/semana, formatos de alto alcance (carrossel, text post, vídeo curto), estratégia de comentários em contas âncora do nicho.
3. Mês 3 (Loop de Conversão): Transformar audiência em pipeline — conexões estratégicas no ICP, DM ativo, convites para palestras, parcerias com criadores.
LEI IMUTÁVEL: Cite o nicho exato do founder, o ICP do perfil (cargo, empresa, segmento), os canais e formatos que ele mencionou. Os OKRs devem ter metas de impressões/mês, seguidores qualificados, conexões de 1º grau no ICP e inbounds via DM. NÃO use métricas de "engajamento genérico". Os pillars devem ser: Contexto Atual do Perfil / Posicionamento e Conteúdo / Alvos de Autoridade.`;
    } else if (isDev) {
      strategicContext = `Crie um Roadmap de Entrega de Projeto Digital para EXATAMENTE 6 semanas (não 90 dias).
ATENÇÃO CRÍTICA: Este é um projeto de desenvolvimento/site — NÃO é um plano de growth contínuo. Não crie OKRs de geração de demanda ou funil de vendas. O foco é ENTREGA com qualidade, prazo e resultado técnico mensurável.
Estruture em 3 fases:
1. Fase 1 — Briefing e Arquitetura (Semana 1): Definir escopo técnico, sitemap, stack tecnológica, referências visuais. Wireframe aprovado antes de qualquer linha de código.
2. Fase 2 — Desenvolvimento e Integrações (Semana 2–4): Codificar páginas prioritárias, integrar ferramentas (CRM, Analytics, formulários), revisão de copy e testes internos de performance e responsividade.
3. Fase 3 — QA, Lançamento e Handover (Semana 5–6): Rodada de feedback do cliente, ajustes finais, go-live controlado, configuração de DNS, treinamento de uso e entrega do repositório.
LEI IMUTÁVEL: Cite QUAIS páginas serão entregues, QUAL stack foi escolhida, QUAL meta de performance (LCP < 2.5s, GTmetrix ≥ 90). Os OKRs devem ser entregáveis concretos: wireframe aprovado, páginas em produção, Core Web Vitals no verde, handover documentado. Os pillars devem ser: Escopo e Arquitetura / Stack e Integrações / Performance e Entrega.`;
    }

    const prompt = `Você é o Diretor Estratégico "World-Class" de Growth & RevOps na RevHackers.
Acabamos de realizar o Onboarding/Diagnóstico (Kickoff) com um cliente.
As respostas do diagnóstico (REI) fornecidas revelam os gargalos, o caos interno e as restrições da empresa.

CONCEXTO DO CLIENTE:
Segmento: ${segment || 'B2B'}
Objetivo Principal: ${objective || 'Crescimento Previsível'}
Modelo B2B: ${isB2B !== false ? 'Sim' : 'Não'}

Respostas Reais do Diagnóstico:
${JSON.stringify(cleanResponses, null, 2)}
${scoringContext}

${transcriptText ? `
<TRANSCRIPT_CONTEXT>
${transcriptText}
</TRANSCRIPT_CONTEXT>
[CRÍTICO - ANTI-ALUCINAÇÃO]: O texto HTML <TRANSCRIPT_CONTEXT> é uma transcrição bruta (Discovery) e POSSUI ruído. Filtre o ruído, mas PRESERVE EXATAMENTE as dores factuais e citações diretas do cliente (Ex: "A gente gasta X", "Trocamos a plataforma Y", "Os vendedores não lançam as coisas no CRM").` : ''}

${strategicContext}

Retorne um JSON VÁLIDO EXATAMENTE NESTE FORMATO, e preencha TODOS os arrays com TÁTICAS AVANÇADAS, inferidas das respostas:
{
  "summary": "Resumo executivo cirúrgico atacando a dor principal (1-2 frases).",
  "context_mirror": {
    "segment": "Segmento ou nicho exato de atuação do cliente conforme as respostas (ex: SaaS B2B, E-commerce de moda, Consultor Independente de RH)",
    "objective": "Objetivo principal declarado pelo cliente nas respostas — direto e específico (ex: Implementar CRM com rastreamento completo em 90 dias)",
    "maturity": "Maturidade operacional/digital (ex: Inicial, Intermediária, Avançada) — baseada nas ferramentas e processos descritos",
    "restrictions": "Restrições LITERAIS de time, ferramentas ou orçamento extraídas diretamente das respostas e transcrição."
  },
  "signals": [
    { "type": "positive"|"negative"|"neutral", "text": "Citação ou sinal CLARO E ESPECÍFICO do cliente (Jamais genérico)", "impact": "Impacto real e numérico na operação" }
  ],
  "risks": [
    { "severity": "high"|"medium"|"low", "text": "Risco letal ATUAL baseado no relato", "mitigation": "Tática avançada da RevHackers para resolver. Exclua buzzwords como sinergia." }
  ],
  "decisions": [
    { "title": "Decisão Arrojada", "recommendation": "O que vamos cortar ou implementar sem dó", "basedOn": ["Dado real 1", "Dado real 2"], "ruleApplied": "Framework técnico adotado (ex: MEDDPICC, Lead Scoring)", "implication": "Resultância dura na equipe ou tech stack" }
  ],
  "pillars": [
    { "name": "Contexto Atual", "icon": "building", "items": ["Sintoma específico relatado 1", "Sintoma 2"] },
    { "name": "Tech Stack Visado", "icon": "settings", "items": ["Fato sobre a Stack atual vs a Ideal"] },
    { "name": "Alvos de Curto Prazo", "icon": "search", "items": ["Vencer a dor X", "Reduzir tempo na tela Y"] }
  ],
  "methodology_steps": [
    { "phase": "01", "tagline": "Semana 1-2", "name": "Fundação / Setup", "description": "Táticas duras que faremos na semana 1 usando os nomes reais das ferramentas citadas (se aplicável).", "principles": ["Tática exata 1", "Tática exata 2"] }
  ],
  "roadmap_phases": [
    { "name": "Ciclo 01", "title": "Setup Específico (Mês 1-2)", "items": ["Ação 1 cirúrgica contra a dor principal", "Ação 2 baseada no contexto real", "Ação 3 com ferramenta específica"] },
    { "name": "Ciclo 02", "title": "Execução e Ajustes (Mês 3-4)", "items": ["Ação 1 de execução concreta", "Ação 2 com métrica mensurável", "Ação 3 de consolidação"] },
    { "name": "Ciclo 03", "title": "Escala e Previsibilidade (Mês 5-6)", "items": ["Ação 1 de escala", "Ação 2 de automação avançada", "Ação 3 de medição e revisão"] }
  ],
  "okrs": [
    { "objective": "Nome do objetivo estratégico 1", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 1", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] },
    { "objective": "Nome do objetivo estratégico 2", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 2", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] },
    { "objective": "Nome do objetivo estratégico 3", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 3", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] }
  ],
  "onboarding_data": {
    "kickoff": {
      "main_title": "Frase de impacto inicial sobre o gargalo central deles.",
      "subtitle": "Por que essa reunião de kickoff define o jogo para este cliente específico.",
      "p1_title": "Título do Pilar 1", "p1_desc": "Descrição técnica 1...", "p1_output": "Nome do Entregável 1",
      "p2_title": "Título do Pilar 2", "p2_desc": "Descrição técnica 2...", "p2_output": "Nome do Entregável 2",
      "p3_title": "Título do Pilar 3", "p3_desc": "Descrição técnica 3...", "p3_output": "Nome do Entregável 3"
    },
    "setup": {
      "main_title": "...", "subtitle": "...", 
      "p1_title": "...", "p1_desc": "...", 
      "p2_title": "...", "p2_desc": "...", 
      "p3_title": "...", "p3_desc": "..."
    },
    "training": {
      "main_title": "...", "subtitle": "...", 
      "p1_title": "...", "p1_desc": "...", 
      "p2_title": "...", "p2_desc": "...", 
      "p3_title": "...", "p3_desc": "..."
    },
    "adoption": {
      "main_title": "...", "subtitle": "...", 
      "p1_title": "...", "p1_desc": "...", 
      "p2_title": "...", "p2_desc": "..."
    },
    "handover": {
      "main_title": "...", "subtitle": "...", 
      "p1_title": "...", "p1_desc": "...", 
      "p2_title": "...", "p2_desc": "..."
    }
  }
}

CRITICAL_RULE_ARRAYS: OBRIGATÓRIO retornar EXATAMENTE 3 itens em roadmap_phases (Ciclo 01, Ciclo 02, Ciclo 03), EXATAMENTE 3 itens em okrs (um por trimestre), EXATAMENTE 3 itens em pillars, e pelo menos 2 itens em methodology_steps. Arrays com apenas 1 item serão considerados inválidos.

CRITICAL_RULE_ONBOARDING: VOCÊ DEVE PREENCHER COMPLETAMENTE O onboarding_data substituindo as reticências (...) por frases autoritárias, técnicas e 100% voltadas à realidade do diagnóstico do cliente. Se ele falou sobre funis ruins no ActiveCampaign, preencha o p1_title de "setup" ou "training" falando diretamente sobre o ActiveCampaign. Seja extremamente cirúrgico e agressivo na entrega de valor. Nunca retorne genéricos do tipo "Construir funis de e-mail". Retorne "Mapeamento dos fluxos automáticos de abandono no ActiveCampaign citados na reunião".

CRITICAL_RULE_BRANDING: NUNCA mencione "GoHighLevel", "GHL" ou "HighLevel". Sempre que propor, mencionar ou estruturar a infraestrutura de CRM, o único nome oficial que deve ser utilizado no planejamento é "Funnels".
CRITICAL_RULE_SPECIFICITY: OBRIGATÓRIO Citar nomes de ferramentas e palavras exatas do cliente. PROIBIDO USAR AS PALAVRAS GENÉRICAS COMO "potencializar", "sinergia", "otimizar processos" SEM explicar como. Você será penalizado se produzir texto vago. Entregue APENAS o JSON válido.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um Parser Estrito. Responda APENAS com um objeto JSON válido. Não inclua blocos ```json no início ou no fim. Respeite todas as tipagens documentadas.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1 // Ultra low temp for strict JSON adherence and factual regurgitation from Transcript
      })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('[generate-strategic-plan] OpenAI API Error:', err);
        throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Recieved empty response from OpenAI');
    }

    let planData;
    try {
      planData = JSON.parse(content);
    } catch (e) {
      console.error('[generate-strategic-plan] Parse error on raw output:', content);
      throw new Error('Failed to parse JSON out of AI response');
    }

    return new Response(JSON.stringify({ result: planData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[generate-strategic-plan] Caught Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
