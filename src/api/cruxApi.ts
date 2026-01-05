/**
 * Chrome UX Report (CrUX) API
 * Extrai métricas reais de experiência do usuário para qualquer URL
 * Usado para benchmark competitivo no SiteScore
 */

const CRUX_API_ENDPOINT = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';

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
    formFactor: 'PHONE' | 'DESKTOP' | 'ALL_FORM_FACTORS';
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
 * Extrai métricas CrUX para uma URL específica
 */
export async function getCrUXMetrics(
    url: string,
    apiKey: string,
    formFactor: 'PHONE' | 'DESKTOP' | 'ALL_FORM_FACTORS' = 'PHONE'
): Promise<CrUXMetrics> {
    try {
        // Normaliza a URL para domínio (CrUX funciona melhor com origin)
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const origin = urlObj.origin;

        const response = await fetch(`${CRUX_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                origin: origin,
                formFactor: formFactor,
                metrics: [
                    'largest_contentful_paint',
                    'cumulative_layout_shift',
                    'interaction_to_next_paint',
                    'experimental_time_to_first_byte'
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Erro comum: site não tem dados suficientes no CrUX
            if (response.status === 404) {
                return {
                    url: origin,
                    lcp: { p75: 0, category: 'SLOW' },
                    cls: { p75: 0, category: 'SLOW' },
                    inp: { p75: 0, category: 'SLOW' },
                    ttfb: { p75: 0, category: 'SLOW' },
                    formFactor,
                    error: 'Sem dados CrUX (site com pouco tráfego Chrome)'
                };
            }

            throw new Error(errorData.error?.message || 'Erro ao consultar CrUX API');
        }

        const data = await response.json();
        const record = data.record;
        const metrics = record?.metrics || {};

        // Extrai percentil 75 de cada métrica
        const extractMetric = (metricData: any) => {
            const histogram = metricData?.histogram || [];
            const p75 = metricData?.percentiles?.p75 || 0;

            // Determina categoria baseada nos thresholds do Google
            let category: 'FAST' | 'AVERAGE' | 'SLOW' = 'SLOW';
            if (histogram.length >= 3) {
                const goodDensity = histogram[0]?.density || 0;
                const needsImprovementDensity = histogram[1]?.density || 0;
                if (goodDensity > 0.75) category = 'FAST';
                else if (goodDensity + needsImprovementDensity > 0.75) category = 'AVERAGE';
            }

            return { p75, category };
        };

        return {
            url: origin,
            lcp: extractMetric(metrics.largest_contentful_paint),
            cls: extractMetric(metrics.cumulative_layout_shift),
            inp: extractMetric(metrics.interaction_to_next_paint),
            ttfb: extractMetric(metrics.experimental_time_to_first_byte),
            formFactor,
            collectionPeriod: record?.collectionPeriod?.lastDate || undefined
        };

    } catch (error) {
        console.error('CrUX API Error:', error);
        return {
            url,
            lcp: { p75: 0, category: 'SLOW' },
            cls: { p75: 0, category: 'SLOW' },
            inp: { p75: 0, category: 'SLOW' },
            ttfb: { p75: 0, category: 'SLOW' },
            formFactor,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
    }
}

/**
 * Realiza benchmark do site do cliente contra concorrentes
 */
export async function runCompetitiveBenchmark(
    clientUrl: string,
    competitorUrls: string[],
    apiKey: string,
    formFactor: 'PHONE' | 'DESKTOP' = 'PHONE'
): Promise<BenchmarkResult> {
    // Busca métricas do cliente
    const clientMetrics = await getCrUXMetrics(clientUrl, apiKey, formFactor);

    // Busca métricas de todos os concorrentes em paralelo
    const competitorMetrics = await Promise.all(
        competitorUrls.map(url => getCrUXMetrics(url, apiKey, formFactor))
    );

    // Calcula ranking (1 = melhor)
    const allSites = [clientMetrics, ...competitorMetrics];

    const calculateRanking = (metric: 'lcp' | 'cls' | 'inp') => {
        const sorted = [...allSites]
            .filter(s => !s.error && s[metric].p75 > 0)
            .sort((a, b) => a[metric].p75 - b[metric].p75);

        const clientIndex = sorted.findIndex(s => s.url === clientMetrics.url);
        return clientIndex === -1 ? allSites.length : clientIndex + 1;
    };

    const lcpRank = calculateRanking('lcp');
    const clsRank = calculateRanking('cls');
    const inpRank = calculateRanking('inp');
    const overallRank = Math.round((lcpRank + clsRank + inpRank) / 3);

    return {
        clientSite: clientMetrics,
        competitors: competitorMetrics,
        ranking: {
            lcp: lcpRank,
            cls: clsRank,
            inp: inpRank,
            overall: overallRank
        }
    };
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
        case 'FAST': return '#00C853'; // Verde
        case 'AVERAGE': return '#FFAB00'; // Amarelo
        case 'SLOW': return '#FF1744'; // Vermelho
        default: return '#9E9E9E';
    }
}
