import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EnrichmentType = 'benchmark' | 'personas' | 'market' | 'all';

interface EnrichmentRequest {
    segment: string;
    ticket?: string;
    objective?: string;
    isB2B?: boolean;
    enrichmentType: EnrichmentType;
    rei_responses?: any;
    competitors?: { nome: string, url?: string }[];
    siteAnalysis?: any;
    projectType?: string;
}

// Build structured client context from REI responses + site analysis
function buildClientContext(rei: any, siteAnalysis: any, segment: string, objective?: string, projectType?: string): string {
    if (!rei && !siteAnalysis) return '';

    const lines: string[] = [];
    lines.push('<CONTEXTO_REAL_DO_CLIENTE>');

    // Company identification
    const company = rei?.companyName || rei?.revops_empresa || rei?.nome_empresa || rei?.empresa || '';
    const site = rei?.companySite || rei?.revops_site || rei?.site || '';
    if (company) lines.push(`Empresa: ${company}`);
    if (site) lines.push(`Site: ${site}`);
    lines.push(`Segmento: ${segment}`);
    if (objective) lines.push(`Objetivo Principal: ${objective}`);
    if (projectType) lines.push(`Tipo de Projeto: ${projectType}`);

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

    // Site analysis data
    if (siteAnalysis && typeof siteAnalysis === 'object') {
        lines.push('');
        lines.push('--- Analise do Site do Cliente ---');
        if (siteAnalysis.resumo_proposta) lines.push(`Proposta de valor: ${siteAnalysis.resumo_proposta}`);
        if (siteAnalysis.publico_alvo) lines.push(`Publico-alvo identificado: ${siteAnalysis.publico_alvo}`);
        if (siteAnalysis.produtos_servicos) {
            const prods = Array.isArray(siteAnalysis.produtos_servicos) ? siteAnalysis.produtos_servicos.join(', ') : siteAnalysis.produtos_servicos;
            lines.push(`Produtos/Servicos: ${prods}`);
        }
        if (siteAnalysis.diferenciais) lines.push(`Diferenciais: ${siteAnalysis.diferenciais}`);
        if (siteAnalysis.maturidade_digital) lines.push(`Maturidade digital: ${siteAnalysis.maturidade_digital}`);
        if (siteAnalysis.tom_comunicacao) lines.push(`Tom de comunicacao: ${siteAnalysis.tom_comunicacao}`);
        if (siteAnalysis.pontos_fracos_site) {
            const fraq = Array.isArray(siteAnalysis.pontos_fracos_site) ? siteAnalysis.pontos_fracos_site.join(', ') : siteAnalysis.pontos_fracos_site;
            lines.push(`Pontos fracos do site: ${fraq}`);
        }
        if (siteAnalysis.oportunidades_estrategicas) {
            const oport = Array.isArray(siteAnalysis.oportunidades_estrategicas) ? siteAnalysis.oportunidades_estrategicas.join(', ') : siteAnalysis.oportunidades_estrategicas;
            lines.push(`Oportunidades estrategicas: ${oport}`);
        }
    }

    lines.push('</CONTEXTO_REAL_DO_CLIENTE>');
    return lines.join('\n');
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { segment, ticket, objective, isB2B, enrichmentType, rei_responses, competitors, siteAnalysis, projectType }: EnrichmentRequest = await req.json();

        if (!segment) {
            throw new Error('Segment is required');
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

        if (!OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set, returning empty enrichment');
            return new Response(JSON.stringify({
                error: 'API not configured',
                benchmark: null,
                personas: null,
                market: null
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const results: any = {};

        // Build structured client context instead of raw JSON dump
        const clientContext = buildClientContext(rei_responses, siteAnalysis, segment, objective, projectType);

        // Execute requested enrichments
        if (enrichmentType === 'all' || enrichmentType === 'benchmark') {
            results.benchmark = await enrichBenchmark(OPENAI_API_KEY, segment, ticket, isB2B, clientContext);
        }

        if (enrichmentType === 'all' || enrichmentType === 'personas') {
            results.personas = await enrichPersonas(OPENAI_API_KEY, segment, ticket, objective, clientContext);
        }

        if (enrichmentType === 'all' || enrichmentType === 'market') {
            results.market = await enrichMarket(OPENAI_API_KEY, segment, clientContext, competitors);
        }

        console.log('Strategic enrichment completed for segment:', segment);

        return new Response(JSON.stringify({ result: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('enrich-strategic-data error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

// ============================================================
// OPENAI API CALL (GPT-4o-mini - replaces Perplexity sonar-reasoning-pro)
// ============================================================

async function callOpenAI(apiKey: string, prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-5.4',
            messages: [
                {
                    role: 'system',
                    content: 'Voce e o Diretor de Inteligencia Estrategica da RevHackers, a principal consultoria de RevOps e Growth do Brasil. Voce analisa mercados, constroi ICPs e gera benchmarks com precisao cirurgica. Seus dados sao SEMPRE baseados no mercado brasileiro real, com empresas e numeros realistas. Voce NUNCA gera conteudo generico - cada resposta e hiper-personalizada ao contexto do cliente. A resposta DEVE ser APENAS um JSON valido. Nao inclua blocos ```json nem explicacoes extras. NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
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
    } catch (parseError) {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('Invalid JSON response from OpenAI');
    }
}

async function enrichBenchmark(apiKey: string, segment: string, ticket?: string, isB2B?: boolean, context?: string): Promise<any> {
    const prompt = `Voce e o Head de Inteligencia de Mercado da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Sua missao e gerar benchmarks CIRURGICOS e REALISTAS para o cliente abaixo, comparando com o mercado brasileiro REAL.

${context || ''}

Segmento de Atuacao: ${segment}
${ticket ? `Ticket Medio informado pelo cliente: ${ticket}` : ''}
Modelo de Negocio: ${isB2B ? 'B2B (Business to Business)' : 'B2C (Business to Consumer)'}

INSTRUCOES CRITICAS:
- Se o cliente informou ticket medio, CRM atual ou taxa de conversao, USE esses dados para contextualizar.
- Compare os numeros do cliente com os benchmarks do segmento - aponte onde ele esta acima ou abaixo do mercado.
- As ferramentas sugeridas devem considerar as que o cliente JA usa (se informadas) e propor evolucoes realistas.
- O comparativo de mercado deve citar concorrentes reais do segmento no Brasil.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "cac_medio": "Valor monetario estimado para o segmento (ex: R$ 250,00)",
  "taxa_conversao": "Porcentagem media Lead -> Cliente do segmento (ex: 2.5%)",
  "ciclo_vendas": "Tempo medio do segmento (ex: 45 dias)",
  "ltv_cac_ratio": "Ratio ideal para o segmento (ex: 4:1)",
  "ferramentas_principais": {
    "crm": ["Ferramenta real 1", "Ferramenta real 2"],
    "automacao": ["Ferramenta real 1", "Ferramenta real 2"],
    "ads": ["Canal mais eficiente 1", "Canal 2"]
  },
  "comparativo_mercado": "Analise de 2-3 frases comparando o cenario competitivo do segmento. Cite empresas reais e tendencias. Aponte onde o cliente pode se diferenciar."
}`;

    try {
        return await callOpenAI(apiKey, prompt);
    } catch (error) {
        console.error('Benchmark enrichment failed:', error);
        return null;
    }
}

async function enrichPersonas(apiKey: string, segment: string, ticket?: string, objective?: string, context?: string): Promise<any> {
    const prompt = `Voce e o Estrategista de ICP (Ideal Customer Profile) da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Sua missao e criar 3 Buyer Personas ULTRA-REALISTAS que representem os compradores REAIS dos produtos e servicos DESTE cliente.

ATENCAO: Nao confunda o projeto/servico que a RevHackers esta prestando (ex: crm_ops, consultoria) com o que o cliente vende. As personas devem ser os clientes DO cliente, baseadas firmemente na Analise do Site e no Segmento informados abaixo.

${context || ''}

Segmento: ${segment}
${ticket ? `Ticket Medio: ${ticket}` : ''}
${objective ? `Objetivo Estrategico: ${objective}` : ''}

INSTRUCOES CRITICAS DE PERSONALIZACAO:
- Se o contexto menciona produtos/servicos especificos, as personas DEVEM ser compradores IGUAIS aos que compram esses produtos.
- Se o contexto menciona publico-alvo, as personas DEVEM estar nesse publico.
- Se o contexto menciona tom de comunicacao ou segmento, as dores e gatilhos devem refletir isso.
- Cada persona deve ser PSICOLOGICAMENTE distinta: um decisor (C-level), um influenciador tecnico, um usuario final.
- Nomes brasileiros realistas. Bios que refletem carreiras brasileiras.
- O pitch_elevador deve ser uma frase que a equipe comercial do cliente poderia usar LITERALMENTE.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "personas": [
    {
      "nome": "Nome Sobrenome (brasileiro realista)",
      "cargo": "Cargo real no mercado brasileiro",
      "idade": "Ex: 35-45 anos",
      "genero": "M ou F",
      "bio_curta": "2-3 frases sobre trajetoria, empresa onde trabalha (tipo realista) e momento de carreira. Conecte ao segmento do cliente.",
      "dores_principais": ["Dor profunda 1 conectada ao produto/servico do cliente", "Dor 2 especifica do cargo", "Dor 3 do mercado"],
      "ganhos_desejados": ["Ganho pessoal que o produto/servico resolve", "Ganho profissional mensuravel"],
      "objecoes_compra": ["Objecao real que este perfil teria ao avaliar o cliente", "Objecao financeira ou politica"],
      "gatilhos_mentais": ["Gatilho que mais funciona para este perfil (ex: Autoridade, Prova Social, Urgencia)", "Segundo gatilho"],
      "canais_favoritos": ["Canal real onde este perfil consome conteudo", "Segundo canal", "Terceiro canal"],
      "pitch_elevador": "Uma frase direta, consultiva e de alto impacto que o vendedor do cliente usaria para este perfil."
    }
  ]
}
Gere EXATAMENTE 3 personas com TODOS os campos preenchidos.`;

    try {
        const result = await callOpenAI(apiKey, prompt);

        // Add robust avatar URLs
        if (result?.personas && Array.isArray(result.personas)) {
            result.personas = result.personas.map((persona: any) => {
                const gender = persona.genero?.toLowerCase().startsWith('f') ? 'women' : 'men';
                const avatarId = Math.floor(Math.random() * 75) + 1;
                return {
                    ...persona,
                    foto_url: `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`
                };
            });
        }

        return result;
    } catch (error) {
        console.error('Personas enrichment failed:', error);
        return null;
    }
}

async function enrichMarket(apiKey: string, segment: string, context?: string, competitors?: { nome: string, url?: string }[]): Promise<any> {

    let competitorsContext = '';
    if (competitors && competitors.length > 0) {
        competitorsContext = `
CONCORRENTES INFORMADOS PELO CLIENTE (ANALISE COM PRIORIDADE TOTAL):
${competitors.map(c => `- ${c.nome}${c.url ? ' (' + c.url + ')' : ''}`).join('\n')}

Voce DEVE analisar especificamente estes concorrentes acima com dados reais.
Se houver menos de 3 citados, complemente com outros players REAIS e RELEVANTES do segmento no Brasil.
`;
    }

    const prompt = `Voce e o Analista de Inteligencia Competitiva da RevHackers, a principal consultoria de RevOps e Growth do Brasil.
Sua missao e entregar uma analise de mercado estilo McKinsey/Bain, mas PERSONALIZADA para o negocio REAL deste cliente.

${context || ''}

Mercado Alvo: ${segment} (Brasil)
${competitorsContext}

INSTRUCOES CRITICAS DE PERSONALIZACAO:
- As tendencias devem ser relevantes ao segmento ESPECIFICO do cliente, nao tendencias genericas de "B2B".
- Os concorrentes devem ser empresas REAIS que competem no mesmo espaco que o cliente.
- O SWOT deve refletir as oportunidades e ameacas para ESTE cliente especificamente, baseado nos pontos fracos/fortes identificados.
- O TAM/SAM/SOM deve usar dados realistas do mercado brasileiro para este segmento.
- Se a analise do site revelou pontos fracos ou diferenciais, use isso para contextualizar as oportunidades.
- NUNCA use o caractere em dash (travessao longo) - use apenas hifen simples (-), dois pontos (:) ou ponto (.).

Retorne um JSON EXATAMENTE com esta estrutura:
{
  "tendencias_2025": [
    { "titulo": "Tendencia real e especifica do segmento", "impacto": "Alto/Medio/Baixo", "descricao": "Explicacao de 2-3 frases com dados concretos e impacto no negocio do cliente." }
  ],
  "concorrentes_benchmark": [
    {
      "nome": "Nome Real do Concorrente",
      "url": "URL se conhecida",
      "pontos_fortes": "2-3 forcas especificas observaveis",
      "pontos_fracos": "2-3 fraquezas identificaveis",
      "diferencial": "O moat real deles - o que os torna dificeis de copiar",
      "posicionamento": "Como se posicionam no mercado e qual publico atendem"
    }
  ],
  "analise_swot_rapida": {
    "oportunidades": ["Oportunidade especifica para o cliente baseada no contexto", "Oportunidade 2 com base no mercado", "Oportunidade 3"],
    "ameacas": ["Ameaca real baseada na concorrencia identificada", "Ameaca 2 de mercado"]
  },
  "tam_sam_som": {
    "tam": "Mercado Total com valor estimado em reais para o segmento no Brasil",
    "sam": "Mercado Enderecavel com valor - o que o cliente poderia atingir",
    "som": "Mercado Capturavel em 12-24 meses com a estrategia RevHackers"
  }
}
Gere de 3 a 5 concorrentes reais e pelo menos 3 tendencias.`;

    try {
        return await callOpenAI(apiKey, prompt);
    } catch (error) {
        console.error('Market enrichment failed:', error);
        return null;
    }
}
