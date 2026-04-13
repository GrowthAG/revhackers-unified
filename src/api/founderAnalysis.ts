import { supabase } from '@/integrations/supabase/client';

export interface FounderAnalysisResult {
    archetype: string;
    score: number;
    headline: string;
    analysis: string;
    strengths: string[];
    blindSpots: string[];
    brandingGaps?: string[];
    actionableInsight?: string;
    linkedinData?: {
        fullName?: string;
        headline?: string;
        followerCount?: number;
        authorityScore?: number;
    };
}

export async function analyzeFounderProfileAI(
    linkedinUrl: string,
    answers: number[],
    quizScore: number
): Promise<FounderAnalysisResult> {
    try {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 30000)
        );

        const invoke = supabase.functions.invoke('analyze-diagnostic', {
            body: { type: 'founder', answers, totalScore: quizScore, linkedinUrl }
        });

        const { data, error } = await Promise.race([invoke, timeout]);

        if (error) throw error;

        // Validate and return only expected fields (no unsafe ...parsed spread)
        return {
            archetype: data.archetype || 'Executor',
            score: quizScore,
            headline: data.headline || '',
            analysis: data.analysis || '',
            strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 2) : [],
            blindSpots: Array.isArray(data.blindSpots) ? data.blindSpots.slice(0, 2) : [],
            brandingGaps: Array.isArray(data.brandingGaps) ? data.brandingGaps.slice(0, 2) : [],
            actionableInsight: data.actionableInsight || '',
            linkedinData: data.linkedinData || undefined,
        };
    } catch (error) {
        console.error("Erro founder analysis:", error);
        return getMockAnalysis(quizScore);
    }
}

function getMockAnalysis(score: number): FounderAnalysisResult {
    if (score > 80) return {
        archetype: "Visionario",
        score,
        headline: "O Lider de Mercado",
        analysis: "Sua presenca impoe respeito, mas cuidado para nao se distanciar da realidade operacional.",
        strengths: ["Autoridade Clara", "Visao de Futuro"],
        blindSpots: ["Distancia do Cliente", "Excesso de Abstracao"],
        brandingGaps: ["Falta de conteudo tecnico", "Audiencia nao qualificada"],
        actionableInsight: "Publique um caso de estudo real com metricas concretas esta semana.",
    };
    if (score > 50) return {
        archetype: "Relacionamento",
        score,
        headline: "O Conector Estrategico",
        analysis: "Voce gera movimento e networking, mas falta profundidade tecnica para sustentar LTV longo.",
        strengths: ["Energia Alta", "Rede de Contatos"],
        blindSpots: ["Churn Alto", "Conteudo Raso"],
        brandingGaps: ["Perfil sem tese clara", "Posts sem CTA de conversao"],
        actionableInsight: "Defina sua tese proprietaria em 1 frase e a adicione ao headline do LinkedIn.",
    };
    return {
        archetype: "Tecnico",
        score,
        headline: "O Especialista Oculto",
        analysis: "Voce e brilhante tecnicamente, mas o mercado nao sabe que voce existe. Isso custa milhoes.",
        strengths: ["Produto Solido", "Conhecimento Profundo"],
        blindSpots: ["Invisibilidade", "Vendas Passivas"],
        brandingGaps: ["Zero presenca digital", "Nenhum conteudo publicado"],
        actionableInsight: "Crie um post no LinkedIn contando 1 resultado real de um cliente. Faca isso hoje.",
    };
}
