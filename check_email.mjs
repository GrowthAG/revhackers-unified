const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const projectId = '58361bde-d173-4412-af00-a786cfe39f25';

    try {
        const res = await fetch(`${url}/rest/v1/rei_projects?id=eq.${projectId}&select=client_email,client_name,client_company`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const proj = await res.json();
        console.log("rei_projects:", proj);

    } catch (e) {
        console.error(e);
    }
}
run();
