import React, { Fragment, cloneElement } from 'react';
import { Settings, Zap, Target, Repeat, ChevronRight } from 'lucide-react';

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
        dark: true,
    },
    {
        phase: '02', name: 'Geração de Demanda Inteligente', tagline: 'Semana 2–6',
        description: 'Ativamos os canais de aquisição corretos para o seu perfil de ICP — não todos ao mesmo tempo. Estruturamos três fluxos de entrada: inbound via autoridade e SEO, outbound via prospecção ativa e segmentada, e parcerias via network estratégico.',
        principles: ['Seeds: network e indicação ativada com processo', 'Nets: campanha de demanda segmentada por ICP', 'Spears: outreach personalizado para contas-alvo', 'Primeiro ROAS obtido em até 30 dias de campanha'],
        dark: false,
    },
    {
        phase: '03', name: 'Ativação & Onboarding Orquestrado', tagline: 'Semana 3–8',
        description: 'O momento crítico é logo após a compra — e a maioria das empresas abandona o cliente. Estruturamos uma jornada de ativação em milestones com momentos de verdade: cada touchpoint tem um dono, um prazo e um resultado esperado.',
        principles: ['Momento de Verdade 1: ativação em 24h após fechamento', 'Momento de Verdade 2: primeiro resultado entregue em 15 dias', 'Momento de Verdade 3: review de resultados no dia 90', 'Automações de nurturing com cadência adaptada ao comportamento'],
        dark: true,
    },
    {
        phase: '04', name: 'Expansão & Revenue Engine', tagline: 'Mês 2 em diante',
        description: 'Com dados reais de CAC, LTV, ROAS e churn, ativamos o loop de crescimento. O cliente que ativa, tem sucesso e se torna defensor. Esse defensor gera novos leads com custo zero — completando o Bowtie de receita.',
        principles: ['Pipeline Velocity calculada e otimizada mensalmente', 'LTV:CAC acima de 3:1 como critério de escala', 'Expansão de conta: upsell e cross-sell no pipeline', 'Reviews mensais RAPT — Revisão, Alinhamento, Prioridade, Tática'],
        dark: false,
    },
];

// ── Differentials ─────────────────────────────────────────────────────────
const differentials = [
    { icon: <Settings className="w-5 h-5" />, title: 'Receita Previsível', desc: 'Três fontes de demanda paralelas (Seeds, Nets, Spears) que funcionam mesmo quando uma falha.' },
    { icon: <Repeat className="w-5 h-5" />, title: 'Bowtie Revenue Loop', desc: 'Da atração ao fechamento ao sucesso do cliente — cada etapa conectada e medida.' },
    { icon: <Target className="w-5 h-5" />, title: 'Onboarding como Vantagem', desc: 'O primeiro resultado entregue em 15 dias determina o LTV. Cada touchpoint tem dono e prazo.' },
];

export default function MethodologySection({ plan }: { plan: any }) {
    const steps = (plan.methodology_data || {}).steps || [];
    const displaySteps = steps.length < 3 ? defaultSteps : steps.map((s: any, i: number) => ({ ...(defaultSteps[i] || {}), ...s }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-px bg-zinc-900" />
                    <span className="text-xs text-zinc-400 uppercase tracking-[0.2em]">Como fazemos</span>
                </div>
                <h2 className="text-3xl font-bold text-black tracking-tight">
                    Metodologia <span className="text-zinc-400">RevHackers™</span>
                </h2>
            </div>

            {/* Pipeline Flow Bar */}
            <div className="flex items-stretch gap-0 overflow-hidden border border-zinc-200">
                {pipelineStages.map((stage, i) => (
                    <Fragment key={i}>
                        <div className={`flex-1 py-4 px-3 ${stage.color} flex flex-col items-center justify-center text-center`}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${stage.color.includes('text-white') ? 'text-white/50' : stage.color.includes('text-black') ? 'text-black/60' : 'text-zinc-400'}`}>
                                {stage.sub}
                            </p>
                            <p className={`font-bold text-sm ${stage.color.includes('text-white') ? 'text-white' : 'text-black'}`}>
                                {stage.label}
                            </p>
                        </div>
                        {i < pipelineStages.length - 1 && (
                            <div className={`flex items-center ${stage.color} px-0.5`}>
                                <ChevronRight className={`w-3 h-3 ${stage.color.includes('text-white') ? 'text-white/30' : 'text-zinc-400'}`} />
                            </div>
                        )}
                    </Fragment>
                ))}
            </div>

            {/* 4 Phase Cards */}
            <div className="grid grid-cols-2 gap-4">
                {displaySteps.map((step: any, i: number) => {
                    const isDark = step.dark !== undefined ? step.dark : i % 2 === 1;
                    const items = step.principles || step.tags || [];
                    return (
                        <div key={i} className={`p-5 border ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`font-mono text-3xl font-bold ${isDark ? 'text-white/10' : 'text-zinc-100'}`}>
                                    {step.phase || String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <p className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>
                                        {step.tagline || ''}
                                    </p>
                                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        {step.name}
                                    </h3>
                                </div>
                            </div>
                            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/60' : 'text-zinc-500'}`}>
                                {step.description}
                            </p>
                            {items.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                    {items.map((item: string, j: number) => (
                                        <div key={j} className={`flex items-start gap-2 text-sm ${isDark ? 'text-white/70' : 'text-zinc-600'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isDark ? 'bg-[#00CC6A]' : 'bg-zinc-400'}`} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Differentials */}
            <div className="grid md:grid-cols-3 gap-4">
                {differentials.map((d, i) => (
                    <div key={i} className="p-5 bg-zinc-50 border border-zinc-200 flex gap-3">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center shrink-0">
                            {cloneElement(d.icon, { className: 'w-4 h-4' })}
                        </div>
                        <div>
                            <h4 className="font-bold text-black text-sm mb-1">{d.title}</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">{d.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
