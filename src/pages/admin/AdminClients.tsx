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
import { Badge } from '@/components/ui/badge';
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
                        className="bg-black text-white hover:bg-zinc-800 rounded-sm h-11 px-6 text-xs font-black uppercase tracking-widest shadow-sm gap-2"
                    >
                        <Plus size={16} /> Novo Cliente
                    </Button>
                }
            >
                <div className="space-y-10 py-10">
                    {/* Search & Stats */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-10 border-b border-zinc-100">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="BUSCAR CLIENTE OU EMPRESA..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 bg-zinc-50 border-transparent rounded-sm text-[10px] font-black uppercase tracking-widest focus-visible:ring-1 focus-visible:ring-black focus-visible:bg-white transition-all shadow-none"
                            />
                        </div>
                        <div className="flex gap-8">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-2xl font-black">{clients.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ativos</p>
                                <p className="text-2xl font-black text-[#00CC6A]">{clients.filter(c => c.status === 'active').length}</p>
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
                                            <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente / Empresa</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contato</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                                <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {filteredClients.map((client) => (
                                                <tr key={client.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0">
                                                                <Building2 className="text-[#00CC6A] h-6 w-6" strokeWidth={1.5} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase tracking-tight">{client.name}</p>
                                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{client.company || 'Empresa não informada'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors">
                                                                <Mail size={12} />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">{client.email}</span>
                                                            </div>
                                                            {client.website && (
                                                                <div className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors">
                                                                    <Globe size={12} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{client.website}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge className={`rounded-md text-[8px] font-black uppercase tracking-widest shadow-none border-0 ${client.status === 'active' ? 'bg-[#00CC6A]/10 text-[#00CC6A]' :
                                                            client.status === 'onboarding' ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-50 text-zinc-400'
                                                            }`}>
                                                            {client.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate(`/admin/rei?search=${client.email}`)}
                                                                title="Ver Projetos REI"
                                                                className="h-10 w-10 text-zinc-300 hover:text-[#00CC6A] hover:bg-black transition-all rounded-sm"
                                                            >
                                                                <Zap size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate(`/admin/clients/edit/${client.id}`)}
                                                                className="h-10 w-10 text-zinc-300 hover:text-black hover:bg-zinc-100 transition-all rounded-sm"
                                                            >
                                                                <Edit2 size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(client.id, client.name)}
                                                                className="h-10 w-10 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 transition-all rounded-sm"
                                                            >
                                                                <Trash2 size={16} />
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
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nenhum cliente encontrado</p>
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
