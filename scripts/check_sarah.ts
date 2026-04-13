import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function run() {
  const { data, error } = await supabase.from('rei_projects').select('id, name').ilike('name', '%Sarah%');
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}
run();
