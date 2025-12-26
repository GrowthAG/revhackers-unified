// REI Scoring System

export interface REIScore {
    total: number;
    maxScore: number;
    percentage: number;
    level: string;
    color: string;
    description: string;
    recommendations: string[];
}

// Scoring weights for different question types
const SCORING_WEIGHTS = {
    // Text fields get base score
    text: 5,
    textarea: 10,
    // Select fields get weighted scores
    select: {
        'yes': 15,
        'no': 0,
        'personalized': 10,
        'complete': 15,
        'basic': 5,
        'none': 0,
        'some': 8
    }
};

export const calculateREIScore = (formData: any): REIScore => {
    let totalScore = 0;
    let maxScore = 0;

    // Calculate scores based on filled fields
    Object.entries(formData).forEach(([key, value]) => {
        if (key === 'company' || key === 'responsible' || key === 'email') return;

        const stringValue = String(value || '');

        // Select fields
        if (['hasPlans', 'hasMarketingMaterials'].includes(key)) {
            maxScore += 15;
            const selectScore = SCORING_WEIGHTS.select[stringValue as keyof typeof SCORING_WEIGHTS.select] || 0;
            totalScore += selectScore;
        }
        // Textarea fields (more valuable)
        else if (stringValue.length > 50) {
            maxScore += 10;
            totalScore += Math.min(10, Math.floor(stringValue.length / 20));
        }
        // Text fields
        else if (stringValue.trim()) {
            maxScore += 5;
            totalScore += 5;
        }
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Determine level based on percentage
    let level, color, description, recommendations;

    if (percentage >= 90) {
        level = "Excelente";
        color = "text-green-600";
        description = "Sua empresa demonstra alta maturidade operacional e está pronta para escalar.";
        recommendations = [
            "Implementar automações avançadas",
            "Expandir para novos mercados",
            "Otimizar processos existentes"
        ];
    } else if (percentage >= 70) {
        level = "Muito Bom";
        color = "text-blue-600";
        description = "Boa estrutura comercial. Foco em otimização e eficiência.";
        recommendations = [
            "Integrar ferramentas de marketing e vendas",
            "Implementar lead scoring",
            "Automatizar processos manuais"
        ];
    } else if (percentage >= 50) {
        level = "Bom";
        color = "text-yellow-600";
        description = "Base sólida, mas há oportunidades significativas de melhoria.";
        recommendations = [
            "Estruturar processos de vendas",
            "Implementar CRM adequadamente",
            "Criar playbooks de vendas"
        ];
    } else if (percentage >= 30) {
        level = "Em Desenvolvimento";
        color = "text-orange-600";
        description = "Operação em fase inicial. Foco em estruturação básica.";
        recommendations = [
            "Definir processos básicos",
            "Implementar CRM",
            "Treinar equipe comercial"
        ];
    } else {
        level = "Inicial";
        color = "text-red-600";
        description = "Operação necessita de estruturação urgente.";
        recommendations = [
            "Criar processo de vendas documentado",
            "Implementar ferramentas básicas",
            "Definir ICP e persona"
        ];
    }

    return {
        total: Math.round(totalScore),
        maxScore,
        percentage: Math.round(percentage),
        level,
        color,
        description,
        recommendations
    };
};
