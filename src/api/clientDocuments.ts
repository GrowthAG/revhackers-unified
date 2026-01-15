import { supabase } from "@/integrations/supabase/client";

export interface ClientDocument {
    id: string;
    project_id: string;
    document_type: 'strategic_plan' | 'results_report';
    version: number;
    content: any;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
}

export const getLatestDocument = async (projectId: string, type: string): Promise<ClientDocument | null> => {
    const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('document_type', type)
        .order('version', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching ${type}:`, error);
        return null;
    }

    return data;
};

export const saveDocument = async (
    projectId: string,
    type: 'strategic_plan' | 'results_report',
    content: any,
    status: 'draft' | 'published' = 'draft'
): Promise<ClientDocument | null> => {
    // 1. Get latest version to increment
    const latest = await getLatestDocument(projectId, type);
    const newVersion = latest ? latest.version + 1 : 1;

    const { data, error } = await supabase
        .from('client_documents')
        .insert({
            project_id: projectId,
            document_type: type,
            content,
            version: newVersion,
            status
        } as any)
        .select()
        .single();

    if (error) {
        console.error(`Error saving ${type}:`, error);
        throw error;
    }

    return data;
};

export const updateDocument = async (documentId: string, content: any): Promise<ClientDocument | null> => {
    const { data, error } = await supabase
        .from('client_documents')
        .update({
            content,
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', documentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating document:', error);
        throw error;
    }

    return data;
};
