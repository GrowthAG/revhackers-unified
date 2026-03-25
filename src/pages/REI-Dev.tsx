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
    projectName: z.string().min(2, "Nome do projeto obrigatório"),
    mainContact: z.string().min(2, "Contato principal obrigatório"),
    email: z.string().email("E-mail inválido"),
    decisionMakers: z.string().min(2, "Quem aprova o projeto?"),
    deadline: z.string().min(2, "Prazo desejado"),
});

const section2Schema = z.object({
    projectType: z.string().min(1, "Selecione o tipo"),
    primaryGoal: z.string().min(5, "Qual o objetivo principal?"),
    successKpi: z.string().min(5, "O que define sucesso?"),
    competitors: z.string().optional(),
});

const section3Schema = z.object({
    brandGuidelines: z.string().min(1, "Selecione uma opção"),
    visualStyle: z.string().min(5, "Descreva o estilo visual"),
    inspirationSites: z.string().min(5, "Sites de referência"),
    dontLike: z.string().optional(),
});

const section4Schema = z.object({
    sitemap: z.string().optional(),
    contentStatus: z.string().min(1, "Status do conteúdo"),
    seoKeywords: z.string().optional(),
});

const section5Schema = z.object({
    domainStatus: z.string().min(2, "Domínio"),
    platformPreference: z.string().optional(),
    integrations: z.string().optional(),
    tracking: z.string().optional(),
});

const formSchema = section1Schema
    .merge(section2Schema)
    .merge(section3Schema)
    .merge(section4Schema)
    .merge(section5Schema);

type FormData = z.infer<typeof formSchema>;

const PROJECT_TYPES = ["Landing Page High-Ticket", "Site Institucional", "E-commerce", "Portal/Blog", "Redesign"];
const CONTENT_STATUS = ["Temos tudo pronto", "Temos parcialmente", "Precisamos criar do zero", "A agência deve criar"];
const BRAND_STATUS = ["Temos Brandbook completo", "Temos apenas Logo e Cores", "Precisamos de Rebranding", "Não temos identidade visual"];

const STEPS = [
    { id: 1, title: "Visão Geral" },
    { id: 2, title: "Estratégia" },
    { id: 3, title: "DNA Visual" },
    { id: 4, title: "Conteúdo & SEO" },
    { id: 5, title: "Especificações Técnicas" },
];

