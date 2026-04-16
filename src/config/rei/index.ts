import { consultingConfig } from './consultingQuestions';
import { devConfig } from './devQuestions';
import { founderConfig } from './founderQuestions';
import { crmOpsConfig } from './crmOpsQuestions';
import { REIType, REIConfig } from '@/types/rei';

export const REI_CONFIGS: Record<REIType, REIConfig> = {
    consulting: consultingConfig,
    dev: devConfig,
    founder: founderConfig,
    crm_ops: crmOpsConfig,
    site: devConfig,
    funnel: consultingConfig,
};

export const getREIConfig = (type: REIType): REIConfig => {
    return REI_CONFIGS[type];
};

export const getREITitle = (type: REIType): string => {
    const titles: Record<REIType, string> = {
        consulting: 'Consultoria 360',
        dev: 'Dev Web & Design',
        founder: 'Founder Growth',
        crm_ops: 'CRM & RevOps',
        site: 'Site & Landing Pages',
        funnel: 'Funil de Vendas',
    };
    return titles[type];
};

export const getREIIcon = (type: REIType): string => {
    const icons: Record<REIType, string> = {
        consulting: 'Target',
        dev: 'Code',
        founder: 'Crown',
        crm_ops: 'Database',
        site: 'Globe',
        funnel: 'Filter',
    };
    return icons[type];
};

