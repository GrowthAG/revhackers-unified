import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import Section from '@/components/ui/Section';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ReiDashboard from '@/components/rei/ReiDashboard';

// --- SCHEMAS ---
const section1Schema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    role: z.string().min(2, "Cargo obrigatório"),
    email: z.string().email("E-mail inválido"),
    whatsapp: z.string().min(10, "WhatsApp inválido"),
    companyName: z.string().min(2, "Nome da empresa obrigatório"),
    companySite: z.string().url("URL inválida (inclua http:// ou https://)"),
    sector: z.string().min(1, "Selecione um setor"),
    annualRevenue: z.string().min(1, "Selecione a receita anual"),
});

const section2Schema = z.object({
    results12Months: z.string().min(5, "Campo obrigatório"),
    solutionOffer: z.string().min(5, "Campo obrigatório"),
    hasPlans: z.string().min(1, "Selecione uma opção"),
    advantages: z.string().min(5, "Campo obrigatório"),
    targetAudience: z.string().min(5, "Campo obrigatório"),
});

const section3Schema = z.object({
    icp: z.string().min(5, "Campo obrigatório"),
    demographics: z.string().min(5, "Campo obrigatório"),
    recurrentProblems: z.string().min(5, "Campo obrigatório"),
    clientPains: z.string().min(5, "Campo obrigatório"),
    lossIfNotBuying: z.string().min(5, "Campo obrigatório"),
    emotionalResponse: z.string().optional(),
    savingTimeMoney: z.string().min(5, "Campo obrigatório"),
    searchChannels: z.string().min(5, "Campo obrigatório"),
    problemCauses: z.string().min(5, "Campo obrigatório"),
    hangoutSpots: z.string().optional(),
    keywords: z.string().min(5, "Campo obrigatório"),
});

// Sections 4 & 5 Placeholders
const section4Schema = z.object({
    competitors: z.string().min(5, "Por favor, minimize os principais concorrentes"),
    marketOrientation: z.string().min(5, "Campo obrigatório"),
});
const section5Schema = z.object({});

const section6Schema = z.object({
    salesChannels: z.string().min(2, "Campo obrigatório"),
    marketingTools: z.string().min(2, "Campo obrigatório"),
    adBudget: z.string().optional(),
    cacCeilingTarget: z.string().min(2, "Campo obrigatório"),
    adRestrictions: z.string().optional(),
    adRegions: z.string().min(2, "Campo obrigatório"),
    pastStrategies: z.string().optional(),
    sdrCount: z.string().min(1, "Campo obrigatório"),
    closerCount: z.string().min(1, "Campo obrigatório"),
    currentCrm: z.string().min(2, "Campo obrigatório"),
    currentMarketingTool: z.string().min(2, "Campo obrigatório"),
});

const section7Schema = z.object({
    salesCycle: z.string().min(2, "Campo obrigatório"),
    leadNurturing: z.string().optional(),
    mqlSqlAttributes: z.string().min(2, "Campo obrigatório"),
    marketingSalesSla: z.string().min(2, "Campo obrigatório"),
    mainDecisionFactor: z.string().min(2, "Campo obrigatório"),
    growthStrategies: z.string().min(2, "Campo obrigatório"),
    marketingMaterials: z.string().min(1, "Selecione uma opção"),
    limitations: z.string().optional(),
    approvalProcess: z.string().min(2, "Campo obrigatório"),
});

// Combined Schema
const formSchema = section1Schema
    .merge(section2Schema)
    .merge(section3Schema)
    .merge(section4Schema)
    .merge(section6Schema)
    .merge(section7Schema);

type FormData = z.infer<typeof formSchema>;

const SECTORS = [
    "Software as a Service (SaaS)",
    "Tecnologia",
    "Startup",
    "B2B",
    "E-commerce",
    "Fintech",
    "EdTech",
    "Healthtech",
    "Logística",
    "Indústria",
    "Varejo",
    "Serviços",
    "Outro"
];

const REVENUES = [
    "Até R$ 500 mil",
    "Entre R$ 500 mil e R$ 1 milhão",
    "Entre R$ 1 milhão e R$ 3 milhões",
    "Entre R$ 3 milhões e R$ 5 milhões",
    "Entre R$ 5 milhões e R$ 10 milhões",
    "Acima de R$ 10 milhões",
    "Prefiro não responder agora"
];

const MARKETING_ASSET_OPTIONS = [
    "Sim, temos materiais completos",
    "Sim, mas são básicos",
    "Não temos materiais",
    "Temos alguns materiais"
];

const PLAN_OPTIONS = [
    "Sim, temos diferentes planos/pacotes",
    "Não, oferecemos apenas uma opção",
    "Oferecemos soluções personalizadas"
];

