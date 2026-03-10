
import { REIType } from "@/types/rei";

export interface ScoreResult {
    score: number;
    radarData: { label: string; value: number }[];
    insights: string[];
}

export class ReiScoringService {
    static calculateScore(type: REIType, data: any): ScoreResult {
        switch (type) {
            case 'founder':
                return this.calculateFounderScore(data);
            case 'dev':
                return this.calculateDevScore(data);
            case 'crm_ops':
                return this.calculateCrmScore(data);
            case 'consulting':
            default:
                return this.calculateConsultingScore(data);
        }
    }

    private static calculateFounderScore(data: any): ScoreResult {
        let growthScore = 50;
        let consistencyScore = 50;
        let authorityScore = 50;
        let uniquenessScore = 60;

        // Influence of Frequency
        const frequency = data.content_frequency || "";
        if (frequency.includes("Diariamente")) consistencyScore = 95;
        else if (frequency.includes("2-3x")) consistencyScore = 80;
        else if (frequency.includes("1x")) consistencyScore = 60;
        else consistencyScore = 30;

        // Influence of Formats
        const formats = data.preferred_formats || "";
        if (formats.includes("Vídeos")) { growthScore += 20; authorityScore += 10; }
        if (formats.includes("Artigos")) { authorityScore += 20; growthScore -= 5; }

        // Influence of Tone
        const tone = data.tone_voice || "";
        if (tone.includes("Polêmico")) { growthScore += 15; uniquenessScore += 20; }
        if (tone.includes("Mentor")) { authorityScore += 15; }

        const totalScore = Math.round((growthScore + consistencyScore + authorityScore + uniquenessScore) / 4);

        return {
            score: totalScore,
            radarData: [
                { label: "AUTORIDADE", value: Math.min(100, authorityScore) },
                { label: "CONSISTÊNCIA", value: Math.min(100, consistencyScore) },
                { label: "CRESCIMENTO", value: Math.min(100, growthScore) },
                { label: "UNICIDADE", value: Math.min(100, uniquenessScore) },
            ],
            insights: [
                consistencyScore < 60 ? "A frequência de publicação atual limita o crescimento orgânico. Recomendamos estabelecer uma rotina mínima de 3 posts semanais." : "Sua cadência de conteúdo está excelente e favorece a distribuição algorítmica constante.",
                tone.includes("Polêmico") ? "O tom provocativo é uma alavanca poderosa para autoridade rápida, mas exige gestão de comunidade ativa." : "Seu posicionamento atual é seguro. Para escalar autoridade, sugerimos incorporar opiniões mais fortes sobre o mercado.",
                formats.includes("Vídeo") ? "O foco em vídeo está alinhado com as tendências de maior alcance nas plataformas atuais." : "Os textos constroem profundidade, mas o alcance é limitado. Recomendamos testar short-videos para topo de funil."
            ]
        };
    }

    private static calculateDevScore(data: any): ScoreResult {
        let techScore = 60;
        let designScore = 60;
        let strategyScore = 60;
        let conversionPotential = 50;

        // 1. Content Readiness
        const content = data.contentStatus || "";
        if (content.includes("pronto")) { strategyScore += 20; conversionPotential += 10; }
        else if (content.includes("zero")) { strategyScore -= 10; techScore -= 5; } // No content = tech delay

        // 2. Brand Readiness
        const brand = data.brandGuidelines || "";
        if (brand.includes("completo")) { designScore += 30; }
        else if (brand.includes("Não temos")) { designScore -= 15; }

        // 3. Project Specifics
        const type = data.projectType || "";
        if (type.includes("High-Ticket")) conversionPotential += 30;
        if (type.includes("E-commerce")) { techScore += 20; strategyScore += 10; }

        const totalScore = Math.round((techScore + designScore + strategyScore + conversionPotential) / 4);

        return {
            score: totalScore,
            radarData: [
                { label: "TECNOLOGIA", value: Math.min(100, techScore) },
                { label: "DESIGN", value: Math.min(100, designScore) },
                { label: "ESTRATÉGIA", value: Math.min(100, strategyScore) },
                { label: "CONVERSÃO", value: Math.min(100, conversionPotential) },
            ],
            insights: [
                content.includes("zero") ? "A falta de conteúdo estruturado pode atrasar o desenvolvimento. Recomendamos priorizar a criação dos textos base." : "Com o conteúdo já estruturado, o foco do desenvolvimento será 100% em performance e experiência.",
                brand.includes("Não temos") ? "Sem uma identidade visual definida, o projeto perde valor percebido. Sugerimos um sprint de branding antes do código." : "A existência de um Brandbook facilita a criação de uma interface consistente e profissional.",
                conversionPotential > 70 ? "O escopo High-Ticket favorece naturalmente a conversão se a jornada de confiança for bem construída." : "O projeto está tecnicamente sólido, mas precisa de mais elementos de persuasão e copy de vendas."
            ]
        };
    }

