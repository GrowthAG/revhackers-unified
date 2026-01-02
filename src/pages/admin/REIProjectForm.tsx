import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createReiProject, updateReiProject, getReiProjectById } from '@/api/reiProjects';
import { getAllClients, type Client } from '@/api/clients';
import type { ReiProjectInsert } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Users, Calendar, Zap, Target, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ClientFormContent from './ClientFormContent';
import AdminLayout from '@/components/layout/AdminLayout'; // Replaces PageLayout
import AdminPageLayout from '@/components/layout/AdminPageLayout';

type FormData = {
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

    // UI State for toggling between existing/new client
    const [mode, setMode] = useState<'existing' | 'new'>('existing');

    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

    // CNPJ Lookup Logic
    const handleCnpjLookup = async (cnpjValue: string) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsSearchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado');
            const data = await response.json();

            // Auto-fill Core Data
            if (data.razao_social) setValue('client_company', data.razao_social);

            // Try to set email from QSA or data
            if (data.email) setValue('client_email', data.email.toLowerCase());

            toast({
                title: 'DADOS CORPORATIVOS LOCALIZADOS',
                description: `Empresa: ${data.razao_social}`,
            });
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            toast({
                title: 'CNPJ NÃO LOCALIZADO',
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
                    setValue('client_name', project.client_name);
                    setValue('client_email', project.client_email);
                    setValue('client_company', project.client_company || '');
                    setValue('analyst_email', project.analyst_email);
                    setValue('quarter', project.quarter);
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
        setLoading(true);
        try {
            const projectData: ReiProjectInsert = {
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
                toast({ title: 'Novo Protocolo Iniciado' });

                if (res && res.id) {
                    navigate(`/admin/jornada/${res.id}`);
                    return;
                }
            }
            navigate('/admin/rei');
        } catch (error) {
            toast({ title: 'Erro ao salvar protocolo', variant: 'destructive' });
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
                title={isEditing ? "Editar Projeto" : "Cadastrar Novo Projeto"}
                description="Defina a estratégia inicial e o direcionamento da conta."
                backTo="/admin/rei"
                backLabel="Voltar a Lista"
                showBackButton={false} // Sidebar handles navigation mostly, but keeping back button context is fine. Or maybe true.
            >
                <div className="max-w-4xl py-10 mx-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                        {/* ... form content ... */}




                        {/* 1. SELEÇÃO DE CLIENTE (Toggle) */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">
                                01. Vincular Cliente
                            </h3>

                            <div className="bg-white border border-zinc-200 p-8 pt-6">
                                {/* Only show selector if not editing an existing project */}
                                {!isEditing && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Users size={14} className="text-zinc-400" />
                                                <Label className="text-xs font-medium text-zinc-500">Buscar no Portfólio</Label>
                                            </div>
                                            <Dialog open={mode === 'new'} onOpenChange={(open) => setMode(open ? 'new' : 'existing')}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-zinc-200 hover:bg-zinc-50 hover:text-black">
                                                        + Novo Cliente
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                                    <div className="bg-zinc-50 rounded-lg overflow-hidden">
                                                        <div className="bg-white border-b border-zinc-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                                                            <div>
                                                                <h2 className="text-sm font-black uppercase tracking-widest text-black">Cadastrar Novo Cliente</h2>
                                                                <p className="text-[10px] text-zinc-400 font-medium tracking-wide">Preencha os dados completos para iniciar o protocolo.</p>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-zinc-50">
                                                            <ClientFormContent
                                                                mode="admin"
                                                                onCancel={() => setMode('existing')}
                                                                onSuccess={(newClient) => {
                                                                    setMode('existing');
                                                                    // Reload clients to include the new one
                                                                    loadData().then(() => {
                                                                        // Auto-select the new client
                                                                        handleClientSelect(newClient.id);
                                                                        // Also select it in the dropdown
                                                                        setValue('client_name', newClient.name); // Just to trigger re-render if needed
                                                                        // We can't easily control the Select value state without a controlled component state for the Select value itself
                                                                        // But handleClientSelect updates the form values.
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
                                            value={clients.find(c => c.name === watch('client_name') && c.company === watch('client_company'))?.id}
                                        >
                                            <SelectTrigger className="bg-white border-zinc-200 rounded-none h-12 text-sm font-medium focus:ring-1 focus:ring-black">
                                                <SelectValue placeholder="Selecione um cliente..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-zinc-100 max-h-[250px]">
                                                {filterClients(clients).map(client => (
                                                    <SelectItem key={client.id} value={client.id} className="text-sm py-2">
                                                        {client.name} {client.company ? `— ${client.company}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Display Selected Client Details */}
                                        {watch('client_name') && (
                                            <div className="mt-4 p-4 bg-zinc-50 border border-zinc-100 flex items-start gap-4">
                                                <div className="h-10 w-10 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                                                    <Users size={16} className="text-zinc-300" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-black">{watch('client_name')}</div>
                                                    <div className="text-xs text-zinc-500">{watch('client_company')}</div>
                                                    <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{watch('client_email')}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="p-4 bg-zinc-50 border border-zinc-100 flex items-start gap-4">
                                        <div className="h-10 w-10 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                                            <Users size={16} className="text-zinc-300" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-black">{watch('client_name')}</div>
                                            <div className="text-xs text-zinc-500">{watch('client_company')}</div>
                                            <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{watch('client_email')}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. PARAMETROS DO PROJETO */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">
                                02. Parâmetros de Execução
                            </h3>

                            <div className="bg-white border border-zinc-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-medium text-zinc-500">Analista Responsável</Label>
                                    <Input
                                        id="analyst_email"
                                        type="email"
                                        {...register('analyst_email', { required: 'Obrigatório' })}
                                        className="bg-white border-zinc-200 rounded-none h-12 text-sm text-black focus:border-black"
                                        placeholder="analista@revhackers.com.br"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-medium text-zinc-500">Trimestre de Início</Label>
                                    <Select
                                        value={watch('quarter')}
                                        onValueChange={(value) => setValue('quarter', value as any)}
                                    >
                                        <SelectTrigger className="bg-white border-zinc-200 rounded-none h-12 text-sm font-medium focus:ring-1 focus:ring-black">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-zinc-100">
                                            <SelectItem value="Q1">Q1 (JAN-MAR)</SelectItem>
                                            <SelectItem value="Q2">Q2 (ABR-JUN)</SelectItem>
                                            <SelectItem value="Q3">Q3 (JUL-SET)</SelectItem>
                                            <SelectItem value="Q4">Q4 (OUT-DEZ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-medium text-zinc-500">Ano Fiscal</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        {...register('year', { required: true })}
                                        className="bg-white border-zinc-200 rounded-none h-12 text-sm text-black focus:border-black"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-medium text-zinc-500">Início do Onboarding</Label>
                                    <Input
                                        id="next_rei_date"
                                        type="date"
                                        {...register('next_rei_date', { required: 'Obrigatório' })}
                                        className="bg-white border-zinc-200 focus:border-black rounded-none h-12 text-sm text-black [color-scheme:light]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/admin/rei')}
                                className="flex-1 h-14 rounded-none text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-50 transition-all"
                                disabled={loading}
                            >
                                Cancelar e Voltar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-14 rounded-none bg-black text-white hover:bg-zinc-800 transition-all font-bold text-xs uppercase tracking-widest shadow-none gap-3"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                                {isEditing ? 'Salvar Projeto' : 'Cadastrar Projeto'}
                            </Button>
                        </div>
                    </form>
                </div>
            </AdminPageLayout>
        </AdminLayout>
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
