import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
    createClient,
    updateClient,
    getClientById,
    type ClientInsert
} from '@/api/clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Building2, User, Mail, Globe, Search, Upload, ArrowRight, Lock, Activity } from 'lucide-react';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';

interface FormData {
    name: string;
    email: string;
    company?: string;
    cnpj?: string;
    cep?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    website?: string;
    logo_url?: string;
    status: 'onboarding' | 'active' | 'churned';
}

const formSchema = zod.object({
    name: zod.string().min(1, 'Obrigatório'),
    email: zod.string().email('E-mail inválido'),
    company: zod.string().optional(),
    cnpj: zod.string().optional(),
    cep: zod.string().optional(),
    address: zod.string().optional(),
    number: zod.string().optional(),
    complement: zod.string().optional(),
    neighborhood: zod.string().optional(),
    city: zod.string().optional(),
    state: zod.string().optional(),
    website: zod.string().optional(),
    logo_url: zod.string().optional(),
    status: zod.enum(['onboarding', 'active', 'churned'])
});

interface ClientFormContentProps {
    initialData?: FormData;
    isEditing?: boolean;
    mode?: 'admin' | 'public';
    clientId?: string;
    onSuccess?: (client: any) => void;
    onCancel?: () => void;
}

const ClientFormContent = ({ initialData, isEditing = false, mode = 'admin', clientId, onSuccess, onCancel }: ClientFormContentProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingClient, setLoadingClient] = useState(!!clientId && !initialData);
    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            status: 'onboarding'
        }
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingLogo(true);
        try {
            const publicUrl = await uploadImageToSupabase(file);
            if (publicUrl) {
                setValue('logo_url', publicUrl);
                toast({ title: 'Logo atualizado' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro no upload', variant: 'destructive' });
        } finally {
            setUploadingLogo(false);
        }
    };

    const discoverLogo = async (domain: string, shouldFillWebsite = false) => {
        if (!domain) return;
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        try {
            const logoUrl = `https://logo.clearbit.com/${cleanDomain}`;
            const imgCheck = new Image();
            imgCheck.src = logoUrl;
            imgCheck.onload = () => {
                setValue('logo_url', logoUrl);
                if (shouldFillWebsite) {
                    setValue('website', `www.${cleanDomain}`);
                }
                toast({
                    title: 'ASSET LOCALIZADO',
                    description: 'Logo e Domínio validados automaticamente.',
                });
            };
        } catch (e) {
            console.log('Logo auto-discovery failed', e);
        }
    };

    const handleCnpjLookup = async (cnpjValue: string) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsSearchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado');
            const data = await response.json();

            if (data.razao_social) setValue('company', data.razao_social);

            if (data.qsa && data.qsa.length > 0) {
                const primaryPartner = data.qsa[0].nome_socio;
                if (primaryPartner) setValue('name', primaryPartner);
            } else if (data.nome_fantasia) {
                setValue('name', data.nome_fantasia);
            }

            if (data.cep) setValue('cep', data.cep);
            if (data.logradouro) setValue('address', data.logradouro);
            if (data.numero) setValue('number', data.numero);
            if (data.complemento) setValue('complement', data.complemento);
            if (data.bairro) setValue('neighborhood', data.bairro);
            if (data.municipio) setValue('city', data.municipio);
            if (data.uf) setValue('state', data.uf);

            if (data.email) {
                setValue('email', data.email.toLowerCase());
                if (data.email.includes('@')) {
                    const domain = data.email.split('@')[1];
                    const generalDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'uol.com.br', 'bol.com.br', 'terra.com.br'];
                    if (!generalDomains.includes(domain)) {
                        discoverLogo(domain, true);
                    }
                }
            }

            toast({
                title: 'DADOS LOCALIZADOS',
                description: 'Mapeamento corporativo concluído com sucesso.',
            });
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            toast({
                title: 'CNPJ NÃO LOCALIZADO',
                description: 'Verifique o número ou preencha os dados manualmente.',
                variant: 'destructive'
            });
        } finally {
            setIsSearchingCnpj(false);
        }
    };

    useEffect(() => {
        if (clientId && !initialData) {
            loadClient();
        } else if (initialData) {
            for (const key in initialData) {
                if (Object.prototype.hasOwnProperty.call(initialData, key)) {
                    setValue(key as keyof FormData, initialData[key as keyof FormData]);
                }
            }
        }
    }, [clientId, initialData]);

    const loadClient = async () => {
        try {
            setLoadingClient(true);
            const client = await getClientById(clientId!);
            if (client) {
                setValue('name', client.name);
                setValue('email', client.email);
                setValue('company', client.company || '');
                setValue('website', client.website || '');
                setValue('status', client.status);
                setValue('cnpj', client.cnpj || '');
                setValue('cep', client.cep || '');
                setValue('address', client.address || '');
                setValue('number', client.number || '');
                setValue('complement', client.complement || '');
                setValue('neighborhood', client.neighborhood || '');
                setValue('city', client.city || '');
                setValue('state', client.state || '');
                setValue('logo_url', client.logo_url || '');
            } else {
                toast({ title: 'Cliente não encontrado', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Erro ao carregar cliente', variant: 'destructive' });
        } finally {
            setLoadingClient(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const clientData: ClientInsert = {
                name: data.name,
                email: data.email,
                company: data.company || undefined,
                cnpj: data.cnpj || undefined,
                cep: data.cep || undefined,
                address: data.address || undefined,
                number: data.number || undefined,
                complement: data.complement || undefined,
                neighborhood: data.neighborhood || undefined,
                city: data.city || undefined,
                state: data.state || undefined,
                website: data.website || undefined,
                logo_url: data.logo_url || undefined,
                status: data.status
            };

            let result;
            if (isEditing && clientId) {
                result = await updateClient(clientId, clientData);
                toast({
                    title: 'Cliente atualizado!',
                    description: 'As informações foram salvas com sucesso.'
                });
            } else {
                result = await createClient(clientData);
                toast({
                    title: 'Cliente cadastrado!',
                    description: 'As informações foram salvas com sucesso.'
                });
            }

            if (onSuccess && result) {
                onSuccess(result);
            }
            // Logic for redirecting if onSuccess is not provided logic is handled by parent, 
            // BUT here we should assume if onSuccess is NOT provided, we simply do nothing or let parent handle?
            // Actually, in the original code, it navigated.
            // Let's call onSuccess if passed, otherwise we can navigate inside this component IF we passed navigate props?
            // To keep it clean, let's assume parent handles navigation if onSuccess is passed, 
            // OR we can pass a 'shouldNavigate' prop?
            // For now, let's leave navigation for the parent wrapper component if needed, or rely on onSuccess.

        } catch (error: any) {
            console.error('Error saving client:', error);
            toast({
                title: 'Erro ao salvar cliente',
                description: error.message || 'Ocorreu um erro inesperado.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingClient) {
        return (
            <div className="flex h-64 items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl py-6 mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <div className="bg-white border border-zinc-200 p-10 space-y-12 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.02)]">
                    {/* Section: NOSSA TECNOLOGIA (Control) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                            <h3 className="text-[10px] font-black tracking-[0.4em] text-black flex items-center gap-3 uppercase">
                                NOSSA TECNOLOGIA
                            </h3>
                            {isSearchingCnpj && (
                                <div className="text-[8px] font-bold text-black tracking-widest flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> BUSCANDO_DADOS
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Consultar CNPJ</Label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                    <Input
                                        {...register('cnpj')}
                                        placeholder="00.000.000/0000-00"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val.replace(/\D/g, '').length === 14) {
                                                handleCnpjLookup(val);
                                            }
                                        }}
                                        className="pl-12 !bg-white border-zinc-200 rounded-none h-12 text-sm font-bold text-black focus:ring-0 focus:border-black transition-all hover:border-zinc-400 tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Identidade Visual (Asset)</Label>
                                <div
                                    className="h-32 border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center relative cursor-pointer hover:bg-zinc-50 transition-all group"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                    {watch('logo_url') ? (
                                        <div className="absolute inset-0 p-4 flex items-center justify-center">
                                            <img src={watch('logo_url')} className="h-full w-full object-contain" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button type="button" variant="secondary" size="sm" className="h-7 text-[8px] font-bold tracking-widest uppercase rounded-none">Substituir</Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-7 text-[8px] font-bold tracking-widest uppercase rounded-none bg-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setValue('logo_url', '');
                                                    }}
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-2">
                                            <Upload size={16} className="text-zinc-300 mx-auto" />
                                            <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">Anexar Logo do Cliente</span>
                                        </div>
                                    )}
                                    {uploadingLogo && (
                                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
                                            <Loader2 className="h-5 w-5 animate-spin text-black" />
                                            <span className="text-[8px] font-black tracking-widest text-black mt-2">ENVIANDO_ASSET...</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: IDENTIDADE DO CLIENTE */}
                    <div className="space-y-6 pt-6 border-t border-zinc-50">
                        <h3 className="text-[10px] font-black tracking-[0.4em] text-black border-l-4 border-black pl-5 flex items-center gap-3 uppercase">
                            <User size={12} className="text-black fill-black/10" /> Identidade do Cliente
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Nome Principal / Sócio</Label>
                                <Input {...register('name')} placeholder="Nome completo do responsável" className="!bg-white border-zinc-200 rounded-none h-12 text-sm font-bold text-black focus:ring-0 focus:border-black transition-colors" />
                                {errors.name && <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">E-mail Corporativo</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                    <Input
                                        {...register('email')}
                                        placeholder="exemplo@empresa.com.br"
                                        className="pl-12 !bg-white border-zinc-200 rounded-none h-12 text-sm font-bold text-black focus:ring-0 focus:border-black transition-colors"
                                        onBlur={(e) => {
                                            const email = e.target.value;
                                            if (email.includes('@')) {
                                                const domain = email.split('@')[1].toLowerCase();
                                                const generalDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'icloud.com'];

                                                if (!generalDomains.includes(domain)) {
                                                    if (!watch('website')) {
                                                        setValue('website', `www.${domain}`);
                                                    }
                                                    discoverLogo(domain);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                {errors.email && <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">{errors.email.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section: DADOS CORPORATIVOS */}
                    <div className="space-y-6 pt-6 border-t border-zinc-50">
                        <h3 className="text-[10px] font-black tracking-[0.4em] text-black border-l-4 border-zinc-400 pl-5 flex items-center gap-3 uppercase">
                            <Building2 size={12} className="text-zinc-600 fill-zinc-600/10" /> Dados Corporativos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Razão Social</Label>
                                <Input {...register('company')} placeholder="NOME DA EMPRESA LTDA" className="!bg-white border-zinc-200 rounded-none h-12 text-sm font-bold text-black focus:ring-0 focus:border-black transition-colors uppercase" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Digital Hub / Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                    <Input
                                        {...register('website')}
                                        placeholder="www.dominio.com.br"
                                        className="pl-12 !bg-white border-zinc-200 rounded-none h-12 text-sm font-bold text-black focus-visible:ring-0 focus-visible:border-black transition-colors"
                                        onBlur={(e) => discoverLogo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: LOCALIZAÇÃO CORPORATIVA (Automatic Mapping) */}
                    <div className="space-y-6 pt-6 border-t border-zinc-50">
                        <h3 className="text-[10px] font-black tracking-[0.4em] text-black border-l-4 border-zinc-200 pl-5 flex items-center gap-3 uppercase">
                            <div className="h-2 w-2 bg-zinc-300 rounded-full"></div> Localização Corporativa
                        </h3>

                        <div className="grid grid-cols-6 gap-4">
                            {/* CEP */}
                            <div className="col-span-2 md:col-span-1 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">CEP</Label>
                                <Input {...register('cep')} readOnly className="!bg-zinc-50 border-zinc-100 rounded-none h-10 text-xs font-medium text-zinc-500" />
                            </div>

                            {/* Endereço */}
                            <div className="col-span-4 md:col-span-4 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Logradouro</Label>
                                <Input {...register('address')} readOnly className="!bg-zinc-50 border-zinc-100 rounded-none h-10 text-xs font-medium text-zinc-500" />
                            </div>

                            {/* Número */}
                            <div className="col-span-2 md:col-span-1 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Número</Label>
                                <Input {...register('number')} className="!bg-white border-zinc-200 rounded-none h-10 text-xs font-bold text-black focus:border-black" />
                            </div>

                            {/* Complemento */}
                            <div className="col-span-4 md:col-span-2 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Complemento</Label>
                                <Input {...register('complement')} className="!bg-white border-zinc-200 rounded-none h-10 text-xs font-bold text-black focus:border-black" />
                            </div>

                            {/* Bairro */}
                            <div className="col-span-3 md:col-span-2 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Bairro</Label>
                                <Input {...register('neighborhood')} readOnly className="!bg-zinc-50 border-zinc-100 rounded-none h-10 text-xs font-medium text-zinc-500" />
                            </div>

                            {/* Cidade */}
                            <div className="col-span-3 md:col-span-2 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">Cidade</Label>
                                <Input {...register('city')} readOnly className="!bg-zinc-50 border-zinc-100 rounded-none h-10 text-xs font-medium text-zinc-500" />
                            </div>

                            {/* UF */}
                            <div className="col-span-2 md:col-span-1 space-y-2">
                                <Label className="text-[8px] font-mono-tech font-bold tracking-[0.2em] text-zinc-400 uppercase">UF</Label>
                                <Input {...register('state')} readOnly className="!bg-zinc-50 border-zinc-100 rounded-none h-10 text-xs font-medium text-zinc-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status (Admin Only) */}
                {mode === 'admin' && (
                    <div className="bg-white border border-zinc-200 p-8 space-y-6">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-black uppercase border-b border-zinc-100 pb-3">Status do Cliente</h3>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-wider">Estágio Atual</Label>
                            <div className="relative">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                <Select
                                    onValueChange={(value: any) => setValue('status', value)}
                                    defaultValue={watch('status')}
                                >
                                    <SelectTrigger className="pl-12 h-12 bg-white border border-zinc-200 rounded-none focus:ring-0 focus:border-black text-sm font-bold text-black tracking-widest transition-colors hover:border-zinc-400">
                                        <SelectValue placeholder="SELECIONE O STATUS..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-zinc-100 shadow-xl rounded-none">
                                        <SelectItem value="onboarding" className="text-xs uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer text-zinc-600 focus:text-black font-bold">Onboarding (Em andamento)</SelectItem>
                                        <SelectItem value="active" className="text-xs uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer text-zinc-600 focus:text-black font-bold">Ativo (Em operação)</SelectItem>
                                        <SelectItem value="churned" className="text-xs uppercase tracking-wider py-3 focus:bg-zinc-50 cursor-pointer text-zinc-600 focus:text-black font-bold">Churned (Cancelado)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-14 rounded-none border-zinc-200 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-zinc-50 transition-all shadow-none flex-1"
                            disabled={loading}
                        >
                            CANCELAR
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className={`h-14 rounded-none bg-black text-white hover:bg-zinc-800 transition-all font-black text-[9px] uppercase tracking-[0.4em] shadow-none gap-4 group ${mode === 'admin' || onCancel ? 'flex-[2]' : 'w-full'}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            mode === 'public' ? <span className="opacity-0 w-0"></span> : <Save size={16} />
                        )}

                        {isEditing ? 'SALVAR ALTERAÇÕES' : (mode === 'public' ? 'FINALIZAR CADASTRO' : 'CADASTRAR CLIENTE')}

                        {/* Public Mode Arrow */}
                        {mode === 'public' && !loading && (
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        )}
                    </Button>
                </div>

                {/* Security Badge */}
                {mode === 'public' && (
                    <div className="flex items-center justify-center gap-2 opacity-60 pt-4">
                        <div className="h-px w-6 bg-zinc-300"></div>
                        <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                            <Lock size={10} className="text-zinc-400" />
                            Ambiente Seguro End-to-End
                        </div>
                        <div className="h-px w-6 bg-zinc-300"></div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ClientFormContent;