const ReiDevPage = () => {
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
        if (currentStep === 4) fieldsToValidate = Object.keys(section4Schema.shape);
        if (currentStep === 5) fieldsToValidate = Object.keys(section5Schema.shape);

        const isValid = await form.trigger(fieldsToValidate);

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
        let techScore = 60;
        let designScore = 60;
        let strategyScore = 60;
        let conversionPotential = 50;

        // Content Readiness influence
        if (data.contentStatus.includes("pronto")) { strategyScore += 20; conversionPotential += 10; }
        else if (data.contentStatus.includes("zero")) { strategyScore -= 10; }

        // Brand Readiness
        if (data.brandGuidelines.includes("completo")) { designScore += 30; }
        else if (data.brandGuidelines.includes("Não temos")) { designScore -= 10; }

        // Project Type complexity
        if (data.projectType.includes("High-Ticket")) conversionPotential += 30;
        if (data.projectType.includes("E-commerce")) techScore += 20;

        const totalScore = Math.round((techScore + designScore + strategyScore + conversionPotential) / 4);

        return {
            score: totalScore,
            radarData: [
                { label: "TECNOLOGIA", value: Math.min(100, techScore) },
                { label: "DESIGN", value: Math.min(100, designScore) },
                { label: "ESTRATÉGIA", value: Math.min(100, strategyScore) },
                { label: "CONVERSÃO", value: Math.min(100, conversionPotential) },
            ],
            insights: [
                data.contentStatus.includes("zero") ? "CRITICAL: A ausência de conteúdo estruturado é o maior gargalo técnico do projeto. Prioridade zero." : "DADO: Estrutura de conteúdo validada. Desenvolvimento acelerado em 2x.",
                data.brandGuidelines.includes("Não temos") ? "DIAGNÓSTICO: Identidade visual inexistente impacta na percepção de valor. Recomendação de Sprint de Branding." : "ANÁLISE: Ativos de marca integrados garantem consistência técnica na interface.",
                conversionPotential > 70 ? "RESULTADO: O projeto apresenta alto potencial de conversão baseado nos inputs estratégicos." : "AVISO: Foco estético excessivo identificado. Recomendamos validação de UX para garantir conversão."
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
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
    };

    if (showDashboard && metrics) {
        return (
            <PageLayout>
                <Section variant="dark" className="min-h-screen pt-28 pb-20">
                    <div className="container-custom max-w-6xl mx-auto">
                        <ReiDashboard
                            type="DEV"
                            score={metrics.score}
                            radarData={metrics.radarData}
                            insights={metrics.insights}
                            onAction={() => toast({ title: "Briefing Recebido", description: "Equipe técnica notificada." })}
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
                        <Link to="/rei" className="inline-flex items-center text-sm text-zinc-500 hover:text-revgreen mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Hub
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
                            REI – Revenue Excellence Initiative
                            <span className="block text-lg md:text-xl text-revgreen font-normal font-mono-tech mt-2 tracking-wide uppercase">
                                Protocolo Web & Design
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
                        <div className="flex justify-between mt-2 text-xs font-mono-tech text-zinc-500 uppercase tracking-widest">
                            <span>Etapa {currentStep} de {STEPS.length}</span>
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
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Visão Geral</h2>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Nome do Projeto/Empresa *</label>
                                            <input {...form.register("projectName")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-zinc-700" />
                                            {form.formState.errors.projectName && <p className="text-red-500 text-xs">{form.formState.errors.projectName.message}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">Nome do Responsável *</label>
                                                <input {...form.register("mainContact")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-zinc-700" />
                                                {form.formState.errors.mainContact && <p className="text-red-500 text-xs">{form.formState.errors.mainContact.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-300">E-mail de contato *</label>
                                                <input {...form.register("email")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-zinc-700" />
                                                {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Quem são os tomadores de decisão? *</label>
                                            <input {...form.register("decisionMakers")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-zinc-700" placeholder="Ex: Eu e o sócio..." />
                                            {form.formState.errors.decisionMakers && <p className="text-red-500 text-xs">{form.formState.errors.decisionMakers.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Qual o prazo desejado/ideal para lançamento? *</label>
                                            <input {...form.register("deadline")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all placeholder:text-zinc-700" placeholder="Ex: 30 dias, para Black Friday..." />
                                            {form.formState.errors.deadline && <p className="text-red-500 text-xs">{form.formState.errors.deadline.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Estratégia e Objetivos</h2>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Tipo de Projeto *</label>
                                            <select {...form.register("projectType")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all">
                                                <option value="">Selecione...</option>
                                                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            {form.formState.errors.projectType && <p className="text-red-500 text-xs">{form.formState.errors.projectType.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Qual o objetivo principal do novo site? *</label>
                                            <textarea {...form.register("primaryGoal")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" placeholder="Ex: Aumentar conversão de leads, Posicionamento de marca..." />
                                            {form.formState.errors.primaryGoal && <p className="text-red-500 text-xs">{form.formState.errors.primaryGoal.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">O que definirá que o projeto foi um sucesso? (KPIs) *</label>
                                            <textarea {...form.register("successKpi")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" />
                                            {form.formState.errors.successKpi && <p className="text-red-500 text-xs">{form.formState.errors.successKpi.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Quem são os principais concorrentes? (Por favor, cite o site se possível: ex: www.concorrente.com.br)</label>
                                            <textarea {...form.register("competitors")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Identidade Visual (Look & Feel)</h2>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Situação atual da Marca *</label>
                                            <select {...form.register("brandGuidelines")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all">
                                                <option value="">Selecione...</option>
                                                {BRAND_STATUS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            {form.formState.errors.brandGuidelines && <p className="text-red-500 text-xs">{form.formState.errors.brandGuidelines.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Descreva o estilo visual desejado (Vibe) *</label>
                                            <textarea {...form.register("visualStyle")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" placeholder="Ex: Minimalista, Dark mode, Industrial, Tech, Luxuoso..." />
                                            {form.formState.errors.visualStyle && <p className="text-red-500 text-xs">{form.formState.errors.visualStyle.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Sites de Referência (Links) *</label>
                                            <textarea {...form.register("inspirationSites")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" placeholder="Cole aqui os links de sites que você acha incríveis." />
                                            {form.formState.errors.inspirationSites && <p className="text-red-500 text-xs">{form.formState.errors.inspirationSites.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">O que você NÃO quer de jeito nenhum? (Anti-referências)</label>
                                            <textarea {...form.register("dontLike")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Conteúdo & Estrutura</h2>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Status do Conteúdo (Textos/Imagens) *</label>
                                            <select {...form.register("contentStatus")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all">
                                                <option value="">Selecione...</option>
                                                {CONTENT_STATUS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            {form.formState.errors.contentStatus && <p className="text-red-500 text-xs">{form.formState.errors.contentStatus.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Estrutura de páginas sugerida (Sitemap)</label>
                                            <textarea {...form.register("sitemap")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" placeholder="Ex: Home, Sobre, Serviços, Contato..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Palavras-chave para SEO (se houver)</label>
                                            <textarea {...form.register("seoKeywords")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-revgreen pl-4">Especificações Técnicas</h2>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Situação do Domínio e Hospedagem *</label>
                                            <input {...form.register("domainStatus")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all" placeholder="Ex: Já tenho domínio no GoDaddy..." />
                                            {form.formState.errors.domainStatus && <p className="text-red-500 text-xs">{form.formState.errors.domainStatus.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Preferência de Plataforma? (Opcional)</label>
                                            <input {...form.register("platformPreference")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all" placeholder="Ex: WordPress, React, Webflow..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Integrações necessárias (CRM, Pixel, Chat)</label>
                                            <textarea {...form.register("integrations")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all h-24" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300">Scripts de Tracking necessários?</label>
                                            <input {...form.register("tracking")} className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-revgreen focus:ring-1 focus:ring-revgreen outline-none transition-all" placeholder="GTM, Analytics, Hotjar..." />
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={`text-sm font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Anterior
                            </button>

                            <Button
                                onClick={currentStep === STEPS.length ? form.handleSubmit(onSubmit) : handleNext}
                                className="bg-revgreen hover:bg-revgreen/90 text-black border-0"
                            >
                                {currentStep === STEPS.length ? 'Gerar Dashboard Técnico' : 'Próximo'} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>

                    </div>
                </div>
            </Section>
        </PageLayout>
    );
};

export default ReiDevPage;
