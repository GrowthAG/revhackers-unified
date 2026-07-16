import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

const SECTORS = ["Software as a Service (SaaS)", "Tecnologia", "Startup", "B2B", "E-commerce", "Fintech", "EdTech", "Healthtech", "Logística", "Indústria", "Varejo", "Serviços", "Outro"];
const REVENUES = ["Até R$ 500 mil", "Entre R$ 500 mil e R$ 1 milhão", "Entre R$ 1 milhão e R$ 3 milhões", "Entre R$ 3 milhões e R$ 5 milhões", "Entre R$ 5 milhões e R$ 10 milhões", "Acima de R$ 10 milhões", "Prefiro não responder agora"];
const PLAN_OPTIONS = ["Sim, temos diferentes planos/pacotes", "Não, oferecemos apenas uma opção", "Oferecemos soluções personalizadas"];
const MARKETING_ASSET_OPTIONS = ["Sim, temos materiais completos", "Sim, mas são básicos", "Não temos materiais", "Temos alguns materiais"];

export const consultingSections: REISection[] = [
    {
        id: 1,
        title: "Informações Básicas",
        questions: [
            { id: "name", label: "Nome", type: "input", validation: z.string().min(2, "Nome obrigatório"), placeholder: "Seu nome completo" },
            { id: "role", label: "Cargo", type: "input", validation: z.string().min(2, "Cargo obrigatório"), placeholder: "CEO, Diretor..." },
            { id: "email", label: "E-mail", type: "input", validation: z.string().email("E-mail inválido"), placeholder: "seu@email.com" },
            { id: "whatsapp", label: "WhatsApp", type: "input", validation: z.string().min(10, "WhatsApp inválido"), placeholder: "(11) 99999-9999" },
            { id: "companyName", label: "Empresa", type: "input", validation: z.string().min(2, "Nome da empresa obrigatório"), placeholder: "Nome da empresa" },
            { id: "companySite", label: "Site", type: "input", validation: z.string().url("URL inválida (inclua http:// ou https://)"), placeholder: "https://..." },
            { id: "sector", label: "Setor", type: "select", validation: z.string().min(1, "Selecione um setor"), options: SECTORS },
            { id: "annualRevenue", label: "Receita Anual", type: "select", validation: z.string().min(1, "Selecione a receita anual"), options: REVENUES },
        ]
    },
    {
        id: 2,
        title: "Produto e Expectativas",
        questions: [
            { id: "results12Months", label: "O que você espera ter de resultados nos próximos 12 meses?", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "Descreva seus objetivos..." },
            { id: "solutionOffer", label: "Qual solução (produto/serviço) sua empresa oferece?", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "Descreva sua solução..." },
            { id: "hasPlans", label: "Possui diferentes Planos ou Pacotes?", type: "select", validation: z.string().min(1, "Selecione uma opção"), options: PLAN_OPTIONS },
            { id: "advantages", label: "Cite 3 Vantagens competitivas", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "1. ...\n2. ...\n3. ..." },
            { id: "targetAudience", label: "Qual o seu público-alvo?", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "Descreva quem compra de você..." },
        ]
    },
    {
        id: 3,
        title: "Problemas e Dores",
        questions: [
            { id: "icp", label: "Descrição do ICP", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "Perfil de cliente ideal..." },
            { id: "demographics", label: "Dados Demográficos", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "Idade, gênero, localização..." },
            { id: "recurrentProblems", label: "Quais problemas mais recorrentes seu produto resolve?", type: "textarea", validation: z.string().min(5, "Campo obrigatório") },
            { id: "clientPains", label: "Quais as principais dores do cliente ao te procurar?", type: "textarea", validation: z.string().min(5, "Campo obrigatório") },
            { id: "lossIfNotBuying", label: "O que o cliente perde se NÃO comprar de você?", type: "textarea", validation: z.string().min(5, "Campo obrigatório") },
            { id: "emotionalResponse", label: "Quais respostas emocionais positivas seu cliente busca?", type: "textarea", validation: z.string().optional(), optional: true },
            { id: "savingTimeMoney", label: "Seu produto economiza TEMPO ou DINHEIRO? Como?", type: "textarea", validation: z.string().min(5, "Campo obrigatório") },
            { id: "searchChannels", label: "Onde seu cliente procura respostas para os problemas dele?", type: "textarea", validation: z.string().min(5, "Campo obrigatório"), placeholder: "Google, Youtube, Indicação..." },
            { id: "problemCauses", label: "O que CAUSA os problemas do seu cliente?", type: "textarea", validation: z.string().min(5, "Campo obrigatório") },
            { id: "hangoutSpots", label: "Quais locais seu cliente frequenta?", type: "textarea", validation: z.string().optional(), optional: true },
            { id: "keywords", label: "Quais as principais palavras-chave de busca?", type: "textarea", validation: z.string().min(5, "Campo obrigatório") },
        ]
    },
    {
        id: 4,
        title: "Vendas e Marketing",
        questions: [
            { id: "salesChannels", label: "Quais principais canais de vendas você utiliza e quais têm melhor performance?", type: "textarea", validation: z.string().min(2, "Campo obrigatório") },
            { id: "marketingTools", label: "Quais ferramentas de marketing sua empresa utiliza atualmente?", type: "textarea", validation: z.string().min(2, "Campo obrigatório") },
            { id: "adBudget", label: "Qual valor você pretende investir em mídia paga por mês?", type: "input", validation: z.string().optional(), placeholder: "R$ 5.000,00", optional: true },
            { id: "adRestrictions", label: "Restrição de horário para anúncios?", type: "input", validation: z.string().optional(), placeholder: "Ex: Não veicular aos domingos...", optional: true },
            { id: "adRegions", label: "Em quais regiões seus anúncios devem veicular?", type: "textarea", validation: z.string().min(2, "Campo obrigatório"), placeholder: "São Paulo, Brasil todo..." },
            { id: "pastStrategies", label: "Já testou alguma estratégia de marketing? Se sim, qual foi a mais eficaz?", type: "textarea", validation: z.string().optional(), optional: true },
            { id: "sdrCount", label: "Quantos SDRs no time?", type: "input", validation: z.string().min(1, "Campo obrigatório"), placeholder: "Ex: 2" },
            { id: "closerCount", label: "Quantos Closers no time?", type: "input", validation: z.string().min(1, "Campo obrigatório"), placeholder: "Ex: 1" },
            { id: "currentCrm", label: "Qual seu CRM atual?", type: "input", validation: z.string().min(2, "Campo obrigatório"), placeholder: "Ex: HubSpot, Pipedrive..." },
            { id: "currentMarketingTool", label: "Qual sua ferramenta de marketing?", type: "input", validation: z.string().min(2, "Campo obrigatório"), placeholder: "Ex: RD Station..." },
        ]
    },
    {
        id: 5,
        title: "Recursos e Processos",
        questions: [
            { id: "salesCycle", label: "Qual é o ciclo de vendas típico do seu produto/serviço?", type: "textarea", validation: z.string().min(2, "Campo obrigatório"), placeholder: "Desde o primeiro contato até o fechamento..." },
            { id: "leadNurturing", label: "Você realiza nutrição de leads e acompanhamento pós-vendas? Como?", type: "textarea", validation: z.string().optional(), optional: true },
            { id: "mainDecisionFactor", label: "Qual o principal fator de decisão que faz clientes fecharem com você?", type: "textarea", validation: z.string().min(2, "Campo obrigatório") },
            { id: "growthStrategies", label: "Quais as principais estratégias que gostaria de explorar para crescer?", type: "textarea", validation: z.string().min(2, "Campo obrigatório") },
            { id: "marketingMaterials", label: "Sua empresa possui materiais de marketing existentes?", type: "select", validation: z.string().min(1, "Selecione uma opção"), options: MARKETING_ASSET_OPTIONS },
            { id: "limitations", label: "Existe alguma limitação legal ou técnica que a agência precisa saber?", type: "textarea", validation: z.string().optional(), optional: true },
            { id: "approvalProcess", label: "Como é o processo de aprovação interno para campanhas e ações?", type: "textarea", validation: z.string().min(2, "Campo obrigatório") },
        ]
    },
];

export const consultingConfig: REIConfig = {
    type: 'consulting',
    title: 'REI – Revenue Excellence Initiative',
    subtitle: 'Protocolo de Consultoria 360º',
    sections: consultingSections,
    totalQuestions: 33
};
