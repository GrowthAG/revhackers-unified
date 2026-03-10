const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const projectId = '58361bde-d173-4412-af00-a786cfe39f25';

    // Update the project type to crm_ops!
    const updateRes = await fetch(`${url}/rest/v1/rei_projects?id=eq.${projectId}`, {
        method: 'PATCH',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'crm_ops' })
    });
    console.log("Update Type:", updateRes.status);

    // Check if any plan exists
    const res = await fetch(`${url}/rest/v1/strategic_plans?rei_project_id=eq.${projectId}`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const data = await res.json();
    console.log("Plans generated:", data.length);
    if (data.length > 0) {
        console.log("Plan ID:", data[0].id);
    }
}
run();
