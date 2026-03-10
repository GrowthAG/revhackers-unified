const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const projectId = '58361bde-d173-4412-af00-a786cfe39f25';

    // 1. Fetch latest REI Response
    const resRei = await fetch(`${url}/rest/v1/rei_responses?project_id=eq.${projectId}&order=completed_at.desc&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const reiResps = await resRei.json();
    const latestResponse = reiResps[0];
    console.log("Latest Response ID:", latestResponse.id);

    // MOCK finalPlanData manually to see what breaks
    const finalPlanData = {
        rei_project_id: projectId,
        client_id: 'aee558d1-16dc-4740-bfeb-db0e82c89073', // Using an arbitrary client UUID to test insert
        status: 'draft',
        persona_data: { personas: [] },
        diagnostic_data: {
            summary: "Teste",
            enriched_analysis: {}
        },
        promises_data: {}, // Wait, is it premises_data or promises_data in the schema?
        // Let's check table schema by fetching a row
    };

    const resLimit = await fetch(`${url}/rest/v1/strategic_plans?limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const onePlan = await resLimit.json();
    console.log("Columns in strategic_plans:", Object.keys(onePlan[0] || {}));
}
run();
