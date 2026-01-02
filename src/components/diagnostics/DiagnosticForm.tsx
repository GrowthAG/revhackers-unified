import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

export interface DiagnosticFormData {
    name: string;
    email: string;
    company: string;
    role: string;
}

interface DiagnosticFormProps {
    onSubmit: (data: DiagnosticFormData) => void;
    isSubmitting: boolean;
    title?: string;
    subtitle?: string;
}

export const DiagnosticForm = ({ onSubmit, isSubmitting, title = "Relatório Autorizado", subtitle = "Identificação Obrigatória" }: DiagnosticFormProps) => {
    const [form, setForm] = useState<DiagnosticFormData>({
        name: '',
        email: '',
        company: '',
        role: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
        >
            <div className="p-0 md:p-8 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-black mb-4 tracking-tight uppercase leading-none">
                        {title}
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
                        {subtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Nome Completo</Label>
                        <Input required className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-400 font-medium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Digite seu nome" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">E-mail Corporativo</Label>
                        <Input required type="email" className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-400 font-medium" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nome@empresa.com" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Empresa</Label>
                        <Input required className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-400 font-medium" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Nome da organização" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Cargo</Label>
                        <Select onValueChange={val => setForm({ ...form, role: val })}>
                            <SelectTrigger className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all font-medium"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200 text-black rounded-none">
                                <SelectItem value="vp">VP / C-Level</SelectItem>
                                <SelectItem value="diretor">Diretor(a)</SelectItem>
                                <SelectItem value="gerente">Gerente</SelectItem>
                                <SelectItem value="vendedor">Vendedor(a)</SelectItem>
                                <SelectItem value="analista">Analista</SelectItem>
                                <SelectItem value="growth">Growth / Mkt</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white hover:bg-zinc-800 h-14 mt-8 font-bold tracking-[0.2em] uppercase text-[10px] rounded-none shadow-none transition-all duration-300 border border-black"
                    >
                        {isSubmitting ? 'Processando...' : 'Liberar Relatório Oficial'}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
};
