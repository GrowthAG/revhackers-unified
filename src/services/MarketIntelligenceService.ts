
import { supabase } from '@/integrations/supabase/client';

export interface MarketIntelligenceData {
    industry_trends: string[];
    competitor_benchmarks: {
        company_name: string;
        key_metric: string;
        strategy_insight: string;
    }[];
    market_sizing: {
        tam: string;
        sam: string;
        som: string;
    };
    personas: {
        name: string;
        role: string;
        pain: string;
        trigger: string;
        message: string;
        wiifm: string;
    }[];
    strategic_advice: string;
}

export class MarketIntelligenceService {
    static async fetchMarketData(segment: string, objective: string): Promise<MarketIntelligenceData> {
        try {
            const { data, error } = await supabase.functions.invoke('market-intelligence', {
                body: { segment, objective }
            });

            if (error) throw error;

            return data as MarketIntelligenceData;
        } catch (error) {
            console.warn("Market Intelligence Error - Returning Mock Data:", error);
            return {
                industry_trends: ["Consolidação de Ferramentas (All-in-One)", "Aumento de CAC em Mídia Paga", "Foco em Retenção e LTV"],
                competitor_benchmarks: [
                    { company_name: "Salesforce/Mulesoft", key_metric: "CAC > R$ 5k", strategy_insight: "Dominância via ecossistema e lock-in." },
                    { company_name: "HubSpot", key_metric: "LTV:CAC 4:1", strategy_insight: "Inbound forte + PLG gratuito para entrada." },
                    { company_name: "RD Station", key_metric: "Market Share BR 40%", strategy_insight: "Educação de mercado e rede de parceiros." }
                ],
                market_sizing: {
                    tam: "Mercado Global de CRM US$ 60B+",
                    sam: "Mercado SAM Latam SaaS B2B",
                    som: "SMBs brasileiras buscando digitalização de vendas"
                },
                personas: [
                    {
                        name: "Ricardo",
                        role: "CEO / Founder",
                        pain: "Não sabe de onde vem o lucro nem o prejuízo. Cegueira de dados.",
                        trigger: "Queda no faturamento ou estagnação.",
                        message: "Tenha o controle total da sua operação em um dashboard único.",
                        wiifm: "Segurança para tomar decisões e dormir tranquilo."
                    },
                    {
                        name: "Mariana",
                        role: "Gerente Comercial",
                        pain: "Time perde muito tempo preenchendo planilha e não vende.",
                        trigger: "Pressão por metas não batidas.",
                        message: "Automatize a burocracia e deixe seu time vender.",
                        wiifm: "Bater meta com menos esforço manual e ser reconhecida."
                    },
                    {
                        name: "Felipe",
                        role: "Analista de Marketing",
                        pain: "Não consegue provar ROI das campanhas para a diretoria.",
                        trigger: "Cortes no budget de marketing.",
                        message: "Rastreamento ponta a ponta para provar que o marketing paga a conta.",
                        wiifm: "Ter budget aprovado e provar seu valor técnico."
                    }
                ],
                strategic_advice: "Para vencer neste cenário, a chave não é apenas gerar mais leads, mas aumentar a eficiência do funil com automação e dados integrados, reduzindo o CAC e aumentando o LTV."
            };
        }
    }
}
