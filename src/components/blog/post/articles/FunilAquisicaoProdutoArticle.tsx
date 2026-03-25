import { useState } from 'react';
import { ArrowRight, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import StrategicConclusion from '../components/StrategicConclusion';

const FunilAquisicaoProdutoArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Sidecar Products (Ferramentas Grátis)",
            description: "Crie uma ferramenta pequena e gratuita que resolve uma dor específica do seu ICP. É melhor que qualquer ebook.",
            example: "HubSpot Website Grader, CoSchedule Headline Analyzer, Calculadora ROI.",
            results: "Gera milhares de leads com intenção real."
        },
        {
            title: "Engineering as Marketing",
            description: "Use o tempo dos seus devs para marketing. Construir utilitários gera backlinks e tráfego orgânico perpétuo.",
            example: "Moz Domain Authority Checker. Virou o padrão da indústria.",
            results: "Autoridade de domínio (SEO) massiva."
        },
        {
            title: "Interactive Demos (Product Tours)",
            description: "Permita que o visitante 'brinque' com o produto sem criar conta (Ungated).",
            example: "Software de Dashboard que permite clicar e filtrar dados na home page.",
            results: "Qualifica o lead antes dele falar com vendas."
        },
        {
            title: "Templates & Kits",
            description: "Se não pode criar software, crie templates acionáveis (Excel, Notion, Figma).",
            example: "Airtable: 'Template de Calendário Editorial'. O usuário clica e já cai dentro do produto.",
            results: "Ativação instantânea."
        }
    ];

    const templates = [
        {
            name: "Calculadora de ROI (Conceito)",
            subject: "Ferramenta Interativa",
            body: `HEADLINE:
Quanto você está perdendo por não automatizar?

INPUTS:
1. Número de funcionários
2. Custo hora médio
3. Horas gastas em [Tarefa Manual]

OUTPUT:
Você gasta R$ [Valor] por ano em tarefas manuais.
Nossa ferramenta custa [10x menos].

CTA:
Começar o teste grátis.`
        },
        {
            name: "Convite para Beta (Sidecar)",
            subject: "Nova ferramenta grátis",
            body: `Oi [Nome],

Acabamos de lançar o [Nome da Ferramenta] - 100% gratuito.

Ele ajuda você a [Resolver Dor Específica] em segundos, sem precisar de cadastro.

Como você trabalha com [Área], achei que seria útil.

Teste aqui: [Link]

Adoraria seu feedback.

Abs.`
        }
    ];

    const anatomy = [
        { label: "DOR", title: "Problema Específico", desc: "A ferramenta deve resolver UM problema pequeno e frequente. Não tente resolver tudo." },
        { label: "VALOR", title: "Utility > Novelty", desc: "Deve ser útil de verdade, não apenas 'legal'. Deve fazer parte do fluxo de trabalho." },
        { label: "HOOK", title: "O Gancho", desc: "O resultado final da ferramenta deve sugerir o Próximo Passo lógico: seu produto principal." },
        { label: "LOOP", title: "Viralidade", desc: "O resultado é compartilhável? (ex: 'Minha nota no Grader foi 90/100')." }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed">

                <StrategicContext label="O Conceito">
                    Em vez de gastar dinheiro com Ads para levar pessoas a uma Landing Page, gaste dinheiro construindo algo útil que as pessoas procuram no Google.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Software > Conteúdo", description: "Ferramentas úteis geram mais leads e backlinks que qualquer blog post." },
                        { title: "Mostre, não fale", description: "Product-Led Acquisition é sobre provar valor antes de pedir dinheiro ou email." },
                        { title: "Cauda Longa", description: "Utilize ferramentas para capturar tráfego de busca de alta intenção (ex: 'calculadora de salário')." },
                        { title: "Baixa Fricção", description: "Não coloque um form gigante na frente da sua ferramenta grátis. Deixe usar, peça email para salvar o resultado." }
                    ]}
                />

                {/* Intro + Stats */}
                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-zinc-900 mt-0">Marketing com Utilidade</h2>
                    <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                        As pessoas estão cansadas de baixar ebooks que nunca leem. Elas querem resolver problemas. Quando sua marca oferece a solução gratuita para um problema pequeno, você ganha a confiança para vender a solução para o problema grande.
                    </p>

                    <div className="flex flex-col md:flex-row gap-8 my-10 border-y border-zinc-200 py-8 not-prose">
                        <div className="flex-1">
                            <div className="text-4xl font-bold text-black mb-1">5x</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Mais barato que Ads (Longo Prazo)</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-zinc-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">40%</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Conversão de Ferramenta -&gt; Lead</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-zinc-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">SEO</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Ímã de Backlinks</div>
                        </div>
                    </div>
                </div>

                {/* Anatomy - Definition List */}
                <div className="mb-20">
                    <h2 id="anatomia" className="font-bold text-zinc-900 mb-8">Anatomia de um Sidecar Product</h2>
                    <p className="text-zinc-700 mb-8">Como projetar uma ferramenta de marketing.</p>

                    <div className="not-prose grid gap-6">
                        {anatomy.map((item, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 md:items-baseline border-b border-zinc-100 pb-6 last:border-0 last:pb-0">
                                <span className="text-xs font-bold text-black w-24 shrink-0 uppercase tracking-wider bg-zinc-100 p-2 text-center rounded-sm">
                                    {item.label}
                                </span>
                                <div>
                                    <h4 className="font-bold text-zinc-900 text-lg mb-1">{item.title}</h4>
                                    <p className="text-zinc-600 leading-relaxed m-0">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategies - Numbered List */}
                <div className="mb-20">
                    <h2 id="estrategias" className="font-bold text-zinc-900 mb-10">
                        4 Tipos de Engenharia como Marketing
                    </h2>

                    <div className="space-y-12">
                        {strategies.map((strategy, index) => (
                            <div key={index} className="pl-0">
                                <h3 className="font-bold text-xl text-zinc-900 mb-3 mt-0 flex items-baseline gap-3">
                                    <span className="text-revgreen text-base font-normal">0{index + 1}.</span>
                                    {strategy.title}
                                </h3>
                                <p className="text-zinc-700 mb-4">{strategy.description}</p>

                                <div className="bg-zinc-50 border-l-2 border-zinc-300 pl-4 py-2 italic text-zinc-600 text-base mb-2">
                                    "{strategy.example}"
                                </div>

                                <div className="text-sm font-medium text-black mt-2">
                                    <span className="text-zinc-500 font-normal mr-2">Resultado:</span>
                                    {strategy.results}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="mb-20">
                    <h2 id="templates" className="font-bold text-zinc-900 mb-10">Ideias para Construir</h2>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {templates.map((template, index) => (
                            <Card key={index} className="bg-white border border-zinc-200 shadow-sm transition-shadow overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                    <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider truncate pr-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-revgreen"></div>
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
                                    <pre className="font-mono text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed">
                                        {template.body}
                                    </pre>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Checklist - Paper Style */}
                <Card className="mb-20 bg-zinc-50 border border-zinc-200 p-8 md:p-12 shadow-inner relative overflow-hidden not-prose">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck className="w-32 h-32 text-zinc-900" />
                    </div>
                    <div className="flex items-center gap-3 mb-8 border-b border-zinc-200 pb-4 relative z-10">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        <h2 id="checklist" className="text-xl font-bold text-zinc-900 m-0">Checklist de Lançamento</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 relative z-10">
                        {[
                            "A ferramenta resolve uma dor real e frequente?",
                            "O tempo de uso é menor que 2 minutos?",
                            "O resultado é valioso o suficiente para salvar?",
                            "Existe um CTA claro para o produto principal?",
                            "O SEO da página está otimizado (Keywords)?",
                            "É fácil de compartilhar (Social Buttons)?",
                            "Funciona perfeitamente no Mobile?",
                            "O design é profissional (confiança)?"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-200 last:border-0 text-zinc-700">
                                <CheckCircle2 className="w-4 h-4 text-revgreen mt-1" />
                                <span className="text-sm font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CTA Final */}
                <StrategicConclusion
                    title="Que ferramenta construir?"
                    description="Solicite um diagnóstico. Ajudamos a identificar sidecar products ideais para seu mercado."
                    ctaText="Solicitar Diagnóstico"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default FunilAquisicaoProdutoArticle;
