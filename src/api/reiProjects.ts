import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type ReiProject = Database['public']['Tables']['rei_projects']['Row'];
export type ReiProjectInsert = Database['public']['Tables']['rei_projects']['Insert'];
export type ReiProjectUpdate = Database['public']['Tables']['rei_projects']['Update'];

/**
 * CRIAR PROJETO REI
 * Apenas super_admin pode criar
 */
export const createReiProject = async (project: ReiProjectInsert): Promise<ReiProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .insert(project)
        .select()
        .single();

    if (error) {
        console.error('Error creating REI project:', error);
        throw error;
    }

    return data;
};

/**
 * LISTAR TODOS OS PROJETOS REI
 * Autenticados podem ver todos
 */
export const getAllReiProjects = async (): Promise<ReiProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .order('next_rei_date', { ascending: true });

    if (error) {
        console.error('Error fetching REI projects:', error);
        throw error;
    }

    return data || [];
};

/**
 * BUSCAR PROJETO POR ID
 */
export const getReiProjectById = async (id: string): Promise<ReiProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching REI project:', error);
        return null;
    }

    return data;
};

/**
 * BUSCAR PROJETOS POR EMAIL DO CLIENTE
 * Para mostrar no dashboard do cliente
 */
export const getReiProjectsByClientEmail = async (email: string): Promise<ReiProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .eq('client_email', email)
        .order('next_rei_date', { ascending: true });

    if (error) {
        console.error('Error fetching client REI projects:', error);
        throw error;
    }

    return data || [];
};

/**
 * BUSCAR PROJETOS POR ANALISTA
 * Para dashboard do analista
 */
export const getReiProjectsByAnalyst = async (analystEmail: string): Promise<ReiProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .eq('analyst_email', analystEmail)
        .order('next_rei_date', { ascending: true });

    if (error) {
        console.error('Error fetching analyst REI projects:', error);
        throw error;
    }

    return data || [];
};

/**
 * BUSCAR PROJETOS POR STATUS
 */
export const getReiProjectsByStatus = async (
    status: 'active' | 'pending' | 'overdue'
): Promise<ReiProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .eq('status', status)
        .order('next_rei_date', { ascending: true });

    if (error) {
        console.error('Error fetching REI projects by status:', error);
        throw error;
    }

    return data || [];
};

/**
 * ATUALIZAR PROJETO REI
 * Apenas super_admin pode atualizar
 */
export const updateReiProject = async (
    id: string,
    updates: ReiProjectUpdate
): Promise<ReiProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating REI project:', error);
        throw error;
    }

    return data;
};

/**
 * DELETAR PROJETO REI
 * Apenas super_admin pode deletar
 * Isso também deleta todas as respostas associadas (CASCADE)
 */
export const deleteReiProject = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('rei_projects')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting REI project:', error);
        throw error;
    }
};

/**
 * CALCULAR PRÓXIMO QUARTER
 * Utilitário para calcular o próximo quarter baseado na data atual
 */
export const calculateNextQuarter = (currentDate: Date = new Date()): {
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year: number;
    nextReiDate: string;
} => {
    const month = currentDate.getMonth(); // 0-11
    let quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    let startMonth: number;
    let year = currentDate.getFullYear();

    if (month < 3) {
        quarter = 'Q2';
        startMonth = 3; // Abril
    } else if (month < 6) {
        quarter = 'Q3';
        startMonth = 6; // Julho
    } else if (month < 9) {
        quarter = 'Q4';
        startMonth = 9; // Outubro
    } else {
        quarter = 'Q1';
        startMonth = 0; // Janeiro
        year = year + 1;
    }

    const nextReiDate = new Date(year, startMonth, 1).toISOString();

    return { quarter, year, nextReiDate };
};

/**
 * ATUALIZAR STATUS DOS PROJETOS
 * Função para ser chamada periodicamente (cron job ou manualmente)
 * Atualiza status baseado na data
 */
export const updateProjectsStatus = async (): Promise<void> => {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Buscar todos os projetos
    const { data: projects, error } = await supabase
        .from('rei_projects')
        .select('*');

    if (error || !projects) {
        console.error('Error fetching projects for status update:', error);
        return;
    }

    // Atualizar status de cada projeto
    for (const project of projects) {
        const nextReiDate = new Date(project.next_rei_date);
        let newStatus: 'active' | 'pending' | 'overdue';

        if (nextReiDate < now) {
            newStatus = 'overdue';
        } else if (nextReiDate <= fourteenDaysFromNow) {
            newStatus = 'pending';
        } else {
            newStatus = 'active';
        }

        // Atualizar apenas se o status mudou
        if (newStatus !== project.status) {
            await updateReiProject(project.id, { status: newStatus });
        }
    }
};

/**
 * SALVAR DIAGNÓSTICO REI
 * Salva os dados do diagnóstico na tabela rei_responses e atualiza o projeto
 */
export const saveReiDiagnostic = async (
    projectId: string,
    type: string,
    formData: any,
    analysisResult: {
        score: number;
        radarData: { label: string; value: number }[];
        insights: string[];
    }
): Promise<string | null> => {
    try {
        // Determine Maturity Level based on Score
        let maturityLevel = "Iniciante";
        if (analysisResult.score >= 80) maturityLevel = "Líder";
        else if (analysisResult.score >= 50) maturityLevel = "Competitivo";
        else if (analysisResult.score >= 30) maturityLevel = "Em Desenvolvimento";

        // Insert into rei_responses
        // Schema Mapping:
        // diagnostic_type -> context
        // form_data -> responses (merged with analysis data)
        const { data: response, error: responseError } = await supabase
            .from('rei_responses')
            .insert({
                project_id: projectId,
                context: 'internal', // Fixed: Must match constraint ('internal', 'lead_gen', 'public')
                responses: {
                    form_data: formData,
                    radar_data: analysisResult.radarData,
                    insights: analysisResult.insights,
                    diagnostic_type: type // Store the specific type inside JSONB
                },
                total_score: analysisResult.score,
                maturity_level: maturityLevel,
                maturity_percentage: analysisResult.score,
                source: 'rei', // Fixed: Must match constraint ('rei', 'diagnostic', 'quiz')
                completed_at: new Date().toISOString()
            } as any)
            .select()
            .single();

        if (responseError) {
            console.error('Error saving REI diagnostic:', responseError);
            throw responseError;
        }

        // Update the project with timestamp and backup of analysis in technical_evidences
        await supabase
            .from('rei_projects')
            .update({
                status: 'active', // Mark project as completed/active
                updated_at: new Date().toISOString(),
                technical_evidences: {
                    last_analysis: analysisResult,
                    last_context: type,
                    updated_at: new Date().toISOString()
                }
            } as any)
            .eq('id', projectId);

        return response?.id || null;
    } catch (error) {
        console.error('Error in saveReiDiagnostic:', error);
        throw error;
    }
};

