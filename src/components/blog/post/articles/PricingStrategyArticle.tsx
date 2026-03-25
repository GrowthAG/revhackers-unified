import { useState } from 'react';
import { ArrowRight, Calculator, TrendingUp, DollarSign, BrainCircuit, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const PricingStrategyArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Value-Metric Aligned (A métrica certa)",
            description: "Cobre pelo que gera valor, não pelo que custa. Se o cliente ganha dinheiro com usuários ativos, cobre por 'Monthly Active Users', não por 'Gigas de armazenamento'.",
            icon: <TrendingUp className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Decoy Effect (Efeito Chamariz)",
            description: "O plano do meio (Standard) só parece barato porque existe um plano caro (Enterprise) ao lado. Use âncoras de preço para guiar a escolha.",
            icon: <BrainCircuit className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Nudge to Annual (Fluxo de Caixa)",
            description: "Ofereça 20% de desconto no anual. O churn de planos anuais é drasticamente menor e você financia seu crescimento com o caixa antecipado.",
            icon: <DollarSign className="w-6 h-6 text-revgreen" />
        }
    ];

    const templates = [
        {
            name: "Pesquisa de Sensibilidade (Van Westendorp)",
            subject: "Perguntas para descobrir o preço ideal",
            body: `Não pergunte "quanto você pagaria?". Pergunte:

1. A que preço esse produto seria tão barato que você duvidaria da qualidade? (Cheap)
2. A que preço seria uma pechincha? (Bargain)
3. A que preço começaria a ficar caro, mas ainda compraria? (Expensive)
4. A que preço seria proibitivo? (Too Expensive)

O seu preço ideal está entre a média das respostas 2 e 3.`
        },
        {
            name: "Script de Ancoragem de Preço",
            subject: "Como apresentar o preço na call",
            body: `(Apresente o ROI antes do Preço)

"João, calculamos que o problema X custa R$ 50.000 por mês hoje para vocês.

Para resolver isso, a solução Enterprise custaria R$ 5.000 mensais.
Mas, para a fase que vocês estão (Growth), o plano Pro de R$ 1.500 mensais já elimina 80% desse desperdício.

Faz sentido proteger 50k investindo 1.5k?"`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="O Poder do Pricing">
                    Uma melhora de 1% na aquisição aumenta o lucro em 3%. Uma melhora de 1% no preço aumenta o lucro em 11%. Pricing é a alavanca mais potente e ignorada do crescimento.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Preço é Posicionamento", description: "Um preço baixo comunica 'commodities'. Um preço alto comunica 'especialista'. Quem você quer ser?" },
                        { title: "A Regra do 10x", description: "Seu produto deve entregar (e demonstrar) pelo menos 10x mais valor do que o preço cobrado." },
                        { title: "Raise Your Prices", description: "Se ninguém reclama do seu preço, ele está baixo demais. 20% de resistência é saudável." },
                        { title: "Simplicidade Vende", description: "Se o cliente precisa de uma planilha para entender sua tabela de preços, você perdeu." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-zinc-900 mt-0 text-3xl md:text-4xl">Psicologia de Pricing B2B</h2>
                    <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                        Muitos fundadores definem preço olhando para o concorrente ou chutando um custo + margem. O Pricing Estratégico olha para a **disposição a pagar** (Willingness to Pay) e o valor percebido pelo cliente.
                    </p>
                </div>

                <ConceptDefinition
                    concept="Value-Based Pricing"
                    definition="Cobrar uma fração do valor econômico que você gera para o cliente, em vez de cobrar pelo custo dos seus inputs (horas dev, servidores)."
                    amateurView="Custa R$ 100 pra fazer, vou cobrar R$ 150."
                    proView="Gera R$ 1.000.000 de economia para o cliente, vou cobrar R$ 100.000."
                />

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-revgreen" />
                    Estratégias para Aumentar LTV
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-16 not-prose">
                    {strategies.map((item, index) => (
                        <Card key={index} className="p-6 border border-zinc-200 shadow-sm transition-all group overflow-hidden relative bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {item.icon}
                            </div>
                            <div className="mb-4">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-lg text-zinc-900 mb-2">{item.title}</h3>
                            <p className="text-zinc-600 text-sm leading-relaxed">{item.description}</p>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Seu Pricing está Quebrado?"
                    flags={[
                        "Você fecha 100% das propostas que envia (Sinal que está muito barato).",
                        "Clientes Enterprise pagam o mesmo que Startups (Você está deixando dinheiro na mesa).",
                        "Sua métrica de cobrança (ex: usuários) desestimula o uso do produto.",
                        "Você não aumentou o preço nos últimos 12 meses (inflação e melhorias ignoradas)."
                    ]}
                />

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-revgreen" />
                    Templates de Precificação
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-zinc-200 shadow-sm transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-revgreen" />
                                    {template.name}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(template.body, index)}
                                    className="h-7 text-[10px] uppercase font-bold text-zinc-500 hover:text-revgreen hover:bg-revgreen/10 transition-colors"
                                >
                                    {copiedIndex === index ? (
                                        <span className="flex items-center gap-1 text-revgreen"><CheckCircle2 className="w-3 h-3" /> Copiado</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</span>
                                    )}
                                </Button>
                            </div>
                            <div className="p-6">
                                <div className="text-xs text-zinc-500 font-mono mb-4 border-b border-zinc-100 pb-2 flex gap-2">
                                    <span className="font-bold text-zinc-700">Assunto:</span> {template.subject}
                                </div>
                                <pre className="font-mono text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">
                                    {template.body}
                                </pre>
                            </div>
                        </Card>
                    ))}
                </div>

                <StrategicConclusion
                    title="O Preço Certo"
                    description="Pricing não é estático. É um organismo vivo que deve evoluir com seu produto. Se você não está testando seu preço, você está perdendo margem."
                    ctaText="Auditoria de Pricing Strategy"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default PricingStrategyArticle;
