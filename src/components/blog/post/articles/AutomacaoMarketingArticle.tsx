import { useState } from 'react';
import { ArrowRight, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';

const AutomacaoMarketingArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Lead Scoring Comportamental",
            description: "Não trate todos os leads igual. Dê pontos quando eles visitam a página de preços ou abrem 3 emails seguidos.",
            example: "Lead visitou Preços (+20pts). Lead abriu email (+5pts). Se Score > 50, Alertar Vendas.",
            results: "Foco do time de vendas nos 10% que estão prontos para comprar."
        },
        {
            title: "A Reativação de 'Leads Mortos'",
            description: "A maioria dos leads não compra agora, mas compra depois. Crie uma automação para quem não interage há 90 dias.",
            example: "Email simples: 'Oi [Nome], você ainda está procurando resolver [Problema] ou posso arquivar seu contato?'",
            results: "Recupera 3-5% da base inativa sem custo de aquisição."
        },
        {
            title: "Nurturing Baseado em Clique",
            description: "Se o lead clicou no link sobre 'Integrações', mande emails sobre técnica. Se clicou em 'Preço', mande cases de ROI.",
            example: "Segmentação automática baseada no interesse demonstrado.",
            results: "Aumento de 2x no Click-Through-Rate (CTR)."
        },
        {
            title: "O 'Hand-Raiser' Alert",
            description: "Quando um lead importante (VIP) volta ao site, o dono da conta deve saber imediatamente.",
            example: "Envio de notificação Slack/Teams para o vendedor: 'A conta [X] está vendo a página de Planos agora.'",
            results: "Timing de abordagem perfeito."
        }
    ];

    const templates = [
        {
            name: "The 'Nine-Word' Re-engagement",
            subject: "Sobre [Empresa/Problema]",
            body: `Oi [Nome],

Você ainda está procurando por uma solução de [Categoria do seu Produto]?

Abraço,
[Seu Nome]`
        },
        {
            name: "Pós-Demo (Ghosting Killer)",
            subject: "Próximos passos?",
            body: `Oi [Nome],

Como combinamos na call, aqui está o resumo do que discutimos: [Link da call]

Para não ficarmos trocando emails: qual o melhor próximo passo para você?

1. Avançar para proposta
2. Revisar com o time técnico
3. Pausar por enquanto (sem problemas)

Só me avise para eu organizar aqui.

Abs.`
        }
    ];

    const anatomy = [
        { label: "TRIGGER", title: "O Gatilho", desc: "O que dispara a automação? (Visita no site, clique no email, mudança de campo no CRM)." },
        { label: "FILTER", title: "A Regra", desc: "Quem deve entrar? (Somente CEOs, Somente empresas > 50 func, Somente quem tem Score > 30)." },
        { label: "ACTION", title: "A Ação", desc: "O que acontece? (Enviar email, Criar tarefa, Mudar status, Adicionar em audiência de Ads)." },
        { label: "EXIT", title: "A Saída", desc: "Quando para? (Se respondeu, se comprou, se descadastrou). O objetivo final." }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed">

                <StrategicContext label="A Regra de Ouro">
                    Se você faz a mesma tarefa no computador mais de 3 vezes por semana, ela deve ser automatizada. Libere humanos para fazer trabalho humano (conversar, negociar, criar).
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Não Automatize o Caos", description: "Se seu processo manual é ruim, a automação só vai escalar o erro mais rápido." },
                        { title: "Direita > Esquerda", description: "Comece automatizando o fundo do funil (Fechamento/Retenção). É onde está o dinheiro." },
                        { title: "Personalização em Escala", description: "Automação não é para ser robótico. É para entregar a mensagem certa no momento exato." },
                        { title: "Limpeza de Dados", description: "Automação quebra com dados sujos. Mantenha seu CRM higienizado." }
                    ]}
                />

                {/* Intro + Stats */}
                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-zinc-900 mt-0">Escalando sem Contratar</h2>
                    <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                        A promessa da automação não é apenas "ganhar tempo". É garantir consistência. Um robô nunca esquece de fazer o follow-up, nunca tem um "dia ruim" e nunca deixa um lead esfriar por distração.
                    </p>

                    <div className="flex flex-col md:flex-row gap-8 my-10 border-y border-zinc-200 py-8 not-prose">
                        <div className="flex-1">
                            <div className="text-4xl font-bold text-black mb-1">14.5%</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Aumento em Produtividade de Vendas</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-zinc-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">80%</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Leads Nurtured fecham melhor</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-zinc-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">3x</div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Retenção com Onboarding Auto</div>
                        </div>
                    </div>
                </div>

                {/* Anatomy - Definition List */}
                <div className="mb-20">
                    <h2 id="anatomia" className="font-bold text-zinc-900 mb-8">Anatomia de um Workflow</h2>
                    <p className="text-zinc-700 mb-8">A lógica 'If This Then That' aplicada a receita.</p>

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
                        4 Automações Obrigatórias
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
                    <h2 id="templates" className="font-bold text-zinc-900 mb-10">Scripts de Automação</h2>

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
                                        className="h-7 text-xxs uppercase font-bold text-zinc-500 hover:text-revgreen hover:bg-revgreen/10 transition-colors"
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

                {/* Checklist - Black Box */}
                <div className="mb-20 bg-neutral-900 text-white p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        <h2 id="checklist" className="text-xl font-bold text-white m-0">Checklist de Setup</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                        {[
                            "Lead Scoring configurado e calibrado",
                            "Integração CRM <-> Marketing Automation (Bidirecional)",
                            "Rastreamento de Site ativo (Pixel/Script)",
                            "Regra de atribuição de leads para vendedores (Round Robin)",
                            "Email de Boas-vindas imediato (< 5min)",
                            "Automação de Nurturing (Mínimo 3 toques)",
                            "SLA de Vendas (Tempo de resposta monitorado)",
                            "Higienização de lista (Hard Bounces removidos)"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0 text-zinc-300">
                                <span className="text-revgreen mt-1">✓</span>
                                <span className="text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Final */}
                <div className="text-center py-12 border-t border-zinc-200">
                    <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                        Sua operação roda no automático?
                    </h3>
                    <p className="text-zinc-600 mb-8 max-w-lg mx-auto text-lg">
                        Solicite um diagnóstico. Desenhamos o mapa completo das suas automações de receita.
                    </p>
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="bg-black text-white hover:bg-zinc-800 font-bold px-10 h-14 rounded-none uppercase tracking-wider text-sm"
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

export default AutomacaoMarketingArticle;
