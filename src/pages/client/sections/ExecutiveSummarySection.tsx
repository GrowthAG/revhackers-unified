import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback executive summary by type ────────────────────────────────────
// NOTE: These are only used when AI generation fails completely.
// With the passthrough fix, AI-generated content should always be available.
const fallbackByType: Record<string, {
    context: string;
    problem: string;
    solution: string;
    expectedOutcome: string;
}> = {
    crm_ops: {
        context: '',
        problem: '',
        solution: '',
        expectedOutcome: '',
    },
    founder: {
        context: '',
        problem: '',
        solution: '',
        expectedOutcome: '',
    },
    dev: {
        context: '',
        problem: '',
        solution: '',
        expectedOutcome: '',
    },
    default: {
        context: '',
        problem: '',
        solution: '',
        expectedOutcome: '',
    },
};

export default function ExecutiveSummarySection({ plan }: { plan: any }) {
    const diagnostic = plan?.diagnostic_data || {};
    const projectType = plan?.rei_projects?.type || plan?.project_type || 'default';
    const fallback = fallbackByType[projectType] || fallbackByType.default;

    // AI-generated executive summary (from edge function) or fallback
    const summary = diagnostic.executive_summary || {};
    const companyName = diagnostic.context_mirror?.segment || plan?.client_name || '';

    const items = [
        {
            label: 'Contexto',
            path: 'diagnostic_data.executive_summary.context',
            value: summary.context || fallback.context,
        },
        {
            label: 'Problema Central',
            path: 'diagnostic_data.executive_summary.problem',
            value: summary.problem || fallback.problem,
        },
        {
            label: 'Solução Proposta',
            path: 'diagnostic_data.executive_summary.solution',
            value: summary.solution || fallback.solution,
        },
        {
            label: 'Resultado Esperado',
            path: 'diagnostic_data.executive_summary.expected_outcome',
            value: summary.expected_outcome || fallback.expectedOutcome,
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="my-auto px-6 md:px-10 lg:px-14 py-8 max-w-[1400px] mx-auto w-full">
                <SectionHeader
                    eyebrow="Visão Geral"
                    titleLine1="Resumo"
                    titleLine2="Executivo"
                    description="A síntese do diagnóstico, do problema central e da solução proposta, em 60 segundos."
                />

                {/* 4 Quadrant Grid - Notion Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                    {items.map((item, i) => {
                        return (
                            <div
                                key={i}
                                className="p-8 md:p-10 bg-zinc-50 border border-zinc-200 rounded-3xl group hover:border-zinc-300 transition-colors"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] block mb-4 text-zinc-400">
                                    {item.label}
                                </span>
                                <EditableField
                                    path={item.path}
                                    className="text-[16px] font-medium leading-relaxed text-zinc-600 group-hover:text-zinc-800 transition-colors"
                                    placeholder={item.value}
                                    multiline
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Bottom accent line */}
                <div className="flex items-center gap-3 mt-8">
                    <span className="text-[#00CC6A] shrink-0 text-sm">/</span>
                    <span className="text-[11px] font-bold text-[#00CC6A] uppercase tracking-widest">
                        Diagnóstico Completo nas Próximas Seções
                    </span>
                    <div className="h-[2px] flex-1 bg-zinc-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}
