import { useState } from 'react';
import { ArrowRight, Settings, Users, Database, BarChart3, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const RevOpsFrameworkArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const pillars = [
        {
            title: "Process (O Processo Unificado)",
            description: "Não existe 'processo de Marketing' e 'processo de Vendas'. Existe o Processo do Cliente (Customer Journey). RevOps garante que o handoff seja invisível.",
            icon: <Settings className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Data (A Verdade Única)",
            description: "Fim das planilhas de excel paralelas. RevOps centraliza a verdade no CRM. Se não está no CRM, não aconteceu.",
            icon: <Database className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Technology (O Stack Integrado)",
            description: "Chega de 'Frankenstein Tech'. Ferramentas devem conversar entre si. A automação deve fluir dados de ponta a ponta.",
            icon: <Users className="w-6 h-6 text-revgreen" />
        }
    ];

    const templates = [
        {
            name: "RevOps Audit Checklist",
            subject: "Diagnóstico Rápido de Maturidade",
            body: `DATA INTEGRITY:
[ ] Os campos de "Motivo de Perda" são padronizados no CRM?
[ ] Marketing consegue ver quais leads viraram receita (Atribuição)?
[ ] Customer Success sabe o que foi prometido na Venda?

PROCESS ALIGNMENT:
[ ] Existe um SLA escrito e assinado entre Mkt e Sales?
[ ] A definição de MQL e SQL é a mesma para todos os times?
[ ] Existe uma reunião semanal de Revenue (Smarketing)?

TECH STACK:
[ ] As ferramentas trocam dados em tempo real (API/Native)?
[ ] Existe documentação de como usar cada ferramenta?`
        },
        {
            name: "Job Description: Head de RevOps",
            subject: "Descrição para Contratação",
            body: `RESPONSABILIDADES:
- Unificar a visão de dados de Marketing, Vendas e CS.
- Gerenciar e otimizar o Tech Stack (HubSpot, Salesforce, etc).
- Garantir a integridade dos dados (Data Hygiene).
- Criar e manter Playbooks operacionais atualizados.
- Analisar o funil end-to-end para encontrar gargalos de conversão.

REQUISITOS:
- Visão sistêmica (entender como um mudaça no topo afeta o churn).
- Domínio de CRM (Admin level).
- Perfil analítico (SQL/Excel avançado é diferencial).
- Habilidade política para alinhar VP de Marketing e VP de Vendas.`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="A Realidade">
                    Marketing culpa Vendas por não fechar. Vendas culpa Marketing pela qualidade dos leads. CS culpa Vendas por prometer o impossível. RevOps é o fim dessa guerra civil.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Silos Destroem Receita", description: "Quando cada time tem seus próprios dados e metas conflitantes, o cliente sente a fricção e vai embora." },
                        { title: "Dados > Opinião", description: "RevOps tira a emoção da sala de reunião. Os números mostram onde o gargalo está, sem apontar dedos." },
                        { title: "Tech Stack Saneado", description: "Mais ferramentas não significam mais vendas. RevOps simplifica e integra o que você já tem." },
                        { title: "Eficiência Operacional", description: "O objetivo de RevOps é remover atrito. Vendedores devem vender, não preencher planilha manual." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-zinc-900 mt-0 text-3xl md:text-4xl">RevOps: A Estrutura de Crescimento Previsível</h2>
                    <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                        Revenue Operations (RevOps) não é apenas um cargo novo da moda. É uma mudança estratégica que alinha Marketing, Vendas e Customer Success sob uma única métrica de verdade: a Receita.
                    </p>
                </div>

                <ConceptDefinition
                    concept="O que é RevOps?"
                    definition="A unificação estratégica de Processos, Dados e Tecnologia em todas as equipes que geram receita, focada em maximizar o LTV (Lifetime Value) e a eficiência operacional."
                    amateurView="Alguém para cuidar do CRM e fazer relatórios."
                    proView="O sistema operacional do crescimento da empresa, garantindo que o motor de receita rode sem atritos."
                />

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-revgreen" />
                    Os 3 Pilares de RevOps
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-16 not-prose">
                    {pillars.map((pillar, index) => (
                        <Card key={index} className="p-6 border border-zinc-200 shadow-sm transition-all group overflow-hidden relative bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {pillar.icon}
                            </div>
                            <div className="mb-4">
                                {pillar.icon}
                            </div>
                            <h3 className="font-bold text-lg text-zinc-900 mb-2">{pillar.title}</h3>
                            <p className="text-zinc-600 text-sm leading-relaxed">{pillar.description}</p>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de que você precisa de RevOps ONTEM"
                    flags={[
                        "Você tem contagens de leads diferentes no Marketing Automation e no CRM.",
                        "Não é possível dizer o ROI exato de uma campanha de marketing específica.",
                        "Vendedores gastam mais de 20% do tempo fazendo tarefas administrativas.",
                        "O Churn é alto e ninguém sabe exatamente o motivo raiz (apenas 'preço')."
                    ]}
                />

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Database className="w-6 h-6 text-revgreen" />
                    Recursos de Implementação
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-zinc-200 shadow-sm transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-revgreen" />
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
                    title="Chega de operar no Escuro"
                    description="Sem RevOps, seu crescimento é sorte. Com RevOps, é engenharia. Vamos construir sua máquina de receita?"
                    ctaText="Diagnóstico de Operação RevOps"
                    leadMagnetId="checklist"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default RevOpsFrameworkArticle;
