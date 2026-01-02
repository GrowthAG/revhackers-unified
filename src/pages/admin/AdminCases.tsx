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
            <div className="h-[calc(100vh-60px)] flex bg-white font-sans">
                {/* Sidebar List */}
                <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/50">
                    <div className="p-4 space-y-4">
                        <button
                            onClick={() => navigate('/admin/cases/new')}
                            className="w-full h-10 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Novo Case
                        </button>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar cases..."
                                className="w-full h-10 pl-9 pr-3 text-[13px] bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-100 transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-100/50 mx-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Cases ({filtered.length})
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
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border
                                        ${selected?.id === item.id ? 'bg-black text-white border-black' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}
                                    `}>
                                        {item.case_category || 'Geral'}
                                    </span>
                                    {item.published && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Publicado" />
                                    )}
                                </div>

                                <h3 className={`text-[13px] font-semibold leading-snug mb-1 ${selected?.id === item.id ? 'text-black' : 'text-zinc-700'}`}>
                                    {item.client_name || 'Cliente'}
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
                                <Briefcase className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                <p className="text-[11px] text-zinc-400">Nenhum case encontrado</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Preview */}
                <div className="flex-1 relative bg-white">
                    {selected ? (
                        <div className="absolute inset-0 overflow-y-auto">
                            <div className="max-w-4xl mx-auto px-12 py-16">
                                <div className="flex items-start justify-between mb-8 pb-8 border-b border-zinc-100">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 px-2 py-1 rounded-sm">
                                                Case de Sucesso
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selected.published ? 'text-green-600' : 'text-amber-500'}`}>
                                                {selected.published ? '● Publicado' : '○ Rascunho'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {selected.client_logo && (
                                                <img src={selected.client_logo} alt="Logo" className="h-12 w-auto object-contain grayscale opacity-80" />
                                            )}
                                            <h1 className="text-4xl font-black text-black tracking-tight leading-tight">
                                                {selected.client_name}
                                            </h1>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/cases/edit/${selected.id}`)}
                                        className="shrink-0 flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl group"
                                    >
                                        <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">Editar Case</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="md:col-span-2 space-y-12">

                                        {/* Metrics Highlight */}
                                        {selected.primary_metric && (
                                            <div className="p-8 bg-zinc-900 text-white rounded-2xl shadow-xl flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Resultado Chave</p>
                                                    <p className="text-3xl font-black tracking-tight">{selected.primary_metric}</p>
                                                </div>
                                                <TrendingUp className="w-8 h-8 text-green-400" />
                                            </div>
                                        )}

                                        <div className="space-y-8">
                                            {/* Sections */}
                                            {selected.challenge && (
                                                <div className="prose prose-zinc prose-sm">
                                                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-red-400" /> Desafio
                                                    </h3>
                                                    <p className="text-base text-zinc-700 leading-relaxed">{selected.challenge}</p>
                                                </div>
                                            )}

                                            {selected.solution && (
                                                <div className="prose prose-zinc prose-sm pl-4 border-l-2 border-zinc-100">
                                                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-400" /> Solução
                                                    </h3>
                                                    <p className="text-base text-zinc-700 leading-relaxed">{selected.solution}</p>
                                                </div>
                                            )}

                                            {selected.results && (
                                                <div className="prose prose-zinc prose-sm pl-4 border-l-2 border-zinc-100">
                                                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-400" /> Resultados
                                                    </h3>
                                                    <p className="text-base text-zinc-700 leading-relaxed">{selected.results}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Info Sidebar */}
                                        <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100 space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Categoria</h4>
                                                <span className="text-xs text-zinc-600 font-medium bg-zinc-200 px-2 py-1 rounded-md">{selected.case_category || 'B2B'}</span>
                                            </div>

                                            <div className="h-px bg-zinc-200" />

                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Criado em</h4>
                                                <span className="text-xs text-zinc-600 font-mono">{new Date(selected.created_at).toLocaleDateString()}</span>
                                            </div>

                                            {selected.preview_description && (
                                                <>
                                                    <div className="h-px bg-zinc-200" />
                                                    <div>
                                                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Resumo</h4>
                                                        <p className="text-xs text-zinc-500 leading-relaxed">{selected.preview_description}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-8 bg-zinc-50/30">
                            <div className="text-center max-w-xs">
                                <div className="w-16 h-16 bg-white border border-zinc-100 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                    <Briefcase className="w-6 h-6 text-zinc-300" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">Gerenciador de Cases</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Selecione um case na lista lateral para visualizar detalhes ou editar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCases;
