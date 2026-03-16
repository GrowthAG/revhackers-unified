import { supabase } from '@/integrations/supabase/client';

export interface DiagnosticAnalysisResult {
    archetype: string;
    headline: string;
    strengths: string[];
    gaps: string[];
    immediateAction: string;
}

type DiagnosticType = 'growth' | 'revenue';

// Labels mantidas client-side apenas para o mock fallback
const DIMENSION_LABELS: Record<DiagnosticType, string[]> = {
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

export async function analyzeDiagnosticAI(
    type: DiagnosticType,
    answers: number[],
    totalScore: number
): Promise<DiagnosticAnalysisResult> {
    try {
        const { data, error } = await supabase.functions.invoke('analyze-diagnostic', {
            body: { type, answers, totalScore }
        });

        if (error) throw error;

        if (!data?.archetype || !data?.headline || !data?.strengths || !data?.gaps || !data?.immediateAction) {
            throw new Error('Incomplete AI response');
        }

        return {
            archetype: data.archetype,
            headline: data.headline,
            strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 3) : [],
            gaps: Array.isArray(data.gaps) ? data.gaps.slice(0, 3) : [],
            immediateAction: data.immediateAction
        };
    } catch (error) {
        console.error("Erro diagnostic analysis:", error);
        return getMockAnalysis(type, answers, totalScore);
    }
}

function getMockAnalysis(type: DiagnosticType, answers: number[], totalScore: number): DiagnosticAnalysisResult {
    const labels = DIMENSION_LABELS[type] || DIMENSION_LABELS.growth;
    const strong = answers
        .map((s, i) => ({ label: labels[i], score: s }))
        .filter(d => d.score >= 15)
        .map(d => `${d.label} está em nível operacional sólido.`);
    const weak = answers
        .map((s, i) => ({ label: labels[i], score: s }))
        .filter(d => d.score <= 5)
        .map(d => `${d.label} está comprometendo sua operação - ação imediata necessária.`);

    if (type === 'growth') {
        if (totalScore >= 80) return {
            archetype: "Motor de Crescimento",
            headline: "Sua operação de growth está madura. Você tem multicanalidade, controle de CAC e processos estruturados. O próximo passo é escalar sem aumentar o custo marginal.",
            strengths: strong.length >= 3 ? strong.slice(0, 3) : ["Aquisição multicanal ativa", "Processos de vendas estruturados", "Metas atreladas a receita"],
            gaps: weak.length >= 1 ? weak.slice(0, 3) : ["Potencial de otimização em retenção e expansion revenue", "Margem para automação de processos manuais", "Oportunidade de redução adicional de CAC"],
            immediateAction: "Implemente um dashboard semanal de CAC por canal para identificar os 20% de investimento que geram 80% dos resultados."
        };
        if (totalScore >= 50) return {
            archetype: "Tração Manual",
            headline: "Sua empresa cresce, mas depende de esforço manual excessivo. Processos existem parcialmente, mas falta automação e previsibilidade.",
            strengths: strong.length >= 2 ? strong.slice(0, 3) : ["Base de aquisição funcional", "Consciência dos problemas operacionais", "Equipe com potencial de estruturação"],
            gaps: weak.length >= 1 ? weak.slice(0, 3) : ["Dependência de canais únicos para aquisição", "CAC sem tracking granular por canal", "Processo de vendas sem playbook documentado"],
            immediateAction: "Documente seu processo de vendas em um playbook de 1 página: etapas, critérios de qualificação e templates de contato. Isso reduz dependência de 'heróis' individuais."
        };
        return {
            archetype: "Operação Passiva",
            headline: "Sua operação de growth é essencialmente reativa. Sem processos, sem métricas e sem previsibilidade, cada mês é uma loteria.",
            strengths: strong.length >= 1 ? strong.slice(0, 3) : ["Reconhecimento da necessidade de mudança", "Espaço total para estruturação", "Baixo custo de correção neste estágio"],
            gaps: weak.length >= 1 ? weak.slice(0, 3) : ["Ausência de estratégia de aquisição ativa", "Zero visibilidade sobre CAC e ROI", "Sem processo de vendas - tudo depende de intuição"],
            immediateAction: "Defina 1 canal de aquisição principal (o que já gera mais leads) e instale tracking de CAC nele nos próximos 7 dias. Sem dados, qualquer investimento é um tiro no escuro."
        };
    }

    // Revenue
    if (totalScore >= 80) return {
        archetype: "Motor de Receita",
        headline: "Sua operação de receita está madura com previsibilidade, time especializado e tecnologia integrada. O desafio agora é expansion revenue e eficiência marginal.",
        strengths: strong.length >= 3 ? strong.slice(0, 3) : ["Receita recorrente dominante", "Time comercial especializado", "CRM integrado com automação"],
        gaps: weak.length >= 1 ? weak.slice(0, 3) : ["Potencial não explorado de upsell/cross-sell", "Otimização do ciclo de vendas", "Retenção proativa ainda em evolução"],
        immediateAction: "Crie uma meta de Expansion Revenue: defina que 15% da receita mensal deve vir de upsell/cross-sell em clientes ativos. Meça separadamente."
    };
    if (totalScore >= 50) return {
        archetype: "Pipeline em Construção",
        headline: "Sua operação de receita tem fundamentos, mas falta maturidade em tecnologia e previsibilidade. O crescimento está limitado pela estrutura atual.",
        strengths: strong.length >= 2 ? strong.slice(0, 3) : ["Estrutura comercial básica funcional", "Consciência das métricas de conversão", "Ciclo de vendas parcialmente controlado"],
        gaps: weak.length >= 1 ? weak.slice(0, 3) : ["CRM subutilizado ou inexistente", "Falta de previsibilidade na receita", "Conversão abaixo do potencial por falta de qualificação"],
        immediateAction: "Configure seu CRM para registrar TODAS as oportunidades com valor, estágio e data de previsão de fechamento. Sem pipeline estruturado, forecast é ficção."
    };
    return {
        archetype: "Funil Invertido",
        headline: "Sua operação de receita carece de estrutura fundamental. Sem previsibilidade, sem CRM e sem time especializado, a empresa depende de oportunismo.",
        strengths: strong.length >= 1 ? strong.slice(0, 3) : ["Reconhecimento da necessidade de estruturação", "Oportunidade de implementação do zero", "Baixa complexidade para primeiras ações"],
        gaps: weak.length >= 1 ? weak.slice(0, 3) : ["Receita totalmente imprevisível", "Sem time comercial estruturado", "Zero tecnologia de vendas - dados perdidos"],
        immediateAction: "Implemente um CRM básico (HubSpot Free) esta semana. Registre cada lead com fonte, valor estimado e próximo passo. Em 30 dias, você terá seu primeiro forecast real."
    };
}
