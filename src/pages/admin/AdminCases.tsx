import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Edit, Trash2, Briefcase, Search, Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { migrateCases } from '@/services/migrationService';

const AdminCases = () => {
    const [cases, setCases] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => { fetchCases(); }, []);

    const fetchCases = async () => {
        const { data, error } = await supabase
            .from('cases')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) toast.error('Erro ao carregar cases');
        else setCases(data || []);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir este case?')) return;
        const { error } = await supabase.from('cases').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            toast.success('Case excluído');
            setCases(cases.filter(c => c.id !== id));
            if (selected?.id === id) setSelected(null);
        }
    };

    const handleMigrate = async () => {
        if (!confirm('Importar cases do arquivo estático?')) return;
        toast.loading('Importando...', { id: 'migrate' });
        try {
            const { success, failed } = await migrateCases();
            toast.success(`${success} importados, ${failed} falhas`, { id: 'migrate' });
            fetchCases();
        } catch (error) {
            toast.error(String(error), { id: 'migrate' });
        }
    };

    const filtered = cases.filter(c =>
        c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.case_category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-zinc-50/50 p-8 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                            <Briefcase className="w-6 h-6" /> Cases de Sucesso
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gerencie seus cases de sucesso e métricas. ({filtered.length} total)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar cases..."
                                className="h-10 pl-9 pr-3 w-64 text-[13px] bg-white border border-zinc-200 rounded-sm outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all placeholder:text-zinc-400 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={handleMigrate}
                            className="h-10 px-4 flex items-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm"
                            title="Importar do arquivo estático"
                        >
                            <Download className="w-4 h-4" /> Importar
                        </button>
                        <button
                            onClick={() => navigate('/admin/cases/new')}
                            className="h-10 px-5 flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Novo Case
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/admin/cases/edit/${item.id}`)}
                            className="group relative bg-white rounded-sm border border-zinc-200 hover:border-zinc-300 shadow-sm transition-all duration-300 flex flex-col h-[320px] cursor-pointer overflow-hidden"
                        >
                            {/* Header / Logo Area */}
                            <div className="h-32 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center relative p-6">
                                {item.client_logo ? (
                                    <img
                                        src={item.client_logo}
                                        alt={item.client_name}
                                        className="max-h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                                    />
                                ) : (
                                    <Briefcase className="w-10 h-10 text-zinc-200" />
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`
                                        text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm backdrop-blur-md
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
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    {item.case_category || 'Geral'}
                                </span>
                                <h3 className="text-lg font-bold text-zinc-900 leading-snug mb-2 line-clamp-1 group-hover:text-black transition-colors">
                                    {item.client_name || 'Cliente'}
                                </h3>

                                {item.primary_metric && (
                                    <div className="mb-4 flex items-center gap-2 text-[#00CC6A] bg-[#00CC6A]/10 px-2 py-1.5 rounded-sm self-start">
                                        <TrendingUp className="w-3 h-3" />
                                        <span className="text-[11px] font-bold">{item.primary_metric}</span>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
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
                                        navigate(`/admin/cases/edit/${item.id}`);
                                    }}
                                    className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-100 transition-colors shadow-sm"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white border border-dashed border-zinc-200 rounded-sm">
                            <Briefcase className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900">Nenhum case encontrado</h3>
                            <button
                                onClick={() => navigate('/admin/cases/new')}
                                className="mt-4 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors"
                            >
                                Criar Case
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCases;
