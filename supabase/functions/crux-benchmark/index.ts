import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================
// CrUX API
// ============================================================

const CRUX_API_ENDPOINT = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';

interface CrUXMetrics {
    url: string;
    lcp: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
    cls: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
    inp: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
    ttfb: { p75: number; category: 'FAST' | 'AVERAGE' | 'SLOW' };
    formFactor: string;
    collectionPeriod?: string;
    error?: string;
}

interface BenchmarkResult {
    clientSite: CrUXMetrics;
    competitors: CrUXMetrics[];
    ranking: {
        lcp: number;
        cls: number;
        inp: number;
        overall: number;
    };
}

async function getCrUXMetrics(
    url: string,
    apiKey: string,
    formFactor: string = 'PHONE'
): Promise<CrUXMetrics> {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const origin = urlObj.origin;

        const response = await fetch(`${CRUX_API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        const extractMetric = (metricData: any) => {
            const histogram = metricData?.histogram || [];
            const p75 = metricData?.percentiles?.p75 || 0;

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
        console.error('CrUX API Error for', url, ':', error);
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

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { clientUrl, competitorUrls, formFactor = 'PHONE' } = await req.json();

        if (!clientUrl || !competitorUrls) {
            throw new Error('Missing required fields: clientUrl, competitorUrls');
        }

        const apiKey = Deno.env.get('PSI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
        if (!apiKey) {
            throw new Error('PSI_API_KEY or GOOGLE_API_KEY not configured');
        }

        console.log(`[crux-benchmark] Client: ${clientUrl}, Competitors: ${competitorUrls.length}, formFactor: ${formFactor}`);

        // Fetch client metrics
        const clientMetrics = await getCrUXMetrics(clientUrl, apiKey, formFactor);

        // Fetch competitor metrics in parallel
        const competitorMetrics = await Promise.all(
            competitorUrls.map((url: string) => getCrUXMetrics(url, apiKey, formFactor))
        );

        // Calculate ranking
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

        const result: BenchmarkResult = {
            clientSite: clientMetrics,
            competitors: competitorMetrics,
            ranking: {
                lcp: lcpRank,
                cls: clsRank,
                inp: inpRank,
                overall: overallRank
            }
        };

        console.log(`[crux-benchmark] Success: overall ranking ${overallRank}/${allSites.length}`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`[crux-benchmark] Error:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
