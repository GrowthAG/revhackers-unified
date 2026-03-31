import React, { useState } from 'react';
import { ReiProject } from '@/api/reiProjects';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Loader2, Zap, Target, Search, Linkedin, Activity,
    BrainCircuit, Users, Building2, Globe, TrendingUp,
    BarChart2, RefreshCw, Lightbulb, AlertCircle, Wrench, Focus, Crosshair
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
                <span className="absolute inset-0 flex items-center justify-center text-xxs font-black text-zinc-900">
                    {score}
                </span>
            </div>
            <div>
                <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">{label}</p>
                <p className="text-xs font-bold text-zinc-700">
                    {score >= 90 ? 'Excelente' : score >= 50 ? 'Melhorar' : 'Crítico'}
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
    
    // Ouro escondido que descobrimos no log (Gerado pelo inspect-website)
    const siteInspection  = (project as any).site_analysis ?? null;
    const aiAnalysis      = siteInspection?.ai_analysis ?? null;

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
                segment:      project.client_name || '',
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

            toast.success('Inteligência de Mercado gerada!', {
                description: 'TAM/SAM/SOM, personas e concorrentes importados do GPT-4.5.'
            });

            if (onUpdateProject) onUpdateProject();

        } catch (e: any) {
            console.error(e);
            toast.error('Falha ao gerar inteligência', { description: e.message || 'Erro de conexão' });
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

    const tabTitle = project.type === 'founder'      ? 'Inteligência Founder & OSINT'
                   : project.type === 'crm_ops'      ? 'Inteligência de Vendas B2B'
                   : project.type === 'dev'           ? 'Inteligência de Aquisição & Site'
                   : project.type === 'funnels_impl'  ? 'Inteligência de Aquisição & Funis'
                   : 'Inteligência de Mercado 360';

    const tabSubtitle = project.type === 'founder'
        ? 'Visão de Autoridade LinkedIn (OSINT) e Personas de Posicionamento B2B.'
        : project.type === 'crm_ops'
        ? 'Mapeamento de ICP, Pipeline B2B e Concorrentes do segmento.'
        : project.type === 'dev' || project.type === 'funnels_impl'
        ? 'Análise de aquisição, benchmark de conversão e mapeamento de canais.'
        : 'Análise de Mercado TAM/SAM/SOM, Personas e Dados Setoriais.';

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
                        className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold uppercase tracking-widest text-xxs h-9 px-4"
                    >
                        {isEnriching
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Enriquecendo...</>
                            : <><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> CNPJ + Site</>
                        }
                    </Button>
                    <Button
                        onClick={handleGenerateMarketIntelligence}
                        disabled={isGenerating}
                        className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest text-xxs h-9 px-5"
                    >
                        {isGenerating
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> GPT-4.5...</>
                            : <><Zap className="w-3.5 h-3.5 mr-1.5" /> Gerar Análise IA</>
                        }
                    </Button>
                </div>
            </div>

            {/* ── BLOCO 0.5: LINKEDIN OSINT & AUTORIDADE DIGITAL ── */}
            {marketData?.linkedin_osint ? (
                <div className="border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-[#0A66C2]/5">
                        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                        <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-700">
                            OSINT: Perfil & Autoridade Digital
                        </h3>
                        <span className="ml-auto text-2xs font-black uppercase tracking-widest text-[#0A66C2] border border-[#0A66C2]/30 px-2 py-0.5 rounded bg-white">
                            Scraping IA
                        </span>
                    </div>
                    <div className="p-6 md:p-8 bg-white grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Status Lateral Esquerdo */}
                        <div className="md:col-span-4 space-y-6">
                            <div>
                                <h4 className="text-xl font-black text-zinc-900 tracking-tight">{marketData.linkedin_osint.fullName}</h4>
                                <p className="text-xs text-zinc-500 font-medium leading-snug mt-1">{marketData.linkedin_osint.headline}</p>
                                <a href={marketData.linkedin_osint.profileUrl} target="_blank" rel="noreferrer" className="text-xxs uppercase font-bold text-[#0A66C2] hover:underline mt-2 inline-block tracking-widest">
                                    Ver Perfil
                                </a>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="border border-zinc-100 p-4 bg-zinc-50/50">
                                    <p className="text-2xs font-black uppercase tracking-widest text-zinc-400 mb-1">Arquétipo Dominante</p>
                                    <p className="text-sm font-black text-zinc-900 mb-2">{marketData.linkedin_osint.archetype} ({marketData.linkedin_osint.managementStyle})</p>
                                    <p className="text-tiny text-zinc-500 leading-snug italic">"{marketData.linkedin_osint.archetypeReason}"</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 border border-zinc-100 p-4 bg-zinc-50/50 text-center">
                                        <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">Score de Autoridade</p>
                                        <p className="text-2xl font-black text-zinc-900 mt-1">{marketData.linkedin_osint.authorityScore}<span className="text-sm text-zinc-400 font-bold">/100</span></p>
                                    </div>
                                    <div className="flex-1 border border-zinc-100 p-4 bg-zinc-50/50 text-center">
                                        <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">Seguidores</p>
                                        <p className="text-2xl font-black text-zinc-900 mt-1">{marketData.linkedin_osint.followerCount?.toLocaleString('pt-BR') || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Análise de Gaps Direita */}
                        <div className="md:col-span-8 flex flex-col justify-between">
                            <div className="mb-6">
                                <p className="text-xxs font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                                    <Focus size={14} className="text-zinc-500" /> Resumo do Posicionamento
                                </p>
                                <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                                    {marketData.linkedin_osint.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xxs font-black uppercase tracking-widest text-red-500 mb-3 border-b border-red-100 pb-2">Blind Spots (Pontos Cegos)</p>
                                    <ul className="space-y-2">
                                        {(marketData.linkedin_osint.blindSpots || []).map((spot: string, i: number) => (
                                            <li key={i} className="text-tiny font-medium text-zinc-600 flex items-start gap-2">
                                                <span className="text-red-400 mt-0.5">•</span> {spot}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xxs font-black uppercase tracking-widest text-amber-500 mb-3 border-b border-amber-100 pb-2">Branding Gaps</p>
                                    <ul className="space-y-2">
                                        {(marketData.linkedin_osint.brandingGaps || []).map((gap: string, i: number) => (
                                            <li key={i} className="text-tiny font-medium text-zinc-600 flex items-start gap-2">
                                                <span className="text-amber-400 mt-0.5">•</span> {gap}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 border border-[#00CC6A]/20 bg-[#00CC6A]/5 p-4">
                                <p className="text-xxs font-black uppercase tracking-widest text-[#00CC6A] mb-1">Ação Prática Imediata (Insight)</p>
                                <p className="text-sm font-bold text-zinc-800 leading-snug">{marketData.linkedin_osint.actionableInsight}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* ── BLOCO 1: DOSSIÊ EXECUTIVO (SITE UX & GAPS) - BRUTALIST ── */}
            {aiAnalysis ? (
                 <div className="border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-800 bg-zinc-950 text-white">
                        <Target className="w-4 h-4 text-[#00CC6A]" />
                        <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                            Dossiê de Fricção Comercial (Site Analysis)
                        </h3>
                        <span className="ml-auto text-2xs font-black uppercase tracking-widest text-[#00CC6A]/60 border border-[#00CC6A]/30 px-2 py-0.5 rounded">
                            {aiAnalysis.segmento}
                        </span>
                    </div>
                    <div className="bg-white">
                        {/* Hipótese Central */}
                        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                            <p className="text-xxs font-black text-red-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <AlertCircle size={12} /> Problema Identificado (O Gargalo)
                            </p>
                            <p className="text-lg font-medium text-zinc-900 leading-snug tracking-tight">
                                "{aiAnalysis.problema_identificado}"
                            </p>
                            <div className="mt-4 flex gap-4 text-xxs font-bold uppercase tracking-widest text-zinc-400">
                                <span>Maturidade: <span className="text-zinc-800">{aiAnalysis.maturidade_digital}</span></span>
                                <span>|</span>
                                <span>Tom: <span className="text-zinc-800">{aiAnalysis.tom_comunicacao}</span></span>
                                <span>|</span>
                                <span>Proposta Clara? <span className={aiAnalysis.proposta_de_valor_clara ? 'text-[#00CC6A]' : 'text-red-500'}>{aiAnalysis.proposta_de_valor_clara ? 'Sim' : 'Não'}</span></span>
                            </div>
                        </div>

                        {/* Colunas Gaps vs Oportunidades */}
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                            {/* Pontos Fracos */}
                            <div className="p-8 space-y-4">
                                <p className="text-xxs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <Crosshair size={14} className="text-red-400" /> Vazamentos (Gaps)
                                </p>
                                <ul className="space-y-4">
                                    {(aiAnalysis.pontos_fracos_site || []).map((gap: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 leading-tight">
                                            <span className="text-red-400 font-black mt-0.5">X</span>
                                            {gap}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Plano de Ação (Oportunidades) */}
                            <div className="p-8 space-y-4 bg-zinc-50/30">
                                <p className="text-xxs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <Zap size={14} className="text-[#00CC6A]" /> Plano de Ação Estratégico
                                </p>
                                <ul className="space-y-4">
                                    {(aiAnalysis.oportunidades_estrategicas || []).map((opt: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 leading-tight">
                                            <span className="text-[#00CC6A] font-black mt-0.5 text-xxs">0{i+1}</span>
                                            {opt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Tecnologias Mapeadas */}
                        {aiAnalysis.ferramentas_detectadas && (
                            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-wrap gap-4 items-center">
                                <p className="text-2xs font-black text-zinc-400 uppercase tracking-widest w-full md:w-auto">Tech Stack Identificada:</p>
                                <div className="flex flex-wrap gap-2">
                                    {aiAnalysis.ferramentas_detectadas.split(',').map((tech: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-zinc-200 text-zinc-600 text-xxs font-bold uppercase tracking-wider ">
                                            {tech.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            ) : project.client_site ? (
                <div className="border border-dashed border-zinc-200 p-6 flex flex-col items-center justify-center gap-4 bg-zinc-50/50 text-center">
                     <Wrench className="w-8 h-8 text-zinc-300" />
                     <div>
                         <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">Dossiê de Conversão Pendente</p>
                         <p className="text-xs font-medium text-zinc-400 mt-1 max-w-sm">
                             Este projeto ainda não possui a análise qualitativa do site (Gaps e Oportunidades). Você pode processar isso ativando o Web Scraper e a IA para varrer o site '{project.client_site}'.
                         </p>
                     </div>
                </div>
            ) : null}


            {/* ── BLOCO 1: Dados da Empresa (CNPJ / Receita Federal) ── */}
            {cnpjData ? (
                <div className="border border-zinc-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                        <Building2 className="w-4 h-4 text-zinc-400" />
                        <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                            Dados Oficiais - Receita Federal
                        </h3>
                        <span className="ml-auto text-2xs font-black uppercase tracking-widest text-zinc-300">
                            BrasilAPI
                        </span>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                        {[
                            { label: 'Razão Social',         value: cnpjData.razao_social },
                            { label: 'Nome Fantasia',        value: cnpjData.nome_fantasia || '-' },
                            { label: 'Situação Cadastral',   value: cnpjData.situacao_cadastral },
                            { label: 'Abertura',             value: cnpjData.data_abertura ? new Date(cnpjData.data_abertura).toLocaleDateString('pt-BR') : '-' },
                            { label: 'Porte',                value: cnpjData.porte || '-' },
                            { label: 'Capital Social',       value: cnpjData.capital_social ? `R$ ${Number(cnpjData.capital_social).toLocaleString('pt-BR')}` : '-' },
                            { label: 'Município / UF',       value: cnpjData.municipio && cnpjData.uf ? `${cnpjData.municipio} / ${cnpjData.uf}` : '-' },
                            { label: 'Natureza Jurídica',    value: cnpjData.natureza_juridica || '-' },
                            { label: 'Contato',              value: cnpjData.telefone || cnpjData.email || '-' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-2xs font-black uppercase tracking-widest text-zinc-400 mb-0.5">{label}</p>
                                <p className="text-sm font-bold text-zinc-900 leading-snug">{value || '-'}</p>
                            </div>
                        ))}
                    </div>
                    {cnpjData.cnae_principal && (
                        <div className="px-6 pb-5">
                            <p className="text-2xs font-black uppercase tracking-widest text-zinc-400 mb-1">CNAE Principal</p>
                            <p className="text-sm font-bold text-zinc-900">
                                {cnpjData.cnae_principal.codigo} - {cnpjData.cnae_principal.descricao}
                            </p>
                        </div>
                    )}
                </div>
            ) : null}

            {/* ── BLOCO 2: Performance do Site (Google PSI) ── */}
            {sitePerf ? (
                <div className="border border-zinc-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                        <Globe className="w-4 h-4 text-zinc-400" />
                        <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                            Performance Bruta do Site
                        </h3>
                        <span className="ml-auto text-2xs font-black uppercase tracking-widest text-zinc-300">
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
                                <div key={label} className="bg-zinc-50 border border-zinc-100 p-3 text-center">
                                    <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">{label}</p>
                                    <p className="text-lg font-black text-zinc-900 mt-1">{value || '-'}</p>
                                    <p className="text-2xs font-medium text-zinc-400 mt-0.5 leading-tight">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* ── BLOCO 4: TAM / SAM / SOM (Se marketData existir) ── */}
            {marketData ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'TAM - Total Addressable Market', value: marketData.market_sizing?.tam, accent: 'border-zinc-200' },
                            { label: 'SAM - Serviceable Market',       value: marketData.market_sizing?.sam, accent: 'border-[#00CC6A]/30' },
                            { label: 'SOM - Obtainable Market',        value: marketData.market_sizing?.som, accent: 'border-zinc-200' },
                        ].map(({ label, value, accent }) => (
                            <div key={label} className={cn('border p-6 bg-white shadow-sm', accent)}>
                                <p className="text-2xs font-black uppercase tracking-widest text-zinc-400 mb-3">{label}</p>
                                <p className="font-bold text-zinc-900 leading-snug text-sm">{value || 'Dados indisponíveis'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Buyer Personas */}
                        <div className="border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <Users className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                                    Buyer Personas Mapeadas
                                </h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {(marketData.personas || []).map((persona: any, idx: number) => (
                                    <div key={idx} className="bg-zinc-50 border border-zinc-100 p-4 ">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-zinc-900 text-white text-2xs font-black uppercase rounded tracking-wider">
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
                        <div className="border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                                <Search className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                                    Radar de Concorrentes
                                </h3>
                            </div>
                            <div className="p-5 space-y-3">
                                {(marketData.competitor_benchmarks || []).map((comp: any, idx: number) => (
                                    <div key={idx} className="bg-zinc-50 border border-zinc-100 p-4 ">
                                        <h4 className="font-black text-zinc-900 text-sm mb-1">{comp.company_name}</h4>
                                        <p className="text-2xs uppercase font-black text-[#00CC6A] mb-1.5 tracking-widest">{comp.key_metric}</p>
                                        <p className="text-xs font-medium text-zinc-500 leading-snug">{comp.strategy_insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

        </div>
    );
};
