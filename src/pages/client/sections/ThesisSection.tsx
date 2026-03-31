import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback thesis statements by type ────────────────────────────────────
const thesisFallback: Record<string, { before: string; highlight: string; after: string }> = {
    crm_ops: {
        before: 'Para escalar vendas sem perder margem, precisamos construir ',
        highlight: 'Infraestrutura de Máquina',
        after: '.',
    },
    founder: {
        before: 'Para transformar expertise em autoridade de mercado, precisamos construir ',
        highlight: 'Presença que Converte',
        after: '.',
    },
    dev: {
        before: 'Para transformar presença digital em conversão, precisamos entregar ',
        highlight: 'Arquitetura de Performance',
        after: '.',
    },
    default: {
        before: 'Para escalar sem perder margem, precisamos substituir táticas isoladas por ',
        highlight: 'Motor de Receita Integrado',
        after: '.',
    },
};

// ── Fallback pillars by type ──────────────────────────────────────────────
const fallbackPillarsByType: Record<string, { title: string; description: string }[]> = {
    crm_ops: [
        { title: 'Processos Claros', description: 'Centralizar dados, definir fases óbvias e acabar com a dependência de planilhas isoladas que atrasam a operação.' },
        { title: 'Automação de Pico', description: 'Substituir trabalho braçal por automações invisíveis. Notificações, follow-ups e transições sem erro humano.' },
        { title: 'Métricas & Governança', description: 'Dashboards que mostram onde o funil está vazando e custo de aquisição por etapa.' },
    ],
    founder: [
        { title: 'Posicionamento Cirúrgico', description: 'Nicho de autoridade, POV único e headline que posicionam antes de publicar.' },
        { title: 'Conteúdo de Autoridade', description: 'Formatos testados e cadência sustentável calibrados para o ICP.' },
        { title: 'Loop de Conversão', description: 'Seguidores viram conexões, conexões viram conversas, conversas viram chamadas.' },
    ],
    dev: [
        { title: 'Arquitetura Primeiro', description: 'Sitemap, wireframe e aprovação antes de qualquer linha de código.' },
        { title: 'Entrega Incremental', description: 'Páginas entregues por prioridade de conversão. Resultado visível toda semana.' },
        { title: 'Performance como Critério', description: 'LCP abaixo de 2.5s e GTmetrix acima de 90 são critérios de aceite.' },
    ],
    default: [
        { title: 'Receita Previsível', description: 'Três fontes de demanda paralelas que funcionam mesmo quando uma falha.' },
        { title: 'Ciclo Completo', description: 'Da atração ao fechamento ao sucesso do cliente, cada etapa conectada e medida.' },
        { title: 'Onboarding como Vantagem', description: 'Primeiro resultado entregue em 15 dias. Cada touchpoint tem dono e prazo.' },
    ],
};

// ── Component ─────────────────────────────────────────────────────────────
export default function ThesisSection({ plan }: { plan: any }) {
    const diagnostic = plan?.diagnostic_data || {};
    const projectType = plan?.rei_projects?.type || plan?.project_type || 'default';

    const aiPillars = diagnostic.thesis_pillars || [];
    const fallback = fallbackPillarsByType[projectType] || fallbackPillarsByType.default;
    const displayPillars = aiPillars.length >= 3 ? aiPillars.slice(0, 3) : fallback;

    const planThesis = diagnostic.thesis_statement;
    const typeFallback = thesisFallback[projectType] || thesisFallback.default;
    const thesis = planThesis || typeFallback;

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-14 py-8 max-w-[1400px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Tese Estratégica"
                    titleLine1="Tese De"
                    titleLine2="Crescimento"
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full max-w-[1400px] mx-auto flex flex-col items-center">
                
                {/* ── Thesis Statement ── */}
                <div className="text-center max-w-4xl mx-auto mt-2 mb-16 px-4">
                    <EditableField
                        path="diagnostic_data.thesis_statement.before"
                        className="text-xl md:text-2xl font-semibold text-zinc-800 leading-[1.4] tracking-tight inline"
                        placeholder={thesis.before}
                    />
                    {' '}
                    <EditableField
                        path="diagnostic_data.thesis_statement.highlight"
                        className="text-xl md:text-2xl font-bold text-[#00CC6A] leading-[1.4] tracking-tight inline"
                        placeholder={thesis.highlight}
                    />
                    {' '}
                    <EditableField
                        path="diagnostic_data.thesis_statement.after"
                        className="text-xl md:text-2xl font-semibold text-zinc-800 leading-[1.4] tracking-tight inline"
                        placeholder={thesis.after}
                    />
                </div>

                <div className="w-full max-w-[1400px]">
                    {/* ── Divider ── */}
                    <div className="h-px bg-zinc-200 w-full mb-16" />

                    {/* ── Pillars - editorial layout ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12 lg:gap-x-20 w-full">
                        {displayPillars.map((pillar: any, i: number) => {
                            return (
                                <div key={i} className="flex flex-col relative group">
                                    <div className="flex items-center gap-4 mb-5">
                                        <span className="text-xxs font-mono font-bold text-zinc-300 group-hover:text-[#00CC6A]/50 transition-colors shrink-0">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div className="h-px w-8 bg-zinc-200 shrink-0" />
                                    </div>
                                    
                                    <h4 className="text-reading font-bold text-zinc-900 mb-3 tracking-tight">
                                        <EditableField
                                            path={`diagnostic_data.thesis_pillars.${i}.title`}
                                            placeholder={pillar.title}
                                        />
                                    </h4>
                                    
                                    <div className="text-body text-zinc-500 font-medium leading-[1.8] group-hover:text-zinc-800 transition-colors">
                                        <EditableField
                                            path={`diagnostic_data.thesis_pillars.${i}.description`}
                                            placeholder={pillar.description}
                                            multiline
                                        />
                                    </div>

                                    {pillar.actions && pillar.actions.length > 0 && (
                                        <ul className="mt-6 space-y-2">
                                            {pillar.actions.slice(0, 3).map((action: string, j: number) => (
                                                <li key={j} className="flex items-start gap-3">
                                                    <span className="text-zinc-300 mt-[2px] shrink-0 text-tiny leading-relaxed">/</span>
                                                    <EditableField
                                                        path={`diagnostic_data.thesis_pillars.${i}.actions.${j}`}
                                                        className="text-sm leading-relaxed text-zinc-500 font-medium group-hover:text-zinc-700 transition-colors"
                                                        placeholder={action}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
