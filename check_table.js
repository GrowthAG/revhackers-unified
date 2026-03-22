import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.rpc('get_schema_info', { table_name: 'rei_projects' });
    
    // If we don't have an rpc, we can query information_schema directly or just insert a dummy with 'xyz_fake_status' to see the error constraint.
    const { error: insError } = await supabase.from('rei_responses').insert({
        project_id: null,
        context: 'public',
        source: 'diagnostic',
        total_score: 50,
        maturity_level: 'Test',
        maturity_percentage: 50,
        responses: {}
    });
    
    console.log("Insert Error:", insError);
}

main();
