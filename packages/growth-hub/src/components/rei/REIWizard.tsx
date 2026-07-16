import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { saveReiDiagnostic } from '@/api/reiResponses';
import { REIType } from '@/types/rei';

// Import dos Steps
import Step1Identificacao from './steps/Step1Identificacao';
import Step2Contexto from './steps/Step2Contexto';
import Step3Desafios from './steps/Step3Desafios';
import Step4Estrategia from './steps/Step4Estrategia';
import Step5Expectativas from './steps/Step5Expectativas';

interface REIWizardProps {
    projectId: string;
    type: REIType;
    onComplete?: (responseId: string) => void;
}

// Schema de validação fixo
const wizardSchema = z.object({
    // Step 1
    email: z.string().email('Email inválido'),

    // Step 2
    segmento: z.string().min(1, 'Selecione um segmento'),
    segmento_outro: z.string().optional(),
    tamanho: z.string().min(1, 'Selecione o tamanho'),
    ticketMedio: z.string().min(1, 'Informe o ticket médio'),
    cicloVendas: z.string().min(1, 'Selecione o ciclo de vendas'),
    mrr: z.string().min(1, 'Selecione o MRR'),
    modeloPrecificacao: z.string().min(1, 'Selecione o modelo de precificação'),
    taxaChurn: z.string().min(1, 'Selecione a taxa de churn'),

    // Step 3
    desafios: z.array(z.string()).min(1, 'Selecione pelo menos 1 desafio').max(2, 'Selecione no máximo 2 desafios'),
    metaCrescimento: z.string().min(1, 'Selecione uma meta'),
    orcamento: z.string().min(1, 'Selecione um orçamento'),
    prazo: z.string().min(1, 'Selecione um prazo'),
    metricaPrincipal: z.string().min(1, 'Selecione uma métrica'),
    gargaloFunil: z.string().min(1, 'Selecione um gargalo'),
    gargaloFunil_outro: z.string().optional(),
    processGap: z.string().min(10, 'Mínimo 10 caracteres').max(300),
    implementationAttempts: z.string().min(10, 'Mínimo 10 caracteres').max(400),
    executionConstraint: z.string().min(10, 'Mínimo 10 caracteres').max(300),

    // Step 4
    canaisAquisicao: z.array(z.string()).min(1, 'Selecione pelo menos 1 canal'),
    crm: z.string().min(1, 'Selecione um CRM'),
    crm_outro: z.string().optional(),
    timeGrowth: z.string().min(1, 'Selecione o tamanho do time'),
    metricas: z.array(z.string()),
    gargalo: z.string().min(1, 'Selecione um gargalo'),
    gargalo_outro: z.string().optional(),
    cacAtual: z.string().min(1, 'Selecione o CAC'),
    ltvAtual: z.string().min(1, 'Selecione o LTV'),

    // Step 5
    expectativas: z.array(z.string()).min(1, 'Selecione pelo menos 1 expectativa'),
    areasPrioridade: z.array(z.string()).min(1, 'Selecione pelo menos 1 área').max(3, 'Selecione no máximo 3 áreas'),
    prontidao: z.string().min(1, 'Selecione uma opção'),
    quandoComecar: z.string().min(1, 'Selecione quando começar'),
    observacoes: z.string().optional(),
});

type WizardFormData = z.infer<typeof wizardSchema>;

export default function REIWizard({ projectId, type, onComplete }: REIWizardProps) {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const TOTAL_STEPS = 5;

    const form = useForm<WizardFormData>({
        resolver: zodResolver(wizardSchema),
        mode: 'onChange'
    });

    const stepTitles = [
        'Identificação',
        'Contexto do Negócio',
        'Desafios & Objetivos',
        'Estratégia Atual',
        'Expectativas'
    ];

    const getFieldsForStep = (step: number): (keyof WizardFormData)[] => {
        switch (step) {
            case 1: return ['email'];
            case 2: return ['segmento', 'segmento_outro', 'tamanho', 'ticketMedio', 'cicloVendas', 'mrr', 'modeloPrecificacao', 'taxaChurn'];
            case 3: return ['desafios', 'metaCrescimento', 'orcamento', 'prazo', 'metricaPrincipal', 'gargaloFunil', 'gargaloFunil_outro', 'processGap', 'implementationAttempts', 'executionConstraint'];
            case 4: return ['canaisAquisicao', 'crm', 'crm_outro', 'timeGrowth', 'metricas', 'gargalo', 'gargalo_outro', 'cacAtual', 'ltvAtual'];
            case 5: return ['expectativas', 'areasPrioridade', 'prontidao', 'quandoComecar', 'observacoes'];
            default: return [];
        }
    };

    const handleNext = async () => {
        const fields = getFieldsForStep(currentStep);
        const isValid = await form.trigger(fields);

        if (isValid) {
            if (currentStep < TOTAL_STEPS) {
                setDirection(1);
                setCurrentStep(prev => prev + 1);
                window.scrollTo(0, 0);
            } else {
                form.handleSubmit(onSubmit)();
            }
        } else {
            toast({
                title: "Atenção",
                description: "Preencha os campos obrigatórios para continuar.",
                variant: "destructive",
            });
        }
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const onSubmit = async (data: WizardFormData) => {
        setIsSubmitting(true);
        try {
            const result = await saveReiDiagnostic(projectId, data);
            toast({
                title: "Diagnóstico Gerado",
                description: "Redirecionando para o resultado...",
                className: "bg-black text-white border-zinc-800"
            });
            if (onComplete) {
                onComplete(result.id);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast({
                title: "Erro",
                description: "Não foi possível salvar os dados.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Placeholder function if needed by child components
    const handleEmailBlur = () => {
        // Logic to check existing email if necessary
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return <Step1Identificacao form={form as any} onEmailBlur={handleEmailBlur} />;
            case 2: return <Step2Contexto form={form as any} />;
            case 3: return <Step3Desafios form={form as any} />;
            case 4: return <Step4Estrategia form={form as any} />;
            case 5: return <Step5Expectativas form={form as any} />;
            default: return null;
        }
    };

    const progress = (currentStep / TOTAL_STEPS) * 100;

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

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back to Hub */}
            <div className="mb-12 text-center">
                <Link to="/rei-hub" className="inline-flex items-center text-[10px] text-zinc-400 hover:text-black mb-10 transition-colors uppercase tracking-[0.2em] font-bold">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Voltar ao Hub
                </Link>

                {/* Header Clean */}
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tighter uppercase leading-none">
                        Protocolo Diagnóstico
                    </h1>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto bg-zinc-200 h-0.5 rounded-full mt-8 overflow-hidden">
                    <motion.div
                        className="h-full bg-black"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-zinc-400 uppercase tracking-widest max-w-md mx-auto">
                    <span>Etapa {currentStep} de {TOTAL_STEPS}</span>
                    <span>{stepTitles[currentStep - 1]}</span>
                </div>
            </div>

            {/* Questions Card */}
            <div className="bg-white border border-zinc-200 rounded-sm p-6 md:p-8 relative overflow-hidden">
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
                        {renderCurrentStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-200">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`text-sm font-medium text-zinc-500 hover:text-black transition-colors flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                    </button>

                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="bg-black hover:bg-zinc-800 text-white border-0"
                    >
                        {isSubmitting ? 'Salvando...' : currentStep === TOTAL_STEPS ? 'Gerar Diagnóstico' : 'Próximo'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
