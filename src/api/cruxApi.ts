/**
 * Chrome UX Report (CrUX) API - Client-side proxy via Edge Function
 * Métricas reais de experiência do usuário para benchmark competitivo no SiteScore
 *
 * A chamada real à CrUX API acontece no Edge Function `crux-benchmark`
 * para não expor API keys no client-side.
 */

import { supabase } from '@/integrations/supabase/client';

export interface CrUXMetrics {
    url: string;
    lcp: {
        p75: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
    };
    cls: {
        p75: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
    };
    inp: {
        p75: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
    };
    ttfb: {
        p75: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
    };
    formFactor: 'PHONE' | 'DESKTOP' | 'ALL_FORM_FACTORS' | string;
    collectionPeriod?: string;
    error?: string;
}

export interface BenchmarkResult {
    clientSite: CrUXMetrics;
    competitors: CrUXMetrics[];
    ranking: {
        lcp: number;
        cls: number;
        inp: number;
        overall: number;
    };
}

/**
 * Realiza benchmark do site do cliente contra concorrentes via Edge Function
 * (API key gerenciada server-side - não passa mais como parâmetro)
 */
export async function runCompetitiveBenchmark(
    clientUrl: string,
    competitorUrls: string[],
    formFactor: 'PHONE' | 'DESKTOP' = 'PHONE'
): Promise<BenchmarkResult> {
    const { data, error } = await supabase.functions.invoke('crux-benchmark', {
        body: { clientUrl, competitorUrls, formFactor }
    });

    if (error) throw error;
    return data as BenchmarkResult;
}

/**
 * Formata valor de métrica para exibição
 */
export function formatMetricValue(metric: 'lcp' | 'cls' | 'inp' | 'ttfb', value: number): string {
    switch (metric) {
        case 'lcp':
        case 'ttfb':
            return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
        case 'cls':
            return value.toFixed(2);
        case 'inp':
            return `${Math.round(value)}ms`;
        default:
            return String(value);
    }
}

/**
 * Retorna cor baseada na categoria
 */
export function getCategoryColor(category: 'FAST' | 'AVERAGE' | 'SLOW'): string {
    switch (category) {
        case 'FAST': return '#00C853';
        case 'AVERAGE': return '#FFAB00';
        case 'SLOW': return '#FF1744';
        default: return '#9E9E9E';
    }
}
