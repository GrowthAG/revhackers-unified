// Types compartilhados para o sistema REI
export type REIType = 'consulting' | 'dev' | 'founder' | 'funnel' | 'site';

export type REIStatus = 'active' | 'pending' | 'overdue' | 'completed';

// Novos types para classificação de respostas
export type ResponseContext = 'internal' | 'lead_gen' | 'public';
export type ResponseSource = 'rei' | 'diagnostic' | 'quiz';

export interface REIQuestion {
    id: string;
    label: string;
    type: 'input' | 'textarea' | 'select' | 'radio';
    validation: any; // Zod schema
    placeholder?: string;
    options?: string[] | { label: string; value: string }[];
    optional?: boolean;
}

export interface REISection {
    id: number;
    title: string;
    questions: REIQuestion[];
}

export interface REIConfig {
    type: REIType;
    title: string;
    subtitle: string;
    sections: REISection[];
    totalQuestions: number;
}

export interface REIProject {
    id: string;
    type: REIType;
    client_email: string;
    client_name: string;
    analyst_email?: string;
    status: REIStatus;
    start_date?: string;
    next_rei_date?: string;
    quarter?: number;
    year?: number;
    created_at: string;
    updated_at: string;
}

export interface REIResponse {
    id: string;
    project_id: string;

    // Classificação (novos campos críticos)
    context: ResponseContext;
    source: ResponseSource;
    type?: REIType; // Opcional para compatibilidade

    responses: Record<string, any>;
    total_score: number;
    maturity_level: string;
    maturity_percentage: number;

    // Versionamento de score
    score_version: string;
    calculated_at: string;

    radar_data?: Array<{ label: string; value: number }>;
    insights?: string[];
    completed_at: string;
    created_at: string;
}
