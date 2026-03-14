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
  projectId?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { rei_responses, segment, objective, isB2B, projectType, projectId }: GenerateParams = await req.json();

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
            const companyName = cleanResponses.revops_empresa || cleanResponses.companyName || cleanResponses.nome_empresa || cleanResponses.empresa || cleanResponses.company || cleanResponses.projectName || '';
            const founderName = cleanResponses.fullName || '';
            const searchQuery = contactEmail || companyName || founderName;

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

    // --- INTEGRATION: Client Reference Materials ---
    let materialsContext = "";
    if (projectId) {
      try {
        // @ts-ignore
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
          const matRes = await fetch(
            `${SUPABASE_URL}/rest/v1/rei_materials?project_id=eq.${projectId}&status=eq.ready&select=*`,
            {
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              }
            }
          );

          if (matRes.ok) {
            const materials = await matRes.json();
            console.log(`[generate-strategic-plan] Found ${materials.length} reference materials`);

            for (const mat of materials) {
              materialsContext += `\nMATERIAL: ${mat.original_name || 'Sem nome'} (Tipo: ${mat.material_type})`;
              if (mat.description) materialsContext += `\nDescrição do cliente: ${mat.description}`;
              if (mat.extracted_text) materialsContext += `\nConteúdo extraído:\n${mat.extracted_text.substring(0, 3000)}`;
              if (mat.source_type === 'link' && mat.file_url) materialsContext += `\nLink: ${mat.file_url}`;
              materialsContext += '\n---';
            }
          }
        }
      } catch (matError: any) {
        console.warn('[generate-strategic-plan] Materials fetch failed (non-blocking):', matError.message);
      }
    }
    // --- END MATERIALS INTEGRATION ---

    let strategicContext = `Crie um plano estratégico de Growth altamente tático e contextualizado (90 dias).
Você DEVE basear cada insight, cada risco e cada etapa do roadmap ESPECIFICAMENTE nas dores relatadas nas respostas e na transcrição da call.
LEI IMUTÁVEL: NUNCA crie cenários genéricos de "aumentar vendas" ou "melhorar processos". Cite QUAIS processos estão ruins segundo o cliente. Diga QUANTO é o budget, QUAL ferramenta eles usam atualmente, QUAL é o tamanho do time.
Estruture o plano em 3 ciclos de 30 dias: Fundação → Execução → Escala. Os OKRs devem ter metas de CAC, LTV e ROAS onde aplicável.`;

    if (isCrmOps) {
      strategicContext = `Crie um Roadmap cirúrgico focado EXATAMENTE em 90 DIAS (3 meses) de implementação de RevOps/CRM de excelência.
O roadmap deve transformar o caos atual (vide respostas e transcrição) em uma máquina previsível:
1. Mês 01 (Fundação Operacional): Centralizar os dados fragmentados do cliente, mapear processo atual e configurar o Projeto Técnico do CRM.
2. Mês 02 (SLA e Automações): Velocidade de resposta ao lead, automação de Passagem de Bastão MKT→SDR→Closer e painéis de pipeline.
3. Mês 03 (Governança e Retenção): Rito de Revisão de Pipeline semanal, Higiene de Dados e Onboarding do CS.
LEI IMUTÁVEL: Seja ABSURDAMENTE específico. Se o cliente reclamou de leads frios, escreva "Filtro de Leads Frios com Lead Scoring no Funnels". Nomeie TODAS as ferramentas, cargos e gargalos citados. Os OKRs devem ter métricas de Taxa de Conversão, Velocidade do Pipeline e % de preenchimento do CRM.`;
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

    // ── Knowledge Base: Strategic Frameworks ──
    // Conceitos de livros de referência que fundamentam a metodologia RevHackers
    let frameworkContext = `
FRAMEWORK BASE — ONBOARDING ORQUESTRADO (Donna Weber):
O onboarding é a jornada completa de levar o cliente ao sucesso — NÃO é apenas implementação técnica.
6 etapas: Embarque → Passagem de Bastão → Kickoff → Adoção → Revisão → Expansão.
Começa ANTES do fechamento da venda. A janela crítica são os primeiros 90 dias.
Mais de 50% do churn está vinculado a onboarding deficiente.
O Plano de Sucesso deve incluir: visão do cliente, resultados desejados, cronograma, papéis (RACI) e métricas.
Cada etapa do onboarding_data que você gerar DEVE mapear para essas 6 fases.

FRAMEWORK — VIESES COGNITIVOS (Kahneman):
- Aversão à perda: mostre o custo de NÃO agir no diagnóstico (2x mais impactante que ganhos).
- Ancoragem: apresente benchmarks do setor ANTES de mostrar os números do cliente.
- Facilidade cognitiva: recomendações claras e diretas são mais persuasivas que textos longos.`;

    if (!isFounder && !isDev) {
      frameworkContext += `

FRAMEWORK — RECEITA PREVISÍVEL (Aaron Ross):
3 tipos de leads: Seeds (referral/orgânico) + Nets (inbound/marketing) + Spears (outbound/prospecção ativa).
Especialização de funções: SDR (prospecta) → AE/Closer (fecha) → CS (retém e expande).
7 erros fatais: atribuir prospecção a vendedores, não ter ICP definido, depender de um único canal, não rastrear métricas por etapa.
O "Vale da Morte" é a transição de crescimento orgânico para crescimento previsível.
Use esses conceitos ao estruturar geração de demanda, pipeline e OKRs do plano.`;
    }

    const prompt = `Você é o Diretor Estratégico "World-Class" de Growth & RevOps na RevHackers.
Acabamos de realizar o Onboarding/Diagnóstico (Kickoff) com um cliente.
As respostas do diagnóstico (REI) fornecidas revelam os gargalos, o caos interno e as restrições da empresa.

${frameworkContext}

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

${materialsContext ? `
<MATERIAIS_REFERENCIA>
${materialsContext}
</MATERIAIS_REFERENCIA>
[INSTRUÇÃO MATERIAIS]: O cliente forneceu materiais de referência próprios. Use-os ativamente:
- Alinhe a linguagem do plano com frameworks e metodologias que o cliente já usa
- Identifique gaps entre processos documentados nos materiais e o processo ideal
- Referencie explicitamente os materiais nas recomendações (ex: "Conforme identificado no playbook de vendas fornecido...")
- Baseia projeções e metas em dados reais encontrados nos materiais (não em benchmarks genéricos)
- Se houver planilhas ou dados numéricos, extraia métricas reais para calibrar os OKRs` : ''}

${strategicContext}

Retorne um JSON VÁLIDO EXATAMENTE NESTE FORMATO, e preencha TODOS os arrays com TÁTICAS AVANÇADAS, inferidas das respostas:
{
  "summary": "Resumo executivo cirúrgico atacando a dor principal (1-2 frases).",
  "executive_summary": {
    "context": "1-2 frases descrevendo o contexto operacional EXATO do cliente — segmento, tamanho, maturidade digital. Baseado nas respostas reais.",
    "problem": "1-2 frases definindo o problema central com dados concretos — cite dores literais da call/REI.",
    "solution": "1-2 frases sobre a solução proposta pela RevHackers — cite a metodologia específica e ferramentas.",
    "expected_outcome": "1-2 frases sobre o resultado esperado com métricas específicas — CAC, LTV, conversão, prazo."
  },
  "current_vs_future": {
    "current": ["Estado atual 1 — situação real negativa extraída do diagnóstico", "Estado atual 2 — gap operacional citado pelo cliente", "Estado atual 3 — ferramenta ou processo deficiente mencionado", "Estado atual 4 — consequência financeira ou de performance", "Estado atual 5 — risco ou dependência não mitigada"],
    "future": ["Estado futuro 1 — como ficará após a implementação", "Estado futuro 2 — melhoria operacional específica", "Estado futuro 3 — ferramenta ou processo implementado", "Estado futuro 4 — resultado financeiro ou de performance esperado", "Estado futuro 5 — autonomia ou governança conquistada"]
  },
  "quick_wins": [
    { "day": "Dia 1", "action": "Ação concreta do primeiro dia — cite ferramenta e responsável", "outcome": "Resultado tangível entregue ao final do dia" },
    { "day": "Dia 2", "action": "Ação do segundo dia", "outcome": "Entregável concreto" },
    { "day": "Dia 3", "action": "Ação do terceiro dia", "outcome": "Entregável concreto" },
    { "day": "Dia 4–5", "action": "Ação dos dias 4 e 5", "outcome": "Entregável concreto" },
    { "day": "Dia 6", "action": "Ação do sexto dia", "outcome": "Entregável concreto" },
    { "day": "Dia 7", "action": "Review + marco de conclusão da primeira semana", "outcome": "Confirmação de que a base está sólida" }
  ],
  "thesis_statement": {
    "before": "Frase que antecede o highlight — contextualize a necessidade (ex: Para escalar vendas sem perder margem, precisamos construir)",
    "highlight": "Conceito central da tese em 2-4 palavras destacadas (ex: Motor de Receita Integrado)",
    "after": "Conclusão da frase (ex: .)"
  },
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
    { "name": "Contexto Atual", "icon": "building", "items": ["Sintoma 1 específico relatado pelo cliente", "Sintoma 2 com dado numérico se disponível", "Restrição operacional citada na call", "Gap ou ineficiência mapeada no diagnóstico"] },
    { "name": "Tech Stack Visado", "icon": "settings", "items": ["Ferramenta atual vs. ferramenta ideal", "Integração necessária específica", "Gap de rastreamento identificado", "Automação prioritária a implementar"] },
    { "name": "Alvos de Curto Prazo", "icon": "search", "items": ["Alvo 1 com métrica ou prazo claro", "Alvo 2 baseado na dor principal", "Alvo 3 de quick win operacional", "Alvo 4 de resultado mensurável"] },
    { "name": "Compromissos Mútuos", "icon": "handshake", "items": ["Reuniões de RAPT mensais — Revisão, Alinhamento, Prioridade, Tática", "Disponibilidade de materiais e aprovações em até 48h", "Acessos compartilhados a CRM, Ads e Analytics", "Compartilhamento de resultados para fechar o loop de atribuição"] }
  ],
  "thesis_pillars": [
    { "icon": "Target", "title": "Nome do Pilar de Solução 1 — o mais urgente", "description": "Como EXATAMENTE este pilar resolve o gap diagnosticado — cite a ferramenta, o processo e a métrica alvo. 2-3 frases.", "actions": ["Ação concreta 1 com ferramenta nomeada", "Ação concreta 2 com prazo", "Ação concreta 3 com KPI"] },
    { "icon": "Zap", "title": "Nome do Pilar de Solução 2", "description": "O segundo vetor de transformação — conecte ao segundo sinal ou risco diagnosticado.", "actions": ["Ação concreta 1", "Ação concreta 2", "Ação concreta 3"] },
    { "icon": "Rocket", "title": "Nome do Pilar de Solução 3", "description": "O pilar de escala/consolidação — o que garante que os ganhos dos pilares 1 e 2 se mantenham.", "actions": ["Ação concreta 1", "Ação concreta 2", "Ação concreta 3"] }
  ],
  "methodology_steps": [
    { "phase": "01", "tagline": "Semana 1-2", "name": "Fundação / Setup", "description": "Táticas duras que faremos na semana 1 usando os nomes reais das ferramentas citadas (se aplicável).", "principles": ["Tática exata 1", "Tática exata 2"] }
  ],
  "roadmap_phases": [
    { "name": "Ciclo 01", "title": "Fundação e Diagnóstico (Mês 01)", "items": ["Ação 1 cirúrgica contra a dor principal", "Ação 2 baseada no contexto real", "Ação 3 com ferramenta específica", "Ação 4 de configuração técnica"] },
    { "name": "Ciclo 02", "title": "Execução e Automações (Mês 02)", "items": ["Ação 1 de execução concreta", "Ação 2 com métrica mensurável", "Ação 3 de automação e integração", "Ação 4 de treinamento da equipe"] },
    { "name": "Ciclo 03", "title": "Governança e Escala (Mês 03)", "items": ["Ação 1 de governança operacional", "Ação 2 de revisão e otimização", "Ação 3 de documentação e passagem de bastão", "Ação 4 de consolidação de resultados"] }
  ],
  "okrs": [
    { "objective": "Nome do objetivo estratégico 1", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 1", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] },
    { "objective": "Nome do objetivo estratégico 2", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 2", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] },
    { "objective": "Nome do objetivo estratégico 3", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 3", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] }
  ],
  "onboarding_data": {
    "kickoff": {
      "main_title": "Frase cirúrgica sobre o gargalo central deste cliente — cite a dor exata relatada na call.",
      "p1_title": "Nome do pilar do kickoff voltado ao problema principal (ex: Revisão do Funil de Vendas)", "p1_desc": "Descrição técnica conectada à realidade do cliente — cite ferramentas e processos mencionados.", "p1_output": "Entregável concreto (ex: Documento de Diagnóstico Operacional)",
      "p2_title": "Nome do segundo pilar do kickoff (ex: Mapa de Responsáveis)", "p2_desc": "O que será definido e por quê, conectado ao contexto do diagnóstico.", "p2_output": "Entregável concreto (ex: Matriz de Responsabilidades Assinada)",
      "p3_title": "Nome do terceiro pilar do kickoff (ex: Inventário de Acessos)", "p3_desc": "Ação concreta conectada à infraestrutura do cliente — cite plataformas mencionadas.", "p3_output": "Entregável concreto (ex: Cofre de Credenciais Preenchido)"
    },
    "setup": {
      "main_title": "Frase de impacto sobre a importância da fundação técnica para ESTE cliente.",
      "p1_title": "Ação técnica principal de setup (ex: Estruturação do Pipeline no Funnels)", "p1_desc": "Descrição conectada aos processos e ferramentas do cliente — cite nomes reais.",
      "p2_title": "Segunda ação de setup (ex: Integração de Canais de Entrada)", "p2_desc": "Descrição específica ao contexto do diagnóstico.",
      "p3_title": "Terceira ação de setup (ex: Rastreamento de Ponta a Ponta)", "p3_desc": "Como implementamos o rastreamento com base na stack do cliente."
    },
    "training": {
      "main_title": "Frase sobre a importância da adoção da equipe para ESTE cliente.",
      "p1_title": "Formato de treinamento (ex: Sessões Gravadas por Módulo)", "p1_desc": "Como o treinamento é entregue — conectado ao nível de maturidade do time.",
      "p2_title": "Validação prática (ex: Simulação de Cenários Reais)", "p2_desc": "Como garantimos que o time absorveu — cenários baseados no dia a dia DELES.",
      "p3_title": "Marco de transição (ex: Migração Definitiva do Processo Antigo)", "p3_desc": "O momento em que o sistema antigo morre — cite qual era o processo anterior."
    },
    "adoption": {
      "main_title": "Frase sobre ajustes pós-treinamento conectada à realidade do cliente.",
      "p1_title": "Monitoramento silencioso (ex: Auditoria de Preenchimento)", "p1_desc": "Como monitoramos a adoção real — cite os campos e etapas críticos deste cliente.",
      "p2_title": "Ajustes estruturais (ex: Refinamento de Etapas de Funil)", "p2_desc": "Mudanças identificadas na prática — conectadas ao diagnóstico inicial."
    },
    "handover": {
      "main_title": "Frase sobre a transição de bastão e autonomia do cliente.",
      "p1_title": "Entregável de documentação (ex: Manual Operacional Completo)", "p1_desc": "O que é entregue para que o cliente opere sem dependência — cite as ferramentas.",
      "p2_title": "Entregável de análise (ex: Relatório de Resultados dos 90 Dias)", "p2_desc": "Métricas e resultados consolidados — conectados aos OKRs definidos no kickoff."
    }
  }
}

CRITICAL_RULE_ARRAYS: OBRIGATÓRIO retornar EXATAMENTE 3 itens em roadmap_phases (Ciclo 01, Ciclo 02, Ciclo 03), EXATAMENTE 3 itens em okrs (um por trimestre), EXATAMENTE 4 itens em pillars (Contexto, Tech Stack, Alvos, Compromissos), EXATAMENTE 3 itens em thesis_pillars (os 3 pilares da tese de solução), pelo menos 2 itens em methodology_steps, EXATAMENTE 5 itens em current_vs_future.current e current_vs_future.future, e EXATAMENTE 6 itens em quick_wins. Arrays com apenas 1 item serão considerados inválidos.
CRITICAL_RULE_EXECUTIVE_SUMMARY: O executive_summary DEVE ser ultra-cirúrgico — cada campo em 1-2 frases curtas e impactantes. O thesis_statement DEVE ser uma frase persuasiva e personalizada para ESTE cliente — NUNCA use a tese genérica. O quick_wins DEVE ter ações concretas dos primeiros 7 dias — o que acontece LITERALMENTE no Day 1, Day 2, etc. O current_vs_future DEVE contrastar o estado real atual (problemas) com o estado futuro (após a implementação) usando linguagem específica do diagnóstico.

CRITICAL_RULE_ONBOARDING: VOCÊ DEVE PREENCHER COMPLETAMENTE O onboarding_data substituindo as reticências (...) por frases autoritárias, técnicas e 100% voltadas à realidade do diagnóstico do cliente. Se ele falou sobre funis ruins no ActiveCampaign, preencha o p1_title de "setup" ou "training" falando diretamente sobre o ActiveCampaign. Seja extremamente cirúrgico e agressivo na entrega de valor. Nunca retorne genéricos do tipo "Construir funis de e-mail". Retorne "Mapeamento dos fluxos automáticos de abandono no ActiveCampaign citados na reunião".

CRITICAL_RULE_BRANDING: NUNCA mencione "GoHighLevel", "GHL" ou "HighLevel". Sempre que propor, mencionar ou estruturar a infraestrutura de CRM, o único nome oficial que deve ser utilizado no planejamento é "Funnels".
CRITICAL_RULE_SPECIFICITY: OBRIGATÓRIO Citar nomes de ferramentas e palavras exatas do cliente. PROIBIDO USAR AS PALAVRAS GENÉRICAS COMO "potencializar", "sinergia", "otimizar processos" SEM explicar como. Você será penalizado se produzir texto vago. Entregue APENAS o JSON válido.
CRITICAL_RULE_PORTUGUESE: TODO o conteúdo gerado DEVE ser 100% em PORTUGUÊS BRASILEIRO. PROIBIDO usar termos em inglês como "Blueprint", "Hand-off", "Go-Live", "Data Hygiene", "Pipeline Review", "Win Rate", "Speed to Lead", "Handover", "As-Is", "To-Be", "SOP", "Go-To-Market", "Break-Even", "Forecast", "Data-Driven", "Weekly Review". Use SEMPRE os equivalentes em português: "Projeto Técnico", "Passagem de Bastão", "Entrada em Produção", "Higiene de Dados", "Revisão de Pipeline", "Taxa de Conversão", "Velocidade de Resposta", "Processo Atual", "Processo Ideal", "Manual Operacional", "Estratégia de Entrada no Mercado", "Ponto de Equilíbrio", "Previsão de Receita", "Orientado por Dados", "Revisão Semanal". Acrônimos técnicos universais como CRM, SQL, MQL, ROAS, CAC, LTV, KPI, OKR, ICP, UTM são permitidos.`;

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
