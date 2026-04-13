import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Material = Database['public']['Tables']['materials']['Row'];

/**
 * LISTAGEM DE MATERIAIS (Supabase)
 */
export const getAllMaterials = async (): Promise<Material[]> => {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

    if (error) {
        console.error('[getAllMaterials] Supabase error:', error);
        return [];
    }

    return data || [];
};

/**
 * DETALHE DO MATERIAL POR SLUG
 */
export const getMaterialBySlug = async (slug: string): Promise<Material | null> => {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error) {
        console.error('[getMaterialBySlug] Supabase error:', error);
        return null;
    }

    return data;
};

/**
 * MATERIAIS EM DESTAQUE
 */
export const getFeaturedMaterials = async (): Promise<Material[]> => {
    const { data, error } = await (supabase
        .from('materials') as any)
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .limit(3)
        .order('date', { ascending: false });

    if (error) {
        console.error('[getFeaturedMaterials] Supabase error:', error);
        return [];
    }

    return data || [];
};
