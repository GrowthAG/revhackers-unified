export interface FounderAnalysisResult {
    archetype: "Visionário" | "Vendedor" | "Técnico";
    score: number;
    headline: string;
    analysis: string;
    strengths: string[];
    blindSpots: string[];
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function analyzeFounderProfileAI(
    linkedinUrl: string,
    answers: number[],
    quizScore: number
): Promise<FounderAnalysisResult> {
    const apiKey = import.meta.env.VITE_PSI_API_KEY;

    if (!apiKey) {
        console.warn("API Key não encontrada. Retornando mock.");
        return getMockAnalysis(quizScore);
    }

    // Mapeamento das Respostas para Texto (Contexto para a IA)
    const contextMap = [
        "Perfil LinkedIn: " + [0, 5, 10, 20][[0, 5, 10, 20].indexOf(answers[0] || 0)], // Simplificação
        "Frequência de Postagem: " + (answers[1] > 10 ? "Alta" : "baixa"),
        "Material Rico: " + (answers[2] > 10 ? "Sim" : "Não"),
        "Geração de Leads: " + (answers[3] > 10 ? "Alta" : "Baixa"),
        "Autoridade Percebida: " + (answers[4] > 10 ? "Alta" : "Baixa")
    ];

    const prompt = `
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
    `;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Falha na resposta da IA");
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        // Limpar markdown code blocks se houver
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(cleanJson);

        return {
            ...parsed,
            score: quizScore // Mantemos o score do quiz como base, enriquecido pela IA
        };

    } catch (error) {
        console.error("Erro Gemini:", error);
        return getMockAnalysis(quizScore);
    }
}

function getMockAnalysis(score: number): FounderAnalysisResult {
    // Fallback se a API falhar
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
