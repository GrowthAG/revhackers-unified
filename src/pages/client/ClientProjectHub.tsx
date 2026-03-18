```
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getPublicReiProjectById, type ReiProject } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Clock, Shield, FileText, LayoutTemplate, MessageSquare, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Scope items by project type ───────────────────────────────────────────
const scopeByType: Record<string, string[]> = {
    crm_ops: [
        'Diagnóstico de Revenue Operations',
        'Estruturação e Configuração do CRM',
        'Automações de Pipeline e Follow-up',
        'Playbook de Vendas & SLA de Passagem',
        'Treinamento do Time no CRM',
        'Dashboard de Métricas Comerciais',
    ],
    CRM_CS_OPS: [
        'Diagnóstico de Revenue Operations',
        'Estruturação e Configuração do CRM',
        'Automações de Pipeline e Follow-up',
        'Playbook de Vendas & SLA de Passagem',
        'Treinamento do Time no CRM',
        'Dashboard de Métricas Comerciais',
    ],
    founder: [
        'Diagnóstico de Posicionamento Digital',
        'Otimização de Perfil LinkedIn',
        'Estratégia de Conteúdo & Calendário',
        'Framework de Social Selling',
        'Benchmark de Contas Âncora',
        'Métricas de Engajamento & Conversão',
    ],
    dev: [
        'Briefing Técnico Completo',
        'Wireframes e Aprovação de UX',
        'Design de Alta Fidelidade',
        'Desenvolvimento Front-end & Back-end',
        'Testes de Performance (LCP/GTmetrix)',
        'Go Live e Monitoramento',
    ],
    funnels_impl: [
        'Diagnóstico de Funil de Conversão',
        'Estrutura de Landing Pages',
        'Automações de Nutrição e Follow-up',
        'Setup de Ads & Tracking',
        'Otimização de Taxa de Conversão',
        'Dashboard de Performance',
    ],
    default: [
        'Diagnóstico de Receita Profundo (360º)',
        'Roadmap de Implementação de 90 dias',
        'Setup de CRM & Ferramentas de Vendas',
        'Playbook de Vendas (V1)',
        'Treinamento do Time Comercial',
        'Dashboard de Métricas em Tempo Real',
    ],
};

const CATEGORY_LABELS: Record<string, string> = {
    'geral': 'Visão Geral',
    'kickoff': 'Kickoff & Alinhamento',
    'transcr': 'Transcrições e Reuniões',
    'strategy': 'Planejamento e Estratégia',
    'tech': 'Documentação Técnica',
    'playbook': 'Playbooks e SOPs',
    'final': 'Entregáveis Finais',
    'acessos': 'Acessos e Referências'
};

const ClientProjectHub = () => {
    const { id } = useParams();
    const [project, setProject] = useState<Partial<ReiProject> | null>(null);
    const [planToken, setPlanToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientDocs, setClientDocs] = useState<any[]>([]);

    useEffect(() => {
        const loadProject = async () => {
            if (!id) return;
            try {
                // 1. Fetch Project Public Data
                const data = await getPublicReiProjectById(id);
                if (data) setProject(data);

                // 2. Fetch Plan Token if exists (for button link)
                const { data: planData } = await supabase
                    .from('strategic_plans')
                    .select('access_token')
                    .eq('rei_project_id', id)
                    .maybeSingle();

                if (planData) setPlanToken(planData.access_token);

                // 3. Fetch Official Handover Documentation
                const { data: libData } = await supabase
                    .from('knowledge_libraries')
                    .select('id')
                    .eq('project_id', id)
                    .maybeSingle();
                
                if (libData) {
                    const { data: docs } = await supabase
                        .from('agent_documents')
                        .select('id, title, metadata, updated_at')
                        .eq('library_id', libData.id)
                        .order('updated_at', { ascending: false });
                    
                    if (docs) {
                        const publicDocs = docs.filter(d => 
                            (d.metadata as any)?.visibility === 'shared' || 
                            (d.metadata as any)?.visibility === 'final'
                        );
                        setClientDocs(publicDocs);
                    }
                }

            } catch (error) {
                console.error("Error loading project hub:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-zinc-900 animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <Shield className="w-12 h-12 text-zinc-200 mb-6" />
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Restrito</h1>
                <p className="text-zinc-500 text-sm">O projeto solicitado não foi encontrado ou o link expirou.</p>
            </div>
        );
    }

    // --- LOGIC: DETERMINE CURRENT PHASE & CTA ---
    const getPhaseStatus = () => {
        const isScheduled = project.scheduling_completed;
        if (!isScheduled) return 'scheduling';
        return 'execution';
    };

    const currentPhase = getPhaseStatus();

    const handleViewSchedule = () => {
        if (planToken) {
            window.open(`/plan/${planToken}`, '_blank');
        } else {
            document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-inter selection:bg-zinc-900 selection:text-white">
            {/* 1. HEADER */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 w-full z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-white text-xs">RH</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-zinc-900 leading-none mb-1">{project.client_name}</h1>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Growth Hub</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
                                Ciclo 1 • {new Date().getFullYear()}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 hidden md:block" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                            <span className="text-xs font-bold text-[#00CC6A] uppercase tracking-wider">Ativo</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. HERO / MAIN ACTION */}
            <main className="pt-12 pb-20 px-6">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* STATUS CARD */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 border-0 uppercase tracking-widest text-[9px] mb-6 pl-2 pr-3 py-1.5 rounded-md font-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-white mr-2" />
                                Próxima Ação
                            </Badge>

                            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-6 leading-[1.05]">
                                {currentPhase === 'scheduling'
                                    ? 'Agendamento do Kickoff.'
                                    : 'Acompanhe a Execução.'}
                            </h2>

                            <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-lg font-normal">
                                {currentPhase === 'scheduling'
                                    ? 'Seu analista entrará em contato para alinhar os ponteiros técnicos e dar o start oficial nos 90 dias.'
                                    : 'O projeto está em andamento. Acesse o cronograma completo ou agende sua apresentação estratégica.'}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {currentPhase === 'scheduling' ? (
                                    <Button
                                        className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl shadow-sm"
                                        onClick={() => window.open(project.analyst_email ? `mailto:${project.analyst_email}` : '#', '_blank')}
                                    >
                                        Falar com Analista <MessageSquare className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl shadow-sm"
                                        onClick={() => project.analyst_email ? window.open(`mailto:${project.analyst_email}?subject=Agendar Apresentação Estratégica`, '_blank') : null}
                                    >
                                        Agendar Apresentação <Clock className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleViewSchedule}
                                    className="h-12 px-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm rounded-xl"
                                >
                                    {planToken ? "Acessar Plano Realizado" : "Ver Cronograma"}
                                </Button>
                            </div>
                        </div>

                    </div>

                    {/* 3. TIMELINE VISUALIZATION */}
                    <div id="timeline" className="py-8 scroll-mt-24">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2 pl-1">
                            <LayoutTemplate className="w-4 h-4" /> Roadmap de Execução
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { step: '01', title: 'Setup & Diagnóstico', status: 'done', desc: 'Análise inicial concluída.' },
                                { step: '02', title: 'Start Oficial', status: project.scheduling_completed ? 'done' : 'active', desc: 'Apresentação do Plano.' },
                                { step: '03', title: 'Construção', status: 'pending', desc: 'Implementação de Processos.' },
                                { step: '04', title: 'Go Live', status: 'pending', desc: 'Operação Assistida.' }
                            ].map((item, i) => (
                                <div key={i} className={`
                                    relative p-6 rounded-xl border transition-all duration-300 flex flex-col justify-between h-32
                                    ${item.status === 'active' ? 'bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900/5' : ''}
                                    ${item.status === 'done' ? 'bg-zinc-50 border-zinc-200' : ''}
                                    ${item.status === 'pending' ? 'bg-white border-zinc-100 opacity-60 grayscale' : ''}
                                `}>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'active' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                            Fase {item.step}
                                        </span>
                                        {item.status === 'done' && <div className="bg-[#00CC6A]/10 text-[#00CC6A] p-1 rounded-md"><Check className="w-3 h-3" /></div>}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm leading-tight mb-1 ${item.status === 'active' ? 'text-zinc-900' : 'text-zinc-700'}`}>{item.title}</h4>
                                        <p className="text-xs text-zinc-500 font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3.5. OFFICIAL DOCUMENTATION HANDOVER */}
                    {clientDocs.length > 0 && (
                        <div id="docs" className="py-8 scroll-mt-24">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2 pl-1">
                                <BookOpen className="w-4 h-4" /> Documentação Oficial
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {clientDocs.map(doc => {
                                    const meta = doc.metadata as any || {};
                                    const cat = meta.category || 'geral';
                                    const isFinal = meta.visibility === 'final';
                                    return (
                                        <div 
                                            key={doc.id}
                                            // TODO: Client view of the document. For now, open an alert. A proper `/client-doc/:id` route should be built eventually.
                                            onClick={() => alert('Visualizador de documentos do cliente em breve.')}
                                            className={cn(
                                                "group relative border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden",
                                                isFinal ? "bg-zinc-900 border-zinc-800 text-white shadow-xl hover:bg-black" : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:shadow-sm"
                                            )}
                                        >
                                            <div className="flex justify-between items-start z-10 relative mb-6">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                                    isFinal ? "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white"
                                                )}>
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {isFinal && (
                                                        <span className="px-2 py-0.5 bg-[#00CC6A]/20 text-[#00CC6A] border border-[#00CC6A]/30 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                            Entregável Final
                                                        </span>
                                                    )}
                                                    <span className={cn(
                                                        "px-2 py-0.5 border rounded-md text-[8px] font-bold uppercase tracking-wider",
                                                        isFinal ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-zinc-50 border-zinc-100 text-zinc-500"
                                                    )}>
                                                        {CATEGORY_LABELS[cat] || cat}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="z-10 relative">
                                                <h3 className={cn("font-bold mb-1 line-clamp-2", isFinal ? "text-white" : "text-zinc-900")}>
                                                    {doc.title}
                                                </h3>
                                                <p className={cn("text-xs font-medium", isFinal ? "text-zinc-500" : "text-zinc-400")}>
                                                    Atualizado em {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 4. SCOPE SUMMARY (CONTRACTED) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-zinc-200">
                        <div className="lg:col-span-1">
                            <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">Escopo Contratado</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                                Este é o resumo executivo das entregas previstas para este ciclo de 90 dias.
                            </p>
                            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-200">
                                        <FileText className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Analista Líder</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs text-zinc-900 font-medium truncate" title={project.analyst_email || ''}>
                                                {project.analyst_email || 'Não atribuído'}
                                            </p>
                                            {project.analyst_email && <Check className="w-3 h-3 text-[#00CC6A]" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(scopeByType[project.type || 'default'] || scopeByType.default).map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors">
                                            <div className="mt-0.5 bg-zinc-900 text-white rounded-full p-0.5 shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm text-zinc-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] text-center text-zinc-400 uppercase tracking-widest mt-8 font-medium">
                                RevHackers Growth Hub • Documento Oficial
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ClientProjectHub;
