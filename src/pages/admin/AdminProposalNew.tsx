import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import ProposalForm from "@/components/admin/ProposalForm";
import { getReiProjectById } from "@/api/reiProjects";
import { getLatestReiResponse } from "@/api/reiResponses";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { AIProvider } from "@/context/AIContext";
import { useOpportunityIntelligence, type OpportunityContext } from "@/hooks/useOpportunityIntelligence";

const AdminProposalNew = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('projectId') || searchParams.get('project_id');
    const opportunityId = searchParams.get('opportunity_id');

    const [legacyLoading, setLegacyLoading] = useState(!!projectId);
    const [initialData, setInitialData] = useState<any>(null);

    // Opportunity intelligence hook (new flow)
    const {
        loading: oppLoading,
        error: oppError,
        context: oppContext,
    } = useOpportunityIntelligence(opportunityId);

    // Build initialData from opportunity context when available
    useEffect(() => {
        if (!opportunityId) return;
        if (oppError && !oppLoading && !oppContext) {
            setInitialData({});
            return;
        }
        if (!oppContext) return;

        setInitialData({
            client_name: oppContext.trade_name || oppContext.client_company || oppContext.client_name,
            client_email: oppContext.client_email || '',
            client_contact_name: oppContext.client_name?.split(' ')[0] || '',
            client_logo: oppContext.client_logo || '',
            opportunity_id: oppContext.opportunity_id,
            // Pre-fill recording URL from meeting
            recording_url: oppContext.meeting?.video_url || '',
            // Pre-fill transcript from meeting
            transcript: oppContext.meeting?.transcript || '',
            // Pass opportunity + diagnostic data as crm_data context for AI
            crm_data: {
                source: 'opportunity_intelligence',
                opportunity_id: oppContext.opportunity_id,
                // Diagnostic data (if exists)
                ...(oppContext.diagnostico?.respostas || {}),
                // Opportunity signals
                sinais_compra: oppContext.opportunity_data?.sinais_compra || [],
                objecoes_detectadas: oppContext.opportunity_data?.objecoes_detectadas || [],
                score_fechamento: oppContext.opportunity_data?.score_fechamento || null,
                investimento_estimado: oppContext.opportunity_data?.investimento_estimado || null,
            },
        });
    }, [opportunityId, oppContext, oppLoading]);

    // Legacy flow: load from rei_project (backward compatibility)
    useEffect(() => {
        if (opportunityId) return; // Skip legacy flow if opportunity path
        const loadContext = async () => {
            if (!projectId) return;

            try {
                setLegacyLoading(true);
                const project = await getReiProjectById(projectId);

                let diagnosisData = null;
                try {
                    const response = await getLatestReiResponse(projectId);
                    if (response?.responses) {
                        diagnosisData = response.responses;
                    }
                } catch (e) {
                    console.warn("No diagnosis response found", e);
                }

                if (project) {
                    setInitialData({
                        client_name: project.client_name,
                        client_email: project.client_email,
                        client_contact_name: project.client_name?.split(' ')[0] || '',
                        crm_data: {
                            ...((diagnosisData as any) || {}),
                            source: 'rei_diagnosis',
                            project_id: projectId
                        }
                    });
                } else {
                    setInitialData({});
                }
            } catch (error) {
                console.error("Failed to load project context", error);
                setInitialData({});
            } finally {
                setLegacyLoading(false);
            }
        };

        loadContext();
    }, [projectId, opportunityId]);

    const loading = opportunityId ? oppLoading : legacyLoading;
    const isReady = (!opportunityId && !projectId) || initialData !== null;

    if (loading || !isReady) {
        return (
            <AdminLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="h-full">
                <AdminPageLayout title="Nova Proposta" backTo="/admin/proposals" backLabel="Voltar às Propostas">
                    <div className="flex gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                // Forca os dados do TLDV direto no estado
                                setInitialData({
                                    ...initialData,
                                    transcript: "Veio em um bom momento a indicação do Felipe para a gente falar. Eu convidei o Diego para participar porque, se você falar que é banana, eu não vou falar que é maçã, porque não é minha praia. Então achei importante ele estar junto.\\n\\nGiulliano: Maravilha, sem problema. A gente aguarda ele então.\\n\\nWagner: PÚBLICO ALVO: Fornecedores da construção (b2b). OBJECAO: Zorro CRM, Mídia Paga com Diego (25% CV). SOLUCAO HIBRIDA (LinkedIn orgânico e Mkt Complementar).",
                                    recording_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Dummy video link to fill empty state
                                    detailed_scope: `[
  {
    "phase": "Fase 1: O Problema não é só Dinheiro (Arquitetura & Setup)",
    "duration": "Mês 1",
    "description": "Fim dos leads desqualificados. Mapeamos toda sua esteira atual e conectamos o ecossistema RevHackers (Funnels) nativamente ao seu Zorro CRM. Sem trocar sistemas, apenas blindando o funil de entrada. Otimizamos o LinkedIn Institucional e do Founder para máxima autoridade.",
    "deliverables": ["Blueprint de Integração Zorro", "Otimização Profiling LinkedIn", "Setup RevHackers Funnels"]
  },
  {
    "phase": "Fase 2: Motor de Conteúdo e Iscas Magnéticas",
    "duration": "Meses 2 a 3",
    "description": "Engrenando a máquina de atração. Instauramos o Playbook editorial (2 a 3 posts/semana) focado na dor do ICP B2B estrutural. Em paralelo, lançamos 2 Materiais Ricos (Lead Magnets) mensais envelopados em Landing Pages de altíssima conversão no Funnels para captação massiva.",
    "deliverables": ["Playbook Editorial Provocativo", "4 Lead Magnets (Alta Densidade)", "LPs de Captura no Funnels"]
  },
  {
    "phase": "Fase 3: Tração Híbrida e Social Selling Autônomo",
    "duration": "Meses 4 a 6",
    "description": "A audiência está engajada. Ligamos as automações de prospecção e engajamento no LinkedIn. Os fluxos da RevHackers Funnels passam a nutrir, rastrear e pontuar (Lead Scoring) os curiosos, preparando o terreno de ponta a ponta sem qualquer fricção com a Mídia Paga do Diego.",
    "deliverables": ["Automações de Social Selling", "Workflows Visuais de Nutrição", "Filtros de Engajamento e Score"]
  },
  {
    "phase": "Fase 4: Hand-off Cirúrgico e Expansão Omnichannel",
    "duration": "Meses 7 a 9",
    "description": "O funil atinge maturidade técnica. O robô que vende passa a fazer o Hand-off hiper qualificado purificando os leads. A integração API injeta apenas o MQL (Lead Quente) com histórico completo e perfil B2B diretamente no pipeline de vendas do seu Zorro CRM.",
    "deliverables": ["Injeção Automática via API Zorro", "Automação de Follow-up B2B", "Scripts de Abordagem MQL"]
  },
  {
    "phase": "Fase 5: Domínio de Mercado, Análise e Escala Livre",
    "duration": "Meses 10 a 12",
    "description": "Operação robusta e inevitável de aquisição orgânica rodando em velocidade de cruzeiro. Promovemos análise sistemática do ROAS cruzado (Mídia Paga vs LinkedIn) com dashboards gerenciais, escalando a operação outbound focada nas maiores construtoras do país.",
    "deliverables": ["Dashboard Central RevHackers", "Scale de Conexões Diretas", "Reuniões Mensais de Calibragem"]
  }
]`,
                                    summary: "Enquanto você gerencia sistemas isolados e sofre com tráfego pago desqualificado, a Obras Online perde tração no mercado B2B porque 'O Problema não é só dinheiro, é visão fragmentada'. A nossa Máquina de Autoridade propõe um projeto sólido de 12 MESES: 2 a 3 publicações estratégicas semanais no LinkedIn do Founder, somadas ao lançamento de Lead Magnets altamente desejáveis a cada quinzena, rodando 100% sobre uma esteira de automações da RevHackers Funnels. Qualificamos automaticamente 24h por dia e injetamos apenas o Lead Quente (MQL) purificado de ponta a ponta diretamente para dentro do seu Zorro CRM. Uma operação complementar de longo prazo, agressiva e à prova de curiosos.",
                                    crm_data: {
                                        source: 'opportunity_intelligence',
                                        pain_points: [
                                            'Tráfego pago atual gera muito lead desqualificado para B2B', 
                                            'Dificuldade de segmentação para fornecedores', 
                                            'Retenção de clientes'
                                        ],
                                        budget_range: 'Acima de R$3k',
                                        decision_makers: 'Wagner (Founder) e Diego',
                                        urgency: 'Média (aceleração comercial iniciada)',
                                        next_steps: 'Enviar escopo e fazer segunda call',
                                        qualified_score: 8,
                                        client_info: {
                                            name: 'Wagner e Diego',
                                            company: 'Obras Online',
                                            email: 'wagner@obrasonline.com.br'
                                        },
                                        cards: [
                                            {
                                                phase: 'Fase 1: Auditoria e Setup de Parceira',
                                                duration: 'Semanas 1-2',
                                                description: 'Alinhamento com a operação atual (Diego/Zorro CRM) e desenho da arquitetura B2B no LinkedIn do Founder.',
                                                deliverables: ['Blueprint de Integração', 'ICP B2B Obras', 'Setup de Autoridade'],
                                                status: 'pending'
                                            },
                                            {
                                                phase: 'Fase 2: Funil Híbrido de Nutrição',
                                                duration: 'Semanas 3-4',
                                                description: 'Criação de iscas ácidas focadas na dor real do mercado e mapeamento no CRM.',
                                                deliverables: ['Lead Magnet', 'Estrutura Híbrida', 'Score Zorro'],
                                                status: 'pending'
                                            },
                                            {
                                                phase: 'Fase 3: Outbound e Autoridade LinkedIn',
                                                duration: 'Semanas 5-6',
                                                description: 'Lançamento da estratégia provocativa no LinkedIn com automações.',
                                                deliverables: ['Calendário Editorial', 'Campanhas de Inbound', 'Playbook Social Selling'],
                                                status: 'pending'
                                            },
                                            {
                                                phase: 'Fase 4: Feedback Loop de Vendas',
                                                duration: 'Semana 7',
                                                description: 'Reunião de calibragem da qualidade dos leads gerados (MQL/SQL).',
                                                deliverables: ['Análise de MQLs', 'Alinhamento Mkt/Vendas', 'Otimizações'],
                                                status: 'pending'
                                            },
                                            {
                                                phase: 'Fase 5: Rollout e Expansão',
                                                duration: 'Semana 8',
                                                description: 'Escalar estratégia para outras frentes após integração madura.',
                                                deliverables: ['Relatório Aquisição B2B', 'Hand-off', 'Treinamento de Follow-up'],
                                                status: 'pending'
                                            }
                                        ],
                                        live_proposal: {
                                            diagnosis_headline: "O funil parou no tempo.",
                                            diagnosis_subheadline: "O tráfego pago hoje traz volume, mas a segmentação B2B estrutural pelo Meta/Google é restrita. O resultado é um CRM inflado de curiosos e leads desqualificados, drenando o tempo do time comercial.",
                                            challenges: [
                                                { title: "Dependência de Mídia Paga Inflacionada", description: "O Custo por Lead e CAC aumentam enquanto a taxa de conversão final despenca pelo excesso de curiosos." },
                                                { title: "Autoridade Digital Inexistente", description: "O ecossistema não educa nem endossa os grandes decisores (donos de construtoras) antes de caírem no funil." },
                                                { title: "Falta de Automação Híbrida", description: "Os Vendedores perdem horas de follow-up ligando para leads que nem sequer sabiam o ticket e o escopo da oferta." },
                                                { title: "Visão Fragmentada de Dados", description: "Sem um tracking nativo, fica impossível medir qual esforço de conteúdo no LinkedIn virou dinheiro de fato." }
                                            ],
                                            features_headline: "Tudo que a operação comercial precisa. Em um único lugar.",
                                            features_subheadline: "Apoiada por um ecossistema centralizado, blindando o pipeline de conversões sem reféns de tecnologia.",
                                            features: [
                                                { title: 'VENDAS E RELACIONAMENTO', description: 'Funis de priorização contínua de leads, rastreamento de ações em tempo real, gestão de chamadas e histórico completo por CNPJ. Muito mais poderoso que Pipedrive ou RD CRM.', icon: 'Layers' },
                                                { title: 'AUTOMAÇÃO COM AGENTES', description: 'Atendimento e qualificação nativa através de fluxos (workflows) e chatbots nativos que captam informações e marcam agendas 24/7. O Robô que vende enquanto o time foca no fechamento.', icon: 'Bot' },
                                                { title: 'COMUNICAÇÃO OMNICHANNEL', description: 'WhatsApp API Oficial (Sem banimentos), Instagram DM, Facebook e E-mail integrados. Caixa de entrada coletiva que concentra a comunicação e evita a fragmentação celular.', icon: 'MessageSquareText' }
                                            ],
                                            architecture_headline: "A Engenharia do Funil B2B.",
                                            architecture_subheadline: "O fluxo desenhado para captar atenção no topo e moer objeções até o fechamento.",
                                            architecture_flow: [
                                                { title: 'Aquisição B2B', subtitle: 'LinkedIn & Ads', icon: 'Megaphone' },
                                                { title: 'Filtro & IA', subtitle: 'Robôs Qualificadores', icon: 'Bot' },
                                                { title: 'Zorro CRM', subtitle: 'SDR & Closer', icon: 'DatabaseZap' },
                                                { title: 'CS & Retenção', subtitle: 'LTV Maximizado', icon: 'LineChart' }
                                            ],
                                            deliverables_headline: "O Escopo Técnico do Nosso Acordo.",
                                            deliverables_subheadline: "Garantia de previsibilidade. Tudo que será construído, configurado e validado.",
                                            deliverables: [
                                                { category: 'Fundação Técnica', items: ['Aprovação API WhatsApp', 'Instância Zorro CRM', 'Migração de Dados Mkt', 'Acessos e Roles'] },
                                                { category: 'A Máquina Funnels', items: ['Robôs Qualificadores MQL', 'Páginas de Alta Conversão', 'Scraping B2B Automático', 'Playbooks de Qualificação'] },
                                                { category: 'Aceleração & Dados', items: ['Dashboards Executivos', 'Treinamento Comercial', 'Auditoria Semanal', 'Otimização de SDR'] }
                                            ],
                                            comparison_headline: "8 Ferramentas. 1 Plataforma. O Custo da Ineficiência.",
                                            comparison_subheadline: "Mapeamos o custo oculto de stackar ferramentas avulsas que não se conversam contra a inteligência concentrada do ecossistema RevHackers.",
                                            comparison_old_total: "R$ 22.248 / ano",
                                            comparisons: [
                                                { tool: 'Hubspot / Pipedrive (Sales CRM)', oldCost: 'R$ 600/mês' },
                                                { tool: 'RD Station / ActiveCampaign (Mkt)', oldCost: 'R$ 450/mês' },
                                                { tool: 'Manychat (Instagram DM)', oldCost: 'R$ 150/mês' },
                                                { tool: 'Calendly (Agendador Oficial)', oldCost: 'R$ 80/mês' },
                                                { tool: 'Make / Zapier (Integrações)', oldCost: 'R$ 574/mês' }
                                            ],
                                            cases_headline: "Histórico de Tracionamento B2B.",
                                            cases_subheadline: "A matemática fria das operações que apostaram na máquina All-in-One e escalaram custos de aquisição.",
                                            cases: [
                                                { company: 'Empresa SA', metric: 'Custo de Aquisição (CAC)', before: 'R$ 1.200', after: 'R$ 450', trend: 'down', insight: 'Eliminação de ferramentas engessadas e workflows de qualificação autônoma no WhatsApp.' },
                                                { company: 'Parceiro X', metric: 'MQLs Gerados', before: '4 / Mês', after: '21 / Mês', trend: 'up', insight: 'Scraping ativo do LinkedIn conectando leads diretos para caixa DM dos Vendedores.' },
                                                { company: 'Grupo Alpha', metric: 'Tempo de Follow-up', before: '14 Horas', after: '2 Min', trend: 'down', insight: 'Notificação instantânea para o Closer via Zorro CRM assim que o lead termina o quiz.' }
                                            ],
                                            premises_headline: "O Alinhamento de Responsabilidades.",
                                            premises_subheadline: "A RevHackers monta e dirige o motor. Mas a tração comercial continuará sendo sua. Sem falsas promessas.",
                                            premises: {
                                                we: ['Deploy da Infra Estratégica', 'Engenharia de Automação', 'Inteligência e Revisão MQL', 'Treinamento de Uso Zorro'],
                                                you: ['Disciplina de Follow-up (SDR)', 'Time comprometido nas Calls', 'Revisão Ágil de Materiais', 'Aprovação de Orçamentos Ads']
                                            },
                                            primary_objective: "Instaurar uma Máquina orgânica e B2B atuando 100% sobre o LinkedIn do Founder, munida de Materiais Ricos e Automações Funnels, transferindo apenas o Lead Quente MQL diretamente para o Zorro CRM.",
                                            project_duration: "12 Meses",
                                            roadmap: [
                                                {
                                                    phase: 'Fase 1: O Problema não é só Dinheiro (Arquitetura & Setup)',
                                                    duration: 'Mês 1',
                                                    description: 'Fim dos leads desqualificados. Mapeamos toda sua esteira atual e conectamos o ecossistema RevHackers (Funnels) nativamente ao seu Zorro CRM. Sem trocar sistemas, apenas blindando o funil de entrada. Otimizamos o LinkedIn Institucional e do Founder para máxima autoridade.',
                                                    deliverables: ['Blueprint de Integração Zorro', 'Otimização Profiling LinkedIn', 'Setup RevHackers Funnels'],
                                                    status: 'pending'
                                                },
                                                {
                                                    phase: 'Fase 2: Motor de Conteúdo e Iscas Magnéticas',
                                                    duration: 'Meses 2 a 3',
                                                    description: 'Engrenando a máquina de atração. Instauramos o Playbook editorial (2 a 3 posts/semana) focado na dor do ICP B2B estrutural. Em paralelo, lançamos 2 Materiais Ricos (Lead Magnets) mensais envelopados em Landing Pages de altíssima conversão no Funnels para captação massiva.',
                                                    deliverables: ['Playbook Editorial Provocativo', '4 Lead Magnets (Alta Densidade)', 'LPs de Captura no Funnels'],
                                                    status: 'pending'
                                                },
                                                {
                                                    phase: 'Fase 3: Tração Híbrida e Social Selling Autônomo',
                                                    duration: 'Meses 4 a 6',
                                                    description: 'A audiência está engajada. Ligamos as automações de prospecção e engajamento no LinkedIn. Os fluxos da RevHackers Funnels passam a nutrir, rastrear e pontuar (Lead Scoring) os curiosos, preparando o terreno de ponta a ponta sem qualquer fricção com a Mídia Paga do Diego.',
                                                    deliverables: ['Automações de Social Selling', 'Workflows Visuais de Nutrição', 'Filtros de Engajamento e Score'],
                                                    status: 'pending'
                                                },
                                                {
                                                    phase: 'Fase 4: Hand-off Cirúrgico e Expansão Omnichannel',
                                                    duration: 'Meses 7 a 9',
                                                    description: 'O funil atinge maturidade técnica. O robô que vende passa a fazer o Hand-off hiper qualificado purificando os leads. A integração API injeta apenas o MQL (Lead Quente) com histórico completo e perfil B2B diretamente no pipeline de vendas do seu Zorro CRM.',
                                                    deliverables: ['Injeção Automática via API Zorro', 'Automação de Follow-up B2B', 'Scripts de Abordagem MQL'],
                                                    status: 'pending'
                                                },
                                                {
                                                    phase: 'Fase 5: Domínio de Mercado, Análise e Escala Livre',
                                                    duration: 'Meses 10 a 12',
                                                    description: 'Operação robusta e inevitável de aquisição orgânica rodando em velocidade de cruzeiro. Promovemos análise sistemática do ROAS cruzado (Mídia Paga vs LinkedIn) com dashboards gerenciais, escalando a operação outbound focada nas maiores construtoras do país.',
                                                    deliverables: ['Dashboard Central RevHackers', 'Scale de Conexões Diretas', 'Reuniões Mensais de Calibragem'],
                                                    status: 'pending'
                                                }
                                            ]
                                        }
                                    },
                                    payment_terms: "Assinatura Fast-Track: Aceite imediato do acordo através desta página confere Bônus Especial de Setup. O contrato global detalhado será enviado para revisão corporativa logo após a pré-ativação do workspace."
                                });
                                alert("DADOS FULL DECK INJETADOS! Formato Slide Master atualizado. Rode a página, preencha Título / Valores e Salve para ver o Pitch Perfeito.");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
                        >
                            ⚡ INJETAR DADOS DO BANCO DE DADOS
                        </button>
                    </div>

                    <AIProvider>
                        <ProposalForm
                            initialData={initialData}
                            opportunityContext={oppContext}
                        />
                    </AIProvider>
                </AdminPageLayout>
            </div>
        </AdminLayout>
    );
};

export default AdminProposalNew;
