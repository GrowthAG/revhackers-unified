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
import SprintBoard from '@/pages/admin/SprintBoard';
import { useToast } from '@/hooks/use-toast';
import ProjectWiki from './ProjectWiki';

// Placeholders for components to come
const SprintBoardPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <Zap className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">Sprint Board</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-2">
            O gestor de tarefas e sprints será carregado aqui.
            <br />
            (Em desenvolvimento: Fase de Kanban)
        </p>
    </div>
);

const DocumentVaultPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <BookOpen className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">Biblioteca de Documentos</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-2">
            Repositório central de entregáveis aprovados.
        </p>
    </div>
);

const DailyDashboardPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <Users className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900">Daily Operations</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-2">
            Visão de carga de trabalho e desbloqueio diário.
        </p>
    </div>
);

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
                <div className="bg-white border-b border-zinc-100 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/rei')} className="text-zinc-400 hover:text-zinc-700 h-8 w-8">
                            <ChevronLeft size={16} />
                        </Button>
                        <div>
                            <h1 className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                                {project.client_company || project.client_name}
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400 text-[9px] font-medium">
                                    {project.status === 'active' ? 'Ativo' : 'Onboarding'}
                                </span>
                            </h1>
                            <p className="text-[10px] text-zinc-400">Workspace Unificado</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-zinc-50/30">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-white border border-zinc-200 p-1 h-auto rounded-xl">
                            <TabsTrigger value="jornada" className="px-4 py-2 text-xs font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <Map size={14} /> Jornada
                            </TabsTrigger>
                            <TabsTrigger value="execucao" className="px-4 py-2 text-xs font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <Zap size={14} /> Execução (Sprints)
                            </TabsTrigger>
                            <TabsTrigger value="biblioteca" className="px-4 py-2 text-xs font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <BookOpen size={14} /> Biblioteca
                            </TabsTrigger>
                            <TabsTrigger value="resultados" className="px-4 py-2 text-xs font-medium data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center">
                                <TrendingUp size={14} /> Resultados
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="jornada" className="m-0">
                            <OrchestratedOnboarding projectId={project.id} embedded={true} />
                        </TabsContent>
                        <TabsContent value="execucao" className="m-0">
                            <SprintBoard projectId={project.id} projectName={project.client_name} embedded={true} />
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
