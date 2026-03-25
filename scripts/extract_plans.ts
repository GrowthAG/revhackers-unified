import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env in root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching strategic plans...");
    const { data: plans, error: plansError } = await supabase
        .from('strategic_plans')
        .select('*');
        
    if (plansError) {
        console.error("Error fetching plans:", plansError);
        process.exit(1);
    }
    
    console.log(`Found ${plans.length} plans.`);
    const output = plans.map(p => ({
        id: p.id,
        rei_project_id: p.rei_project_id,
        status: p.status,
        client_id: p.client_id,
        created_at: p.created_at,
        diagnostic_data: p.diagnostic_data
    }));

    fs.writeFileSync(path.resolve(__dirname, '../strategic_plans_dump.json'), JSON.stringify(output, null, 2));
    console.log("Dumped out to strategic_plans_dump.json");
    
    console.log("Fetching projects...");
    const { data: projects, error: projectsError } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, type');
        
    if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        process.exit(1);
    }
    fs.writeFileSync(path.resolve(__dirname, '../rei_projects_dump.json'), JSON.stringify(projects, null, 2));
    console.log("Dumped out to rei_projects_dump.json");
}

main();
