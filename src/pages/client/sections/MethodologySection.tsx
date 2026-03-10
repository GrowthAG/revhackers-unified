import React, { Fragment, cloneElement } from 'react';
import { Settings, Zap, Target, Repeat, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

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
    },
    {
        phase: '02', name: 'Geração de Demanda Inteligente', tagline: 'Semana 2–6',
        description: 'Ativamos os canais de aquisição corretos para o seu perfil de ICP — não todos ao mesmo tempo. Estruturamos três fluxos de entrada: inbound via autoridade e SEO, outbound via prospecção ativa e segmentada, e parcerias via network estratégico.',
        principles: ['Seeds: network e indicação ativada com processo', 'Nets: campanha de demanda segmentada por ICP', 'Spears: outreach personalizado para contas-alvo', 'Primeiro ROAS obtido em até 30 dias de campanha'],
    },
    {
        phase: '03', name: 'Ativação & Onboarding Orquestrado', tagline: 'Semana 3–8',
        description: 'O momento crítico é logo após a compra — e a maioria das empresas abandona o cliente. Estruturamos uma jornada de ativação em milestones com momentos de verdade: cada touchpoint tem um dono, um prazo e um resultado esperado.',
        principles: ['Momento de Verdade 1: ativação em 24h após fechamento', 'Momento de Verdade 2: primeiro resultado entregue em 15 dias', 'Momento de Verdade 3: review de resultados no dia 90', 'Automações de nurturing com cadência adaptada ao comportamento'],
    },
    {
        phase: '04', name: 'Expansão & Revenue Engine', tagline: 'Mês 2 em diante',
        description: 'Com dados reais de CAC, LTV, ROAS e churn, ativamos o loop de crescimento. O cliente que ativa, tem sucesso e se torna defensor. Esse defensor gera novos leads com custo zero — completando o Bowtie de receita.',
        principles: ['Pipeline Velocity calculada e otimizada mensalmente', 'LTV:CAC acima de 3:1 como critério de escala', 'Expansão de conta: upsell e cross-sell no pipeline', 'Reviews mensais RAPT — Revisão, Alinhamento, Prioridade, Tática'],
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
    const displaySteps = steps.length > 0 ? steps : defaultSteps;

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <SectionHeader
                    eyebrow="Como fazemos"
                    titleLine1="Metodologia"
                    titleLine2="RevHackers™"
                />
            </div>
            <div className="flex-1 p-6 md:p-10 lg:p-12 pt-0 max-w-[1600px] mx-auto w-full bg-white">

                {/* 4 Phase Cards */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                    {displaySteps.map((step: any, i: number) => {
                        const items = step.principles || step.tags || [];
                        return (
                            <div key={i} className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="font-mono text-4xl font-black text-zinc-100">
                                        {step.phase || String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-widest font-black text-zinc-400">
                                            {step.tagline || ''}
                                        </p>
                                        <h3 className="text-lg font-bold text-black mt-0.5">
                                            {step.name}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed mb-6 text-zinc-500">
                                    {step.description}
                                </p>
                                {items.length > 0 && (
                                    <div className="space-y-3">
                                        {items.map((item: string, j: number) => (
                                            <div key={j} className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                                    </div>
                                                </div>
                                                <span className="text-sm text-zinc-600 leading-snug">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Differentials */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
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
        </div>
    );
}
