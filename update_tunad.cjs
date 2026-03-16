require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const projectId = 'f8beb1da-5e87-4c80-b2a8-61edd6e34e02';
    const siteUrl = 'https://tunad.io/';

    console.log('1. Updating client_site in rei_projects...');
    const { error: urlError } = await supabase.from('rei_projects').update({ client_site: siteUrl }).eq('id', projectId);
    if (urlError) {
        console.error('Error updating client_site:', urlError);
        return;
    }

    console.log('2. Calling inspect-website (enriched mode) to analyze https://tunad.io/ ...');
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('inspect-website', {
        body: { url: siteUrl, enriched: true }
    });

    if (analysisError) {
        console.error('Error invoking inspect-website API:', analysisError);
        return;
    }
    
    if (!analysisData) {
        console.error('No data returned from inspect-website API.');
        return;
    }

    console.log('3. Saving intelligence data to site_analysis column...');
    const { error: updateError } = await supabase.from('rei_projects').update({
        site_analysis: analysisData
    }).eq('id', projectId);

    if (updateError) {
         console.error('Error updating site_analysis in DB:', updateError);
         return;
    }

    console.log('\\n--- Success! Tunad project is now fully enriched. ---');
    console.log('Preview of knowledge extracted:');
    console.log(JSON.stringify(analysisData, null, 2).substring(0, 800) + '...');
}

run();
