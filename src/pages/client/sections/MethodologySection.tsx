import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Pipeline stages ───────────────────────────────────────────────────────
const pipelineStages = [
    { label: 'Geração', sub: 'Leads, ICP', color: 'bg-zinc-200' },
    { label: 'Qualificação', sub: 'MQL → SQL', color: 'bg-zinc-300' },
    { label: 'Fechamento', sub: 'Proposta → Deal', color: 'bg-zinc-800 text-white' },
    { label: 'Ativação', sub: '1º Resultado', color: 'bg-black text-white' },
    { label: 'Expansão', sub: 'Upsell, LTV', color: 'bg-[#00CC6A] text-black' },
];

// ── Default methodology steps ─────────────────────────────────────────────
const defaultSteps = [
    {
        phase: '01', name: 'Diagnóstico & Fundação', tagline: 'Semana 1–2',
        description: 'Antes de gerar demanda, a casa precisa estar em ordem. Mapeamos toda a operação atual, identificamos onde a receita está vazando, configuramos o rastreamento ponta a ponta e estabelecemos a base tecnológica sem a qual nenhuma outra ação funciona.',
        principles: ['Revenue Stack auditado (CRM, automação, analytics)', 'Mapeamento de onde a receita é gerada e perdida', 'Rastreamento completo instalado antes de qualquer anúncio', 'Pipeline configurado com estágios claros e responsáveis'],
    },
    {
        phase: '02', name: 'Geração de Demanda Inteligente', tagline: 'Semana 2–6',
        description: 'Ativamos os canais de aquisição corretos para o seu perfil de ICP - não todos ao mesmo tempo. Estruturamos três fluxos de entrada: inbound via autoridade e SEO, outbound via prospecção ativa e segmentada, e parcerias via network estratégico.',
        principles: ['Seeds: network e indicação ativada com processo', 'Nets: campanha de demanda segmentada por ICP', 'Spears: outreach personalizado para contas-alvo', 'Primeiro ROAS obtido em até 30 dias de campanha'],
    },
    {
        phase: '03', name: 'Ativação & Onboarding Orquestrado', tagline: 'Semana 3–8',
        description: 'O momento crítico é logo após a compra - e a maioria das empresas abandona o cliente. Estruturamos uma jornada de ativação em milestones com momentos de verdade: cada touchpoint tem um dono, um prazo e um resultado esperado.',
        principles: ['Momento de Verdade 1: ativação em 24h após fechamento', 'Momento de Verdade 2: primeiro resultado entregue em 15 dias', 'Momento de Verdade 3: review de resultados no dia 90', 'Automações de nurturing com cadência adaptada ao comportamento'],
    },
    {
        phase: '04', name: 'Expansão & Motor de Receita', tagline: 'Mês 2 em diante',
        description: 'Com dados reais de CAC, LTV, ROAS e churn, ativamos o ciclo de crescimento. O cliente que ativa, tem sucesso e se torna defensor. Esse defensor gera novos leads com custo zero - completando o ciclo completo de receita.',
        principles: ['Velocidade de Pipeline calculada e otimizada mensalmente', 'LTV:CAC acima de 3:1 como critério de escala', 'Expansão de conta: upsell e cross-sell no pipeline', 'Revisões mensais RAPT - Revisão, Alinhamento, Prioridade, Tática'],
    },
];

