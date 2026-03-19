import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function create() {
    const slug = 'mock-proposal-test';
    
    // Check if it already exists
    const { data: existing } = await supabase.from('proposals').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
        console.log('Exists:', slug);
        // reset status
        await supabase.from('proposals').update({ status: 'sent', crm_data: null }).eq('id', existing.id);
        console.log('Reset status for E2E test!');
        return;
    }

    // Insert dummy project just in case
    const { data: project } = await supabase.from('rei_projects').insert({
        company_name: 'Giulliano Corp Test',
        trade_name: 'Giulliano E2E',
        type: 'full',
        slug: 'test-corp'
    }).select().single();

    // Insert proposal
    const { data, error } = await supabase.from('proposals').insert({
        project_id: project?.id,
        slug: slug,
        client_name: 'Giulliano Alves Test',
        title: 'Proposta E2E - RevHackers',
        detailed_scope: '<h2>Escopo Detalhado</h2><p>Projeto de reestruturação E2E. Implementação do Deal Room.</p>',
        investment_total: 5000,
        status: 'sent',
        setup_fee: 1000,
        installment_count: 4,
        installment_value: 1000,
        payment_terms: 'Sinal de R$ 1000 no PIX, saldo em 4x no boleto.',
        crm_data: { project_duration: 3 }
    }).select().single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Created:', slug);
    }
}
create();
