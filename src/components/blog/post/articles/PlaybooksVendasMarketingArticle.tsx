
import { useState } from 'react';
import { Layers, Target, CheckCircle2, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const PlaybooksVendasMarketingArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "Playbook de Outbound (Caça Ativa)",
            description: "Para contas Enterprise, esperar leads inbound é suicídio. Você precisa ir até eles.",
            example: "Cadência 14 Dias: Email 1 (Contexto) -> LinkedIn (Conexão) -> Fone 1 -> Email 2 (Case) -> Fone 2 -> Breakup.",
            results: "Pipeline previsível, independente de updates do algoritmo do Google ou Ads."
        },
        {
            title: "Playbook de Handoff (A Passagem de Bastão)",
            description: "Onde 40% das oportunidades morrem: na transição entre Marketing (MQL) e Vendas (SQL).",
            example: "SDR agenda, preenche 'Dores', 'Stack Atual' e 'Decisor' no CRM. Executivo só aceita se campos estiverem preenchidos.",
            results: "Fim do 'lead desqualificado' na agenda do Closer."
        },
        {
            title: "Playbook de Nurture (O 'Não' Temporário)",
            description: "90% dos leads não estão prontos para comprar hoje. Se você os descarta, está jogando dinheiro fora.",
            example: "Lead disse 'sem budget' -> Automação coloca em trilha de conteúdo educativa por 6 meses -> Reavaliação automática.",
            results: "Reaquisição de leads 'mortos' com Custo de Aquisição (CAC) zero."
        }
    ];

    const templates = [
        {
            name: "SLA (Service Level Agreement) Marketing <-> Vendas",
            subject: "Contrato de Performance Interno",
            body: `DEFINIÇÃO DE MQL (O que Marketing deve entregar):
1. Perfil: Cargo C-Level/Director em empresa > 50 funcionários.
2. Interesse: Pediu Demo OU baixou Material Rico + Visitou Página de Preços.
3. Dados: Email corporativo e telefone validados.

COMPROMISSO DE VENDAS (SLA de Atendimento):
1. Tempo de Resposta: < 1 hora útil após virada no CRM.
2. Persistência: Mínimo de 8 tentativas de contato (multicanal) em 10 dias.
3. Feedback: Motivo de descarte (Perdido/Desqualificado) preenchido obrigatoriamente.

RITUAL DE GESTÃO:
- Reunião quinzenal (Smarketing) para revisar qualidade dos leads vs taxa de contato.`
        },
        {
            name: "Estrutura Universal de Playbook",
            subject: "Template para Documentar Processos",
            body: `NOME DO PROCESSO: [Ex: Qualificação de Inbound SDR]

1. OBJETIVO (WHY)
- Qualificar leads MQLs para agendar reuniões apenas com decisores que tenham fit e budget.

2. GATILHO (WHEN)
- Lead atinge Score > 80 no Hubspot E status muda para "MQL".

3. ATORES (WHO)
- Responsável: SDR Pleno
- Suporte: Sales Ops

4. FLUXO DE AÇÃO (HOW)
- Passo 1: Enriquecimento de dados (LinkedIn/Apollo) - max 5 min.
- Passo 2: Ligação 1 (Script Abertura Rápida).
- Passo 3: Se não atender -> Email 1 (Tentativa de Contato) + WhatsApp (Áudio curto).
- Passo 4: Se atender -> Framework GPCT (Goals, Plans, Challenges, Timeline).

5. DEFINIÇÃO DE FEITO (DONE)
- Reunião agendada na agenda do Executivo + Notes no CRM completas.

6. MATERIAIS DE APOIO
- Link para Script de Call
- Link para Matriz de Objeções`
        }
    ];

    const anatomy = [
        { label: "TRIGGER", title: "O Gatilho", desc: "Todo processo precisa de um início claro (Ex: Lead virou MQL, Cliente abriu Ticket)." },
        { label: "INPUTS", title: "As Entradas", desc: "Informações necessárias para começar. Sem dados, não há execução." },
        { label: "ACTION", title: "A Execução", desc: "O passo a passo 'idiot-proof'. Checklists, scripts e regras de decisão." },
        { label: "OUTPUT", title: "A Saída (DoD)", desc: "Definição de Feito (Definition of Done) inegociável." }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="O Problema Invisível">
                    <p>
                        Escalar uma operação de receita sem playbooks é como tentar construir um arranha-céu sem planta. Você pode até subir alguns andares na base do talento individual e do esforço heróico, mas a estrutura eventualmente colapsa sob o próprio peso.
                    </p>
                    <p className="mt-4">
                        A maioria dos fundadores acredita que precisa contratar "vendedores melhores". A verdade é que eles precisam de <strong>processos melhores</strong>. Playbooks não tiram a criatividade do time; eles eliminam a necessidade de reinventar a roda todo dia, liberando a energia mental para o que realmente importa: fechar negócios complexos.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="O Que Você Vai Aprender (Resumo Executivo)"
                    items={[
                        { title: "Processo > Talento", description: "Um time mediano com processos excelentes vence consistentemente um time de estrelas sem direção." },
                        { title: "O SLA é a Lei", description: "O acordo entre Marketing e Vendas é o documento mais importante da empresa. Se quebrar, a receita para." },
                        { title: "Documento Vivo", description: "Um playbook impresso na gaveta é lixo. Playbooks devem viver no CRM e ser atualizados trimestralmente." },
                        { title: "Onboarding Acelerado", description: "Com bons playbooks, um novo vendedor rampa em 30 dias. Sem eles, leva 6 meses e custa o dobro." }
                    ]}
                />

                <ConceptDefinition
                    concept="O que é um Playbook de Vendas?"
                    definition="Um playbook não é um PDF de treinamento ou um script engessado. É o código-fonte da sua operação de receita. É um conjunto de regras, processos e frameworks que garantem que o resultado (receita) não seja um acidente, mas uma consequência previsível."
                    amateurView="Um documento que o RH entrega no primeiro dia e ninguém nunca mais lê."
                    proView="Um sistema operacional vivo, integrado ao CRM, que guia cada ação do vendedor desde a prospecção até o fechamento."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">Por que construir Playbooks agora?</h2>
                <p>
                    O mercado B2B mudou. Em 2025, a confiança é baixa e a exigência é alta. Seus compradores não têm tempo para amadores. Eles esperam uma experiência de compra fluida, consultiva e rápida.
                </p>
                <p>
                    Se cada vendedor responde de um jeito, se o preço varia dependendo do humor do dia, ou se o handoff do Marketing para Vendas é um buraco negro, você não tem uma empresa; você tem um aglomerado de freelancers trabalhando no mesmo escritório.
                </p>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 not-prose">
                    <div className="bg-zinc-900 p-6 rounded-lg text-white border border-zinc-800">
                        <div className="text-4xl font-mono font-bold text-revgreen mb-2">-40%</div>
                        <div className="text-sm text-zinc-400 uppercase tracking-wider">Tempo de Ramp-up de Novos Contratados</div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-lg text-white border border-zinc-800">
                        <div className="text-4xl font-mono font-bold text-revgreen mb-2">+28%</div>
                        <div className="text-sm text-zinc-400 uppercase tracking-wider">Aumento na Conversão do Funil</div>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-lg text-white border border-zinc-800">
                        <div className="text-4xl font-mono font-bold text-revgreen mb-2">100%</div>
                        <div className="text-sm text-zinc-400 uppercase tracking-wider">Propriedade Intelectual da Empresa (Não do Vendedor)</div>
                    </div>
                </div>

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Layers className="w-6 h-6 text-revgreen" />
                    Anatomia de um Playbook Vencedor
                </h2>
                <p className="text-zinc-700 mb-8 max-w-2xl">
                    Um playbook deve ser acionável. Esqueça a teoria. Fobque na estrutura de engenharia: <strong>Input -&gt; Processamento -&gt; Output</strong>.
                </p>

                <div className="not-prose grid gap-4 mb-16">
                    {anatomy.map((item, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-white border border-zinc-200 rounded-lg shadow-sm transition-shadow relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-200 group-hover:bg-revgreen transition-colors"></div>
                            <div className="md:w-32 shrink-0 flex flex-col justify-center">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.label}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900 text-lg mb-2 group-hover:text-black transition-colors">{item.title}</h4>
                                <p className="text-zinc-600 text-sm leading-relaxed m-0">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Target className="w-6 h-6 text-revgreen" />
                    Os 3 Pilares Indispensáveis
                </h2>

                <div className="space-y-12 mb-16">
                    {strategies.map((strategy, index) => (
                        <div key={index} className="bg-zinc-50 p-8 rounded-xl border border-zinc-100">
                            <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
                                {strategy.title}
                            </h3>
                            <p className="text-zinc-700 mb-6 font-medium">
                                {strategy.description}
                            </p>
                            <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm mb-4">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Exemplo Prático</h4>
                                <p className="text-zinc-600 text-sm font-mono leading-relaxed">{strategy.example}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                Resultado: {strategy.results}
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-revgreen" />
                    Templates Prontos para Copiar e Colar
                </h2>
                <p className="mb-8">
                    Para te ajudar a começar agora, aqui estão dois templates que usamos internamente na RevHackers. Copie e adapte para o seu cenário.
                </p>

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

                <RedFlags
                    title="Seu Playbook está Falhando?"
                    flags={[
                        "Você ouve frequentemente: 'Isso depende de com quem você fala' (Inconsistência)",
                        "A previsão de vendas erra por mais de 20% todo mês (Imprevisibilidade)",
                        "Novos vendedores demoram mais de 3 meses para bater a primeira meta (Ramp-up lento)",
                        "Marketing e Vendas se culpam mutuamente pela falta de leads ou falta de fechamento (SLA quebrado)"
                    ]}
                />

                <StrategicConclusion onCTAClick={onCTAClick} />

            </div>
        </article>
    );
};

export default PlaybooksVendasMarketingArticle;
