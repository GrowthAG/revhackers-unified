import { supabase } from '@/integrations/supabase/client';

export interface BenchmarkData {
    cac_medio: string;
    taxa_conversao: string;
    ciclo_vendas: string;
    ltv_cac_ratio: string;
    ferramentas_principais: {
        crm: string[];
        automacao: string[];
        ads: string[];
    };
    comparativo_mercado?: string;
    fonte?: string;
}

export interface Persona {
    nome: string;
    cargo: string;
    idade?: string;
    genero?: string;
    bio_curta?: string;
    empresa_tipo?: string;
    dores_principais: string[];
    ganhos_desejados: string[];
    objecoes_compra: string[];
    gatilhos_mentais: string[];
    canais_favoritos: string[];
    pitch_elevador?: string;
    foto_url?: string;
}

export interface PersonasData {
    personas: Persona[];
}

export interface MarketTrend {
    titulo: string;
    impacto?: string;
    descricao: string;
}

export interface Competitor {
    nome: string;
    url?: string;
    pontos_fortes?: string;
    pontos_fracos?: string;
    diferencial?: string;
    posicionamento?: string;
}

export interface MarketData {
    tendencias_2025: MarketTrend[];
    concorrentes_benchmark: Competitor[];
    analise_swot_rapida?: {
        oportunidades: string[];
        ameacas: string[];
    };
    tam_sam_som?: {
        tam: string;
        sam: string;
        som: string;
    };
}

export interface StrategicEnrichmentResult {
    benchmark?: BenchmarkData | null;
    personas?: PersonasData | null;
    market?: MarketData | null;
    error?: string;
    isDeepResearch?: boolean;
}

export type EnrichmentType = 'benchmark' | 'personas' | 'market' | 'all';

export class StrategicEnrichmentService {
    /**
     * Enrich strategic data using Perplexity AI (via Edge Function)
     */
    static async enrich(
        segment: string,
        enrichmentType: EnrichmentType = 'all',
        options?: {
            ticket?: string;
            objective?: string;
            isB2B?: boolean;
            rei_responses?: any;
            competitors?: { nome: string, url?: string }[];
            siteAnalysis?: any;
            projectType?: string;
        }
    ): Promise<StrategicEnrichmentResult> {
        try {
            console.log('Invoking enrich-strategic-data with:', { segment, type: enrichmentType });

            const { data, error } = await supabase.functions.invoke('enrich-strategic-data', {
                body: {
                    segment,
                    enrichmentType,
                    ticket: options?.ticket,
                    objective: options?.objective,
                    isB2B: options?.isB2B ?? true,
                    rei_responses: options?.rei_responses,
                    competitors: options?.competitors,
                    siteAnalysis: options?.siteAnalysis,
                    projectType: options?.projectType
                }
            });

            if (error) {
                console.error('Strategic enrichment error:', error);
                return { error: error.message };
            }

            // Edge Function returns { result: { benchmark, personas, market } }
            // Handle both wrapped and flat response formats
            const enrichmentData = data?.result || data;

            // If the API returned an error message inside the data
            if (enrichmentData?.error) {
                console.warn('Enrichment returned error:', enrichmentData.error);
                return { error: enrichmentData.error };
            }

            return enrichmentData as StrategicEnrichmentResult;
        } catch (e: any) {
            console.error('Strategic enrichment failed:', e);
            return { error: e.message || 'Unknown error' };
        }
    }

    /**
     * Get all enrichment data at once
     */
    static async getFullEnrichment(
        segment: string,
        options?: {
            ticket?: string;
            objective?: string;
            isB2B?: boolean;
            rei_responses?: any;
            competitors?: { nome: string, url?: string }[];
            siteAnalysis?: any;
            projectType?: string;
        }
    ): Promise<StrategicEnrichmentResult> {
        return this.enrich(segment, 'all', options);
    }

    /**
     * Trigger Deep Research (Tavily + Firecrawl)
     */
    static async researchIntelligence(
        type: EnrichmentType,
        segment: string,
        options?: {
            competitors?: string[];
            objective?: string;
            context?: any;
            siteAnalysis?: any;
        }
    ): Promise<any> {
        try {
            const { data, error } = await supabase.functions.invoke('research-intelligence', {
                body: {
                    type,
                    segment,
                    competitors: options?.competitors,
                    objective: options?.objective,
                    context: options?.context,
                    siteAnalysis: options?.siteAnalysis
                }
            });

            if (error) throw error;
            return data;
        } catch (e: any) {
            console.error('Deep research failed:', e);
            throw e;
        }
    }
}
