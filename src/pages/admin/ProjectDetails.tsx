import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Map,
    Zap,
    BookOpen,
    TrendingUp,
    Users,
    ChevronLeft,
    Loader2,
    Link as LinkIcon,
    QrCode,
    Presentation
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
import { getReiProjectById } from '@/api/reiProjects';
import type { ReiProject } from '@/api/reiProjects';
import OrchestratedOnboarding from '@/pages/admin/OrchestratedOnboarding';

import { useToast } from '@/hooks/use-toast';
import ProjectWiki from './ProjectWiki';
import { AIPlaybookGenerator } from '@/components/admin/playbook/AIPlaybookGenerator';

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
    if (project.trade_name) return project.trade_name;
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
                                {project.client_id ? (
                                    <Link to={`/admin/clients/${project.client_id}`} className="hover:underline transition-colors decoration-2 underline-offset-4 cursor-pointer" title="Ver Perfil do Cliente">
                                        {getDisplayName(project)}
                                    </Link>
                                ) : (
                                    getDisplayName(project)
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1 rounded-md">
                                    {project.status === 'active' ? 'Ativo' : 'Onboarding'}
                                </span>
                                {(() => {
                                    if (project.status === 'completed') return null;
                                    const lastLogin = (project as any).last_login_at ? new Date((project as any).last_login_at) : null;
                                    const now = new Date();
                                    let diffDays = 999;
                                    if (lastLogin) {
                                        const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
                                        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    }

                                    let healthColor = 'text-green-600 bg-green-50 border border-green-200';
                                    let healthIcon = '🟢';
                                    let healthLabel = lastLogin ? `Ativo há ${diffDays}d` : 'Novo';

                                    if (diffDays > 14) {
                                        healthColor = 'text-red-700 bg-red-50 border border-red-200';
                                        healthIcon = '🔴';
                                        healthLabel = 'Risco (>14d)';
                                    } else if (diffDays > 7) {
                                        healthColor = 'text-amber-700 bg-amber-50 border border-amber-200';
                                        healthIcon = '🟡';
                                        healthLabel = 'Ausente (>7d)';
                                    }

                                    return (
                                        <span title={lastLogin ? lastLogin.toLocaleString('pt-BR') : 'Ainda não acessou'} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md inline-flex items-center gap-1.5 ${healthColor}`}>
                                            <span>{healthIcon}</span>
                                            <span>{healthLabel}</span>
                                        </span>
                                    );
                                })()}
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
                    {/* Botões de Acesso ao Gerador e Apresentação Estratégica */}
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => navigate(`/admin/planejamento/${project.id}`)}
                            className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Zap size={12} className="mr-2" /> Módulo Gerador (REI Hub)
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(`/admin/strategic-plan/${project.id}`, '_blank')}
                            className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-sm"
                        >
                            <Presentation size={12} className="mr-2" /> Apresentação (The Vault)
                        </Button>

                        <div className="w-px h-6 bg-zinc-200 mx-1"></div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-[10px] font-bold uppercase tracking-widest text-[#00E577] border-[#00E577]/30 bg-[#00E577]/5 hover:bg-[#00E577]/10"
                                >
                                    <QrCode size={12} className="mr-2" /> QR Code
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-center font-black text-xl tracking-tight">QR Code de Acesso</DialogTitle>
                                    <DialogDescription className="text-center">
                                        Peça para o cliente apontar a câmera na reunião para acessar o Hub.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center justify-center py-8">
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-zinc-100">
                                        <QRCodeSVG 
                                            value={`${window.location.origin}/hub/${project.id}`} 
                                            size={200}
                                            level={"Q"}
                                            includeMargin={true}
                                        />
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/hub/${project.id}`);
                                toast({ title: 'Link copiado!', description: 'Link mágico do cliente copiado para a área de transferência.' });
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                        >
                            <LinkIcon size={12} className="mr-2" /> Copiar Link Mágico
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-white border border-zinc-200 p-1 h-auto rounded-xl flex-wrap gap-2">
                            <TabsTrigger value="jornada" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center shrink-0">
                                <Map size={14} /> Jornada
                            </TabsTrigger>
                            <TabsTrigger value="biblioteca" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center shrink-0">
                                <BookOpen size={14} /> Wiki & Documentos
                            </TabsTrigger>
                            <TabsTrigger value="playbook" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg transition-all flex gap-2 items-center shrink-0">
                                <Zap size={14} /> Fábrica de Playbook AI
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="jornada" className="m-0">
                            <OrchestratedOnboarding projectId={project.id} embedded={true} />
                        </TabsContent>
                        <TabsContent value="biblioteca" className="m-0">
                            <ProjectWiki projectId={project.id} projectName={project.client_name} />
                        </TabsContent>
                        <TabsContent value="playbook" className="m-0">
                            <AIPlaybookGenerator projectId={project.id} projectName={project.client_name} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectDetails;
