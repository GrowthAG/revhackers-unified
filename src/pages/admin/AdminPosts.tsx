import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const AdminPosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        console.log('🔍 Iniciando busca de posts...');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('👤 Sessão:', session ? 'Ativa' : 'Inativa');

            if (session) {
                setUserId(session.user.id);
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                const isSuperAdmin = profile?.role === 'super_admin';
                setIsAdmin(isSuperAdmin);
                console.log('🔐 Admin:', isSuperAdmin);
            }

            // Fetch posts with robust error handling
            console.log('📡 Buscando posts do Supabase...');
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*, author:profiles(full_name)')
                .order('created_at', { ascending: false });

            console.log('📊 Resultado:', {
                total: data?.length || 0,
                erro: error?.message || 'nenhum',
                dados: data
            });

            if (error) {
                console.error("❌ Erro ao buscar posts:", error);
                toast({ title: "Erro ao carregar artigos", description: error.message, variant: "destructive" });
            } else {
                console.log('✅ Posts carregados:', data?.length || 0);
                setPosts(data || []);
            }
        } catch (err) {
            console.error('💥 Erro fatal:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;

        const { error } = await supabase.from('blog_posts').update({ published: false }).eq('id', id);
        if (error) {
            toast({ title: 'Erro ao excluir', variant: 'destructive' });
        } else {
            toast({ title: 'Post excluído' });
            setPosts(posts.filter(post => post.id !== id));
        }
    }

    const filteredPosts = posts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageLayout>
            <AdminPageLayout
                title="Gerenciar Artigos"
                description="Crie e gerencie artigos do blog"
                actions={
                    <Button onClick={() => navigate('/admin/posts/new')} className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest h-9 rounded-none px-6 shadow-none transition-all">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Novo Artigo
                    </Button>
                }
            >
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm backdrop-blur-sm transition-colors duration-300">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar artigos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 bg-gray-50 dark:bg-black/50 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-revgreen/30 transition-all"
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Total: <strong className="text-gray-900 dark:text-white">{filteredPosts.length}</strong> artigos
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden backdrop-blur-sm animate-in fade-in duration-500 transition-colors duration-300">
                        <Table>
                            <TableHeader className="bg-white border-b-2 border-black">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[400px] text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Título</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Autor</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Status</TableHead>
                                    <TableHead className="text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Data</TableHead>
                                    <TableHead className="text-right text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] py-8">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPosts.map((post) => (
                                    <TableRow key={post.id} className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/posts/edit/${post.id}`)}>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-none bg-zinc-50 border border-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                                                    <FileText className="h-4 w-4 stroke-[2]" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 dark:text-white group-hover:text-black transition-colors line-clamp-1">{post.title}</div>
                                                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest line-clamp-1">{post.slug}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                            {post.author?.full_name || post.author_name || 'Equipe RevHackers'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[9px] rounded-none px-2 py-0.5 border ${post.published
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-black border-zinc-200'
                                                }`}>
                                                {post.published ? 'Publicado' : 'Rascunho'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(post.created_at || post.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-black hover:text-white hover:bg-black transition-colors rounded-none"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/posts/edit/${post.id}`); }}
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4 stroke-[2.5]" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-black hover:text-white hover:bg-black transition-colors rounded-none"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                                    title="Excluir"
                                                >
                                                    <Trash className="h-4 w-4 stroke-[2.5]" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredPosts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                            Nenhum artigo encontrado
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

export default AdminPosts;
