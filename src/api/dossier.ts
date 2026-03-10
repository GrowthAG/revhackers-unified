import { supabase } from '@/integrations/supabase/client';

export interface DossierResult {
    success: boolean;
    data?: {
        title: string;
        description: string;
        h1: string[];
        h2: string[];
        hasPixel: boolean;
        hasGTM: boolean;
        hasRD: boolean;
        hasHubspot: boolean;
        hasActiveCampaign: boolean;
        hasWordPress: boolean;
    };
    ai_analysis?: {
        proposta_de_valor_clara: boolean;
        resumo_proposta: string;
        problema_identificado: string;
        sugestao_quebra_gelo: string;
    };
    error?: string;
}

export const generateDossier = async (url: string): Promise<DossierResult> => {
    try {
        const { data, error } = await supabase.functions.invoke('inspect-website', {
            body: { url }
        });

        if (error) {
            console.error('Error invoking inspect-website edge function:', error);
            return { success: false, error: error.message };
        }

        return data as DossierResult;
    } catch (err: any) {
        console.error('Failed to generate dossier:', err);
        return { success: false, error: err.message || 'Unknown error occurred' };
    }
};
