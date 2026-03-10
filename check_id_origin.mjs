const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const idStr = '09f0a5d1-b5a8-41f9-9322-55fc3a947c20';
    console.log("Searching for ID: " + idStr);

    try {
        const res = await fetch(`${url}/rest/v1/rei_projects?id=eq.${idStr}`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const data = await res.json();
        console.log("rei_projects:", data);

        const res2 = await fetch(`${url}/rest/v1/strategic_plans?id=eq.${idStr}`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const data2 = await res2.json();
        console.log("strategic_plans:", data2);

    } catch (e) {
        console.error(e);
    }
}
run();
