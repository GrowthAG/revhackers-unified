import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type ReiResponse = Database['public']['Tables']['rei_responses']['Row'];
export type ReiResponseInsert = Database['public']['Tables']['rei_responses']['Insert'];
export type ReiResponseUpdate = Database['public']['Tables']['rei_responses']['Update'];

/**
 * CRIAR RESPOSTA DE DIAGNÓSTICO REI
 * Qualquer usuário autenticado pode criar (cliente fazendo diagnóstico)
 */
export const createReiResponse = async (response: ReiResponseInsert): Promise<ReiResponse | null> => {
    const { data, error } = await supabase
        .from('rei_responses')
        .insert(response)
        .select()
        .single();

    if (error) {
        console.error('Error creating REI response:', error);
        throw error;
    }

    return data;
};

/**
 * BUSCAR TODAS AS RESPOSTAS DE UM PROJETO
 * Retorna histórico completo de diagnósticos
 */
export const getReiResponsesByProject = async (projectId: string): Promise<ReiResponse[]> => {
    const { data, error } = await supabase
        .from('rei_responses')
        .select('*')
        .eq('project_id', projectId)
        .order('completed_at', { ascending: false });

    if (error) {
        console.error('Error fetching REI responses:', error);
        throw error;
    }

    return data || [];
};

/**
 * BUSCAR RESPOSTA MAIS RECENTE DE UM PROJETO
 */
export const getLatestReiResponse = async (projectId: string): Promise<ReiResponse | null> => {
    const { data, error } = await supabase
        .from('rei_responses')
        .select('*')
        .eq('project_id', projectId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching latest REI response:', error);
        return null;
    }

    return data;
};

/**
 * BUSCAR RESPOSTA POR ID
 */
export const getReiResponseById = async (id: string): Promise<ReiResponse | null> => {
    const { data, error } = await supabase
        .from('rei_responses')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching REI response:', error);
        return null;
    }

    return data;
};

/**
 * ATUALIZAR RESPOSTA REI
 * Apenas super_admin pode atualizar
 */
export const updateReiResponse = async (
    id: string,
    updates: ReiResponseUpdate
): Promise<ReiResponse | null> => {
    const { data, error } = await supabase
        .from('rei_responses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating REI response:', error);
        throw error;
    }

    return data;
};

/**
 * DELETAR RESPOSTA REI
 * Apenas super_admin pode deletar
 */
export const deleteReiResponse = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('rei_responses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting REI response:', error);
        throw error;
    }
};

/**
 * CALCULAR SCORE E MATURITY LEVEL
 * Baseado nas respostas do diagnóstico
 */
export const calculateMaturity = (responses: Record<string, any>): {
    totalScore: number;
    maturityLevel: string;
    maturityPercentage: number;
} => {
    // Contar total de respostas
    const totalQuestions = Object.keys(responses).length;

    // Calcular score total (assumindo respostas de 1-5)
    let totalScore = 0;
    Object.values(responses).forEach((answer: any) => {
        if (typeof answer === 'number') {
            totalScore += answer;
        } else if (answer?.score) {
            totalScore += answer.score;
        }
    });

    // Calcular porcentagem (assumindo máximo de 5 por questão)
    const maxPossibleScore = totalQuestions * 5;
    const maturityPercentage = (totalScore / maxPossibleScore) * 100;

    // Determinar nível de maturidade
    let maturityLevel: string;
    if (maturityPercentage < 20) {
        maturityLevel = 'Fundação';
    } else if (maturityPercentage < 40) {
        maturityLevel = 'Estruturação';
    } else if (maturityPercentage < 60) {
        maturityLevel = 'Escala';
    } else if (maturityPercentage < 80) {
        maturityLevel = 'Otimização';
    } else {
        maturityLevel = 'World Class';
    }

    return {
        totalScore,
        maturityLevel,
        maturityPercentage: Math.round(maturityPercentage * 100) / 100 // 2 decimais
    };
};

// NOTE: saveReiDiagnostic lives in reiProjects.ts (single source of truth)
// Do NOT duplicate here - REIWizard imports from reiProjects.ts

/**
 * COMPARAR EVOLUÇÃO
 * Compara duas respostas para mostrar evolução
 */
export const compareReiResponses = (
    previous: ReiResponse,
    current: ReiResponse
): {
    scoreDifference: number;
    percentageDifference: number;
    improved: boolean;
} => {
    const scoreDifference = current.total_score - previous.total_score;
    const percentageDifference = current.maturity_percentage - previous.maturity_percentage;
    const improved = scoreDifference > 0;

    return {
        scoreDifference,
        percentageDifference,
        improved
    };
};