const STEPS = [
    { id: 1, title: "Informações Básicas" },
    { id: 2, title: "Produto e Expectativas" },
    { id: 3, title: "Problemas e Dores" },
    { id: 4, title: "Mercado e Concorrência" }, // Placeholder
    { id: 5, title: "Estrutura Comercial" },    // Placeholder
    { id: 6, title: "Vendas e Marketing" },
    { id: 7, title: "Recursos e Processos" },
];

const ReiConsultingPage = () => {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [showDashboard, setShowDashboard] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];

        if (currentStep === 1) fieldsToValidate = Object.keys(section1Schema.shape);
        if (currentStep === 2) fieldsToValidate = Object.keys(section2Schema.shape);
        if (currentStep === 3) fieldsToValidate = Object.keys(section3Schema.shape);
        if (currentStep === 6) fieldsToValidate = Object.keys(section6Schema.shape);
        if (currentStep === 7) fieldsToValidate = Object.keys(section7Schema.shape);

        // Skip validation for placeholder step 5
        let isValid = true;
        if (currentStep !== 5) {
            isValid = await form.trigger(fieldsToValidate);
        }

        if (isValid) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
            window.scrollTo(0, 0);
        } else {
            toast({
                title: "Campos obrigatórios",
                description: "Por favor, preencha todos os campos obrigatórios (*).",
                variant: "destructive"
            });
        }
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const calculateMetrics = (data: FormData) => {
        let processScore = 40;
        let peopleScore = 40;
        let dataScore = 30;
        let techScore = 40;

        // Revenue Influence
        if (data.annualRevenue.includes("Acima de") || data.annualRevenue.includes("10 milhões") || data.annualRevenue.includes("5 milhões")) {
            processScore += 20;
            peopleScore += 10;
        }

        // Tools influence
        if (data.currentCrm && data.currentCrm.length > 3) { techScore += 20; dataScore += 15; }
        if (data.currentMarketingTool && data.currentMarketingTool.length > 3) { techScore += 10; }

        // Team Influence
        const teamSize = parseInt(data.sdrCount || "0") + parseInt(data.closerCount || "0");
        if (teamSize > 3) peopleScore += 30;
        else if (teamSize > 0) peopleScore += 10;

        // Assets Influence
        if (data.marketingMaterials.includes("completos")) processScore += 20;

        const totalScore = Math.round((processScore + peopleScore + dataScore + techScore) / 4);

        return {
            score: totalScore,
            radarData: [
                { label: "PROCESSOS", value: Math.min(100, processScore) },
                { label: "PESSOAS", value: Math.min(100, peopleScore) },
                { label: "DADOS", value: Math.min(100, dataScore) },
                { label: "TECNOLOGIA", value: Math.min(100, techScore) },
            ],
            insights: [
                dataScore < 50 ? "DIAGNÓSTICO: Operação cega identificada. A ausência de dados claros inviabiliza a escala previsível." : "ANÁLISE: Infraestrutura de dados presente. Otimização necessária para converter dados em decisões estratégicas.",
                teamSize < 2 ? "ESTRUTURA: Time comercial subdimensionado. Capacidade de atendimento é o gargalo imediato do crescimento." : "MÉTRICA: Capacidade operacional adequada. Foco em eficiência de conversão e treinamento técnico.",
                processScore > 70 ? "PERFORMANCE: Maturidade processual elevada. Base sólida para suportar escala agressiva de leads." : "RISCO: Fragilidade processual detectada. A operação corre risco de ruptura sob alto volume de demanda."
            ]
        };
    };

    const onSubmit = (data: FormData) => {
        const calculated = calculateMetrics(data);
        setMetrics(calculated);
        setShowDashboard(true);
        window.scrollTo(0, 0);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    if (showDashboard && metrics) {
        return (
            <PageLayout>
                <Section variant="light" className="min-h-screen pt-28 pb-20 bg-white">
                    <div className="container-custom max-w-6xl mx-auto">
                        <ReiDashboard
                            type="CONSULTING"
                            score={metrics.score}
                            radarData={metrics.radarData}
                            insights={metrics.insights}
                            onAction={() => toast({ title: "Diagnóstico Completo", description: "Enviado para análise do consultor." })}
                        />
                    </div>
                </Section>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <section className="min-h-screen pt-32 pb-20 bg-white">
                <div className="container-custom max-w-4xl mx-auto">

                    <div className="mb-12">
                        <Link to="/rei" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Hub
                        </Link>

                        {/* White Minimal Header */}
                        <h1 className="text-4xl md:text-6xl font-black text-black mb-4 tracking-tighter leading-none">
                            REI Consulting<span className="text-revgreen">.</span>
                        </h1>
                        <p className="text-xl text-zinc-500 font-normal tracking-tight">
                            Protocolo de Consultoria 360º para operações de alto rendimento.
                        </p>

                        <div className="w-full bg-zinc-100 h-1 mt-12 overflow-hidden rounded-sm">
                            <motion.div
                                className="h-full bg-black"
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                        <div className="flex justify-between mt-3 text-xxs font-bold font-mono text-zinc-400 uppercase tracking-widest">
                            <span>Seção {currentStep} de {STEPS.length}</span>
                            <span>{STEPS[currentStep - 1].title}</span>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-sm p-8 md:p-12 shadow-sm relative overflow-hidden">
                        <AnimatePresence mode='wait' custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 1 && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-black mb-8 border-l-4 border-black pl-4 tracking-tight">Informações Básicas</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Nome *</label>
                                                <input {...form.register("name")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="Seu nome completo" />
                                                {form.formState.errors.name && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.name.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Cargo *</label>
                                                <input {...form.register("role")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="CEO, Diretor..." />
                                                {form.formState.errors.role && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.role.message}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">E-mail *</label>
                                                <input {...form.register("email")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="seu@email.com" />
                                                {form.formState.errors.email && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">WhatsApp *</label>
                                                <input {...form.register("whatsapp")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="(11) 99999-9999" />
                                                {form.formState.errors.whatsapp && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.whatsapp.message}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Empresa *</label>
                                                <input {...form.register("companyName")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="Nome da empresa" />
                                                {form.formState.errors.companyName && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.companyName.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Site</label>
                                                <input {...form.register("companySite")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="https://..." />
                                                {form.formState.errors.companySite && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.companySite.message}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Setor *</label>
                                            <select {...form.register("sector")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium appearance-none">
                                                <option value="">Selecione...</option>
                                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {form.formState.errors.sector && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.sector.message}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Receita Anual</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {REVENUES.map((rev) => (
                                                    <label key={rev} className="flex items-center space-x-3 p-3 rounded-sm bg-zinc-50 border border-zinc-100 hover:border-zinc-300 cursor-pointer transition-all">
                                                        <input type="radio" value={rev} {...form.register("annualRevenue")} className="accent-black w-4 h-4" />
                                                        <span className="text-zinc-700 text-sm font-medium">{rev}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {form.formState.errors.annualRevenue && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.annualRevenue.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-black mb-8 border-l-4 border-black pl-4 tracking-tight">Produto e Expectativas</h2>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Qual é a sua meta anual, e como ela se desdobra até o nível diário? *</label>
                                            <textarea {...form.register("results12Months")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-32 resize-none" placeholder="Qual a meta macro e quanto precisa vender por dia/semana?" />
                                            {form.formState.errors.results12Months && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.results12Months.message}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Qual solução (produto/serviço) sua empresa oferece? *</label>
                                            <textarea {...form.register("solutionOffer")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-32 resize-none" placeholder="Descreva sua solução..." />
                                            {form.formState.errors.solutionOffer && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.solutionOffer.message}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Possui diferentes Planos ou Pacotes? *</label>
                                            <select {...form.register("hasPlans")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium appearance-none">
                                                <option value="">Selecione...</option>
                                                {PLAN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {form.formState.errors.hasPlans && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.hasPlans.message}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Cite 3 Vantagens competitivas *</label>
                                            <textarea {...form.register("advantages")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" placeholder="1. ...&#10;2. ...&#10;3. ..." />
                                            {form.formState.errors.advantages && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.advantages.message}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Qual o seu público-alvo? *</label>
                                            <textarea {...form.register("targetAudience")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" placeholder="Descreva quem compra de você..." />
                                            {form.formState.errors.targetAudience && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.targetAudience.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-black mb-8 border-l-4 border-black pl-4 tracking-tight">Problemas e Dores</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">O ICP está documentado com clareza? *</label>
                                                <textarea {...form.register("icp")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" placeholder="Se sim, descreva os critérios e atributos exatos do seu ICP..." />
                                                {form.formState.errors.icp && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.icp.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Dados Demográficos *</label>
                                                <textarea {...form.register("demographics")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" placeholder="Idade, gênero, localização..." />
                                                {form.formState.errors.demographics && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.demographics.message}</p>}
                                            </div>
                                        </div>
                                        {/* Simplified repetitive TextAreas for brevity, maintaining style */}
                                        {[
                                            { id: "recurrentProblems", label: "Quais problemas mais recorrentes seu produto resolve? *" },
                                            { id: "clientPains", label: "Quais as principais dores do cliente ao te procurar? *" },
                                            { id: "lossIfNotBuying", label: "O que o cliente perde se NÃO comprar de você? *" },
                                            { id: "savingTimeMoney", label: "Seu produto economiza TEMPO ou DINHEIRO? Como? *" },
                                            { id: "searchChannels", label: "Onde seu cliente procura respostas? *", placeholder: "Google, Youtube..." },
                                            { id: "problemCauses", label: "O que CAUSA os problemas do seu cliente? *" },
                                            { id: "keywords", label: "Quais as principais palavras-chave de busca? *" }
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">{field.label}</label>
                                                <textarea {...form.register(field.id as any)} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" placeholder={field.placeholder || ""} />
                                                {form.formState.errors[field.id as keyof FormData] && <p className="text-red-500 text-xs font-medium mt-1">{(form.formState.errors[field.id as keyof FormData] as any)?.message}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-black mb-8 border-l-4 border-black pl-4 tracking-tight">Mercado e Concorrência</h2>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Quem são seus principais concorrentes? *</label>
                                            <p className="text-xxs text-zinc-400 italic mb-2">Dica: Inclua o site/URL se possível (ex: www.concorrente.com.br)</p>
                                            <textarea {...form.register("competitors")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-32 resize-none" placeholder="Concorrente 1 (www.c1.com.br)&#10;Concorrente 2 (www.c2.com.br)..." />
                                            {form.formState.errors.competitors && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.competitors.message}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Como você se diferencia no mercado hoje? *</label>
                                            <textarea {...form.register("marketOrientation")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-32 resize-none" placeholder="Preço, Qualidade, Tecnologia..." />
                                            {form.formState.errors.marketOrientation && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.marketOrientation.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 5 && (
                                    <div className="text-center py-20 bg-zinc-50 rounded-sm border border-zinc-200 border-dashed">
                                        <h3 className="text-xl text-black font-mono font-bold mb-2">Aguardando Input</h3>
                                        <p className="text-zinc-500">Conteúdo da Seção {currentStep} em breve.</p>
                                        <p className="text-xs text-zinc-400 mt-4">Clique em "Próximo" para avançar para as seções já implementadas.</p>
                                    </div>
                                )}

                                {currentStep === 6 && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-black mb-8 border-l-4 border-black pl-4 tracking-tight">Vendas e Marketing</h2>
                                        {[
                                            { id: "salesChannels", label: "Quais principais canais de vendas você utiliza? *" },
                                            { id: "marketingTools", label: "Quais ferramentas de marketing utiliza? *" },
                                            { id: "adRegions", label: "Regiões dos anúncios *" },
                                            { id: "pastStrategies", label: "Já testou alguma estratégia? Qual?" }
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">{field.label}</label>
                                                <textarea {...form.register(field.id as any)} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" />
                                                {form.formState.errors[field.id as keyof FormData] && <p className="text-red-500 text-xs font-medium mt-1">{(form.formState.errors[field.id as keyof FormData] as any)?.message}</p>}
                                            </div>
                                        ))}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 space-y-3 md:space-y-0">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Investimento Mensal (Mídia)</label>
                                                <input {...form.register("adBudget")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="R$ 5.000,00" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">CAC Teto e CAC Ideal *</label>
                                                <input {...form.register("cacCeilingTarget")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="Ex: Teto R$ 500, Ideal R$ 100" />
                                                {form.formState.errors.cacCeilingTarget && <p className="text-red-500 text-xs font-medium mt-1">{form.formState.errors.cacCeilingTarget.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">SDRs *</label>
                                                <input {...form.register("sdrCount")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="Ex: 2" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Closers *</label>
                                                <input {...form.register("closerCount")} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium" placeholder="Ex: 1" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 7 && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-black mb-8 border-l-4 border-black pl-4 tracking-tight">Recursos e Processos</h2>
                                        {[
                                            { id: "salesCycle", label: "Ciclo de vendas típico *" },
                                            { id: "leadNurturing", label: "Nutrição de leads?" },
                                            { id: "mqlSqlAttributes", label: "Critérios de MQL e SQL para Vendas *" },
                                            { id: "marketingSalesSla", label: "Existe SLA formal entre MKT e Vendas? *" },
                                            { id: "mainDecisionFactor", label: "Fator de decisão *" },
                                            { id: "growthStrategies", label: "Estratégias para crescer *" },
                                            { id: "approvalProcess", label: "Processo de aprovação *" }
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-zinc-500">{field.label}</label>
                                                <textarea {...form.register(field.id as any)} className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-4 text-black focus:border-black focus:ring-0 outline-none transition-all placeholder:text-zinc-400 text-sm font-medium h-24 resize-none" />
                                                {form.formState.errors[field.id as keyof FormData] && <p className="text-red-500 text-xs font-medium mt-1">{(form.formState.errors[field.id as keyof FormData] as any)?.message}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-zinc-100">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Anterior
                            </button>

                            <Button
                                onClick={currentStep === STEPS.length ? form.handleSubmit(onSubmit) : handleNext}
                                className="bg-black text-white hover:bg-revgreen hover:text-black h-12 px-8 rounded-sm text-xs font-bold uppercase tracking-widest"
                            >
                                {currentStep === STEPS.length ? 'Gerar Diagnóstico' : 'Próximo'} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
};

export default ReiConsultingPage;
