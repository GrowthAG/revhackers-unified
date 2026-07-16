import { useQuery } from '@tanstack/react-query';
import { getAllPosts, getPostBySlug, BlogPostWithAuthor } from '@/api/posts';

/**
 * Hook para buscar todos os posts
 */
export const usePosts = () => {
    return useQuery<BlogPostWithAuthor[], Error>({
        queryKey: ['posts'],
        queryFn: getAllPosts,
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
        retry: false,
    });
};

/**
 * Hook para buscar um post por slug
 */
export const usePost = (slug: string) => {
    return useQuery<BlogPostWithAuthor | null, Error>({
        queryKey: ['post', slug],
        queryFn: () => getPostBySlug(slug),
        enabled: !!slug, // Só executa se slug existir
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};
