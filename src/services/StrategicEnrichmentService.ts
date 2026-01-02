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
    fonte: string;
}

export interface Persona {
    nome: string;
    cargo: string;
    idade: string;
    empresa_tipo: string;
    dores: string[];
    motivacoes: string[];
    objecoes: string[];
    canais_preferidos: string[];
    gatilhos_compra: string[];
}

export interface PersonasData {
    personas: Persona[];
}

export interface MarketTrend {
    titulo: string;
    descricao: string;
}

export interface Competitor {
    nome: string;
    diferencial: string;
}

export interface MarketData {
    tendencias: MarketTrend[];
    concorrentes_referencia: Competitor[];
    oportunidades: string[];
    ameacas: string[];
    tamanho_mercado: string;
}

export interface StrategicEnrichmentResult {
    benchmark?: BenchmarkData | null;
    personas?: PersonasData | null;
    market?: MarketData | null;
    error?: string;
}

export type EnrichmentType = 'benchmark' | 'personas' | 'market' | 'all';

export class StrategicEnrichmentService {
    /**
     * Enrich strategic data using Perplexity AI
     * @param segment - Business segment (e.g., "SaaS B2B", "E-commerce", "Consultoria")
     * @param enrichmentType - Type of enrichment to perform
     * @param options - Additional context options
     */
    static async enrich(
        segment: string,
        enrichmentType: EnrichmentType = 'all',
        options?: {
            ticket?: string;
            objective?: string;
            isB2B?: boolean;
        }
    ): Promise<StrategicEnrichmentResult> {
        try {
            const { data, error } = await supabase.functions.invoke('enrich-strategic-data', {
                body: {
                    segment,
                    enrichmentType,
                    ticket: options?.ticket,
                    objective: options?.objective,
                    isB2B: options?.isB2B ?? true,
                }
            });

            if (error) {
                console.error('Strategic enrichment error:', error);
                return { error: error.message };
            }

            return data as StrategicEnrichmentResult;
        } catch (e: any) {
            console.error('Strategic enrichment failed:', e);
            return { error: e.message || 'Unknown error' };
        }
    }

    /**
     * Get only market benchmarks
     */
    static async getBenchmark(segment: string, ticket?: string, isB2B?: boolean): Promise<BenchmarkData | null> {
        const result = await this.enrich(segment, 'benchmark', { ticket, isB2B });
        return result.benchmark || null;
    }

    /**
     * Get only buyer personas
     */
    static async getPersonas(segment: string, ticket?: string, objective?: string): Promise<PersonasData | null> {
        const result = await this.enrich(segment, 'personas', { ticket, objective });
        return result.personas || null;
    }

    /**
     * Get only market analysis
     */
    static async getMarketAnalysis(segment: string): Promise<MarketData | null> {
        const result = await this.enrich(segment, 'market');
        return result.market || null;
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
        }
    ): Promise<StrategicEnrichmentResult> {
        return this.enrich(segment, 'all', options);
    }
}
