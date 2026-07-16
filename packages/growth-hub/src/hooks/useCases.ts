import { useQuery } from '@tanstack/react-query';
import { getAllCases, getCaseBySlug, getFeaturedCases, CaseStudy } from '@/api/cases';

/**
 * Hook para buscar todos os cases
 */
export const useCases = () => {
    return useQuery<CaseStudy[], Error>({
        queryKey: ['cases'],
        queryFn: getAllCases,
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos
        retry: false,
    });
};

/**
 * Hook para buscar um case por slug
 */
export const useCase = (slug: string) => {
    return useQuery<CaseStudy | null, Error>({
        queryKey: ['case', slug],
        queryFn: () => getCaseBySlug(slug),
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

/**
 * Hook para buscar cases em destaque
 */
export const useFeaturedCases = () => {
    return useQuery<CaseStudy[], Error>({
        queryKey: ['cases', 'featured'],
        queryFn: getFeaturedCases,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};
