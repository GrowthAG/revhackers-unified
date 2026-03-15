import { supabase } from '@/integrations/supabase/client';

export interface FounderAnalysisResult {
    archetype: "Visionário" | "Vendedor" | "Técnico";
    score: number;
    headline: string;
    analysis: string;
    strengths: string[];
    blindSpots: string[];
}

export async function analyzeFounderProfileAI(
    linkedinUrl: string,
    answers: number[],
    quizScore: number
): Promise<FounderAnalysisResult> {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-diagnostic', {
            body: { type: 'founder', answers, totalScore: quizScore, linkedinUrl }
        });

        if (error) throw error;

        // Validate and return only expected fields (no unsafe ...parsed spread)
        return {
            archetype: data.archetype || 'Técnico',
            score: quizScore,
            headline: data.headline || '',
            analysis: data.analysis || '',
            strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 2) : [],
            blindSpots: Array.isArray(data.blindSpots) ? data.blindSpots.slice(0, 2) : []
        };
    } catch (error) {
        console.error("Erro founder analysis:", error);
        return getMockAnalysis(quizScore);
    }
}

function getMockAnalysis(score: number): FounderAnalysisResult {
    if (score > 80) return {
        archetype: "Visionário",
        score,
        headline: "O Líder de Mercado",
        analysis: "Sua presença impõe respeito, mas cuidado para não se distanciar da realidade operacional.",
        strengths: ["Autoridade Clara", "Visão de Futuro"],
        blindSpots: ["Distância do Cliente", "Excesso de Abstração"]
    };
    if (score > 50) return {
        archetype: "Vendedor",
        score,
        headline: "A Máquina de Vendas",
        analysis: "Você gera movimento, mas falta profundidade técnica para sustentar LTV longo.",
        strengths: ["Energia Alta", "Conversão Rápida"],
        blindSpots: ["Churn Alto", "Conteúdo Raso"]
    };
    return {
        archetype: "Técnico",
        score,
        headline: "O Especialista Oculto",
        analysis: "Você é brilhante tecnicamente, mas o mercado não sabe que você existe. Isso custa milhões.",
        strengths: ["Produto Sólido", "Conhecimento Profundo"],
        blindSpots: ["Invisibilidade", "Vendas Passivas"]
    };
}
