// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

async function withAutoRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`[Auto-Retry] Falha na rede/OpenAI. Tentativa ${i + 1} de ${retries}. Aguardando ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error("Unreachable");
}

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://www.revhackers.com.br',
    'https://revhackers.com.br',
    'https://app.revhackers.com.br',
    'https://app.revhackers.com'
];

function getCorsHeaders(req: Request) {
    const origin = req.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

// ============================================================
// DIMENSION LABELS & PROMPT BUILDERS
// ============================================================

type DiagnosticType = 'growth' | 'revenue' | 'founder';

const DIMENSION_LABELS: Record<'growth' | 'revenue', string[]> = {
    growth: [
        "1. Gargalo Operacional (Varinha Mágica)",
        "2. Unit Economics e CAC Limitador",
        "3. Matriz de Canais de Tração e Risco",
        "4. Capacidade Estrutural de Escala",
        "5. Precisão de Segmentação e ICP"
    ],
    revenue: [
        "1. Adoção e Maturidade de CRM",
        "2. SLA de Tempo de Resposta a Leads",
        "3. Critérios Objetivos de Qualificação MQL/SQL",
        "4. SLA de Hand-off e Acordo Mkt/Vendas",
        "5. Desdobramento de Metas Agressivas"
    ]
};

const MAX_PER_QUESTION = 20;

function buildContextMap(type: 'growth' | 'revenue', answers: number[]): string[] {
    const labels = DIMENSION_LABELS[type] || DIMENSION_LABELS.growth;
    return answers.map((score, i) => {
        const pct = Math.round((score / MAX_PER_QUESTION) * 100);
        const level = pct >= 80 ? "Excelente" : pct >= 50 ? "Mediano" : pct > 0 ? "Fraco" : "Inexistente";
        return `${labels[i] || `Dimensão ${i + 1}`}: ${score}/${MAX_PER_QUESTION} (${level})`;
    });
}

function getGrowthRevenuePrompt(type: 'growth' | 'revenue', contextMap: string[], totalScore: number): string {
    const typeLabel = type === 'growth' ? 'Growth (Crescimento)' : 'Revenue (Receita)';
    const typeContext = type === 'growth'
        ? 'Analise a maturidade de crescimento desta empresa. Considere aquisição de clientes, CAC, processo de vendas, retenção/LTV e metas de marketing.'
        : 'Analise a maturidade de receita desta empresa. Considere previsibilidade de receita, estrutura comercial, conversão, uso de CRM e ciclo de vendas.';

    return `
Você é um consultor sênior de ${typeLabel} da RevHackers, uma consultoria de crescimento para empresas B2B.

${typeContext}

Dados do diagnóstico:
${contextMap.join('\n')}
Score Total: ${totalScore}/100.

Com base EXCLUSIVAMENTE nos dados acima, gere uma análise personalizada em JSON com:
- archetype: Uma palavra ou frase curta que define o perfil operacional (ex: "Máquina de Vendas", "Operação Manual", "Tração Passiva", "Motor de Receita", "Pipeline Fantasma", "Funil Invertido")
- headline: 2-3 frases de diagnóstico executivo, direto e incisivo. Referencie os dados específicos.
- strengths: Exatamente 3 pontos fortes baseados nas dimensões com score alto. Cada item com 1-2 frases específicas.
- gaps: Exatamente 3 gaps críticos baseados nas dimensões com score baixo. Cada item com 1-2 frases específicas, mencionando o impacto no negócio.
- immediateAction: 1 ação concreta e específica que a empresa deve executar nos próximos 14 dias. Seja prescritivo, não genérico.

REGRAS:
- Seja direto, técnico e baseado nos dados. Nada genérico.
- Se uma dimensão tem score 0, isso é um GAP CRÍTICO - destaque com urgência.
- Se uma dimensão tem score 20/20, é um SUPERPODER - reconheça.
    `.trim();
}

const FOUNDER_ARCHETYPES = ['Executor', 'Visionario', 'Tecnico', 'Relacionamento', 'Analitico'] as const;

function getFounderPrompt(linkedinUrl: string, answers: number[], quizScore: number): string {
    const quizContext = [
        "Atuacao Executiva vs Operacional (Alavancagem): " + (answers[0] >= 20 ? "Frente Estrategica Dominante" : answers[0] >= 15 ? "Gerencia Ativa" : "Viciado na Operacao"),
        "Maquina de Influencia e Exposicao Nominal: " + (answers[1] >= 20 ? "Alto Nivel" : answers[1] >= 15 ? "Mediano" : "Basico/Nulo"),
        "Resolucao de Autoridade (Pipeline vs Ego digital): " + (answers[2] >= 20 ? "Construtor de Pipeline" : answers[2] >= 15 ? "Influenciador Vazio" : "Sem Relevancia"),
        "Fosso Competitivo vs Commodity de Mercado: " + (answers[3] >= 20 ? "Metodologia Proprietaria Forte" : answers[3] >= 15 ? "Diferenciacao Media" : "Vendido como Commodity")
    ];

    return `
Voce e um investidor de Venture Capital acido e direto da RevHackers. Analise este fundador com base nos dados abaixo.

Dados Comportamentais (Quiz):
${quizContext.join('\n')}
Score Total do Quiz: ${quizScore}/100.

