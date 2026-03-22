import { supabase } from '@/integrations/supabase/client';

export interface DocumentSignature {
    id: string;
    project_id: string;
    reference_type: 'proposal' | 'strategic_plan' | 'agent_document';
    reference_id: string;
    signer_name: string;
    signer_cpf_cnpj: string;
    signer_email: string;
    signer_role: string;
    signed_at: string;
    signer_ip: string;
    user_agent: string;
    document_hash: string;
    certificate_url?: string;
    created_at: string;
}

/**
 * Recupera o registro da assinatura pelo ID da entidade (Proposta, Plano, etc)
 */
export async function getSignatureByReference(referenceId: string): Promise<DocumentSignature | null> {
    const { data, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('reference_id', referenceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar assinatura eletrônica', error);
        return null; // Don't throw to avoid breaking UI, just return null
    }

    return data as DocumentSignature;
}

/**
 * Recupera o registro da assinatura pelo HASH (útil para auditoria externa)
 */
export async function getSignatureByHash(hash: string): Promise<DocumentSignature | null> {
    const { data, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('document_hash', hash)
        .single();

    if (error) {
        console.error('Erro ao validar assinatura', error);
        return null;
    }

    return data as DocumentSignature;
}
