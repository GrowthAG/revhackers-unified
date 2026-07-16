import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, FileText, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useToast } from '@/components/ui/use-toast';
import { useSoftDelete } from '@/hooks/useSoftDelete';
import { Database } from "@/integrations/supabase/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Material = Database['public']['Tables']['materials']['Row'];

const AdminMaterials = () => {
    const [materials, setMaterials] = useState<any[]>([]); // Use any because types.ts is outdated
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setMaterials(data || []);
    };

    const softDelete = useSoftDelete('materials');

    const handleDelete = async (id: string) => {
        const success = await softDelete(id);
        if (success) {
            setMaterials(materials.filter(m => m.id !== id));
        }
    };

    const filteredMaterials = materials.filter(item =>
        (item.material_name || item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.material_type || item.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageLayout>
            <AdminPageLayout
                title="Gerenciar Materiais"
                description="Crie e gerencie materiais ricos para download"
                actions={
                    <Button onClick={() => navigate('/admin/materials/new')} className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest h-9 rounded-none px-6 shadow-none transition-all">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Novo Material
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-2 max-w-sm mb-6 bg-white/50 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10 backdrop-blur-sm">
                        <Search className="w-4 h-4 text-gray-400 ml-2" />
                        <Input
                            placeholder="Buscar materiais..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-400 h-9"
                        />
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden backdrop-blur-sm animate-in fade-in duration-500 transition-colors duration-300">
                        <Table>
                            <TableHeader className="bg-white border-b-2 border-black">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[400px] text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Título</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Tipo</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Status</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Data</TableHead>
                                    <TableHead className="text-right text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMaterials.map((material) => (
                                    <TableRow key={material.id} className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/materials/edit/${material.id}`)}>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-none bg-zinc-50 border border-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                                                    <FileText className="h-4 w-4 stroke-[2]" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white group-hover:text-black transition-colors line-clamp-1">{material.title || material.material_name}</div>
                                                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest line-clamp-1">{material.material_type}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                            {material.material_type || material.type}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[9px] rounded-none px-2 py-0.5 border ${material.published
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-black border-zinc-200'
                                                }`}>
                                                {material.published ? 'Publicado' : 'Rascunho'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(material.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-black hover:text-white hover:bg-black transition-colors rounded-none"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/materials/edit/${material.id}`); }}
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4 stroke-[2.5]" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-black hover:text-white hover:bg-red-600 transition-colors rounded-none"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(material.id); }}
                                                    title="Excluir"
                                                >
                                                    <Trash className="h-4 w-4 stroke-[2.5]" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredMaterials.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                            Nenhum material encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminMaterials;
