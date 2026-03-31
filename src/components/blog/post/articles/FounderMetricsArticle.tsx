
import { useState } from 'react';
import { TrendingUp, Activity, AlertOctagon, DollarSign, Calculator, LineChart, Target, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const FounderMetricsArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const metrics = [
        {
            title: "Burn Multiple",
            desc: "A métrica definitiva de eficiência. Quanto de dinheiro você queima para gerar R$ 1 de ARR novo?",
            benchmark: "< 1.5x (Excelente), 1.5-2.5x (Bom), > 3x (Perigoso)",
            icon: <Activity className="w-5 h-5 text-revgreen" />
        },
        {
            title: "CAC Payback",
            desc: "Em quantos meses o cliente paga o custo de aquisição dele. Cash is king.",
            benchmark: "< 12 meses (Ideal), < 18 meses (Aceitável para Enterprise)",
            icon: <Calculator className="w-5 h-5 text-revgreen" />
        },
        {
            title: "NRR (Net Revenue Retention)",
            desc: "Quanto sua base de clientes cresce sozinha (Upsell - Churn). Se > 100%, você cresce mesmo sem vendas novas.",
            benchmark: "> 110% (SaaS B2B saudável)",
            icon: <TrendingUp className="w-5 h-5 text-revgreen" />
        },
        {
            title: "Rule of 40",
            desc: "Growth Rate (%) + Profit Margin (%). A soma deve ser maior que 40.",
            benchmark: "Se sua startup cresce 100% ao ano, pode ter margem de -60%.",
            icon: <LineChart className="w-5 h-5 text-revgreen" />
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="Vaidade vs. Valuation">
                    Founders amam falar de número de usuários e tamanho do time. VCs (Venture Capitalists) só ligam para eficiência de capital e retenção. Se você quer levantar uma Series A em 2024, pare de otimizar para 'Likes' e comece a otimizar para 'Unit Economics'.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (Boardroom Ready)"
                    items={[
                        { title: "Growth a qualquer custo morreu", description: "A era do dinheiro barato (ZIRP) acabou. Hoje, crescer com unit economics ruim é suicídio. O mercado premia crescimento EFICIENTE." },
                        { title: "Churn é o assassino silencioso", description: "Se você tem churn mensal de 5%, você perde metade da empresa em um ano. Arrume o balde furado antes de abrir a torneira de vendas." },
                        { title: "Cash Conversion Cycle", description: "SaaS bom recebe adiantado (Plano Anual). Isso financia o crescimento sem diluir o founder. Venda anual, pague comissão mensal." },
                        { title: "O número mágico: 3x", description: "Seu LTV deve ser pelo menos 3x maior que seu CAC. Se for menor que isso, você está pagando para trabalhar." }
                    ]}
                />

                <ConceptDefinition
                    concept="Unit Economics"
                    definition="A lucratividade direta de uma única unidade vendida (um cliente), desconsiderando custos fixos (aluguel, P&D)."
                    amateurView="Olhar apenas o DRE (Lucro Líquido)."
                    proView="Saber exatamente quanto lucro marginal cada novo cliente traz (LTV - CAC)."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">As 4 Métricas de Sobrevivência</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-12 not-prose">
                    {metrics.map((metric, i) => (
                        <Card key={i} className="p-6 bg-white border border-zinc-200 shadow-sm transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                {metric.icon}
                            </div>
                            <div className="flex bg-zinc-900 w-10 h-10 items-center justify-center mb-4 text-white shadow-sm">
                                {metric.icon}
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-2 text-lg">{metric.title}</h3>
                            <p className="text-sm text-zinc-600 mb-3 leading-relaxed">{metric.desc}</p>
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 font-mono text-xs border border-zinc-200">
                                Bench: {metric.benchmark}
                            </Badge>
                        </Card>
                    ))}
                </div>

                <Card className="bg-zinc-50 border border-zinc-200 shadow-inner p-8 not-prose mb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <AlertOctagon className="w-24 h-24 text-zinc-900" />
                    </div>
                    <h3 className="text-zinc-900 font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                        <AlertOctagon className="w-5 h-5 text-revgreen" />
                        O Teste do Elevador (Para Investors)
                    </h3>
                    <p className="text-zinc-600 mb-6 relative z-10">
                        Se um investidor te perguntar "Como está a tração?", não responda "Está boa". Responda com precisão:
                    </p>
                    <div className="bg-white p-5 border-l-4 border-revgreen shadow-sm font-mono text-sm text-zinc-700 italic relative z-10">
                        "Estamos crescendo 15% MoM (Month-over-Month), com um CAC de R$ 500 e Payback de 4 meses. Nosso NRR é 120% devido à expansão de contas Enterprise."
                    </div>
                </Card>

                <RedFlags
                    title="Mentiras que Founders contam"
                    flags={[
                        "Confundir Receita (Bookings) com Faturamento (Revenue). Venda anual parcelada não é caixa imediato.",
                        "Ignorar o salário dos founders no cálculo do CAC (Se você vende, seu tempo custa dinheiro).",
                        "Medir LTV 'infinito' (projeter que o cliente vai ficar 10 anos). Use LTV de 3 a 5 anos no máximo."
                    ]}
                />

                <StrategicConclusion
                    title="Finanças é Estratégia"
                    description="Não delegue isso para o contador. O Founder precisa ter o DRE na cabeça. Se você não entende como o dinheiro se move na sua empresa, você não é o CEO, é apenas um passageiro."
                    ctaText="Diagnóstico Financeiro para Startups"
                    onCTAClick={onCTAClick}
                />
            </div>
        </article>
    );
};

export default FounderMetricsArticle;
