import { useState } from 'react';
import { Target, Users, Repeat, ShieldCheck, BarChart3, Handshake, CheckCircle2, Copy, Combine, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const IntegracaoMktVendasArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Fonte Única da Verdade (Data Alignment)",
            description: "Marketing e Vendas devem olhar para o mesmo dashboard. Se os números não batem, a confiança entre os times morre.",
            example: "Dashboard unificado onde o 'Custo por SQL' e 'Win Rate' são as métricas principais para ambos.",
            results: "Fim das discussões sobre 'qualidade vs quantidade'."
        },
        {
            title: "Feedback Loop Reverso (CS → MKT)",
            description: "O sucesso do cliente deve informar ao marketing quem é o cliente ideal. Pare de atrair quem cancela contrato em 3 meses.",
            example: "CS identificou churn alto no Varejo; MKT pausou campanhas para esse nicho e focou em Indústria.",
            results: "+15% na retenção (LTV) no primeiro semestre."
        },
        {
            title: "SLA (Service Level Agreement) Real",
            description: "Um contrato claro entre Marketing (Volume e Qualidade) e Vendas (Tempo de Resposta e Cadência).",
            example: "Leads 'A' devem ser contatados em até 5 minutos. Leads 'B' entram em fluxo de nutrição.",
            results: "Aumento de 21% na conversão de MQL para SQL."
        }
    ];

    const templates = [
        {
            name: "SLA Framework (MKT + Sales)",
            body: `ACORDO DE NÍVEL DE SERVIÇO (SLA)

1. DEFINIÇÃO DE MQL (Marketing Qualified Lead):
- Cargo: Diretor ou C-Level
- Setor: SaaS ou Tecnologia
- Ação: Pediu demo ou baixou material de fundo de funil

2. COMPROMISSO DO MARKETING:
- Entregar no mínimo 50 MQLs/mês
- Enriquecer dados (Linkedin, Tech Stack) antes de passar

3. COMPROMISSO DE VENDAS:
- Tocar todo MQL em até 1 hora útil
- Mínimo de 6 tentativas de contato em 5 dias
- Motivar descarte no CRM obrigatoriamente (Não "Lost", mas "Por quê?")`
        },
        {
            name: "Feedback Loop Protocol",
            body: `PAUTA DA REUNIÃO QUINZENAL (MKT + VENDAS):

1. ANÁLISE DE QUALIDADE (Vendas fala, Marketing escuta):
- "Os leads da campanha X reclamaram que..."
- "O lead Y estava pronto, excelente perfil."

2. ANÁLISE DE MATERIAIS (Marketing fala, Vendas escuta):
- "Criamos esse case novo, vocês estão usando?"
- "O discurso de vendas está alinhado com a nova LP?"

3. AÇÕES CORRETIVAS:
- Pausar palavra-chave [Z]
- Ajustar cadência de email [W]`
        }
    ];

    const anatomy = [
        {
            label: "MARKETING",
            title: "Atração com Foco em Receita",
            desc: "Marketing não entrega leads, entrega receita futura. O foco muda de 'Volume de MQL' para 'Pipeline Gerado'.",
            metrics: "CAC, Pipeline Generado, Custo por Oportunidade"
        },
        {
            label: "SALES",
            title: "Conversão Consultiva",
            desc: "Vender para o cliente certo. Sem overpromise para fechar a qualquer custo (o que gera churn depois).",
            metrics: "Win Rate, Ciclo de Venda, ACV (Average Contract Value)"
        },
        {
            label: "CS",
            title: "Retenção e Expansão",
            desc: "Onde o lucro real acontece. CS realimenta Marketing com insights sobre o ICP real e Vendas com Upsell.",
            metrics: "NRR (Net Revenue Retention), Churn, NPS"
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                {/* USER PROVIDED HEADLINE CONTEXT */}
                <StrategicContext label="O Problema Real">
                    <p>
                        O problema não é o tráfego. O problema não é o produto.
                    </p>
                    <p className="mt-4">
                        O verdadeiro gargalo está na falta de conexão entre os seus times. Imagine que sua empresa capta leads, investe em tráfego pago, gera oportunidades — mas as vendas não escalam e os clientes vão embora.
                    </p>
                    <p className="mt-4 font-bold text-gray-900">
                        Isso não é azar. É desalinhamento.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (RevOps)"
                    items={[
                        { title: "Silos Destroem Valor", description: "Quando Marketing, Vendas e CS operam isolados, você paga o CAC três vezes e perde o cliente na passagem de bastão." },
                        { title: "Revenue Operations (RevOps)", description: "A metodologia que unifica todos os times sob uma única meta: Receita. Não existe 'meta de marketing', existe meta da empresa." },
                        { title: "Dados Unificados", description: "Se Vendas usa Salesforce e Marketing usa HubSpot sem integração bi-direcional, você está voando às cegas." },
                        { title: "O Cliente é Um Só", description: "A jornada do cliente não para quando ele assina o contrato. É aí que ela realmente começa." }
                    ]}
                />

                <ConceptDefinition
                    concept="Revenue Operations (RevOps)"
                    definition="A integração estratégica de Marketing, Vendas e Customer Success através de processos, tecnologia e dados compartilhados para impulsionar o crescimento de receita."
                    amateurView="Cada departamento cuida do seu quadrado. Marketing gera lead, Vendas fecha, CS atende."
                    proView="Uma máquina unificada. O feedback de CS ajusta o anúncio de Marketing. O CRM de Vendas informa o onboarding de CS."
                />

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Por que integrar é o maior ativo estratégico?</h2>
                <p>
                    A maioria das empresas opera como uma corrida de revezamento onde os corredores (times) derrubam o bastão (cliente) a cada troca. A integração elimina esses gaps.
                </p>

                <div className="flex flex-col md:flex-row gap-8 my-10 bg-gray-50 p-8 rounded-xl border border-gray-100 not-prose">
                    <div className="flex-1 text-center md:text-left">
                        <div className="text-4xl font-black text-gray-900 mb-1">19%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Crescimento Mais Rápido</div>
                    </div>
                    <div className="flex-1 text-center md:text-left md:border-l md:border-gray-200 md:pl-8">
                        <div className="text-4xl font-black text-revgreen mb-1">15%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Maior Lucratividade</div>
                    </div>
                </div>

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <Combine className="w-6 h-6 text-revgreen" />
                    O Ciclo Unificado (The Revenue Engine)
                </h2>
                <div className="not-prose grid gap-4 mb-16">
                    {anatomy.map((item, i) => (
                        <div key={i} className="group bg-white hover:bg-gray-50 border border-gray-200 p-6 rounded-lg transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-revgreen transition-colors"></div>
                            <div className="flex flex-col md:flex-row gap-6 md:items-center ml-2">
                                <span className="text-xs font-bold text-gray-400 w-24 shrink-0 uppercase tracking-wider group-hover:text-revgreen transition-colors">
                                    {item.label}
                                </span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed m-0">{item.desc}</p>
                                </div>
                                <div className="md:w-48 shrink-0 md:text-right mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">KPI Principal</span>
                                    <span className="text-xs font-bold text-gray-900 font-mono">{item.metrics}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <RedFlags
                    title="Sintomas de Desalinhamento Crônico"
                    flags={[
                        "Marketing reclama que Vendas não aborda os leads (e Vendas diz que são ruins).",
                        "Taxa de Churn alta nos primeiros 90 dias (Venda desalinhada da entrega).",
                        "Ninguém sabe dizer qual canal de marketing traz os clientes com maior LTV.",
                        "Reuniões de diretoria são uma batalha de culpas, não de soluções."
                    ]}
                />

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <Handshake className="w-6 h-6 text-revgreen" />
                    Como Unificar na Prática (RevOps Plays)
                </h2>

                <div className="space-y-0 mb-16 border border-gray-200 divide-y divide-gray-200">
                    {strategies.map((strategy, index) => (
                        <div key={index} className="bg-white p-8 group hover:bg-gray-50 transition-colors">
                            <h3 className="text-base font-bold text-black mb-3 flex items-center gap-3 uppercase tracking-wider">
                                <span className="text-revgreen font-mono">0{index + 1}.</span>
                                {strategy.title}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed font-light">
                                {strategy.description}
                            </p>
                            <div className="pl-4 border-l-2 border-revgreen/20">
                                <p className="text-gray-500 text-xs font-mono italic">"{strategy.example}"</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <Users className="w-6 h-6 text-revgreen" />
                    Templates de Alinhamento
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

                <StrategicConclusion
                    title="Pare de otimizar silos. Otimize a Receita."
                    description="A Integração não é um projeto de uma vez só. É uma cultura. É garantir que cada lead gerado pelo marketing tenha a melhor experiência de venda e o maior sucesso possível no pós-venda."
                    ctaText="Diagnóstico de Alinhamento (RevOps)"
                    leadMagnetId="checklist"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default IntegracaoMktVendasArticle;
