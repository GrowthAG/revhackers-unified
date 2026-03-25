
import { useState } from 'react';
import { MousePointerClick, Zap, Users, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Play, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const SaaSPLGArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "O Funil Invertido (Bottom-Up)",
            description: "No SaaS PLG, a venda começa pelo usuário final, não pelo CTO. O objetivo do trial é criar 'Internal Champions'.",
            example: "Slack entra via desenvolvedores e depois é adotado pela TI da empresa.",
            results: "Redução de 60% no ciclo de vendas."
        },
        {
            title: "TTV (Time to Value) Radical",
            description: "O usuário deve ver o benefício do software nos primeiros 2 minutos. Se precisar de call de setup, você perdeu o lead.",
            example: "O Canva permite criar um post em 3 cliques sem sequer fazer login.",
            results: "Aumento de 24% na ativação de contas."
        },
        {
            title: "Product-Led Sales (PLS)",
            description: "Use o uso do produto como o maior sinal de intenção. Vendas só aborda quem já atingiu o 'Aha Moment'.",
            example: "Vendedor liga para quem usou a feature premium 3x nas últimas 24h.",
            results: "Aumento de 3x na taxa de fechamento (Close Rate)."
        }
    ];

    const templates = [
        {
            name: "Email: O Gatilho de Uso (Trigger)",
            subject: "Vi que você explorou o [Recurso X]",
            body: `Oi [Nome],

Notei que você ativou o [Recurso X] no seu painel hoje.

Geralmente, nossos usuários mais avançados usam isso para [Resolver Problema Y].

Se você quiser, posso te mostrar como automatizar o [Passo Z] para economizar ainda mais tempo. Topa uma call de 10 min?

Abs,
[Seu Nome]`
        },
        {
            name: "Audit: Product-Qualified Lead (PQL)",
            subject: "Score de Qualificação",
            body: `CHECKLIST DE PQL:
1. Login Frequency: > 3 vezes na primeira semana.
2. Core Feature Adoption: Completou a 'Ação Principal'.
3. Data Import: Trouxe dados reais para a plataforma.
4. Collaboration: Convidou ao menos 2 colegas de time.`
        }
    ];

    return (
        <article className="w-full mx-auto">
            {/* Hero Banner */}


            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="O Novo Playbook do SaaS">
                    <p>
                        A era do "Fale com Vendas" para conhecer um software acabou. No modelo PLG (Product-Led Growth), seu trial não é um custo, é o seu melhor vendedor. O desafio é: como transformar o usuário gratuito que está "brincando" em um contrato corporativo de alto valor?
                    </p>
                    <p className="mt-4">
                        A resposta está na <strong>transição fluida</strong> entre o uso individual e a expansão para o time. Se você não captura o sinal de uso agora, seu concorrente o fará.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (SaaS PLG)"
                    items={[
                        { title: "Self-Serve is King", description: "O usuário quer resolver o problema sozinho às 2 da manhã de um domingo. Se ele precisar esperar até segunda para falar com alguém, ele vai pro concorrente." },
                        { title: "Métricas de Uso > Cargo", description: "O cargo do lead importa menos do que a frequência com que ele loga. Foque nos 'Power Users'." },
                        { title: "Fricção Progressiva", description: "Peça pouco no início (apenas email) e vá pedindo mais dados conforme o usuário vê valor no produto." },
                        { title: "Growth Loops", description: "Torne o produto viral por natureza. Se o compartilhamento de um relatório atrai novos usuários, seu crescimento é auto-sustentável." }
                    ]}
                />

                <ConceptDefinition
                    concept="Product-Led Sales (PLS)"
                    definition="É a evolução do PLG. É quando o time de vendas usa dados de uso real do produto para abordar os logos de maior potencial com uma oferta personalizada."
                    amateurView="Deixar o site rodando e esperar o dinheiro entrar."
                    proView="Identificar usuários 'quentes' no trial e entrar com consultoria humana para fechar o contrato Enterprise."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">O Funil de Conversão SaaS PLG</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-16 not-prose">
                    {strategies.map((strategy, index) => (
                        <div key={index} className="bg-white p-8 border border-zinc-200 rounded animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                            <h4 className="font-bold text-lg mb-4 text-black uppercase tracking-tight">{strategy.title}</h4>
                            <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{strategy.description}</p>
                            <div className="text-xs font-mono text-revgreen bg-revgreen/5 p-3 border-l border-revgreen">
                                Benchmark: {strategy.example}
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-zinc-900 mb-8 flex items-center gap-3">
                    <Mail className="w-6 h-6 text-revgreen" />
                    Scripts de Conversão (Vendas Produt-Led)
                </h2>

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
                            <div className="p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-600 bg-white">
                                {template.body}
                            </div>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Quando o PLG é uma Armadilha"
                    flags={[
                        "Produto complexo demais que exige integração manual de 4 semanas.",
                        "Ticket médio muito baixo (< $10/mês) sem estratégia de 'unlimited users'.",
                        "Depender apenas de ads caros (Meta/Google) sem canais orgânicos ou virais.",
                        "Focar em 'Signups' ignorando a 'Taxa de Ativação' (usuarios reais)."
                    ]}
                />

                <StrategicConclusion
                    title="Pronto para virar a chave para PLG?"
                    description="Não cometa o erro de apenas liberar um trial grátis e esperar pelo milagre. A transição para PLG exige instrumentação de dados e uma cultura de produto que vendas tradicionais não possuem. Nós ajudamos na arquitetura completa."
                    ctaText="Consultoria SaaS PLG"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default SaaSPLGArticle;
