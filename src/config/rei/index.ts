import { consultingConfig } from './consultingQuestions';
import { devConfig } from './devQuestions';
import { founderConfig } from './founderQuestions';
import { REIType, REIConfig } from '@/types/rei';

export const REI_CONFIGS: Record<REIType, REIConfig> = {
    consulting: consultingConfig,
    dev: devConfig,
    founder: founderConfig
};

export const getREIConfig = (type: REIType): REIConfig => {
    return REI_CONFIGS[type];
};

export const getREITitle = (type: REIType): string => {
    const titles: Record<REIType, string> = {
        consulting: 'Consultoria 360º',
        dev: 'Dev Web & Design',
        founder: 'Founder Growth'
    };
    return titles[type];
};

export const getREIIcon = (type: REIType): string => {
    const icons: Record<REIType, string> = {
        consulting: 'Target',
        dev: 'Code',
        founder: 'Crown'
    };
    return icons[type];
};
