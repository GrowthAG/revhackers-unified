
// REI Supabase Integration
// Arquitetura JSONB-First: Toda regra de negócio reside na coluna 'data' (jsonb).
// Tabela: 'reis' (id, created_at, created_by, data) - 'data' contém client_name, status, etc.
// Tabela: 'diagnosticos' (id, rei_id, data) - 'data' contém respostas, score, etc.

import { supabase } from '@/integrations/supabase/client';
import { REIProject, getNextQuarter, getREIStatus } from './reiQuarterlySystem';

// --- TIPOS INTERNOS DO BANCO (JSONB) ---
interface REIProjectDataJSON {
    client_name: string;
    client_email: string;
    client_company: string;
    analyst_email: string;
    last_rei_date: string;
    next_rei_date: string;
    quarter: string;
    year: number;
    status: 'active' | 'pending' | 'overdue';
    [key: string]: any; // Flexibilidade permitida
}

interface REIResponseDataJSON {
    responses: Record<string, any>;
    total_score: number;
    maturity_level: string;
    maturity_percentage: number;
    completed_at: string;
    [key: string]: any;
}

export interface REIResponse {
    id: string;
    project_id: string;
    responses: Record<string, any>;
    total_score: number;
    maturity_level: string;
    maturity_percentage: number;
    completed_at: string;
}

// --- ADAPTADORES ---

/**
 * Cria um novo projeto REI no Supabase (Tabela 'reis')
 * Mapeia os campos para um objeto JSON stored na coluna 'data'.
 */
