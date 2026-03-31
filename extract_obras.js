import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_DB_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing supabase credentials from .env");
    process.exit(1);
}

const sup = createClient(url, key);

async function extract() {
  const { data: opps } = await sup.from('opportunities').select('*').ilike('trade_name', '%Obras%');
  if (opps && opps.length > 0) {
     console.log("=== ENCONTRADO EM OPPORTUNITIES ===");
     console.log(JSON.stringify(opps[0], null, 2));
  } else {
     const { data: projs } = await sup.from('rei_projects').select('*').ilike('trade_name', '%Obras%');
     if (projs && projs.length > 0) {
         console.log("=== ENCONTRADO EM REI_PROJECTS ===");
         console.log(JSON.stringify(projs[0], null, 2));
     } else {
         console.log("=== NADA ENCONTRADO ===");
     }
  }
}
extract();
