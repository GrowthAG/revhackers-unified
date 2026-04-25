import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqspbruarsdybpfeijnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const payload = {
        material_name: 'Test Material',
        material_type: 'framework',
        link_material: 'https://example.com',
        material_url: 'https://example.com',
        slug: 'test-material-' + Date.now(),
        description: 'Test description',
        published: false,
        is_active: true,
    };

    console.log('Inserting payload:', payload);
    const { data, error } = await supabase.from('materials').insert(payload).select();
    
    if (error) {
        console.error('Insert error:', error);
    } else {
        console.log('Insert success:', data);
        // Clean up
        await supabase.from('materials').delete().eq('id', data[0].id);
    }
}

testInsert();
