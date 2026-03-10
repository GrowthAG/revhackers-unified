const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    try {
        const res = await fetch(`${url}/rest/v1/clients?email=eq.teste@revhackers.com`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const clients = await res.json();
        console.log("Clients with teste@revhackers.com:", clients.length);
        if (clients.length > 0) {
            console.log(clients.map(c => c.id));
        }
    } catch (e) {
        console.error(e);
    }
}
run();
