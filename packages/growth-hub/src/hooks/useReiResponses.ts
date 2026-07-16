import { useState, useEffect } from 'react';
import { getReiResponsesByProject, getLatestReiResponse } from '@/api/reiResponses';
import type { ReiResponse } from '@/api/reiResponses';

interface UseReiResponsesOptions {
    projectId: string | null;
    latestOnly?: boolean;
}

export const useReiResponses = (options: UseReiResponsesOptions) => {
    const { projectId, latestOnly = false } = options;
    const [responses, setResponses] = useState<ReiResponse[]>([]);
    const [latestResponse, setLatestResponse] = useState<ReiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchResponses = async () => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (latestOnly) {
                const data = await getLatestReiResponse(projectId);
                setLatestResponse(data);
            } else {
                const data = await getReiResponsesByProject(projectId);
                setResponses(data);
                if (data.length > 0) {
                    setLatestResponse(data[0]); // Primeiro é o mais recente
                }
            }
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching REI responses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResponses();
    }, [projectId, latestOnly]);

    return {
        responses,
        latestResponse,
        loading,
        error,
        refetch: fetchResponses
    };
};
