import React, { useState } from 'react';
import { BarChart3, Zap, Settings, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Helpers ───────────────────────────────────────────────────────────────
const P = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function getSegmentConfig(segment: string) {
    const a = (segment || '').toLowerCase();
    if (a.includes('saas') || a.includes('tech') || a.includes('crm')) return {
        channels: [
            { key: 'google_ads', name: 'Google Ads', icon: 'search', recommended: [5000, 15000], desc: 'Search fundo de funil + PMAX para captura de demanda ativa' },
            { key: 'meta_ads', name: 'Meta Ads', icon: 'smartphone', recommended: [3000, 8000], desc: 'Retargeting + lookalike para awareness e nutrição' },
            { key: 'linkedin_ads', name: 'LinkedIn Ads', icon: 'briefcase', recommended: [2000, 6000], desc: 'Lead Gen Forms para decisores B2B de empresas-alvo' },
        ],
        fee: { label: 'Fee de Gestão RevHackers', range: [4500, 8000] },
        tools: { label: 'Stack de Ferramentas (CRM + Automação)', range: [500, 2000] },
        cac_benchmark: 'R$ 800–2.500', ltv_cac_target: '3:1 a 5:1', roas_target: '3x–6x em 90 dias', breakeven: 'Mês 2–3',
    };
    if (a.includes('ecommerce') || a.includes('e-commerce') || a.includes('loja') || a.includes('varejo')) return {
        channels: [
            { key: 'google_ads', name: 'Google Ads', icon: 'search', recommended: [5000, 20000], desc: 'Shopping + Search + PMAX para captura de demanda de compra' },
            { key: 'meta_ads', name: 'Meta Ads', icon: 'smartphone', recommended: [5000, 15000], desc: 'Catálogo dinâmico, lookalike de compradores e retargeting' },
            { key: 'linkedin_ads', name: 'LinkedIn Ads', icon: 'briefcase', recommended: [0, 2000], desc: 'Opcional para B2B wholesale ou parcerias corporativas' },
        ],
        fee: { label: 'Fee de Gestão RevHackers', range: [4000, 9000] },
        tools: { label: 'Stack de Ferramentas (CRM + Pixel + Analytics)', range: [300, 1200] },
        cac_benchmark: 'R$ 30–200', ltv_cac_target: '3:1 a 5:1', roas_target: '4x–8x em 60 dias', breakeven: 'Mês 1–2',
    };
    // Default
    return {
        channels: [
            { key: 'google_ads', name: 'Google Ads', icon: 'search', recommended: [3000, 12000], desc: 'Captura de demanda ativa - keywords de intenção de compra' },
            { key: 'meta_ads', name: 'Meta Ads', icon: 'smartphone', recommended: [2000, 8000], desc: 'Awareness, retargeting e geração de leads com criativos visuais' },
            { key: 'linkedin_ads', name: 'LinkedIn Ads', icon: 'briefcase', recommended: [1500, 5000], desc: 'Posicionamento B2B e geração de oportunidades com decisores' },
        ],
        fee: { label: 'Fee de Gestão RevHackers', range: [3500, 7000] },
        tools: { label: 'Stack de Ferramentas (CRM + Automação)', range: [400, 1500] },
        cac_benchmark: 'R$ 500–2.000', ltv_cac_target: '3:1 a 5:1', roas_target: '3x–5x em 90 dias', breakeven: 'Mês 2–3',
    };
}

// ── Service investment config (CRM / Founder / Dev) ───────────────────────
interface ServiceItem  { name: string; range: [number, number]; per: string; desc: string }
interface ServiceROI   { label: string; value: string; note: string }
interface ServiceStep  { n: string; title: string; desc: string; timing: string }
interface ServiceConfig {
    headline: string; description: string;
    items: ServiceItem[]; roi: ServiceROI[]; nextSteps: ServiceStep[];
}
function getServiceConfig(projectType: string): ServiceConfig | null {
    if (projectType === 'crm_ops') return {
        headline: 'Investimento de Implementação',
        description: 'Fee de implementação + licenças de plataforma para os 90 dias de projeto.',
        items: [
            { name: 'Fee de Implementação RevHackers', range: [4500, 8000], per: '/mês', desc: 'Diagnóstico, setup, automações, treinamento e governança de pipeline' },
            { name: 'Licenças de Plataforma (Funnels/CRM)', range: [400, 900], per: '/mês', desc: 'CRM, automação de marketing e analytics integrados' },
        ],
        roi: [
            { label: 'Redução de Ciclo de Venda', value: '20–40%', note: 'Automação de acompanhamento e qualificação com lead scoring' },
            { label: 'Taxa de Conversão', value: '+15–25%', note: 'Pipeline disciplinado com SLA de Passagem de Bastão MKT→Vendas' },
            { label: 'Dados no CRM', value: '100%', note: 'Governança ativa: se não está no CRM, não existe' },
            { label: 'Ponto de Equilíbrio', value: 'Mês 2', note: 'Retorno via aumento direto de conversão do comercial' },
        ],
        nextSteps: [
            { n: '01', title: 'Kickoff', desc: 'Mapeamento do processo atual e definição do Projeto Técnico do CRM', timing: 'Semana 1' },
            { n: '02', title: 'Setup do CRM', desc: 'Pipeline, propriedades, automações e integrações', timing: 'Semana 2–4' },
            { n: '03', title: 'Entrada em Produção', desc: 'Time treinado, sistema operando, governança ativa', timing: 'Semana 5–6' },
        ],
    };
    if (projectType === 'founder') return {
        headline: 'Investimento no Protocolo',
        description: 'Fee de acompanhamento estratégico para construção de autoridade e audiência qualificada no LinkedIn.',
        items: [
            { name: 'Fee de Acompanhamento RevHackers', range: [2500, 4500], per: '/mês', desc: 'Estratégia de posicionamento, pauta, distribuição e conversão via LinkedIn' },
            { name: 'Ferramentas de Conteúdo', range: [100, 300], per: '/mês', desc: 'Canva Pro, agendador de posts, analytics de perfil' },
        ],
        roi: [
            { label: 'Crescimento de Audiência', value: '3–5x', note: 'Seguidores qualificados dentro do ICP definido' },
            { label: 'Inbound via DM', value: '4–12/mês', note: 'Oportunidades originadas de conteúdo, sem cold outreach' },
            { label: 'Impressões Mensais', value: '+200%', note: 'Com cadência de 3x/semana e comentários estratégicos' },
            { label: 'Ponto de Equilíbrio', value: '1 deal', note: 'Um único cliente via inbound cobre todo o investimento' },
        ],
        nextSteps: [
            { n: '01', title: 'Posicionamento', desc: 'Nicho, POV, bio e headline do LinkedIn definidos', timing: 'Semana 1' },
            { n: '02', title: 'Primeiros Conteúdos', desc: 'Posts âncora de autoridade, testes de formato', timing: 'Semana 2–4' },
            { n: '03', title: 'Máquina Ativa', desc: 'Cadência consolidada e Loop de Conversão operando', timing: 'Semana 8–12' },
        ],
    };
    if (projectType === 'dev' || projectType === 'site') return {
        headline: 'Investimento no Projeto',
        description: 'Fee de desenvolvimento com entrega em sprints, performance garantida e passagem de bastão completa.',
        items: [
            { name: 'Fee de Desenvolvimento e Design', range: [8000, 25000], per: 'projeto', desc: 'UX/UI, desenvolvimento, integrações, QA, lançamento e passagem de bastão documentada' },
            { name: 'Manutenção Mensal (opcional)', range: [500, 1500], per: '/mês', desc: 'Atualizações, monitoramento de performance e otimizações pós-lançamento' },
        ],
        roi: [
            { label: 'Core Web Vitals', value: 'LCP < 2.5s', note: 'Performance como critério de aceite do projeto' },
            { label: 'GTmetrix Score', value: '≥ 90', note: 'Carregamento otimizado em todos os dispositivos' },
            { label: 'Conversão Estimada', value: '+30–80%', note: 'vs. site anterior, baseado em benchmarks do segmento' },
            { label: 'Prazo', value: '6 semanas', note: 'Da aprovação do wireframe ao lançamento em produção' },
        ],
        nextSteps: [
            { n: '01', title: 'Briefing & Wireframe', desc: 'Sitemap, estrutura aprovada e referências visuais', timing: 'Semana 1' },
            { n: '02', title: 'Design & Dev', desc: 'UI, código, integrações e responsividade', timing: 'Semana 2–5' },
            { n: '03', title: 'QA & Lançamento', desc: 'Testes, ajustes finais e lançamento controlado', timing: 'Semana 6' },
        ],
    };
    return null; // Use existing growth/media investment view
}

export default function InvestmentSection({ plan, onBudgetChange }: { plan: any; onBudgetChange?: (data: any) => void }) {
    const projectType = plan?.rei_projects?.type || plan?.project_type || '';
    const serviceConfig = getServiceConfig(projectType);

    if (serviceConfig) {
        return <ServiceInvestmentView serviceConfig={serviceConfig} />;
    }
    return <BudgetInvestmentView plan={plan} onBudgetChange={onBudgetChange} />;
}

function ServiceInvestmentView({ serviceConfig }: { serviceConfig: any }) {
    // ── Service-based investment view (CRM / Founder / Dev) ─────────────────
    {
        const totalMin = serviceConfig.items.reduce((s: number, i: any) => s + i.range[0], 0);
        const totalMax = serviceConfig.items.reduce((s: number, i: any) => s + i.range[1], 0);
        return (
            <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
                <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                    <SectionHeader
                        eyebrow="Financeiro"
                        titleLine1={serviceConfig.headline}
                        description={serviceConfig.description}
                    />
                </div>
                <div className="flex-1 p-6 md:p-10 lg:p-12 pt-8 max-w-[1400px] mx-auto w-full bg-white space-y-8">

                    {/* Investment Items */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {serviceConfig.items.map((item, i) => (
                            <div key={i} className="border border-zinc-200 p-7 ">
                                <p className="text-xxs text-zinc-400 uppercase tracking-[0.25em] font-black mb-3">{item.name}</p>
                                <p className="text-3xl font-black text-black tracking-tight mb-1">
                                    {P(item.range[0])}
                                    {item.range[1] > item.range[0] && <span className="text-zinc-400"> – {P(item.range[1])}</span>}
                                    <span className="text-sm text-zinc-400 font-normal ml-1">{item.per}</span>
                                </p>
                                <p className="text-mini text-zinc-500 leading-relaxed mt-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* ROI Grid */}
                    <div className="bg-white border border-zinc-200 p-8">
                        <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-6">Resultados Esperados</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {serviceConfig.roi.map((r, i) => (
                                <div key={i} className={i === serviceConfig.roi.length - 1 ? 'md:border-l md:border-zinc-100 md:pl-6' : ''}>
                                    <p className="text-2xl font-bold text-black tracking-tight mb-1" style={i === 0 ? { color: '#00CC6A' } : {}}>{r.value}</p>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">{r.label}</p>
                                    <p className="text-xs text-zinc-400 leading-snug">{r.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Steps + Total */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-zinc-200 p-7 ">
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-6">Próximos Passos</p>
                            <div className="space-y-5">
                                {serviceConfig.nextSteps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <span className="text-zinc-200 font-bold font-mono text-2xl leading-none mt-0.5">{step.n}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-black font-bold text-sm">{step.title}</p>
                                                <span className="text-xs text-zinc-400 font-mono">{step.timing}</span>
                                            </div>
                                            <p className="text-zinc-500 text-xs mt-0.5">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-zinc-950 p-7 flex flex-col justify-between">
                            <div>
                                <p className="text-xxs text-zinc-500 uppercase tracking-[0.25em] font-black mb-6">Investimento Total Estimado</p>
                                <p className="text-4xl font-black text-white tracking-tight">
                                    {P(totalMin)}
                                    {totalMax > totalMin && <span className="text-zinc-500"> – {P(totalMax)}</span>}
                                </p>
                                <p className="text-sm text-zinc-500 mt-2">{serviceConfig.items[0].per === 'projeto' ? 'Valor único do projeto' : '/mês · faturado mensalmente'}</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-zinc-800">
                                <div className="flex items-center gap-2 text-[#00CC6A]">
                                    <ArrowRight className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Aprovação → Início em 48h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

function BudgetInvestmentView({ plan, onBudgetChange }: { plan: any; onBudgetChange?: (data: any) => void }) {
    const budgetData = plan.budget_data || {};
    const segment = plan.diagnostic_data?.context_mirror?.segmento || plan.diagnostic_data?.context_mirror?.segment || plan.premises_data?.segmento || plan.premises_data?.segment || '';
    const config = getSegmentConfig(segment);

    const [values, setValues] = useState<Record<string, number>>({
        google_ads: budgetData.google_ads || 0,
        meta_ads: budgetData.meta_ads || 0,
        linkedin_ads: budgetData.linkedin_ads || 0,
    });
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [focusedKey, setFocusedKey] = useState<string | null>(null);

    const totalMedia = Object.values(values).reduce((s, v) => s + v, 0);
    const hasCustom = totalMedia > 0;
    const channelsDisplay = config.channels.map(ch => ({
        ...ch, value: values[ch.key] || 0, midpoint: Math.round((ch.recommended[0] + ch.recommended[1]) / 2),
    }));
    const mediaTotal = hasCustom ? totalMedia : channelsDisplay.reduce((s, c) => s + c.midpoint, 0);
    const feeAvg = Math.round((config.fee.range[0] + config.fee.range[1]) / 2);
    const toolsAvg = Math.round((config.tools.range[0] + config.tools.range[1]) / 2);
    const grandTotal = mediaTotal + feeAvg + toolsAvg;
    const barColors = ['bg-zinc-950', 'bg-zinc-600', 'bg-zinc-400'];

    const handleChange = (key: string, val: string) => setEditing(prev => ({ ...prev, [key]: val.replace(/[^\d.,]/g, '') }));
    const handleFocus = (key: string) => {
        const v = values[key]; setEditing(prev => ({ ...prev, [key]: v > 0 ? String(v).replace('.', ',') : '' }));
        setFocusedKey(key);
    };
    const handleBlur = (key: string) => {
        const raw = (editing[key] || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
        const num = parseFloat(raw) || 0;
        const newVals = { ...values, [key]: num };
        setValues(newVals); setEditing(prev => ({ ...prev, [key]: '' })); setFocusedKey(null);
        onBudgetChange?.({ ...newVals, total: Object.values(newVals).reduce((s, v) => s + v, 0) });
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <SectionHeader
                    eyebrow="Financeiro"
                    titleLine1="Investimento"
                    titleLine2="& Retorno"
                    description="Breakdown de investimento por canal com faixas recomendadas para o segmento. Valores editáveis - ajuste conforme seu budget."
                />
            </div>

            <div className="flex-1 p-6 md:p-10 lg:p-12 pt-0 max-w-[1600px] mx-auto w-full bg-white space-y-12">

                {/* Grand Total + KPIs */}
                <div className="bg-white border border-zinc-200 p-8 md:p-10 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-2">Investimento Mensal Estimado</p>
                            <p className="text-4xl md:text-5xl font-black text-black tracking-tight">
                                {P(grandTotal)}<span className="text-lg text-zinc-400 font-normal">/mês</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 md:gap-8 border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-8">
                            <div>
                                <p className="text-xl font-bold text-black">{config.roas_target}</p>
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">ROAS Alvo</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-black">{config.breakeven}</p>
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">Equilíbrio</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-black">{config.ltv_cac_target}</p>
                                <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">LTV:CAC</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribution */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-5 h-5 text-black" />
                        <h3 className="text-xl font-black text-black">Distribuição por Canal</h3>
                    </div>
                    <div className="h-3 flex overflow-hidden mb-8 bg-zinc-100">
                        {channelsDisplay.map((ch, i) => {
                            const val = hasCustom ? ch.value : ch.midpoint;
                            const pct = mediaTotal > 0 ? (val / mediaTotal) * 100 : 33;
                            return <div key={i} className={`${barColors[i]} transition-all duration-500`} style={{ width: `${pct}%` }} title={`${ch.name}: ${Math.round(pct)}%`} />;
                        })}
                    </div>
                    <div className="space-y-4">
                        {channelsDisplay.map((ch, i) => {
                            const val = hasCustom ? ch.value : ch.midpoint;
                            const pct = mediaTotal > 0 ? Math.round((val / mediaTotal) * 100) : 33;
                            return (
                                <div key={i} className="border border-zinc-200 overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <div className={`w-2.5 h-2.5 ${barColors[i]}`} />
                                                <span className="text-lg font-semibold text-black">{ch.name}</span>
                                                <span className="text-xs text-zinc-400 font-mono">{pct}%</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed ml-[22px]">{ch.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-zinc-400 uppercase tracking-widest">Faixa Recomendada</p>
                                                <p className="text-sm text-zinc-600 font-medium">{P(ch.recommended[0])} – {P(ch.recommended[1])}</p>
                                            </div>
                                            <div className="relative w-40">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                                                <input
                                                    type="text" inputMode="decimal"
                                                    value={focusedKey === ch.key ? (editing[ch.key] ?? '') : ch.value > 0 ? ch.value.toLocaleString('pt-BR') : ''}
                                                    onChange={e => handleChange(ch.key, e.target.value)}
                                                    onFocus={() => handleFocus(ch.key)}
                                                    onBlur={() => handleBlur(ch.key)}
                                                    placeholder={ch.midpoint.toLocaleString('pt-BR')}
                                                    className="pl-9 h-11 w-full text-right font-mono text-sm border border-zinc-200 focus:border-zinc-900 focus:ring-0 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fee + Tools */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-zinc-200 p-6 ">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-zinc-400" />
                            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-bold">{config.fee.label}</p>
                        </div>
                        <p className="text-2xl font-bold text-black mb-1">{P(config.fee.range[0])} – {P(config.fee.range[1])}</p>
                        <p className="text-xs text-zinc-400">Setup, gestão de campanhas, otimização e relatórios</p>
                    </div>
                    <div className="border border-zinc-200 p-6 ">
                        <div className="flex items-center gap-2 mb-3">
                            <Settings className="w-4 h-4 text-zinc-400" />
                            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-bold">{config.tools.label}</p>
                        </div>
                        <p className="text-2xl font-bold text-black mb-1">{P(config.tools.range[0])} – {P(config.tools.range[1])}</p>
                        <p className="text-xs text-zinc-400">CRM, automação de marketing, tracking e analytics</p>
                    </div>
                </div>

                {/* ROI Projection */}
                <div className="bg-white border border-zinc-200 p-8 pt-10 overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                        <h3 className="text-xl font-black text-black">Projeção de Retorno</h3>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6 relative z-10">
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">CAC Benchmark</p>
                            <p className="text-xl font-bold text-black">{config.cac_benchmark}</p>
                            <p className="text-xs text-zinc-400 mt-1">Custo por aquisição do segmento</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Leads Estimados/Mês</p>
                            <p className="text-xl font-bold text-black">{Math.round(mediaTotal / 150)}–{Math.round(mediaTotal / 60)}</p>
                            <p className="text-xs text-zinc-400 mt-1">Baseado no investimento em mídia</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Receita Potencial</p>
                            <p className="text-xl font-bold text-black">{P(grandTotal * 2)}–{P(grandTotal * 4)}</p>
                            <p className="text-xs text-zinc-400 mt-1">ROAS target {config.roas_target}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Ponto de Equilíbrio</p>
                            <p className="text-xl font-bold text-black">{config.breakeven}</p>
                            <p className="text-xs text-zinc-400 mt-1">Tempo estimado para retorno</p>
                        </div>
                    </div>
                </div>

                {/* Próximos Passos + Retorno potential */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-zinc-200 p-8 ">
                        <p className="text-xs text-black uppercase tracking-[0.2em] font-semibold mb-6">Próximos Passos</p>
                        <div className="space-y-5">
                            {[
                                { n: '01', title: 'Aprovação', desc: 'Cliente assina o planejamento e autoriza o início', timing: 'Hoje' },
                                { n: '02', title: 'Kick-Off', desc: 'Reunião de abertura + onboarding de acessos e contas', timing: 'Dia 1–3' },
                                { n: '03', title: 'Fundação Live', desc: 'CRM, tracking e automações ativas. Campanhas preparadas.', timing: 'Dia 7–21' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="text-zinc-300 font-bold font-mono text-2xl leading-none mt-0.5">{step.n}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-black font-bold text-sm">{step.title}</p>
                                            <span className="text-xs text-black font-mono">{step.timing}</span>
                                        </div>
                                        <p className="text-zinc-500 text-xs mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200 p-8 flex flex-col justify-between">
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold mb-6">Potencial de Retorno</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                    <span className="text-sm text-zinc-600">Investimento mensal</span>
                                    <span className="font-bold text-black font-mono">{P(grandTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                    <span className="text-sm text-zinc-600">Revenue alvo (ROAS {config.roas_target})</span>
                                    <span className="font-bold text-black font-mono">{P(grandTotal * 3)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                    <span className="text-sm text-zinc-600">Payback estimado</span>
                                    <span className="font-bold text-black">{config.breakeven}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-600">LTV:CAC meta</span>
                                    <span className="font-bold text-[#00CC6A] text-lg">{config.ltv_cac_target}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-200">
                            <p className="text-xs text-zinc-300 text-center">Valores baseados em benchmarks do segmento • Ajuste os campos para personalizar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
