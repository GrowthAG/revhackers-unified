import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { Settings, BarChart3, Radio, Megaphone, Globe, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Maturity Score Calculator ──────────────────────────────────────────────
function calculateMaturityScores(context: any) {
    const maturity = (context?.maturity || '').toLowerCase();
    const noCRM = maturity.includes('sem crm') || maturity.includes('não tem');
    const hasCRM = maturity.includes('crm') || maturity.includes('inicial');

    const crmScore = noCRM ? 10 : hasCRM ? 25 : 50;
    const mediaScore = maturity.includes('sem') ? 15 : 35;
    const seoScore = 20;
    const automationScore = noCRM ? 5 : 20;

    return [
        {
            name: 'CRM & Pipeline',
            icon: <BarChart3 className="w-3.5 h-3.5" />,
            score: crmScore,
            status: crmScore < 30 ? 'Crítico' : crmScore < 60 ? 'Parcial' : 'Estruturado',
            detail: noCRM ? 'Sem CRM ativo, rastreamento manual' : 'CRM básico, precisa de automação',
        },
        {
            name: 'Mídia & Aquisição',
            icon: <Megaphone className="w-3.5 h-3.5" />,
            score: mediaScore,
            status: mediaScore < 30 ? 'Inicial' : mediaScore < 60 ? 'Em Ramp-up' : 'Otimizado',
            detail: 'Canais precisam de ativação e otimização',
        },
        {
            name: 'Conteúdo & SEO',
            icon: <Globe className="w-3.5 h-3.5" />,
            score: seoScore,
            status: seoScore < 30 ? 'Inexistente' : seoScore < 60 ? 'Básico' : 'Estruturado',
            detail: 'Estratégia de conteúdo a estruturar',
        },
        {
            name: 'Automação',
            icon: <Zap className="w-3.5 h-3.5" />,
            score: automationScore,
            status: automationScore < 30 ? 'Não implementado' : automationScore < 60 ? 'Parcial' : 'Ativo',
            detail: 'Fluxos de nutrição e cadências pendentes',
        },
    ];
}

// ── Score Bar ──────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
    const color = score < 30 ? '#ef4444' : score < 60 ? '#f59e0b' : '#22c55e';
    return (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}</span>
        </div>
    );
}

// ── Default Data ──────────────────────────────────────────────────────────
const defaultSignals = [
    { text: 'Ausência de CRM ativo', impact: 'Impossível rastrear leads, calcular CAC ou otimizar o funil sem esta base', type: 'critical' },
    { text: 'Sem rastreamento de conversão', impact: 'Budget alocado sem dados reais de performance ou ROI mensurável', type: 'critical' },
    { text: 'Concentração em 1 canal', impact: 'Se o canal principal falhar, receita cai imediatamente', type: 'warning' },
];

const defaultRisks = [
    { text: 'Receita não rastreável', mitigation: 'Implementar CRM na semana 1 como bloqueador zero de qualquer ação', severity: 'high' },
    { text: 'CAC desconhecido', mitigation: 'Setup de tracking completo (UTMs, pixels) antes de ativar mídia paga', severity: 'high' },
    { text: 'Dependência de canal único', mitigation: 'Testar 2-3 canais e alocar budget pelo menor CAC após 45 dias', severity: 'medium' },
];

const defaultDecisions = [
    {
        title: 'CRM como Infraestrutura Mínima',
        recommendation: 'Implementar CRM na primeira semana. Sem ele, nenhuma ação de Growth tem ROI mensurável.',
        ruleApplied: 'CRM primeiro, Growth depois',
    },
    {
        title: 'Funil de Alta Intenção',
        recommendation: 'Foco em tráfego de alta intenção + CRO da página de vendas antes de escalar budget.',
        ruleApplied: 'Converter antes de amplificar',
    },
];

const defaultContext = {
    segment: 'Generalista',
    objective: 'Crescimento',
    maturity: 'Inicial (Sem CRM estruturado)',
    restrictions: 'Budget a definir',
};

