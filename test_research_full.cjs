require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
(async function run() {
  console.log('Fetching project f8beb1da-5e87-4c80-b2a8-61edd6e34e02');
  const { data: project, error: pError } = await supabase.from('rei_projects').select('site_analysis').eq('id', 'f8beb1da-5e87-4c80-b2a8-61edd6e34e02').single();
  if (pError) {
      console.log('pError:', pError);
      return;
  }
  console.log('Got site analysis, calling research-intelligence');
  
  // Format exactly what StrategicPlanGenerator does:
  const type = 'market';
  const segment = 'SaaS B2B';
  const objective = 'Crescimento';
  const competitors = []; // none for this test to keep it simple, or mock them
  
  const { data, error } = await supabase.functions.invoke('research-intelligence', {
      body: {
          type,
          segment,
          objective,
          competitors,
          siteAnalysis: project.site_analysis
      }
  });

  console.log('Error:', error);
  console.log('Data:', data);
})();
