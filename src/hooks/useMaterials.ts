import { useQuery } from '@tanstack/react-query';
import { getAllMaterials, getMaterialBySlug, getFeaturedMaterials, Material } from '@/api/materials';

/**
 * Hook para buscar todos os materiais
 */
export const useMaterials = () => {
    return useQuery<Material[], Error>({
        queryKey: ['materials'],
        queryFn: getAllMaterials,
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos
        retry: false, // Não tentar novamente em caso de erro - mostrar dados estáticos
    });
};

/**
 * Hook para buscar um material por slug
 */
export const useMaterial = (slug: string) => {
    return useQuery<Material | null, Error>({
        queryKey: ['material', slug],
        queryFn: () => getMaterialBySlug(slug),
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

/**
 * Hook para buscar materiais em destaque
 */
export const useFeaturedMaterials = () => {
    return useQuery<Material[], Error>({
        queryKey: ['materials', 'featured'],
        queryFn: getFeaturedMaterials,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};
