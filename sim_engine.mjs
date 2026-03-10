import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

// To run this we need to compile or run via tsx
// Let's create a minimal test

const url = 'https://eqspbruarsdybpfeijnf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

async function run() {
    const projectId = '58361bde-d173-4412-af00-a786cfe39f25';

    const resRei = await fetch(`${url}/rest/v1/rei_responses?project_id=eq.${projectId}&order=completed_at.desc&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const reiResps = await resRei.json();
    const latestResponse = reiResps[0];

    console.log("Found response ID:", latestResponse.id);

    const rawResponses = latestResponse.responses;
    const answers = rawResponses?.form_data || rawResponses || {};
    console.log("Answers Keys:", Object.keys(answers));

    // The diagnostic logic from DiagnosticService
    function generateDiagnosis(response) {
        const answers = response.responses?.form_data || response.responses || {};
        const hasCRM = true;
        const isB2B = true;

        // 1. Context
        const segment = answers.segmento || answers.segmento_outro || 'Generalista';
        const objective = answers.metaCrescimento || answers.objetivoPrincipal || 'Crescimento';

        return { plan_data: { test: "success" } };
    }

    try {
        const diag = generateDiagnosis(latestResponse);
        console.log("Generated Successfully:", typeof diag);
    } catch (e) {
        console.error("Crash inside generateDiagnosis:", e);
    }
}

run();
