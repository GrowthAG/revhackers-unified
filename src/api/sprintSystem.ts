import { supabase } from '@/integrations/supabase/client';
import { ProjectSprint, ProjectTask, TaskStatus } from '@/types/sprint-system';

export const getProjectSprints = async (projectId: string) => {
    const { data, error } = await supabase
        .from('project_sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProjectSprint[];
};

export const getSprintTasks = async (sprintId: string) => {
    const { data, error } = await supabase
        .from('project_tasks')
        .select(`
            *,
            assignee:assignee_id(
                full_name,
                avatar_url,
                email
            )
        `)
        .eq('sprint_id', sprintId)
        .order('position', { ascending: true }); // We will implement position handling later

    if (error) throw error;

    // Transform result to match interface with nested assignee
    return data.map((item: any) => ({
        ...item,
        assignee: item.assignee // Already joined by Supabase
    })) as ProjectTask[];
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const { data, error } = await supabase
        .from('project_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single();

    if (error) throw error;
    return data as ProjectTask;
};

export const createTask = async (task: Partial<ProjectTask>) => {
    const { data, error } = await supabase
        .from('project_tasks')
        .insert(task)
        .select()
        .single();

    if (error) throw error;
    return data as ProjectTask;
}

export const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    const { data, error } = await supabase
        .from('project_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select(`
            *,
            assignee:assignee_id(
                full_name,
                avatar_url,
                email
            )
        `)
        .single();

    if (error) throw error;

    // Transform result to match interface with nested assignee
    if (data.assignee) {
        return {
            ...data,
            assignee: data.assignee
        } as ProjectTask;
    }

    return data as ProjectTask;
};

export const deleteTask = async (taskId: string) => {
    const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

    if (error) throw error;
    return true;
};

// --- Global Dashboard Queries ---

export const getAllActiveProjects = async () => {
    const { data, error } = await supabase
        .from('rei_projects')
        .select(`
            *,
            sprints:project_sprints(
                id,
                title,
                status,
                start_date,
                end_date
            )
        `)
        .neq('status', 'completed')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
};

export const getAllActiveTasks = async () => {
    // 1. Get all active sprints first
    const { data: activeSprints, error: sprintError } = await supabase
        .from('project_sprints')
        .select('id, project_id')
        .eq('status', 'active');

    if (sprintError) throw sprintError;

    if (!activeSprints || activeSprints.length === 0) return [];

    const sprintIds = activeSprints.map(s => s.id);

    // 2. Get tasks for these sprints
    const { data, error } = await supabase
        .from('project_tasks')
        .select(`
            *,
            assignee:assignee_id(
                full_name,
                avatar_url,
                email
            ),
            project:project_id(
                client_name,
                client_company
            )
        `)
        .in('sprint_id', sprintIds)
        .neq('status', 'done') // Focus on pending work for the "workload" chart? Or maybe all? Let's get ALL for the pie chart.
        .order('priority', { ascending: false });

    if (error) throw error;

    // Transform result
    return data.map((item: any) => ({
        ...item,
        assignee: item.assignee,
        project_name: item.project?.client_name || 'Projeto'
    }));
};
