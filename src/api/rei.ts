import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type REIProject = Database['public']['Tables']['rei_projects']['Row'];

/**
 * LISTAGEM DE PROJETOS REI (Supabase)
 */
export const getAllREIProjects = async (): Promise<REIProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAllREIProjects] Supabase error:', error);
        return [];
    }

    return data || [];
};

/**
 * PROJETO REI POR ID
 */
export const getREIProjectById = async (id: string): Promise<REIProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('[getREIProjectById] Supabase error:', error);
        return null;
    }

    return data;
};

/**
 * PROJETOS REI DO USUÁRIO
 */
export const getUserREIProjects = async (userId: string): Promise<REIProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getUserREIProjects] Supabase error:', error);
        return [];
    }

    return data || [];
};

/**
 * CRIAR PROJETO REI
 */
export const createREIProject = async (project: Partial<REIProject>): Promise<REIProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .insert(project)
        .select()
        .single();

    if (error) {
        console.error('[createREIProject] Supabase error:', error);
        return null;
    }

    return data;
};

/**
 * ATUALIZAR PROJETO REI
 */
export const updateREIProject = async (id: string, updates: Partial<REIProject>): Promise<REIProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[updateREIProject] Supabase error:', error);
        return null;
    }

    return data;
};

/**
 * DELETAR PROJETO REI
 */
export const deleteREIProject = async (id: string): Promise<boolean> => {
    // 1. Delete associated client_documents
    await supabase.from('client_documents').delete().eq('project_id', id);

    // 2. Delete associated strategic_plans
    await supabase.from('strategic_plans').delete().eq('rei_project_id', id);

    // 3. Delete associated rei_responses
    await supabase.from('rei_responses').delete().eq('project_id', id);

    // 4. Finally delete the project
    const { error } = await supabase
        .from('rei_projects')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[deleteREIProject] Supabase error:', error);
        return false;
    }

    return true;
};
