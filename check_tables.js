import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const t1 = await supabase.from('client_documents').select('id').limit(1);
  console.log('client_documents:', t1.error ? t1.error.message : 'EXISTS');
  
  const t2 = await supabase.from('strategic_plans').select('id').limit(1);
  console.log('strategic_plans:', t2.error ? t2.error.message : 'EXISTS');
  
  const t3 = await supabase.from('rei_responses').select('id').limit(1);
  console.log('rei_responses:', t3.error ? t3.error.message : 'EXISTS');
}
check();
