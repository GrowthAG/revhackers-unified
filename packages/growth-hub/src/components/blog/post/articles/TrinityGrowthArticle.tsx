import { useState } from 'react';
import { ArrowRight, ShieldCheck, Merge, Zap, Users, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';

const TrinityGrowthArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Inbound to PLG (Trial Booster)",
            description: "Use conteúdo educativo para atrair tráfego e oferecer o Trial Gratuito como 'Lead Magnet' final.",
            example: "O usuário lê artigo sobre 'Como fazer X', e o CTA é 'Use nossa ferramenta grátis para fazer X agora'.",
            results: "Redução do CAC de Inbound em 40%."
        },
        {
            title: "Outbound to Inbound (Content Seeding)",
            description: "Use prospecção fria para distribuir conteúdo de alto valor (não venda), gerando awareness para depois retargetar.",
            example: "Email frio: 'Vi que você é líder em X. Criamos este report de tendências. Sem pitch, só acho que vai gostar.'",
            results: "Abertura de portas em contas Enterprise."
        },
        {
            title: "PLG to Outbound (Product Signals)",
            description: "Identifique 'Power Users' no plano gratuito e mande Vendas atacar (PQLs).",
            example: "Usuário gratuito convidou 5 colegas do mesmo domínio corporativo -> Alerta para SDR ligar imediatamente.",
            results: "Conversão de Free-to-Paid sobe de 2% para 15%."
        }
    ];

    const templates = [
        {
            name: "Email de Ativação PQL (PLG -> Outbound)",
            subject: "Vi seu progresso",
            body: `Oi [Nome],

Vi que você e mais 3 pessoas da [Empresa] estão usando bastante o [Feature X] essa semana. Incrível ver o progresso.

Normalmente, empresas no seu estágio começam a ter problemas com [Limitação do Free].

Quer que eu libere um trial de 14 dias do plano Enterprise para vocês testarem o [Feature Y] sem compromisso?

Abs.`
        },
        {
            name: "Cold Email de Conteúdo (Outbound -> Inbound)",
            subject: "Ideia para [Empresa]",
            body: `[Nome],

Estava lendo sobre a estratégia da [Empresa] de focar em [Objetivo].

Acabamos de publicar um estudo de caso sobre como a [Concorrente/Similar] resolveu exatamente isso.

Achei que poderia ter 1 ou 2 insights úteis para sua reunião de planejamento.

Aqui está o link (sem gate): [Link]

Abs.`
        }
    ];

    const anatomy = [
        { label: "INBOUND", title: "Awareness & Trust", desc: "Onde o cliente te descobre e aprende a confiar. É o motor de 'Eficácia' a longo prazo." },
        { label: "OUTBOUND", title: "Velocity & Targeting", desc: "Onde você escolhe quem quer atender e acelera o contato. É o motor de 'Velocidade'." },
        { label: "PLG", title: "Efficiency & Experience", desc: "Onde o produto prova o valor e reduz fricção. É o motor de 'Eficiência' de custo." },
        { label: "SYNERGY", title: "O Efeito Multiplicador", desc: "Quando um canal alimenta o outro, o CAC global cai e o LTV sobe." }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

                <StrategicContext label="O Novo Padrão de Ouro">
                    As empresas de crescimento mais rápido do mundo (HubSpot, Slack, Zoom) não escolheram UM canal. Elas dominaram a interseção deles.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Segurança na Diversificação", description: "Depender de um único canal é suicídio. Algoritmos mudam, custos sobem." },
                        { title: "Sinergia 1+1=3", description: "O Inbound aquece para o Outbound. O PLG qualifica para o Vendedor. Tudo se conecta." },
                        { title: "Jornadas Híbridas", description: "O cliente moderno não segue linhas retas. Ele lê blog, testa app e fala com vendedor. Aceite isso." },
                        { title: "Eficiência de Capital", description: "Combinar estratégias reduz o CAC médio (Blended CAC) e acelera o payback period." }
                    ]}
                />

                {/* Intro + Stats */}
                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">A Estratégia Trinity</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Parar de brigar sobre "qual canal é melhor" e começar a desenhar como eles trabalham juntos. Trinity Growth é sobre orquestração, não seleção.
                    </p>

                    <div className="flex flex-col md:flex-row gap-8 my-10 border-y border-gray-200 py-8 not-prose">
                        <div className="flex-1">
                            <div className="text-4xl font-bold text-black mb-1">-30%</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">CAC Médio (Híbrido)</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">2.5x</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">LTV de Clientes Multicanal</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">∞</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Resiliência Operacional</div>
                        </div>
                    </div>
                </div>

                {/* Anatomy - Definition List */}
                <div className="mb-20">
                    <h2 id="anatomia" className="font-bold text-gray-900 mb-8">Os Três Motores do Crescimento</h2>
                    <p className="text-gray-700 mb-8">Entendendo o papel de cada peça na engrenagem.</p>

                    <div className="not-prose grid gap-6">
                        {anatomy.map((item, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 md:items-baseline border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <span className="text-xs font-bold text-black w-24 shrink-0 uppercase tracking-wider bg-gray-100 p-2 text-center rounded-sm">
                                    {item.label}
                                </span>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                                    <p className="text-gray-600 leading-relaxed m-0">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategies - Numbered List */}
                <div className="mb-20">
                    <h2 id="estrategias" className="font-bold text-gray-900 mb-10">
                        3 Pontos de Interseção (Cross-Plays)
                    </h2>

                    <div className="space-y-12">
                        {strategies.map((strategy, index) => (
                            <div key={index} className="pl-0">
                                <h3 className="font-bold text-xl text-gray-900 mb-3 mt-0 flex items-baseline gap-3">
                                    <span className="text-revgreen text-base font-normal">0{index + 1}.</span>
                                    {strategy.title}
                                </h3>
                                <p className="text-gray-700 mb-4">{strategy.description}</p>

                                <div className="bg-gray-50 border-l-2 border-gray-300 pl-4 py-2 italic text-gray-600 text-base mb-2">
                                    "{strategy.example}"
                                </div>

                                <div className="text-sm font-medium text-black mt-2">
                                    <span className="text-gray-500 font-normal mr-2">Resultado:</span>
                                    {strategy.results}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="mb-20">
                    <h2 id="templates" className="font-bold text-gray-900 mb-10">Scripts de Cruzamento</h2>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {templates.map((template, index) => (
                            <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div className="text-xs font-bold text-gray-900 uppercase tracking-wider truncate pr-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-revgreen"></div>
                                        {template.name}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(template.body, index)}
                                        className="h-7 text-[10px] uppercase font-bold text-gray-500 hover:text-revgreen hover:bg-revgreen/10 transition-colors"
                                    >
                                        {copiedIndex === index ? (
                                            <span className="flex items-center gap-1 text-revgreen"><CheckCircle2 className="w-3 h-3" /> Copiado</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</span>
                                        )}
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <div className="text-xs text-gray-500 font-mono mb-4 border-b border-gray-100 pb-2 flex gap-2">
                                        <span className="font-bold text-gray-700">Assunto:</span> {template.subject}
                                        <span className="text-xs text-xs bg-gray-100 px-1 rounded text-gray-400">Template</span>
                                    </div>
                                    <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                                        {template.body}
                                    </pre>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Checklist - Black Box */}
                <div className="mb-20 bg-neutral-900 text-white p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        <h2 id="checklist" className="text-xl font-bold text-white m-0">Checklist de Unificação</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                        {[
                            "CRM unificado (Vendas vê dados de Marketing)",
                            "Atribuição Multi-touch configurada",
                            "SDRs treinados para lidar com PQLs",
                            "Conteúdo alinhado com objeções de vendas",
                            "Trial com dados de enriquecimento (Clearbit/Apollo)",
                            "Campanhas de Retargeting para Cold Leads",
                            "Reunião mensal All-Hands (Mkt + Sales + Prod)",
                            "Métrica North Star compartilhada entre times"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0 text-gray-300">
                                <span className="text-revgreen mt-1">✓</span>
                                <span className="text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Final */}
                <div className="text-center py-12 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Precisa integrar suas operações?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                        Desenhamos ou corrigimos sua arquitetura de crescimento unificada.
                    </p>
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="bg-black text-white hover:bg-gray-800 font-bold px-10 h-14 rounded-none uppercase tracking-wider text-sm"
                            onClick={onCTAClick}
                        >
                            <span className="flex items-center gap-2">
                                Solicitar Diagnóstico
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Button>
                    </div>
                </div>

            </div>
        </article>
    );
};

export default TrinityGrowthArticle;
