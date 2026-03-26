import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';

export interface DiagnosticFormData {
    name: string;
    email: string;
    company: string;
    role: string;
    linkedin: string;
}

interface DiagnosticFormProps {
    onSubmit: (data: DiagnosticFormData) => void;
    isSubmitting: boolean;
    title?: string;
    subtitle?: string;
    showLinkedin?: boolean;
    variant?: 'light' | 'dark';
    diagnosticType?: string;
}

export const DiagnosticForm = ({
    onSubmit,
    isSubmitting,
    title = "Relatório Autorizado",
    subtitle = "Identificação Obrigatória",
    showLinkedin = false,
    variant = 'dark',
    diagnosticType = 'General'
}: DiagnosticFormProps) => {
    const [form, setForm] = useState<DiagnosticFormData>({
        name: '',
        email: '',
        company: '',
        role: '',
        linkedin: ''
    });

    const isDark = variant === 'dark';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...form, role: form.role || diagnosticType });
    };

    const inputClasses = `bg-transparent border-0 border-b h-14 rounded-none transition-all font-medium text-base px-4 focus:ring-0 w-full ${isDark
        ? "border-zinc-800 text-white focus:border-revgreen placeholder:text-zinc-800 hover:bg-zinc-900/40"
        : "border-zinc-200 text-black focus:border-black placeholder:text-zinc-300 hover:bg-zinc-50/50"
        }`;

    const labelClasses = `text-[10px] font-black uppercase tracking-widest pl-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto"
        >
            <div className="p-0 animate-fade-in box-content">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col gap-y-3">
                        <div className="space-y-1.5">
                            <Label className={labelClasses}>Nome Completo</Label>
                            <Input required className={inputClasses} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: João Silva" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelClasses}>E-mail Corporativo</Label>
                            <Input required type="email" className={inputClasses} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nome@empresa.com" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelClasses}>Nome da Empresa</Label>
                            <Input required className={inputClasses} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Nome da sua Organização" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className={labelClasses}>Cargo Estratégico</Label>
                            <Select onValueChange={val => setForm({ ...form, role: val })}>
                                <SelectTrigger className={`${inputClasses} shadow-none ring-0 focus:ring-offset-0 border-b`}>
                                    <SelectValue placeholder="Selecione seu papel" />
                                </SelectTrigger>
                                <SelectContent className={isDark ? "bg-zinc-950 border-zinc-800 text-zinc-50 rounded-none shadow-sm" : "bg-white border-zinc-100 text-black rounded-none shadow-sm"}>
                                    <SelectItem value="executivo-senior" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Executivo sênior</SelectItem>
                                    <SelectItem value="socio-vp" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Sócio / VP</SelectItem>
                                    <SelectItem value="chefe-diretor" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Chefe / Diretor</SelectItem>
                                    <SelectItem value="gerente-lider" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Gerente / Líder de equipe</SelectItem>
                                    <SelectItem value="especialista-consultor" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Especialista / Consultor</SelectItem>
                                    <SelectItem value="colaborador-individual" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Colaborador individual</SelectItem>
                                    <SelectItem value="autonomo" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Autônomo</SelectItem>
                                    <SelectItem value="estudante" className={isDark ? "text-zinc-100 focus:bg-zinc-900 focus:text-white cursor-pointer" : "cursor-pointer"}>Estudante</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {showLinkedin && (
                            <div className="space-y-1.5">
                                <Label className={labelClasses}>Perfil LinkedIn</Label>
                                <div className={`flex items-stretch border-b transition-all overflow-hidden ${isDark ? "border-zinc-800 focus-within:border-revgreen" : "border-zinc-200 focus-within:border-black"}`}>
                                    <div className={`px-4 flex items-center gap-2.5 border-r select-none ${isDark ? "bg-zinc-950/50 border-zinc-800 text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-400"}`}>
                                        <Linkedin className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-mono font-bold tracking-tight">linkedin.com/in/</span>
                                    </div>
                                    <Input
                                        required
                                        className="border-0 h-14 bg-transparent text-base px-4 focus:ring-0 w-full font-medium"
                                        value={form.linkedin}
                                        onChange={e => setForm({ ...form, linkedin: e.target.value })}
                                        placeholder="seu-perfil"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex flex-col items-center gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full px-16 h-14 font-black tracking-[0.3em] uppercase text-[11px] rounded-sm transition-all duration-500 border ${isDark
                                ? "bg-revgreen text-black hover:bg-white hover:text-black border-transparent"
                                : "bg-black text-white hover:bg-revgreen hover:text-black shadow-sm shadow-zinc-200 border-black"
                                }`}
                        >
                            {isSubmitting ? 'PROCESSANDO_DADOS...' : 'LIBERAR RELATÓRIO OFICIAL'}
                        </Button>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                            <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                            Ambiente Seguro & Criptografado
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};
