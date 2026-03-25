import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
    type: 'benchmark' | 'personas' | 'market' | 'synthesis';
    segment: string;
    competitors?: { nome: string, url?: string }[];
    objective?: string;
    context?: any;
    siteAnalysis?: any;
    projectType?: string;
    enrichedData?: {
        market?: any;
        personas?: any;
        benchmark?: any;
    };
    jobId?: string;
}

// Build site analysis context block
function buildSiteBlock(sa: any): string {
    if (!sa || typeof sa !== 'object') return '';
    const lines: string[] = ['', '--- Analise do site do cliente ---'];
    if (sa.resumo_proposta) lines.push(`Proposta de valor: ${sa.resumo_proposta}`);
    if (sa.publico_alvo) lines.push(`Publico-alvo: ${sa.publico_alvo}`);
    if (sa.produtos_servicos) {
        const prods = Array.isArray(sa.produtos_servicos) ? sa.produtos_servicos.join(', ') : sa.produtos_servicos;
        lines.push(`Produtos/Servicos: ${prods}`);
    }
    if (sa.diferenciais) lines.push(`Diferenciais: ${sa.diferenciais}`);
    if (sa.maturidade_digital) lines.push(`Maturidade digital: ${sa.maturidade_digital}`);
    if (sa.tom_comunicacao) lines.push(`Tom de comunicacao: ${sa.tom_comunicacao}`);
    if (sa.pontos_fracos_site) {
        const fraq = Array.isArray(sa.pontos_fracos_site) ? sa.pontos_fracos_site.join(', ') : sa.pontos_fracos_site;
        lines.push(`Pontos fracos do site: ${fraq}`);
    }
    if (sa.oportunidades_estrategicas) {
        const oport = Array.isArray(sa.oportunidades_estrategicas) ? sa.oportunidades_estrategicas.join(', ') : sa.oportunidades_estrategicas;
        lines.push(`Oportunidades: ${oport}`);
    }
    return lines.join('\n');
}

// Build structured client context from REI responses
function buildClientContext(rei: any, segment: string, objective?: string): string {
    if (!rei) return '';

    const lines: string[] = [];
    lines.push('<CONTEXTO_REAL_DO_CLIENTE>');

    // Company identification
    const company = rei?.companyName || rei?.revops_empresa || rei?.nome_empresa || rei?.empresa || '';
    const site = rei?.companySite || rei?.revops_site || rei?.site || '';
    if (company) lines.push(`Empresa: ${company}`);
    if (site) lines.push(`Site: ${site}`);
    lines.push(`Segmento: ${segment}`);
    if (objective) lines.push(`Objetivo Principal: ${objective}`);

    // Team and structure
    const teamSize = rei?.teamSize || rei?.revops_tamanho_time || rei?.tamanho_time || '';
    const revenue = rei?.monthlyRevenue || rei?.revops_faturamento || rei?.faturamento || '';
    const budget = rei?.budget || rei?.revops_budget || rei?.orcamento || '';
    if (teamSize) lines.push(`Tamanho do time: ${teamSize}`);
    if (revenue) lines.push(`Faturamento: ${revenue}`);
    if (budget) lines.push(`Budget disponivel: ${budget}`);

    // Current tools and stack
    const crm = rei?.currentCRM || rei?.revops_crm_atual || rei?.crm || '';
    const tools = rei?.currentTools || rei?.revops_ferramentas || rei?.ferramentas || '';
    const adsChannels = rei?.adsChannels || rei?.revops_canais_aquisicao || rei?.canais || '';
    if (crm) lines.push(`CRM atual: ${crm}`);
    if (tools) lines.push(`Ferramentas em uso: ${typeof tools === 'object' ? JSON.stringify(tools) : tools}`);
    if (adsChannels) lines.push(`Canais de aquisicao: ${typeof adsChannels === 'object' ? JSON.stringify(adsChannels) : adsChannels}`);

    // Pain points and challenges
    const mainPain = rei?.mainChallenge || rei?.revops_maior_dor || rei?.maiorDor || rei?.biggestPain || '';
    const bottleneck = rei?.bottleneck || rei?.revops_gargalo || rei?.gargalo || '';
    if (mainPain) lines.push(`Dor principal: ${mainPain}`);
    if (bottleneck) lines.push(`Gargalo operacional: ${bottleneck}`);

    // Metrics
    const conversionRate = rei?.conversionRate || rei?.revops_taxa_conversao || '';
    const avgTicket = rei?.avgTicket || rei?.revops_ticket_medio || rei?.ticketMedio || '';
    const salesCycle = rei?.salesCycle || rei?.revops_ciclo_vendas || '';
    if (conversionRate) lines.push(`Taxa de conversao atual: ${conversionRate}`);
    if (avgTicket) lines.push(`Ticket medio: ${avgTicket}`);
    if (salesCycle) lines.push(`Ciclo de vendas: ${salesCycle}`);

    lines.push('</CONTEXTO_REAL_DO_CLIENTE>');
    return lines.join('\n');
}

