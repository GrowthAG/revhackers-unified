import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_DB_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const sup = createClient(url, key);

async function extract() {
  const { data: opps } = await sup.from('opportunities').select('*').or('client_company.ilike.%obras%,client_name.ilike.%obras%,trade_name.ilike.%obras%');
  if (opps && opps.length > 0) {
     console.log("=== OPPORTUNITIES ===");
     console.log(JSON.stringify(opps, null, 2));
  } else {
     console.log("=== NADA ENCONTRADO EM OPPORTUNITIES ===");
  }
}
extract();
