import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { projectId, type = 'planning' } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (!projectId) {
            throw new Error('projectId is required');
        }

        // 1. Create Sprint
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        let sprintTitle = '';
        let goals: string[] = [];
        let initialTasks: any[] = [];

        if (type === 'planning') {
            sprintTitle = 'Sprint 01: Planejamento Estratégico';
            goals = ['Realizar Diagnóstico Profundo', 'Definir OKRs', 'Aprovar Plano de Ação'];
            initialTasks = [
                { title: 'Reunião de Kickoff (Gravada)', status: 'done', priority: 'high', description: 'Reunião inicial realizada.' },
                { title: 'Preencher Diagnóstico Técnico', status: 'todo', priority: 'high', description: 'Coletar acessos e stack tecnológica.' },
                { title: 'Análise de Concorrentes (IA)', status: 'todo', priority: 'medium', description: 'Rodar agente de análise de mercado.' },
                { title: 'Definição de Personas (ICP)', status: 'todo', priority: 'high', description: 'Mapear dores e gatilhos de compra.' },
                { title: 'Aprovação do Plano Estratégico', status: 'backlog', priority: 'urgent', description: 'Validar roadmap com o cliente (Link Mágico).' },
            ];
        } else {
            const currentMonth = today.toLocaleString('pt-BR', { month: 'long' });
            sprintTitle = `Sprint Ongoing: ${currentMonth} ${today.getFullYear()}`;
            goals = ['Executar Playbooks', 'Otimizar Conversão'];
            // Ongoing sprints start empty or with recurring tasks (to be implemented)
        }

        const { data: sprint, error: sprintError } = await supabase
            .from('project_sprints')
            .insert({
                project_id: projectId,
                title: sprintTitle,
                type: type,
                status: 'active',
                start_date: today.toISOString(),
                end_date: lastDayOfMonth.toISOString(),
                goals: goals
            })
            .select()
            .single();

        if (sprintError) throw sprintError;

        // 2. Create Initial Tasks
        if (initialTasks.length > 0) {
            const tasksToInsert = initialTasks.map((task, index) => ({
                sprint_id: sprint.id,
                project_id: projectId,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                position: index,
                visible_to_client: true // Default visible for planning tasks
            }));

            const { error: tasksError } = await supabase
                .from('project_tasks')
                .insert(tasksToInsert);

            if (tasksError) throw tasksError;
        }

        return new Response(JSON.stringify({ success: true, sprint }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
