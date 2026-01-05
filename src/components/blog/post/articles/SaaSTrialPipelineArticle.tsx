
import { useState } from 'react';
import { Mail, Zap, XCircle, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';
import ArticleCTA from '../components/ArticleCTA';

const SaaSTrialPipelineArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const conversionKillers = [
        {
            title: "O 'Empty State' Mortal",
            description: "O usuário entra e vê dashboards vazios. Ele não vai gastar 2 horas configurando.",
            fix: "Use 'Dummy Data' ou Templates prontos no primeiro login."
        },
        {
            title: "Feature Dumping",
            description: "Mostrar 50 botões no primeiro acesso.",
            fix: "Esconda tudo que não é essencial para o 'Primeiro Valor' (Core Action)."
        },
        {
            title: "O Email Genérico de 'Bem-vindo'",
            description: "'Obrigado por se cadastrar'. Isso é lixo.",
            fix: "Envie um email pessoal do Founder perguntando: 'O que te trouxe aqui hoje?'"
        }
    ];

    const templates = [
        {
            name: "Email de 'Mão Estendida' (Vendas)",
            subject: "Vi que você está testando o [Nome da Feature]",
            body: `Oi [Nome],

O sistema me avisou que você acabou de usar a funcionalidade de [Feature X].

Muitos usuários travam nessa etapa porque [Razão comum - ex: não configuraram a integração Y].

Gravei um vídeo de 30s mostrando como resolver isso rápido: [Link do Loom]

Se quiser ajuda para configurar o resto da conta, me avisa?

Abs,
[Seu Nome]`
        },
        {
            name: "Email de Fim de Trial (Ultimato)",
            subject: "Sua conta será congelada em 24h",
            body: `[Nome],

Seu trial acaba amanhã.

Não quero que você perca o trabalho que já fez:
- [X] Projetos criados
- [Y] Dados importados

Para manter tudo ativo e desbloquear o [Benefício Premium], finalize aqui:
[Link Checkout]

Se não for o momento, sem problemas. Seus dados ficarão salvos por 30 dias.

Abs,
[Founder]`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="O Cemitério dos Trials">
                    <p className="mb-4">
                        A maioria das empresas SaaS celebra o "Signup" como vitória. Errado. Signup é apenas o começo do custo de aquisição (CAC). Só existe vitória quando o usuário paga (Paid) ou usa de verdade (Active). Seus trials estão apodrecendo no pipeline porque você trata todos igual, oferecendo a mesma experiência genérica para o estudante curioso e para o CTO com orçamento aprovado.
                    </p>
                    <p>
                        <strong>A Realidade Brutal:</strong> 40-60% dos usuários que se cadastram no seu software trial gratuito usarão o produto uma única vez e nunca mais voltarão. A culpa não é deles. É do seu Onboarding que falhou em entregar o "Aha Moment" nos primeiros 5 minutos.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (Trial Conversion)"
                    items={[
                        { title: "PQL é o novo MQL", description: "Pare de ligar para quem baixou ebook. Ligue para quem logou 3x esta semana e importou dados. Isso é um Product Qualified Lead." },
                        { title: "Time-to-Value Radical", description: "Se o usuário não ver valor em 5 minutos, ele deu churn. Elimine setups complexos do Day 1. Use 'Dummy Data'." },
                        { title: "Venda Híbrida (Product-Led Sales)", description: "Use automação para contas pequenas (Self-Serve) e intervenção humana cirúrgica para contas grandes (Enterprise). Não misture os playbooks." },
                        { title: "Aversão à Perda > Ganho Futuro", description: "É psicologicamente mais eficaz converter alguém ameaçando congelar o acesso ao trabalho já feito, do que prometendo 'benefícios premium' abstratos." }
                    ]}
                />

                <ConceptDefinition
                    concept="Product Qualified Lead (PQL)"
                    definition="Um lead que já usou o produto e atingiu gatilhos de comportamento que indicam alta propensão de compra. Diferente do MQL (que baixou conteúdo), o PQL já experimentou o valor."
                    amateurView="Qualquer um que fez trial grátis."
                    proView="Alguém que convidou 2 teammates, usou a feature core X e visitou a página de preços nas últimas 24h."
                />

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 tracking-tight">Os 4 Pilares da Arquitetura de Trial</h2>
                <div className="bg-white border-l-2 border-black pl-6 py-2 mb-12">
                    <ul className="space-y-6">
                        <li className="flex flex-col md:flex-row gap-2 md:gap-3">
                            <span className="font-bold text-black whitespace-nowrap text-sm uppercase tracking-wider">1. Welcome Logic:</span>
                            <span className="text-gray-600 font-light">Não pergunte "Nome da Empresa". Pergunte "O que você quer resolver hoje?". Segmente a experiência (CEO x Dev) desde o segundo zero.</span>
                        </li>
                        <li className="flex flex-col md:flex-row gap-2 md:gap-3">
                            <span className="font-bold text-black whitespace-nowrap text-sm uppercase tracking-wider">2. Empty State Zero:</span>
                            <span className="text-gray-600 font-light">Ninguém gosta de ver um dashboard vazio. Se o usuário não tem dados, forneça dados de exemplo (Dummy Data) para ele ver o 'Estado Final' do sucesso.</span>
                        </li>
                        <li className="flex flex-col md:flex-row gap-2 md:gap-3">
                            <span className="font-bold text-black whitespace-nowrap text-sm uppercase tracking-wider">3. Checklist Gamificado:</span>
                            <span className="text-gray-600 font-light">Substitua o tour guiado chato por uma checklist de progresso. "Complete 3 tarefas para ganhar +7 dias de trial". O ser humano odeia barras de progresso incompletas.</span>
                        </li>
                        <li className="flex flex-col md:flex-row gap-2 md:gap-3">
                            <span className="font-bold text-black whitespace-nowrap text-sm uppercase tracking-wider">4. Paywall Estratégico:</span>
                            <span className="text-gray-600 font-light">Deixe o usuário usar, mas bloqueie a exportação ou o compartilhamento. Deixe ele sentir o gosto, mas não deixe ele levar o jantar para casa sem pagar.</span>
                        </li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 tracking-tight">3 Assassinos de Conversão (Churn Silencioso)</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
                    {conversionKillers.map((item, i) => (
                        <Card key={i} className="p-6 bg-white border border-gray-200 hover:border-black transition-colors shadow-none rounded-sm">
                            <XCircle className="w-6 h-6 text-black mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 font-light leading-relaxed">{item.description}</p>
                            <div className="text-xs bg-gray-50 p-3 rounded-sm border border-gray-100 text-gray-900 font-medium flex gap-2 items-start">
                                <CheckCircle2 className="w-3 h-3 text-black shrink-0 mt-0.5" />
                                {item.fix}
                            </div>
                        </Card>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">O Framework de Resgate (Templates de Email)</h2>
                <p className="text-gray-600 mb-8">
                    Não espere os 14 dias acabarem para falar com o usuário. A maioria dos SaaS envia uma sequência baseada em tempo (Dia 1, Dia 3, Dia 7). Isso é preguiça. Intervenha baseada em <strong>comportamento (triggers)</strong>.
                </p>

                <div className="space-y-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-revgreen" />
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

                <RedFlags
                    title="Sinais que seu Trial está quebrado"
                    flags={[
                        "Activation Rate < 20%: Se de 100 signups, menos de 20 atingem o 'Aha Moment', seu onboarding é uma barreira, não uma ponte.",
                        "Zero emails durante o trial: O usuário esquece que você existe. Você precisa ser a consciência dele.",
                        "Pedir cartão no cadastro sem marca forte: Isso mata 90% da conversão no Brasil. Só faça se você for a Netflix ou tiver um produto commodity."
                    ]}
                />

                <StrategicConclusion
                    title="Trial não é 'Dê uma olhadinha'"
                    description="O Trial Gratuito é uma audição de alto risco. O usuário está investindo tempo para te testar. Se você não provar valor rápido (Quick Wins), ele te demite em silêncio. Trate cada signup como um lead quente pedindo ajuda."
                    ctaText="Agendar Diagnóstico de Onboarding"
                    leadMagnetId="checklist"
                    onCTAClick={onCTAClick}
                />
            </div>
        </article>
    );
};

export default SaaSTrialPipelineArticle;