IMPORTANTE: Voce TEM a capacidade de buscar dados atualizados na internet.
BUSQUE EXATAMENTE o perfil LinkedIn: "${linkedinUrl}".
Baseado no que voce encontrar sobre o cargo, experiencia, headline, conteudo abordado e nome real desse fundador (combine com o quiz), gere a analise. Se o link for invalido ou inacessivel, faca a analise apenas com base no quiz mas avise discretamente na analise.

Os 5 arquetipos disponiveis sao EXATAMENTE: ${FOUNDER_ARCHETYPES.join(', ')}.
  Executor: resultados, metricas, eficiencia operacional.
  Visionario: futuro, tendencias, transformacao, inovacao.
  Tecnico: produto, tecnologia, metodologia, frameworks.
  Relacionamento: pessoas, cultura, networking, parcerias.
  Analitico: dados, pesquisa, estrategia, benchmarks.

Gere um JSON com:
- archetype: um dos 5 arquetipos listados
- headline: Uma frase de impacto definindo ele (ex: "O genio invisivel" ou "Vendedor de fumaca")
- analysis: Um paragrafo de 3 linhas analisando brutalmente a presenca digital e posicionamento dele. Incorpore os dados reais (nome/headline) se encontrados.
- strengths: 2 pontos fortes curtos.
- blindSpots: 2 pontos cegos criticos que estao custando dinheiro.
- brandingGaps: 2 gaps de posicionamento digital que precisam ser corrigidos.
- actionableInsight: 1 conselho pratico e direto em 1-2 frases para implementar amanha.
- linkedinData: Retorne um objeto com os dados reias encontrados (fullName, headline). Caso contrário, null.

REGRAS:
- Seja direto, tecnico e baseado nos dados. Nada generico.
- Nunca use travessao longo. Use hifen simples (-).
    `.trim();
}

// ============================================================
// OPENAI API CALL (GPT-4o-mini - same pattern as generate-strategic-plan)
// ============================================================

async function callOpenAI(apiKey: string, prompt: string, useWebSearch: boolean = false): Promise<any> {
    const payload: any = {
        model: 'gpt-5.4-mini',
        messages: [
            {
                role: 'system',
                content: 'Você é um Analista Sênior da RevHackers. Suas análises são brutais, diretas e baseadas puramente nos dados fornecidos. Aja como um cirurgião de negócios. Siga o Schema JSON estritamente. Nunca use travessao (—), use hifen simples (-).'
            },
            { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
    };

    if (useWebSearch) {
        payload.tools = [{ type: 'web_search' }];
    }

    const response = await withAutoRetry(() => fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }));

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

    try {
        return JSON.parse(cleanContent);
    } catch {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('GPT Structured Output falhou na validação de JSON');
    }
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const origin = req.headers.get('Origin') || '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        console.warn(`[Shield] Rejected request from invalid origin: ${origin}`);
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: corsHeaders });
    }

    try {
        const clone = await req.clone();
        const textPayload = await clone.text();
        if (textPayload.length > 50000) {
            console.warn(`[Shield] Payload too large: ${textPayload.length} bytes`);
            return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: corsHeaders });
        }

        const { type, answers, totalScore, linkedinUrl } = JSON.parse(textPayload);

        if (!type || !answers || totalScore === undefined) {
            throw new Error('Missing required fields: type, answers, totalScore');
        }

        // Input sanitization
        if (!Array.isArray(answers) || answers.length > 100) {
            throw new Error('Invalid answers format');
        }
        const safeLinkedinUrl = linkedinUrl ? String(linkedinUrl).replace(/[`${}]/g, '').substring(0, 500) : '';
        const safeType = String(type).replace(/[^a-z_]/g, '');

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`[analyze-diagnostic] Processing ${type} analysis, score: ${totalScore}`);

        let prompt: string;
        let result: any;

        if (safeType === 'founder') {
            // FOUNDER PATH - Native Web Search
            prompt = getFounderPrompt(safeLinkedinUrl, answers, totalScore);
            const parsed = await callOpenAI(apiKey, prompt, true);

            // Validate archetype against allowed list
            const resolvedArchetype = FOUNDER_ARCHETYPES.includes(parsed.archetype)
                ? parsed.archetype
                : 'Executor';

            // Return expanded result with LinkedIn data when available
            result = {
                archetype: resolvedArchetype,
                score: totalScore,
                headline: parsed.headline || '',
                analysis: parsed.analysis || '',
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 2) : [],
                blindSpots: Array.isArray(parsed.blindSpots) ? parsed.blindSpots.slice(0, 2) : [],
                brandingGaps: Array.isArray(parsed.brandingGaps) ? parsed.brandingGaps.slice(0, 2) : [],
                actionableInsight: String(parsed.actionableInsight || '').substring(0, 400),
                linkedinData: parsed.linkedinData || null,
            };
        } else {
            // GROWTH / REVENUE PATH
            const diagnosticType = type as 'growth' | 'revenue';
            const contextMap = buildContextMap(diagnosticType, answers);
            prompt = getGrowthRevenuePrompt(diagnosticType, contextMap, totalScore);
            const parsed = await callOpenAI(apiKey, prompt);

            // Validate required fields
            if (!parsed.archetype || !parsed.headline || !parsed.strengths || !parsed.gaps || !parsed.immediateAction) {
                throw new Error('Incomplete AI response');
            }

            result = {
                archetype: parsed.archetype,
                headline: parsed.headline,
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
                gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 3) : [],
                immediateAction: parsed.immediateAction
            };
        }

        console.log(`[analyze-diagnostic] Success: ${type} → archetype: ${result.archetype}`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`[analyze-diagnostic] Error:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
