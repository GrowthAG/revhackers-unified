import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllREIProjects,
    getREIProjectById,
    getUserREIProjects,
    createREIProject,
    updateREIProject,
    deleteREIProject,
    REIProject
} from '@/api/rei';

/**
 * Hook para buscar todos os projetos REI
 */
export const useREIProjects = () => {
    return useQuery<REIProject[], Error>({
        queryKey: ['rei-projects'],
        queryFn: getAllREIProjects,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

/**
 * Hook para buscar um projeto REI por ID
 */
export const useREIProject = (id: string) => {
    return useQuery<REIProject | null, Error>({
        queryKey: ['rei-project', id],
        queryFn: () => getREIProjectById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

/**
 * Hook para buscar projetos REI do usuário
 */
export const useUserREIProjects = (userId: string) => {
    return useQuery<REIProject[], Error>({
        queryKey: ['rei-projects', 'user', userId],
        queryFn: () => getUserREIProjects(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
};

/**
 * Hook para criar projeto REI
 */
export const useCreateREIProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (project: Partial<REIProject>) => createREIProject(project),
        onSuccess: () => {
            // Invalidar cache para refetch
            queryClient.invalidateQueries({ queryKey: ['rei-projects'] });
        },
    });
};

/**
 * Hook para atualizar projeto REI
 */
export const useUpdateREIProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<REIProject> }) =>
            updateREIProject(id, updates),
        onSuccess: (data, variables) => {
            // Invalidar cache específico do projeto
            queryClient.invalidateQueries({ queryKey: ['rei-project', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['rei-projects'] });
        },
    });
};

/**
 * Hook para deletar projeto REI
 */
export const useDeleteREIProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteREIProject(id),
        onSuccess: () => {
            // Invalidar cache
            queryClient.invalidateQueries({ queryKey: ['rei-projects'] });
        },
    });
};
