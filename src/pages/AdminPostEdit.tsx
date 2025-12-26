
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import PostEditor from '@/components/admin/PostEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setPost(data);
        } else {
          navigate('/admin/posts');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/admin/posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-revgreen border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Post não encontrado</h2>
          <Button onClick={() => navigate('/admin/posts')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageLayout title="Editar Post" backTo="/admin/posts" backLabel="Voltar para a lista">
        <PostEditor post={post} isEditing={true} />
      </AdminPageLayout>
    </AdminLayout>
  );
};

export default AdminPostEdit;
