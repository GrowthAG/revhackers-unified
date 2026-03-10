const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    try {
        const res = await fetch(`${url}/rest/v1/profiles?select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const profiles = await res.json();
        console.log("Profiles count:", profiles.length);
        console.log(profiles.slice(0, 3));
    } catch (e) {
        console.error(e);
    }
}
run();
