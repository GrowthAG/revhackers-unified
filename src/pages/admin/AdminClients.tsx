import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    ExternalLink,
    Globe,
    Mail,
    Building2,
    Loader2,
    ChevronRight,
    Zap
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useToast } from '@/hooks/use-toast';
import { getAllClients, deleteClient, type Client } from '@/api/clients';

const AdminClients = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await getAllClients();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast({ title: 'Erro ao carregar clientes', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover o cliente ${name}?`)) return;

        try {
            await deleteClient(id);
            toast({ title: 'Cliente removido com sucesso' });
            loadClients();
        } catch (error) {
            toast({ title: 'Erro ao remover cliente', variant: 'destructive' });
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <AdminPageLayout
                title="Gestão de Clientes"
                description="Controle o portfólio de contas e acompanhe a evolução de cada jornada GTM."
                backTo="/admin"
                backLabel="Voltar ao Hub"
                actions={
                    <Button
                        onClick={() => navigate('/admin/clients/novo')}
                        className="bg-black text-white hover:bg-zinc-800 rounded-none h-10 px-6 text-label shadow-none gap-2 flex items-center"
                    >
                        <Plus size={14} /> NOVO CLIENTE
                    </Button>
                }
            >
                <div className="space-y-10 py-10">
                    {/* Search & Stats */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-zinc-100">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="BUSCAR CLIENTE OU EMPRESA..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-10 bg-white border-zinc-200 rounded-none text-label focus-visible:ring-0 focus-visible:border-black transition-all shadow-none"
                            />
                        </div>
                        <div className="flex gap-8">
                            <div className="text-right">
                                <p className="text-label text-zinc-400 mb-1">TOTAL</p>
                                <p className="text-2xl font-black text-zinc-900 tabular-nums">{clients.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-label text-zinc-400 mb-1">ATIVOS</p>
                                <p className="text-2xl font-black text-[#00CC6A] tabular-nums">{clients.filter(c => c.status === 'active').length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table / List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-200" />
                        </div>
                    ) : (
                        <div className="bg-white border border-zinc-100">
                            {filteredClients.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-200 bg-zinc-50">
                                                <th className="p-4 text-label text-zinc-500">CLIENTE / EMPRESA</th>
                                                <th className="p-4 text-label text-zinc-500">CONTATO DA CONTA</th>
                                                <th className="p-4 text-label text-zinc-500">SYSTEM STATUS</th>
                                                <th className="p-4 text-right text-label text-zinc-500">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {filteredClients.map((client) => (
                                                <tr key={client.id} className="hover:bg-zinc-50 transition-colors group">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0">
                                                                <Building2 className="text-[#00CC6A] h-5 w-5" strokeWidth={2} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase tracking-tight text-zinc-900">{client.name}</p>
                                                                <p className="text-label text-zinc-500 mt-1">[{client.company || 'N/A'}]</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-zinc-500">
                                                                <Mail className="w-3.5 h-3.5" />
                                                                <span className="text-label lowercase">{client.email}</span>
                                                            </div>
                                                            {client.website && (
                                                                <div className="flex items-center gap-2 text-zinc-500">
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                    <span className="text-label lowercase">{client.website}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {client.status === 'active' ? (
                                                            <span className="text-label bg-[#00CC6A] text-black px-1.5 py-0.5">ACTIVE</span>
                                                        ) : client.status === 'onboarding' ? (
                                                            <span className="text-label bg-zinc-900 text-white px-1.5 py-0.5">#ONBOARDING</span>
                                                        ) : (
                                                            <span className="text-label border border-zinc-200 text-zinc-400 px-1.5 py-0.5">INACTIVE</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => navigate(`/admin/rei?search=${client.email}`)}
                                                                title="Ver Projetos REI"
                                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-black focus:ring-0 rounded-none transition-colors border border-transparent hover:border-zinc-200 bg-white"
                                                            >
                                                                <Zap size={14} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => navigate(`/admin/clients/edit/${client.id}`)}
                                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-black focus:ring-0 rounded-none transition-colors border border-transparent hover:border-zinc-200 bg-white"
                                                            >
                                                                <Edit2 size={14} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(client.id, client.name)}
                                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 focus:ring-0 rounded-none transition-colors border border-transparent hover:border-red-200 bg-white hover:bg-red-50"
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-32 text-center">
                                    <Users className="h-12 w-12 text-zinc-100 mx-auto mb-6" />
                                    <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">Nenhum cliente encontrado</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default AdminClients;
