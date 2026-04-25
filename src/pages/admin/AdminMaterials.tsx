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
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-8 md:px-12 py-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 border-b border-zinc-100 pb-6">
                        <div>
                            <p className="text-label text-zinc-400 mb-2 border-b border-zinc-100 pb-1 w-max">DIR / MATERIALS</p>
                            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4 uppercase mt-4">
                                <FileText className="w-10 h-10 text-zinc-300" /> MATERIAIS B2B
                            </h1>
                            <p className="text-label text-zinc-500 mt-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-zinc-900 shrink-0" />
                                ARSENAL DE VENDAS E MÍDIA B2B. <span className="text-metric text-zinc-900 tabular-nums">[{filtered.length}]</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="BUSCAR MATERIAIS..."
                                    className="h-10 pl-9 pr-3 w-64 text-label bg-white border border-zinc-200 rounded-none outline-none focus:border-black focus:ring-0 transition-none shadow-none"
                                />
                            </div>
                            <button
                                onClick={handleMigrate}
                                className="h-10 px-4 flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-label rounded-none transition-colors shadow-none"
                                title="Importar do arquivo estático"
                            >
                                <Download className="w-3.5 h-3.5" /> MIGRAR
                            </button>
                            <button
                                onClick={() => navigate('/admin/materials/new')}
                                className="h-10 px-5 flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-label rounded-none transition-colors shadow-none"
                            >
                                <Plus className="w-3.5 h-3.5" /> NOVO MODELO
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
                                <FileText className="w-10 h-10 text-zinc-200" />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`
                                        text-label border px-1.5 py-0.5 rounded-none
                                        ${item.published
                                            ? 'bg-[#00CC6A] text-black border-[#00CC6A]'
                                            : 'bg-white text-zinc-500 border-zinc-200'
                                        }
                                    `}>
                                        {item.published ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col bg-white">
                                <span className="text-label text-zinc-400 mb-2 block">
                                    {item.material_type || 'GERAL'}
                                </span>
                                <h3 className="text-lg font-black text-black leading-snug mb-2 line-clamp-2 truncate uppercase">
                                    {item.title || item.material_name || 'TITLE_MISSING'}
                                </h3>
                                <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <span className="text-label text-zinc-400">
                                        CREATED: {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                    {(item.link_material || item.material_url) && (
                                        <a
                                            href={item.link_material || item.material_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-zinc-400 hover:text-black transition-colors"
                                            title="Abrir Link"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-zinc-900 border-t border-zinc-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-2 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-none transition-colors border border-transparent hover:border-red-900"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/materials/edit/${item.id}`);
                                    }}
                                    className="px-4 py-2 bg-white text-black text-label rounded-none hover:bg-zinc-200 transition-colors"
                                >
                                    EDIT
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white border border-dashed border-zinc-200 rounded-none">
                            <FileText className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-zinc-900 uppercase">Nenhum MATERIAL ENCONTRADO</h3>
                            <button
                                onClick={() => navigate('/admin/materials/new')}
                                className="mt-4 px-6 py-2 bg-black text-white text-label rounded-none hover:bg-zinc-800 transition-colors"
                            >
                                NOVO MATERIAL
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMaterials;
