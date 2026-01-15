import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Edit, Trash2, FileText, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { migratePosts } from '@/services/migrationService';

const AdminPosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*, author:profiles(full_name)')
            .order('created_at', { ascending: false });
        if (error) toast.error('Erro ao carregar artigos');
        else setPosts(data || []);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir este artigo?')) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            toast.success('Artigo excluído');
            setPosts(posts.filter(p => p.id !== id));
            if (selected?.id === id) setSelected(null);
        }
    };

    const handleMigrate = async () => {
        if (!confirm('Importar artigos do arquivo estático?')) return;
        toast.loading('Importando...', { id: 'migrate' });
        try {
            const { success, failed } = await migratePosts();
            toast.success(`${success} importados, ${failed} falhas`, { id: 'migrate' });
            fetchPosts();
        } catch (error) {
            toast.error(String(error), { id: 'migrate' });
        }
    };

    const filtered = posts.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-zinc-50/50 p-8 font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6" /> CMS de Blog
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Gerencie seus artigos de alta performance. ({filtered.length} total)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar artigos..."
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
                            onClick={() => navigate('/admin/posts/new')}
                            className="h-10 px-5 flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" /> Novo Artigo
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(post => (
                        <div
                            key={post.id}
                            onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                            className="group relative bg-white rounded-sm border border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[380px] cursor-pointer overflow-hidden"
                        >
                            {/* Image Cover */}
                            <div className="h-48 bg-zinc-100 relative overflow-hidden">
                                {(post.image || post.thumbnail) ? (
                                    <img
                                        src={post.image || post.thumbnail}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                                        <FileText className="w-10 h-10 text-zinc-200" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`
                                        text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm backdrop-blur-md
                                        ${post.published
                                            ? 'bg-green-500/90 text-white'
                                            : 'bg-amber-400/90 text-black'
                                        }
                                    `}>
                                        {post.published ? 'Publicado' : 'Rascunho'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                    {post.category || 'Geral'}
                                </span>
                                <h3 className="text-lg font-bold text-zinc-900 leading-snug mb-2 line-clamp-2 group-hover:text-black transition-colors">
                                    {post.title || 'Sem Título'}
                                </h3>
                                <p className="text-xs text-zinc-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                                    {post.excerpt || 'Sem descrição.'}
                                </p>

                                {/* Footer / Meta */}
                                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                                            {(post.author?.full_name || 'R').charAt(0)}
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[80px]">
                                            {post.author?.full_name || 'RevHackers'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-zinc-300 font-mono">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => handleDelete(post.id, e)}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-sm backdrop-blur-md transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/posts/edit/${post.id}`);
                                    }}
                                    className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-100 transition-colors shadow-lg"
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white border border-dashed border-zinc-200 rounded-sm">
                            <FileText className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900">Nenhum artigo encontrado</h3>
                            <p className="text-sm text-zinc-500 mb-6">Comece criando seu primeiro post de alta performance.</p>
                            <button
                                onClick={() => navigate('/admin/posts/new')}
                                className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors"
                            >
                                Criar Artigo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPosts;
