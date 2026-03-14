import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback executive summary by type ────────────────────────────────────
const fallbackByType: Record<string, {
    context: string;
    problem: string;
    solution: string;
    expectedOutcome: string;
}> = {
    crm_ops: {
        context: 'Empresa B2B com processo comercial descentralizado, dados fragmentados e ausência de governança de pipeline.',
        problem: 'Sem visibilidade real sobre a operação de vendas. Decisões tomadas por feeling, não por dados. Oportunidades se perdem entre planilhas e WhatsApp.',
        solution: 'Implementação de Máquina de Vendas RevHackers — CRM centralizado, automações de passagem de bastão, governança ativa e treinamento até adoção visceral.',
        expectedOutcome: 'Pipeline 100% rastreável, ciclo de vendas reduzido em 20–40%, taxa de conversão aumentada com dados reais para escalar.',
    },
    founder: {
        context: 'Founder com expertise comprovada, mas audiência limitada e sem sistema de conversão via conteúdo.',
        problem: 'Autoridade de mercado concentrada em poucos contatos. Dependência de network pessoal para geração de oportunidades. Zero inbound.',
        solution: 'Protocolo Founder RevHackers — posicionamento cirúrgico, cadência sustentável de conteúdo e loop de conversão via LinkedIn.',
        expectedOutcome: 'Audiência qualificada 3–5x maior, 4–12 oportunidades inbound/mês, independência de cold outreach.',
    },
    dev: {
        context: 'Empresa que precisa de presença digital profissional com foco em conversão e performance.',
        problem: 'Site atual não converte, performance abaixo dos padrões, experiência mobile comprometida e sem rastreamento adequado.',
        solution: 'Projeto de desenvolvimento com arquitetura-primeiro — wireframe aprovado, entrega incremental e performance como critério de aceite.',
        expectedOutcome: 'Site com LCP < 2.5s, GTmetrix ≥ 90, conversão estimada +30–80% vs anterior, entrega em 6 semanas.',
    },
    default: {
        context: 'Empresa B2B com potencial de crescimento, mas sem motor de receita estruturado para escalar de forma previsível.',
        problem: 'Dependência de táticas isoladas, pipeline sem governança, CAC descontrolado e ausência de rastreamento ponta a ponta.',
        solution: 'Motor de Receita Integrado RevHackers — fundação técnica, geração de demanda inteligente, ativação orquestrada e expansão baseada em dados.',
        expectedOutcome: 'Receita previsível com 3 fontes de demanda paralelas, LTV:CAC ≥ 3:1 e pipeline completo da atração ao sucesso do cliente.',
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
                    description="A síntese do diagnóstico, do problema central e da solução proposta — em 60 segundos."
                />

                {/* 4 Quadrant Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden mt-10">
                    {items.map((item, i) => {
                        const isDark = i === 2; // Solution gets dark treatment
                        return (
                            <div
                                key={i}
                                className={`p-8 md:p-10 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
                            >
                                <span className={`text-[10px] font-black uppercase tracking-[0.25em] block mb-4 ${isDark ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>
                                    {item.label}
                                </span>
                                <EditableField
                                    path={item.path}
                                    className={`text-[17px] font-bold leading-relaxed ${isDark ? 'text-white' : 'text-zinc-900'}`}
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
