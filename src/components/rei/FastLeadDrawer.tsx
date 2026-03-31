import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createOpportunity } from '@/api/opportunities';
import { Loader2, User, Building, Mail, Briefcase, Search } from 'lucide-react';
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
    cnpj: string;
    contact_role: string;
};

export const FastLeadDrawer: React.FC<FastLeadDrawerProps> = ({ open, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LeadData>({
        defaultValues: {
            cnpj: ''
        }
    });

    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
    const [cnpjFullData, setCnpjFullData] = useState<any>(null);

    const handleCnpjLookup = async (cnpjValue: string) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsSearchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado');
            const data = await response.json();

            setCnpjFullData(data); // Store the full object for enrichment_data

            // Always update trade_name and client_email if found
            if (data.razao_social) setValue('trade_name', data.razao_social);
            if (data.email) setValue('client_email', data.email.toLowerCase());

            toast({
                title: 'Dados da Empresa Localizados',
                description: `${data.razao_social}`,
            });
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            toast({
                title: 'CNPJ não localizado',
                description: 'Preencha os dados manualmente.',
                variant: 'destructive'
            });
        } finally {
            setIsSearchingCnpj(false);
        }
    };

    const watchedCnpj = watch('cnpj');
    useEffect(() => {
        if (watchedCnpj) {
            const cleanCnpj = watchedCnpj.replace(/\D/g, '');
            if (cleanCnpj.length === 14) {
                handleCnpjLookup(watchedCnpj);
            } else {
                setCnpjFullData(null); // Clear context if user deletes cnpj
            }
        } else {
            setCnpjFullData(null);
        }
    }, [watchedCnpj]);

    const onSubmit = async (data: LeadData) => {
        setLoading(true);
        try {
            const payloadEnrichment = cnpjFullData ? { cnpj: cnpjFullData } : null;

            // Cria oportunidade na tabela opportunities (entidade de venda)
            const result = await createOpportunity({
                client_name: data.client_name,
                client_company: data.trade_name || (cnpjFullData ? cnpjFullData.razao_social : ''),
                trade_name: data.trade_name || (cnpjFullData ? cnpjFullData.razao_social : ''),
                client_email: data.client_email,
                type: 'consulting',
                lead_source: 'manual',
                pipeline_stage: 'lead_inbound',
                opportunity_data: {
                    ...(data.cnpj ? { cnpj: data.cnpj } : {}),
                    ...(data.contact_role ? { contact_role: data.contact_role } : {}),
                } as any,
                enrichment_data: payloadEnrichment,
            });

            if (result.error) throw new Error(result.error);

            toast({
                title: 'Oportunidade Criada',
                description: `${data.trade_name} entrou no funil de vendas.`,
            });
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar oportunidade:', error);
            toast({
                title: 'Erro ao criar Oportunidade',
                description: error.message || 'Houve um erro na comunicacao com o servidor.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "bg-zinc-50 border-0 border-b-2 h-14 rounded-none transition-all font-bold text-base px-4 focus:ring-0 w-full border-zinc-200 text-black focus:border-[#00CC6A] focus:bg-white placeholder:text-zinc-400";
    const labelClasses = "text-xxs font-black uppercase tracking-widest pl-0.5 text-zinc-500 mb-1 block";

    const toTitleCase = (str: string) => {
        return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
    };

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-zinc-200 p-0 flex flex-col">
                <SheetHeader className="p-8 pb-6 border-b border-zinc-100 bg-zinc-50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <SheetTitle className="text-2xl font-black text-black tracking-tighter uppercase">Nova Oportunidade</SheetTitle>
                    </div>
                    <SheetDescription className="text-xs font-medium text-zinc-500">
                        Insira os dados da nova conta e o CNPJ para enriquecimento automático de background.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="fast-lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <Label className={labelClasses}>
                                CNPJ da Empresa {isSearchingCnpj && <Loader2 className="w-3 h-3 ml-2 inline animate-spin text-zinc-400" />}
                            </Label>
                            <div className="relative">
                                <div className="absolute left-4 top-4 w-5 h-5 flex items-center justify-center text-xs font-bold text-emerald-500">
                                    <Search className="w-4 h-4" />
                                </div>
                                <Input 
                                    {...register('cnpj')} 
                                    className={`${inputClasses} pl-12 text-emerald-700 bg-emerald-50/30 font-mono`} 
                                    placeholder="00.000.000/0000-00" 
                                    disabled={loading || isSearchingCnpj}
                                    onChange={(e) => {
                                        // Auto format CNPJ as user types
                                        let v = e.target.value.replace(/\D/g, "");
                                        if (v.length > 14) v = v.slice(0, 14);
                                        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
                                        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
                                        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
                                        v = v.replace(/(\d{4})(\d)/, "$1-$2");
                                        e.target.value = v;
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="h-px w-full bg-zinc-100 my-4" />

                        <div>
                            <Label className={labelClasses}>Nome Fantasia / Empresa</Label>
                            <div className="relative">
                                <Building className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                                <Input 
                                    {...register('trade_name', { required: true })} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="Razão Social auto-preenchida" 
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className={labelClasses}>Nome do Contato</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
                                    <Input 
                                        {...register('client_name', { required: true })} 
                                        className={`${inputClasses} pl-12 text-sm`} 
                                        placeholder="Ex: João da Silva" 
                                        disabled={loading}
                                    />
                                </div>
                                {cnpjFullData?.qsa && cnpjFullData.qsa.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                                        {cnpjFullData.qsa.slice(0, 3).map((socio: any, i: number) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setValue('client_name', toTitleCase(socio.nome_socio))}
                                                className="text-2xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 px-2 py-1 rounded transition-colors"
                                            >
                                                + {toTitleCase(socio.nome_socio.split(' ').slice(0, 2).join(' '))}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label className={labelClasses}>Papel na Compra</Label>
                                <Select onValueChange={(val) => setValue('contact_role', val)}>
                                    <SelectTrigger className="bg-zinc-50 border-0 border-b-2 h-14 rounded-none transition-all font-bold text-sm px-4 focus:ring-0 w-full border-zinc-200 text-black focus:border-[#00CC6A] focus:bg-white">
                                        <SelectValue placeholder="Selecione o papel..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Decisor">Decisor Institucional</SelectItem>
                                        <SelectItem value="Influenciador">Influenciador / Campeão</SelectItem>
                                        <SelectItem value="Avaliador Técnico">Avaliador Técnico</SelectItem>
                                        <SelectItem value="Usuário Final">Usuário Final</SelectItem>
                                    </SelectContent>
                                </Select>
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
                    </form>
                </div>

                <div className="p-6 border-t border-zinc-100 bg-white">
                    <Button 
                        type="submit" 
                        form="fast-lead-form"
                        className="w-full h-14 bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest transition-all"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Adicionar ao Pipeline"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
