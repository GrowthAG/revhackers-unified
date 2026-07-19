import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { createDocumentFromREI } from "./knowledge";
import { getTemplateForREI } from "./taskTemplates";

export interface FocalPoint {
    name: string;
    email: string;
    role: string;
    is_main?: boolean;
}

export type ReiProject = Omit<Database['public']['Tables']['rei_projects']['Row'], 'focal_points'> & {
    trade_name?: string | null;
    focal_points?: FocalPoint[] | null;
    site_analysis?: any | null;
    materials_status?: 'delivered' | 'pending';
    materials_delay_accepted?: boolean;
    final_expectations?: string | null;
    linkedin_data?: any | null;
    linkedin_url?: string | null;
    linkedin_scraped_at?: string | null;
    market_data?: any | null;
    market_data_updated_at?: string | null;
    /** Dados de enriquecimento automatico: cnpj (BrasilAPI) + site_perf (Google PSI) */
    enrichment_data?: {
        enriched_at?: string;
        cnpj?: {
            razao_social?: string;
            nome_fantasia?: string | null;
            situacao_cadastral?: string;
            data_abertura?: string;
            natureza_juridica?: string;
            porte?: string;
            capital_social?: number;
            cnae_principal?: { codigo: string; descricao: string } | null;
            cnaes_secundarios?: { codigo: string; descricao: string }[];
            municipio?: string;
            uf?: string;
            email?: string | null;
            telefone?: string | null;
            qsa?: { nome: string; qualificacao: string }[];
        } | null;
        site_perf?: {
            url?: string;
            performance_score?: number;
            seo_score?: number;
            lcp?: string | null;
            fid?: string | null;
            cls?: string | null;
            fcp?: string | null;
            tti?: string | null;
            speed_index?: string | null;
            rating?: string;
        } | null;
    } | null;
};
export type ReiProjectInsert = Omit<Database['public']['Tables']['rei_projects']['Insert'], 'focal_points'> & { 
    trade_name?: string | null,
    focal_points?: FocalPoint[] | null
};
export type ReiProjectUpdate = Omit<Database['public']['Tables']['rei_projects']['Update'], 'focal_points'> & { 
    trade_name?: string | null, 
    market_data?: any | null, 
    market_data_updated_at?: string | null,
    materials_status?: 'delivered' | 'pending',
    materials_delay_accepted?: boolean,
    final_expectations?: string | null,
    focal_points?: FocalPoint[] | null
};

/**
 * CRIAR PROJETO REI
 * Apenas super_admin pode criar
 */
export type CreateReiProjectResult = {
    project: ReiProject;
    tasksInjected: number;
    tasksError: string | null;
};

export const createReiProject = async (project: ReiProjectInsert): Promise<CreateReiProjectResult> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .insert(project as any)
        .select()
        .single();

    if (error) {
        console.error('Error creating REI project:', error);
        throw error;
    }

    // Injecao automatica de tarefas do template - APENAS para projetos ativos, nao para leads
    let tasksInjected = 0;
    let tasksError: string | null = null;

    const isLead = (data as any).status === 'lead';

    if (data && data.id && !isLead) {
        try {
            const template = getTemplateForREI(data.type || '', (data as any).project_duration || '');
            if (template.length > 0) {
                const tasksToInsert = template.map(t => ({
                    ...t,
                    project_id: data.id,
                }));

                // Batch de 50 para evitar timeout em templates grandes
                const BATCH_SIZE = 50;
                const batchErrors: string[] = [];

                for (let i = 0; i < tasksToInsert.length; i += BATCH_SIZE) {
                    const batch = tasksToInsert.slice(i, i + BATCH_SIZE);
                    const { error: batchErr } = await supabase.from('orqflow_tasks').insert(batch);
                    if (batchErr) {
                        batchErrors.push(batchErr.message);
                    } else {
                        tasksInjected += batch.length;
                    }
                }

                if (batchErrors.length > 0) {
                    tasksError = `${tasksInjected} de ${tasksToInsert.length} tarefas criadas. Falhas: ${batchErrors.join(' | ')}`;
                    console.error('[createReiProject] Task injection partial failure:', tasksError);
                }
            }
        } catch (e: any) {
            tasksError = `Falha ao injetar tarefas: ${e.message}`;
            console.error('[createReiProject] Task injection exception:', e);
        }
    }

    return { project: data as unknown as ReiProject, tasksInjected, tasksError };
};

/**
 * LISTAR TODOS OS PROJETOS REI
 * Autenticados podem ver todos
 */
