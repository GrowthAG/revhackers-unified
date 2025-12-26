import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
const section4Schema = z.object({});
const section5Schema = z.object({});

const section6Schema = z.object({
    salesChannels: z.string().min(2, "Campo obrigatório"),
    marketingTools: z.string().min(2, "Campo obrigatório"),
    adBudget: z.string().optional(),
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

        // Skip validation for placeholder steps 4 & 5
        let isValid = true;
        if (currentStep !== 4 && currentStep !== 5) {
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
                dataScore < 50 ? "🚨 Você está voando às cegas. Sem dados claros, escalar é impossível." : "✅ Você tem dados, agora precisa transformá-los em insights acionáveis.",
                teamSize < 2 ? "⚠️ Time comercial subdimensionado. O gargalo do crescimento está na capacidade de atendimento." : "👥 Tamanho de time saudável. O foco deve ser eficiência e treinamento.",
                processScore > 70 ? "🚀 Seus processos parecem maduros para aguentar escala agressiva." : "📉 Processos frágeis quebrarão se aumentarmos o volume de leads agora."
            ]
        };
    };

    const onSubmit = (data: FormData) => {
        console.log("FINAL FORM DATA:", data);
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
                <Section variant="dark" className="min-h-screen pt-28 pb-20">
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
            <Section variant="dark" className="min-h-screen pt-28 pb-20">
                <div className="container-custom max-w-4xl mx-auto">

                    <div className="mb-12">
                        <Link to="/rei" className="inline-flex items-center text-sm text-gray-500 hover:text-revgreen mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Hub
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
                            REI – Revenue Excellence Initiative
                            <span className="block text-lg md:text-xl text-revgreen font-normal font-mono-tech mt-2 tracking-wide">
                                Protocolo de Consultoria 360º
                            </span>
                        </h1>

                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-8 overflow-hidden">
                            <motion.div
                                className="h-full bg-revgreen"
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-mono-tech text-gray-500 uppercase tracking-widest">
                            <span>Seção {currentStep} de {STEPS.length}</span>
                            <span>{STEPS[currentStep - 1].title}</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-sm p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
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
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Informações Básicas</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Nome *</label>
                                                <input {...form.register("name")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Seu nome completo" />
                                                {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Cargo *</label>
                                                <input {...form.register("role")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="CEO, Diretor..." />
                                                {form.formState.errors.role && <p className="text-red-500 text-xs">{form.formState.errors.role.message}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">E-mail *</label>
                                                <input {...form.register("email")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="seu@email.com" />
                                                {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">WhatsApp *</label>
                                                <input {...form.register("whatsapp")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="(11) 99999-9999" />
                                                {form.formState.errors.whatsapp && <p className="text-red-500 text-xs">{form.formState.errors.whatsapp.message}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Empresa *</label>
                                                <input {...form.register("companyName")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Nome da empresa" />
                                                {form.formState.errors.companyName && <p className="text-red-500 text-xs">{form.formState.errors.companyName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Site</label>
                                                <input {...form.register("companySite")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="https://..." />
                                                {form.formState.errors.companySite && <p className="text-red-500 text-xs">{form.formState.errors.companySite.message}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Setor *</label>
                                            <select {...form.register("sector")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 bg-black/50">
                                                <option value="">Selecione...</option>
                                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {form.formState.errors.sector && <p className="text-red-500 text-xs">{form.formState.errors.sector.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Receita Anual</label>
                                            {REVENUES.map((rev) => (
                                                <label key={rev} className="flex items-center space-x-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                                                    <input type="radio" value={rev} {...form.register("annualRevenue")} className="accent-revgreen" />
                                                    <span className="text-gray-400 text-sm">{rev}</span>
                                                </label>
                                            ))}
                                            {form.formState.errors.annualRevenue && <p className="text-red-500 text-xs">{form.formState.errors.annualRevenue.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Produto e Expectativas</h2>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">O que você espera ter de resultados nos próximos 12 meses? *</label>
                                            <textarea {...form.register("results12Months")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-32" placeholder="Descreva seus objetivos..." />
                                            {form.formState.errors.results12Months && <p className="text-red-500 text-xs">{form.formState.errors.results12Months.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Qual solução (produto/serviço) sua empresa oferece? *</label>
                                            <textarea {...form.register("solutionOffer")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-32" placeholder="Descreva sua solução..." />
                                            {form.formState.errors.solutionOffer && <p className="text-red-500 text-xs">{form.formState.errors.solutionOffer.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Possui diferentes Planos ou Pacotes? *</label>
                                            <select {...form.register("hasPlans")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 bg-black/50">
                                                <option value="">Selecione...</option>
                                                {PLAN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {form.formState.errors.hasPlans && <p className="text-red-500 text-xs">{form.formState.errors.hasPlans.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Cite 3 Vantagens competitivas *</label>
                                            <textarea {...form.register("advantages")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="1. ...&#10;2. ...&#10;3. ..." />
                                            {form.formState.errors.advantages && <p className="text-red-500 text-xs">{form.formState.errors.advantages.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Qual o seu público-alvo? *</label>
                                            <textarea {...form.register("targetAudience")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="Descreva quem compra de você..." />
                                            {form.formState.errors.targetAudience && <p className="text-red-500 text-xs">{form.formState.errors.targetAudience.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Problemas e Dores</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Descrição do ICP *</label>
                                                <textarea {...form.register("icp")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="Perfil de cliente ideal..." />
                                                {form.formState.errors.icp && <p className="text-red-500 text-xs">{form.formState.errors.icp.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Dados Demográficos *</label>
                                                <textarea {...form.register("demographics")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="Idade, gênero, localização..." />
                                                {form.formState.errors.demographics && <p className="text-red-500 text-xs">{form.formState.errors.demographics.message}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais problemas mais recorrentes seu produto resolve? *</label>
                                            <textarea {...form.register("recurrentProblems")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.recurrentProblems && <p className="text-red-500 text-xs">{form.formState.errors.recurrentProblems.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais as principais dores do cliente ao te procurar? *</label>
                                            <textarea {...form.register("clientPains")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.clientPains && <p className="text-red-500 text-xs">{form.formState.errors.clientPains.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">O que o cliente perde se NÃO comprar de você? *</label>
                                            <textarea {...form.register("lossIfNotBuying")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.lossIfNotBuying && <p className="text-red-500 text-xs">{form.formState.errors.lossIfNotBuying.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais respostas emocionais positivas seu cliente busca? (Opcional)</label>
                                            <textarea {...form.register("emotionalResponse")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Seu produto economiza TEMPO ou DINHEIRO? Como? *</label>
                                            <textarea {...form.register("savingTimeMoney")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.savingTimeMoney && <p className="text-red-500 text-xs">{form.formState.errors.savingTimeMoney.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Onde seu cliente procura respostas para os problemas dele? *</label>
                                            <textarea {...form.register("searchChannels")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="Google, Youtube, Indicação..." />
                                            {form.formState.errors.searchChannels && <p className="text-red-500 text-xs">{form.formState.errors.searchChannels.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">O que CAUSA os problemas do seu cliente? *</label>
                                            <textarea {...form.register("problemCauses")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.problemCauses && <p className="text-red-500 text-xs">{form.formState.errors.problemCauses.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais locais seu cliente frequenta? (Opcional)</label>
                                            <textarea {...form.register("hangoutSpots")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais as principais palavras-chave de busca? *</label>
                                            <textarea {...form.register("keywords")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.keywords && <p className="text-red-500 text-xs">{form.formState.errors.keywords.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {(currentStep === 4 || currentStep === 5) && (
                                    <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10 border-dashed">
                                        <h3 className="text-xl text-white font-mono-tech mb-2">Aguardando Input</h3>
                                        <p className="text-gray-500">Conteúdo da Seção {currentStep} em breve.</p>
                                        <p className="text-xs text-gray-600 mt-4">Clique em "Próximo" para avançar para as seções já implementadas.</p>
                                    </div>
                                )}

                                {currentStep === 6 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Vendas e Marketing</h2>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais principais canais de vendas você utiliza e quais têm melhor performance? *</label>
                                            <textarea {...form.register("salesChannels")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.salesChannels && <p className="text-red-500 text-xs">{form.formState.errors.salesChannels.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais ferramentas de marketing sua empresa utiliza atualmente? *</label>
                                            <textarea {...form.register("marketingTools")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.marketingTools && <p className="text-red-500 text-xs">{form.formState.errors.marketingTools.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Qual valor você pretende investir em mídia paga por mês?</label>
                                            <input {...form.register("adBudget")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="R$ 5.000,00" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Restrição de horário para anúncios? (Se não, responda 'Não')</label>
                                            <input {...form.register("adRestrictions")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Ex: Não veicular aos domingos..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Em quais regiões seus anúncios devem veicular? *</label>
                                            <textarea {...form.register("adRegions")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="São Paulo, Brasil todo..." />
                                            {form.formState.errors.adRegions && <p className="text-red-500 text-xs">{form.formState.errors.adRegions.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Já testou alguma estratégia de marketing? Se sim, qual foi a mais eficaz?</label>
                                            <textarea {...form.register("pastStrategies")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Quantos SDRs no time? *</label>
                                                <input {...form.register("sdrCount")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Ex: 2" />
                                                {form.formState.errors.sdrCount && <p className="text-red-500 text-xs">{form.formState.errors.sdrCount.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Quantos Closers no time? *</label>
                                                <input {...form.register("closerCount")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Ex: 1" />
                                                {form.formState.errors.closerCount && <p className="text-red-500 text-xs">{form.formState.errors.closerCount.message}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Qual seu CRM atual? *</label>
                                                <input {...form.register("currentCrm")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Ex: HubSpot, Pipedrive..." />
                                                {form.formState.errors.currentCrm && <p className="text-red-500 text-xs">{form.formState.errors.currentCrm.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Qual sua ferramenta de marketing? *</label>
                                                <input {...form.register("currentMarketingTool")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700" placeholder="Ex: RD Station..." />
                                                {form.formState.errors.currentMarketingTool && <p className="text-red-500 text-xs">{form.formState.errors.currentMarketingTool.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 7 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Recursos e Processos</h2>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Qual é o ciclo de vendas típico do seu produto/serviço? *</label>
                                            <textarea {...form.register("salesCycle")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" placeholder="Desde o primeiro contato até o fechamento..." />
                                            {form.formState.errors.salesCycle && <p className="text-red-500 text-xs">{form.formState.errors.salesCycle.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Você realiza nutrição de leads e acompanhamento pós-vendas? Como?</label>
                                            <textarea {...form.register("leadNurturing")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Qual o principal fator de decisão que faz clientes fecharem com você? *</label>
                                            <textarea {...form.register("mainDecisionFactor")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.mainDecisionFactor && <p className="text-red-500 text-xs">{form.formState.errors.mainDecisionFactor.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Quais as principais estratégias que gostaria de explorar para crescer? *</label>
                                            <textarea {...form.register("growthStrategies")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.growthStrategies && <p className="text-red-500 text-xs">{form.formState.errors.growthStrategies.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Sua empresa possui materiais de marketing existentes? *</label>
                                            <select {...form.register("marketingMaterials")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 bg-black/50">
                                                <option value="">Selecione...</option>
                                                {MARKETING_ASSET_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {form.formState.errors.marketingMaterials && <p className="text-red-500 text-xs">{form.formState.errors.marketingMaterials.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Existe alguma limitação legal ou técnica que a agência precisa saber?</label>
                                            <textarea {...form.register("limitations")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Como é o processo de aprovação interno para campanhas e ações? *</label>
                                            <textarea {...form.register("approvalProcess")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-gray-700 h-24" />
                                            {form.formState.errors.approvalProcess && <p className="text-red-500 text-xs">{form.formState.errors.approvalProcess.message}</p>}
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`text-sm font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Anterior
                            </button>

                            <Button
                                onClick={currentStep === STEPS.length ? form.handleSubmit(onSubmit) : handleNext}
                                className="bg-revgreen hover:bg-revgreen/90 text-black border-0"
                            >
                                {currentStep === STEPS.length ? 'Gerar Diagnóstico' : 'Próximo'} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>

                    </div>
                </div>
            </Section>
        </PageLayout>
    );
};

export default ReiConsultingPage;