const crmSteps = [
    {
        phase: '01', name: 'Diagnóstico & Arquitetura', tagline: 'Semana 1–2',
        description: 'Toda operação comercial eficiente começa com processos mapeados. Mapeamos os responsáveis, jornada e como o lead flui da atração ao fechamento. Com isso, desenhamos o Projeto Técnico que reflete perfeitamente a sua operação comercial em vez de tentar amassar o seu processo numa caixa.',
        principles: ['Entrevistas Diagnósticas com Liderança/Comercial', 'Desenho do Processo Atual e Processo Ideal (novo fluxo)', 'Definição de regras e SLAs de MKT/Vendas', 'Projeto Técnico estrutural de todas as propriedades e etapas'],
    },
    {
        phase: '02', name: 'Setup Intensivo do CRM', tagline: 'Semana 3–4',
        description: 'Transportar o Projeto Técnico para dentro do sistema. Customizamos campos, formatamos os funis corretos e preparamos a plataforma para ser o ponto central da equipe. Nada de dados perdidos em planilhas.',
        principles: ['Estruturação do Pipeline Principal com regras de validação', 'Matriz de Motivos de Perda atrelada às métricas vitais', 'Rastreamentos (Pixels/Webhooks) conectados às Oportunidades', 'Configuração limpa de relatórios de gestão visual'],
    },
    {
        phase: '03', name: 'Automação & Redução de Atrito', tagline: 'Semana 5–6',
        description: 'Transformar esforço manual repetitivo em gatilhos automáticos. Reduzimos o trabalho braçal de Vendas criando alertas internos, rodízio inteligente, passagem de bastão instantânea e acompanhamento automático, removendo tarefas robóticas de mentes humanas.',
        principles: ['Automação de Passagem de Bastão (Marketing > SDR > Closer)', 'Notificações de gargalos ou estagnação (Slack/App)', 'Rotinas de Higiene de Dados automáticas ativas', 'Estruturação de sequências comerciais padrão no CRM'],
    },
    {
        phase: '04', name: 'Governança & Adoção', tagline: 'Semana 7–8',
        description: 'O melhor sistema do mundo não converte se o seu time não preenche direito. Estruturamos os ciclos e garantimos adoção visceral estabelecendo uma Revisão Semanal de Pipeline oficial onde só um princípio impera: "se não tá no CRM, não existe".',
        principles: ['Treinamento prático direto com Closers e SDRs', 'Auditoria de consistência e lacunas da primeira semana', 'Implementação do Rito de Revisão de Pipeline Semanal', 'Entrega final do Manual Operacional e Passagem de Bastão do playbook'],
    },
];

// ── Founder steps ─────────────────────────────────────────────────────────
const founderSteps = [
    {
        phase: '01', name: 'Posicionamento & Identidade', tagline: 'Semana 1–2',
        description: 'Antes de postar, precisamos saber quem você é para quem importa. Definimos o nicho de autoridade, o ponto de vista único (POV) e o ICP do perfil pessoal - quem você quer atrair, qual problema você resolve e por que você e não outro.',
        principles: ['Definição do nicho de autoridade e POV único', 'ICP do perfil: cargo, segmento e dor do seguidor ideal', 'Bio, headline e banner do LinkedIn otimizados', 'Conteúdo fixado que posiciona antes do primeiro post'],
    },
    {
        phase: '02', name: 'Conteúdo Âncora', tagline: 'Semana 3–6',
        description: 'Criamos os primeiros posts de alto impacto - carrosséis de autoridade, text posts de opinião e stories de bastidor - para testar formatos, calibrar a voz e gerar os primeiros dados reais de alcance e engajamento do ICP.',
        principles: ['3 formatos testados: carrossel, text post, vídeo curto', 'Estratégia de comentários em contas âncora do nicho', 'Análise de alcance por formato para dobrar no que funciona', 'Primeiros inbounds qualificados ou conexões de 1º grau no ICP'],
    },
    {
        phase: '03', name: 'Cadência & Volume', tagline: 'Semana 7–10',
        description: 'Máquina rodando: 3 publicações semanais consistentes, rotina de comentários estratégicos e nutrição da audiência. Nessa fase a consistência supera a perfeição - quem publica sem parar vence quem publica o post perfeito uma vez.',
        principles: ['Cadência de 3x/semana consolidada e sistematizada', 'Banco de conteúdo com 2 semanas de buffer', 'Comentários diários em 5–10 posts de contas âncora', 'Review de métricas quinzenal para ajuste de pauta'],
    },
    {
        phase: '04', name: 'Loop de Conversão', tagline: 'Semana 11–12',
        description: 'Transformamos audiência em oportunidade. Com autoridade estabelecida, ativamos o loop: seguidores viram conexões, conexões viram conversas, conversas viram chamadas - tudo originado de conteúdo, sem cold outreach.',
        principles: ['DM estratégico: abordagem baseada em engajamento real', 'Convites para podcast, evento ou parceria (inbound de autoridade)', 'Newsletter ou grupo fechado para leads mais quentes', 'Revisão final: 1 inbound qualificado = payback do protocolo'],
    },
];

