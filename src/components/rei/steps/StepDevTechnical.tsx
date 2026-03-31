import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StepDevTechnicalProps {
    form: UseFormReturn<any>;
}

const PROJECT_TYPES = ["Landing Page High-Ticket", "Site Institucional", "E-commerce", "Portal/Blog", "Redesign"];
const CONTENT_STATUS = ["Temos tudo pronto", "Temos parcialmente", "Precisamos criar do zero", "A agência deve criar"];
const BRAND_STATUS = ["Temos Brandbook completo", "Temos apenas Logo e Cores", "Precisamos de Rebranding", "Não temos identidade visual"];
const CMS_OPTIONS = ["WordPress (Elementor)", "Next.js (Custom)", "Shopify", "Webflow", "Sem preferência"];

const FEATURES = [
    { id: 'form', label: 'Formulário de Contato / Lead' },
    { id: 'blog', label: 'Blog / Área de Conteúdo' },
    { id: 'dashboard', label: 'Dashboard / Área Logada' },
    { id: 'integrations', label: 'Integrações (CRM, Automação)' },
    { id: 'ecom', label: 'Checkout / E-commerce básico' }
];

export default function StepDevTechnical({ form }: StepDevTechnicalProps) {
    const features = form.watch('desiredFeatures') || [];

    const toggleFeature = (featureId: string) => {
        const current = form.getValues('desiredFeatures') || [];
        if (current.includes(featureId)) {
            form.setValue('desiredFeatures', current.filter((f: string) => f !== featureId));
        } else {
            form.setValue('desiredFeatures', [...current, featureId]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Briefing Técnico
                </h2>
                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                    Etapa 02: Escopo & Tech
                </p>
            </div>

            <div className="space-y-8">
                {/* Goal Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Principal Objetivo do Site
                    </Label>
                    <Select onValueChange={(val) => form.setValue('main_goal', val)} defaultValue={form.watch('main_goal')}>
                        <SelectTrigger className="w-full bg-white border-zinc-200">
                            <SelectValue placeholder="O que o site precisa resolver?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="vendas">Vendas Diretas / Conversão</SelectItem>
                            <SelectItem value="autoridade">Autoridade / Posicionamento</SelectItem>
                            <SelectItem value="leads">Geração de Leads B2B</SelectItem>
                            <SelectItem value="informativo">Informativo / Educação</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Platforms/Hosting */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Hospedagem / Plataforma Atual
                    </Label>
                    <input
                        {...form.register('current_platform')}
                        placeholder="Ex: WordPress, Wix, Hostgator, ou 'Não tenho'..."
                        className="w-full h-10 px-3 py-2 text-sm bg-white border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                </div>

                {/* Project Type */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Tipo de Projeto
                    </Label>
                    <Select onValueChange={(val) => form.setValue('projectType', val)} defaultValue={form.watch('projectType')}>
                        <SelectTrigger className="w-full bg-white border-zinc-200">
                            <SelectValue placeholder="Selecione o tipo de projeto" />
                        </SelectTrigger>
                        <SelectContent>
                            {PROJECT_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Content Status */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Status do Conteúdo
                    </Label>
                    <Select onValueChange={(val) => form.setValue('contentStatus', val)} defaultValue={form.watch('contentStatus')}>
                        <SelectTrigger className="w-full bg-white border-zinc-200">
                            <SelectValue placeholder="Status do conteúdo textual e imagens" />
                        </SelectTrigger>
                        <SelectContent>
                            {CONTENT_STATUS.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Brand Status */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Status da Marca
                    </Label>
                    <Select onValueChange={(val) => form.setValue('brandGuidelines', val)} defaultValue={form.watch('brandGuidelines')}>
                        <SelectTrigger className="w-full bg-white border-zinc-200">
                            <SelectValue placeholder="Identidade visual da empresa" />
                        </SelectTrigger>
                        <SelectContent>
                            {BRAND_STATUS.map((status) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* CMS Preference */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Preferência de Plataforma
                    </Label>
                    <Select onValueChange={(val) => form.setValue('cmsPreference', val)} defaultValue={form.watch('cmsPreference')}>
                        <SelectTrigger className="w-full bg-white border-zinc-200">
                            <SelectValue placeholder="Tecnologia / CMS desejado" />
                        </SelectTrigger>
                        <SelectContent>
                            {CMS_OPTIONS.map((cms) => (
                                <SelectItem key={cms} value={cms}>{cms}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Funcionalidades Desejadas
                    </Label>
                    <div className="space-y-2">
                        {FEATURES.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-zinc-50 border border-zinc-100">
                                <Checkbox
                                    id={item.id}
                                    checked={features.includes(item.id)}
                                    onCheckedChange={() => toggleFeature(item.id)}
                                />
                                <Label htmlFor={item.id} className="text-sm text-zinc-600 cursor-pointer">{item.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Design Style */}
                <div className="space-y-4">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Estilo Visual Desejado
                    </Label>
                    <RadioGroup
                        onValueChange={(val) => form.setValue('design_style', val)}
                        defaultValue={form.watch('design_style')}
                        className="flex flex-col space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="clean" id="clean" />
                            <Label htmlFor="clean">Minimalista & Clean (SaaS Standard)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bold" id="bold" />
                            <Label htmlFor="bold">Bold & High Contrast (Impacto)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tech" id="tech" />
                            <Label htmlFor="tech">Dark Mode / Cyberpunk (Tech)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* References */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-black uppercase tracking-wider">
                        Referências de Design
                    </Label>
                    <Textarea
                        {...form.register('design_references')}
                        placeholder="Cole links de sites que você gosta visualmente..."
                        className="min-h-[100px] bg-white border-zinc-200"
                    />
                </div>
            </div>
        </div>
    );
}
