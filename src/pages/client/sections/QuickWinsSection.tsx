import React from 'react';
import { Check } from 'lucide-react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback quick wins by type ───────────────────────────────────────────
const fallbackByType: Record<string, { day: string; action: string; outcome: string }[]> = {
    crm_ops: [
        { day: 'Dia 1', action: 'Mapeamento completo do processo comercial atual', outcome: 'Documento com fluxo atual e gaps identificados' },
        { day: 'Dia 2', action: 'Definição do Processo Ideal (novo fluxo de vendas)', outcome: 'Desenho aprovado pela liderança comercial' },
        { day: 'Dia 3', action: 'Configuração do Pipeline Principal no CRM', outcome: 'Funil estruturado com etapas, regras e responsáveis' },
        { day: 'Dia 4–5', action: 'Setup de propriedades obrigatórias e motivos de perda', outcome: 'Campos customizados prontos para o time preencher' },
        { day: 'Dia 6', action: 'Primeira automação de passagem de bastão ativa', outcome: 'Lead qualificado chega automaticamente ao vendedor certo' },
        { day: 'Dia 7', action: 'Treinamento inicial com SDRs e Closers no sistema', outcome: 'Equipe operando no CRM desde o primeiro dia útil' },
    ],
    founder: [
        { day: 'Dia 1', action: 'Definição do nicho de autoridade e ICP do perfil', outcome: 'Clareza sobre quem você atrai e por que escolhem você' },
        { day: 'Dia 2', action: 'Otimização da bio, headline e banner do LinkedIn', outcome: 'Perfil posicionado antes de qualquer publicação' },
        { day: 'Dia 3', action: 'Pesquisa de 10 contas âncora no nicho para benchmark', outcome: 'Mapa de formatos e temas que performam no segmento' },
        { day: 'Dia 4', action: 'Criação do primeiro post de autoridade (carrossel ou texto)', outcome: 'Conteúdo publicado testando formato e voz' },
        { day: 'Dia 5–6', action: 'Comentários estratégicos em 5 posts de contas âncora/dia', outcome: 'Visibilidade inicial junto à audiência do ICP' },
        { day: 'Dia 7', action: 'Review de métricas do primeiro post e ajuste de pauta', outcome: 'Dados reais para calibrar a estratégia de conteúdo' },
    ],
    dev: [
        { day: 'Dia 1', action: 'Briefing completo: objetivo de cada página e público-alvo', outcome: 'Documento de requisitos aprovado e sem ambiguidades' },
        { day: 'Dia 2', action: 'Sitemap com objetivo de conversão por página mapeado', outcome: 'Estrutura do site definida antes de qualquer design' },
        { day: 'Dia 3–4', action: 'Wireframe de baixa fidelidade das páginas principais', outcome: 'Rascunho aprovado que evita retrabalho caro no código' },
        { day: 'Dia 5', action: 'Definição da stack tecnológica e critérios de performance', outcome: 'Framework, hosting e metas de LCP/GTmetrix estabelecidos' },
        { day: 'Dia 6', action: 'Setup do ambiente de desenvolvimento e repositório', outcome: 'Infraestrutura pronta para iniciar o design de alta fidelidade' },
        { day: 'Dia 7', action: 'Aprovação do wireframe com stakeholders', outcome: 'Alinhamento garantido antes de investir em design e código' },
    ],
    default: [
        { day: 'Dia 1', action: 'Auditoria do Revenue Stack atual (CRM, automação, analytics)', outcome: 'Mapa completo de ferramentas, integrações e gaps' },
        { day: 'Dia 2', action: 'Configuração de rastreamento ponta a ponta (UTMs + pixels + CRM)', outcome: 'Cada lead rastreável desde o primeiro clique até o fechamento' },
        { day: 'Dia 3', action: 'Setup do Pipeline no CRM com etapas, SLA e responsáveis', outcome: 'Funil de vendas estruturado e pronto para receber leads' },
        { day: 'Dia 4', action: 'Primeira automação de follow-up e lead scoring ativa', outcome: 'Leads qualificados automaticamente sem trabalho manual' },
        { day: 'Dia 5', action: 'Criação das primeiras campanhas de captura (Search + Social)', outcome: 'Demanda sendo gerada antes do fim da primeira semana' },
        { day: 'Dia 6', action: 'Dashboard de performance com métricas-chave conectado', outcome: 'Visibilidade em tempo real de CPL, conversão e pipeline' },
        { day: 'Dia 7', action: 'Review de fundação com o time: tudo operando, próximos passos definidos', outcome: 'Confiança de que a base está sólida para escalar' },
    ],
};

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

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Ação Imediata"
                    titleLine1="Primeiros"
                    titleLine2="7 Dias"
                    description="As entregas concretas da primeira semana. Resultados visíveis antes de qualquer sprint — sem esperar 90 dias."
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

                {/* Timeline */}
                <div className="space-y-0">
                    {quickWins.map((win: any, i: number) => {
                        const isComplete = statuses[i] || false;
                        const isLast = i === quickWins.length - 1;

                        return (
                            <div key={i} className="flex gap-6">
                                {/* Timeline line + dot */}
                                <div className="flex flex-col items-center shrink-0">
                                    <div
                                        className={`w-[17px] h-[17px] rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${isEditing ? 'cursor-pointer hover:scale-[1.2]' : ''
                                            } ${isComplete ? 'bg-[#00CC6A]' : 'border-2 border-zinc-200'}`}
                                        onClick={() => toggleComplete(i)}
                                        title={isEditing ? (isComplete ? 'Desmarcar' : 'Marcar concluído') : ''}
                                    >
                                        {isComplete && <Check className="w-[10px] h-[10px] text-white" strokeWidth={3} />}
                                    </div>
                                    {!isLast && (
                                        <div className={`w-[2px] flex-1 min-h-[2rem] ${isComplete ? 'bg-[#00CC6A]/30' : 'bg-zinc-100'}`} />
                                    )}
                                </div>

                                {/* Content card */}
                                <div className={`flex-1 pb-6 ${isComplete ? 'opacity-60' : ''}`}>
                                    <div className="border border-zinc-200 rounded-xl p-5 bg-white">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5 rounded-md">
                                                {win.day}
                                            </span>
                                        </div>
                                        <EditableField
                                            path={`diagnostic_data.quick_wins.${i}.action`}
                                            className={`text-[15px] font-bold text-zinc-900 leading-snug mb-2 block ${isComplete ? 'line-through decoration-zinc-300' : ''}`}
                                            placeholder={win.action}
                                            multiline
                                        />
                                        <div className="flex items-start gap-2 mt-2">
                                            <span className="text-zinc-300 shrink-0 text-sm mt-0.5">/</span>
                                            <EditableField
                                                path={`diagnostic_data.quick_wins.${i}.outcome`}
                                                className="text-[13px] font-medium text-zinc-500 leading-relaxed"
                                                placeholder={win.outcome}
                                                multiline
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 mt-4">
                    <span className="text-[#00CC6A] shrink-0 text-sm">/</span>
                    <span className="text-[11px] font-bold text-[#00CC6A] uppercase tracking-widest">
                        {completedCount === quickWins.length && quickWins.length > 0
                            ? 'Sprint 1 Concluída'
                            : 'Fundação Sólida → Próxima Fase'
                        }
                    </span>
                    <div className="h-[2px] flex-1 bg-zinc-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}