// ============================================================
// OPENAI API CALL (GPT-5.4 - Deep Research synthesis)
// ============================================================

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-5.4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.4,
            tools: [{ type: 'web_search_preview' }],
            web_search_preview: true
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No content in OpenAI response');
    }

    let cleanContent = content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
    cleanContent = cleanContent.trim();

    // Try to extract JSON object
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanContent = jsonMatch[0];
    }

    try {
        return JSON.parse(cleanContent);
    } catch {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('Failed to parse AI response as JSON');
    }
}

// ============================================================
// TYPE-SPECIFIC PROMPTS (Deep Research - more detailed than enrich)
// ============================================================

function getBenchmarkPrompt(segment: string, objective?: string, context?: any, siteAnalysis?: any, projectType?: string): string {
    const siteBlock = buildSiteBlock(siteAnalysis);
    const contextBlock = context ? `\nDados do diagnostico do cliente: \n${buildClientContext(context, segment, objective)}` : '';
    
    const isCrmOps = projectType === 'crm_ops';
    const company = context?.companyName || context?.revops_empresa || '';
    const companySite = context?.companySite || context?.revops_site || '';
    const crmOpsInstruction = isCrmOps 
        ? `\n\nREGRA CRITICA DE CONTEXTO:
Este projeto e uma consultoria de CRM/Operacoes Comerciais prestada para a empresa cliente.
O "Objetivo" listado acima descreve o que a CONSULTORIA vai fazer - NAO e o negocio do cliente.
${company ? `A empresa cliente e: ${company}` : ''}
${companySite ? `Site da empresa cliente: ${companySite}` : ''}
PASSOS OBRIGATORIOS (execute mentalmente antes de gerar o JSON):
1. Acesse o site da empresa e identifique o SETOR principal (ex: AdTech, HealthTech, Varejo, Educacao, Industria).
2. Identifique o SUB-NICHO especifico dentro desse setor (ex: "Atribuicao de midia offline para TV/Radio", nao apenas "AdTech"). Este detalhe e critico para um benchmark preciso.
3. Gere o benchmark EXCLUSIVAMENTE para esse sub-nicho especifico - com empresas concorrentes reais que atuam nesse espaco exato.
4. CAC, ciclo de vendas e LTV:CAC devem ser referencia para o sub-nicho identificado, nao para o setor amplo.
NUNCA gere benchmark de "CRM como servico", "Consultoria de RevOps" ou "Marketing de Performance" a menos que o SITE da empresa venda isso.` 
        : '';

    return `Segmento declarado: ${segment}
Objetivo do projeto de consultoria (NAO e o mercado do cliente): ${objective || 'crescimento'}
${contextBlock}${siteBlock}${crmOpsInstruction}

Tarefa: Voce e o Head de Inteligencia de Mercado da RevHackers. Gere um BENCHMARK PROFUNDO e PERSONALIZADO para o segmento deste cliente no Brasil.
INSTRUCOES CRITICAS:
- ESTRITAMENTE PROIBIDO USAR RANGES GENERICOS DE CAC (Ex do que NÃO fazer: "R$ 500 a R$ 2.000"). Você DEVE informar a MÉDIA EXATA CALCULADA que ocorre na prática do Brasil (Ex do que fazer: "R$ 1.250,00" ou "R$ 350,00"). Aja como quem cruzou os dados e chegou à média do momento.
- O mesmo vale para ciclo de vendas e conversão: dê apenas um valor pontual médio do segmento, nada de margens amplas que mostram incerteza.
- Se os dados do diagnostico ou site revelam CRM atual, ticket medio ou taxa de conversao, USE para comparar com o mercado do sub-nicho.
- Cite empresas REAIS do sub-nicho identificado. Nao use genericos.
- O comparativo deve ser uma analise estrategica de 3-4 frases que ajude o cliente a se posicionar nesse sub-nicho especifico.
- IDIOMA: Todo o conteudo DEVE estar em Portugues do Brasil correto, com acentuacao completa (ex: "métricas", "conversão", "posição", "análise"). Nao omita acentos.
- NUNCA use o caractere em dash (travessao longo U+2014) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "cac_medio": "Valor monetario ÚNICO e exato com contexto curto (ex: R$ 350,00 - acima da media do segmento por ser ticket alto). Sem ranges.",
  "taxa_conversao": "Porcentagem pontual com contexto (ex: 2.8% - no Brasil a media é 3.2%). Sem ranges.",
  "ciclo_vendas": "Tempo pontual com contexto (ex: 45 dias - lideres fazem em 30). Sem ranges.",
  "ltv_cac_ratio": "Ratio com meta (ex: 4:1 - meta saudavel para o segmento)",
  "ferramentas_principais": {
    "crm": ["CRM real 1", "CRM real 2", "CRM real 3"],
    "automacao": ["Ferramenta real 1", "Ferramenta real 2"],
    "ads": ["Canal mais eficiente 1", "Canal 2"]
  },
  "comparativo_mercado": "Analise estrategica de 3-4 frases sobre o cenario competitivo, citando empresas reais e onde o cliente se posiciona.",
  "fonte": "Deep Research GPT-5.4"
}`;
}

