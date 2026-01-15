import { createClient } from "@supabase/supabase-js";

// Credentials from .env (Valid)
const SUPABASE_URL = 'https://eqspbruarsdybpfeijnf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRecordings() {
    console.log("Checking for recent meeting recordings...");

    const { data, error } = await supabase
        .from('meeting_recordings')
        .select('id, title, ai_summary, transcript_status, created_at, happened_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching recordings:", error);
        return;
    }

    if (data.length === 0) {
        console.log("No recordings found.");
    } else {
        console.log(`Found ${data.length} recent recordings:`);
        data.forEach((rec, i) => {
            console.log(`\n--- Recording #${i + 1} ---`);
            console.log(`Title: ${rec.title}`);
            console.log(`Created At: ${new Date(rec.created_at).toLocaleString()}`);
            console.log(`Status: ${rec.transcript_status}`);
            console.log(`Summary: ${rec.ai_summary ? rec.ai_summary.substring(0, 100) + '...' : 'No summary'}`);
        });
    }
}

checkRecordings();