// ── Dev steps ──────────────────────────────────────────────────────────────
const devSteps = [
    {
        phase: '01', name: 'Briefing & Arquitetura', tagline: 'Semana 1',
        description: 'Nenhuma linha de código antes da estrutura aprovada. Mapeamos o objetivo de cada página, criamos o sitemap, definimos a stack tecnológica e entregamos o wireframe para aprovação - o rascunho que evita retrabalho caro.',
        principles: ['Sitemap completo com objetivo de conversão por página', 'Wireframe (baixa fidelidade) aprovado pelo cliente', 'Stack definida: framework, CMS, hosting, analytics', 'Metas de performance estabelecidas como critério de aceite'],
    },
    {
        phase: '02', name: 'Design & Copy', tagline: 'Semana 2–3',
        description: 'UI de alta fidelidade construída sobre o wireframe aprovado. O design segue mobile-first e os textos são revisados para conversão - não apenas para informar. A identidade visual é aplicada antes do desenvolvimento.',
        principles: ['UI de alta fidelidade no Figma, mobile-first', 'Texto revisado: headline, CTA e proposta de valor por seção', 'Aprovação de design antes de entrar em código', 'Assets exportados e organizados para entrega ao desenvolvimento'],
    },
    {
        phase: '03', name: 'Desenvolvimento & Integrações', tagline: 'Semana 3–5',
        description: 'Código escrito sobre design aprovado. Integramos todas as ferramentas necessárias (CRM, formulários, analytics, pixels) e garantimos que o site funciona em todos os dispositivos antes de qualquer cliente ver.',
        principles: ['Desenvolvimento responsivo e acessível (WCAG básico)', 'Integrações: CRM, formulários, Google Analytics, pixels de rastreamento', 'Testes cross-browser e cross-device antes da entrega', 'Core Web Vitals monitorados desde o primeiro build'],
    },
    {
        phase: '04', name: 'QA & Lançamento', tagline: 'Semana 6',
        description: 'Rodada de feedback estruturada com o cliente, ajustes finais, lançamento controlado com configuração de DNS e SSL, e passagem de bastão completa com documentação de uso para o cliente operar sem dependência.',
        principles: ['Revisão final com checklist de 40+ pontos de QA', 'Configuração de DNS, SSL, redirecionamentos e sitemap XML', 'Treinamento de uso do CMS pelo cliente', 'Entrega: repositório, credenciais, documentação de manutenção'],
    },
];

// ── Differentials por tipo ────────────────────────────────────────────────
const differentialsByType: Record<string, { title: string; desc: string }[]> = {
    crm_ops: [
        { title: 'Processo Documentado', desc: 'Tudo que construímos vira Manual Operacional interno do cliente. A operação continua sem depender da RevHackers.' },
        { title: 'Adoção Garantida', desc: 'O melhor sistema do mundo falha se o time não preenche. Treinamos até a adoção ser visceral.' },
        { title: 'Governança Ativa', desc: 'Revisão de Pipeline semanal como rito obrigatório. Se não está no CRM, não existe.' },
    ],
    founder: [
        { title: 'Posicionamento Cirúrgico', desc: 'Nicho, POV e headline definidos antes de qualquer postagem. A clareza de quem você é atrai o cliente certo.' },
        { title: 'Máquina de Conteúdo', desc: 'Cadência sustentável de 3x/semana que converte autoridade em audiência qualificada - sem burnout criativo.' },
        { title: 'Loop de Conversão', desc: 'Da audiência ao pipeline: DM estratégico, inbound qualificado e convites de palestra originados do conteúdo.' },
    ],
    dev: [
        { title: 'Arquitetura Primeiro', desc: 'Sitemap, wireframe e aprovação antes de qualquer linha de código. Sem surpresas no meio do projeto.' },
        { title: 'Entrega Incremental', desc: 'Páginas entregues por prioridade de conversão - não por ordem alfabética. Resultado visível toda semana.' },
        { title: 'Performance como Critério', desc: 'LCP < 2.5s e GTmetrix ≥ 90 são critérios de aceite do projeto - não bônus. Entregamos o que prometemos.' },
    ],
    default: [
        { title: 'Receita Previsível', desc: 'Três fontes de demanda paralelas (Seeds, Nets, Spears) que funcionam mesmo quando uma falha.' },
        { title: 'Ciclo Completo de Receita', desc: 'Da atração ao fechamento ao sucesso do cliente - cada etapa conectada e medida.' },
        { title: 'Onboarding como Vantagem', desc: 'O primeiro resultado entregue em 15 dias determina o LTV. Cada touchpoint tem dono e prazo.' },
    ],
};

