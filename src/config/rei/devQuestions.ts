import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

const PROJECT_TYPES = ["Landing Page High-Ticket", "Site Institucional", "E-commerce", "Portal/Blog", "Redesign"];
const CONTENT_STATUS = ["Temos tudo pronto", "Temos parcialmente", "Precisamos criar do zero", "A agência deve criar"];
const BRAND_STATUS = ["Temos Brandbook completo", "Temos apenas Logo e Cores", "Precisamos de Rebranding", "Não temos identidade visual"];

export const devSections: REISection[] = [
    {
        id: 1,
        title: "Visão Geral",
        questions: [
            {
                id: "projectName",
                label: "Nome do Projeto/Empresa",
                type: "input",
                validation: z.string().min(2, "Nome do projeto obrigatório"),
            },
            {
                id: "mainContact",
                label: "Nome do Responsável",
                type: "input",
                validation: z.string().min(2, "Contato principal obrigatório"),
            },
            {
                id: "email",
                label: "E-mail de contato",
                type: "input",
                validation: z.string().email("E-mail inválido"),
            },
            {
                id: "decisionMakers",
                label: "Quem são os tomadores de decisão?",
                type: "input",
                validation: z.string().min(2, "Quem aprova o projeto?"),
                placeholder: "Ex: Eu e o sócio...",
            },
            {
                id: "deadline",
                label: "Qual o prazo desejado/ideal para lançamento?",
                type: "input",
                validation: z.string().min(2, "Prazo desejado"),
                placeholder: "Ex: 30 dias, para Black Friday...",
            },
        ]
    },
    {
        id: 2,
        title: "Estratégia e Objetivos",
        questions: [
            {
                id: "projectType",
                label: "Tipo de Projeto",
                type: "select",
                validation: z.string().min(1, "Selecione o tipo"),
                options: PROJECT_TYPES,
            },
            {
                id: "primaryGoal",
                label: "Qual o objetivo principal do novo site?",
                type: "textarea",
                validation: z.string().min(5, "Qual o objetivo principal?"),
                placeholder: "Ex: Aumentar conversão de leads, Posicionamento de marca...",
            },
            {
                id: "successKpi",
                label: "O que definirá que o projeto foi um sucesso? (KPIs)",
                type: "textarea",
                validation: z.string().min(5, "O que define sucesso?"),
            },
            {
                id: "competitors",
                label: "Quem são os principais concorrentes e o que você gosta/não gosta neles?",
                type: "textarea",
                validation: z.string().optional(),
                optional: true,
            },
        ]
    },
    {
        id: 3,
        title: "Identidade Visual (Look & Feel)",
        questions: [
            {
                id: "brandGuidelines",
                label: "Situação atual da Marca",
                type: "select",
                validation: z.string().min(1, "Selecione uma opção"),
                options: BRAND_STATUS,
            },
            {
                id: "visualStyle",
                label: "Descreva o estilo visual desejado (Vibe)",
                type: "textarea",
                validation: z.string().min(5, "Descreva o estilo visual"),
                placeholder: "Ex: Minimalista, Dark mode, Industrial, Tech, Luxuoso...",
            },
            {
                id: "inspirationSites",
                label: "Sites de Referência (Links)",
                type: "textarea",
                validation: z.string().min(5, "Sites de referência"),
                placeholder: "Cole aqui os links de sites que você acha incríveis.",
            },
            {
                id: "dontLike",
                label: "O que você NÃO quer de jeito nenhum? (Anti-referências)",
                type: "textarea",
                validation: z.string().optional(),
                optional: true,
            },
        ]
    },
    {
        id: 4,
        title: "Conteúdo & Estrutura",
        questions: [
            {
                id: "contentStatus",
                label: "Status do Conteúdo (Textos/Imagens)",
                type: "select",
                validation: z.string().min(1, "Status do conteúdo"),
                options: CONTENT_STATUS,
            },
            {
                id: "sitemap",
                label: "Estrutura de páginas sugerida (Sitemap)",
                type: "textarea",
                validation: z.string().optional(),
                placeholder: "Ex: Home, Sobre, Serviços, Contato...",
                optional: true,
            },
            {
                id: "seoKeywords",
                label: "Palavras-chave para SEO (se houver)",
                type: "textarea",
                validation: z.string().optional(),
                optional: true,
            },
        ]
    },
    {
        id: 5,
        title: "Especificações Técnicas",
        questions: [
            {
                id: "domainStatus",
                label: "Situação do Domínio e Hospedagem",
                type: "input",
                validation: z.string().min(2, "Domínio"),
                placeholder: "Ex: Já tenho domínio no GoDaddy...",
            },
            {
                id: "platformPreference",
                label: "Preferência de Plataforma? (Opcional)",
                type: "input",
                validation: z.string().optional(),
                placeholder: "Ex: WordPress, React, Webflow...",
                optional: true,
            },
            {
                id: "integrations",
                label: "Integrações necessárias (CRM, Pixel, Chat)",
                type: "textarea",
                validation: z.string().optional(),
                optional: true,
            },
            {
                id: "tracking",
                label: "Scripts de Tracking necessários?",
                type: "input",
                validation: z.string().optional(),
                placeholder: "GTM, Analytics, Hotjar...",
                optional: true,
            },
        ]
    },
];

export const devConfig: REIConfig = {
    type: 'dev',
    title: 'REI – Revenue Excellence Initiative',
    subtitle: 'Protocolo Web & Design',
    sections: devSections,
    totalQuestions: 16
};
