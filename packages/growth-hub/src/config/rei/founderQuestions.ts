import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

export const founderSections: REISection[] = [
    {
        id: 1,
        title: "Identidade & História",
        questions: [
            {
                id: "fullName",
                label: "Seu Nome",
                type: "input",
                validation: z.string().min(2, "Nome obrigatório"),
            },
            {
                id: "linkedinUrl",
                label: "Seu LinkedIn Atual",
                type: "input",
                validation: z.string().url("URL do LinkedIn inválida").optional().or(z.literal("")),
                optional: true,
            },
            {
                id: "currentRole",
                label: "Cargo/Posição Atual",
                type: "input",
                validation: z.string().min(2, "Cargo atual obrigatório"),
            },
            {
                id: "biography",
                label: "Mini-Bio / História de Origem",
                type: "textarea",
                validation: z.string().min(10, "Conte um pouco da sua história"),
                placeholder: "Resuma quem é você e como chegou aqui...",
            },
            {
                id: "superpowers",
                label: "Seus 'Superpoderes' (Diferenciais)",
                type: "textarea",
                validation: z.string().min(5, "Quais seus superpoderes?"),
                placeholder: "O que você faz melhor que 90% das pessoas?",
            },
        ]
    },
    {
        id: 2,
        title: "Pilares de Autoridade",
        questions: [
            {
                id: "authorityTopics",
                label: "Sobre quais tópicos você quer ser referência?",
                type: "textarea",
                validation: z.string().min(5, "Sobre o que você quer falar?"),
                placeholder: "Ex: Vendas B2B, Liderança Remota, Futuro do Varejo...",
            },
            {
                id: "industryMyths",
                label: "Quais mitos do seu mercado você discorda? (Hot Takes)",
                type: "textarea",
                validation: z.string().optional(),
                optional: true,
            },
            {
                id: "coreValues",
                label: "Seus Valores Inegociáveis",
                type: "textarea",
                validation: z.string().min(5, "Seus valores inegociáveis"),
            },
        ]
    },
    {
        id: 3,
        title: "Audiência & Tom",
        questions: [
            {
                id: "targetAudience",
                label: "Quem é o público-alvo principal? (Ex: Investidores, Talentos, Clientes)",
                type: "textarea",
                validation: z.string().min(5, "Com quem você quer falar?"),
            },
            {
                id: "toneVoice",
                label: "Tom de Voz Desejado",
                type: "select",
                validation: z.string().min(1, "Defina o tom de voz"),
                options: [
                    "Totalmente Profissional/Corporativo",
                    "Profissional mas Acessível",
                    "Líder de Pensamento (Polêmico)",
                    "Mentor/Educador",
                    "Vida Real (Misto Pessoal/Profissional)"
                ]
            },
            {
                id: "references",
                label: "Quem são suas referências de Personal Branding? (Opcional)",
                type: "input",
                validation: z.string().optional(),
                optional: true,
            },
        ]
    },
    {
        id: 4,
        title: "Motor de Conteúdo",
        questions: [
            {
                id: "contentFrequency",
                label: "Disponibilidade para criar/revisar conteúdo",
                type: "select",
                validation: z.string().min(1, "Disponibilidade"),
                options: [
                    "1x por semana",
                    "2-3x por semana",
                    "Diariamente",
                    "Quando der na telha"
                ]
            },
            {
                id: "preferredFormats",
                label: "Formatos Preferidos",
                type: "select",
                validation: z.string().min(1, "Formatos preferidos"),
                options: [
                    "Apenas Texto",
                    "Foto + Texto",
                    "Vídeos Curtos (Reels/TikTok)",
                    "Vídeos Longos",
                    "Artigos Longos"
                ]
            },
            {
                id: "approvalWorkflow",
                label: "Como deve ser o fluxo de aprovação?",
                type: "textarea",
                validation: z.string().optional(),
                optional: true,
            },
        ]
    },
    {
        id: 5,
        title: "Anti-Metas & Visão",
        questions: [
            {
                id: "antiGoals",
                label: "O que você NÃO quer ser/parecer? (Anti-Role Models)",
                type: "textarea",
                validation: z.string().min(2, "O que você NÃO quer ser?"),
            },
            {
                id: "topicsToAvoid",
                label: "Assuntos proibidos ou sensíveis?",
                type: "input",
                validation: z.string().optional(),
                optional: true,
            },
            {
                id: "successVision",
                label: "Visão de Sucesso: Como você quer estar daqui a 1 ano?",
                type: "textarea",
                validation: z.string().min(5, "Onde quer chegar?"),
            },
        ]
    },
];

export const founderConfig: REIConfig = {
    type: 'founder',
    title: 'REI – Revenue Excellence Initiative',
    subtitle: 'Protocolo Founder Growth',
    sections: founderSections,
    totalQuestions: 14
};
