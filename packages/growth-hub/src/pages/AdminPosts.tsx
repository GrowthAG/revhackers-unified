import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash, Eye, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts } from '@/data/blogData';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  date: string;
}

const AdminPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erro ao carregar os posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));
      setPostToDelete(null);
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir o post');
    }
  };

  const validatePost = (post: any) => {
    const requiredFields = ['title', 'excerpt', 'category', 'date'];
    const missingFields = requiredFields.filter(field => !post[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return {
      id: post.id,
      title: post.title.trim(),
      slug: post.slug.trim(),
      excerpt: post.excerpt.trim(),
      content: post.content?.trim() || `# ${post.title}\n\n${post.excerpt}`,
      category: post.category.trim(),
      image: post.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
      author_name: post.author?.name?.trim() || 'Giulliano Alves',
      author_role: post.author?.role?.trim() || 'CEO da RevHackers',
      author_avatar: post.author?.avatar || '/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png',
      date: new Date(post.date).toISOString(),
      read_time: post.readTime?.trim() || '5 min',
      featured: Boolean(post.featured)
    };
  };

  const migrateExistingPosts = async () => {
    setIsMigrating(true);
    try {
      const { data: existingPosts } = await supabase
        .from('blog_posts')
        .select('id, slug');

      const existingIds = new Set((existingPosts || []).map(post => post.id));
      const existingSlugs = new Set((existingPosts || []).map(post => post.slug));

      let imported = 0;
      let skipped = 0;
      let errors = 0;
      let errorDetails = [];

      for (const post of blogPosts) {
        try {
          if (existingIds.has(post.id) || existingSlugs.has(post.slug)) {
            console.log(`Skipping post: ${post.title} (already exists)`);
            skipped++;
            continue;
          }

          const validatedPost = validatePost(post);

          const { error } = await supabase
            .from('blog_posts')
            .insert([validatedPost]);

          if (error) {
            console.error(`Error importing post ${post.title}:`, error);
            errors++;
            errorDetails.push(`${post.title}: ${error.message}`);
          } else {
            imported++;
            console.log(`Successfully imported: ${post.title}`);
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error processing post ${post.title}:`, error);
          errors++;
          errorDetails.push(`${post.title}: ${error.message}`);
        }
      }

      await fetchPosts();

      if (errors > 0) {
        console.error('Import errors:', errorDetails);
        toast.error(`Importação concluída com erros. ${imported} posts importados, ${skipped} posts ignorados, ${errors} erros.`);
      } else {
        toast.success(`Importação concluída! ${imported} posts importados, ${skipped} posts ignorados.`);
      }

      setShowMigrationDialog(false);
    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('Erro durante a migração dos posts');
    } finally {
      setIsMigrating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-revgreen border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Posts do Blog</h2>
        <div className="flex gap-2">
          <AlertDialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" /> Importar Posts
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar Posts Existentes</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso importará todos os posts existentes no arquivo blogData.ts para o banco de dados.
                  Posts existentes com ID ou slug iguais serão ignorados.
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isMigrating}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    migrateExistingPosts();
                  }}
                  disabled={isMigrating}
                  className="bg-revgreen hover:bg-revgreen/90"
                >
                  {isMigrating ? 'Importando...' : 'Importar Posts'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild>
            <Link to="/admin/posts/new">
              <Plus className="h-4 w-4 mr-2" /> Novo Post
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <TableRow
                  key={post.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    console.log('Navigating to post:', post.id);
                    window.location.assign(`/admin/posts/edit/${post.id}`);
                  }}
                >

                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>{formatDate(post.date)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Publicado
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-black hover:text-white hover:bg-black transition-colors rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/blog/${post.slug}`, '_blank');
                        }}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4 stroke-[2.5]" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-black hover:text-white hover:bg-black transition-colors rounded-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.assign(`/admin/posts/edit/${post.id}`);
                        }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 stroke-[2.5]" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-black hover:text-white hover:bg-red-600 transition-colors rounded-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostToDelete(post.id);
                            }}
                            title="Excluir"
                          >
                            <Trash className="h-4 w-4 stroke-[2.5]" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhum post encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminPosts;
