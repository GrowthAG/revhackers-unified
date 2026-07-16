
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type CaseStudy = Database['public']['Tables']['cases']['Row'];

export const getAllCases = async (): Promise<CaseStudy[]> => {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching cases:', error);
        throw error;
    }

    return data || [];
};

export const getCaseBySlug = async (slug: string): Promise<CaseStudy | null> => {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error) {
        console.error('Error fetching case by slug:', error);
        return null;
    }

    return data;
};

export const getFeaturedCases = async (): Promise<CaseStudy[]> => {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .limit(3)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching featured cases:', error);
        return []; // Fail gracefully
    }

    return data || [];
};
