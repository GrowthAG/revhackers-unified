require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.functions.invoke('research-intelligence', {
      body: {
          type: 'market',
          segment: 'SaaS B2B'
      }
  });
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
