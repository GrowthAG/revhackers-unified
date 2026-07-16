import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReiProjects } from '@/hooks/useReiProjects';
import { deleteReiProject } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminREIProjects = () => {
    const [statusFilter, setStatusFilter] = useState<'active' | 'pending' | 'overdue' | null>(null);
    const { projects, loading, error, refetch } = useReiProjects({ filterByStatus: statusFilter });
    const { toast } = useToast();
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string, clientName: string) => {
        if (!window.confirm(`Tem certeza que deseja deletar o projeto de ${clientName}? Isso também deletará todo o histórico de diagnósticos.`)) {
            return;
        }

        setDeleting(id);
        try {
            await deleteReiProject(id);
            toast({
                title: 'Projeto deletado',
                description: `Projeto de ${clientName} foi removido com sucesso.`
            });
            refetch();
        } catch (error) {
            toast({
                title: 'Erro ao deletar',
                description: 'Não foi possível deletar o projeto. Tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setDeleting(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" />
                        Ativo
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Pendente
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" />
                        Atrasado
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-revgreen" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-center mb-2">Erro ao Carregar</h2>
                    <p className="text-zinc-400 text-center text-sm mb-4">
                        Não foi possível carregar os projetos REI.
                    </p>
                    <Button onClick={refetch} className="w-full btn-primary">
                        Tentar Novamente
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
                            Projetos REI
                        </h1>
                        <p className="text-zinc-500 text-sm uppercase tracking-wider">
                            Gerenciar diagnósticos trimestrais
                        </p>
                    </div>
                    <Button asChild className="btn-green-flat">
                        <Link to="/admin/rei/novo">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Projeto
                        </Link>
                    </Button>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={statusFilter === null ? 'default' : 'outline'}
                        onClick={() => setStatusFilter(null)}
                        className={statusFilter === null ? 'btn-green-flat' : 'btn-outline-flat'}
                    >
                        Todos ({projects.length})
                    </Button>
                    <Button
                        variant={statusFilter === 'active' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('active')}
                        className={statusFilter === 'active' ? 'btn-green-flat' : 'btn-outline-flat'}
                    >
                        Ativos
                    </Button>
                    <Button
                        variant={statusFilter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('pending')}
                        className={statusFilter === 'pending' ? 'btn-green-flat' : 'btn-outline-flat'}
                    >
                        Pendentes
                    </Button>
                    <Button
                        variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('overdue')}
                        className={statusFilter === 'overdue' ? 'btn-green-flat' : 'btn-outline-flat'}
                    >
                        Atrasados
                    </Button>
                </div>

                {/* Lista de Projetos */}
                {projects.length === 0 ? (
                    <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">Nenhum projeto encontrado</h3>
                        <p className="text-zinc-500 text-sm mb-6">
                            {statusFilter
                                ? `Não há projetos com status "${statusFilter}".`
                                : 'Comece criando um novo projeto REI.'}
                        </p>
                        <Button asChild className="btn-primary">
                            <Link to="/admin/rei/novo">
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeiro Projeto
                            </Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {projects.map((project) => (
                            <Card
                                key={project.id}
                                className="bg-zinc-900 border-zinc-800 p-6 hover:border-revgreen/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-bold">{project.client_name}</h3>
                                            {getStatusBadge(project.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-zinc-500 uppercase tracking-wider text-xs mb-1">
                                                    Cliente
                                                </p>
                                                <p className="text-white">{project.client_email}</p>
                                                {project.client_company && (
                                                    <p className="text-zinc-400 text-xs">{project.client_company}</p>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-zinc-500 uppercase tracking-wider text-xs mb-1">
                                                    Analista
                                                </p>
                                                <p className="text-white">{project.analyst_email}</p>
                                            </div>

                                            <div>
                                                <p className="text-zinc-500 uppercase tracking-wider text-xs mb-1">
                                                    Próximo REI
                                                </p>
                                                <p className="text-white">
                                                    {format(new Date(project.next_rei_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </p>
                                                <p className="text-zinc-400 text-xs">
                                                    {project.quarter} {project.year}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="text-zinc-400 hover:text-revgreen hover:bg-revgreen/10"
                                        >
                                            <Link to={`/admin/rei/${project.id}`}>
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(project.id, project.client_name)}
                                            disabled={deleting === project.id}
                                            className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                                        >
                                            {deleting === project.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminREIProjects;
