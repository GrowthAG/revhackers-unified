
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = {};

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim();
        }
    });
}

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_KEY = envConfig.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials. Checked path:", envPath);
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    console.log("🌱 Starting seed...");

    // 1. Create a dummy project (if not exists)
    const { data: project, error: projError } = await supabase
        .from('rei_projects')
        .insert({
            client_name: 'TechCorp SaaS',
            client_company: 'TechCorp',
            client_email: 'contact@techcorp.com',
            analyst_email: 'analyst@revhackers.com',
            status: 'active',
            next_rei_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            quarter: 'Q1',
            year: 2026
        })
        .select()
        .single();

    if (projError) {
        console.error("Error creating project:", projError);
        return;
    }
    console.log("✅ Project created:", project.id);

    // 2. Create an active Sprint
    const { data: sprint, error: sprintError } = await supabase
        .from('project_sprints')
        .insert({
            project_id: project.id,
            title: 'Sprint 1: MVP Launch',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // +14 days
        })
        .select()
        .single();

    if (sprintError) {
        console.error("Error creating sprint:", sprintError);
        return;
    }
    console.log("✅ Sprint created:", sprint.id);

    // 3. Get some users (members) to assign tasks to
    const { data: users } = await supabase.from('profiles').select('id, full_name, avatar_url').limit(3);

    // Fallback if no users
    const assignees = users && users.length > 0 ? users.map(u => u.id) : [null, null, null];

    // 4. Create Tasks
    const tasks = [
        { title: 'Design Homepage Mockup', status: 'done', priority: 'high', assignee_id: assignees[0] },
        { title: 'Setup Supabase Database', status: 'done', priority: 'urgent', assignee_id: assignees[1] },
        { title: 'Implement Authentication', status: 'in_progress', priority: 'high', assignee_id: assignees[0] },
        { title: 'Create Dashboard Layout', status: 'in_progress', priority: 'medium', assignee_id: assignees[2] },
        { title: 'Write API Documentation', status: 'todo', priority: 'low', assignee_id: assignees[1] },
        { title: 'Fix Login Bug', status: 'todo', priority: 'urgent', assignee_id: assignees[0] },
        { title: 'Deploy to Vercel', status: 'todo', priority: 'high', assignee_id: assignees[2] }
    ];

    for (const task of tasks) {
        await supabase.from('project_tasks').insert({
            sprint_id: sprint.id,
            project_id: project.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assignee_id: task.assignee_id
            // created_by is optional or can be null if RLS allows
        });
    }

    console.log("✅ Tasks seeded!");
}

seed();
