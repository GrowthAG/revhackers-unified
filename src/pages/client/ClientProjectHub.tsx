import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getPublicReiProjectById, type ReiProject } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Clock, Shield, FileText, LayoutTemplate, MessageSquare, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HubNpsBlocker } from '@/components/client/HubNpsBlocker';

// ── Scope items by project type ───────────────────────────────────────────
const scopeByType: Record<string, string[]> = {
    crm_ops: [
        'Diagnóstico de Revenue Operations',
        'Estruturação e Configuração do CRM',
        'Automações de Pipeline e Follow-up',
        'Playbook de Vendas & SLA de Passagem',
        'Treinamento do Time no CRM',
        'Uso dos Dashboards Nativos do CRM',
    ],
    crm: [
        'Diagnóstico de Revenue Operations',
        'Estruturação e Configuração do CRM',
        'Automações de Pipeline e Follow-up',
        'Playbook de Vendas & SLA de Passagem',
        'Treinamento do Time no CRM',
        'Uso dos Dashboards Nativos do CRM',
    ],
    CRM_CS_OPS: [
        'Diagnóstico de Revenue Operations',
        'Estruturação e Configuração do CRM',
        'Automações de Pipeline e Follow-up',
        'Playbook de Vendas & SLA de Passagem',
        'Treinamento do Time no CRM',
        'Uso dos Dashboards Nativos do CRM',
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
        'Análise via Dashboards Nativos',
    ],
    default: [
        'Diagnóstico de Receita Profundo (360º)',
        'Roadmap de Implementação de 90 dias',
        'Setup de CRM & Ferramentas de Vendas',
        'Playbook de Vendas (V1)',
        'Treinamento do Time Comercial',
        'Uso de Dashboards Nativos da Ferramenta',
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
    const [npsUnlocked, setNpsUnlocked] = useState(false);
    
    // Orqflow Live Data State
    const [liveTasks, setLiveTasks] = useState<any[]>([]);
    const [liveSprints, setLiveSprints] = useState<any[]>([]);

    useEffect(() => {
        const loadProject = async () => {
            if (!id) return;
            try {
                // 1. Fetch Project Public Data
                const data = await getPublicReiProjectById(id);
                if (data) {
                    setProject(data);
                    
                    // Fire-and-forget: Log client access (Health Score Analytics - Phase 20)
                    supabase.from('rei_projects')
                        .update({ last_login_at: new Date().toISOString() } as any)
                        .eq('id', id)
                        .then(({ error }) => {
                            if (error) console.warn('RLS might block direct update, consider RPC for login tracking.', error);
                        });
                }

                // 2. Fetch Plan Token if exists (for button link)
                const { data: planData } = await (supabase.from('strategic_plans') as any)
                    .select('access_token')
                    .eq('rei_project_id', id)
                    .maybeSingle();

                if (planData) setPlanToken(planData.access_token);

                // 2.5 Fetch NPS Status
                const localNps = localStorage.getItem(`rei_nps_unlocked_${id}`);
                if (localNps === 'true') {
                    setNpsUnlocked(true);
                } else {
                    const { data: npsData } = await (supabase.from('rei_responses') as any)
                        .select('id')
                        .eq('project_id', id)
                        .eq('diagnostic_type', 'onboarding_nps')
                        .maybeSingle();

                    if (npsData) {
                        setNpsUnlocked(true);
                        localStorage.setItem(`rei_nps_unlocked_${id}`, 'true');
                    }
                }

                // 3. Fetch Official Handover Documentation
                const { data: libData } = await (supabase as any).from('knowledge_libraries')
                    .select('id')
                    .eq('project_id', id)
                    .maybeSingle();
                
                if (libData) {
                    const { data: docs } = await (supabase as any).from('agent_documents')
                        .select('id, filename, metadata, created_at')
                        .eq('library_id', libData.id)
                        .order('created_at', { ascending: false });
                    
                    if (docs) {
                        const publicDocs = docs.filter(d => 
                            (d.metadata as any)?.visibility === 'shared' || 
                            (d.metadata as any)?.visibility === 'final'
                        );
                        setClientDocs(publicDocs);
                    }
                }

                // 4. Fetch Live Orqflow Secure Data (The Heartbeat)
                const { data: sprintsData } = await supabase
                    .from('vw_orqflow_public_sprints' as any)
                    .select('*')
                    .eq('project_id', id)
                    .order('created_at', { ascending: false });
                
                if (sprintsData) setLiveSprints(sprintsData);

                const { data: tasksData } = await supabase
                    .from('vw_orqflow_public_tasks' as any)
                    .select('*')
                    .eq('project_id', id)
                    .order('due_date', { ascending: true, nullsFirst: false });
                
                if (tasksData) setLiveTasks(tasksData);

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
        if (planToken) return 'execution';
        const isScheduled = project.scheduling_completed;
        if (!isScheduled) return 'scheduling';
        return 'execution';
    };

    const currentPhase = getPhaseStatus();
    
    // Derived state determining if they should see the Blocker
    const shouldShowNpsBlocker = currentPhase === 'execution' && !npsUnlocked;

    const handleViewSchedule = () => {
        if (planToken) {
            window.open(`/plan/${planToken}`, '_blank');
        } else {
            document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-inter selection:bg-zinc-900 selection:text-white">
            {shouldShowNpsBlocker && (
                <HubNpsBlocker 
                    projectId={id!} 
                    clientName={project.client_name?.split(' ')[0] || 'Cliente'} 
                    onUnlock={() => setNpsUnlocked(true)} 
                />
            )}
            {/* 1. HEADER */}
            <header className="bg-white border-b border-zinc-200 sticky top-0 w-full z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                            <span className="font-bold text-white text-xs tracking-wider">
                                {((project as any).trade_name || (project as any).client_company || project.client_name || 'CL').substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-zinc-900 leading-none mb-1">
                                {(project as any).trade_name || (project as any).client_company || project.client_name}
                            </h1>
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
                                    ? 'Apresentação do Plano.'
                                    : 'Acompanhe a Execução.'}
                            </h2>

                            <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-lg font-normal">
                                {currentPhase === 'scheduling'
                                    ? 'Seu diagnóstico foi analisado pelo nosso time. Seu analista entrará em contato para agendar o Start Oficial e apresentar seu Roadmap de 90 dias.'
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

                        {liveTasks.length > 0 ? (
                           <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                               {liveTasks.map(task => {
                                  let statusColor = "bg-zinc-100 border-zinc-200 text-zinc-500";
                                  let icon = <Clock className="w-4 h-4 text-zinc-400" />;
                                  let statusText = "Agendado";
                                  
                                  if (task.status === 'done') {
                                      statusColor = "bg-[#00CC6A]/10 border-[#00CC6A]/20 text-[#00CC6A]";
                                      icon = <Check className="w-4 h-4 text-[#00CC6A]" />;
                                      statusText = "Concluído";
                                  } else if (task.status === 'doing') {
                                      statusColor = "bg-zinc-500/10 border-zinc-500/20 text-zinc-700";
                                      icon = <Loader2 className="w-4 h-4 text-zinc-700 animate-spin" />;
                                      statusText = "Em Progresso";
                                  } else if (task.status === 'review') {
                                      statusColor = "bg-zinc-400/10 border-zinc-400/20 text-zinc-500";
                                      icon = <MessageSquare className="w-4 h-4 text-zinc-500" />;
                                      statusText = "Em Aprovação";
                                  }

                                  return (
                                     <div key={task.id} className="relative p-5 rounded-2xl bg-white border border-zinc-200 transition-shadow flex items-center justify-between group">
                                         <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${statusColor}`}>
                                               {icon}
                                            </div>
                                            <div>
                                               <h4 className="font-bold text-sm text-zinc-900 group-hover:text-revhackers transition-colors">{task.title}</h4>
                                               <p className="text-xs text-zinc-500 font-medium">
                                                  Prazo: {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'A definir'}
                                               </p>
                                            </div>
                                         </div>
                                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${statusColor}`}>
                                             {statusText}
                                         </span>
                                     </div>
                                  )
                               })}
                           </div>
                        ) : (
                           <div className="text-center py-12 bg-white border border-zinc-200 border-dashed rounded-2xl">
                               <LayoutTemplate className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                               <h4 className="text-sm font-bold text-zinc-900 mb-1">O Roadmap está em construção</h4>
                               <p className="text-xs text-zinc-500">A equipe RH está alocando o Backlog da Sprint.</p>
                           </div>
                        )}
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
                                            onClick={() => {
                                                if (meta.type === 'external_link' && meta.url) {
                                                    window.open(meta.url, '_blank');
                                                } else {
                                                    toast.info('Visualizador de documentos internos em breve. Se o link não abrir, peça ao analista adicionar a URL pública.');
                                                }
                                            }}
                                            className={cn(
                                                "group relative border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between overflow-hidden",
                                                isFinal ? "bg-zinc-900 border-zinc-800 text-white shadow-sm hover:bg-black" : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300"
                                            )}
                                        >
                                            <div className="flex justify-between items-start z-10 relative mb-6">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                                    isFinal ? "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white"
                                                )}>
                                                    {meta.type === 'external_link' ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> : <FileText size={20} />}
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
                                                    {doc.filename}
                                                </h3>
                                                <p className={cn("text-xs font-medium", isFinal ? "text-zinc-500" : "text-zinc-400")}>
                                                    Adicionado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
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
                                <span className="hidden opacity-0" id="debug-type-flag">{project.type}</span>
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
                                    {(scopeByType[project.type?.trim().toLowerCase() || 'default'] || scopeByType.default).map((item, i) => (
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
