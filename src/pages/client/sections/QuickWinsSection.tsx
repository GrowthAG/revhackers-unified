import React from 'react';
import { Check, User, Users } from 'lucide-react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback quick wins by type ───────────────────────────────────────────
const fallbackByType: Record<string, { day: string; action: string; outcome: string; owner?: 'revhackers' | 'cliente' | 'ambos' }[]> = {
    crm_ops: [
        { day: 'Dia 1', action: 'Mapeamento do processo comercial atual', outcome: 'Documento com fluxo atual e gaps', owner: 'revhackers' },
        { day: 'Dia 2', action: 'Criar Pipeline de Vendas no CRM', outcome: 'Funil com etapas, regras e responsaveis', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Criar campos personalizados e propriedades', outcome: 'Campos customizados prontos para o time', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Criar templates de emails comerciais', outcome: 'Modelos de follow-up e nurturing prontos', owner: 'cliente' },
        { day: 'Dia 5', action: 'Criar primeira automacao de passagem de bastao', outcome: 'Lead qualificado chega ao vendedor certo', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Alocacao de tarefas entre consultoria e cliente', outcome: 'RACI definido com responsaveis claros', owner: 'ambos' },
        { day: 'Dia 7', action: 'Treinamento inicial com SDRs e Closers', outcome: 'Equipe operando no CRM desde o dia 1', owner: 'ambos' },
    ],
    founder: [
        { day: 'Dia 1', action: 'Definicao do nicho de autoridade e ICP', outcome: 'Clareza sobre quem voce atrai', owner: 'ambos' },
        { day: 'Dia 2', action: 'Otimizacao da bio, headline e banner', outcome: 'Perfil posicionado antes de publicar', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Pesquisa de 10 contas ancora no nicho', outcome: 'Mapa de formatos que performam', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Criacao do primeiro post de autoridade', outcome: 'Conteudo publicado testando formato', owner: 'ambos' },
        { day: 'Dia 5-6', action: 'Comentarios estrategicos em contas ancora', outcome: 'Visibilidade junto a audiencia do ICP', owner: 'cliente' },
        { day: 'Dia 7', action: 'Review de metricas e ajuste de pauta', outcome: 'Dados reais para calibrar estrategia', owner: 'ambos' },
    ],
    dev: [
        { day: 'Dia 1', action: 'Briefing: objetivo de cada pagina e publico', outcome: 'Documento de requisitos aprovado', owner: 'ambos' },
        { day: 'Dia 2', action: 'Sitemap com objetivo de conversao por pagina', outcome: 'Estrutura definida antes do design', owner: 'revhackers' },
        { day: 'Dia 3-4', action: 'Wireframe de baixa fidelidade das paginas', outcome: 'Rascunho que evita retrabalho caro', owner: 'revhackers' },
        { day: 'Dia 5', action: 'Definicao de stack e criterios de performance', outcome: 'Framework e metas de LCP estabelecidos', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Setup do ambiente de desenvolvimento', outcome: 'Infraestrutura pronta para design', owner: 'revhackers' },
        { day: 'Dia 7', action: 'Aprovacao do wireframe com stakeholders', outcome: 'Alinhamento antes de investir em codigo', owner: 'ambos' },
    ],
    default: [
        { day: 'Dia 1', action: 'Auditoria do Revenue Stack atual', outcome: 'Mapa de ferramentas e gaps', owner: 'revhackers' },
        { day: 'Dia 2', action: 'Rastreamento ponta a ponta (UTMs + CRM)', outcome: 'Lead rastreavel do clique ao fechamento', owner: 'revhackers' },
        { day: 'Dia 3', action: 'Setup do Pipeline com etapas e SLA', outcome: 'Funil de vendas estruturado', owner: 'revhackers' },
        { day: 'Dia 4', action: 'Primeira automacao de follow-up ativa', outcome: 'Leads qualificados automaticamente', owner: 'revhackers' },
        { day: 'Dia 5', action: 'Campanhas de captura (Search + Social)', outcome: 'Demanda gerada na primeira semana', owner: 'revhackers' },
        { day: 'Dia 6', action: 'Dashboard de performance conectado', outcome: 'Visibilidade real de CPL e pipeline', owner: 'revhackers' },
        { day: 'Dia 7', action: 'Review de fundacao com o time', outcome: 'Base solida para escalar', owner: 'ambos' },
    ],
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
    const fallback = fallbackByType[projectType] || fallbackByType.default;

    const quickWins = diagnostic.quick_wins || fallback;

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
                    eyebrow="Acao Imediata"
                    titleLine1="Primeiros"
                    titleLine2="7 Dias"
                    description="As entregas concretas da primeira semana. Resultados visiveis antes de qualquer sprint, sem esperar 90 dias."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full">

                {/* Progress indicator */}
                {completedCount > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[3px] flex-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#00CC6A] transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${(completedCount / quickWins.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-[#00CC6A] shrink-0">
                            {completedCount}/{quickWins.length}
                        </span>
                    </div>
                )}

                {/* ── Horizontal Timeline (S-curve) ── */}
                <div className="space-y-0">

                    {/* Row 1: Left to Right */}
                    <div className="relative">
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${row1.length}, minmax(0, 1fr))` }}>
                            {row1.map((win: any, i: number) => {
                                const isComplete = statuses[i] || false;
                                const globalIndex = i;
                                return (
                                    <TimelineCard
                                        key={globalIndex}
                                        win={win}
                                        index={globalIndex}
                                        isComplete={isComplete}
                                        isEditing={isEditing}
                                        toggleComplete={toggleComplete}
                                    />
                                );
                            })}
                        </div>

                        {/* Connecting line Row 1 */}
                        <div className="absolute left-4 right-4 top-[calc(100%+6px)] h-[2px] bg-zinc-200 rounded-full" />

                        {/* Dots on the line for Row 1 */}
                        <div className="relative h-[14px] mt-[0px]">
                            <div className="absolute left-4 right-4 top-[6px] flex justify-between">
                                {row1.map((_: any, i: number) => {
                                    const isComplete = statuses[i] || false;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-[10px] h-[10px] rounded-full border-2 transition-all ${
                                                isComplete
                                                    ? 'bg-[#00CC6A] border-[#00CC6A]'
                                                    : 'bg-white border-zinc-300'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* S-curve connector (right side bend) */}
                    <div className="flex justify-end pr-4">
                        <div className="w-[2px] h-8 bg-zinc-200 rounded-full" />
                    </div>

                    {/* Row 2: Right to Left (reversed) */}
                    <div className="relative">
                        {/* Dots on the line for Row 2 */}
                        <div className="relative h-[14px] mb-[0px]">
                            <div className="absolute left-4 right-4 top-[2px] flex justify-between flex-row-reverse">
                                {row2.map((_: any, i: number) => {
                                    const globalIndex = midpoint + i;
                                    const isComplete = statuses[globalIndex] || false;
                                    return (
                                        <div
                                            key={i}
                                            className={`w-[10px] h-[10px] rounded-full border-2 transition-all ${
                                                isComplete
                                                    ? 'bg-[#00CC6A] border-[#00CC6A]'
                                                    : 'bg-white border-zinc-300'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Connecting line Row 2 */}
                        <div className="absolute left-4 right-4 top-[8px] h-[2px] bg-zinc-200 rounded-full" />

                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${row2.length}, minmax(0, 1fr))` }}>
                            {[...row2].reverse().map((win: any, i: number) => {
                                const globalIndex = midpoint + (row2.length - 1 - i);
                                const isComplete = statuses[globalIndex] || false;
                                return (
                                    <TimelineCard
                                        key={globalIndex}
                                        win={win}
                                        index={globalIndex}
                                        isComplete={isComplete}
                                        isEditing={isEditing}
                                        toggleComplete={toggleComplete}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 mt-6">
                    <span className="text-[#00CC6A] shrink-0 text-sm">/</span>
                    <span className="text-[11px] font-bold text-[#00CC6A] uppercase tracking-widest">
                        {completedCount === quickWins.length && quickWins.length > 0
                            ? 'Sprint 1 Concluida'
                            : 'Fundacao Solida > Proxima Fase'
                        }
                    </span>
                    <div className="h-[2px] flex-1 bg-zinc-100 rounded-full" />
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
        <div className={`transition-opacity duration-200 ${isComplete ? 'opacity-50' : ''}`}>
            <div className={`border rounded-xl p-4 bg-white h-full flex flex-col ${
                isComplete ? 'border-[#00CC6A]/30' : 'border-zinc-200'
            }`}>
                {/* Day badge + check */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00CC6A] bg-[#00CC6A]/10 px-2.5 py-1 rounded-md">
                        {win.day}
                    </span>
                    {isEditing && (
                        <div
                            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all ${
                                isComplete ? 'bg-[#00CC6A]' : 'border-2 border-zinc-200 hover:border-zinc-400'
                            }`}
                            onClick={() => toggleComplete(index)}
                        >
                            {isComplete && <Check className="w-[10px] h-[10px] text-white" strokeWidth={3} />}
                        </div>
                    )}
                </div>

                {/* Action */}
                <EditableField
                    path={`diagnostic_data.quick_wins.${index}.action`}
                    className={`text-[13px] font-bold text-zinc-900 leading-snug mb-2 block flex-1 ${
                        isComplete ? 'line-through decoration-zinc-300' : ''
                    }`}
                    placeholder={win.action}
                    multiline
                />

                {/* Outcome */}
                <p className="text-[11px] font-medium text-zinc-400 leading-relaxed mb-2">
                    <EditableField
                        path={`diagnostic_data.quick_wins.${index}.outcome`}
                        className="bg-transparent"
                        placeholder={win.outcome}
                        multiline
                    />
                </p>

                {/* Owner badge */}
                <OwnerBadge owner={win.owner} />
            </div>
        </div>
    );
}
