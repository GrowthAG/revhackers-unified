import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

console.log("URL exists:", !!process.env.VITE_SUPABASE_URL);

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('rei_projects').select('id, client_name, client_company, type');
  if (error) console.error("Error:", error);
  console.log("DATA:", data);
}
run();
