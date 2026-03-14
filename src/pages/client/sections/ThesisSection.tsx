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

                {/* ── Thesis Statement ── */}
                <div className="text-center max-w-3xl mx-auto mt-10 mb-12">
                    <EditableField
                        path="diagnostic_data.thesis_statement.before"
                        className="text-xl md:text-[1.75rem] font-black text-zinc-900 leading-[1.25] tracking-tight inline"
                        placeholder={thesis.before}
                    />
                    <EditableField
                        path="diagnostic_data.thesis_statement.highlight"
                        className="text-xl md:text-[1.75rem] font-black text-[#00CC6A] leading-[1.25] tracking-tight inline"
                        placeholder={thesis.highlight}
                    />
                    <EditableField
                        path="diagnostic_data.thesis_statement.after"
                        className="text-xl md:text-[1.75rem] font-black text-zinc-900 leading-[1.25] tracking-tight inline"
                        placeholder={thesis.after}
                    />
                </div>

                {/* ── Divider ── */}
                <div className="h-px bg-zinc-200 max-w-4xl mx-auto mb-12" />

                {/* ── Pillars — editorial layout ── */}
                <div className="flex flex-col md:flex-row max-w-5xl mx-auto">
                    {displayPillars.map((pillar: any, i: number) => {
                        const isLast = i === displayPillars.length - 1;
                        return (
                            <React.Fragment key={i}>
                                {i > 0 && <div className="hidden md:block w-px bg-zinc-100 shrink-0" />}
                                {i > 0 && <div className="md:hidden h-px bg-zinc-100 w-full" />}
                                <div className={`flex-1 py-6 md:py-0 md:px-8 first:md:pl-0 last:md:pr-0 ${i === 0 ? 'md:pr-8' : ''}`}>
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest block mb-3">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <EditableField
                                        path={`diagnostic_data.thesis_pillars.${i}.title`}
                                        className="text-base font-bold text-zinc-900 mb-2.5 block"
                                        placeholder={pillar.title}
                                    />
                                    <EditableField
                                        path={`diagnostic_data.thesis_pillars.${i}.description`}
                                        className="text-sm text-zinc-500 leading-relaxed font-medium"
                                        placeholder={pillar.description}
                                        multiline
                                    />

                                    {pillar.actions && pillar.actions.length > 0 && (
                                        <ul className="mt-4 space-y-1.5">
                                            {pillar.actions.slice(0, 3).map((action: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2">
                                                    <span className="text-zinc-300 shrink-0 text-sm">/</span>
                                                    <EditableField
                                                        path={`diagnostic_data.thesis_pillars.${i}.actions.${j}`}
                                                        className="text-xs text-zinc-400 leading-snug"
                                                        placeholder={action}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
