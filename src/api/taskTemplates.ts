/**
 * Task Templates (Stub)
 * 
 * Compatibilidade temporária para criação manual de projetos. O provisionamento
 * externo foi removido; o gestor operacional próprio será definido depois.
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
    // Retorna vazio até o contrato do gestor operacional próprio ser aprovado.
    return [];
}
