import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReiProjects } from '@/hooks/useReiProjects';
import { deleteReiProject } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";

// Utilitário para limpar Razões Sociais e manter apenas o Nome Fantasia
const cleanCompanyName = (name: string) => {
    if (!name) return 'Cliente';
    return name.replace(/\b(LTDA\.?|S\.?A\.?|S\/A|ME|EPP|EI|EIRELI|INC\.?|LLC\.?|LTD\.?)\b/gi, '').trim();
};

const AdminREIProjects = () => {
    const { projects, loading, error, refetch } = useReiProjects();
    const { toast } = useToast();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const navigate = useNavigate();

    const filteredProjects = projects?.filter(p =>
        p.status !== 'lead' &&
        p.status !== 'diagnostic' &&
        (p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.client_company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p as any).trade_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredProjects.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        if (!window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} projetos? Esta ação é irreversível.`)) {
            return;
        }

        setDeleting('bulk');
        try {
            await Promise.all(selectedIds.map(id => deleteReiProject(id)));
            toast({
                title: 'Projetos excluídos',
                description: `${selectedIds.length} projetos foram removidos com sucesso.`,
            });
            setSelectedIds([]);
            refetch();
        } catch (error: any) {
            toast({
                title: 'Erro na exclusão',
                description: error?.message || 'Alguns projetos não puderam ser excluídos devido a dependências ou permissões.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(null);
        }
    };

    const handleDelete = async (id: string, clientName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o projeto de ${clientName}?`)) {
            return;
        }

        setDeleting(id);
        try {
            await deleteReiProject(id);
            toast({
                title: 'Projeto excluído com sucesso',
                description: `O projeto de ${clientName} foi removido.`,
            });
            refetch();
        } catch (error: any) {
            toast({
                title: 'Erro ao excluir projeto',
                description: error?.message || 'Ocorreu um erro ao tentar excluir o projeto. Verifique dependências.',
                variant: 'destructive',
            });
        } finally {
            setDeleting(null);
        }
    };



    return (
        <AdminLayout>
            <AdminPageLayout
                title="Onboarding Orquestrado"
                description="Controle a jornada de 90 dias, diagnósticos REI e cronogramas estratégicos."
                backTo="/admin"
                backLabel="Voltar ao Hub"
            >
                <div className="space-y-6">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 bg-white border border-zinc-200 p-1 rounded-xl flex-1 w-full md:w-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Buscar projeto por cliente ou empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10 border-0 focus-visible:ring-0 rounded-sm text-sm placeholder:text-zinc-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {selectedIds.length > 0 && (
                                <Button
                                    onClick={handleBulkDelete}
                                    disabled={deleting === 'bulk'}
                                    variant="destructive"
                                    className="bg-zinc-900 hover:bg-zinc-800 rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-widest mr-2 flex-1 md:flex-none"
                                >
                                    {deleting === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Excluir ({selectedIds.length})
                                </Button>
                            )}
                            <Button onClick={() => navigate('/admin/rei/novo')} className="bg-black text-white hover:bg-zinc-800 rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-widest flex-1 md:flex-none whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" /> Novo Projeto
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-zinc-200 hover:bg-transparent transition-none">
                                    <TableHead className="w-[50px] pl-6 py-6">
                                        <Checkbox
                                            className="rounded-sm"
                                            checked={filteredProjects.length > 0 && selectedIds.length === filteredProjects.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Empresa (Fantasia)</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Contato</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Tipo</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Status & Saúde</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Período</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4 text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProjects && filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <TableRow
                                            key={project.id}
                                            className={`hover:bg-zinc-50 transition-all border-zinc-100 cursor-pointer h-24 ${selectedIds.includes(project.id) ? 'bg-zinc-50' : ''}`}
                                            onClick={() => navigate(`/admin/projects/${project.id}`)}
                                        >
                                            <TableCell className="pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(project.id)}
                                                    onCheckedChange={(checked) => handleSelectOne(project.id, !!checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-bold text-black text-sm uppercase tracking-tight">{(project as any).trade_name || (project.client_company ? cleanCompanyName(project.client_company) : project.client_name)}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-zinc-500 text-xs uppercase tracking-widest font-medium">{project.client_name || '-'}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                                                    {project.type === 'founder' ? 'Founder' :
                                                        project.type === 'crm_ops' || project.type === 'CRM_CS_OPS' ? 'CRM' :
                                                            project.type === 'funnels_impl' ? 'Site' : '360º'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            project.status === 'completed' ? 'bg-[#00CC6A]' :
                                                            project.status === 'active' || project.status === 'in_progress' ? 'bg-zinc-900' :
                                                            project.status === 'pending' ? 'bg-zinc-400' :
                                                            'bg-zinc-300'
                                                        }`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                            project.status === 'completed' ? 'text-[#00CC6A]' : 'text-zinc-500'
                                                        }`}>
                                                            {project.status === 'completed' ? 'Concluído' :
                                                                project.status === 'pending' ? 'Pendente' :
                                                                    project.status === 'active' || project.status === 'in_progress' ? 'Em Andamento' : 'Em Pausa'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* HEALTH SCORE COMPONENT */}
                                                    {(() => {
                                                        if (project.status === 'completed') return null;
                                                        
                                                        const lastLogin = (project as any).last_login_at ? new Date((project as any).last_login_at) : null;
                                                        const now = new Date();
                                                        let diffDays = 999;
                                                        if (lastLogin) {
                                                            const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
                                                            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                        }

                                                        let healthColor = 'text-green-600 bg-green-50 border-green-200';
                                                        let healthIcon = '🟢';
                                                        let healthLabel = lastLogin ? `Ativo há ${diffDays}d` : 'Novo';

                                                        if (diffDays > 14) {
                                                            healthColor = 'text-red-700 bg-red-50 border-red-200';
                                                            healthIcon = '🔴';
                                                            healthLabel = 'Risco (>14d)';
                                                        } else if (diffDays > 7) {
                                                            healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
                                                            healthIcon = '🟡';
                                                            healthLabel = 'Ausente (>7d)';
                                                        }

                                                        return (
                                                            <div title={lastLogin ? lastLogin.toLocaleString('pt-BR') : 'Ainda não acessou'} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider w-fit ${healthColor}`}>
                                                                <span>{healthIcon}</span>
                                                                <span>{healthLabel}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                                    Q{project.quarter} / {project.year}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                                                        className="h-8 w-8 text-zinc-400 hover:text-[#00CC6A] hover:bg-zinc-50 rounded-sm transition-all"
                                                        title="Gerenciar Jornada"
                                                    >
                                                        <Zap className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/admin/rei/${project.id}`)}
                                                        className="h-8 w-8 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-sm transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(project.id, project.client_name)}
                                                        className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-sm transition-all"
                                                        disabled={!!deleting}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-zinc-400 text-xs uppercase tracking-widest">
                                            Nenhum projeto encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default AdminREIProjects;
