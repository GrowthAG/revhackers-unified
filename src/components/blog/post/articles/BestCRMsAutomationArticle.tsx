
import { useState } from 'react';
import { Database, Zap, ShieldCheck, CheckCircle2, Layers, Repeat, Globe, Copy, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const BestCRMsAutomationArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const stackLayers = [
        {
            title: "Camada 1: Source of Truth (CRM)",
            description: "Onde o dado vive. Se não está no CRM, não existe. Hubspot (All-in-one) ou Pipedrive (Sales-only).",
            example: "Regra de Ouro: Todo email, call e reunião deve ser logado aqui automaticamente.",
            results: "Previsibilidade de receita."
        },
        {
            title: "Camada 2: Enrichment (Dados)",
            description: "Não peça dados que você pode comprar. O lead preenche o email, a ferramenta preenche o resto (Tamanho, Indústria, Tech Stack).",
            example: "Ferramentas: Clay, Apollo, Clearbit. Elas transformam 'joao@acme.com' em um perfil completo de compra.",
            results: "Menos atrito no formulário (+ conversão)."
        },
        {
            title: "Camada 3: Engagement (Ação)",
            description: "Onde a conversa acontece. Ferramentas de sequenciamento de email/linkedin.",
            example: "Ferramentas: Outreach, Salesloft, Lemlist. Elas garantem que nenhum lead seja esquecido (No lead left behind).",
            results: "Garante 8-12 toques por lead."
        },
        {
            title: "Camada 4: Automation (Cola)",
            description: "O sistema nervoso que conecta tudo. Move dados de um lado para o outro sem humanos.",
            example: "Ferramentas: Zapier, Make, n8n. Ex: 'Quando ganhar Deal no Pipedrive -> Criar contrato no Docusign -> Criar canal no Slack'.",
            results: "Zero data entry manual."
        }
    ];

    const templates = [
        {
            name: "Automação: Lead Handoff (MQL -> SQL)",
            subject: "Logic Flow (Zapier/Make)",
            body: `GATILHO: Lead Score > 70 (Hubspot)

AÇÃO 1: Verificar se empresa tem > 50 funcionários (Enrichment).
  - SE SIM: Criar Deal no Pipeline "Enterprise" e Atribuir ao SDR Senior.
  - SE NÃO: Criar Deal no Pipeline "SMB" e Atribuir Round-Robin.

AÇÃO 2: Enviar notificação no Slack #sales-alert:
  "[HOT] Novo Lead Quente: [Nome] da [Empresa]. Principal dor: [Dado do Form]."

AÇÃO 3: Adicionar à Cadência "Fast Response" (Outreach).`
        },
        {
            name: "Automação: Re-engajamento de Lost",
            subject: "Logic Flow (CRM)",
            body: `GATILHO: Deal movido para "Lost" (Motivo: Timing ou Ghosting).

ESPERA: 90 dias.

AÇÃO:
1. Checar se o contato ainda está na empresa (LinkedIn Check).
2. Enviar email automático (Plain Text):
   "Oi [Nome], passaram-se 3 meses desde que conversamos sobre [Dor].
    O timing melhorou ou ainda não é o momento?
    Abs,"

RESULTADO: 3-5% de 'Ressurreição' de pipeline sem esforço humano.`
        }
    ];

    const integrationChecklist = [
        "Sincronização Bidirecional (2-way sync) de Email/Calendário",
        "Mapeamento de campos (Field Mapping) documentado",
        "Regras de Deduplicação ativas",
        "Monitoramento de erros de API (Zapier Alerts)",
        "Backups semanais dos dados do CRM",
        "Permissões de acesso (Quem pode exportar?)",
        "SLA de resposta definido na automação",
        "Documentação do Stack (Quem contrata o quê)"
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="O 'Frankenstack' vs Revenue OS">
                    <p>
                        A maioria das startups constrói seu stack de vendas como um monstro de Frankenstein: ferramentas desconexas, coladas com silver tape, gerando dados duplicados e silos de informação.
                    </p>
                    <p className="mt-4">
                        Um <strong>Revenue Operating System (RevOS)</strong> moderno não é sobre ter mais ferramentas. É sobre fluxo de dados. O objetivo é remover 100% da entrada manual de dados, permitindo que seus vendedores vendam, não preencham formulários.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (RevOps Moderno)"
                    items={[
                        { title: "Single Source of Truth", description: "O CRM é o Deus da sua operação. Se não está no CRM, não aconteceu. Elimine planilhas paralelas (Shadow IT) imediatamente." },
                        { title: "Garbage In, Garbage Out", description: "Automação em cima de dados sujos apenas escala o erro. Invista em ferramentas de Enriquecimento (Enrichment) antes de automatizar emails." },
                        { title: "A Regra dos 5 Minutos", description: "Cada minuto que um lead espera reduz a conversão. Sua automação deve garantir o 'Speed to Lead' instantâneo via roteamento automático." },
                        { title: "Menos é Mais", description: "Não contrate Salesforce se você tem 2 vendedores. Complexidade mata a velocidade. Use o stack mais leve possível para o seu estágio." }
                    ]}
                />

                <ConceptDefinition
                    concept="Data Entry vs Data Action"
                    definition="Data Entry é o ato humano de digitar dados no sistema (Desperdício). Data Action é usar os dados para tomar decisões ou disparar ações (Valor)."
                    amateurView="Vendedor tira 1 hora do dia, na sexta-feira, para atualizar o CRM de memória."
                    proView="O CRM captura emails, calls e reuniões sozinho. O vendedor só entra para mover o Deal de estágio e ver o próximo passo."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">As 4 Camadas do Stack de Receita</h2>
                <p>
                    Não pense em ferramentas isoladas. Pense em camadas de funcionalidade. Se você remover uma, a pirâmide cai.
                </p>

                <div className="space-y-8 mb-16 mt-8">
                    {stackLayers.map((layer, index) => (
                        <Card key={index} className="bg-white border border-zinc-200 p-8 rounded-xl shadow-sm transition-shadow">
                            <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">{index + 1}</span>
                                {layer.title}
                            </h3>
                            <p className="text-zinc-700 mb-6 font-medium text-lg">
                                {layer.description}
                            </p>
                            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-100 flex gap-4 items-start">
                                <div className="shrink-0 mt-1">
                                    <div className="w-1 h-full bg-revgreen rounded-full"></div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Exemplo Prático</h4>
                                    <p className="text-zinc-600 text-sm font-mono leading-relaxed italic">"{layer.example}"</p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-sm text-emerald-700 font-bold bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                                <Layers className="w-4 h-4" />
                                Impacto: {layer.results}
                            </div>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de um Stack Quebrado"
                    flags={[
                        "Vendedores reclamam que 'o CRM é lento/difícil' (Baixa Adoção).",
                        "Você tem contatos duplicados (João e João da Silva) atrapalhando automações.",
                        "Leads quentes esfriam porque ficaram parados na etapa errada sem alerta.",
                        "Você não sabe o ROI de um canal porque a origem (Source) se perdeu no caminho."
                    ]}
                />

                <Card className="my-16 bg-zinc-50 border border-zinc-200 p-8 rounded-xl not-prose shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck className="w-24 h-24 text-zinc-900" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2 relative z-10">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        Checklist de Higiene de Dados
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                        {integrationChecklist.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 border border-zinc-200 rounded bg-white shadow-sm transition-shadow">
                                <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                                <span className="text-sm font-medium text-zinc-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-revgreen" />
                    Fluxos Lógicos (Blueprints)
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

                <StrategicConclusion
                    title="Simplifique para Escalar"
                    description="A melhor ferramenta é aquela que seu time usa. Comece simples (CRM + Email + Zapier), valide o processo, e só depois adicione complexidade."
                    ctaText="Auditoria de CRM e Processos"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default BestCRMsAutomationArticle;
