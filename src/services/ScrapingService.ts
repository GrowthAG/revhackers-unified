
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedProfile {
    name: string;
    headline: string;
    about: string;
    skills: string[];
    experience: {
        role: string;
        company: string;
        duration: string;
    }[];
}

export class ScrapingService {
    static async scrapeProfile(url: string): Promise<ScrapedProfile> {
        // 1. Try to call the Edge Function
        try {
            const { data, error } = await supabase.functions.invoke('scrape-profile', {
                body: { url }
            });

            if (error) throw error;
            if (data) return data;
        } catch (e) {
            console.error('Scraping Edge Function falhou:', e);
            throw e;
        }
    }
}

