import { Database } from "@/integrations/supabase/types";

// Helper type para a injeção omitindo dados gerados no Server (ID, etc)
export type TaskTemplateInsert = Omit<Database['public']['Tables']['orqflow_tasks']['Insert'], 'project_id' | 'sprint_id'>;

/**
 * DICIONÁRIO ESTRATÉGICO DE TAREFAS (PROJECT OS TEMPLATES)
 * 
 * Regra de Negócio:
 * Dependendo do Tipo de Projeto (type) e da Duração (duration),
 * um array diferente (Template) de tarefas padrão é devolvido.
 * 
 * Modifique os títulos e status das tarefas livremente.
 */
export const getTemplateForREI = (type: string, duration: string): TaskTemplateInsert[] => {
    
    // ==========================================
    // 1. ASSESSORIA FOUNDER
    // ==========================================
    if (type === 'founder') {
        if (duration === '30 dias') {
            return [
                { title: "Auditoria Inicial de Perfil (LinkedIn)", status: "todo", priority: "high" },
                { title: "Mapeamento de Arquétipo e Tom de Voz", status: "todo", priority: "high" },
                { title: "Revisão de Headline e Experiências", status: "backlog", priority: "medium" },
                { title: "Definição de Linhas Editoriais", status: "backlog", priority: "medium" },
                { title: "Agendamento da Grade Mensal (4 Posts)", status: "backlog", priority: "medium" }
            ];
        } else if (duration === '90 dias') {
            return [
                { title: "Auditoria Inicial de Perfil (LinkedIn)", status: "todo", priority: "high" },
                { title: "Aprovação de Matriz Tática de Autoridade", status: "todo", priority: "urgent" },
                { title: "Redesign da Copy de About", status: "todo", priority: "medium" },
                { title: "Workshop de Oratória / Gravação Prática", status: "backlog", priority: "medium" },
                { title: "Estratégia de PR e Guest Posts", status: "backlog", priority: "high" },
                { title: "Revisão Trimestral de Engajamento", status: "backlog", priority: "low" }
            ];
        }
        // Fallback Founder (Qualquer outra duração ex: 180, 360)
        return [
            { title: "Kick-off Longo Prazo: Autoridade Founder", status: "todo", priority: "high" },
            { title: "Planejamento Semestral de Growth", status: "backlog", priority: "medium" }
        ];
    }

    // ==========================================
    // 2. SITE & FUNNEL HUB
    // ==========================================
    if (type === 'site' || type === 'funnels_impl') {
        if (duration === '30 dias') {
            return [
                { title: "Elicitação de Requisitos (Sitemap)", status: "todo", priority: "high" },
                { title: "Setup Inicial Ambiente de Homologação", status: "todo", priority: "high" },
                { title: "Astro/React: Clonagem do Template Base", status: "todo", priority: "medium" },
                { title: "Aprovação de Copywriting Base", status: "backlog", priority: "urgent" },
                { title: "Deploy em Produção Beta", status: "backlog", priority: "high" }
            ];
        } else if (duration === '60 dias') {
            return [
                { title: "Definição de UI/UX e Moodboard", status: "todo", priority: "high" },
                { title: "Aprovação do Figma (Wireframe de Alta Fidelidade)", status: "backlog", priority: "high" },
                { title: "Implementação Full-Stack do Funnel Hub", status: "backlog", priority: "medium" },
                { title: "Integração B2B (Mídia, CRM, Analyticals)", status: "backlog", priority: "medium" },
                { title: "Quality Assurance Final", status: "backlog", priority: "high" }
            ];
        }
    }

    // ==========================================
    // 3. CONSULTORIA 360 / CRM / GENÉRICO DE REVOPS
    // ==========================================
    if (type === 'consulting' || type === 'crm_ops' || type === 'content_seo') {
        if (duration === '90 dias') {
            return [
                { title: "Onboarding Estratégico & Setup da Conta", status: "todo", priority: "high" },
                { title: "Diagnóstico Profundo de Processos (As-Is)", status: "todo", priority: "high" },
                { title: "Apresentar Arquitetura Técnica Recomendada (To-Be)", status: "backlog", priority: "urgent" },
                { title: "Aprovação de Mudanças na Máquina de Vendas", status: "backlog", priority: "high" },
                { title: "Migração de Dados (Lead/Deal/Company)", status: "backlog", priority: "high" },
                { title: "Treinamento do Time de SDR/Closers", status: "backlog", priority: "medium" },
                { title: "Fechamento Trimestral: RevOps Handoff", status: "done", priority: "low" }
            ];
        }
    }

    // ==========================================
    // TEMPLATE PADRÃO / FALLBACK GERAL
    // (Caso não ache a junção Type x Duration)
    // ==========================================
    return [
        { title: "Reunião de Alinhamento Inicial (Kick-off)", status: "todo", priority: "high" },
        { title: "Coleta e Configuração de Acessos", status: "todo", priority: "medium" },
        { title: "Levantamento do Escopo Direto", status: "todo", priority: "high" },
        { title: "Execução do Plano (Sprint 1)", status: "backlog", priority: "medium" },
        { title: "Apresentação e Reunião de Fechamento", status: "backlog", priority: "low" }
    ];
};
