
import { useState } from 'react';
import { Rocket, Zap, Users, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Play, MousePointerClick, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const PLGStartupsArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "O 'Aha Moment' em < 5 Minutos",
            description: "Seu usuário leva 2 dias para configurar a ferramenta? Ele vai dar churn. O valor deve ser entregue na primeira sessão.",
            example: "O Canva permite baixar um design pronto em 3 cliques, sem cadastro de cartão.",
            results: "Ativação sobe de 15% para 40%."
        },
        {
            title: "Barreiras de Fricção Zero",
            description: "Remova 'Fale com Vendas', 'Cartão de Crédito' e 'Formulários Longos'. O produto deve se vender sozinho.",
            example: "Slack não pede CNPJ nem telefone. Você cria o workspace e convida o time.",
            results: "CAC zero na entrada."
        },
        {
            title: "Viral Loops (K-Factor)",
            description: "O produto fica melhor se eu convidar amigos? Se não, você não tem network effect.",
            example: "O Dropbox dava 500MB extra para cada amigo indicado. O Zoom é inútil se você usar sozinho.",
            results: "Crescimento exponencial orgânico."
        }
    ];

    const templates = [
        {
            name: "Audit de Onboarding (PLG Score)",
            subject: "Diagnóstico de Fricção",
            body: `1. Time to Value (TTV):
- Cronometre: Quanto tempo leva do "Sign Up" até o "Primeiro Sucesso"?
- Meta PLG: < 7 minutos.

2. Fricção de Setup:
- Quantos campos no formulário? (Meta: < 3)
- Exige email corporativo? (Sim/Não)
- Exige cartão? (Bloqueador fatal em B2B Latam)

3. Self-Service Completo:
- O usuário consegue fazer upgrade/downgrade sem falar com humano?
- A documentação resolve 90% dos tickets?`
        },
        {
            name: "Email de Ativação (Behavior Based)",
            subject: "Trigger: Usuário fez cadastro mas não ativou",
            body: `Assunto: Ficou faltando algo?

Oi [Nome],

Vi que você criou sua conta mas ainda não [Ação Chave - Ex: criou seu primeiro dashboard].

Preparei um template pronto para você não começar do zero. Clique aqui para usar:
[Link Direto para o Template]

Se tiver dúvida técnica, responda esse email (cai direto no meu celular).

Abs,
[Founder]`
        }
    ];

    const anatomy = [
        { label: "ACQ", title: "Aquisição", desc: "O produto é a isca. SEO e Conteúdo trazem o usuário para testar grátis.", icon: <Users className="w-5 h-5 text-purple-600" /> },
        { label: "ACT", title: "Ativação", desc: "O usuário sente o valor (Aha Moment) antes de pagar.", icon: <Zap className="w-5 h-5 text-yellow-500" /> },
        { label: "RET", title: "Retenção", desc: "O produto cria hábito. O uso se torna diário/semanal.", icon: <TrendingUp className="w-5 h-5 text-blue-500" /> },
        { label: "REF", title: "Referral", desc: "O usuário ama tanto que convida outros (Growth Loop).", icon: <Rocket className="w-5 h-5 text-revgreen" /> }
    ];

    const checklist = [
        "Freemium ou Free Trial definido (e fácil de entender)",
        "Onboarding automatizado (Tooltips/Checklists)",
        "Pricing público e transparente (Self-checkout)",
        "Documentação de ajuda robusta (Help Center)",
        "Comunidade de usuários ativa",
        "Métricas de produto (Mixpanel/Amplitude) instaladas",
        "PQL (Product Qualified Lead) definido para Vendas abordar"
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="PLG no Brasil é Diferente">
                    <p>
                        Cuidado ao copiar o playbook do Slack ou Zoom cegamente. No Brasil (e Latam), o modelo <strong>Product-Led Sales (PLS)</strong> funciona melhor que o PLG puro.
                    </p>
                    <p className="mt-4">
                        Isso significa: Deixe o usuário testar o produto (PLG), mas coloque um vendedor consultivo (Sales) para fechar o contrato Enterprise. O brasileiro gosta de "falar com alguém" antes de passar o cartão corporativo.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (PLG Tropicalizado)"
                    items={[
                        { title: "Show, don't Tell", description: "Ninguém quer ler sobre seu software. Eles querem clicar nele. Sua Home Page deve ter um botão 'Testar Agora' ou 'Ver Demo Interativa', não 'Fale com Consultor'." },
                        { title: "O Produto é o Vendedor", description: "Se o seu produto é difícil de usar, contratatar mais vendedores não resolve. Você precisa de designers de UX, não de SDRs." },
                        { title: "Aha Moment", description: "Se o usuário não entender o valor do seu produto nos primeiros 5 minutos, ele nunca mais volta. Otimize o 'Time to Value' obsessivamente." },
                        { title: "PQL > MQL", description: "Pare de qualificar por Cargo/Empresa (MQL). Qualifique por Uso (PQL). Quem usa seu produto todo dia é 10x mais propenso a comprar." }
                    ]}
                />

                <ConceptDefinition
                    concept="Product-Led Growth (PLG)"
                    definition="É uma estratégia onde o PRODUTO é o principal motor de aquisição, retenção e expansão. O marketing traz para o produto, o produto converte o usuário."
                    amateurView="Deixa o produto grátis que o usuário compra sozinho."
                    proView="O grátis é um canal de aquisição. O produto deve ter gatilhos psicológicos que forçam a conversão para o pago (Seat limits, Features, Storage)."
                />

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">A Anatomia do Crescimento pelo Produto</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-16 not-prose">
                    {anatomy.map((item, i) => (
                        <div key={i} className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-revgreen/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-gray-900 scale-150 transform origin-top-right">
                                    {item.icon}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-xs font-extrabold text-revgreen tracking-widest uppercase mb-4">
                                    {item.label}
                                </div>

                                <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-black transition-colors">
                                    {item.title}
                                </h4>

                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-revgreen to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </div>
                    ))}
                </div>

                <div className="bg-emerald-50 border-l-4 border-revgreen p-8 my-12">
                    <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        PQL: O Novo Padrão de Qualificação
                    </h3>
                    <p className="text-emerald-800 font-medium leading-relaxed">
                        No modelo tradicional, Marketing envia MQLs (leads que baixaram um PDF) para Vendas. No PLG, focamos em <strong>Product Qualified Leads (PQLs)</strong>: usuários que já estão dentro do produto, atingiram o "Aha Moment" e exibem sinais claros de intenção de compra.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/50 p-4 rounded border border-emerald-100 italic">
                            "Marketing traz a curiosidade, o Produto traz a convicção."
                        </div>
                        <div className="bg-white/50 p-4 rounded border border-emerald-100 italic">
                            "Venda de Expansão em PQL é 5x mais barata que aquisição de MQL."
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3 Pilares para Implementar Hoje</h2>
                <div className="space-y-12 mb-16 mt-8">
                    {strategies.map((strategy, index) => (
                        <div key={index} className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
                                {strategy.title}
                            </h3>
                            <p className="text-gray-700 mb-6 font-medium">
                                {strategy.description}
                            </p>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Benchmark</h4>
                                <p className="text-gray-600 text-sm font-mono leading-relaxed italic">"{strategy.example}"</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 font-bold">
                                <TrendingUp className="w-4 h-4" />
                                Resultado: {strategy.results}
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <MousePointerClick className="w-6 h-6 text-revgreen" />
                    Templates de Ativação
                </h2>

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
                            <div className="p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-600 bg-white">
                                {template.body}
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="my-16 bg-zinc-900 text-white p-8 rounded-xl not-prose">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        Checklist: Você está pronto para PLG?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {checklist.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 border border-white/10 rounded bg-white/5">
                                <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                                <span className="text-sm font-medium text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <RedFlags
                    title="Onde o PLG Falha"
                    flags={[
                        "Ticket Médio Alto (> 50k/ano): Ninguém compra isso no cartão de crédito sem falar com vendas. Use Enterprise Sales.",
                        "Produto Complexo: Se precisa de 2 meses de implementação (Setup), PLG não funciona. Crie uma versão 'Lite'.",
                        "Falta de Suporte: PLG não significa 'Sem Suporte'. Significa suporte escalável (Chat, Help Center, AI).",
                        "Métricas de Vaidade: Número de Signups não paga conta. Foque em Usuários Ativos (MAU) e Receita (MRR)."
                    ]}
                />

                <StrategicConclusion
                    title="Não existe Bala de Prata"
                    description="PLG não é religião. É um canal de distribuição. As maiores empresas do mundo (Hubspot, Slack, Atlassian) usam PLG para entrar e Vendas para expandir. O segredo está no híbrido."
                    ctaText="Consultoria de Product-Led Growth"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default PLGStartupsArticle;
