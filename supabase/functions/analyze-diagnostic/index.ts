import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================
// DIMENSION LABELS & PROMPT BUILDERS
// ============================================================

type DiagnosticType = 'growth' | 'revenue' | 'founder';

const DIMENSION_LABELS: Record<'growth' | 'revenue', string[]> = {
    growth: [
        "Estratégia de Aquisição",
        "CAC (Custo de Aquisição)",
        "Processo de Vendas",
        "Retenção / LTV",
        "Metas de Receita do Time",
        "Conteúdo / Inbound",
        "Data Analytics"
    ],
    revenue: [
        "Previsibilidade de Receita",
        "Estrutura Comercial",
        "Taxa de Conversão",
        "CRM e Tecnologia",
        "Ciclo de Vendas",
        "CS / Retenção",
        "Expansion Revenue"
    ]
};

const MAX_PER_QUESTION = 16;

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
- Se uma dimensão tem score 0, isso é um GAP CRÍTICO — destaque com urgência.
- Se uma dimensão tem score 20/20, é um SUPERPODER — reconheça.
- Responda APENAS O JSON, sem markdown, sem explicações extras.
    `.trim();
}

function getFounderPrompt(linkedinUrl: string, answers: number[], quizScore: number): string {
    const contextMap = [
        "Perfil LinkedIn: " + (answers[0] >= 15 ? "Otimizado" : answers[0] >= 5 ? "Parcial" : "Básico"),
        "Frequência de Postagem: " + (answers[1] > 10 ? "Alta" : "Baixa"),
        "Material Rico: " + (answers[2] > 10 ? "Sim" : "Não"),
        "Geração de Leads: " + (answers[3] > 10 ? "Alta" : "Baixa"),
        "Autoridade Percebida: " + (answers[4] > 10 ? "Alta" : "Baixa")
    ];

    return `
Analise o perfil deste fundador com base nesses dados comportamentais (simule uma análise profunda do LinkedIn dele: ${linkedinUrl}):

Dados:
${contextMap.join('\n')}
Score Total do Quiz: ${quizScore}/100.

Aja como um investidor de Venture Capital ácido e direto.
Gere um JSON com:
- archetype: "Visionário" | "Vendedor" | "Técnico"
- headline: Uma frase de impacto definindo ele (ex: "O gênio invisível" ou "Vendedor de fumaça").
- analysis: Um parágrafo de 3 linhas analisando brutalmente a presença digital dele.
- strengths: 2 pontos fortes curtos.
- blindSpots: 2 pontos cegos críticos que estão custando dinheiro.

Responda APENAS O JSON.
    `.trim();
}

// ============================================================
// OPENAI API CALL (GPT-4o-mini — same pattern as generate-strategic-plan)
// ============================================================

async function callOpenAI(apiKey: string, prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um Parser Estrito. Responda APENAS com um objeto JSON válido. Não inclua blocos ```json no início ou no fim. Não adicione explicações.'
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
    } catch {
        console.error('Failed to parse OpenAI response:', cleanContent.substring(0, 200));
        throw new Error('Failed to parse AI response as JSON');
    }
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { type, answers, totalScore, linkedinUrl } = await req.json();

        if (!type || !answers || totalScore === undefined) {
            throw new Error('Missing required fields: type, answers, totalScore');
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`[analyze-diagnostic] Processing ${type} analysis, score: ${totalScore}`);

        let prompt: string;
        let result: any;

        if (type === 'founder') {
            // FOUNDER PATH
            prompt = getFounderPrompt(linkedinUrl || '', answers, totalScore);
            const parsed = await callOpenAI(apiKey, prompt);

            // Validate and return only expected fields (no unsafe spread)
            result = {
                archetype: parsed.archetype || 'Técnico',
                score: totalScore,
                headline: parsed.headline || '',
                analysis: parsed.analysis || '',
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 2) : [],
                blindSpots: Array.isArray(parsed.blindSpots) ? parsed.blindSpots.slice(0, 2) : []
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
