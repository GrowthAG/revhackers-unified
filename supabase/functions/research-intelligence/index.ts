import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
    type: 'benchmark' | 'personas' | 'market';
    segment: string;
    competitors?: { nome: string, url?: string }[];
    objective?: string;
    context?: any;
    siteAnalysis?: any;
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

function getBenchmarkPrompt(segment: string, objective?: string, context?: any, siteAnalysis?: any): string {
    const siteBlock = buildSiteBlock(siteAnalysis);
    const contextBlock = context ? `\nDados do diagnostico do cliente: \n${buildClientContext(context, segment, objective)}` : '';

    return `Segmento: ${segment}
Objetivo: ${objective || 'crescimento'}
${contextBlock}${siteBlock}

Tarefa: Voce e o Head de Inteligencia de Mercado da RevHackers. Gere um BENCHMARK PROFUNDO e PERSONALIZADO para o segmento deste cliente no Brasil.
INSTRUCOES CRITICAS:
- Se os dados do diagnostico ou site revelam CRM atual, ticket medio ou taxa de conversao, USE para comparar com o mercado.
- Cite empresas REAIS do segmento. Nao use genericos.
- O comparativo deve ser uma analise estrategica de 3-4 frases que ajude o cliente a se posicionar.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "cac_medio": "Valor monetario com contexto (ex: R$ 350,00 - acima da media do segmento por X motivo)",
  "taxa_conversao": "Porcentagem com benchmark (ex: 2.8% - media do segmento e 3.2%)",
  "ciclo_vendas": "Tempo com contexto (ex: 45 dias - empresas lideres fazem em 30)",
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

function getPersonasPrompt(segment: string, objective?: string, context?: any, siteAnalysis?: any): string {
    const siteBlock = buildSiteBlock(siteAnalysis);
    const contextBlock = context ? `\nDados do diagnostico do cliente: \n${buildClientContext(context, segment, objective)}` : '';

    return `Segmento: ${segment}
Objetivo: ${objective || 'crescimento'}
${contextBlock}${siteBlock}

Tarefa: Voce e o Estrategista de ICP da RevHackers. Crie 3 BUYER PERSONAS ultra-detalhadas que representem os compradores REAIS dos produtos e servicos DESTE cliente.
ATENCAO: Nao confunda o projeto/servico que a RevHackers esta prestando (ex: crm_ops, consultoria) com o que o cliente vende. As personas devem ser os clientes DO cliente, baseadas firmemente na Analise do Site e no Segmento.

INSTRUCOES CRITICAS DE PERSONALIZACAO:
- Se o site do cliente vende produtos/servicos especificos, as personas DEVEM ser compradores IGUAIS aos que compram esses produtos.
- Se o publico-alvo foi identificado, as personas DEVEM estar nesse publico.
- Cada persona deve ser PSICOLOGICAMENTE distinta: um decisor (C-level), um influenciador tecnico, um usuario final.
- Nomes brasileiros realistas. Bios com carreiras brasileiras.
- O pitch_elevador deve ser uma frase que o vendedor do cliente usaria LITERALMENTE.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "personas": [
    {
      "nome": "Nome Sobrenome brasileiro realista",
      "cargo": "Cargo real do mercado brasileiro",
      "idade": "Ex: 38-45 anos",
      "genero": "M ou F",
      "bio_curta": "2-3 frases sobre trajetoria, tipo de empresa onde trabalha e momento de carreira. Conecte ao segmento.",
      "empresa_tipo": "Tipo de empresa realista (ex: SaaS B2B com 50-200 funcionarios)",
      "dores_principais": ["Dor conectada ao produto/servico do cliente", "Dor do cargo", "Dor do mercado"],
      "ganhos_desejados": ["Ganho pessoal que o produto resolve", "Ganho profissional mensuravel"],
      "objecoes_compra": ["Objecao real ao avaliar este tipo de solucao", "Objecao financeira", "Objecao politica interna"],
      "gatilhos_mentais": ["Gatilho que funciona para este perfil (ex: Autoridade)", "Segundo gatilho"],
      "canais_favoritos": ["Canal real onde consome conteudo", "Canal 2", "Canal 3"],
      "pitch_elevador": "Frase consultiva e direta que o vendedor usaria para este perfil"
    }
  ]
}
Gere EXATAMENTE 3 personas com TODOS os campos preenchidos.`;
}

function getMarketPrompt(segment: string, competitors?: { nome: string, url?: string }[], objective?: string, context?: any, siteAnalysis?: any): string {
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

    return `Segmento: ${segment} (Brasil)
Objetivo: ${objective || 'crescimento'}
${competitorsBlock}${contextBlock}${siteBlock}

Tarefa: Voce e o Analista de Inteligencia Competitiva da RevHackers. Entregue uma analise de mercado estilo McKinsey/Bain, PERSONALIZADA para o negocio real deste cliente.
INSTRUCOES CRITICAS:
- As tendencias devem ser relevantes ao segmento ESPECIFICO do cliente.
- Os concorrentes devem ser empresas REAIS que competem no mesmo espaco.
- O SWOT deve refletir oportunidades e ameacas para ESTE cliente, baseado nos dados fornecidos.
- Se o site revelou pontos fracos ou diferenciais, use para contextualizar o SWOT.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

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
// MAIN HANDLER
// ============================================================

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, segment, competitors, objective, context, siteAnalysis }: ResearchRequest = await req.json();

        if (!type || !segment) {
            throw new Error('Missing required fields: type, segment');
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`[research-intelligence] Deep ${type} research for: ${segment}, hasSite=${!!siteAnalysis}`);

        const systemPrompt = `Voce e o Head de Pesquisa Estrategica da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Voce tem 15+ anos de experiencia em consultoria estrategica (McKinsey, Bain, BCG).
Sua especialidade e transformar diagnosticos brutos em inteligencia de mercado acionavel.
Cada analise que voce produz e HIPER-PERSONALIZADA ao negocio real do cliente, nunca generica.
Responda APENAS com JSON valido. Sem markdown, sem explicacoes extras.
NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).`;

        let userPrompt: string;
        switch (type) {
            case 'benchmark':
                userPrompt = getBenchmarkPrompt(segment, objective, context, siteAnalysis);
                break;
            case 'personas':
                userPrompt = getPersonasPrompt(segment, objective, context, siteAnalysis);
                break;
            case 'market':
                userPrompt = getMarketPrompt(segment, competitors, objective, context, siteAnalysis);
                break;
            default:
                throw new Error(`Invalid research type: ${type}`);
        }

        const result = await callOpenAI(apiKey, systemPrompt, userPrompt);

        // Add avatar URLs for personas
        if (type === 'personas' && result?.personas && Array.isArray(result.personas)) {
            result.personas = result.personas.map((persona: any) => {
                const gender = persona.genero?.toLowerCase().startsWith('f') ? 'women' : 'men';
                const avatarId = Math.floor(Math.random() * 75) + 1;
                return {
                    ...persona,
                    foto_url: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`
                };
            });
        }

        console.log(`[research-intelligence] Deep ${type} completed successfully`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('[research-intelligence] Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})
