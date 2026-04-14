/**
 * Task Templates (Stub)
 * 
 * O provisionamento de tarefas agora é feito pela RPC convert_opportunity_to_project_v2
 * (que cria sprints automaticamente) e pelo clickup-sprint-orchestrator (que cria
 * tasks no ClickUp baseado no roadmap_phases do plano estratégico).
 *
 * Este stub retorna array vazio para manter compatibilidade com createReiProject,
 * que ainda chama getTemplateForREI para projetos criados manualmente pelo admin.
 */

export interface TaskTemplate {
    title: string;
    description?: string;
    status: string;
    priority?: string;
    assignee_email?: string;
}

export function getTemplateForREI(_type: string, _duration: string): TaskTemplate[] {
    // Templates estáticos foram migrados para o fluxo dinâmico via strategic_plans.roadmap_phases
    // + clickup-sprint-orchestrator. Retorna vazio para não duplicar tarefas.
    return [];
}