    private static calculateConsultingScore(data: any): ScoreResult {
        let processScore = 40;
        let peopleScore = 40;
        let dataScore = 30;
        let techScore = 40;

        // 1. Revenue Influence (Scale implies some process)
        // Note: Field 'tamanho' maps to Revenue/Team size usually
        const revenue = data.tamanho || "";
        if (revenue.includes("Acima de") || revenue.includes("10 milhões") || revenue.includes("50+")) {
            processScore += 20;
            peopleScore += 10;
        }

        // 2. Tools Influence
        const crm = data.crm || "";
        if (crm.length > 3 && !crm.includes("nao-utilizo")) { techScore += 20; dataScore += 15; }

        // 3. Team Influence
        const team = data.timeGrowth || "";
        if (team.includes("10+") || team.includes("6-10")) peopleScore += 30;
        else if (team.includes("3-5")) peopleScore += 15;

        // 4. Assets Influence
        const materials = data.marketingMaterials || "";
        if (materials.includes("completos")) processScore += 20;
        else if (materials.includes("basicos")) processScore += 10;

        // 5. Data Influence
        const metrics = data.metricas && Array.isArray(data.metricas) ? data.metricas : [];
        if (metrics.length > 4) dataScore += 30;
        else if (metrics.length > 2) dataScore += 15;

        const totalScore = Math.round((processScore + peopleScore + dataScore + techScore) / 4);

        return {
            score: totalScore,
            radarData: [
                { label: "PROCESSOS", value: Math.min(100, processScore) },
                { label: "PESSOAS", value: Math.min(100, peopleScore) },
                { label: "DADOS", value: Math.min(100, dataScore) },
                { label: "TECNOLOGIA", value: Math.min(100, techScore) },
            ],
            insights: [
                dataScore < 50 ? "Identificamos lacunas na coleta de dados. Sem métricas claras, a tomada de decisão se torna arriscada." : "A infraestrutura de dados existe, agora o foco deve ser em refinar os dashboards para tomada de decisão diária.",
                peopleScore < 50 ? "A estrutura do time parece enxuta para os objetivos de crescimento. Pode haver gargalos operacionais em breve." : "O dimensionamento da equipe está adequado para sustentar o crescimento projetado a curto prazo.",
                processScore > 70 ? "Seus processos estão maduros, criando uma base sólida para escalar vendas sem quebrar a operação." : "Processos pouco definidos representam um risco de ruptura se o volume de vendas aumentar rapidamente."
            ]
        };
    }

    private static calculateCrmScore(data: any): ScoreResult {
        let adoptionScore = 40;
        let processScore = 40;
        let dataScore = 30;
        let automationsScore = 30;

        // 1. CRM Setup Influence
        const crm = data.crm || "";
        if (crm.length > 3 && !crm.includes("nao-utilizo")) {
            adoptionScore += 30;
            dataScore += 20;
        }

        // 2. Pain / Challenge Influence
        const desafios = data.desafios || [];
        if (desafios.includes("conversao") || desafios.includes("previsibilidade")) {
            processScore -= 10;
        }
        if (desafios.includes("escalar")) {
            automationsScore -= 5;
        }

        // 3. Bottleneck Influence
        const gargalo = data.gargaloFunil || data.gargalo || "";
        if (gargalo.includes("meio-processo")) processScore -= 15;
        if (gargalo.includes("dados-cegueira")) dataScore -= 20;
        if (gargalo.includes("meio-followup")) automationsScore -= 15;

        // 4. Metrics / KPIs Influence
        const metrics = data.metricas && Array.isArray(data.metricas) ? data.metricas : [];
        if (metrics.length > 4) dataScore += 30;
        else if (metrics.length > 2) dataScore += 15;

        const totalScore = Math.round((adoptionScore + processScore + dataScore + automationsScore) / 4);

        return {
            score: totalScore,
            radarData: [
                { label: "ADOÇÃO", value: Math.max(10, Math.min(100, adoptionScore)) },
                { label: "PROCESSOS", value: Math.max(10, Math.min(100, processScore)) },
                { label: "DADOS", value: Math.max(10, Math.min(100, dataScore)) },
                { label: "AUTOMAÇÃO", value: Math.max(10, Math.min(100, automationsScore)) },
            ],
            insights: [
                adoptionScore < 60 ? "A ferramenta não está sendo alimentada corretamente pelo time. O foco inicial deve ser reduzir a fricção de entrada e criar playbooks de uso." : "O time utiliza a ferramenta, agora o foco será enriquecer as propriedades capturadas no pipeline.",
                dataScore < 50 ? "Identificamos cegueira de dados. Sem métricas rastreáveis, não há como otimizar conversão do meio do funil." : "A base de dados permite criar dashboards avançados para acelerar a previsibilidade de receita.",
                automationsScore < 60 ? "Excesso de tarefas manuais no follow-up. Implementar fluxos de cadência e alertas liberará tempo produtivo dos vendedores." : "Sua automação base já está rodando, permitindo focar em lógicas complexas de lead scoring e roteamento."
            ]
        };
    }
}
