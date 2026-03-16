require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTunad() {
  console.log('Fetching Tunad projects...');
  const { data, error } = await supabase
    .from('rei_projects')
    .select('id, client_name, client_company, client_site, site_analysis')
    .ilike('client_company', '%tunad%')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No Tunad projects found.');
    return;
  }

  console.log(`Found ${data.length} projects.`);
  data.forEach((p, i) => {
    console.log(`\n--- Project ${i + 1} ---`);
    console.log('ID:', p.id);
    console.log('Client Name:', p.client_name);
    console.log('Company:', p.client_company);
    console.log('Site URL:', p.client_site);
    console.log('Site Analysis exists:', !!p.site_analysis);
    if (p.site_analysis) {
        console.log('Site Analysis Preview (first 500 chars):', JSON.stringify(p.site_analysis).substring(0, 500));
    }
  });
}

checkTunad();
