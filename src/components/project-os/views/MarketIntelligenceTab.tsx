import React, { useState } from 'react';
import { ReiProject } from '@/api/reiProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Loader2, Zap, Target, Search, Linkedin, Activity,
    BrainCircuit, Users, Building2, Globe, TrendingUp,
    BarChart2, RefreshCw, Lightbulb, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketIntelligenceTabProps {
    project: ReiProject;
    onUpdateProject?: () => void;
}

// Utilitario de score visual para PSI
function ScoreBar({ score, label }: { score: number; label: string }) {
    const color = score >= 90 ? '#00CC6A' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f4f4f5" strokeWidth="3" />
                    <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke={color} strokeWidth="3"
                        strokeDasharray={`${(score / 100) * 94.25} 94.25`}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-900">
                    {score}
                </span>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                <p className="text-xs font-bold text-zinc-700">
                    {score >= 90 ? 'Excelente' : score >= 50 ? 'Melhorar' : 'Critico'}
                </p>
            </div>
        </div>
    );
}

export const MarketIntelligenceTab: React.FC<MarketIntelligenceTabProps> = ({ project, onUpdateProject }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);

    const marketData      = (project as any).market_data ?? null;
    const linkedinData    = (project.linkedin_data as any) ?? null;
    const enrichmentData  = project.enrichment_data ?? null;
    const cnpjData        = enrichmentData?.cnpj ?? null;
    const sitePerf        = enrichmentData?.site_perf ?? null;
    const siteInspection  = (project as any).site_analysis ?? null;

    // ── Gerar inteligencia de mercado GPT ────────────────────────────────────

    const handleGenerateMarketIntelligence = async () => {
        setIsGenerating(true);
        try {
            const objectiveByType: Record<string, string> = {
                consulting:   'Escalar receita e estruturar funil de crescimento 360',
                crm_ops:      'Estruturar pipeline B2B e operacoes de CRM',
                founder:      'Construir autoridade LinkedIn e posicionamento pessoal',
                dev:          'Lancar site/landing de alta conversao',
                funnels_impl: 'Implementar funis de aquisicao e retencao',
            };

            const payload = {
                segment:      project.client_company || project.client_name || '',
                objective:    objectiveByType[project.type || ''] || 'Escalar vendas e marketing digital',
                project_type: project.type,
                clientName:   project.trade_name || project.client_name || '',
                projectId:    project.id,
                rei_responses: {},
                competitors:  [],
            };

            const { data: aiResult, error: fnError } = await supabase.functions.invoke('market-intelligence', {
                body: payload,
            });

            if (fnError) throw fnError;

            const { error: updateError } = await supabase
                .from('rei_projects')
                .update({ market_data: aiResult, market_data_updated_at: new Date().toISOString() } as any)
                .eq('id', project.id);

            if (updateError) throw updateError;

            toast.success('Inteligencia de Mercado gerada!', {
                description: 'TAM/SAM/SOM, personas e concorrentes importados do GPT-4.5.'
            });

            if (onUpdateProject) onUpdateProject();

        } catch (e: any) {
            console.error(e);
            toast.error('Falha ao gerar inteligencia', { description: e.message || 'Erro de conexao' });
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Reenriquecer CNPJ + PSI ──────────────────────────────────────────────

    const handleReEnrich = async () => {
        setIsEnriching(true);
        try {
            const { error } = await supabase.functions.invoke('auto-enrich-project', {
                body: { project_id: project.id },
            });
            if (error) throw error;
            toast.success('Dados enriquecidos com sucesso!', {
                description: 'CNPJ (Receita Federal) e Performance do Site atualizados.'
            });
            if (onUpdateProject) onUpdateProject();
        } catch (e: any) {
            toast.error('Falha no enriquecimento', { description: e.message });
        } finally {
            setIsEnriching(false);
        }
    };

    // ── Titulo dinamico por tipo ─────────────────────────────────────────────

    const tabTitle = project.type === 'founder'      ? 'Inteligencia Founder & OSINT'
                   : project.type === 'crm_ops'      ? 'Inteligencia de Vendas B2B'
                   : project.type === 'dev'           ? 'Inteligencia de Aquisicao & Site'
                   : project.type === 'funnels_impl'  ? 'Inteligencia de Aquisicao & Funis'
                   : 'Inteligencia de Mercado 360';

    const tabSubtitle = project.type === 'founder'
        ? 'Visao de Autoridade LinkedIn (OSINT) e Personas de Posicionamento B2B.'
        : project.type === 'crm_ops'
        ? 'Mapeamento de ICP, Pipeline B2B e Concorrentes do segmento.'
        : project.type === 'dev' || project.type === 'funnels_impl'
        ? 'Analise de aquisicao, benchmark de conversao e mapeamento de canais.'
        : 'Analise de Mercado TAM/SAM/SOM, Personas e Dados Setoriais.';

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-16">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                    <h2 className="text-xl font-black text-black tracking-tight mb-1 uppercase flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-[#00CC6A]" />
                        {tabTitle}
                    </h2>
                    <p className="text-xs text-zinc-400 font-medium tracking-wide">{tabSubtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        onClick={handleReEnrich}
                        disabled={isEnriching}
                        variant="outline"
                        className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold uppercase tracking-widest text-[10px] rounded-xl h-9 px-4"
                    >
                        {isEnriching
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Enriquecendo...</>
                            : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> CNPJ + Site</>
                        }
                    </Button>
                    <Button
                        onClick={handleGenerateMarketIntelligence}
                        disabled={isGenerating}
                        className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl h-9 px-5"
                    >
                        {isGenerating
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> GPT-4.5...</>
                            : <><Zap className="w-3.5 h-3.5 mr-1.5" /> Gerar Analise IA</>
                        }
                    </Button>
                </div>
            </div>

            {/* ── BLOCO 1: Dados da Empresa (CNPJ / Receita Federal) ── */}
            {cnpjData ? (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                        <Building2 className="w-4 h-4 text-zinc-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Dados Oficiais - Receita Federal
                        </h3>
                        <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-300">
                            BrasilAPI
                        </span>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                        {[
                            { label: 'Razao Social',         value: cnpjData.razao_social },
                            { label: 'Nome Fantasia',        value: cnpjData.nome_fantasia || '-' },
                            { label: 'Situacao Cadastral',   value: cnpjData.situacao_cadastral },
                            { label: 'Abertura',             value: cnpjData.data_abertura ? new Date(cnpjData.data_abertura).toLocaleDateString('pt-BR') : '-' },
                            { label: 'Porte',                value: cnpjData.porte || '-' },
                            { label: 'Capital Social',       value: cnpjData.capital_social ? `R$ ${Number(cnpjData.capital_social).toLocaleString('pt-BR')}` : '-' },
                            { label: 'Municipio / UF',       value: cnpjData.municipio && cnpjData.uf ? `${cnpjData.municipio} / ${cnpjData.uf}` : '-' },
                            { label: 'Natureza Juridica',    value: cnpjData.natureza_juridica || '-' },
                            { label: 'Contato',              value: cnpjData.telefone || cnpjData.email || '-' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">{label}</p>
                                <p className="text-sm font-bold text-zinc-900 leading-snug">{value || '-'}</p>
                            </div>
                        ))}
                    </div>
                    {cnpjData.cnae_principal && (
                        <div className="px-6 pb-5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">CNAE Principal</p>
                            <p className="text-sm font-bold text-zinc-900">
                                {cnpjData.cnae_principal.codigo} - {cnpjData.cnae_principal.descricao}
                            </p>
                        </div>
                    )}
                    {cnpjData.qsa && cnpjData.qsa.length > 0 && (
                        <div className="px-6 pb-5 border-t border-zinc-100 pt-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Quadro Societario</p>
                            <div className="flex flex-wrap gap-2">
                                {cnpjData.qsa.map((s: any, i: number) => (
                                    <span key={i} className="text-xs font-bold bg-zinc-50 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-lg">
                                        {s.nome}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border border-dashed border-zinc-200 rounded-2xl p-6 flex items-center gap-4 bg-zinc-50/50">
                    <Building2 className="w-8 h-8 text-zinc-200 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-zinc-400">Dados da Receita Federal nao carregados</p>
                        <p className="text-xs font-medium text-zinc-400 mt-0.5">
                            Clique em "CNPJ + Site" para buscar automaticamente. Requer CNPJ cadastrado no perfil do cliente.
                        </p>
                    </div>
                </div>
            )}

            {/* ── BLOCO 2: Performance do Site (Google PSI) ── */}
            {sitePerf ? (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Performance do Site
                        </h3>
                        <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-300">
                            Google PageSpeed
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-8 mb-6">
                            <ScoreBar score={sitePerf.performance_score ?? 0} label="Performance" />
                            <ScoreBar score={sitePerf.seo_score ?? 0} label="SEO" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: 'LCP', value: sitePerf.lcp, tip: 'Largest Contentful Paint' },
                                { label: 'FID', value: sitePerf.fid, tip: 'First Input Delay' },
                                { label: 'CLS', value: sitePerf.cls, tip: 'Cumulative Layout Shift' },
                                { label: 'FCP', value: sitePerf.fcp, tip: 'First Contentful Paint' },
                                { label: 'TTI', value: sitePerf.tti, tip: 'Time to Interactive' },
                            ].map(({ label, value, tip }) => (
                                <div key={label} className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                                    <p className="text-lg font-black text-zinc-900 mt-1">{value || '-'}</p>
                                    <p className="text-[9px] font-medium text-zinc-400 mt-0.5 leading-tight">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : project.client_site ? (
                <div className="border border-dashed border-zinc-200 rounded-2xl p-6 flex items-center gap-4 bg-zinc-50/50">
                    <Globe className="w-8 h-8 text-zinc-200 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-zinc-400">Performance do site nao analisada ainda</p>
                        <p className="text-xs font-medium text-zinc-400 mt-0.5">
                            Site: <span className="font-bold text-zinc-600">{project.client_site}</span> - Clique em "CNPJ + Site" para analisar.
                        </p>
                    </div>
                </div>
            ) : null}

            {/* ── BLOCO 3: LinkedIn OSINT (apenas founder) ── */}
            {project.type === 'founder' && (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                        <Linkedin className="w-4 h-4 text-[#0077b5]" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Perfil LinkedIn - OSINT
                        </h3>
                    </div>
                    <div className="p-6">
                        {linkedinData ? (
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 overflow-hidden">
                                            {linkedinData.profileImageUrl ? (
                                                <img src={linkedinData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Linkedin className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-zinc-900 tracking-tight leading-none">
                                                {linkedinData.fullName || 'Nome nao encontrado'}
                                            </h4>
                                            <p className="text-xs font-semibold text-zinc-400 mt-0.5 line-clamp-1">
                                                {linkedinData.headline || 'Headline nao disponivel'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 px-3 py-1 rounded-lg text-xs font-bold">
                                            {(linkedinData.followerCount ?? 0).toLocaleString('pt-BR')} seguidores
                                        </span>
                                        {linkedinData.isTopVoice && (
                                            <span className="bg-amber-50 text-amber-700 border-amber-200 border px-3 py-1 rounded-lg text-xs font-bold">
                                                LinkedIn Top Voice
                                            </span>
                                        )}
                                        {linkedinData.archetype && (
                                            <span className="bg-zinc-50 text-zinc-600 border border-zinc-200 px-3 py-1 rounded-lg text-xs font-bold">
                                                {linkedinData.archetype}
                                            </span>
                                        )}
                                    </div>
                                    {linkedinData.actionableInsight && (
                                        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Gatilho Tatico</p>
                                            <p className="text-sm font-medium text-zinc-700 leading-relaxed italic">
                                                "{linkedinData.actionableInsight}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-48 shrink-0 bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Authority Score</p>
                                    <div className="flex items-end justify-center gap-1 mt-2">
                                        <span className="text-5xl font-black tracking-tighter text-zinc-900">
                                            {linkedinData.authorityScore ?? 0}
                                        </span>
                                        <span className="text-base font-bold text-zinc-400 mb-1">/100</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-200 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full',
                                                (linkedinData.authorityScore ?? 0) > 75 ? 'bg-[#00CC6A]' :
                                                (linkedinData.authorityScore ?? 0) > 40 ? 'bg-amber-400' : 'bg-red-400'
                                            )}
                                            style={{ width: `${linkedinData.authorityScore ?? 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Linkedin className="w-8 h-8 text-zinc-200 shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-zinc-400">Sem dados OSINT do LinkedIn</p>
                                    <p className="text-xs font-medium text-zinc-400 mt-0.5">
                                        Use a extensao Chrome RevHackers no perfil LinkedIn do cliente para coletar.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── BLOCO 4: TAM / SAM / SOM ── */}
            {marketData ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'TAM - Total Addressable Market', value: marketData.market_sizing?.tam, accent: 'border-zinc-200' },
                            { label: 'SAM - Serviceable Market',       value: marketData.market_sizing?.sam, accent: 'border-[#00CC6A]/30' },
                            { label: 'SOM - Obtainable Market',        value: marketData.market_sizing?.som, accent: 'border-zinc-200' },
                        ].map(({ label, value, accent }) => (
                            <div key={label} className={cn('border rounded-2xl p-6 bg-white', accent)}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">{label}</p>
                                <p className="font-bold text-zinc-900 leading-snug text-sm">{value || 'Dados indisponiveis'}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tendencias do setor */}
                    {marketData.industry_trends?.length > 0 && (
                        <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <TrendingUp className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    Tendencias do Setor
                                </h3>
                            </div>
                            <div className="p-6 space-y-3">
                                {marketData.industry_trends.map((trend: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="text-[10px] font-black text-[#00CC6A] bg-[#00CC6A]/10 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="text-sm font-medium text-zinc-700 leading-snug">{trend}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Personas + Concorrentes */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Buyer Personas */}
                        <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <Users className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    Buyer Personas Mapeadas
                                </h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {(marketData.personas || []).map((persona: any, idx: number) => (
                                    <div key={idx} className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-zinc-900 text-white text-[9px] font-black uppercase rounded tracking-wider">
                                                ICP {idx + 1}
                                            </span>
                                            <span className="font-bold text-zinc-900 text-sm truncate">
                                                {persona.name} - {persona.role}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-zinc-600 leading-tight mb-1.5">
                                            <span className="text-zinc-400 font-semibold">Dor: </span>{persona.pain}
                                        </p>
                                        <p className="text-xs text-zinc-500 leading-tight italic border-l-2 border-zinc-200 pl-2.5">
                                            "{persona.message}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Radar de Concorrentes */}
                        <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <Search className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    Radar de Concorrentes
                                </h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {(marketData.competitor_benchmarks || []).map((comp: any, idx: number) => (
                                    <div key={idx} className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                                        <h4 className="font-black text-zinc-900 text-sm mb-1">{comp.company_name}</h4>
                                        <p className="text-[9px] uppercase font-black text-[#00CC6A] mb-1.5 tracking-widest">{comp.key_metric}</p>
                                        <p className="text-xs font-medium text-zinc-500 leading-snug">{comp.strategy_insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Conselho Estrategico */}
                    {marketData.strategic_advice && (
                        <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <Lightbulb className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    Conselho Estrategico
                                </h3>
                                <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-300">GPT-4.5</span>
                            </div>
                            <div className="p-6">
                                <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                                    {marketData.strategic_advice}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl">
                    <div className="w-14 h-14 bg-white border border-zinc-100 rounded-xl flex items-center justify-center mb-4">
                        <BrainCircuit className="w-7 h-7 text-zinc-300" />
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 mb-1">Analise IA nao gerada</h3>
                    <p className="text-xs font-medium text-zinc-400 max-w-xs text-center leading-relaxed">
                        Clique em "Gerar Analise IA" para processar TAM/SAM/SOM, Personas e Concorrentes com GPT-4.5.
                    </p>
                </div>
            )}
        </div>
    );
};
