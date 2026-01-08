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

    useEffect(() => {
        if (selected) {
            console.log("DEBUG SELECTED MATERIAL:", {
                title: selected.title || selected.material_name,
                material_url: selected.material_url,
                link_material: selected.link_material,
                type: selected.material_type
            });
        }
    }, [selected]);

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
            <div className="h-[calc(100vh-60px)] flex bg-white font-sans">
                {/* Sidebar List */}
                <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/50">
                    <div className="p-4 space-y-4">
                        <button
                            onClick={() => navigate('/admin/materials/new')}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            <Plus className="w-4 h-4" /> NOVO_MATERIAL
                        </button>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="PROCURAR..."
                                className="w-full h-12 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest bg-white border border-zinc-100 outline-none focus:border-black transition-all placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-100/50 mx-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Lista ({filtered.length})
                        </span>
                        <button onClick={handleMigrate} className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Importar">
                            <Download className="w-3 h-3" /> Importar
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {filtered.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelected(item)}
                                className={`
                                    relative p-4 rounded-xl cursor-pointer border transition-all duration-200 group
                                    ${selected?.id === item.id
                                        ? 'bg-white border-zinc-300 shadow-md ring-1 ring-zinc-50'
                                        : 'bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`
                                        text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border
                                        ${selected?.id === item.id ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-400 border-zinc-100'}
                                    `}>
                                        {item.material_type || 'Geral'}
                                    </span>
                                    {item.published && (
                                        <div className="w-1.5 h-1.5 bg-revgreen" title="Publicado" />
                                    )}
                                </div>

                                <h3 className={`text-[13px] font-semibold leading-snug mb-1 ${selected?.id === item.id ? 'text-black' : 'text-zinc-700'}`}>
                                    {item.title || item.material_name || 'Sem título'}
                                </h3>

                                <p className="text-[11px] text-zinc-400 line-clamp-1">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>

                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                <p className="text-[11px] text-zinc-400">Nenhum material encontrado</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Detail View */}
                <div className="flex-1 relative bg-white">
                    {selected ? (
                        <div className="absolute inset-0 overflow-y-auto">
                            <div className="max-w-4xl mx-auto px-12 py-16">
                                <div className="flex items-start justify-between mb-8 pb-8 border-b border-zinc-100">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 px-2 py-1 rounded-sm">
                                                {selected.material_type}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selected.published ? 'text-green-600' : 'text-amber-500'}`}>
                                                {selected.published ? '● Publicado' : '○ Rascunho'}
                                            </span>
                                        </div>
                                        <h1 className="text-6xl font-black text-black tracking-ultratight uppercase leading-none">
                                            {selected.title || selected.material_name}
                                        </h1>
                                        {selected.slug && (
                                            <code className="text-xs text-zinc-400 bg-zinc-50 px-2 py-1 rounded font-mono">/{selected.slug}</code>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/materials/edit/${selected.id}`)}
                                        className="shrink-0 flex items-center gap-2 px-8 py-4 bg-black hover:bg-zinc-800 text-white transition-all group"
                                    >
                                        <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Editar Registro</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="md:col-span-2 space-y-8">
                                        {/* Cover */}
                                        {selected.cover_image && (
                                            <div className="rounded-xl overflow-hidden shadow-2xl border border-zinc-100 bg-zinc-50">
                                                <img src={selected.cover_image} alt={selected.title} className="w-full h-auto object-cover" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="prose prose-zinc prose-sm max-w-none">
                                            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Descrição</h3>
                                            <p className="text-lg text-zinc-600 font-serif leading-relaxed whitespace-pre-line">
                                                {selected.description || <span className="italic text-zinc-300">Sem descrição...</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Metadata Sidebar */}
                                        <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100 space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Link de Acesso</h4>
                                                {selected.link_material || selected.material_url ? (
                                                    <a
                                                        href={selected.link_material || selected.material_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 break-all"
                                                    >
                                                        <ExternalLink className="w-3 h-3 shrink-0" /> Abrir Link
                                                    </a>
                                                ) : <span className="text-xs text-zinc-400 italic">Não configurado</span>}
                                            </div>

                                            <div className="h-px bg-zinc-200" />

                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Criado em</h4>
                                                <span className="text-xs text-zinc-600 font-mono">{new Date(selected.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-8 bg-zinc-50/30">
                            <div className="text-center max-w-xs">
                                <div className="w-16 h-16 bg-white border border-zinc-100 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                    <FileText className="w-6 h-6 text-zinc-300" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">Gerenciador de Materiais</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Selecione um material na lista lateral para visualizar detalhes ou editar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMaterials;
