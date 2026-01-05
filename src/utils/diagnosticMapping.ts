export type DiagnosticType = 'revenue' | 'growth' | 'site' | 'founder';

interface InsightLevel {
    title: string;
    description: string;
    action: string;
    color: string;
}

export const getDiagnosticInsights = (type: DiagnosticType, score: number): InsightLevel => {
    // Standard Ranges: 
    // 0-49: Critical (Red)
    // 50-89: Warning/Growth (Yellow/Greenish)
    // 90-100: Optimized (Green)

    const mappings = {
        revenue: {
            critical: {
                title: "Inconsistência de Escala",
                description: "Sua operação possui gargalos críticos de previsibilidade. O custo de aquisição (CAC) tende a escalar de forma desordenada.",
                action: "Estabilização Imediata",
                color: "red-500"
            },
            warning: {
                title: "Oportunidade de Eficiência",
                description: "Existem ativos de receita subutilizados. Sua estrutura suporta mais volume, mas falta refinamento técnico nos canais.",
                action: "Otimização de Conversão",
                color: "revgreen"
            },
            optimized: {
                title: "Alta Performance Operacional",
                description: "Sua máquina de vendas está calibrada. O foco agora é expansão horizontal e blindagem de margem.",
                action: "Escala Sustentável",
                color: "white"
            }
        },
        growth: {
            critical: {
                title: "Fragilidade de Ativos",
                description: "Seu crescimento depende de variáveis externas ou esforço manual excessivo. Falta uma 'máquina' proprietária.",
                action: "Construção de Infra",
                color: "red-500"
            },
            warning: {
                title: "Maturidade em Progresso",
                description: "Você já possui tração, mas a retenção e o LTV ainda não estão maximizados por falta de dados.",
                action: "Refinamento de Dados",
                color: "revgreen"
            },
            optimized: {
                title: "Maturidade de Crescimento",
                description: "Processos sólidos e cultura de experimentação ativa. Sua infraestrutura é um diferencial competitivo.",
                action: "Aceleração de Mercado",
                color: "white"
            }
        },
        site: {
            critical: {
                title: "Infraestrutura Obsoleta",
                description: "Seu site atua como um repelente de leads. Lentidão e falhas técnicas estão destruindo seu investimento em mídia.",
                action: "Reconstrução Técnica",
                color: "red-500"
            },
            warning: {
                title: "Gargalo de Conversão",
                description: "O site é funcional, mas perde eficiência em momentos críticos da jornada do usuário. Falta refinamento de Core Vitals.",
                action: "Performance SPRINT",
                color: "revgreen"
            },
            optimized: {
                title: "Excelência de Infraestrutura",
                description: "Seu site é uma ferramenta de vendas de alta precisão. Rápido, seguro e otimizado para conversão máxima.",
                action: "Monitoramento Contínuo",
                color: "white"
            }
        },
        founder: {
            critical: {
                title: "Desconexão de Autoridade",
                description: "Sua presença digital não reflete sua expertise real. Isso gera fricção na venda e aumenta o ciclo de fechamento.",
                action: "Posicionamento Estratégico",
                color: "red-500"
            },
            warning: {
                title: "Autoridade em Construção",
                description: "Existe uma base sólida, mas seu conteúdo e rede ainda não trabalham como um canal de aquisição passivo.",
                action: "Social Selling Hub",
                color: "revgreen"
            },
            optimized: {
                title: "Liderança de Pensamento",
                description: "Sua autoridade é um ímã de oportunidades. O mercado o reconhece como referência técnica absoluta.",
                action: "Amplificação de Voz",
                color: "white"
            }
        }
    };

    const levels = mappings[type];
    if (score < 50) return levels.critical;
    if (score < 90) return levels.warning;
    return levels.optimized;
};
