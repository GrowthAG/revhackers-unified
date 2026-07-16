import { useState, useEffect } from 'react';
import { getAllReiProjects, getReiProjectsByClientEmail, getReiProjectsByStatus } from '@/api/reiProjects';
import { useAuth } from '@/contexts/AuthContext';
import type { ReiProject } from '@/api/reiProjects';

interface UseReiProjectsOptions {
    filterByUser?: boolean;
    filterByStatus?: 'active' | 'pending' | 'overdue' | null;
}

export const useReiProjects = (options: UseReiProjectsOptions = {}) => {
    const { filterByUser = false, filterByStatus = null } = options;
    const [projects, setProjects] = useState<ReiProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            let data: ReiProject[];

            if (filterByStatus) {
                data = await getReiProjectsByStatus(filterByStatus);
            } else if (filterByUser && user?.email) {
                data = await getReiProjectsByClientEmail(user.email);
            } else {
                data = await getAllReiProjects();
            }

            setProjects(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching REI projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [filterByUser, filterByStatus, user?.email]);

    return {
        projects,
        loading,
        error,
        refetch: fetchProjects
    };
};
