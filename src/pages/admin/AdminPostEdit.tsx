import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
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
            <AdminLayout>
                <div className="flex h-[calc(100vh-60px)] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                </div>
            </AdminLayout>
        );
    }

    if (!post) return null;

    return (
        <AdminLayout>
            <div className="h-full">
                <PostEditor post={post} isEditing />
            </div>
        </AdminLayout>
    );
};

export default AdminPostEdit;
