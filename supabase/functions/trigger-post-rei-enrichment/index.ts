// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Trigger Post-REI Enrichment
 * 
 * Called automatically after REI 360 is submitted.
 * Orchestrates:
 * 1. Fetch REI data
 * 2. Enrich with Perplexity (benchmark, personas, market)
 * 3. Create draft Strategic Plan
 * 4. Create draft Success Plan
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { projectId, reiType, source, kickoffData } = await req.json();

        if (!projectId) {
            throw new Error('projectId is required');
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log(`🚀 Starting enrichment for project: ${projectId} (Source: ${source || 'REI'})`);

        // ========================================
        // STEP 1: Fetch REI Data (Base Context)
        // ========================================
        const { data: reiData, error: reiError } = await supabaseClient
            .from('rei_responses')
            .select('*')
            .eq('rei_project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // If triggered from Kickoff, we might not have REI data or we want to overwrite it
        // But usually REI exists. If not, we proceed with partial data.
        const formData = reiData?.form_data || {};

        // MERGE DATA: Kickoff insights take precedence over REI form
        if (source === 'kickoff' && kickoffData) {
            console.log('🔄 Merging Kickoff Insights into Strategy Context...');
            if (kickoffData.contexto_cliente) formData.contexto = kickoffData.contexto_cliente;
            if (kickoffData.desafios_especificos) formData.desafios = kickoffData.desafios_especificos;
            if (kickoffData.segmento_mercado) formData.segmento = kickoffData.segmento_mercado;
            // Store competitors for scraper
            formData.concorrentes = kickoffData.concorrentes_mencionados || [];
        }

        const { data: projectData } = await supabaseClient
            .from('rei_projects')
            .select('*, clients(*)')
            .eq('id', projectId)
            .single();

        const segment = formData.segmento || projectData?.industry || 'B2B SaaS';
        const ticketMedio = formData.ticketMedio || 'médio';
        const desafios = formData.desafios || [];
        const metaCrescimento = formData.metaCrescimento || '20%';

        console.log(`📊 Enriching for segment: ${segment}`);

        // ========================================
        // STEP 2: Trigger Enrichment (Perplexity)
        // ========================================
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Enrich Benchmark
        const benchmarkRes = await fetch(`${SUPABASE_URL}/functions/v1/enrich-strategic-data`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                segment,
                ticket: ticketMedio,
                isB2B: true,
                enrichmentType: 'benchmark',
                rei_responses: formData,
            }),
        });

        let benchmark = null;
        if (benchmarkRes.ok) {
            const benchmarkData = await benchmarkRes.json();
            benchmark = benchmarkData.result;
            console.log('✅ Benchmark enriched');
        }

        // Enrich Personas
        const personasRes = await fetch(`${SUPABASE_URL}/functions/v1/enrich-strategic-data`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                segment,
                ticket: ticketMedio,
                objective: desafios.join(', '),
                enrichmentType: 'personas',
                rei_responses: formData,
            }),
        });

        let personas = null;
        if (personasRes.ok) {
            const personasData = await personasRes.json();
            personas = personasData.result;
            console.log('✅ Personas enriched');
        }

        // Enrich Market
        const marketRes = await fetch(`${SUPABASE_URL}/functions/v1/enrich-strategic-data`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                segment,
                enrichmentType: 'market',
                rei_responses: formData,
            }),
        });

        let market = null;
        if (marketRes.ok) {
            const marketData = await marketRes.json();
            market = marketData.result;
            console.log('✅ Market enriched');
        }

        // ========================================
        // STEP 3: Create/Update Strategic Plan Draft
        // ========================================
        const strategicPlanData = {
            project_id: projectId,
            client_id: projectData?.client_id,
            status: 'draft',

            // REI Data
            rei_summary: {
                segment,
                ticket: ticketMedio,
                desafios,
                meta_crescimento: metaCrescimento,
                canais: formData.canaisAquisicao || [],
                crm: formData.crm || 'Não definido',
            },

            // Enriched Data
            benchmark_data: benchmark,
            personas_data: personas,
            market_data: market,

            // Generated OKRs (will be refined by analyst)
            okrs: generateOKRs(formData, benchmark),

            // Timeline (4 cycles - Donna Webber)
            timeline: generate4CycleTimeline(formData),

            // Metadata
            generated_at: new Date().toISOString(),
            enrichment_status: 'completed',
            version: 1,
        };

        // Check if plan exists
        const { data: existingPlan } = await supabaseClient
            .from('strategic_plans')
            .select('id, version')
            .eq('project_id', projectId)
            .single();

        if (existingPlan) {
            // Update existing
            await supabaseClient
                .from('strategic_plans')
                .update({
                    ...strategicPlanData,
                    version: (existingPlan.version || 0) + 1,
                })
                .eq('id', existingPlan.id);
            console.log('✅ Updated existing Strategic Plan');
        } else {
            // Create new
            await supabaseClient
                .from('strategic_plans')
                .insert(strategicPlanData);
            console.log('✅ Created new Strategic Plan draft');
        }

        // ========================================
        // STEP 4: Update Project Status
        // ========================================
        await supabaseClient
            .from('rei_projects')
            .update({
                status: 'enriched',
                enrichment_completed_at: new Date().toISOString(),
                diagnostic_data: {
                    ...projectData?.diagnostic_data,
                    benchmark,
                    personas,
                    market,
                    auto_enriched: true,
                    enriched_at: new Date().toISOString(),
                },
            })
            .eq('id', projectId);

        console.log('✅ Post-REI enrichment completed!');

        return new Response(JSON.stringify({
            success: true,
            enriched: {
                benchmark: !!benchmark,
                personas: !!personas,
                market: !!market,
            },
            strategicPlanCreated: true,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Post-REI enrichment error:', error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

// Helper: Generate OKRs from REI data
function generateOKRs(formData: any, benchmark: any) {
    const meta = formData.metaCrescimento || '20%';
    const desafios = formData.desafios || [];

    return [
        {
            objective: `Aumentar receita em ${meta} nos próximos 6 meses`,
            keyResults: [
                { metric: 'MRR', target: '+' + meta, current: '0%' },
                { metric: 'Taxa de Conversão', target: '+25%', current: '0%' },
                { metric: 'CAC', target: '-15%', current: '0%' },
            ],
        },
        {
            objective: 'Escalar aquisição de clientes qualificados',
            keyResults: [
                { metric: 'Leads Qualificados/mês', target: '+50%', current: '0%' },
                { metric: 'SQL para Oportunidade', target: '40%', current: '0%' },
                { metric: 'Ciclo de Vendas', target: '-20%', current: '0%' },
            ],
        },
    ];
}

// Helper: Generate 4-cycle timeline (Donna Webber methodology)
function generate4CycleTimeline(formData: any) {
    return [
        {
            cycle: 1,
            name: 'Foundation',
            weeks: '1-3',
            focus: 'Setup & Discovery',
            deliverables: [
                'Diagnóstico completo',
                'Setup CRM/Automações',
                'ICP & Personas finalizados',
                'Playbook inicial',
            ],
            status: 'pending',
        },
        {
            cycle: 2,
            name: 'Activation',
            weeks: '4-6',
            focus: 'Primeiras campanhas',
            deliverables: [
                'Funis de aquisição ativos',
                'Conteúdo de conversão',
                'Automações de nurturing',
                'Dashboard de métricas',
            ],
            status: 'pending',
        },
        {
            cycle: 3,
            name: 'Optimization',
            weeks: '7-9',
            focus: 'Otimização baseada em dados',
            deliverables: [
                'A/B tests implementados',
                'Funis otimizados',
                'Playbook refinado',
                'Cadências ajustadas',
            ],
            status: 'pending',
        },
        {
            cycle: 4,
            name: 'Scale',
            weeks: '10-12',
            focus: 'Escala e autonomia',
            deliverables: [
                'Processos documentados',
                'Equipe treinada',
                'Métricas de sucesso atingidas',
                'Transição para ongoing',
            ],
            status: 'pending',
        },
    ];
}
