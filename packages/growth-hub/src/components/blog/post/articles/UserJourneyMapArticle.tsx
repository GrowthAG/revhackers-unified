import { useState } from 'react';
import { ArrowRight, ShieldCheck, Map, Compass, Route, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import StrategicConclusion from '../components/StrategicConclusion';

const UserJourneyMapArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Mapeamento de Emoções",
            description: "A jornada não é só lógica (cliques), é emocional. Mapeie onde o usuário sente 'Ansiedade', 'Confusão' ou 'Alívio'.",
            example: "Momento do Pagamento = Alta Ansiedade. Mensagem de Sucesso = Alívio.",
            results: "Otimização de Copy para reduzir ansiedade."
        },
        {
            title: "Identificação de Pontos de Fricção",
            description: "Onde o usuário para? Use gravações de sessão (Hotjar) para ver onde o mouse trava.",
            example: "Formulário pedindo 'CNPJ' na primeira tela causava abandono de 60%.",
            results: "Desbloqueio de gargalos de conversão."
        },
        {
            title: "Momentos da Verdade (MoT)",
            description: "Os 3 a 5 pontos críticos onde o cliente decide se continua ou sai.",
            example: "Zero Moment of Truth (ZMOT): A pesquisa no Google. First Moment: O Unboxing/Login. Second Moment: O uso real.",
            results: "Foco de recursos onde realmente importa."
        }
    ];

    const templates = [
        {
            name: "Template de Entrevista de Jornada",
            subject: "Roteiro de Discovery",
            body: `OBJETIVO: Entender o 'Job to be Done' e a jornada de compra.

PERGUNTAS CHAVE:
1. Quando foi a primeira vez que você pensou "preciso resolver esse problema"? (O Gatilho)
2. O que você fez logo em seguida? (A Pesquisa)
3. Quais outras soluções você considerou? (A Comparação)
4. O que te fez hesitar antes de comprar a nossa? (A Fricção)
5. Qual foi o momento exato que você sentiu que "valeu a pena"? (O Sucesso)`
        },
        {
            name: "Matriz de Jornada Simples",
            subject: "Coluna do Mapa",
            body: `ETAPA: [Ex: Onboarding]

AÇÃO DO USUÁRIO:
- Preenche cadastro, clica em 'Entrar'.

O QUE ELE ESTÁ PENSANDO?
- "Será que vai pedir cartão?", "Vai demorar muito?"

O QUE ELE ESTÁ SENTINDO?
- Curiosidade misturada com pressa.

NOSSA RESPOSTA (Sistema):
- Barra de progresso visível.
- Microcopy: "Não precisa de cartão. Leva 2 min".`
        }
    ];

    const anatomy = [
        { label: "AWARENESS", title: "A Descoberta", desc: "O usuário percebe que tem um problema. O conteúdo deve ser educativo." },
        { label: "CONSIDERATION", title: "A Avaliação", desc: "O usuário compara opções. O conteúdo deve ser comparativo e provas sociais." },
        { label: "DECISION", title: "A Compra", desc: "O usuário escolhe você. O processo deve ser livre de fricção e seguro." },
        { label: "RETENTION", title: "O Hábito", desc: "O usuário continua usando. O produto deve entregar valor recorrente." },
        { label: "ADVOCACY", title: "A Recomendação", desc: "O usuário vira fã. Incentive o referral." }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

                <StrategicContext label="Insight">
                    Uma melhora de 5% na retenção (fim da jornada) pode aumentar os lucros em 25% a 95%. Pare de focar só em aquisição.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Não assuma, pergunte", description: "A maioria das jornadas desenhadas em salas de reunião são ficção. Valide com clientes reais." },
                        { title: "A Jornada não é linear", description: "O cliente vai e volta. Entra no site, sai, vê um ad, recebe um email, volta. Esteja pronto para o caos." },
                        { title: "O Pós-Venda é a Nova Venda", description: "A jornada não acaba no pagamento. A retenção e expansão (LTV) são onde o lucro real está." },
                        { title: "Mobile First", description: "Se a jornada é ruim no celular, ela é ruim. Ponto. A maioria das descobertas começa no mobile." }
                    ]}
                />

                {/* Intro + Stats */}
                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">O Caminho do Cliente</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Mapear a jornada do usuário é a única forma de entender onde você está perdendo dinheiro. É como um raio-X da sua operação.
                    </p>

                    <div className="flex flex-col md:flex-row gap-8 my-10 border-y border-gray-200 py-8 not-prose">
                        <div className="flex-1">
                            <div className="text-4xl font-bold text-black mb-1">X</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">O mapa não é o território</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">70%</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Das empresas falham em CX</div>
                        </div>
                        <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
                            <div className="text-4xl font-bold text-black mb-1">Gap</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Entre expectativa e realidade</div>
                        </div>
                    </div>
                </div>

                {/* Anatomy - Definition List */}
                <div className="mb-20">
                    <h2 id="anatomia" className="font-bold text-gray-900 mb-8">As 5 Etapas (Framework Clássico)</h2>
                    <p className="text-gray-700 mb-8">O ciclo de vida completo do cliente.</p>

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

                <div className="bg-zinc-50 p-8 rounded-xl border border-zinc-200 mb-20 italic">
                    <h3 className="text-xl font-bold text-zinc-900 mb-4 not-italic">Os 3 Ps do Onboarding de Sucesso</h3>
                    <div className="grid md:grid-cols-3 gap-6 not-italic">
                        <div>
                            <span className="font-bold text-revgreen block mb-1">PROFISSIOALISMO:</span>
                            <p className="text-sm text-gray-600">A primeira impressão técnica. O sistema é robusto e confiável?</p>
                        </div>
                        <div>
                            <span className="font-bold text-revgreen block mb-1">PERCEPÇÃO (VALOR):</span>
                            <p className="text-sm text-gray-600">O usuário sentiu o "Aha Moment" logo no primeiro dia?</p>
                        </div>
                        <div>
                            <span className="font-bold text-revgreen block mb-1">PROXIMIDADE:</span>
                            <p className="text-sm text-gray-600">O suporte é rápido nos momentos de dúvida crítica?</p>
                        </div>
                    </div>
                </div>

                {/* Strategies - Numbered List */}
                <div className="mb-20">
                    <h2 id="estrategias" className="font-bold text-gray-900 mb-10">
                        3 Técnicas de Mapeamento
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
                    <h2 id="templates" className="font-bold text-gray-900 mb-10">Templates de Pesquisa</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {templates.map((template, index) => (
                            <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <Compass className="w-4 h-4 text-revgreen" />
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
                                    </div>
                                    <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                                        {template.body}
                                    </pre>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Checklist - Paper Style */}
                <Card className="mb-20 bg-gray-50 border border-gray-200 p-8 md:p-12 shadow-inner relative overflow-hidden not-prose">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck className="w-32 h-32 text-gray-900" />
                    </div>
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4 relative z-10">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        <h2 id="checklist" className="text-xl font-bold text-gray-900 m-0">Checklist de Otimização</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 relative z-10">
                        {[
                            "Instalação de Hotjar/Clarity",
                            "Review de Analytics (Drop-off points)",
                            "Entrevista com 5 clientes recentes",
                            "Entrevista com 5 clientes perdidos (Churn)",
                            "Teste de Usabilidade (User Testing)",
                            "Review de Emails Transacionais (Copy e Design)",
                            "Velocidade de Carregamento mobile",
                            "Mystery Shopper (Compre seu próprio produto)"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-0 text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-revgreen mt-1" />
                                <span className="text-sm font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* CTA Final */}
                <StrategicConclusion
                    title="Implemente este Mapeamento Hoje"
                    description="Não comece do zero. Baixe nosso Checklist de RevOps que inclui a seção detalhada de Jornada do Cliente e comece a otimizar sua retenção agora."
                    ctaText="Baixar Checklist Gratuito"
                    leadMagnetId="checklist"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default UserJourneyMapArticle;
