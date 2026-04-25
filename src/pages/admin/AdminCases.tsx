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
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-8 md:px-12 py-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 border-b border-zinc-100 pb-6">
                        <div>
                            <p className="text-label text-zinc-400 mb-2 border-b border-zinc-100 pb-1 w-max">DIR / CASES</p>
                            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight flex items-center gap-4 uppercase mt-4">
                                <Briefcase className="w-10 h-10 text-zinc-300" /> CASES DE SUCESSO
                            </h1>
                            <p className="text-label text-zinc-500 mt-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-zinc-900 shrink-0" />
                                GERENCIAMENTO DE PIPELINE DE CASES. <span className="text-metric text-zinc-900 tabular-nums">[{filtered.length}]</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="BUSCAR CASES..."
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
                                onClick={() => navigate('/admin/cases/new')}
                                className="h-10 px-5 flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-label rounded-none transition-colors shadow-none"
                            >
                                <Plus className="w-3.5 h-3.5" /> NOVO CASE
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
                                    {item.case_category || 'GERAL'}
                                </span>
                                <h3 className="text-lg font-black text-black leading-snug mb-2 line-clamp-1 truncate uppercase">
                                    {item.client_name || 'CLIENTE'}
                                </h3>

                                {item.primary_metric && (
                                    <div className="mb-4 flex items-center gap-2 text-zinc-900 border border-zinc-200 bg-zinc-50 px-2 py-1.5 rounded-none self-start mt-2">
                                        <TrendingUp className="w-3 h-3 text-[#00CC6A]" />
                                        <span className="text-metric">{item.primary_metric}</span>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <span className="text-label text-zinc-400">
                                        CREATED: {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </span>
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
                                        navigate(`/admin/cases/edit/${item.id}`);
                                    }}
                                    className="px-4 py-2 bg-white text-black text-label rounded-none hover:bg-zinc-200 transition-colors"
                                >
                                    EDIT
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCases;
