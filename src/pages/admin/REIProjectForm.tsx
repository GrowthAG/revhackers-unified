import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { createReiProject, updateReiProject, getReiProjectById, type FocalPoint } from '@/api/reiProjects';
import { supabase } from '@/integrations/supabase/client';
import { getAllClients, type Client } from '@/api/clients';
import type { ReiProjectInsert } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Users, Calendar, Zap, Target, Search, FileText, ExternalLink, Edit2, Copy, Globe, ChevronDown, ChevronUp, AlertCircle, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ClientFormContent from './ClientFormContent';
import AdminLayout from '@/components/layout/AdminLayout'; // Replaces PageLayout
import AdminPageLayout from '@/components/layout/AdminPageLayout';

type FormData = {
    client_id?: string; // Added client_id
    client_name: string;
    trade_name?: string;
    client_email: string;
    client_company?: string;
    analyst_email: string;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    year: number;
    type: string;
    project_duration: string;
    next_rei_date: string;
    materials_status: 'delivered' | 'pending';
    materials_delay_accepted: boolean;
    final_expectations?: string;
    focal_points: FocalPoint[];
};

const DURATION_OPTIONS = [
    { value: '30 dias', label: '30 dias (1 mês)' },
    { value: '60 dias', label: '60 dias (2 meses)' },
    { value: '90 dias', label: '90 dias (3 meses)' },
    { value: '180 dias', label: '180 dias (6 meses)' },
    { value: '360 dias', label: '360 dias (12 meses)' },
];

const DEFAULT_DURATION_BY_TYPE: Record<string, string> = {
    advisory:    '90 dias',
    crm_ops:     '90 dias',
    funnels_impl:'60 dias',
    consulting:  '90 dias',
    founder:     '90 dias',
    dev:         '60 dias',
    site:        '60 dias',
};

const REIProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isLeadMode = new URLSearchParams(location.search).get('lead') === 'true';
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(!!id);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            year: new Date().getFullYear(),
            quarter: 'Q1',
            type: 'crm_ops',
            project_duration: '90 dias',
            materials_status: 'delivered',
            materials_delay_accepted: false,
            focal_points: [{ name: '', email: '', role: '', is_main: true }]
        }
    });

    const { fields: focalPoints, append: appendFocal, remove: removeFocal } = useFieldArray({
        control,
        name: "focal_points"
    });

    const isEditing = !!id;
    const DRAFT_KEY = 'rei_project_draft';

    const [mode, setMode] = useState<'existing' | 'new'>('existing');
    const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

    // Site analysis state (declared early for draft persistence)
    const [clientSite, setClientSite] = useState('');
    const [siteAnalysis, setSiteAnalysis] = useState<any>(null);
    const [analyzingSite, setAnalyzingSite] = useState(false);
    const [siteAnalysisExpanded, setSiteAnalysisExpanded] = useState(true);
    const [siteAnalysisError, setSiteAnalysisError] = useState<string | null>(null);

    // ── Draft Persistence: restore from localStorage on mount (new projects only) ──
    const [draftRestored, setDraftRestored] = useState(false);
    useEffect(() => {
        if (isEditing || draftRestored) return;
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const draft = JSON.parse(saved);
                if (draft.formData) {
                    Object.entries(draft.formData).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            setValue(key as keyof FormData, value as any);
                        }
                    });
                }
                if (draft.clientSite) setClientSite(draft.clientSite);
                if (draft.siteAnalysis) setSiteAnalysis(draft.siteAnalysis);

            }
        } catch (e) {
            console.warn('[Draft] Erro ao restaurar rascunho:', e);
        }
        setDraftRestored(true);
    }, [isEditing, draftRestored]);

    // ── Draft Persistence: auto-save on every field change ──
    const allFormValues = watch();
    useEffect(() => {
        if (isEditing || !draftRestored) return;
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({
                    formData: allFormValues,
                    clientSite,
                    siteAnalysis,
                    savedAt: new Date().toISOString()
                }));
            } catch (e) { /* ignore quota errors */ }
        }, 500); // debounce 500ms
        return () => clearTimeout(timer);
    }, [allFormValues, clientSite, siteAnalysis, isEditing, draftRestored]);

    // Auto-suggest duration when type changes
    const watchedType = watch('type');
    useEffect(() => {
        if (!isEditing && watchedType) {
            const suggested = DEFAULT_DURATION_BY_TYPE[watchedType] || '90 dias';
            setValue('project_duration', suggested);
        }
    }, [watchedType, isEditing]);

    // Styling Constants (Diagnostic Standard)
    const inputClasses = "bg-transparent border-0 border-b h-14 rounded-none transition-all font-medium text-base px-4 focus:ring-0 w-full border-zinc-200 text-black focus:border-black placeholder:text-zinc-300 hover:bg-zinc-50/50";
    const labelClasses = "text-xxs font-black uppercase tracking-widest pl-0.5 text-zinc-400";
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
            if (data.nome_fantasia) setValue('trade_name', data.nome_fantasia);
            if (data.email) setValue('client_email', data.email.toLowerCase());

            toast({
                title: 'Dados Corporativos Localizados',
                description: `Empresa: ${data.nome_fantasia || data.razao_social}`,
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

    // ── Site Analysis Handler ──
    const handleAnalyzeSite = async () => {
        if (!clientSite) return;
        setAnalyzingSite(true);
        setSiteAnalysisError(null);
        setSiteAnalysis(null);
        try {
            const { data, error } = await supabase.functions.invoke('inspect-website', {
                body: { url: clientSite, enriched: true }
            });
            if (error) throw new Error(error.message || 'Erro ao analisar site');
            if (data?.success === false) throw new Error(data?.error || 'Falha na analise');

            // Merge scraped data + AI analysis into a single object
            const merged = {
                ...data?.data,
                ...data?.ai_analysis,
            };
            setSiteAnalysis(merged);
            setSiteAnalysisExpanded(true);
            toast({
                title: 'Site Analisado',
                description: `Analise de ${clientSite} concluida com sucesso.`,
            });
        } catch (err: any) {
            console.error('Site analysis error:', err);
            setSiteAnalysisError(err.message || 'Erro desconhecido');
            toast({
                title: 'Erro na Analise',
                description: err.message || 'Nao foi possivel analisar o site.',
                variant: 'destructive'
            });
        } finally {
            setAnalyzingSite(false);
        }
    };



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
                    setValue('trade_name', project.trade_name || undefined);
                    setValue('client_email', project.client_email);
                    setValue('client_company', project.client_company || '');
                    setValue('analyst_email', project.analyst_email);
                    setValue('quarter', project.quarter as any);
                    setValue('year', project.year);
                    setValue('type', project.type || 'crm_ops');
                    setValue('project_duration', (project as any).project_duration || DEFAULT_DURATION_BY_TYPE[project.type || 'consulting'] || '90 dias');
                    setValue('next_rei_date', project.next_rei_date.split('T')[0]);
                    setValue('focal_points', (project.focal_points && project.focal_points.length > 0) ? project.focal_points : [{ name: '', email: '', role: '', is_main: true }]);
                    // Load site analysis data
                    if ((project as any).client_site) setClientSite((project as any).client_site);
                    if ((project as any).site_analysis) setSiteAnalysis((project as any).site_analysis);
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
            setValue('trade_name', client.trade_name || undefined);
            setValue('client_email', client.email);
            setValue('client_company', client.company || '');
            // Auto-fill website from client record
            if ((client as any).website) {
                setClientSite((client as any).website);
            }
        }
    };

    const quarter = watch('quarter');
    const year = watch('year');

    // [HANDOFF AUTOMATION]
    useEffect(() => {
        if (!loadingClients && clients.length > 0 && location.state?.handoffData) {
            const { client_name, client_email } = location.state.handoffData;

            // 1. Try to find existing client matches
            const match = clients.find(c =>
                c.name.toLowerCase() === client_name.toLowerCase() ||
                (c.email && client_email && c.email.toLowerCase() === client_email.toLowerCase())
            );

            if (match) {
                handleClientSelect(match.id);
                toast({
                    title: 'Handoff: Cliente Localizado',
                    description: `Vinculado automaticamente a ${match.name}`
                });
            } else {
                // 2. Pre-fill for new creation
                setValue('client_name', client_name);
                if (client_email) setValue('client_email', client_email);

                toast({
                    title: 'Handoff de Vendas',
                    description: 'Cliente novo detectado. Complete o cadastro clicando em "+ Novo Cliente".',
                    variant: "default"
                });
                // Optional: setMode('new'); 
            }

            // Clean state to avoid re-triggering
            window.history.replaceState({}, '');
        }
    }, [location.state, clients, loadingClients]);



    const onSubmit = async (data: FormData) => {
        // Validation removed for client_id since column might be missing, but logic requires client name
        if (!data.client_name) {
            toast({ title: 'Dados Incompletos', description: 'Por favor, selecione ou cadastre um cliente.', variant: 'destructive' });
            return;
        }

        if (!data.focal_points || data.focal_points.length === 0 || !data.focal_points[0].name || !data.focal_points[0].email) {
            toast({ title: 'Contato Obrigatório', description: 'Você deve preencher ao menos o Ponto Focal Principal (Nome e E-mail) do cliente.', variant: 'destructive' });
            return;
        }

        if (data.materials_status === 'pending' && !data.materials_delay_accepted) {
            toast({ title: 'Atenção ao Cronograma', description: 'Se o material está pendente, é obrigatório dar o "De Acordo" na reter do cronograma.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const projectData: any = {
                client_id: data.client_id,
                client_name: data.client_name,
                trade_name: data.trade_name || null,
                client_email: data.client_email,
                client_company: data.client_company || null,
                analyst_email: data.analyst_email,
                quarter: data.quarter,
                year: Number(data.year),
                type: data.type,
                project_duration: data.project_duration || '90 dias',
                next_rei_date: new Date(data.next_rei_date).toISOString(),
                last_rei_date: new Date().toISOString(),
                client_site: clientSite || null,
                site_analysis: siteAnalysis || null,
                materials_status: data.materials_status,
                materials_delay_accepted: data.materials_delay_accepted,
                final_expectations: data.final_expectations || null,
                focal_points: data.focal_points || [],
                // Lead mode: nao injeta tarefas, nao cria sprint, status diferente
                ...(isLeadMode ? { status: 'lead' } : {}),
            };

            if (isEditing && id) {
                await updateReiProject(id, projectData);
                toast({ title: 'Protocolo atualizado com sucesso' });
                localStorage.removeItem(DRAFT_KEY);
            } else {
                const res = await createReiProject(projectData);
                if (res && (res as any).error) throw new Error((res as any).error.message || 'Erro desconhecido ao criar');

                toast({
                    title: isLeadMode ? 'Lead criado no pipeline' : 'Novo Projeto Iniciado',
                    description: isLeadMode
                        ? 'Oportunidade adicionada ao Deal Rooms.'
                        : 'Projeto criado com tarefas automaticas.',
                });
                localStorage.removeItem(DRAFT_KEY);

                // Fire-and-forget: enriquece projeto em background (CNPJ + PSI)
                // Nao bloqueia navegacao - roda asincrono sem await
                const projectId = (res as any)?.project?.id || (res as any)?.id;
                if (projectId && !isLeadMode) {
                    supabase.functions.invoke('auto-enrich-project', {
                        body: { project_id: projectId },
                    }).catch((err: any) => {
                        console.warn('[REIProjectForm] auto-enrich-project falhou (nao critico):', err?.message);
                    });
                }

                if (res && (res as any).id) {
                    // Lead vai direto para Deal Rooms, projeto vai para jornada
                    if (isLeadMode) {
                        navigate('/admin/proposals');
                        return;
                    }
                    navigate(`/admin/jornada/${(res as any).id}`);
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
                title={isEditing ? "Editar Projeto" : isLeadMode ? "Nova Oportunidade" : "Novo Projeto"}
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
                            <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">
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
                                                        <button type="button" className="text-xxs uppercase font-bold text-indigo-600 hover:underline">
                                                            + Novo Cliente
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                                        <div className="bg-zinc-50 overflow-hidden">
                                                            <div className="bg-white border-b border-zinc-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                                                                <div>
                                                                    <h2 className="text-sm font-bold text-black">Cadastrar Novo Cliente</h2>
                                                                    <p className="text-xxs text-zinc-400 font-medium tracking-wide">Preencha os dados completos para iniciar o protocolo.</p>
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
                                                <SelectContent className="border-zinc-100 max-h-[250px] shadow-sm">
                                                    {filterClients(clients).map(client => (
                                                        <SelectItem key={client.id} value={client.id} className="text-sm py-2 cursor-pointer">
                                                            {client.name} {client.company ? `| ${client.company}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {watch('client_name') && (
                                            <div className="pl-4 border-l-2 border-black py-2">
                                                <p className="text-xs font-bold uppercase tracking-wider text-black">{watch('client_name')}</p>
                                                <p className="text-xxs text-zinc-500 mt-0.5">{watch('trade_name') || watch('client_company') || 'Empresa não informada'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="pl-4 border-l-2 border-black py-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-black">{watch('client_name')}</p>
                                        <p className="text-xxs text-zinc-500 mt-0.5">{watch('trade_name') || watch('client_company') || 'Empresa não informada'}</p>
                                    </div>
                                )}

                                {/* ── Nome de Exibição (editável) ── */}
                                {watch('client_name') && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1">
                                            <Label className={labelClasses}>Nome de Exibição do Projeto</Label>
                                            <span className="text-2xs text-zinc-400 font-medium tracking-wide">Substitui a Razão Social em toda a plataforma</span>
                                        </div>
                                        <Input
                                            {...register('trade_name')}
                                            className={inputClasses}
                                            placeholder={watch('client_name') || 'Ex: Acme, Grupo XYZ, Startup ABC...'}
                                        />
                                        {!watch('trade_name') && watch('client_name') && (
                                            <p className="text-xxs text-amber-600 font-medium pl-1">
                                                ⚠ Sem nome fantasia — será exibida a Razão Social da Receita Federal.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PONTOS FOCAIS */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                                <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-400">
                                    Pontos Focais (Contatos)
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendFocal({ name: '', email: '', role: '', is_main: focalPoints.length === 0 })}
                                    className="h-8 text-xxs font-bold uppercase tracking-widest"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                    Adicionar Contato
                                </Button>
                            </div>
                            
                            <div className="space-y-4 pt-2">
                                {focalPoints.map((field, index) => {
                                    const isMain = index === 0;
                                    return (
                                    <div key={field.id} className={`p-5 relative group border transition-all ${isMain ? 'border-indigo-200 bg-indigo-50/10 shadow-sm' : 'border-zinc-200 bg-white'}`}>
                                        <div className="mb-4 flex items-center gap-2">
                                            {isMain ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Ponto Focal Principal (Decisor)</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Membro da Equipe do Cliente</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {!isMain && (
                                            <button
                                                type="button"
                                                onClick={() => removeFocal(index)}
                                                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-2xs font-bold uppercase tracking-wider text-zinc-400">Nome {isMain && '*'}</Label>
                                                <Input
                                                    {...register(`focal_points.${index}.name` as const, { required: isMain })}
                                                    className={`bg-white h-11 border text-sm ${isMain ? 'border-indigo-100 focus:border-indigo-400' : 'border-zinc-200'}`}
                                                    placeholder={isMain ? "Nome do Contato Principal" : "Nome do Integrante"}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-2xs font-bold uppercase tracking-wider text-zinc-400">Cargo {isMain && '*'}</Label>
                                                <Input
                                                    {...register(`focal_points.${index}.role` as const, { required: isMain })}
                                                    className={`bg-white h-11 border text-sm ${isMain ? 'border-indigo-100 focus:border-indigo-400' : 'border-zinc-200'}`}
                                                    placeholder={isMain ? "Sócio / Diretor" : "Cargo..."}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-2xs font-bold uppercase tracking-wider text-zinc-400">E-mail {isMain && '*'}</Label>
                                                <Input
                                                    {...register(`focal_points.${index}.email` as const, { required: isMain })}
                                                    type="email"
                                                    className={`bg-white h-11 border text-sm ${isMain ? 'border-indigo-100 focus:border-indigo-400' : 'border-zinc-200'}`}
                                                    placeholder={isMain ? "decisor@empresa.com.br" : "email@empresa.com.br"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* 2. PARAMETROS DO PROJETO */}
                        <div className="space-y-6">
                            <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">
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

                                <div className="space-y-1.5">
                                    <Label className={labelClasses}>Protocolo Contratado</Label>
                                    <Select
                                        value={watch('type')}
                                        onValueChange={(value) => setValue('type', value)}
                                    >
                                        <SelectTrigger className={`${inputClasses} shadow-none ring-0 focus:ring-offset-0`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-100 shadow-sm">
                                            <SelectItem value="advisory">Advisory (Estratégico s/ Execução)</SelectItem>
                                            <SelectItem value="consulting">Consulting (Mão na Massa)</SelectItem>
                                            <SelectItem value="crm_ops">CRM Ops</SelectItem>
                                            <SelectItem value="founder">Founder</SelectItem>
                                            <SelectItem value="funnels_impl">Site / Funis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className={labelClasses}>Duração do Projeto</Label>
                                    <Select
                                        value={watch('project_duration')}
                                        onValueChange={(value) => setValue('project_duration', value)}
                                    >
                                        <SelectTrigger className={`${inputClasses} shadow-none ring-0 focus:ring-offset-0`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-100 shadow-sm">
                                            {DURATION_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* ── Site do Cliente + Analise ── */}
                                <div className="space-y-3">
                                    <Label className={labelClasses}>Site do Cliente</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://exemplo.com.br"
                                            value={clientSite}
                                            onChange={(e) => setClientSite(e.target.value)}
                                            className={inputClasses}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAnalyzeSite}
                                            disabled={!clientSite || analyzingSite}
                                            className="h-14 px-4 shrink-0 rounded-none border-0 border-b border-zinc-200 hover:border-black transition-all text-xxs uppercase font-bold tracking-widest"
                                        >
                                            {analyzingSite ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Globe className="w-4 h-4" />
                                            )}
                                            <span className="ml-2">{analyzingSite ? 'Analisando...' : 'Analisar'}</span>
                                        </Button>
                                    </div>

                                    {/* Site Analysis Error */}
                                    {siteAnalysisError && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 ">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            <span className="text-tiny text-red-600 font-medium">{siteAnalysisError}</span>
                                        </div>
                                    )}

                                    {/* Site Analysis Result */}
                                    {siteAnalysis && (
                                        <div className="border border-zinc-200 overflow-hidden">
                                            <button
                                                type="button"
                                                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                                                onClick={() => setSiteAnalysisExpanded(!siteAnalysisExpanded)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-[#00CC6A]" />
                                                    <span className="text-xxs font-black uppercase tracking-widest text-zinc-500">Analise do Site</span>
                                                </div>
                                                {siteAnalysisExpanded ? (
                                                    <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                                )}
                                            </button>
                                            {siteAnalysisExpanded && (
                                                <div className="px-4 py-3 space-y-2 bg-white">
                                                    {siteAnalysis.resumo_proposta && (
                                                        <p className="text-mini font-medium text-zinc-700 leading-relaxed">{siteAnalysis.resumo_proposta}</p>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                                                        {siteAnalysis.segmento && (
                                                            <div>
                                                                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Segmento</span>
                                                                <p className="text-xs text-zinc-600 font-medium">{siteAnalysis.segmento}</p>
                                                            </div>
                                                        )}
                                                        {siteAnalysis.publico_alvo && (
                                                            <div>
                                                                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Publico-alvo</span>
                                                                <p className="text-xs text-zinc-600 font-medium">{siteAnalysis.publico_alvo}</p>
                                                            </div>
                                                        )}
                                                        {siteAnalysis.maturidade_digital && (
                                                            <div>
                                                                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Maturidade Digital</span>
                                                                <p className="text-xs text-zinc-600 font-medium capitalize">{siteAnalysis.maturidade_digital}</p>
                                                            </div>
                                                        )}
                                                        {siteAnalysis.tom_comunicacao && (
                                                            <div>
                                                                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Tom</span>
                                                                <p className="text-xs text-zinc-600 font-medium capitalize">{siteAnalysis.tom_comunicacao}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {siteAnalysis.produtos_servicos && Array.isArray(siteAnalysis.produtos_servicos) && siteAnalysis.produtos_servicos.length > 0 && (
                                                        <div className="pt-1">
                                                            <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Produtos/Servicos</span>
                                                            <p className="text-xs text-zinc-600 font-medium">{siteAnalysis.produtos_servicos.join(', ')}</p>
                                                        </div>
                                                    )}
                                                    {siteAnalysis.diferenciais && (
                                                        <div className="pt-1">
                                                            <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Diferenciais</span>
                                                            <p className="text-xs text-zinc-600 font-medium">{siteAnalysis.diferenciais}</p>
                                                        </div>
                                                    )}
                                                    {siteAnalysis.pontos_fracos_site && (
                                                        <div className="pt-1">
                                                            <span className="text-2xs font-bold text-zinc-400 uppercase tracking-widest">Pontos Fracos do Site</span>
                                                            <p className="text-xs text-zinc-600 font-medium">
                                                                {Array.isArray(siteAnalysis.pontos_fracos_site) ? siteAnalysis.pontos_fracos_site.join(', ') : siteAnalysis.pontos_fracos_site}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            <SelectContent className="border-zinc-100 shadow-sm">
                                                <SelectItem value="Q1">Q1 (Ciclo 1 - 0-90 dias)</SelectItem>
                                                <SelectItem value="Q2">Q2 (Ciclo 2 - 91-180 dias)</SelectItem>
                                                <SelectItem value="Q3">Q3 (Ciclo 3 - 181-270 dias)</SelectItem>
                                                <SelectItem value="Q4">Q4 (Ciclo 4 - 270-360 dias)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className={labelClasses}>Ano Fiscal</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            {...register('year', { required: true, valueAsNumber: true })}
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

                                {/* Previsão de Encerramento — calculada, sem coluna nova no banco */}
                                {watch('next_rei_date') && watch('project_duration') && (() => {
                                    const start = new Date(watch('next_rei_date'));
                                    const days = parseInt((watch('project_duration') || '').replace(/\s*dias?/i, '').trim(), 10);
                                    if (isNaN(days) || isNaN(start.getTime())) return null;
                                    const end = new Date(start.getTime() + days * 86_400_000);
                                    const fmt = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                                    return (
                                        <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-50 border border-zinc-200">
                                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-400">Previsão de Encerramento</span>
                                            <span className="text-xs font-bold text-zinc-800 font-mono">{fmt}</span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* 3. COLETA DE ATIVOS */}
                        <div className="space-y-6">
                            <h3 className="text-xxs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> 03. Coleta de Ativos
                            </h3>
                            <div className="p-6 bg-zinc-50 border border-zinc-200 space-y-6">
                                <div className="space-y-3">
                                    <Label className={labelClasses}>Status dos Materiais (Brandbook, Acessos, Arquivos)</Label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center p-4 border cursor-pointer transition-all uppercase text-xxs font-bold tracking-widest ${watch('materials_status') === 'delivered' ? 'bg-black text-white border-black ring-2 ring-black/20' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}>
                                            <input type="radio" value="delivered" {...register('materials_status')} className="hidden" />
                                            Materiais na Mão (Liberar Planejamento)
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center p-4 border cursor-pointer transition-all uppercase text-xxs font-bold tracking-widest ${watch('materials_status') === 'pending' ? 'bg-red-50 text-red-600 border-red-200 ring-2 ring-red-500/20' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}>
                                            <input type="radio" value="pending" {...register('materials_status')} className="hidden" />
                                            Pendente (Travar Cronograma)
                                        </label>
                                    </div>
                                </div>

                                {watch('materials_status') === 'pending' && (
                                    <div className="p-4 bg-red-50/50 border border-red-100 ">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input type="checkbox" {...register('materials_delay_accepted')} className="mt-1 w-4 h-4 border-red-300 text-red-600 focus:ring-red-600" />
                                            <div>
                                                <p className="text-tiny font-black text-red-800 uppercase tracking-widest leading-none">Termo de Retenção de Cronograma (Assinatura)</p>
                                                <p className="text-xs text-red-600/80 mt-1 font-medium leading-relaxed">Declaro estar totalmente ciente de que o Hub do projeto ficará bloqueado e o Planejamento Estratégico suspenso até que a totalidade dos ativos e materiais sensíveis seja inserida oficialmente na plataforma.</p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. CHAVE DE OURO */}
                        <div className="space-y-6">
                            <h3 className="text-xxs font-black uppercase tracking-widest text-[#00CC6A] border-b border-[#00CC6A]/30 pb-2 flex items-center gap-2">
                                <Target className="w-3.5 h-3.5" /> 04. Pergunta de Ouro
                            </h3>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-zinc-900 tracking-tight">"Para finalizarmos com chave de ouro: há algum desafio crítico ou expectativa de negócio que não exploramos hoje e você gostaria de registrar?"</Label>
                                <textarea
                                    {...register('final_expectations')}
                                    placeholder="Insights finais, medos do decisor, omissões importantes da call..."
                                    className="w-full bg-zinc-50 border border-zinc-200 p-4 text-sm font-medium focus:ring-2 focus:ring-[#00CC6A]/20 focus:border-[#00CC6A] focus:outline-none min-h-[120px] transition-all resize-none mt-2"
                                />
                            </div>
                        </div>

                        <div className="pt-8 flex gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/admin/rei')}
                                className="h-14 px-8 rounded-none text-xxs uppercase font-bold tracking-widest text-zinc-400 hover:text-black hover:bg-transparent hover:underline transition-all -ml-4"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="h-14 px-10 rounded-none bg-black text-white hover:bg-zinc-800 transition-all font-black text-xxs uppercase tracking-[0.2em] ml-auto"
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
                .from('proposals' as any)
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
                <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white border border-zinc-200 flex items-center justify-center rounded text-indigo-600">
                            <FileText size={16} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-black">{doc.title}</div>
                            <div className="text-xxs text-zinc-400 capitalize">{doc.category || 'Proposta'} • {new Date(doc.created_at).toLocaleDateString()}</div>
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
