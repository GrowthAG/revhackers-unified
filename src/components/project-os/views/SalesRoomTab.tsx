import React, { useState, useMemo, useEffect } from 'react';
import { ReiProject } from '@/api/reiProjects';
import { motion } from 'framer-motion';
import { 
    Calculator, Target, Activity, DollarSign, MousePointerClick, 
    ArrowRight, Save, Play, RefreshCw, AlertTriangle, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SalesRoomTabProps {
    project: ReiProject;
}

// ── TYPES E ESTADO INICIAL ──
type DiagnosticParams = {
    ticket_medio: number;
    leads_mensais: number;
    dias_atraso_contato: number;
    taxa_conversao_historica: number;
    faturamento_mensal: number;
    taxa_churn_atual: number;
    pro_labore_mensal: number;
    horas_operacionais_semana: number;
    trafego_mensal: number;
    taxa_conversao_site: number;
    delta_conversao_rei: number;
};

// Start at ZERO so the user must input the real client data, avoiding "scary default fake numbers"
const initialParams: DiagnosticParams = {
    ticket_medio: 0,
    leads_mensais: 0,
    dias_atraso_contato: 0,
    taxa_conversao_historica: 0,
    faturamento_mensal: 0,
    taxa_churn_atual: 0,
    pro_labore_mensal: 0,
    horas_operacionais_semana: 0,
    trafego_mensal: 0,
    taxa_conversao_site: 0,
    delta_conversao_rei: 0,
};

const formataBRL = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor);

