import React from 'react';
import { Check, User, Users } from 'lucide-react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback quick wins by type ───────────────────────────────────────────
const fallbackByType: Record<string, { day: string; action: string; outcome: string; owner?: 'revhackers' | 'cliente' | 'ambos' }[]> = {
    crm_ops: [
        { day: 'Dia 1', action: 'Mapeamento do processo comercial atual', outcome: 'Documento com fluxo atual e gaps', owner: 'revhackers' },
        { day: 'Dia 2', action: 'Criar Pipeline de Vendas no CRM', outcome: 'Funil com etapas, regras e responsáveis', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Criar campos personalizados e propriedades', outcome: 'Campos customizados prontos para o time', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Criar templates de e-mails comerciais', outcome: 'Modelos de follow-up e nurturing prontos', owner: 'cliente' },
        { day: 'Dia 5', action: 'Criar primeira automação de passagem de bastão', outcome: 'Lead qualificado chega ao vendedor certo', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Alocação de tarefas entre consultoria e cliente', outcome: 'RACI definido com responsáveis claros', owner: 'ambos' },
        { day: 'Dia 7', action: 'Treinamento inicial com SDRs e Closers', outcome: 'Equipe operando no CRM desde o dia 1', owner: 'ambos' },
    ],
    founder: [
        { day: 'Dia 1', action: 'Definição do nicho de autoridade e ICP', outcome: 'Clareza sobre quem você atrai', owner: 'ambos' },
        { day: 'Dia 2', action: 'Otimização da bio, headline e banner', outcome: 'Perfil posicionado antes de publicar', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Pesquisa de 10 contas âncora no nicho', outcome: 'Mapa de formatos que performam', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Criação do primeiro post de autoridade', outcome: 'Conteúdo publicado testando formato', owner: 'ambos' },
        { day: 'Dia 5-6', action: 'Comentários estratégicos em contas âncora', outcome: 'Visibilidade junto à audiência do ICP', owner: 'cliente' },
        { day: 'Dia 7', action: 'Review de métricas e ajuste de pauta', outcome: 'Dados reais para calibrar estratégia', owner: 'ambos' },
    ],
    dev: [
        { day: 'Dia 1', action: 'Briefing: objetivo de cada página e público', outcome: 'Documento de requisitos aprovado', owner: 'ambos' },
        { day: 'Dia 2', action: 'Sitemap com objetivo de conversão por página', outcome: 'Estrutura definida antes do design', owner: 'revhackers' },
        { day: 'Dia 3-4', action: 'Wireframe de baixa fidelidade das páginas', outcome: 'Rascunho que evita retrabalho caro', owner: 'revhackers' },
        { day: 'Dia 5', action: 'Definição de stack e critérios de performance', outcome: 'Framework e metas de LCP estabelecidos', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Setup do ambiente de desenvolvimento', outcome: 'Infraestrutura pronta para o design', owner: 'revhackers' },
        { day: 'Dia 7', action: 'Aprovação do wireframe com stakeholders', outcome: 'Alinhamento antes de investir em código', owner: 'ambos' },
    ],
    default: [
        { day: 'Dia 1', action: 'Auditoria do Revenue Stack atual', outcome: 'Mapa de ferramentas e gaps', owner: 'revhackers' },
        { day: 'Dia 2', action: 'Rastreamento ponta a ponta (UTMs + CRM)', outcome: 'Lead rastreável do clique ao fechamento', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Setup do Pipeline com etapas e SLA', outcome: 'Funil de vendas estruturado', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Primeira automação de follow-up ativa', outcome: 'Leads qualificados automaticamente', owner: 'revhackers' },
        { day: 'Dia 5', action: 'Campanhas de captura (Search + Social)', outcome: 'Demanda gerada na primeira semana', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Dashboard de performance conectado', outcome: 'Visibilidade real de CPL e pipeline', owner: 'revhackers' },
        { day: 'Dia 7', action: 'Review de fundação com o time', outcome: 'Base sólida para escalar', owner: 'ambos' },
    ],
};

const fallbackConsultative: Record<string, { day: string; action: string; outcome: string; owner?: 'revhackers' | 'cliente' | 'ambos' }[]> = {
    crm_ops: [
        { day: 'Dia 1', action: 'Auditoria do processo comercial e ferramentas', outcome: 'Documento de gaps operacionais', owner: 'revhackers' },
        { day: 'Dia 2', action: 'Direcionamento de Arquitetura de CRM', outcome: 'Novo modelo de funil desenhado', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Desenho de campos estratégicos e propriedades', outcome: 'Esquema de dados providenciado', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Orientação para templates de e-mails comerciais', outcome: 'Scripts sugeridos para Nurturing', owner: 'revhackers' },
        { day: 'Dia 5', action: 'Revisão das Regras de Passagem de Bastão', outcome: 'Fluxo ideal estruturado para adoção', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Definição de papéis e próximos passos', outcome: 'RACI e plano de adoção validados', owner: 'ambos' },
        { day: 'Dia 7', action: 'Mentoria com líderes de Vendas e Operação', outcome: 'Alinhamento da governança do novo CRM', owner: 'ambos' },
    ]
};

// ── Owner label helper ────────────────────────────────────────────────────
function OwnerBadge({ owner }: { owner?: string }) {
    if (!owner) return null;
    const config = {
        revhackers: { label: 'RevHackers', icon: Users, color: 'text-zinc-500 bg-zinc-100' },
        cliente: { label: 'Cliente', icon: User, color: 'text-[#00CC6A] bg-[#00CC6A]/10' },
        ambos: { label: 'Conjunto', icon: Users, color: 'text-zinc-400 bg-zinc-50 border border-zinc-200' },
    }[owner] || { label: owner, icon: User, color: 'text-zinc-400 bg-zinc-50' };

    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config.color}`}>
            <Icon className="w-2.5 h-2.5" />
            {config.label}
        </span>
    );
}

export default function QuickWinsSection({ plan }: { plan: any }) {
    const { isEditing, getField, setField } = usePlanEdit();
    const diagnostic = plan?.diagnostic_data || {};
    const projectType = plan?.rei_projects?.type || plan?.project_type || 'default';
    const isConsultative = plan?.form_data?.project_duration === '30_days' || plan?.diagnostic_data?.roadmap_data?.project_duration === '30_days';
    
    // Choose appropriate fallback base
    const baseFallback = isConsultative && fallbackConsultative[projectType] 
        ? fallbackConsultative[projectType] 
        : (fallbackByType[projectType] || fallbackByType.default);

    const quickWins = diagnostic.quick_wins || baseFallback;

    // Status tracking
    const getStatuses = (): boolean[] => {
        return getField('diagnostic_data.quick_wins_completed') || plan?.diagnostic_data?.quick_wins_completed || [];
    };

    const toggleComplete = (index: number) => {
        if (!isEditing) return;
        const current = [...getStatuses()];
        while (current.length <= index) current.push(false);
        current[index] = !current[index];
        setField('diagnostic_data.quick_wins_completed', current);
    };

    const statuses = getStatuses();
    const completedCount = statuses.filter(Boolean).length;

    // Split tasks into rows for the horizontal S-curve layout
    // Row 1: first half (left to right), Row 2: second half (right to left)
    const midpoint = Math.ceil(quickWins.length / 2);
    const row1 = quickWins.slice(0, midpoint);
    const row2 = quickWins.slice(midpoint);

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow={isConsultative ? "Alinhamento Imediato" : "Aceleração Imediata"}
                    titleLine1="Primeiros"
                    titleLine2="7 Dias"
                    description={isConsultative 
                        ? "As diretrizes concretas e mapeamentos da primeira semana. Estrutura desenhada para guiar a sua operação financeira e comercial sem achismos."
                        : "Tempo é dinheiro. Estas são as entregas concretas da sua primeira semana com a RevHackers. Resultados visíveis antes de qualquer sprint, sem esperar 90 dias para ver valor."}
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full">

                {/* Progress indicator */}
                {completedCount > 0 && (
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8 pb-6 border-b border-zinc-100">
                        <div className="flex-1 max-w-md h-[3px] bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#00CC6A] transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${(completedCount / quickWins.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-[#00CC6A] uppercase tracking-widest shrink-0">
                            {completedCount} DE {quickWins.length} CONCLUÍDAS
                        </span>
                    </div>
                )}

                {/* ── Sleek Vertical List (2 Columns) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                    {quickWins.map((win: any, i: number) => {
                        const isComplete = statuses[i] || false;
                        return (
                            <TimelineCard
                                key={i}
                                win={win}
                                index={i}
                                isComplete={isComplete}
                                isEditing={isEditing}
                                toggleComplete={toggleComplete}
                            />
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 mt-16 max-w-2xl">
                    <span className="text-[#00CC6A] shrink-0 text-sm">/</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {completedCount === quickWins.length && quickWins.length > 0
                            ? 'Sprint 1 Concluída'
                            : 'Fundação Sólida > Próxima Fase'
                        }
                    </span>
                    <div className="h-[1px] flex-1 bg-zinc-200/50" />
                </div>
            </div>
        </div>
    );
}

// ── Timeline Card Component ──────────────────────────────────────────────
function TimelineCard({
    win,
    index,
    isComplete,
    isEditing,
    toggleComplete,
}: {
    win: any;
    index: number;
    isComplete: boolean;
    isEditing: boolean;
    toggleComplete: (i: number) => void;
}) {
    return (
        <div className={`group flex gap-5 transition-all duration-300 ${isComplete ? 'opacity-50' : ''}`}>
            {/* Left side: Day Marker */}
            <div className="shrink-0 pt-1">
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full border ${isComplete ? 'border-[#00CC6A] bg-[#00CC6A]/5 text-[#00CC6A]' : 'border-zinc-200 bg-zinc-50 text-zinc-400'} text-[10px] font-black uppercase tracking-widest`}>
                    {win.day?.replace('Dia ', 'D')}
                </span>
            </div>

            {/* Right side: Content */}
            <div className="flex-1 pb-6 border-b border-zinc-100/80 group-last:border-transparent">
                <div className="flex items-start justify-between mb-2">
                    <EditableField
                        path={`diagnostic_data.quick_wins.${index}.action`}
                        className={`text-[15px] font-bold text-zinc-900 leading-snug pr-4 ${
                            isComplete ? 'line-through decoration-zinc-300' : ''
                        }`}
                        placeholder={win.action}
                        multiline
                    />
                    {isEditing && (
                        <div
                            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                isComplete ? 'bg-[#00CC6A]' : 'border-2 border-zinc-200 hover:border-zinc-400'
                            }`}
                            onClick={() => toggleComplete(index)}
                        >
                            {isComplete && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                    )}
                </div>

                <p className="text-[13px] font-medium text-zinc-500 leading-relaxed mb-4 max-w-sm">
                    <EditableField
                        path={`diagnostic_data.quick_wins.${index}.outcome`}
                        className="bg-transparent"
                        placeholder={win.outcome}
                        multiline
                    />
                </p>

                <div className="mt-auto">
                    <OwnerBadge owner={win.owner} />
                </div>
            </div>
        </div>
    );
}
