import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Default OKRs ──────────────────────────────────────────────────────────
const defaultOKRs = [
    {
        objective: 'Objetivo Estratégico do Período', label: 'O',
        description: 'Construir a fundação para crescimento de receita previsível e escalável',
        krs: [
            { label: 'RK 1', text: 'Revenue Stack 100% implementado: CRM, rastreamento e automações ativas', target: 'Sem. 2' },
            { label: 'RK 2', text: 'Pipeline com 3x o target de fechamento em oportunidades qualificadas', target: 'Mês 2' },
            { label: 'RK 3', text: 'Ciclo de vendas reduzido em 20% com automações de nutrição', target: 'Mês 3' },
        ],
        dark: true,
    },
    {
        objective: 'RK 1: Infraestrutura e Fundação', label: '01',
        krs: [
            { label: 'RK 1.1', text: 'CRM implementado com adoção do time acima de 80%', target: 'Sem. 2' },
            { label: 'RK 1.2', text: 'Conversões rastreadas de ponta a ponta: clique, lead, oportunidade e fechamento', target: 'Sem. 3' },
            { label: 'RK 1.3', text: '3 automações de acompanhamento ativas antes de qualquer campanha paga', target: 'Sem. 3' },
        ],
    },
    {
        objective: 'RK 2: Geração de Demanda', label: '02',
        krs: [
            { label: 'RK 2.1', text: 'Custo por lead abaixo do benchmark do segmento nos primeiros 30 dias', target: 'Mês 1' },
            { label: 'RK 2.2', text: 'Taxa de conversão de Lead para SQL acima de 15%', target: 'Mês 2' },
            { label: 'RK 2.3', text: '3 canais de aquisição ativos e mensurados de forma independente', target: 'Mês 2' },
        ],
    },
    {
        objective: 'RK 3: Conversão e Pipeline', label: '03',
        krs: [
            { label: 'RK 3.1', text: 'Conversão de SQL para fechamento acima de 20%', target: 'Mês 2' },
            { label: 'RK 3.2', text: 'Ciclo médio de vendas abaixo de 30 dias para tickets até R$10K', target: 'Mês 2' },
            { label: 'RK 3.3', text: 'Velocidade de pipeline positiva com oportunidades evoluindo a cada semana', target: 'Contínuo' },
        ],
    },
    {
        objective: 'RK 4: Retenção e Expansão', label: '04',
        krs: [
            { label: 'RK 4.1', text: 'CAC recuperado em até 90 dias (payback abaixo de 90 dias)', target: 'Mês 3' },
            { label: 'RK 4.2', text: 'Proporção LTV:CAC igual ou acima de 3:1 como sinal de escala autorizada', target: 'Trim. 2' },
            { label: 'RK 4.3', text: 'Churn abaixo de 5% ao mês e NPS acima de 50 medido trimestralmente', target: 'Contínuo' },
        ],
    },
];

const horizonteDefault = [
    { title: 'Validação', subtitle: 'Mês 1 – 3', metric: 'Prova de Conceito', krs: ['Fundação testada', 'CAC inicial mensurado', 'Primeira conversão registrada'] },
    { title: 'Crescimento', subtitle: 'Mês 4 – 8', metric: 'Escala Controlada', krs: ['LTV:CAC ≥ 3:1', 'Velocidade de pipeline positiva', 'Escala de canais pagos'] },
    { title: 'Consolidação', subtitle: 'Mês 9 – 12', metric: 'Liderança de Mercado', krs: ['Churn < 3%', 'Canais orgânicos fortes', 'Playbook de crescimento documentado'] },
];

const horizonteCRM = [
    { title: 'Fundação', subtitle: 'Mês 1 – 3', metric: 'Adoção e Desenho', krs: ['Processos mapeados (Atual e Ideal)', 'CRM implementado 100%', 'Equipe treinada e operando'] },
    { title: 'Eficiência', subtitle: 'Mês 4 – 8', metric: 'Métrica e Velocidade', krs: ['Redução no Ciclo de Vendas', 'Aumento de Taxa de Conversão em 15%', 'Automações ativas de Passagem de Bastão'] },
    { title: 'Escala', subtitle: 'Mês 9 – 12', metric: 'Previsibilidade', krs: ['Pipeline Orientado por Dados', 'Previsão Assertiva de Receita', 'Playbook de Vendas Documentado'] },
];