export default function MethodologySection({ plan }: { plan: any }) {
    const projectType = plan?.rei_projects?.type || plan?.project_type || 'default';
    const isConsultative = plan?.form_data?.project_duration === '30_days' || plan?.diagnostic_data?.roadmap_data?.project_duration === '30_days';

    // Bloquear alucinação da IA. O Framework Metodológico da RevHackers não muda por cliente.
    const stepsMap: Record<string, typeof defaultSteps> = {
        crm_ops: crmSteps,
        founder: founderSteps,
        dev:     devSteps,
        site:    devSteps,
    };
    
    let baseSteps = stepsMap[projectType] || defaultSteps;

    // Se for projeto consultivo de 30 dias, reescrever as taglines de tempo para refletir dias (em vez de semanas).
    const displaySteps = baseSteps.map((step, index) => {
        let newTagline = step.tagline;
        if (isConsultative) {
            const shortTaglines = ['Dias 1–7', 'Dias 8–15', 'Dias 16–22', 'Dias 23–30'];
            newTagline = shortTaglines[index] || step.tagline;
        }
        return {
            ...step,
            tagline: newTagline
        };
    });

    const differentials = differentialsByType[projectType] || differentialsByType['default'];

    const eyebrowByType: Record<string, string> = {
        crm_ops: 'Protocolo CRM',
        founder: 'Protocolo Founder',
        dev:     'Protocolo de Entrega',
        site:    'Protocolo de Entrega',
    };
    const titleLine2ByType: Record<string, string> = {
        crm_ops: 'RevHackers™',
        founder: 'Founder™',
        dev:     'Dev™',
        site:    'Dev™',
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow={eyebrowByType[projectType] || 'Como fazemos'}
                    titleLine1="Metodologia"
                    titleLine2={titleLine2ByType[projectType] || 'RevHackers™'}
                />
            </div>
            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-4 w-full bg-white flex flex-col justify-start">

                {/* 4 Phase Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {displaySteps.map((step: any, i: number) => {
                        const items = step.principles || step.tags || [];
                        return (
                            <div key={i} className="p-8 bg-white border border-zinc-200 rounded-xl">
                                <div className="flex items-center gap-5 mb-5">
                                    <span className="font-mono text-[2.75rem] leading-none font-bold text-zinc-100">
                                        {step.phase || String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <p className="text-[13px] uppercase tracking-widest font-bold text-zinc-400">
                                            {step.tagline || ''}
                                        </p>
                                        <h3 className="text-xl md:text-2xl font-bold text-black mt-1 leading-tight">
                                            {step.name}
                                        </h3>
                                    </div>
                                </div>
                                <EditableField
                                    path={`methodology_data.steps.${i}.description`}
                                    className="text-[15px] leading-relaxed mb-6 text-zinc-500 font-medium"
                                    placeholder={step.description}
                                    multiline
                                />
                                {items.length > 0 && (
                                    <div className="space-y-3">
                                        {items.map((item: string, j: number) => (
                                            <div key={j} className="flex items-start gap-3">
                                                <span className="text-zinc-300 shrink-0 text-sm mt-0.5">/</span>
                                                <span className="text-sm text-zinc-600 leading-snug">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Differentials */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    {differentials.map((d, i) => (
                        <div key={i} className="p-6 bg-zinc-50 border border-zinc-200 flex flex-col gap-4 rounded-xl">
                            <div className="pt-2">
                                <EditableField
                                    path={`methodology_data.differentials.${i}.title`}
                                    className="font-bold text-black text-[17px] mb-2 block"
                                    placeholder={d.title}
                                />
                                <EditableField
                                    path={`methodology_data.differentials.${i}.desc`}
                                    className="text-[15px] text-zinc-500 leading-relaxed font-medium"
                                    placeholder={d.desc}
                                    multiline
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
