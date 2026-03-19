import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function prepare() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'giulliano@revhackers.com.br',
        password: 'RevHackers@321#'
    });
    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }
    console.log('Logged in successfully bypass RLS.');

    const slug = 'e2e-test-live';
    
    // Find a project
    let { data: project } = await supabase.from('rei_projects').select('id').limit(1).single();
    let projectId = project?.id;

    if (!projectId) {
        const { data: newProj } = await supabase.from('rei_projects').insert({
            company_name: 'Test Corp E2E',
            trade_name: 'E2E Corp',
            type: 'full',
            slug: 'e2e-corp'
        }).select().single();
        projectId = newProj?.id;
    }

    // Upsert proposal
    const { data: existing } = await supabase.from('proposals').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
        await supabase.from('proposals').update({ status: 'sent', crm_data: null }).eq('slug', slug);
        console.log('Reset existing proposal:', slug);
    } else {
        const { error } = await supabase.from('proposals').insert({
            slug: slug,
            client_name: 'Cliente E2E Teste',
            title: 'Proposta de Teste E2E Automática',
            detailed_scope: '<p>Este é o escopo técnico protegido.</p>',
            investment_total: 15000,
            status: 'sent',
            setup_fee: 5000,
            installment_count: 5,
            installment_value: 2000,
            payment_terms: 'Teste E2E de Assinatura Universal',
            crm_data: {}
        });
        if (error) console.error('Insert error:', error.message);
        else console.log('Proposal created:', slug);
    }
}
prepare();
