import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Search, FileText } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Database } from "@/integrations/supabase/types";

type CaseStudy = Database['public']['Tables']['cases']['Row'];

const AdminCases = () => {
    const [cases, setCases] = useState<CaseStudy[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        const { data, error } = await supabase
            .from('cases')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (!error) setCases(data || []);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este case?')) return;

        console.log('🗑️ Excluindo case:', id);

        const { error, data } = await supabase.from('cases').update({ published: false }).eq('id', id).select();

        console.log('Resultado:', { error, deletedCount: data?.length });

        if (error) {
            console.error('❌ Erro:', error.message);
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        } else if (data && data.length > 0) {
            console.log('✅ Excluído com sucesso');
            setCases(cases.filter(c => c.id !== id));
            toast({ title: 'Case excluído' });
        } else {
            console.warn('⚠️ Nenhum case deletado - RLS?');
            toast({ title: 'Aviso', description: 'Verifique permissões RLS', variant: 'destructive' });
        }
    }

    const filteredCases = cases.filter(item =>
        item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.case_category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageLayout>
            <AdminPageLayout
                title="Gerenciar Cases de Sucesso"
                description="Crie e gerencie cases de clientes"
                actions={
                    <Button onClick={() => navigate('/admin/cases/new')} className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest h-9 rounded-none px-6 shadow-none transition-all">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Novo Case
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2 max-w-sm mb-6 bg-white/50 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10 backdrop-blur-sm">
                        <Search className="w-4 h-4 text-gray-400 ml-2" />
                        <Input
                            placeholder="Buscar cases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-400 h-9"
                        />
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden backdrop-blur-sm transition-colors duration-300">
                        <Table>
                            <TableHeader className="bg-white border-b-2 border-black">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[400px] text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Case Study</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Categoria</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Status</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Métrica</TableHead>
                                    <TableHead className="text-right text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCases.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/cases/edit/${item.id}`)}>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-none bg-zinc-50 border border-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                                                    <FileText className="h-4 w-4 stroke-[2]" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white group-hover:text-black transition-colors line-clamp-1">{item.client_name}</div>
                                                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest line-clamp-1">{item.slug}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                            {item.case_category}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[9px] rounded-none px-2 py-0.5 border ${item.published
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-black border-zinc-200'
                                                }`}>
                                                {item.published ? 'Publicado' : 'Rascunho'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-300">
                                            {item.primary_metric}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-black hover:text-white hover:bg-black transition-colors rounded-none"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/cases/edit/${item.id}`); }}
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4 stroke-[2.5]" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-black hover:text-white hover:bg-red-600 transition-colors rounded-none"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                    title="Excluir"
                                                >
                                                    <Trash className="h-4 w-4 stroke-[2.5]" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminCases;
