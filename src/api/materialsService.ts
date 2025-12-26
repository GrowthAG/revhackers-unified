import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Material =
    Database['public']['Tables']['materials']['Row'];

/**
 * LISTAGEM DE MATERIAIS
 * Usado na página /materiais ou /downloads
 */
export const getAllMaterials = async (): Promise<Material[]> => {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('published', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getAllMaterials]', error);
        throw error;
    }

    return data ?? [];
};

/**
 * DETALHE DO MATERIAL
 * Usa o final da material_url como "slug lógico"
 * Ex: /materiais/material-teste
 */
export const getMaterialBySlug = async (
    slug: string
): Promise<Material | null> => {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .ilike('material_url', `%/${slug}`)
        .eq('published', true)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('[getMaterialBySlug]', error);
        return null;
    }

    return data;
};
