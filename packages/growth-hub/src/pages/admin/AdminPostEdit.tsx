import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import PostEditor from '@/components/admin/PostEditor';
import { Loader2 } from 'lucide-react';

const AdminPostEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching post:', error);
                navigate('/admin/posts'); // Redirect if not found
            } else {
                setPost(data);
            }
            setLoading(false);
        };

        fetchPost();
    }, [id, navigate]);

    if (loading) {
        return (
            <PageLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </PageLayout>
        );
    }

    if (!post) return null;

    return (
        <PageLayout>
            <AdminPageLayout
                title="Editar Artigo"
                description={`Editando: ${post.title}`}
                backTo="/admin/posts"
                backLabel="Voltar aos Artigos"
            >
                <div className="max-w-5xl mx-auto">
                    <PostEditor post={post} isEditing />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminPostEdit;
