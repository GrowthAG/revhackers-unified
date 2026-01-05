
import { StrategicPlanData } from "@/services/DiagnosticService";

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

export interface MarketIntelligenceData {
    industry_trends: string[];
    competitor_benchmarks: string[];
    market_sizing: {
        tam: string;
        sam: string;
        som: string;
    };
    strategic_advice: string;
}

export class MarketIntelligenceService {
    static async fetchMarketData(segment: string, objective: string): Promise<MarketIntelligenceData> {
        try {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-sonar-small-128k-online',
                    messages: [
                        {
                            role: 'system',
                            content: `Você é um analista de inteligência de mercado sênior focado em B2B e SaaS. 
                            Analise o segmento e objetivo fornecidos.
                            Retorne APENAS um JSON válido seguindo este esquema:
                            {
                                "industry_trends": ["Tendência 1", "Tendência 2"],
                                "competitor_benchmarks": ["Benchmark 1 (CPC médio, CPL, etc)", "Benchmark 2"],
                                "market_sizing": {
                                    "tam": "Descrição do Mercado Total",
                                    "sam": "Descrição do Mercado Endereçável",
                                    "som": "Descrição do Mercado que podemos capturar"
                                },
                                "strategic_advice": "Um conselho matador em português focado em crescimento."
                            }`
                        },
                        {
                            role: 'user',
                            content: `Segmento: ${segment}. Objetivo: ${objective}`
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error('Market Intelligence API failed');

            const data = await response.json();
            const content = data.choices[0].message.content;
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            console.warn("Market Intelligence Error - Returning Mock Data:", error);
            return {
                industry_trends: ["Crescimento de Search Generative Experience (SGE)", "Hiper-personalização via Agentes de IA"],
                competitor_benchmarks: ["CPC Médio do setor: R$ 12,50", "Taxa de Conversão de Trial-to-Paid: 15%"],
                market_sizing: {
                    tam: "Mercado Global de RevOps de US$ 13.5B",
                    sam: "Mercado Latam de Soluções B2B",
                    som: "Nicho específico de SaaS Early-Stage no Brasil"
                },
                strategic_advice: "Foque em dominar a autoridade no LinkedIn antes de escalar agressivamente em Google Ads para reduzir o CAC inicial."
            };
        }
    }
}
