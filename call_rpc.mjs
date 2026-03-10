const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const projectId = '58361bde-d173-4412-af00-a786cfe39f25';

    try {
        const res = await fetch(`${url}/rest/v1/rpc/generate_strategic_plan`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_rei_project_id: projectId })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("RPC failed:", errorText);
        } else {
            const data = await res.json();
            console.log("Success! RPC generated plan ID:", data);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