function getPersonasPrompt(segment: string, objective?: string, context?: any, siteAnalysis?: any, projectType?: string): string {
    const siteBlock = buildSiteBlock(siteAnalysis);
    const contextBlock = context ? `\nDados do diagnostico do cliente: \n${buildClientContext(context, segment, objective)}` : '';

    const isCrmOps = projectType === 'crm_ops';
    const company = context?.companyName || context?.revops_empresa || '';
    const companySite = context?.companySite || context?.revops_site || '';
    const crmOpsInstruction = isCrmOps 
        ? `\n\nREGRA CRITICA DE CONTEXTO:
Este projeto e uma consultoria de CRM/Operacoes Comerciais.
O "Objetivo" listado descreve o que a CONSULTORIA vai entregar - NAO e o negocio do cliente.
${company ? `A empresa cliente e: ${company}` : ''}
${companySite ? `Site da empresa cliente: ${companySite}` : ''}
PASSOS OBRIGATORIOS (execute mentalmente antes de gerar o JSON):
1. Acesse o site e identifique o SETOR e SUB-NICHO especifico da empresa.
2. As personas devem ser os COMPRADORES REAIS do produto/servico que essa empresa vende naquele sub-nicho.
3. Cada persona deve ter cargo, empresa-tipo e motivacoes especificos para aquele sub-nicho.
NAO gere personas genericas de tech ou vendas - sejam especificas ao sub-nicho identificado.` 
        : '';

    return `Segmento declarado: ${segment}
Objetivo do projeto de consultoria (NAO e o mercado do cliente): ${objective || 'crescimento'}
${contextBlock}${siteBlock}${crmOpsInstruction}

Tarefa: Voce e o Estrategista de ICP da RevHackers. Crie 3 BUYER PERSONAS ultra-detalhadas que representem os compradores REAIS dos produtos e servicos DESTE cliente.
ATENCAO: Nao confunda o projeto/servico que a RevHackers esta prestando (ex: crm_ops, consultoria) com o que o cliente vende. As personas devem ser os clientes DO cliente, baseadas firmemente na Analise do Site e no Segmento.

INSTRUCOES CRITICAS DE PERSONALIZACAO:
- Se o site do cliente vende produtos/servicos especificos, as personas DEVEM ser compradores IGUAIS aos que compram esses produtos.
- Se o publico-alvo foi identificado, as personas DEVEM estar nesse publico.
- Cada persona deve ser PSICOLOGICAMENTE distinta: um decisor (C-level), um influenciador tecnico, um usuario final.
- Nomes brasileiros realistas. Bios com carreiras brasileiras.
- O pitch_elevador DEVE mencionar o MECANISMO ESPECIFICO e UNICO que a empresa usa (ex: "quando seu anuncio vai ao ar na TV, sua campanha digital ativa automaticamente"). JAMAIS use frases genericas como "insights acionaveis" ou "dados de comportamento digital" isoladamente. Mencione O QUE a empresa faz de especifico que nenhum concorrente faz igual.
- IDIOMA OBRIGATORIO: Todo o conteudo gerado DEVE estar em Portugues do Brasil correto, com acentuacao completa (ex: "ação", "análise", "gestão", "mídia", "público"). Nao omita acentos.
- NUNCA use o caractere em dash (travessao longo U+2014) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "personas": [
    {
      "nome": "Nome Sobrenome brasileiro realista",
      "cargo": "Cargo real do mercado brasileiro",
      "idade": "Ex: 38-45 anos",
      "genero": "M ou F",
      "bio_curta": "2-3 frases sobre trajetoria, tipo de empresa onde trabalha e momento de carreira. Conecte ao sub-nicho especifico da empresa.",
      "empresa_tipo": "Tipo de empresa realista e especifica ao sub-nicho (ex: Anunciante de varejo com budget de TV de R$5mi/ano)",
      "dores_principais": ["Dor ESPECIFICA conectada ao produto/servico do cliente neste sub-nicho", "Dor do cargo neste contexto", "Dor do mercado"],
      "ganhos_desejados": ["Ganho especifico que o produto resolve para este perfil", "Ganho profissional mensuravel"],
      "objecoes_compra": ["Objecao real ao avaliar este tipo de solucao", "Objecao financeira", "Objecao politica interna"],
      "gatilhos_mentais": ["Gatilho que funciona para este perfil (ex: Autoridade)", "Segundo gatilho"],
      "canais_favoritos": ["Canal real onde consome conteudo", "Canal 2", "Canal 3"],
      "pitch_elevador": "Frase que menciona O MECANISMO ESPECIFICO da empresa. Deve ser literal, especifica e diferente para cada persona. Ex correto: 'A Tunad detecta em tempo real quando seu comercial vai ao ar na TV e ativa automaticamente sua campanha digital para capturar a intencao gerada.' Ex errado: 'Transformamos dados em insights acionaveis.'"
    }
  ]
}
Gere EXATAMENTE 3 personas com TODOS os campos preenchidos.`;
}

