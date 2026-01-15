export type SprintStatus = 'planned' | 'active' | 'closed';
export type SprintType = 'planning' | 'ongoing';

export interface ProjectSprint {
    id: string;
    project_id: string;
    title: string;
    type: SprintType;
    status: SprintStatus;
    start_date: string | null;
    end_date: string | null;
    goals: string[];
    created_at: string;
    updated_at: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTask {
    id: string;
    sprint_id: string;
    project_id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assignee_id: string | null;
    tags: string[];
    due_date: string | null;
    position: number;
    visible_to_client: boolean;
    magic_link_token: string | null;
    audited_by: string | null;
    time_estimate: number | null;
    sprint_points: number | null;
    checklist: { id: string; text: string; completed: boolean }[];
    custom_fields: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Joined fields (optional)
    assignee?: {
        full_name: string;
        avatar_url: string;
        email: string;
    };
}

export interface TaskComment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    type: 'chat' | 'log';
    created_at: string;

    // Joined fields
    user?: {
        full_name: string;
        avatar_url: string;
    };
}

export interface TaskDocumentLink {
    id: string;
    task_id: string;
    document_id: string;
    created_at: string;

    // Joined fields
    document?: {
        id: string;
        document_type: string;
        version: number;
        status: string;
    };
}
