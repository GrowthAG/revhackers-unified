
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type CaseStudy = Database['public']['Tables']['cases']['Row'];

const CASE_OVERRIDES: Record<string, { logo?: string; scale?: number }> = {
    'Heineken': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694f38836caf495cf06a30c4.jpg',
        scale: 2.4 // Aggressively increased
    },
    'ENICS': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695996b8748303e24fe82be8.png',
        scale: 1.5
    },
    'TOEFL Junior Brasil': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6959970205b5117729df4a50.png',
        scale: 1.5
    },
    'TOEFL': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6959970205b5117729df4a50.png',
        scale: 1.5
    },
    'Tikpag': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695997877483037113e88497.png',
        scale: 2.8 // Maximized visibility
    },
    'Agence MR': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695997bd3ccdd6417ab25199.png',
        scale: 1.5
    },
    'Funnels': {
        scale: 1.5 // Standardizing size
    }
};

const applyOverrides = (c: CaseStudy): CaseStudy & { logoScale?: number } => {
    const title = c.client_name || c.title || '';
    // Check exact title or partial match for flexibility
    const overrideKey = Object.keys(CASE_OVERRIDES).find(key => title.includes(key)) || title;
    const override = CASE_OVERRIDES[overrideKey];

    if (override) {
        return {
            ...c,
            client_logo: override.logo || c.client_logo,
            // @ts-ignore - Injecting runtime property for frontend use
            logoScale: override.scale || 1.0
        };
    }
    return c;
};

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

    return (data || []).map(applyOverrides);
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

    return data ? applyOverrides(data) : null;
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

    return (data || []).map(applyOverrides);
};
