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
    // Select fields: mapeamento de valores reais dos REIs para score
    select: {
        // Valores booleanos genericos
        'yes': 15,
        'no': 0,
        // Qualidade de planos
        'personalized': 10,
        'complete': 15,
        'basic': 5,
        'none': 0,
        'some': 8,
        // Valores de consultingQuestions.ts (hasPlans)
        'structured': 15,
        'informal': 8,
        'none_plan': 0,
        // Valores de annualRevenue
        'acima-10m': 15,
        '5m-10m': 12,
        '1m-5m': 10,
        '500k-1m': 8,
        'abaixo-500k': 5,
        // Valores de marketingMaterials
        'complete_kit': 15,
        'partial': 8,
        'minimal': 3,
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

    // Design System Nobibecode: apenas zinc scale + #00CC6A como accent
    if (percentage >= 90) {
        level = "Lider";
        color = "text-[#00CC6A]"; // accent verde apenas neste nivel maximo
        description = "Sua empresa demonstra alta maturidade operacional e esta pronta para escalar.";
        recommendations = [
            "Implementar automacoes avancadas",
            "Expandir para novos mercados",
            "Otimizar processos existentes"
        ];
    } else if (percentage >= 70) {
        level = "Avancado";
        color = "text-zinc-900";
        description = "Boa estrutura comercial. Foco em otimizacao e eficiencia.";
        recommendations = [
            "Integrar ferramentas de marketing e vendas",
            "Implementar lead scoring",
            "Automatizar processos manuais"
        ];
    } else if (percentage >= 50) {
        level = "Intermediario";
        color = "text-zinc-700";
        description = "Base solida, mas ha oportunidades significativas de melhoria.";
        recommendations = [
            "Estruturar processos de vendas",
            "Implementar CRM adequadamente",
            "Criar playbooks de vendas"
        ];
    } else if (percentage >= 30) {
        level = "Em Desenvolvimento";
        color = "text-zinc-500";
        description = "Operacao em fase inicial. Foco em estruturacao basica.";
        recommendations = [
            "Definir processos basicos",
            "Implementar CRM",
            "Treinar equipe comercial"
        ];
    } else {
        level = "Inicial";
        color = "text-zinc-400";
        description = "Operacao necessita de estruturacao urgente.";
        recommendations = [
            "Criar processo de vendas documentado",
            "Implementar ferramentas basicas",
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
