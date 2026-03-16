require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('rei_projects').select('site_analysis').eq('id', 'f8beb1da-5e87-4c80-b2a8-61edd6e34e02').single();
  console.log(JSON.stringify(data.site_analysis.ai_analysis.tech_stack, null, 2));
  console.log(JSON.stringify(data.site_analysis.ai_analysis.technical_scores, null, 2));
}
run();
