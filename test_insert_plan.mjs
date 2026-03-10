const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const projectId = '58361bde-d173-4412-af00-a786cfe39f25';

    // Create test finalPlanData with empty arrays to see if schema passes
    const finalPlanData = {
        rei_project_id: projectId,
        client_id: 'aee558d1-16dc-4740-bfeb-db0e82c89073', // arbitrary UUID
        status: 'draft',
        persona_data: { personas: [] },
        diagnostic_data: { summary: "Teste" },
        premises_data: {},
        methodology_data: {},
        roadmap_data: {},
        goals_data: {},
        financial_projections: {},
        budget_data: {},
        next_steps_data: {}
    };

    try {
        const res = await fetch(`${url}/rest/v1/strategic_plans`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(finalPlanData)
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Insert failed:", errorData);
        } else {
            const data = await res.json();
            console.log("Success! ID:", data[0].id);
        }
    } catch (e) {
        console.error("Fetch Exception:", e);
    }
}
run();
