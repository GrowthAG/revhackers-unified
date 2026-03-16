require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: project } = await supabase.from('rei_projects').select('site_analysis').eq('id', 'f8beb1da-5e87-4c80-b2a8-61edd6e34e02').single();
  console.log('Got site analysis, calling research-intelligence');
  const { data, error } = await supabase.functions.invoke('research-intelligence', {
      body: {
          type: 'market',
          segment: 'SaaS B2B',
          siteAnalysis: project.site_analysis
      }
  });
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
