
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
    static async fetchMarketData(
        segment: string,
        objective: string,
        options?: {
            rei_responses?: any;
            siteAnalysis?: any;
            competitors?: { nome: string, url?: string }[];
        }
    ): Promise<MarketIntelligenceData> {
        try {
            const { data, error } = await supabase.functions.invoke('market-intelligence', {
                body: {
                    segment,
                    objective,
                    rei_responses: options?.rei_responses,
                    siteAnalysis: options?.siteAnalysis,
                    competitors: options?.competitors
                }
            });

            if (error) throw error;

            return data as MarketIntelligenceData;
        } catch (error) {
            console.warn("Market Intelligence Error:", error);
            throw new Error("A Inteligência de Mercado falhou ao tentar realizar o Web Search (Verifique a API Key do Perplexity/OpenAI na Edge Function). Mocks foram bloqueados por política de segurança de dados reais.");
        }
    }
}