function getMarketPrompt(segment: string, competitors?: { nome: string, url?: string }[], objective?: string, context?: any, siteAnalysis?: any, projectType?: string): string {
    const siteBlock = buildSiteBlock(siteAnalysis);
    let competitorsBlock = '';
    if (competitors && competitors.length > 0) {
        competitorsBlock = `
CONCORRENTES INFORMADOS PELO CLIENTE (ANALISE COM PRIORIDADE TOTAL):
${competitors.map(c => `- ${c.nome}${c.url ? ' (' + c.url + ')' : ''}`).join('\n')}
Voce DEVE analisar estes concorrentes especificamente. Complemente com outros players reais se necessario.
`;
    }
    const contextBlock = context ? `\nDados do diagnostico: \n${buildClientContext(context, segment, objective)}` : '';

    const isCrmOps = projectType === 'crm_ops';
    const company = context?.companyName || context?.revops_empresa || '';
    const companySite = context?.companySite || context?.revops_site || '';
    const crmOpsInstruction = isCrmOps 
        ? `\n\nREGRA CRITICA DE CONTEXTO:
Este projeto e uma consultoria de CRM/Operacoes Comerciais - o "Objetivo" descreve o que a CONSULTORIA vai fazer, NAO o mercado do cliente.
${company ? `A empresa analisada e: ${company}` : ''}
${companySite ? `Site da empresa: ${companySite}` : ''}
PASSOS OBRIGATORIOS antes de gerar a analise:
1. Identifique o mercado REAL da empresa a partir do nome e site (ex: AdTech, Saude, Varejo, Industria).
2. Identifique o SUB-NICHO especifico (ex: para uma AdTech, pode ser "atribuicao de midia offline TV/Radio" - muito diferente de "marketing digital"). Essa precisao define a qualidade do TAM/SAM/SOM.
3. Analise o TAM/SAM/SOM exclusivamente para esse sub-nicho especifico, com dados do mercado brasileiro.
4. Os concorrentes DEVEM ser empresas que competem diretamente naquele sub-nicho especifico (nao concorrentes genericos do setor amplo).
5. As tendencias devem ser especificas ao sub-nicho identificado.
NUNCA analise o mercado de RevOps, CRM, Consultoria de Vendas ou Marketing de Performance a menos que o site revele isso explicitamente.` 
        : '';

    return `Segmento auto-declarado (pode ser impreciso): ${segment} (Brasil)
Objetivo do projeto de consultoria (NAO e o negocio central do cliente): ${objective || 'crescimento'}
${competitorsBlock}${contextBlock}${siteBlock}${crmOpsInstruction}

Tarefa: Voce e o Analista de Inteligencia Competitiva da RevHackers. Entregue uma analise de mercado estilo McKinsey/Bain, PERSONALIZADA para o negocio real deste cliente.
INSTRUCOES CRITICAS DE LOCALIZACAO (BRASIL):
- OBRIGATORIO: Os concorrentes DEVEM SER EMPRESAS BRASILEIRAS REAIS. É estritamente proibido listar empresas estrangeiras (americanas, europeias, etc) a não ser que o cliente seja global. Foque no mercado local (Brasil).
- As tendencias devem ser relevantes ao SUB-NICHO ESPECIFICO identificado para o cliente dentro do mercado brasileiro.
- Os concorrentes devem competir naquele sub-nicho especifico no Brasil, não no setor amplo global.
- O SWOT deve refletir oportunidades e ameaças reais no cenário brasileiro.
- IDIOMA: Todo o conteudo DEVE estar em Portugues do Brasil correto, com acentuacao completa.
- NUNCA use o caractere em dash (travessao longo U+2014) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "tendencias_2025": [
    { "titulo": "Tendencia real e especifica do segmento", "impacto": "Alto/Medio/Baixo", "descricao": "Explicacao de 2-3 frases com dados e impacto no negocio do cliente." }
  ],
  "concorrentes_benchmark": [
    {
      "nome": "Nome Real do Concorrente",
      "url": "URL se conhecida",
      "pontos_fortes": "2-3 forcas especificas observaveis",
      "pontos_fracos": "2-3 fraquezas identificaveis",
      "diferencial": "O moat real deles",
      "posicionamento": "Como se posicionam e qual publico atendem"
    }
  ],
  "analise_swot_rapida": {
    "oportunidades": ["Oportunidade especifica baseada no contexto do cliente", "Oportunidade 2", "Oportunidade 3"],
    "ameacas": ["Ameaca real baseada na concorrencia", "Ameaca 2"]
  },
  "tam_sam_som": {
    "tam": "Mercado Total com valor estimado em reais",
    "sam": "Mercado Enderecavel com valor",
    "som": "Mercado Capturavel em 12-24 meses com estrategia RevHackers"
  }
}
Gere de 3 a 5 concorrentes reais e pelo menos 3 tendencias.`;
}