export const createREIProject = async (
    clientName: string,
    clientEmail: string,
    clientCompany: string,
    analystEmail: string
): Promise<{ data: REIProject | null; error: any }> => {
    const now = new Date();
    const { quarter, startDate } = getNextQuarter(now);
    const year = startDate.getFullYear();

    // Payload que será salvo na coluna 'data'
    const jsonPayload: REIProjectDataJSON = {
        client_name: clientName,
        client_email: clientEmail,
        client_company: clientCompany,
        analyst_email: analystEmail,
        last_rei_date: now.toISOString(),
        next_rei_date: startDate.toISOString(),
        quarter,
        year,
        status: 'active'
    };

    // Inserção usando 'reis' e 'data'
    // O cast para 'any' é necessário pois o types.ts local está desatualizado
    const { data: row, error } = await supabase
        .from('reis' as any)
        .insert({
            data: jsonPayload
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating REI project (JSONB):', error);
        return { data: null, error };
    }

    // Mapeia de volta para a entidade de frontend
    return {
        data: mapRowToREIProject(row),
        error: null
    };
};

/**
 * Busca todos os projetos REI (Lê de 'reis' -> extrai de 'data')
 */
export const getAllREIProjects = async (): Promise<{ data: REIProject[] | null; error: any }> => {
    const { data: rows, error } = await supabase
        .from('reis' as any)
        .select('*');

    if (error) {
        console.error('Error fetching REI projects:', error);
        return { data: null, error };
    }

    const projects: REIProject[] = (rows || []).map(mapRowToREIProject);

    // Ordenação client-side por data
    projects.sort((a, b) => a.nextREIDate.getTime() - b.nextREIDate.getTime());

    return { data: projects, error: null };
};

/**
 * Busca projetos que precisam atenção
 */
export const getProjectsNeedingAttention = async (): Promise<{ data: REIProject[] | null; error: any }> => {
    const { data: projects, error } = await getAllREIProjects();

    if (error) return { data: null, error };

    const filtered = (projects || []).filter(p => ['pending', 'overdue'].includes(p.status));

    return { data: filtered, error: null };
};

/**
 * Salva as respostas de um diagnóstico REI (Tabela 'diagnosticos')
 */
export const saveREIResponse = async (
    projectId: string,
    responses: Record<string, any>,
    totalScore: number,
    maturityLevel: string,
    maturityPercentage: number
): Promise<{ data: REIResponse | null; error: any }> => {
    const nowStr = new Date().toISOString();

    // Payload JSONB
    const jsonPayload: REIResponseDataJSON = {
        responses,
        total_score: totalScore,
        maturity_level: maturityLevel,
        maturity_percentage: maturityPercentage,
        completed_at: nowStr
    };

    const { data: row, error } = await supabase
        .from('diagnosticos' as any)
        .insert({
            rei_id: projectId, // Vínculo FK Explícito
            data: jsonPayload
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving REI response:', error);
        return { data: null, error };
    }

    // Mapear de volta
    const mapped: REIResponse = {
        id: row.id,
        project_id: row.rei_id,
        responses: (row.data as REIResponseDataJSON).responses,
        total_score: (row.data as REIResponseDataJSON).total_score || 0,
        maturity_level: (row.data as REIResponseDataJSON).maturity_level || '',
        maturity_percentage: (row.data as REIResponseDataJSON).maturity_percentage || 0,
        completed_at: (row.data as REIResponseDataJSON).completed_at || nowStr
    };

    return { data: mapped, error: null };
};

/**
 * Atualiza o projeto REI após completar (Atualiza JSON em 'reis')
 */
export const updateREIProjectAfterCompletion = async (
    projectId: string
): Promise<{ data: REIProject | null; error: any }> => {
    // 1. Fetch current data
    const { data: fetchRow, error: fetchError } = await supabase
        .from('reis' as any)
        .select('data')
        .eq('id', projectId)
        .single();

    if (fetchError || !fetchRow) return { data: null, error: fetchError };

    const currentData = fetchRow.data as REIProjectDataJSON;
    const now = new Date();
    const { quarter, startDate } = getNextQuarter(now);
    const year = startDate.getFullYear();
    const status = getREIStatus(startDate);

    // 2. Merge updates
    const updatedData: REIProjectDataJSON = {
        ...currentData,
        last_rei_date: now.toISOString(),
        next_rei_date: startDate.toISOString(),
        quarter,
        year,
        status
    };

    // 3. Update JSONB column
    const { data: row, error } = await supabase
        .from('reis' as any)
        .update({
            data: updatedData
        })
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error('Error updating REI project:', error);
        return { data: null, error };
    }

    return {
        data: mapRowToREIProject(row),
        error: null
    };
};

/**
 * Busca histórico de respostas de um projeto
 */
export const getREIHistory = async (projectId: string): Promise<{ data: REIResponse[] | null; error: any }> => {
    const { data: rows, error } = await supabase
        .from('diagnosticos' as any)
        .select('*')
        .eq('rei_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching REI history:', error);
        return { data: null, error };
    }

    const history: REIResponse[] = (rows || []).map((row: any) => ({
        id: row.id,
        project_id: row.rei_id,
        responses: row.data?.responses || {},
        total_score: row.data?.total_score || 0,
        maturity_level: row.data?.maturity_level || '',
        maturity_percentage: row.data?.maturity_percentage || 0,
        completed_at: row.data?.completed_at || row.created_at
    }));

    return { data: history, error: null };
};

/**
 * Atualiza status de todos os projetos (via RPC do banco)
 */
export const updateAllREIStatuses = async (): Promise<{ success: boolean; error: any }> => {
    const { error } = await supabase.rpc('update_rei_status'); // Assumindo RPC existente
    if (error) {
        console.error('Error updating REI statuses:', error);
        return { success: false, error };
    }
    return { success: true, error: null };
};

// --- HELPER DE MAPEAMENTO ---

function mapRowToREIProject(row: any): REIProject {
    const d = row.data as REIProjectDataJSON;

    // Fallbacks de segurança
    return {
        id: row.id,
        clientName: d?.client_name || 'Cliente Sem Nome',
        clientEmail: d?.client_email || '',
        lastREIDate: d?.last_rei_date ? new Date(d.last_rei_date) : new Date(),
        nextREIDate: d?.next_rei_date ? new Date(d.next_rei_date) : new Date(),
        quarter: (d?.quarter as any) || 'Q1',
        year: d?.year || new Date().getFullYear(),
        status: (d?.status as any) || 'active',
        analystEmail: d?.analyst_email || ''
    };
}
