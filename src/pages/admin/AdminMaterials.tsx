import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Edit, Trash2, FileText, Search, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { migrateMaterials } from '@/services/migrationService';

const AdminMaterials = () => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => { fetchMaterials(); }, []);

    const fetchMaterials = async () => {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) toast.error('Erro ao carregar materiais');
        else setMaterials(data || []);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir este material?')) return;
        const { error } = await supabase.from('materials').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            toast.success('Material excluído');
            setMaterials(materials.filter(m => m.id !== id));
            if (selected?.id === id) setSelected(null);
        }
    };

    const handleMigrate = async () => {
        if (!confirm('Importar materiais do arquivo estático?')) return;
        toast.loading('Importando...', { id: 'migrate' });
        try {
            const { success, failed } = await migrateMaterials();
            toast.success(`${success} importados, ${failed} falhas`, { id: 'migrate' });
            fetchMaterials();
        } catch (error) {
            toast.error(String(error), { id: 'migrate' });
        }
    };

    const filtered = materials.filter(m =>
        (m.title || m.material_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.material_type || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-zinc-50/50 p-8 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6" /> Materiais
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gerencie seus materiais ricos e ferramentas. ({filtered.length} total)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar materiais..."
                                className="h-10 pl-9 pr-3 w-64 text-mini bg-white border border-zinc-200 rounded-sm outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all placeholder:text-zinc-400 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={handleMigrate}
                            className="h-10 px-4 flex items-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-tiny font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm"
                            title="Importar do arquivo estático"
                        >
                            <Download className="w-4 h-4" /> Importar
                        </button>
                        <button
                            onClick={() => navigate('/admin/materials/new')}
                            className="h-10 px-5 flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-tiny font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Novo Material
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/admin/materials/edit/${item.id}`)}
                            className="group relative bg-white rounded-sm border border-zinc-200 hover:border-zinc-300 shadow-sm transition-all duration-300 flex flex-col h-[320px] cursor-pointer overflow-hidden"
                        >
                            {/* Image/Cover Placeholder */}
                            <div className="h-40 bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                                {item.cover_image ? (
                                    <img
                                        src={item.cover_image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <FileText className="w-10 h-10 text-zinc-200" />
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`
                                        text-2xs font-black uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm backdrop-blur-md
                                        ${item.published
                                            ? 'bg-[#00CC6A]/90 text-white'
                                            : 'bg-zinc-200 text-zinc-700'
                                        }
                                    `}>
                                        {item.published ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <span className="text-2xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    {item.material_type || 'Geral'}
                                </span>
                                <h3 className="text-base font-bold text-zinc-900 leading-snug mb-2 line-clamp-2 group-hover:text-black transition-colors">
                                    {item.title || item.material_name || 'Sem Título'}
                                </h3>
                                <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <span className="text-xxs text-zinc-400 font-mono">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                    {(item.link_material || item.material_url) && (
                                        <a
                                            href={item.link_material || item.material_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-zinc-400 hover:text-zinc-900 transition-colors"
                                            title="Abrir Link"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-black/70 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-sm backdrop-blur-md transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/materials/edit/${item.id}`);
                                    }}
                                    className="px-4 py-2 bg-white text-black text-xxs font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-100 transition-colors shadow-sm"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white border border-dashed border-zinc-200 rounded-sm">
                            <FileText className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900">Nenhum material encontrado</h3>
                            <button
                                onClick={() => navigate('/admin/materials/new')}
                                className="mt-4 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors"
                            >
                                Criar Material
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMaterials;