// ============================================================
// SYNTHESIS PROMPT: Bridge Deep Research -> Plan Content
// ============================================================

function getSynthesisPrompt(context: any, enrichedData: any, segment: string, objective?: string): string {
    const company = context?.companyName || context?.revops_empresa || context?.empresa || 'a empresa cliente';
    const companySite = context?.companySite || context?.revops_site || '';
    
    const market = enrichedData?.market || {};
    const benchmark = enrichedData?.benchmark || {};
    const personasData = enrichedData?.personas || {};
    const personas = Array.isArray(personasData?.personas) ? personasData.personas : [];

    const marketBlock = market ? `
MERCADO (TAM/SAM/SOM):
- TAM: ${market.tam_sam_som?.tam || 'N/A'}
- SAM: ${market.tam_sam_som?.sam || 'N/A'}
- SOM: ${market.tam_sam_som?.som || 'N/A'}
Oportunidades de mercado: ${(market.analise_swot_rapida?.oportunidades || []).join('; ')}
Amecas: ${(market.analise_swot_rapida?.ameacas || []).join('; ')}
Tendencias: ${(market.tendencias_2025 || []).map((t: any) => t.titulo || t).join('; ')}` : '';
    
    const benchmarkBlock = benchmark ? `
BENCHMARK DO SETOR:
- CAC medio do setor: ${benchmark.cac_medio || 'N/A'}
- Taxa de conversao do setor: ${benchmark.taxa_conversao || 'N/A'}
- Ciclo de vendas do setor: ${benchmark.ciclo_vendas || 'N/A'}
- LTV:CAC do setor: ${benchmark.ltv_cac_ratio || 'N/A'}
- Analise comparativa: ${benchmark.comparativo_mercado || 'N/A'}` : '';
    
    const personasBlock = personas.length > 0 ? `
PERSONAS E COMPRADORES IDENTIFICADOS:
${personas.slice(0, 3).map((p: any) => `- ${p.nome || ''} (${p.cargo || ''}): Dor principal: ${(p.dores_principais || [])[0] || ''}. Pitching: ${p.pitch_elevador || ''}`).join('\n')}` : '';

    return `Empresa: ${company}
Site: ${companySite}
Segmento Real (Identificado por IA): ${segment}
Objetivo da Consultoria: ${objective || 'crescimento'}
${marketBlock}
${benchmarkBlock}
${personasBlock}

Tarefa: Voce e o Head de Estrategia da RevHackers. Com base em TODA a inteligencia de mercado acima, reescreva o RESUMO EXECUTIVO e o DIAGNOSTICO do plano estrategico para esta empresa.
Este conteudo sera apresentado ao CEO/fundador da empresa. Use linguagem executiva, direta, especifica - NUNCA use boilerplate generico.

REGRAS CRITICAS:
1. Contexto: descreva a SITUACAO REAL da empresa no SEU MERCADO ESPECIFICO (nao diga "Empresa B2B generica" - diga quem eles sao de verdade)
2. Problema Central: identifique o problema ESTRATEGICO mais critico que a consultoria ira atacar baseado nos dados reais
3. Solucao Proposta: descreva o que a RevHackers vai entregar de especifico para ESTE cliente neste mercado
4. Resultado Esperado: use metricas ESPECIFICAS do benchmark do setor identificado
5. Sinais de Diagnostico: liste 3-5 sinais estrategicos de como a empresa esta posicionada vs o setor (use dados do benchmark)
6. IDIOMA: Portugues do Brasil correto com acentuacao completa
7. NUNCA use dash longo (U+2014) - use hifen simples

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "executive_summary": {
    "context": "2-3 frases descrevendo a empresa e seu contexto de mercado ESPECIFICO - quem sao, que mercado ocupam, que momento vivem",
    "problem": "1-2 frases sobre o problema estrategico central mais critico que a consultoria vai resolver - baseado em dados reais do diagnostico",
    "solution": "1-2 frases sobre o que a RevHackers vai entregar de especifico - nao generico, conectado ao contexto real desta empresa",
    "expected_outcome": "Metricas esperadas especificas baseadas no benchmark do setor (ex: CAC de Rx para Ry, ciclo de vendas de X para Y semanas, LTV:CAC atingindo Z:1)"
  },
  "diagnostic_signals": [
    {
      "signal": "Sinal diagnostico especifico (1 frase)",
      "severity": "high|medium|low",
      "recommendation": "Recomendacao acionavel especifica"
    }
  ],
  "strategic_opportunities": ["Oportunidade especifica 1 para esta empresa neste mercado", "Oportunidade 2", "Oportunidade 3"]
}
Gere EXATAMENTE o JSON acima. Nada mais.`;
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // ============================================================
    // AUTH GATE - JWT required
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Autorizacao necessaria.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // @ts-ignore
    const SUPABASE_URL_AUTH = Deno.env.get('SUPABASE_URL') ?? '';
    // @ts-ignore
    const SUPABASE_SERVICE_KEY_AUTH = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAuth = createClient(SUPABASE_URL_AUTH, SUPABASE_SERVICE_KEY_AUTH);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
        authHeader.replace('Bearer ', '').trim()
    );
    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Token invalido ou expirado.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    let jobId: string | undefined;

    try {
        const payload: ResearchRequest = await req.json();
        const { type, segment, competitors, objective, context, siteAnalysis, projectType, enrichedData } = payload;
        jobId = payload.jobId;

        if (!type || !segment) {
            throw new Error('Missing required fields: type, segment');
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`[research-intelligence] Deep ${type} research for: ${segment}, hasSite=${!!siteAnalysis}`);

        const systemPrompt = `Você é o Head de Pesquisa Estratégica da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Você tem 15+ anos de experiência em consultoria estratégica (McKinsey, Bain, BCG).
Sua especialidade é transformar diagnósticos brutos em inteligência de mercado acionável e real.
UTILIZE A FERRAMENTA DE BUSCA NA WEB PARA ANCORAR SEUS DADOS: Pesquise os concorrentes, TAM/SAM/SOM e traga números factuais, citando fontes reais do Brasil.
Cada análise que você produz é HIPER-PERSONALIZADA ao negócio real do cliente, nunca genérica.
Responda APENAS com JSON válido. Sem markdown, sem explicações extras.
NUNCA use o caractere em dash (U+2014) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).
REGRA ABSOLUTA DE IDIOMA: Todo o texto deve estar em Português do Brasil correto e completo.
JAMAIS omita acentuação. Palavras como "ação", "gestão", "operação", "automação", "análise", "técnico", "página", "você", "nível", "período", "após", "também", "além", "mídias", "único", "público", "é", "está", "são", "assim", "métricas", "tendência", "disponível", "critérios", "médio", "avaliação", "conversão", "atração", "geração", "criação", "definição", "aquisição" DEVEM ser escritas com acentos corretos.
Texto sem acentuação é um ERRO CRÍTICO INACEITÁVEL.`;

        let userPrompt: string;
        switch (type) {
            case 'benchmark':
                userPrompt = getBenchmarkPrompt(segment, objective, context, siteAnalysis, projectType);
                break;
            case 'personas':
                userPrompt = getPersonasPrompt(segment, objective, context, siteAnalysis, projectType);
                break;
            case 'market':
                userPrompt = getMarketPrompt(segment, competitors, objective, context, siteAnalysis, projectType);
                break;
            case 'synthesis':
                userPrompt = getSynthesisPrompt(context, enrichedData, segment, objective);
                break;
            default:
                throw new Error(`Invalid research type: ${type}`);
        }

        const result = await callOpenAI(apiKey, systemPrompt, userPrompt);

        // Add avatar URLs for personas
        if (type === 'personas' && result?.personas && Array.isArray(result.personas)) {
            result.personas = result.personas.map((persona: any) => {
                return {
                    ...persona,
                    foto_url: null // Dependência fragil do randomuser.me removida, o frontend deve usar iniciais
                };
            });
        }

        console.log(`[research-intelligence] Deep ${type} completed successfully`);

        if (jobId) {
            const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
            const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
                const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
                await supabaseClient
                    .from('ai_generation_jobs')
                    .update({
                        status: 'completed',
                        result_data: result,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', jobId);
            }
        }

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('[research-intelligence] Error:', error.message);
        
        if (jobId) {
            const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
            const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
                const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
                await supabaseClient
                    .from('ai_generation_jobs')
                    .update({
                        status: 'failed',
                        error_log: error.message,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', jobId);
            }
        }

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})
