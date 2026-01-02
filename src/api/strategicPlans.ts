import { supabase } from '@/integrations/supabase/client';

export interface StrategicPlan {
    id: string;
    rei_project_id: string;
    client_id: string;
    diagnostic_data: any;
    persona_data: any;
    premises_data: any;
    methodology_data: any;
    roadmap_data: any;
    goals_data: any;
    financial_projections: any;
    budget_data: any;
    next_steps_data: any;
    status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';
    access_token: string;
    sent_at?: string;
    viewed_at?: string;
    approved_at?: string;
    rejected_at?: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface StrategicPlanWithClient extends StrategicPlan {
    clients?: {
        id: string;
        name: string;
        email: string;
        company: string;
        logo_url?: string;
    };
}

/**
 * Get strategic plan by REI project ID
 */
export async function getStrategicPlanByReiProject(reiProjectId: string): Promise<StrategicPlan | null> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('rei_project_id', reiProjectId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data as StrategicPlan;
}

/**
 * Get strategic plan by access token (for client view)
 */
export async function getStrategicPlanByToken(token: string): Promise<StrategicPlanWithClient | null> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .select('*, clients(*)')
        .eq('access_token', token)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data as StrategicPlanWithClient;
}

/**
 * Generate strategic plan (calls Supabase RPC function)
 */
export async function generateStrategicPlan(reiProjectId: string): Promise<string> {
    const { data, error } = await supabase
        .rpc('generate_strategic_plan', { p_rei_project_id: reiProjectId });

    if (error) throw error;

    return data as string; // Returns UUID of created plan
}

/**
 * Update strategic plan status
 */
export async function updateStrategicPlanStatus(
    id: string,
    status: StrategicPlan['status']
): Promise<StrategicPlan> {
    const updates: any = { status };

    // Auto-update timestamps based on status
    if (status === 'sent') updates.sent_at = new Date().toISOString();
    if (status === 'viewed') updates.viewed_at = new Date().toISOString();
    if (status === 'approved') updates.approved_at = new Date().toISOString();
    if (status === 'rejected') updates.rejected_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('strategic_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data as StrategicPlan;
}

/**
 * Update strategic plan data
 */
export async function updateStrategicPlan(
    id: string,
    updates: Partial<Omit<StrategicPlan, 'id' | 'created_at' | 'updated_at'>>
): Promise<StrategicPlan> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data as StrategicPlan;
}

/**
 * Delete strategic plan
 */
export async function deleteStrategicPlan(id: string): Promise<void> {
    const { error } = await supabase
        .from('strategic_plans')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Get all strategic plans (admin view)
 */
export async function getAllStrategicPlans(): Promise<StrategicPlanWithClient[]> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .select('*, clients(*)')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data as StrategicPlanWithClient[];
}

/**
 * Get strategic plans by status
 */
export async function getStrategicPlansByStatus(status: StrategicPlan['status']): Promise<StrategicPlanWithClient[]> {
    const { data, error } = await supabase
        .from('strategic_plans')
        .select('*, clients(*)')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data as StrategicPlanWithClient[];
}