const crmOKRs = [
    {
        objective: 'Objetivo Estratégico de CRM & RevOps', label: 'O',
        description: 'Construir a infraestrutura de dados para previsibilidade e escala comercial',
        krs: [
            { label: 'RK 1', text: 'Mapeamento do Processo Atual e Setup do CRM (Funil, SLA, e Motivos de Perda) concluído', target: 'Sem. 3' },
            { label: 'RK 2', text: 'Pipeline com 100% de preenchimento dos campos obrigatórios por etapa', target: 'Mês 2' },
            { label: 'RK 3', text: 'Governança ativa com análises de Win/Loss e conversão semanais', target: 'Mês 3' },
        ],
        dark: true,
    },
    {
        objective: 'RK 1: Infraestrutura e Visibilidade', label: '01',
        krs: [
            { label: 'RK 1.1', text: 'Pipelines customizados validados e publicados no CRM Central', target: 'Sem. 2' },
            { label: 'RK 1.2', text: 'Rastreamento de origens (UTMs/Pixels) conectado às oportunidades', target: 'Sem. 3' },
            { label: 'RK 1.3', text: 'Catálogo de motivos de perda padronizado e implementado', target: 'Sem. 3' },
        ],
    },
    {
        objective: 'RK 2: Governança e Processos', label: '02',
        krs: [
            { label: 'RK 2.1', text: 'SLA de Passagem de Bastão Marketing > Vendas mapeado e metrificado no sistema', target: 'Mês 1' },
            { label: 'RK 2.2', text: 'Alerta de estagnação de negócios (SLA de follow-up) programado', target: 'Mês 2' },
            { label: 'RK 2.3', text: 'Reuniões de Revisão de Pipeline utilizando painel visual padronizado', target: 'Mês 2' },
        ],
    },
    {
        objective: 'RK 3: Conversão e Velocidade', label: '03',
        krs: [
            { label: 'RK 3.1', text: 'Aumento na taxa de avanço entre etapas finais através de automação', target: 'Mês 2' },
            { label: 'RK 3.2', text: 'Redução do ciclo de vendas médio via acompanhamento e tarefas automatizadas', target: 'Mês 3' },
            { label: 'RK 3.3', text: 'Identificação clara de gargalos de conversão por vendedor/origem', target: 'Contínuo' },
        ],
    },
    {
        objective: 'RK 4: Adoção Organizacional', label: '04',
        krs: [
            { label: 'RK 4.1', text: 'Onboarding de usuários: 100% da equipe treinada nos padrões de entrada', target: 'Mês 1' },
            { label: 'RK 4.2', text: 'Menos de 10% das oportunidades sem atividade por mais de 7 dias', target: 'Mês 2' },
            { label: 'RK 4.3', text: 'Gestão visual da liderança utilizando dashboards em vez de planilhas', target: 'Contínuo' },
        ],
    },
];

