import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { insertStageHistory } from '@/services/PipelineService';
import { Loader2, User, Building, Mail, Briefcase } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface FastLeadDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type LeadData = {
    trade_name: string;
    client_name: string;
    client_email: string;
    type: string;
};

export const FastLeadDrawer: React.FC<FastLeadDrawerProps> = ({ open, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LeadData>({
        defaultValues: {
            type: 'consulting'
        }
    });

    const onSubmit = async (data: LeadData) => {
        setLoading(true);
        try {
            // Criação ultrarrápida do Lead diretamente no banco rei_projects sem obrigatoriedade de tabela clients
            const { data: inserted, error } = await supabase.from('rei_projects').insert([{
                client_name: data.client_name,
                trade_name: data.trade_name,
                client_email: data.client_email,
                type: data.type,
                status: 'lead',
                pipeline_stage: 'lead_inbound',
                lead_source: 'manual',
                // Fallbacks obrigatorios da tabela, mas irrelevantes pro Lead ainda
                quarter: 'Q1',
                year: new Date().getFullYear(),
                project_duration: '90 dias',
                analyst_email: 'sales@revhackers.com.br',
                next_rei_date: new Date().toISOString()
            }]).select('id').single();

            if (error) throw error;

            // Registra historico inicial do pipeline (centralizado)
            if (inserted?.id) {
                await insertStageHistory({
                    projectId: inserted.id,
                    fromStage: null,
                    toStage: 'lead_inbound',
                    changedBy: 'fast_lead_drawer',
                });
            }

            toast({
                title: 'Oportunidade Criada',
                description: `${data.trade_name} entrou no funil de vendas.`,
            });
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar lead:', error);
            toast({
                title: 'Erro ao criar Lead',
                description: error.message || 'Houve um erro na comunicacao com o servidor.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "bg-zinc-50 border-0 border-b-2 h-14 rounded-none transition-all font-bold text-base px-4 focus:ring-0 w-full border-zinc-200 text-black focus:border-[#00CC6A] focus:bg-white placeholder:text-zinc-400";
    const labelClasses = "text-[10px] font-black uppercase tracking-widest pl-0.5 text-zinc-500 mb-1 block";

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-zinc-200 p-0 flex flex-col">
                <SheetHeader className="p-8 pb-6 border-b border-zinc-100 bg-zinc-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <SheetTitle className="text-2xl font-black text-black tracking-tighter uppercase">Nova Oportunidade</SheetTitle>
                    </div>
                    <SheetDescription className="text-xs font-medium text-zinc-500">
                        Crie um Lead rápido para entrar no Deal Rooms. O Cadastro completo de Projeto ocorrerá apenas no Onboarding.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="fast-lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <Label className={labelClasses}>Nome Fantasia / Empresa</Label>
                            <div className="relative">
                                <Building className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                                <Input 
                                    {...register('trade_name', { required: true })} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="Ex: AppleCorp" 
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className={labelClasses}>Nome do Contato (Founder)</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                                <Input 
                                    {...register('client_name', { required: true })} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="João da Silva" 
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className={labelClasses}>E-mail Principal</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                                <Input 
                                    {...register('client_email')} 
                                    type="email"
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="contato@empresa.com" 
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className={labelClasses}>Protocolo de Foco</Label>
                            <Select 
                                value={watch('type')} 
                                onValueChange={(val) => setValue('type', val)} 
                                disabled={loading}
                            >
                                <SelectTrigger className={`${inputClasses} bg-zinc-50`}>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-sm border-zinc-100">
                                    <SelectItem value="founder">Founder (LinkedIn / Autoridade)</SelectItem>
                                    <SelectItem value="crm_ops">RevOps (CRM & Playbooks)</SelectItem>
                                    <SelectItem value="consulting">Protocolo REI 360º</SelectItem>
                                    <SelectItem value="funnels_impl">Growth (Funis de Vendas)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-zinc-100 bg-white">
                    <Button 
                        type="submit" 
                        form="fast-lead-form"
                        className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest rounded-xl transition-all"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Adicionar ao Pipeline"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