export const getAllReiProjects = async (): Promise<ReiProject[]> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select(`
            *,
            clients ( trade_name, linkedin_data, linkedin_url, linkedin_scraped_at )
        `)
        .neq('status', 'diagnostic')
        .order('next_rei_date', { ascending: true });

    if (error) {
        console.error('Error fetching REI projects:', error);
        throw error;
    }

    return (data || []).map((p: any) => {
        const tradeName = (p.clients as any)?.trade_name;
        const linkedinData = (p.clients as any)?.linkedin_data;
        const linkedinUrl = (p.clients as any)?.linkedin_url;
        const linkedinScrapedAt = (p.clients as any)?.linkedin_scraped_at;
        delete (p as any).clients;
        return {
            ...p,
            trade_name: tradeName,
            linkedin_data: linkedinData,
            linkedin_url: linkedinUrl,
            linkedin_scraped_at: linkedinScrapedAt,
            focal_points: (p.focal_points as FocalPoint[]) ?? null,
            enrichment_data: p.enrichment_data ?? null,
        } as unknown as ReiProject;
    });
};

/**
 * BUSCAR PROJETO POR ID
 */
export const getReiProjectById = async (id: string): Promise<ReiProject | null> => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select(`
            *,
            clients ( trade_name, linkedin_data, linkedin_url, linkedin_scraped_at )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching REI project:', error);
        return null;
    }

    if (data) {
        // Map fields from the joined table
        const tradeName = (data.clients as any)?.trade_name;
        const linkedinData = (data.clients as any)?.linkedin_data;
        const linkedinUrl = (data.clients as any)?.linkedin_url;
        const linkedinScrapedAt = (data.clients as any)?.linkedin_scraped_at;
        delete (data as any).clients;
        return {
            ...data,
            trade_name: tradeName,
            linkedin_data: linkedinData,
            linkedin_url: linkedinUrl,
            linkedin_scraped_at: linkedinScrapedAt,
            focal_points: (data.focal_points as unknown as FocalPoint[]) ?? null,
            enrichment_data: (data as any).enrichment_data ?? null,
        } as unknown as ReiProject;
    }

    return null;
};

/**
 * BUSCAR PROJETO (DADOS PÚBLICOS)
 * Seleciona APENAS campos seguros para o Portal do Cliente
 * Evita vazamento de dados sensíveis (Margins, Notes, etc)
 */
export const getPublicReiProjectById = async (id: string): Promise<Partial<ReiProject> | null> => {
    const { data, error } = await (supabase as any)
        .rpc('get_public_rei_project_summary', { p_id: id })
        .maybeSingle();

    if (error) {
        console.error('Error fetching public REI project:', error);
        return null;
    }

    if (data) {
        return { ...data } as Partial<ReiProject>;
    }

    return null;
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

    return ((data as any) || []) as ReiProject[];
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

    return ((data as any) || []) as ReiProject[];
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

    return ((data as any) || []) as ReiProject[];
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
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating REI project:', error);
        throw error;
    }

    return (data as any) as ReiProject | null;
};

/**
 * DELETAR PROJETO REI
 * Apenas super_admin pode deletar
 * Isso também deleta todas as respostas associadas (CASCADE)
 */
export const deleteReiProject = async (id: string): Promise<void> => {
    // Helper para deletar e ignorar erros de "tabela inexistente" (42P01 / PGRST204)
    const safeDelete = async (table: string, column: string) => {
        const { error } = await supabase.from(table as any).delete().eq(column, id);
        if (error && error.code !== '42P01' && !error.message?.includes('relation') && !error.message?.includes('does not exist')) {
            console.warn(`Aviso ao excluir dependência ${table}:`, error.message);
            // Non-blocking throw. We log to keep tracing but don't strictly halt unless necessary.
        }
    };

    // 1. Limpar Documentos do Cliente (se a tabela existir)
    await safeDelete('client_documents', 'project_id');

    // 2. Limpar Planos Estratégicos
    await safeDelete('strategic_plans', 'rei_project_id');

    // 3. Limpar Reuniões Associadas ao case
    await safeDelete('client_meetings', 'rei_project_id'); // Try clean up by project relation if added recently

    // 4. Limpar Respostas do Formulário REI
    const { error: err3 } = await supabase.from('rei_responses').delete().eq('project_id', id);
    if (err3 && err3.code !== '42P01' && !err3.message?.includes('relation') && !err3.message?.includes('does not exist')) {
        console.error('Error deleting rei_responses:', err3);
        throw new Error(`Dependência bloqueia a exclusão (rei_responses): ${err3.message}`);
    }

    // 5. Exclusão Final do Projeto Raiz
    const { error } = await supabase
        .from('rei_projects')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting REI project:', error);
        throw new Error(`A exclusão falhou com erro de Banco de Dados: ${error.message} (Cód: ${error.code})`);
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
        if (project.status === 'lead') continue;

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

        // Auto-generate document in project library
        if (response?.id) {
            // Get project name
            const { data: project } = await supabase
                .from('rei_projects')
                .select('client_name')
                .eq('id', projectId)
                .single();

            if (project?.client_name) {
                await createDocumentFromREI(
                    projectId,
                    project.client_name,
                    formData,
                    analysisResult,
                    type
                );
            }
        }

        return response?.id || null;
    } catch (error) {
        console.error('Error in saveReiDiagnostic:', error);
        throw error;
    }
};

