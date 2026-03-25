import { useState } from 'react';
import { ArrowRight, Video, Target, Zap, AlertTriangle, CheckCircle2, Copy, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const AnatomiaDaDemoArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const scriptSteps = [
        {
            title: "1. The Context Setup (0-5 min)",
            goal: "Revalidar o que foi dito na Discovery e setar a agenda.",
            script: "Baseado no que conversamos semana passada, preparei algo focado em resolver [Dor A] e [Dor B]. O objetivo hoje não é um tour pela plataforma, mas validar se conseguimos resolver isso para você. Faz sentido?",
            impact: "Evita o 'Show up & Throw up' (aparecer e vomitar features)."
        },
        {
            title: "2. The Villain (5-10 min)",
            goal: "Vender o problema antes da solução. Mostrar o custo da inércia.",
            script: "A maioria das empresas como a sua tenta resolver [Dor A] fazendo [X]. O problema é que isso gera [Consequência Y]. É isso que está acontecendo hoje?",
            impact: "Cria urgência e diferenciação estratégica."
        },
        {
            title: "3. The Transformation (10-30 min)",
            goal: "Mostrar a SOLUÇÃO para as dores específicas, não features aleatórias.",
            script: "Lembra que você disse que perde 4 horas por semana com relatórios? Deixa eu te mostrar como a gente elimina isso em 2 cliques. Olhe isso aqui...",
            impact: "Conecta feature -> benefício -> alívio emocional."
        },
        {
            title: "4. The Closing (30-45 min)",
            goal: "Definir os próximos passos (Next Steps) concretos.",
            script: "Visto o que mostrei, você acredita que isso resolve o problema de [Dor A]? [Sim]. Ótimo. O processo típico agora envolve uma prova de conceito ou envio de proposta para o CFO. Qual o melhor caminho para você?",
            impact: "Não termina com 'vou pensar', termina com um plano."
        }
    ];

    const templates = [
        {
            name: "Roteiro de Validação (Micro-Agreements)",
            subject: "Perguntas de Checagem durante a Demo",
            body: `NUNCA fale por mais de 2 minutos sem checar a temperatura:

1. "Isso faz sentido para o seu cenário atual?"
2. "É assim que você imaginava resolver esse problema?"
3. "Se você tivesse isso hoje, quanto tempo sua equipe economizaria?"
4. "Existe algo que eu mostrei que NÃO se encaixa no que vocês precisam?" (A melhor pergunta para descobrir objeções ocultas).`
        },
        {
            name: "Email de Follow-up Pós-Demo",
            subject: "Resumo da nossa conversa + Próximos Passos",
            body: `Oi [Nome],

Obrigado pelo tempo hoje. Fiquei empolgado em ver como podemos ajudar a eliminar [Dor A] e [Dor B].

Conforme combinamos, aqui está o resumo:
- O Desafio: [Custo da Inércia que discutimos].
- A Solução: [Feature X e Feature Y].
- O Impacto: [Economia de tempo/dinheiro projetada].

Próximos Passos (Acordados):
1. Eu envio a proposta técnica até amanhã (10h).
2. Você alinha com o [CFO/Decisor] até sexta.
3. Call de fechamento dia [Data].

Envio o link da gravação abaixo.

Abs,
[Seu Nome]`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="O Erro Comum">
                    A maioria dos vendedores acha que a Demo é um "treinamento de produto". Errado. A Demo é a prova de que o "Futuro Prometido" é real. Se você está ensinando a clicar em botões, você está perdendo a venda.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Venda a Transformação", description: "O cliente não quer saber como a feature funciona, ele quer saber como a vida dele melhora." },
                        { title: "Features Matam Vendas", description: "Mostrar tudo o que seu produto faz confunde. Mostre apenas o que resolve a dor diagnosticada." },
                        { title: "Controle a Narrativa", description: "Não deixe o cliente guiar a demo com 'mostra isso, mostra aquilo'. Você é o piloto." },
                        { title: "Sempre Next Steps", description: "Uma demo sem data marcada para a próxima conversa é apenas uma visita turística." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-zinc-900 mt-0 text-3xl md:text-4xl">A Anatomia da Demo Perfeita</h2>
                    <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                        Existe uma diferença brutal entre apresentar um produto e fechar um contrato. A Demo de alta conversão não é sobre o seu software; é sobre a história do cliente mudando de um estado de dor para um estado de glória.
                    </p>
                </div>

                <ConceptDefinition
                    concept="Feature Creep durante a Demo"
                    definition="O ato de mostrar funcionalidades irrelevantes para o cliente apenas porque 'seria legal mostrar'. Isso dilui o valor, cria objeções desnecessárias e aumenta o ciclo de vendas."
                    amateurView="Vou mostrar tudo o que o sistema faz para impressionar pelo volume."
                    proView="Vou mostrar apenas os 20% do sistema que entregam 80% do valor para este cliente específico."
                />

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <MonitorPlay className="w-6 h-6 text-revgreen" />
                    O Arco Narrativo da Demo (4 Atos)
                </h2>

                <div className="space-y-12 mb-16">
                    {scriptSteps.map((step, index) => (
                        <div key={index} className="bg-zinc-50 p-8 rounded-xl border border-zinc-100">
                            <h3 className="text-xl font-bold text-zinc-900 mb-4">{step.title}</h3>
                            <div className="mb-4">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Objetivo:</span>
                                <p className="text-zinc-700 m-0">{step.goal}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm mb-4">
                                <span className="text-xs font-bold text-revgreen uppercase tracking-wider block mb-2">Script / Fala Sugerida</span>
                                <p className="text-zinc-900 font-medium italic m-0">"{step.script}"</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
                                <Zap className="w-4 h-4" />
                                {step.impact}
                            </div>
                        </div>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de que sua Demo falhou"
                    flags={[
                        "O cliente ficou em silêncio por mais de 5 minutos seguidos.",
                        "Não houve perguntas sobre implementação ou preço.",
                        "Você não conseguiu agendar o próximo passo na hora.",
                        "O cliente disse 'interessante, vou mostrar pro meu chefe' (Sinal de que você não equipou ele para vender internamente)."
                    ]}
                />

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Video className="w-6 h-6 text-revgreen" />
                    Templates para Copiar e Colar
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-zinc-200 shadow-sm transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-revgreen" />
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
                    title="Pare de Apresentar, Comece a Fechar"
                    description="Seu produto é incrível, mas ninguém compra produto. Eles compram a certeza de que o problema será resolvido. Transforme sua demo nessa certeza."
                    ctaText="Treinar Time de Vendas"
                    leadMagnetId="demo-framework"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default AnatomiaDaDemoArticle;
