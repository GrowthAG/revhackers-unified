// REI Quarterly Review System
// Gerencia renovação trimestral de diagnósticos de clientes

export interface REIProject {
    id: string;
    clientName: string;
    clientEmail: string;
    clientCompany?: string;
    lastREIDate: Date;
    nextREIDate: Date;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year: number;
    status: 'active' | 'pending' | 'overdue' | 'lead';
    analystEmail: string;
}

/**
 * Calcula o próximo quarter baseado na data atual
 */
export const getNextQuarter = (currentDate: Date = new Date()): { quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'; startDate: Date } => {
    const month = currentDate.getMonth(); // 0-11
    const year = currentDate.getFullYear();

    let nextQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    let nextYear = year;
    let startMonth: number;

    if (month < 3) { // Jan-Mar
        nextQuarter = 'Q2';
        startMonth = 3; // Abril
    } else if (month < 6) { // Abr-Jun
        nextQuarter = 'Q3';
        startMonth = 6; // Julho
    } else if (month < 9) { // Jul-Set
        nextQuarter = 'Q4';
        startMonth = 9; // Outubro
    } else { // Out-Dez
        nextQuarter = 'Q1';
        startMonth = 0; // Janeiro
        nextYear = year + 1;
    }

    const startDate = new Date(nextYear, startMonth, 1, 0, 0, 0);

    return { quarter: nextQuarter, startDate };
};

/**
 * Calcula quantos dias faltam para o próximo REI
 */
export const getDaysUntilNextREI = (nextREIDate: Date): number => {
    const now = new Date();
    const diff = nextREIDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Determina o status do projeto baseado na data do próximo REI
 */
export const getREIStatus = (nextREIDate: Date): 'active' | 'pending' | 'overdue' => {
    const daysUntil = getDaysUntilNextREI(nextREIDate);

    if (daysUntil < 0) return 'overdue'; // Atrasado
    if (daysUntil <= 14) return 'pending'; // Menos de 2 semanas
    return 'active'; // Mais de 2 semanas
};

/**
 * Formata a data do próximo REI de forma legível
 */
export const formatNextREIDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

/**
 * Retorna a cor do badge baseado no status
 */
export const getStatusColor = (status: 'active' | 'pending' | 'overdue'): string => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'overdue':
            return 'bg-red-100 text-red-800 border-red-200';
    }
};

/**
 * Retorna o texto do status
 */
export const getStatusText = (status: 'active' | 'pending' | 'overdue'): string => {
    switch (status) {
        case 'active':
            return 'Em dia';
        case 'pending':
            return 'Atenção necessária';
        case 'overdue':
            return 'Atrasado';
    }
};

/**
 * Cria um novo projeto REI
 */
export const createREIProject = (
    clientName: string,
    clientEmail: string,
    analystEmail: string,
    initialREIDate: Date = new Date()
): REIProject => {
    const { quarter, startDate } = getNextQuarter(initialREIDate);
    const year = startDate.getFullYear();

    return {
        id: `rei-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientName,
        clientCompany: clientName, // Fallback for new projects created directly here
        clientEmail,
        lastREIDate: initialREIDate,
        nextREIDate: startDate,
        quarter,
        year,
        status: getREIStatus(startDate),
        analystEmail
    };
};

/**
 * Filtra projetos que precisam de atenção (pending ou overdue)
 */
export const getProjectsNeedingAttention = (projects: REIProject[]): REIProject[] => {
    return projects.filter(p => p.status === 'pending' || p.status === 'overdue');
};

/**
 * Agrupa projetos por quarter
 */
export const groupProjectsByQuarter = (projects: REIProject[]): Record<string, REIProject[]> => {
    return projects.reduce((acc, project) => {
        const key = `${project.quarter} ${project.year}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(project);
        return acc;
    }, {} as Record<string, REIProject[]>);
};
