import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqspbruarsdybpfeijnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditLogs() {
    // If we can't query pg_trigger directly, we can at least try to query audit_logs to confirm it exists
    const { data, error } = await supabase.from('audit_logs').select('id').limit(1);
    console.log("Audit Logs existence check:", error ? error : "Table exists");
}

testAuditLogs();