// ── DiagnosticSection ─────────────────────────────────────────────────────
export default function DiagnosticSection({ plan }: { plan: any }) {
    const diagnostic = plan.diagnostic_data || {};
    const context = diagnostic.context_mirror || defaultContext;
    const signals = diagnostic.signals?.length > 0 ? diagnostic.signals : defaultSignals;
    const risks = diagnostic.risks?.length > 0 ? diagnostic.risks : defaultRisks;
    const decisions = diagnostic.decisions?.length > 0 ? diagnostic.decisions : defaultDecisions;
    const maturityScores = calculateMaturityScores(context);
    const overallScore = Math.round(maturityScores.reduce((sum, m) => sum + m.score, 0) / maturityScores.length);

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <SectionHeader
                    eyebrow="Análise Inicial"
                    titleLine1="Diagnóstico"
                    titleLine2="Estratégico"
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-12 pb-6 pt-0 max-w-[1600px] mx-auto w-full bg-white flex flex-col justify-center gap-4">

                {/* Context grid + Maturity score */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* CONTEXTO card */}
                    <div className="md:col-span-2 bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <Settings className="w-5 h-5 text-zinc-900" />
                            <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">Contexto</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Segmento', path: 'diagnostic_data.context_mirror.segment', value: context.segment },
                                { label: 'Objetivo', path: 'diagnostic_data.context_mirror.objective', value: context.objective },
                                { label: 'Maturidade', path: 'diagnostic_data.context_mirror.maturity', value: context.maturity },
                                { label: 'Restrições', path: 'diagnostic_data.context_mirror.restrictions', value: context.restrictions },
                            ].map((item, i) => (
                                <div key={i} className="border border-zinc-100 bg-zinc-50 p-3 rounded-lg">
                                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest block mb-1">{item.label}</span>
                                    <EditableField
                                        path={item.path}
                                        className="text-sm text-zinc-900 font-bold leading-tight"
                                        placeholder={item.value || 'A definir'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maturidade Digital Score */}
                    <div className="md:col-span-3 border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-3.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-black" />
                                <span className="text-xs font-black text-black tracking-widest uppercase">Maturidade Digital</span>
                            </div>
                            <div className="bg-zinc-50 px-3 py-1.5 rounded flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Score</span>
                                <span className="text-sm font-black text-black">{overallScore}/100</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {maturityScores.map((item, i) => {
                                const statusCls = item.score < 30 ? 'text-zinc-500 font-bold' : item.score < 60 ? 'text-amber-500 font-bold' : 'text-green-500 font-bold';
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                                            {React.cloneElement(item.icon, { className: 'w-3 h-3' })}
                                        </div>
                                        <div className="w-28 shrink-0">
                                            <p className="text-xs font-black text-black tracking-wider uppercase leading-none mb-0.5 line-clamp-1" title={item.name}>{item.name}</p>
                                            <span className={`text-xs uppercase tracking-widest ${statusCls}`}>{item.status}</span>
                                        </div>
                                        <ScoreBar score={item.score} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sinais Estratégicos + Matriz de Riscos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Sinais Estratégicos */}
                    <div>
                        <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5" /> Sinais Estratégicos
                        </h4>
                        <div className="space-y-1.5">
                            {signals.map((signal: any, i: number) => {
                                const isCritical = signal.type === 'critical' || signal.type === 'negative';
                                return (
                                    <div key={i} className={`p-2 border bg-white border-l-[3px] ${isCritical ? 'border-zinc-200 border-l-zinc-950' : 'border-amber-200 border-l-amber-400'}`}>
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <EditableField
                                                path={`diagnostic_data.signals.${i}.text`}
                                                className="text-[11px] font-bold text-black leading-tight flex-1"
                                                placeholder={signal.text}
                                            />
                                            <span className={`text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 shrink-0 ${isCritical ? 'bg-zinc-950 text-white' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                                {isCritical ? 'Crítico' : 'Atenção'}
                                            </span>
                                        </div>
                                        <EditableField
                                            path={`diagnostic_data.signals.${i}.impact`}
                                            className="text-xs text-zinc-500 leading-snug line-clamp-1"
                                            placeholder={signal.impact}
                                            multiline={false}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Matriz de Riscos */}
                    <div>
                        <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Matriz de Riscos
                        </h4>
                        <div className="space-y-1.5">
                            {risks.map((risk: any, i: number) => {
                                const isHigh = (risk.severity || 'high') === 'high';
                                return (
                                    <div key={i} className={`p-2 border bg-white border-l-[3px] ${isHigh ? 'border-zinc-200 border-l-zinc-950' : 'border-amber-200 border-l-amber-400'}`}>
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <EditableField
                                                path={`diagnostic_data.risks.${i}.text`}
                                                className="text-[11px] font-bold text-zinc-900 leading-tight flex-1"
                                                placeholder={risk.text}
                                            />
                                            <span className={`text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 shrink-0 ${isHigh ? 'bg-zinc-950 text-white' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                                {isHigh ? 'Alto' : 'Médio'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1">
                                            <span className="text-xs text-zinc-400 uppercase font-bold tracking-widest shrink-0 mt-0.5">Mitigação:</span>
                                            <EditableField
                                                path={`diagnostic_data.risks.${i}.mitigation`}
                                                className="text-xs text-zinc-600 leading-snug line-clamp-1"
                                                placeholder={risk.mitigation}
                                                multiline={false}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Decisões Mandatórias */}
                {decisions.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" /> Decisões Mandatórias
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {decisions.map((dec: any, i: number) => (
                                <div key={i} className="bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow rounded-lg p-3">
                                    <h4 className="text-[11px] font-black text-zinc-900 mb-1">{dec.title}</h4>
                                    <p className="text-xs text-zinc-500 leading-snug mb-2 line-clamp-1">{dec.recommendation}</p>
                                    <div className="pt-1.5 border-t border-zinc-100">
                                        <span className="text-[11px] font-black text-green-600 uppercase tracking-widest">
                                            Lógica: {dec.ruleApplied}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
