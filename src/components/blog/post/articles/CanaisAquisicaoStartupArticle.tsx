
import { useState } from 'react';
import { Target, Shuffle, AlertTriangle, Layers, ArrowRight, Share2, Megaphone, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';
import ROASCalculator from '../components/ROASCalculator';

const CanaisAquisicaoStartupArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const channels = [
        {
            category: "Viral / Referral",
            example: "Dropbox, Uber",
            description: "O produto se vende sozinho quando o usuário convida outro. Custo marginal zero, mas difícil de engenheirar.",
            icon: <Share2 className="w-5 h-5 text-revgreen" />
        },
        {
            category: "Paid Media (Ads)",
            example: "Meta, Google, LinkedIn",
            description: "Escalável e previsível, mas caro (CAC tende a subir). Bom para tracionar rápido e validar PMF.",
            icon: <Megaphone className="w-5 h-5 text-revgreen" />
        },
        {
            category: "Content / SEO",
            example: "HubSpot, Rock Content",
            description: "Asset de longo prazo. Demora a tracionar (6-12 meses), mas gera leads com CAC decrescente.",
            icon: <Layers className="w-5 h-5 text-revgreen" />
        },
        {
            category: "Sales / Outbound",
            example: "Salesforce, Oracle",
            description: "Necessário para Enterprise (Tickets altos). Controle total sobre quem você ataca, mas exige time caro.",
            icon: <Target className="w-5 h-5 text-revgreen" />
        }
    ];

    const frameworkSteps = [
        {
            title: "1. O Outer Ring (Possibilidades)",
            desc: "Liste TODOS os 19 canais de tração possíveis (framework Bullseye). Não julgue ainda. Liste PR, Palestras, Outdoor, SEO, tudo."
        },
        {
            title: "2. O Middle Ring (Prováveis)",
            desc: "Selecione 3 a 5 canais que parecem promissores. Rode testes baratos (< R$ 1000) e rápidos (< 1 semana) em cada um."
        },
        {
            title: "3. O Bullseye (O Canal Principal)",
            desc: "Foque 80% do recurso no ÚNICO canal que funcionou melhor. Escale até saturar. Startups morrem por tentar 5 canais ao mesmo tempo."
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="O vício em Meta Ads">
                    A maioria das startups brasileiras tem a estratégia de aquisição preguiçosa: "Coloca dinheiro no Facebook Ads". Isso funciona até o CAC ficar impagável. Empresas resilientes dominam pelo menos um canal orgânico e um pago.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (Bullseye Framework)"
                    items={[
                        { title: "A Regra dos 50%", description: "Você deve gastar 50% do tempo construindo o produto e 50% testando canais de tração. Produto bom sem distribuição morre." },
                        { title: "Lei dos Rendimentos Decrescentes", description: "Todo canal satura. O primeiro milhão em ads é fácil, o décimo é difícil. Esteja sempre testando o próximo canal antes do atual morrer." },
                        { title: "Product-Channel Fit", description: "Produtos complexos (Enterprise) não vendem no Instagram. Produtos impulsivos (B2C) não vendem com Cold Call. O canal deve casar com o produto." },
                        { title: "Não Diversifique Cedo", description: "Achar um canal que funciona é difícil. Quando achar, extraia tudo dele. Só diversifique quando o custo marginal disparar." }
                    ]}
                />

                <ConceptDefinition
                    concept="Bullseye Framework"
                    definition="Metodologia criada por Gabriel Weinberg (DuckDuckGo) para testar sistematicamente canais de tração e identificar o 'alvo'."
                    amateurView="Atirar para todo lado (Postar no Insta, fazer SEO e ligar ao mesmo tempo)."
                    proView="Testar sequencialmente, medir CAC e focar obsessivamente no vencedor."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">As 4 Grandes Categorias</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-12 not-prose">
                    {channels.map((channel, i) => (
                        <Card key={i} className="p-6 bg-white border border-zinc-200 shadow-sm transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                {channel.icon}
                            </div>
                            <div className="flex bg-zinc-900 w-10 h-10 rounded-lg items-center justify-center mb-4 text-white shadow-sm">
                                {channel.icon}
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-2 text-lg">{channel.category}</h3>
                            <p className="text-sm text-zinc-600 mb-3 leading-relaxed">{channel.description}</p>
                            <div className="text-xs font-mono text-zinc-400 mt-2 bg-zinc-50 p-2 rounded border border-zinc-100 italic">
                                "{channel.example}"
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mb-16">
                    <h3 className="text-xl font-bold text-zinc-900 mb-6">Calculadora de ROAS (Paid Media)</h3>
                    <ROASCalculator />
                </div>

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">Como Aplicar o Bullseye</h2>
                <div className="space-y-6 mb-16 not-prose">
                    {frameworkSteps.map((step, index) => (
                        <div key={index} className="flex gap-5 p-6 border-l-4 border-black bg-white shadow-sm rounded-r-lg items-start">
                            <div className="bg-black text-white w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold text-sm shadow-sm mt-1">
                                {index + 1}
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 text-lg mb-2">{step.title}</h3>
                                <p className="text-zinc-700 leading-relaxed text-base">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <RedFlags
                    title="Erros de Distribuição"
                    flags={[
                        "Copiar o concorrente (Se eles usam Ads, o leilão já está caro para você).",
                        "Focar em 'Brand Awareness' antes de ter vendas. No início, ROI é rei.",
                        "Ignorar canais 'não escaláveis' no começo (Ex: Palestras, feiras). Faça coisas que não escalam para aprender."
                    ]}
                />

                <StrategicConclusion
                    title="A Distribuição Vence o Produto"
                    description="Peter Thiel dizia: 'Vendas curam tudo'. Um produto médio com ótima distribuição vence um produto ótimo com distribuição ruim. Pare de codar novas features e comece a testar novos canais hoje."
                    ctaText="Diagnóstico de Canais de Aquisição"
                    diagnosticPath="/score-site"
                    onCTAClick={onCTAClick}
                />
            </div>
        </article>
    );
};

export default CanaisAquisicaoStartupArticle;
