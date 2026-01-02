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
            <div className="h-[calc(100vh-60px)] flex bg-white font-sans">
                {/* Sidebar List */}
                <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/50">
                    <div className="p-4 space-y-4">
                        <button
                            onClick={() => navigate('/admin/posts/new')}
                            className="w-full h-10 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Novo Artigo
                        </button>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar artigos..."
                                className="w-full h-10 pl-9 pr-3 text-[13px] bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-100 transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-100/50 mx-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Artigos ({filtered.length})
                        </span>
                        <button onClick={handleMigrate} className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Importar">
                            <Download className="w-3 h-3" /> Importar
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {filtered.map(post => (
                            <div
                                key={post.id}
                                onClick={() => setSelected(post)}
                                className={`
                                    relative p-4 rounded-xl cursor-pointer border transition-all duration-200 group
                                    ${selected?.id === post.id
                                        ? 'bg-white border-zinc-300 shadow-md ring-1 ring-zinc-50'
                                        : 'bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border
                                        ${selected?.id === post.id ? 'bg-black text-white border-black' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}
                                    `}>
                                        {post.category || 'Geral'}
                                    </span>
                                    {post.published && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Publicado" />
                                    )}
                                </div>

                                <h3 className={`text-[13px] font-semibold leading-snug mb-1 line-clamp-2 ${selected?.id === post.id ? 'text-black' : 'text-zinc-700'}`}>
                                    {post.title || 'Sem título'}
                                </h3>

                                <p className="text-[11px] text-zinc-400">
                                    {new Date(post.created_at).toLocaleDateString()} · {post.published ? 'Publicado' : 'Rascunho'}
                                </p>

                                <button
                                    onClick={(e) => handleDelete(post.id, e)}
                                    className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                <p className="text-[11px] text-zinc-400">Nenhum artigo encontrado</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Preview View */}
                <div className="flex-1 relative bg-white">
                    {selected ? (
                        <div className="absolute inset-0 overflow-y-auto">
                            <div className="max-w-4xl mx-auto px-12 py-16">
                                <div className="flex items-start justify-between mb-8 pb-8 border-b border-zinc-100">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 px-2 py-1 rounded-sm">
                                                Postagem de Blog
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selected.published ? 'text-green-600' : 'text-amber-500'}`}>
                                                {selected.published ? '● Publicado' : '○ Rascunho'}
                                            </span>
                                        </div>
                                        <h1 className="text-4xl font-black text-black tracking-tight leading-tight">
                                            {selected.title}
                                        </h1>
                                        {selected.slug && (
                                            <code className="text-xs text-zinc-400 bg-zinc-50 px-2 py-1 rounded font-mono">/{selected.slug}</code>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/posts/edit/${selected.id}`)}
                                        className="shrink-0 flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl group"
                                    >
                                        <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">Editar Artigo</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="md:col-span-2 space-y-8">
                                        {/* Cover */}
                                        {(selected.image || selected.thumbnail) && (
                                            <div className="rounded-xl overflow-hidden shadow-2xl border border-zinc-100 bg-zinc-50">
                                                <img
                                                    src={selected.image || selected.thumbnail}
                                                    alt={selected.title}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Excerpt */}
                                        {selected.excerpt && (
                                            <p className="text-lg text-zinc-600 font-serif leading-relaxed italic border-l-4 border-zinc-900 pl-4 py-1">
                                                {selected.excerpt}
                                            </p>
                                        )}

                                        {/* Content Preview */}
                                        <div className="prose prose-zinc prose-sm max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: selected.content || '' }} />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Info Sidebar */}
                                        <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100 space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Autor</h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                        {(selected.author?.full_name || 'R').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-zinc-700">
                                                        {selected.author?.full_name || 'Equipe RevHackers'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="h-px bg-zinc-200" />

                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Data de Criação</h4>
                                                <span className="text-xs text-zinc-600 font-mono">{new Date(selected.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="h-px bg-zinc-200" />

                                            <div>
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Categoria</h4>
                                                <span className="text-xs text-zinc-600 font-medium bg-zinc-200 px-2 py-1 rounded-md">{selected.category || 'Geral'}</span>
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
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">Gerenciador de Artigos</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Selecione um artigo na lista lateral para visualizar detalhes ou editar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPosts;
