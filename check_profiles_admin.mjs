import * as fs from 'fs';
import * as path from 'path';

async function run() {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
    let serviceRoleKey = '';
    for (const line of envContent.split('\n')) {
        if (line.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=') || line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
            serviceRoleKey = line.split('=')[1].trim();
            break;
        }
    }

    if (!serviceRoleKey) {
        console.log("No service role key found in .env");
        return;
    }

    const url = 'https://eqspbruarsdybpfeijnf.supabase.co';

    try {
        const res = await fetch(`${url}/rest/v1/profiles?select=*`, {
            headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` }
        });
        const profiles = await res.json();
        console.log("Profiles count:", profiles.length);
        console.log(profiles);
    } catch (e) {
        console.error(e);
    }
}
run();
