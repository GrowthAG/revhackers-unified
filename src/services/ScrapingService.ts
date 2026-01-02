
import { supabase } from '@/lib/supabase';

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
            console.warn('Backend/Edge Function not reachable or failed. Falling back to simulation.', e);
        }

        // 2. Fallback Simulation (For Demo/Dev purposes without live backend)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate scraping delay

        // Extract simplified name from URL if possible
        const urlParts = url.split('/in/');
        const slug = urlParts.length > 1 ? urlParts[1].split('/')[0] : 'founder-exemplo';
        const name = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

        return {
            name: name || "Nome Detectado",
            headline: "CEO & Founder | Estratégia de Growth B2B",
            about: "Empreendedor serial com foco em escalar operações de vendas complexas. Buscando novas tecnologias para otimizar processos de Revenue Operations.",
            skills: ["Liderança", "Vendas B2B", "Marketing Estratégico", "Gestão de Produtos"],
            experience: [
                {
                    role: "Founder",
                    company: "Sua Empresa Atual",
                    duration: "Jan 2020 - Presente"
                },
                {
                    role: "Head of Sales",
                    company: "Tech Corp Anterior",
                    duration: "2015 - 2019"
                }
            ]
        };
    }
}