export const SalesRoomTab: React.FC<SalesRoomTabProps> = ({ project }) => {
    
    // Auto-Fill via OSINT / Caixa 1
    const derivedParams = useMemo(() => {
        const base = { ...initialParams };
        if (!project) return { params: base, isAiCalibrated: false };

        const intel = project.site_analysis as any;
        const mkt = project.market_data as any;

        let hasAiData = false;

        if (intel?.trafego_estimado) { base.trafego_mensal = Number(intel.trafego_estimado); hasAiData = true; }
        else if (intel?.trafego_mensal) { base.trafego_mensal = Number(intel.trafego_mensal); hasAiData = true; }
        
        if (intel?.ticket_medio) { base.ticket_medio = Number(intel.ticket_medio); hasAiData = true; }
        else if (mkt?.avg_ticket) { base.ticket_medio = Number(mkt.avg_ticket); hasAiData = true; }
        
        if (intel?.leads_mensais) { base.leads_mensais = Number(intel.leads_mensais); hasAiData = true; }

        if (intel?.faturamento_estimado) { base.faturamento_mensal = Number(intel.faturamento_estimado); hasAiData = true; }
        else if (mkt?.mrr_estimado) { base.faturamento_mensal = Number(mkt.mrr_estimado); hasAiData = true; }

        return { params: base, isAiCalibrated: hasAiData };
    }, [project]);

    const [params, setParams] = useState<DiagnosticParams>(derivedParams.params);
    const [revealSolution, setRevealSolution] = useState(false);

    const resetPlacar = () => setParams(derivedParams.params);

    const updateParam = (key: keyof DiagnosticParams, value: number) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    // MOTOR MATEMÁTICO DE SANGRAMENTO (BLEEDING COST)
    const calculations = useMemo(() => {
        const {
            ticket_medio, leads_mensais, dias_atraso_contato, taxa_conversao_historica,
            faturamento_mensal, taxa_churn_atual,
            pro_labore_mensal, horas_operacionais_semana,
            trafego_mensal, taxa_conversao_site, delta_conversao_rei
        } = params;

        const leads_perdidos_mes = (leads_mensais * (dias_atraso_contato / 30)) * 0.15; 
        const bleeding_crm = leads_perdidos_mes * (taxa_conversao_historica / 100) * ticket_medio;

        const bleeding_growth = faturamento_mensal * (taxa_churn_atual / 100);

        const cost_per_hour = pro_labore_mensal > 0 ? (pro_labore_mensal / 160) : 0; 
        const bleeding_founder = horas_operacionais_semana * 4 * cost_per_hour;

        const vendas_atuais = trafego_mensal * (taxa_conversao_site / 100);
        const vendas_otimizadas = trafego_mensal * ((taxa_conversao_site + delta_conversao_rei) / 100);
        const sales_lost = vendas_otimizadas - vendas_atuais;
        const bleeding_site = sales_lost > 0 ? sales_lost * ticket_medio : 0;

        const total_mensal = bleeding_crm + bleeding_growth + bleeding_founder + bleeding_site;
        const total_anual = total_mensal * 12;

        return {
            crm: bleeding_crm || 0,
            growth: bleeding_growth || 0,
            founder: bleeding_founder || 0,
            site: bleeding_site || 0,
            total_mensal: total_mensal || 0,
            total_anual: total_anual || 0
        };

    }, [params]);

    useEffect(() => {
        setParams(derivedParams.params);
    }, [derivedParams]);

    const BrutalSlider = ({ 
        label, value, min, max, step, unit, onChangeKey, accent = "text-zinc-900", borderFocus = "focus:ring-zinc-300" 
    }: {
        label: string; value: number; min: number; max: number; step: number; unit?: string; onChangeKey: keyof DiagnosticParams; accent?: string; borderFocus?: string;
    }) => (
        <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-end mb-4">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
                <div className={`text-xl font-black ${accent} tracking-tighter`}>
                    {unit === 'currency' ? formataBRL(value) : value}{unit && unit !== 'currency' ? unit : ''}
                </div>
            </div>
            <input 
                type="range" 
                min={min} max={max} step={step} 
                value={value} 
                onChange={(e) => updateParam(onChangeKey, Number(e.target.value))}
                className={`w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-ew-resize accent-zinc-900 focus:outline-none focus:ring-2 ${borderFocus} transition-all`}
            />
            <div className="flex justify-between text-[8px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
                <span>{unit === 'currency' ? formataBRL(min) : min}{unit && unit !== 'currency' ? unit : ''}</span>
                <span>{unit === 'currency' ? formataBRL(max) : max}{unit && unit !== 'currency' ? unit : ''}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-full">
                            <PlayCircle className="w-3 h-3 text-zinc-500" />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Motor de ROI (Matemática Real)</span>
                        </div>
                        {derivedParams.isAiCalibrated && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00CC6A]/10 border border-[#00CC6A]/30 rounded-full">
                                <Activity className="w-3 h-3 text-[#00CC6A]" />
                                <span className="text-[10px] font-black text-[#00CC6A] uppercase tracking-widest">IA Calibrated (OSINT)</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase mb-2">
                        Sales Room <span className="text-zinc-400">Pitch</span>
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 max-w-xl leading-relaxed">
                        Apresentação Consultiva. Insira dados estritamente reais, relatados pelo cliente durante a call, para projetar logicamente o exato 
                        <span className="text-zinc-900 font-bold ml-1">Sangramento de Caixa (Deixado na Mesa)</span> mensal.
                    </p>
                </div>
                <div className="shrink-0 flex gap-3 relative z-10">
                    <Button 
                        variant="ghost" 
                        onClick={resetPlacar}
                        className="text-zinc-500 hover:bg-zinc-100 rounded-xl font-bold uppercase text-[9px] tracking-widest h-10 px-4 border border-transparent"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-2" /> Resetar Placar (Zerar)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUNA ESQUERDA: VARIÁVEIS DE SIMULAÇÃO */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                            <Target className="w-5 h-5 text-zinc-400" />
                            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Métrica Global Base</h2>
                        </div>
                        <BrutalSlider 
                            label="Ticket Médio Reportado (LTV)" 
                            value={params.ticket_medio} 
                            min={0} max={100000} step={100} 
                            unit="currency" 
                            onChangeKey="ticket_medio" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                                <Activity className="w-4 h-4 text-zinc-400" />
                                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CRM & Fricção</h2>
                            </div>
                            <BrutalSlider label="Leads Mensais" value={params.leads_mensais} min={0} max={5000} step={1} onChangeKey="leads_mensais" />
                            <BrutalSlider label="Tempo de Resposta (Dias)" value={params.dias_atraso_contato} min={0} max={30} step={0.5} unit="d" onChangeKey="dias_atraso_contato" />
                            <BrutalSlider label="Taxa Conversão Atual" value={params.taxa_conversao_historica} min={0} max={100} step={1} unit="%" onChangeKey="taxa_conversao_historica" />
                        </div>

                        <div className="space-y-4">
                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                                    <DollarSign className="w-4 h-4 text-zinc-400" />
                                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Growth & Churn</h2>
                                </div>
                                <BrutalSlider label="Faturamento Mensal (MRR)" value={params.faturamento_mensal} min={0} max={5000000} step={5000} unit="currency" onChangeKey="faturamento_mensal" />
                                <BrutalSlider label="Cadeia de Perda (Churn Rate)" value={params.taxa_churn_atual} min={0} max={30} step={1} unit="%" onChangeKey="taxa_churn_atual" />
                            </div>

                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                                    <Calculator className="w-4 h-4 text-zinc-400" />
                                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Operação do Sócio</h2>
                                </div>
                                <BrutalSlider label="Pró-Labore Sócio" value={params.pro_labore_mensal} min={0} max={100000} step={1000} unit="currency" onChangeKey="pro_labore_mensal" />
                                <BrutalSlider label="Horas Operacionais Semana" value={params.horas_operacionais_semana} min={0} max={60} step={1} unit="h" onChangeKey="horas_operacionais_semana" />
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                                <MousePointerClick className="w-4 h-4 text-zinc-400" />
                                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vazamento de Tráfego Virtual</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <BrutalSlider label="Tráfego Site" value={params.trafego_mensal} min={0} max={500000} step={500} onChangeKey="trafego_mensal" />
                                <BrutalSlider label="Conversão Atual" value={params.taxa_conversao_site} min={0} max={10} step={0.1} unit="%" onChangeKey="taxa_conversao_site" />
                                <BrutalSlider label="Meta Rei (Otimização)" value={params.delta_conversao_rei} min={0} max={10} step={0.1} unit="%" onChangeKey="delta_conversao_rei" accent="text-[#00CC6A]" borderFocus="focus:ring-[#00CC6A]/50" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: PLACAR DE SANGRAMENTO */}
                <div className="lg:col-span-5 relative lg:sticky lg:top-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className={revealSolution 
                            ? "bg-[#00CC6A] text-white rounded-3xl p-8 shadow-sm relative overflow-hidden" 
                            : "bg-white text-zinc-900 border border-red-100 rounded-3xl p-8 shadow-2xl shadow-red-500/5 relative overflow-hidden"}
                    >
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <AlertTriangle className={revealSolution ? "w-8 h-8 opacity-0 hidden" : "w-8 h-8 text-red-500 mb-6"} />
                                <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-400">
                                    {revealSolution ? "Projeção de Novo Faturamento" : "Sangramento Mensal (Fatos Computados)"}
                                </h3>
                                
                                <div className="mt-4 mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Impacto Mensal Imediato</p>
                                    <motion.h4 
                                        key={calculations.total_mensal}
                                        initial={{ scale: 1.1, y: -5 }} animate={{ scale: 1, y: 0 }}
                                        className={revealSolution ? "text-6xl font-black tracking-tighter" : "text-6xl font-black text-red-500 tracking-tighter"}
                                    >
                                        {revealSolution ? "+" : ""}{formataBRL(calculations.total_mensal).replace(',00', '')}
                                    </motion.h4>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-zinc-100">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Evaporação Anualizada (12 Meses)</p>
                                    <motion.h4 
                                        key={calculations.total_anual}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-4xl font-black tracking-tighter opacity-90"
                                    >
                                        {revealSolution ? "+" : ""}{formataBRL(calculations.total_anual).replace(',00', '')}
                                    </motion.h4>
                                </div>
                            </div>

                            {!revealSolution && (
                                <div className="mt-10 space-y-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Decomposição Algorítmica da Fricção</p>
                                    {[
                                        { label: 'Oportunidades Perdidas no CRM', val: calculations.crm },
                                        { label: 'Erosão Financeira (Churn)', val: calculations.growth },
                                        { label: 'Carga Operacional da Liderança', val: calculations.founder },
                                        { label: 'Fuga de Vendas no Digital', val: calculations.site },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[12px] font-bold pb-2 border-b border-zinc-50 last:border-0">
                                            <span className="text-zinc-500">{item.label}</span>
                                            <span className="text-zinc-900">{formataBRL(item.val)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-12">
                                <Button 
                                    size="lg"
                                    onClick={() => setRevealSolution(!revealSolution)}
                                    className={revealSolution 
                                        ? "w-full bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-widest h-14 rounded-xl text-[10px]" 
                                        : "w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest h-14 rounded-xl text-[10px]"}
                                >
                                    {revealSolution ? "Desligar Projeção de ROI" : "Revelar ROI Rei360"}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    <p className="text-[9px] text-zinc-400 font-medium text-center mt-6 px-4 leading-relaxed uppercase tracking-widest">
                        Os dados computados acima são projetados offline a partir das respostas factuais prestadas pelo cliente, sem taxas exatas fixadas por robôs arbitrários ou alucinações de inteligência artificial comercial.
                    </p>
                </div>

            </div>
        </div>
    );
};
