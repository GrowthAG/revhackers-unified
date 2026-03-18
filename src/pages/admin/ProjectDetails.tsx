import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Map,
    Zap,
    BookOpen,
    TrendingUp,
    Users,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getReiProjectById } from '@/api/reiProjects';
import type { ReiProject } from '@/api/reiProjects';
import OrchestratedOnboarding from '@/pages/admin/OrchestratedOnboarding';
import LiveResultsReport from '@/pages/admin/LiveResultsReport';

import { useToast } from '@/hooks/use-toast';
import ProjectWiki from './ProjectWiki';

// Placeholders for components to come

const DocumentVaultPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
        <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-zinc-900" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">Biblioteca</h3>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Repositório central de entregáveis aprovados.
        </p>
    </div>
);

const DailyDashboardPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
        <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-zinc-900" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">Daily Operations</h3>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Visão de carga de trabalho e desbloqueio diário.
        </p>
    </div>
);

/**
 * Extracts trade/brand name from full legal name (razão social).
 * "TUNAD MOMENT MARKETING PLATAFORM LTDA" → "Tunad"
 */
function getDisplayName(project: ReiProject | null): string {
    if (!project) return 'Projeto';
    const raw = project.client_company || project.client_name || 'Projeto';
    const cleaned = raw
        .replace(/\s+(LTDA|EIRELI|S\.?A\.?|ME|EPP|S\/S|SERVICOS|SERVIÇOS|MARKETING|CONSULTORIA|TECNOLOGIA|PLATAFORM|PLATFORM|DIGITAL|SOLUCOES|SOLUÇÕES|MOMENT|GROUP|BRASIL)\b/gi, '')
        .trim();
    const words = cleaned.split(/\s+/);
    const brandName = words.length > 2 ? words.slice(0, 2).join(' ') : cleaned;
    return brandName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || raw;
}

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [loading, setLoading] = useState(true);

    // Manage active tab via URL to allow direct linking
    const activeTab = searchParams.get('tab') || 'jornada';

    useEffect(() => {
        if (id) loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            const data = await getReiProjectById(id!);
            if (!data) {
                toast({ title: 'Projeto não encontrado', variant: 'destructive' });
                navigate('/admin/rei');
                return;
            }
            setProject(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="animate-spin text-zinc-300 w-8 h-8" />
            </div>
        );
    }

    if (!project) return null;

    return (
        <AdminLayout>
            <div className="h-full flex flex-col">
                {/* Project Header */}
                <div className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/rei')} className="text-zinc-400 hover:text-zinc-900 h-8 w-8">
                            <ChevronLeft size={16} />
                        </Button>
                        <div>
                            <h1 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-3">
                                {getDisplayName(project)}
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1 rounded-md">
                                    {project.status === 'active' ? 'Ativo' : 'Onboarding'}
                                </span>
                            </h1>
                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                {project.type === 'crm_ops' ? 'CRM & RevOps' :
                                    project.type === 'founder' ? 'Founder Led Sales' :
                                    project.type === 'dev' ? 'Dev Web & Design' :
                                    project.type === 'funnels_impl' ? 'Site & Funil' : 'Consultoria 360°'
                                } · {project.quarter} {project.year}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-white border border-zinc-200 p-1 h-auto rounded-xl">
                            <TabsTrigger value="jornada" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <Map size={14} /> Jornada
                            </TabsTrigger>
                            <TabsTrigger value="execucao" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <Zap size={14} /> Sprints
                            </TabsTrigger>
                            <TabsTrigger value="biblioteca" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <BookOpen size={14} /> Wiki & Documentos
                            </TabsTrigger>
                            <TabsTrigger value="resultados" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <TrendingUp size={14} /> Resultados
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="jornada" className="m-0">
                            <OrchestratedOnboarding projectId={project.id} embedded={true} />
                        </TabsContent>
                        <TabsContent value="execucao" className="m-0">
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
                                <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
                                    <Zap className="w-5 h-5 text-zinc-900" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">Sprints</h3>
                                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                                    As tarefas e sprints são gerenciadas no Notion.
                                </p>
                            </div>
                        </TabsContent>
                        <TabsContent value="biblioteca" className="m-0">
                            <ProjectWiki projectId={project.id} projectName={project.client_name} />
                        </TabsContent>
                        <TabsContent value="resultados" className="m-0 p-6">
                            <div className="max-w-6xl mx-auto">
                                <LiveResultsReport embedded={true} projectId={project.id} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectDetails;
