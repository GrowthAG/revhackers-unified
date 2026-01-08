
import { StrategicPlanData } from "@/services/DiagnosticService";

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

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
                            Retorne APENAS um JSON válido (sem markdown) seguindo estritamente este esquema:
                            {
                                "industry_trends": ["Tendência 1", "Tendência 2"],
                                "competitor_benchmarks": [
                                    {"company_name": "Empresa A", "key_metric": "CAC estimado R$ X", "strategy_insight": "Usa estratégia Y"},
                                    {"company_name": "Empresa B", "key_metric": "Ticket Médio", "strategy_insight": "Foco em Enterprise"},
                                    {"company_name": "Empresa C", "key_metric": "Growth Rate", "strategy_insight": "PLG"}
                                ],
                                "market_sizing": {
                                    "tam": "Descrição do Mercado Total",
                                    "sam": "Descrição do Mercado Endereçável",
                                    "som": "Descrição do Mercado que podemos capturar"
                                },
                                "personas": [
                                    {
                                        "name": "Nome da Persona 1",
                                        "role": "Cargo (ex: Diretor Comercial)",
                                        "pain": "Principal dor específica (ex: Falta de visibilidade)",
                                        "trigger": "Gatilho de compra (ex: Troca de gestão)",
                                        "message": "Pitch de 1 frase para essa persona",
                                        "wiifm": "O que ela ganha pessoalmente (ex: Promoção, menos estresse)"
                                    },
                                    { "name": "Nome 2", "role": "Cargo 2", "pain": "Dor 2", "trigger": "Gatilho 2", "message": "Msg 2", "wiifm": "Ganho 2" },
                                    { "name": "Nome 3", "role": "Cargo 3", "pain": "Dor 3", "trigger": "Gatilho 3", "message": "Msg 3", "wiifm": "Ganho 3" }
                                ],
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
