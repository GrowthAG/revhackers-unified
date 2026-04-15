import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

export const founderSections: REISection[] = [
    {
        id: 1,
        title: "Identidade & História",
        questions: [
            { id: "fullName", label: "Seu Nome", type: "input", validation: z.string().min(2, "Nome obrigatório") },
            { id: "linkedinUrl", label: "Seu LinkedIn Atual", type: "input", validation: z.string().url("URL inválida").optional().or(z.literal("")), optional: true },
            { id: "currentRole", label: "Cargo/Posição Atual", type: "input", validation: z.string().min(2, "Obrigatório") },
            { id: "biography", label: "Mini-Bio / História de Origem", type: "textarea", validation: z.string().min(10, "Breve biografia necessária"), placeholder: "Resuma quem é e como chegou aqui..." },
            { id: "superpowers", label: "Seus 'Superpoderes' (Diferenciais)", type: "textarea", validation: z.string().min(5, "Obrigatório"), placeholder: "O que você faz melhor que 90% das pessoas?" },
            { id: "brandPersonification", label: "Se a sua marca pessoal fosse uma pessoa, como seria?", type: "textarea", validation: z.string().min(5, "Obrigatório"), placeholder: "Onde seria vista, como se vestiria, como falaria?" },
        ]
    },
    {
        id: 2,
        title: "Autoridade & Crenças",
        questions: [
            { id: "authorityTopics", label: "Sobre quais tópicos você quer ser referência?", type: "textarea", validation: z.string().min(5, "Tópicos obrigatórios") },
            { id: "perceptionGap", label: "Gap de Percepção (O que poucos entendem)", type: "textarea", validation: z.string().min(10, "Este campo é essencial para fechar o gap."), placeholder: "Acham que eu faço X, mas na verdade a mágica é Y..." },
            { id: "industryMyths", label: "Quais mitos/dogmas do seu mercado você discorda?", type: "textarea", validation: z.string().min(5, "Quais dogmas você quer derrubar?") },
            { id: "coreValues", label: "Seus Valores Inegociáveis", type: "textarea", validation: z.string().min(5, "Valores inegociáveis obrigatórios") },
            { id: "marketFuture", label: "O que vai mudar radicalmente no seu mercado nos próximos 5 anos?", type: "textarea", validation: z.string().optional(), optional: true, placeholder: "Quais são as sinalizações fracas?" },
        ]
    },
    {
        id: 3,
        title: "Audiência & Psicologia",
        questions: [
            { id: "targetAudience", label: "Quem é o público-alvo principal?", type: "textarea", validation: z.string().min(5, "Com quem você quer falar?") },
            { id: "unspokenPain", label: "Qual é a maior dor que o seu cliente raramente verbaliza?", type: "textarea", validation: z.string().min(10, "Qual é a dor oculta?"), placeholder: "A dor real não é X, é o medo de... " },
            { id: "journeyState", label: "A Jornada: Estado de Entrada vs Estado de Saída", type: "textarea", validation: z.string().min(10, "Descreva a jornada"), placeholder: "De confusão total para clareza absoluta..." },
            { id: "antiClient", label: "Red Flags: Qual tipo de cliente você NÃO atende mais?", type: "textarea", validation: z.string().min(5, "Descreva o anti-cliente"), placeholder: "O que aconteceu para você demitir um perfil de cliente?" },
            {
                id: "toneVoice", label: "Tom de Voz Desejado", type: "select", validation: z.string().min(1, "Defina o tom"),
                options: ["Totalmente Profissional/Corporativo", "Profissional mas Acessível", "Líder de Pensamento (Polêmico)", "Mentor/Educador"]
            },
            { id: "references", label: "Referências de Personal Branding?", type: "input", validation: z.string().optional(), optional: true },
        ]
    },
    {
        id: 4,
        title: "Motor de Conteúdo",
        questions: [
            {
                id: "contentFrequency", label: "Disponibilidade", type: "select", validation: z.string().min(1, "Disponibilidade"),
                options: ["1x por semana", "2-3x por semana", "Diariamente", "Quando der na telha"]
            },
            {
                id: "preferredFormats", label: "Formatos", type: "select", validation: z.string().min(1, "Formatos preferidos"),
                options: ["Apenas Texto", "Foto + Texto", "Vídeos Curtos (Reels/TikTok)", "Vídeos Longos"]
            },
            { id: "vocabulary", label: "Seu Vocabulário Oficial (E palavras que detesta)", type: "textarea", validation: z.string().min(5, "Defina suas palavras"), placeholder: "Uso: Tração. Detesto: Sinergia..." },
            { id: "approvalWorkflow", label: "Fluxo de aprovação desejado?", type: "textarea", validation: z.string().optional(), optional: true },
        ]
    },
    {
        id: 5,
        title: "Visão & Legado",
        questions: [
            { id: "antiGoals", label: "O que você NÃO quer ser ou parecer? (Anti-Role Models)", type: "textarea", validation: z.string().min(2, "Anti-Metas") },
            { id: "topicsToAvoid", label: "Assuntos proibidos ou sensíveis?", type: "input", validation: z.string().optional(), optional: true },
            { id: "successVision", label: "Como você quer estar classificado mercadologicamente daqui a 1 ano?", type: "textarea", validation: z.string().min(5, "Visão obrigatória") },
            { id: "realLegacy", label: "Como você quer ser lembrado daqui a 20 anos? (Qual é o Legado real?)", type: "textarea", validation: z.string().min(5, "Legado obrigatório"), placeholder: "Não o que está no site, mas a missão real..." },
        ]
    },
];

export const founderConfig: REIConfig = {
    type: 'founder',
    title: 'REI – Revenue Excellence Initiative',
    subtitle: 'Consultoria Estratégica: Entrevista Founder Integral',
    sections: founderSections,
    totalQuestions: 24
};
