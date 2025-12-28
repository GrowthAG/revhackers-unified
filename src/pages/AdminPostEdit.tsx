import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import PostEditor from '@/components/admin/PostEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  image?: string;
  thumbnail?: string;
  date: string;
  read_time?: string;
}

const AdminPostEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching post:', error);
          setFetchError(error.message);
          toast.error(`Erro ao carregar post: ${error.message}`);
        } else if (data) {
          setPost(data);
        } else {
          setFetchError("Post não encontrado");
          // navigate('/admin/posts');
        }
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setFetchError(error.message || 'Erro desconhecido');
        // navigate('/admin/posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // Debug: Timeout de segurança para loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timeout forced");
        setIsLoading(false);
        setFetchError("Timeout: O servidor demorou muito para responder.");
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Carregando...</p>
      </div>
    );
  }

  if (fetchError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-lg p-6 border border-red-100 bg-red-50 rounded">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao carregar Post</h2>
          <div className="mb-6 text-left text-xs font-mono bg-white p-4 border border-red-100">
            <p>ID: {id}</p>
            <p>Erro: {fetchError || 'Post não encontrado'}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.href = '/admin/posts'} variant="outline">Voltar</Button>
            <Button onClick={() => window.location.reload()} variant="default">Tentar Novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  // Bypass AdminLayout to avoid Auth Loop issues
  return (
    <AdminPageLayout title="Editar Post" backTo="/admin/posts" backLabel="Voltar">
      <PostEditor post={post} isEditing={true} />
    </AdminPageLayout>
  );
};

export default AdminPostEdit;
