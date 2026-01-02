import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export interface BlogPostWithAuthor extends Omit<BlogPost, 'author_name' | 'author_role' | 'author_avatar'> {
    author: {
        name: string;
        role: string;
        avatar: string;
    }
}

/**
 * LISTAGEM DE POSTS (Supabase)
 */
export const getAllPosts = async (): Promise<BlogPostWithAuthor[]> => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('[getAllPosts] Supabase error:', error);
        return [];
    }

    if (!data) return [];

    // Map Supabase flat structure to frontend expected structure (with author object)
    return data.map(post => ({
        ...post,
        author: {
            name: post.author_name || "Equipe RevHackers",
            role: post.author_role || "Expert",
            avatar: post.author_avatar || "/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
        }
    }));
};

/**
 * DETALHE DO POST POR SLUG
 */
export const getPostBySlug = async (slug: string): Promise<BlogPostWithAuthor | null> => {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('[getPostBySlug] Supabase error:', error);
        return null;
    }

    if (!data) return null;

    return {
        ...data,
        author: {
            name: data.author_name || "Equipe RevHackers",
            role: data.author_role || "Expert",
            avatar: data.author_avatar || "/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png"
        }
    };
};
