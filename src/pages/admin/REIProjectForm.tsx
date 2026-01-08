import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createReiProject, updateReiProject, getReiProjectById } from '@/api/reiProjects';
import { supabase } from '@/integrations/supabase/client';
import { getAllClients, type Client } from '@/api/clients';
import type { ReiProjectInsert } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Users, Calendar, Zap, Target, Search, FileText, ExternalLink, Edit2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ClientFormContent from './ClientFormContent';
import AdminLayout from '@/components/layout/AdminLayout'; // Replaces PageLayout
import AdminPageLayout from '@/components/layout/AdminPageLayout';

type FormData = {
    client_id?: string; // Added client_id
    client_name: string;
    client_email: string;
    client_company?: string;
    analyst_email: string;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year: number;
    next_rei_date: string;
};

const REIProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(!!id);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            year: new Date().getFullYear(),
            quarter: 'Q1'
        }
    });

    const [mode, setMode] = useState<'existing' | 'new'>('existing');
    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

    // Styling Constants (Diagnostic Standard)
    const inputClasses = "bg-transparent border-0 border-b h-14 rounded-none transition-all font-medium text-base px-4 focus:ring-0 w-full border-zinc-200 text-black focus:border-black placeholder:text-zinc-300 hover:bg-zinc-50/50";
    const labelClasses = "text-[10px] font-black uppercase tracking-widest pl-0.5 text-zinc-400";
    const sectionTitleClasses = "text-xs font-semibold text-zinc-900 border-b border-zinc-200 pb-2 flex items-center gap-2 mb-6";

    // ... CNPJ Logic (Keep same) ...
    const handleCnpjLookup = async (cnpjValue: string) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsSearchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado');
            const data = await response.json();

            if (data.razao_social) setValue('client_company', data.razao_social);
            if (data.email) setValue('client_email', data.email.toLowerCase());

            toast({
                title: 'Dados Corporativos Localizados',
                description: `Empresa: ${data.razao_social}`,
            });
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            toast({
                title: 'CNPJ não localizado',
                description: 'Prossiga com o preenchimento manual.',
                variant: 'destructive'
            });
        } finally {
            setIsSearchingCnpj(false);
        }
    };

    const isEditing = !!id;

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoadingClients(true);
            const clientsData = await getAllClients();
            setClients(clientsData);

            if (id) {
                setLoadingProject(true);
                const project = await getReiProjectById(id);
                if (project) {
                    setValue('client_id', (project as any).client_id || undefined);
                    setValue('client_name', project.client_name);
                    setValue('client_email', project.client_email);
                    setValue('client_company', project.client_company || '');
                    setValue('analyst_email', project.analyst_email);
                    setValue('quarter', project.quarter as any);
                    setValue('year', project.year);
                    setValue('next_rei_date', project.next_rei_date.split('T')[0]);
                } else {
                    toast({ title: 'Protocolo não encontrado', variant: 'destructive' });
                    navigate('/admin/rei');
                }
            }
        } catch (error) {
            toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
        } finally {
            setLoadingProject(false);
            setLoadingClients(false);
        }
    };

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setValue('client_id', client.id);
            setValue('client_name', client.name);
            setValue('client_email', client.email);
            setValue('client_company', client.company || '');
        }
    };

    const quarter = watch('quarter');
    const year = watch('year');

    useEffect(() => {
        if (!isEditing && quarter && year) {
            const monthMap = { 'Q1': 0, 'Q2': 3, 'Q3': 6, 'Q4': 9 };
            const date = new Date(year, monthMap[quarter], 1);
            setValue('next_rei_date', date.toISOString().split('T')[0]);
        }
    }, [quarter, year, isEditing]);

    const onSubmit = async (data: FormData) => {
        // Validation removed for client_id since column might be missing, but logic requires client name
        if (!data.client_name) {
            toast({ title: 'Dados Incompletos', description: 'Por favor, selecione ou cadastre um cliente.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            // FIX: Removing client_id from insert to avoid schema error
            const projectData: any = { // Using any to bypass strict type check for now if needed
                // client_id: data.client_id, <--- REMOVED due to DB Schema mismatch
                client_name: data.client_name,
                client_email: data.client_email,
                client_company: data.client_company || null,
                analyst_email: data.analyst_email,
                quarter: data.quarter,
                year: data.year,
                next_rei_date: new Date(data.next_rei_date).toISOString(),
                last_rei_date: new Date().toISOString()
            };

            if (isEditing && id) {
                await updateReiProject(id, projectData);
                toast({ title: 'Protocolo atualizado com sucesso' });
            } else {
                const res = await createReiProject(projectData);
                if (res && (res as any).error) throw new Error((res as any).error.message || 'Erro desconhecido ao criar');

                toast({ title: 'Novo Protocolo Iniciado' });

                if (res && res.id) {
                    navigate(`/admin/jornada/${res.id}`);
                    return;
                }
            }
            navigate('/admin/rei');
        } catch (error: any) {
            console.error("Error creating project:", error);
            const errorMessage = error?.message || error?.toString() || 'Verifique os dados e tente novamente.';
            toast({ title: 'Erro ao salvar projeto', description: errorMessage, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (loadingProject || loadingClients) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <AdminLayout>
            <AdminPageLayout
                title={isEditing ? "Editar Projeto" : "Cadastrar novo projeto"}
                description="Defina a estratégia inicial e o direcionamento da conta."
                backTo="/admin/rei"
                backLabel="Voltar a Lista"
                showBackButton={false}
                maxWidth="4xl"
            >
                <div className="max-w-3xl pt-0 pb-20">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                        {/* Hidden Client ID input */}
                        <input type="hidden" {...register('client_id')} />

                        {/* 1. SELEÇÃO DE CLIENTE */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">
                                01. Vincular Cliente
                            </h3>

                            <div className="space-y-4">
                                {!isEditing && (
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center px-1">
                                                <Label className={labelClasses}>Selecione do Portfólio</Label>
                                                <Dialog open={mode === 'new'} onOpenChange={(open) => setMode(open ? 'new' : 'existing')}>
                                                    <DialogTrigger asChild>
                                                        <button type="button" className="text-[10px] uppercase font-bold text-indigo-600 hover:underline">
                                                            + Novo Cliente
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                                        <div className="bg-zinc-50 rounded-lg overflow-hidden">
                                                            <div className="bg-white border-b border-zinc-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                                                                <div>
                                                                    <h2 className="text-sm font-bold text-black">Cadastrar Novo Cliente</h2>
                                                                    <p className="text-[10px] text-zinc-400 font-medium tracking-wide">Preencha os dados completos para iniciar o protocolo.</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-zinc-50">
                                                                <ClientFormContent
                                                                    mode="admin"
                                                                    onCancel={() => setMode('existing')}
                                                                    onSuccess={(newClient) => {
                                                                        setMode('existing');
                                                                        loadData().then(() => {
                                                                            handleClientSelect(newClient.id);
                                                                        });
                                                                        toast({ title: 'Cliente vinculado com sucesso!' });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <Select
                                                onValueChange={handleClientSelect}
                                                disabled={isEditing}
                                                value={watch('client_id')}
                                            >
                                                <SelectTrigger className={`${inputClasses} shadow-none ring-0 focus:ring-offset-0`}>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none border-zinc-100 max-h-[250px] shadow-2xl">
                                                    {filterClients(clients).map(client => (
                                                        <SelectItem key={client.id} value={client.id} className="text-sm py-2 cursor-pointer">
                                                            {client.name} {client.company ? `— ${client.company}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {watch('client_name') && (
                                            <div className="pl-4 border-l-2 border-black py-2">
                                                <p className="text-xs font-bold uppercase tracking-wider text-black">{watch('client_name')}</p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5">{watch('client_company') || 'Empresa não informada'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="pl-4 border-l-2 border-black py-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-black">{watch('client_name')}</p>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">{watch('client_company') || 'Empresa não informada'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. PARAMETROS DO PROJETO */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">
                                02. Parâmetros de Execução
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-1.5">
                                    <Label className={labelClasses}>Analista Responsável</Label>
                                    <Input
                                        id="analyst_email"
                                        type="email"
                                        {...register('analyst_email', { required: 'Obrigatório' })}
                                        className={inputClasses}
                                        placeholder="analista@revhackers.com.br"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <Label className={labelClasses}>Trimestre</Label>
                                        <Select
                                            value={watch('quarter')}
                                            onValueChange={(value) => setValue('quarter', value as any)}
                                        >
                                            <SelectTrigger className={`${inputClasses} shadow-none ring-0 focus:ring-offset-0`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-zinc-100 shadow-2xl">
                                                <SelectItem value="Q1">Q1 (JAN-MAR)</SelectItem>
                                                <SelectItem value="Q2">Q2 (ABR-JUN)</SelectItem>
                                                <SelectItem value="Q3">Q3 (JUL-SET)</SelectItem>
                                                <SelectItem value="Q4">Q4 (OUT-DEZ)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className={labelClasses}>Ano Fiscal</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            {...register('year', { required: true })}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className={labelClasses}>Data de Início do Onboarding</Label>
                                    <Input
                                        id="next_rei_date"
                                        type="date"
                                        {...register('next_rei_date', { required: 'Obrigatório' })}
                                        className={`${inputClasses} [color-scheme:light] w-full`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção de Documentos removida - Proposta é funcionalidade de pré-venda */}

                        <div className="pt-8 flex gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/admin/rei')}
                                className="h-14 px-8 rounded-none text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-black hover:bg-transparent hover:underline transition-all -ml-4"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="h-14 px-10 rounded-none bg-black text-white hover:bg-zinc-800 transition-all font-black text-[10px] uppercase tracking-[0.2em] ml-auto"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PROJETO')}
                            </Button>
                        </div>
                    </form>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

// Helper component to list proposals linked to the client
const ProposalListByClient = ({ clientName }: { clientName: string }) => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!clientName) return;
        const fetchProposals = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('proposals')
                .select('*')
                .ilike('client_name', `%${clientName}%`)
                .order('created_at', { ascending: false });
            if (data) setProposals(data);
            setLoading(false);
        };
        fetchProposals();
    }, [clientName]);

    if (loading) return <div className="text-xs text-zinc-400">Carregando propostas...</div>;
    if (proposals.length === 0) return <div className="text-xs text-zinc-400 italic">Nenhuma proposta encontrada para {clientName}.</div>;

    return (
        <div className="space-y-2">
            {proposals.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg hover:border-zinc-300 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white border border-zinc-200 flex items-center justify-center rounded text-indigo-600">
                            <FileText size={16} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-black">{doc.title}</div>
                            <div className="text-[10px] text-zinc-400 capitalize">{doc.category || 'Proposta'} • {new Date(doc.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/proposals/edit/${doc.id}`)}>
                            <Edit2 size={12} className="text-zinc-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(`/p/${doc.slug}`, '_blank')}>
                            <ExternalLink size={12} className="text-zinc-500" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper function to filter unique clients by name/company for the select
const filterClients = (clients: Client[]) => {
    const seen = new Set();
    return clients.filter(client => {
        const key = `${client.name}-${client.company}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export default REIProjectForm;
