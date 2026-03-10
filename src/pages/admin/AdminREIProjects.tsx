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

const AdminREIProjects = () => {
    const { projects, loading, error, refetch } = useReiProjects();
    const { toast } = useToast();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const navigate = useNavigate();

    const filteredProjects = projects?.filter(p =>
        p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.client_company || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                        <div className="flex items-center gap-4 bg-white border border-zinc-200 p-1 flex-1 w-full md:w-auto">
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
                                    className="bg-red-600 hover:bg-red-700 rounded-sm h-10 px-4 text-xs font-bold uppercase tracking-widest mr-2 flex-1 md:flex-none"
                                >
                                    {deleting === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Excluir ({selectedIds.length})
                                </Button>
                            )}
                            <Button onClick={() => navigate('/admin/rei/novo')} className="bg-black text-white hover:bg-zinc-800 rounded-sm h-10 px-6 text-xs font-bold uppercase tracking-widest flex-1 md:flex-none whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" /> Novo Projeto
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-zinc-200">
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
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Cliente</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Empresa</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Tipo</TableHead>
                                    <TableHead className="text-black font-bold uppercase tracking-widest text-[10px] py-4">Status</TableHead>
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
                                                <div className="font-bold text-black text-sm uppercase tracking-tight">{project.client_name}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-zinc-500 text-xs uppercase tracking-widest font-medium">{project.client_company || '-'}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                                                    {project.type === 'crm_ops' || project.type === 'CRM_CS_OPS' ? 'CRM & RevOps' :
                                                        project.type === 'funnels_impl' ? 'Site & Funil' :
                                                            project.type === 'founder' ? 'Founder' :
                                                                project.type === 'content_seo' ? 'SEO' : '360º'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${project.status === 'completed' ? 'text-revgreen' :
                                                    project.status === 'pending' ? 'text-red-500' :
                                                        project.status === 'active' || project.status === 'in_progress' ? 'text-blue-500' :
                                                            'text-zinc-400'
                                                    }`}>
                                                    {project.status === 'completed' ? 'CONCLUÍDO' :
                                                        project.status === 'pending' ? 'PENDENTE' :
                                                            project.status === 'active' || project.status === 'in_progress' ? 'EM ANDAMENTO' : 'EM PAUSA'}
                                                </span>
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
                                                        className="h-8 w-8 text-zinc-400 hover:text-revgreen hover:bg-zinc-50 rounded-sm transition-all"
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
                                                        className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 rounded-sm transition-all"
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