export default function GoalsSection({ plan }: { plan: any }) {
    const okrs = (plan.goals_data || {}).okrs || [];
    const isCRM = (plan?.rei_projects?.type || plan?.project_type) === 'crm_ops';
    const baseOKRs = isCRM ? crmOKRs : defaultOKRs;
    const horizonte12m = isCRM ? horizonteCRM : horizonteDefault;
    const displayOKRs = okrs.length > 0 ? okrs.map((o: any, i: number) => ({ ...(baseOKRs[i] || {}), ...o })) : baseOKRs;

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4 max-w-[1400px] w-full mx-auto">
                <SectionHeader
                    eyebrow="Desempenho"
                    titleLine1="OKRs &"
                    titleLine2="Indicadores"
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-4 w-full max-w-[1400px] mx-auto space-y-12">

                {/* Legend - Sleek Row */}
                <div className="flex flex-wrap items-center gap-6 md:gap-12 border-b border-zinc-100 pb-6">
                    {[
                        { symbol: 'O', title: 'Objetivo', desc: 'Direção do período' },
                        { symbol: 'RK', title: 'Resultados-Chave', desc: 'Metas estruturais mensuráveis' },
                        { symbol: 'KPI', title: 'Indicadores', desc: 'Métricas de risco e saúde' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-sm font-bold text-zinc-900 border border-zinc-200/60">
                                {item.symbol}
                            </div>
                            <div>
                                <h4 className="font-bold text-[14px] text-zinc-900">{item.title}</h4>
                                <p className="text-[12px] text-zinc-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main OKR - Editorial Look */}
                {displayOKRs.slice(0, 1).map((okr: any, i: number) => (
                    <div key={i} className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                        {/* Primary Objective */}
                        <div className="lg:w-1/3">
                            <span className="text-[10px] text-[#00CC6A] uppercase tracking-[0.2em] font-bold mb-3 block">Objetivo Principal</span>
                            <EditableField 
                                path={`goals_data.okrs.${i}.description`} 
                                className="text-2xl md:text-3xl font-black text-zinc-900 leading-[1.15] tracking-tight" 
                                placeholder={okr.description} 
                                multiline 
                            />
                        </div>
                        
                        {/* Key Results Grid */}
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(okr.krs || []).slice(0, 3).map((kr: any, j: number) => (
                                <div key={j} className="bg-zinc-50/50 border border-zinc-200/60 rounded-xl p-6 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00CC6A] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors">{kr.label}</span>
                                        {kr.target && <span className="text-[10px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full">{kr.target}</span>}
                                    </div>
                                    <EditableField 
                                        path={`goals_data.okrs.${i}.krs.${j}.text`} 
                                        className="text-[14px] text-zinc-600 font-medium leading-[1.7]" 
                                        placeholder={kr.text} 
                                        multiline 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Secondary OKRs (2x2 grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-4 border-t border-zinc-100">
                    {displayOKRs.slice(1, 5).map((okr: any, i: number) => (
                        <div key={i} className="flex flex-col">
                            <div className="flex items-baseline gap-3 mb-5">
                                <span className="text-[11px] font-mono font-bold text-zinc-300">
                                    {okr.label || String(i + 1).padStart(2, '0')}
                                </span>
                                <EditableField 
                                    path={`goals_data.okrs.${i + 1}.objective`} 
                                    className="text-[16px] font-bold text-zinc-900 tracking-tight" 
                                    placeholder={okr.objective || okr.kr} 
                                />
                            </div>
                            <div className="space-y-4">
                                {(okr.krs || []).slice(0, 3).map((kr: any, j: number) => (
                                    <div key={j} className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                        </div>
                                        <div className="flex-1">
                                            <EditableField 
                                                path={`goals_data.okrs.${i + 1}.krs.${j}.text`} 
                                                className="text-[14px] text-zinc-600 leading-[1.6] font-medium block" 
                                                placeholder={kr.text} 
                                            />
                                            {kr.target && <span className="text-[11px] text-zinc-400 font-mono mt-1.5 block">{kr.target}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 12-Month Horizon */}
                <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 overflow-hidden mt-8">
                    <div className="mb-8">
                        <span className="text-[10px] text-[#00CC6A] uppercase tracking-[0.2em] font-bold">Horizonte de 12 Meses</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 md:gap-16">
                        {horizonte12m.map((h, i) => (
                            <div key={i} className="relative">
                                {i < 2 && <div className="hidden md:block absolute right-[-2rem] top-2 w-[1px] h-32 bg-zinc-800" />}
                                <div className="mb-6">
                                    <h4 className="text-white font-bold text-xl mb-1">{h.title}</h4>
                                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">{h.subtitle}</span>
                                </div>
                                <p className="text-[#00CC6A] text-[14px] font-bold mb-5">{h.metric}</p>
                                <div className="space-y-3">
                                    {h.krs.map((kr, j) => (
                                        <div key={j} className="flex items-start gap-3">
                                            <span className="text-zinc-600 mt-[2px] text-xs">/</span>
                                            <span className="text-[14px] text-zinc-400 font-medium leading-[1.6]">{kr}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
