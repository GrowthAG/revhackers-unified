import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testDelete() {
  const { data: projects } = await supabase.from('rei_projects').select('id, client_name').limit(5);
  console.log("Projects:", projects);
  if (!projects || projects.length === 0) return;
  // Let's just try to delete the first one directly to see the FK constraint
  const { error } = await supabase.from('rei_projects').delete().eq('id', projects[0].id);
  console.log("Direct delete error:", JSON.stringify(error, null, 2));
}

testDelete();
