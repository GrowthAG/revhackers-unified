import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    Loader2, Building2, Globe, BrainCircuit, Users, Zap,
    ArrowRight, CheckCircle2, Flame,
    RefreshCw, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadSummary {
    id: string;
    name: string;
    company: string;
    type: string;
    urgencyScore: number;
    maturityPct: number;
    nextAction: string;
    daysSinceActivity: number;
}

interface FullLeadData {
    client_name: string;
    client_company: string | null;
    client_email: string;
    client_site: string | null;
    trade_name: string | null;
    type: string;
    enrichment_data: any;
    market_data: any;
    site_analysis: any;
}

interface LeadWarRoomSheetProps {
    lead: LeadSummary | null;
    open: boolean;
    onClose: () => void;
    onQualified: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    consulting: '360 Growth', founder: 'LinkedIn / Founder',
    dev: 'Site & Conversao', crm_ops: 'RevOps / CRM', funnels_impl: 'Funis de Aquisicao',
};

function ScoreMini({ score, label }: { score: number; label: string }) {
    const color = score >= 90 ? '#00CC6A' : score >= 50 ? '#f59e0b' : '#ef4444';
    const r = 12;
    const circ = 2 * Math.PI * r;
    return (
        <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
                <svg viewBox="0 0 28 28" className="w-full h-full -rotate-90">
                    <circle cx="14" cy="14" r={r} fill="none" stroke="#f4f4f5" strokeWidth="3" />
                    <circle
                        cx="14" cy="14" r={r} fill="none"
                        stroke={color} strokeWidth="3"
                        strokeDasharray={`${(score / 100) * circ} ${circ}`}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-zinc-900">{score}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const LeadWarRoomSheet: React.FC<LeadWarRoomSheetProps> = ({
    lead, open, onClose, onQualified
}) => {
    const navigate = useNavigate();
    const [fullData, setFullData] = useState<FullLeadData | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [qualifying, setQualifying] = useState(false);
    const [enriching, setEnriching] = useState(false);

    // Carrega dados completos quando o sheet abre
    useEffect(() => {
        if (open && lead?.id) {
            loadFullData(lead.id);
        } else {
            setFullData(null);
        }
    }, [open, lead?.id]);

    const loadFullData = async (projectId: string) => {
        setLoadingData(true);
        try {
            const { data } = await supabase
                .from('rei_projects')
                .select('client_name, client_company, client_email, client_site, trade_name, type, enrichment_data, market_data, site_analysis')
                .eq('id', projectId)
                .single();
            setFullData((data as any) || null);
        } catch (e) {
            console.error('[LeadWarRoomSheet] loadFullData error:', e);
        } finally {
            setLoadingData(false);
        }
    };

    // ── Enriquecer agora ─────────────────────────────────────────────────────

    const handleEnrich = async () => {
        if (!lead?.id) return;
        setEnriching(true);
        try {
            await supabase.functions.invoke('auto-enrich-project', {
                body: { project_id: lead.id },
            });
            toast.success('Dados atualizados!');
            await loadFullData(lead.id);
        } catch (e: any) {
            toast.error('Falha no enriquecimento');
        } finally {
            setEnriching(false);
        }
    };

    // ── Qualificar como Cliente Pago ─────────────────────────────────────────

    const handleQualify = async () => {
        if (!lead?.id) return;
        setQualifying(true);
        try {
            // 1. Atualiza status para active
            const { error: updateErr } = await supabase
                .from('rei_projects')
                .update({ status: 'active' } as any)
                .eq('id', lead.id);
            if (updateErr) throw updateErr;

            // 2. Injeta template de tarefas (via createReiProject nao e possivel aqui,
            //    entao chamamos diretamente o generate-project-tasks se disponivel)
            const { error: tasksErr } = await supabase.functions.invoke('generate-project-tasks', {
                body: { project_id: lead.id, type: lead.type },
            }).catch(() => ({ error: null }));
            // Ignoramos erro aqui - o admin pode criar tarefas manualmente no OrqFlow

            toast.success(`${lead.name} qualificado como cliente!`, {
                description: 'Redirecionando para o OrqFlow...',
            });

            onQualified();
            onClose();

            // 3. Redireciona para o projeto no OrqFlow
            setTimeout(() => navigate(`/admin/projects/${lead.id}`), 400);

        } catch (e: any) {
            console.error('[LeadWarRoomSheet] qualify error:', e);
            toast.error('Erro ao qualificar lead', { description: e.message });
        } finally {
            setQualifying(false);
        }
    };

    const cnpj      = fullData?.enrichment_data?.cnpj ?? null;
    const sitePerf  = fullData?.enrichment_data?.site_perf ?? null;
    const market    = fullData?.market_data ?? null;
    const hasData   = !!cnpj || !!sitePerf || !!market;

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[540px] p-0 flex flex-col overflow-hidden bg-white border-l border-zinc-200"
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <SheetHeader className="px-6 pt-6 pb-5 border-b border-zinc-100 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded">
                                    {lead ? (TYPE_LABELS[lead.type] ?? lead.type) : '-'}
                                </span>
                                {lead && lead.urgencyScore >= 70 && (
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                                        <Flame className="w-2.5 h-2.5" /> urgente
                                    </span>
                                )}
                            </div>
                            <SheetTitle className="text-xl font-black text-zinc-900 tracking-tight leading-tight">
                                {lead?.name ?? 'Carregando...'}
                            </SheetTitle>
                            <SheetDescription className="text-xs font-medium text-zinc-400 mt-0.5">
                                War Room - Dossi de Vendas
                            </SheetDescription>
                        </div>
                        <button
                            onClick={handleEnrich}
                            disabled={enriching}
                            className="w-8 h-8 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0"
                            title="Atualizar CNPJ + Performance do Site"
                        >
                            {enriching
                                ? <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                                : <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                            }
                        </button>
                    </div>

                    {/* Metricas rapidas */}
                    {lead && (
                        <div className="flex items-center gap-5 mt-4">
                            <ScoreMini score={lead.maturityPct} label="REI Score" />
                            {sitePerf && <ScoreMini score={sitePerf.performance_score ?? 0} label="Site PSI" />}
                            <div className="ml-auto text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Inativo</p>
                                <p className={cn('text-lg font-black', lead.daysSinceActivity > 7 ? 'text-red-400' : 'text-zinc-700')}>
                                    {lead.daysSinceActivity}d
                                </p>
                            </div>
                        </div>
                    )}
                </SheetHeader>

                {/* ── Scrollable body ────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" />
                        </div>
                    ) : (
                        <div className="px-6 py-5 space-y-5">

                            {/* Proxima acao */}
                            {lead?.nextAction && (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-zinc-400 shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Proxima Acao</p>
                                        <p className="text-sm font-bold text-zinc-900">{lead.nextAction}</p>
                                    </div>
                                </div>
                            )}

                            {/* Dados basicos do lead */}
                            {fullData && (
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Contato</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { icon: Mail, value: fullData.client_email },
                                            { icon: Globe, value: fullData.client_site },
                                            { icon: Building2, value: fullData.client_company },
                                        ].filter(r => r.value).map(({ icon: Icon, value }) => (
                                            <div key={value} className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                                                <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                <span className="truncate">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CNPJ - Receita Federal */}
                            {cnpj ? (
                                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                                        <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Receita Federal</span>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Razao Social',   value: cnpj.razao_social },
                                            { label: 'Situacao',       value: cnpj.situacao_cadastral },
                                            { label: 'Abertura',       value: cnpj.data_abertura ? new Date(cnpj.data_abertura).toLocaleDateString('pt-BR') : null },
                                            { label: 'Porte',          value: cnpj.porte },
                                            { label: 'Capital Social', value: cnpj.capital_social ? `R$ ${Number(cnpj.capital_social).toLocaleString('pt-BR')}` : null },
                                            { label: 'Municipio',      value: cnpj.municipio && cnpj.uf ? `${cnpj.municipio}/${cnpj.uf}` : null },
                                        ].filter(r => r.value).map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                                                <p className="text-xs font-bold text-zinc-800 mt-0.5 leading-snug">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {cnpj.cnae_principal && (
                                        <div className="px-4 pb-3 border-t border-zinc-50 pt-2">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">CNAE</p>
                                            <p className="text-xs font-bold text-zinc-800 mt-0.5">{cnpj.cnae_principal.codigo} - {cnpj.cnae_principal.descricao}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-dashed border-zinc-200 rounded-xl p-4 flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-zinc-200 shrink-0" />
                                    <p className="text-xs font-medium text-zinc-400">Dados da Receita Federal nao carregados. Clique em refresh para buscar.</p>
                                </div>
                            )}

                            {/* Site Performance */}
                            {sitePerf && (
                                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Performance do Site</span>
                                        <span className={cn(
                                            'ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded',
                                            (sitePerf.performance_score ?? 0) >= 90 ? 'text-[#00CC6A] bg-[#00CC6A]/10' :
                                            (sitePerf.performance_score ?? 0) >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-500 bg-red-50'
                                        )}>
                                            {sitePerf.rating ?? 'N/A'}
                                        </span>
                                    </div>
                                    <div className="p-4 grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Performance', value: sitePerf.performance_score != null ? `${sitePerf.performance_score}/100` : '-' },
                                            { label: 'SEO',         value: sitePerf.seo_score != null ? `${sitePerf.seo_score}/100` : '-' },
                                            { label: 'LCP',         value: sitePerf.lcp ?? '-' },
                                            { label: 'CLS',         value: sitePerf.cls ?? '-' },
                                            { label: 'FCP',         value: sitePerf.fcp ?? '-' },
                                            { label: 'TTI',         value: sitePerf.tti ?? '-' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-zinc-50 rounded-lg p-2 text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                                                <p className="text-sm font-black text-zinc-900 mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Inteligencia de Mercado (condensada) */}
                            {market && (
                                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                                        <BrainCircuit className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Inteligencia de Mercado</span>
                                        <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-zinc-300">GPT-4.5</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {/* TAM/SAM/SOM */}
                                        {market.market_sizing && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { label: 'TAM', value: market.market_sizing.tam },
                                                    { label: 'SAM', value: market.market_sizing.sam },
                                                    { label: 'SOM', value: market.market_sizing.som },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="bg-zinc-50 rounded-lg p-2">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                                                        <p className="text-[10px] font-bold text-zinc-800 mt-0.5 leading-snug line-clamp-2">{value || '-'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Top Persona */}
                                        {market.personas?.[0] && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> ICP Principal
                                                </p>
                                                <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3">
                                                    <p className="text-xs font-black text-zinc-900">{market.personas[0].name} - {market.personas[0].role}</p>
                                                    <p className="text-[11px] font-medium text-zinc-500 mt-1 leading-snug">{market.personas[0].pain}</p>
                                                    <p className="text-[11px] text-zinc-400 italic mt-1.5 border-l-2 border-zinc-200 pl-2 leading-snug">"{market.personas[0].message}"</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Conselho estrategico */}
                                        {market.strategic_advice && (
                                            <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Conselho Estrategico</p>
                                                <p className="text-xs font-medium text-zinc-700 leading-relaxed">{market.strategic_advice}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!hasData && !loadingData && (
                                <div className="py-8 text-center">
                                    <BrainCircuit className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                    <p className="text-sm font-black text-zinc-400 mb-1">Sem dados de inteligencia</p>
                                    <p className="text-xs font-medium text-zinc-300">Clique no refresh para carregar CNPJ e site.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer fixo - CTA ──────────────────────────────────── */}
                <div className="shrink-0 border-t border-zinc-100 px-6 py-4 bg-white space-y-2">
                    <Button
                        onClick={handleQualify}
                        disabled={qualifying}
                        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-11 gap-2"
                    >
                        {qualifying ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Qualificando...</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" /> Qualificar como Cliente Pago <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
                        )}
                    </Button>
                    <button
                        onClick={() => { onClose(); navigate(`/admin/projects/${lead?.id}`); }}
                        className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-700 h-8 transition-colors"
                    >
                        Abrir projeto completo
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default LeadWarRoomSheet;
