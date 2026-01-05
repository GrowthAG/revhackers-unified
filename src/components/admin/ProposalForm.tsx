
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Wand2, ArrowLeft, Eye, RefreshCw, Save, ExternalLink, Sparkles, ChevronDown, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';
import { useAI } from '@/context/AIContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ProposalFormValues {
    title: string;
    slug: string;
    client_name: string;
    client_contact_name?: string;
    client_email?: string;
    client_logo: string;
    recording_url: string;
    transcript: string;
    summary: string;
    investment_total: string;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    category: 'proposal' | 'kickoff' | 'onboarding' | 'qbr' | 'other';
    mindmap_code: string;
    setup_fee: string;
    installment_value: string;
    loom_url?: string;
    mindmap_url?: string;
    manual_transcript?: string;
}

interface ProposalFormProps {
    initialData?: any;
    isEditing?: boolean;
}

const ProposalForm = ({ initialData, isEditing = false }: ProposalFormProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [meetingHistory, setMeetingHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false); // State for Dialog control
    const { agents } = useAI();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProposalFormValues>({
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            client_name: initialData?.client_name || '',
            client_contact_name: initialData?.client_contact_name || '',
            client_logo: initialData?.client_logo || '',
            recording_url: initialData?.recording_url || '',
            transcript: initialData?.transcript || '',
            summary: initialData?.summary || '',
            investment_total: initialData?.investment_total || '',
            status: initialData?.status || 'draft',
            category: initialData?.category || 'proposal',
            mindmap_code: initialData?.mindmap_code || 'graph TD; A[Desafio] --> B[Solução];',
            setup_fee: initialData?.setup_fee || '',
            installment_value: initialData?.installment_value || '',
            loom_url: initialData?.loom_url || '',
            mindmap_url: initialData?.mindmap_url || '',
            manual_transcript: initialData?.manual_transcript || '',
        }
    });

    const watchedTitle = watch('title');

    useEffect(() => {
        if (!isEditing && watchedTitle) {
            const slug = watchedTitle
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', slug);
        }
    }, [watchedTitle, isEditing, setValue]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploadingLogo(true);
        try {
            const publicUrl = await uploadImageToSupabase(file, 'lovable-uploads');
            if (publicUrl) {
                setValue('client_logo', publicUrl);
                toast({ title: 'Logo enviado com sucesso!' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro no upload', description: 'Não foi possível enviar a logo.', variant: 'destructive' });
        } finally {
            setUploadingLogo(false);
        }
    };

    const onSubmit = async (data: ProposalFormValues) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                investment_total: data.investment_total ? Number(data.investment_total) : null,
                setup_fee: data.setup_fee ? Number(data.setup_fee) : null,
                installment_value: data.installment_value ? Number(data.installment_value) : null,
            };

            if (isEditing && initialData?.id) {
                const { error } = await supabase.from('proposals').update(payload).eq('id', initialData.id);
                if (error) throw error;
                toast({ title: 'Página atualizada!' });
                navigate('/admin/proposals');
            } else {
                const { data: newProposal, error } = await supabase.from('proposals').insert(payload).select().single();
                if (error) throw error;
                toast({ title: 'Página criada!' });
                // Redirect to the new proposal (Open it)
                if (newProposal?.id) {
                    navigate(`/admin/proposals/${newProposal.id}`);
                } else {
                    navigate('/admin/proposals');
                }
            }
        } catch (error: any) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateScope = async () => {
        const transcript = watch('transcript');
        if (!transcript) {
            toast({ title: 'Erro', description: 'Adicione uma transcrição primeiro.', variant: 'destructive' });
            return;
        }

        setGenerating(true);
        try {
            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    messages: [{
                        role: 'system',
                        content: `Você é o SENIOR GROWTH PARTNER da RevHackers. Sua missão é transformar transcrições de reuniões em PROPOSTAS VENDÁVEIS DE ALTO IMPACTO (High-Ticket).
                        
                        Diretrizes de Tom e Estilo:
                        - Autoridade: Use linguagem segura, direta e executiva.
                        - Foco em ROI: Tudo deve ser justificado pelo ganho financeiro ou de eficiência.
                        - Formatação Rica: Use Emojis estratégicos, NEGRITO para ênfase, e Listas para clareza.
                        - CORREÇÃO INTELIGENTE: A transcrição pode conter erros de ASR (ex: "Heiro" em vez de "Hero", "Bittob" em vez de "B2B"). 
                           Sua obrigação é analisar o contexto fonético e semântico para corrigir esses termos mentalmente ANTES de gerar a proposta. 
                           Ignore erros gramaticais literais da transcrição e foque na INTENÇÃO do falante.

                        Estrutura Obrigatória da Proposta (Markdown):
                        
                        # 🎯 Diagnóstico Executivo
                        [Resuma a dor principal do cliente identificada na call. O que está custando dinheiro a eles hoje?]
                        
                        # 🚀 O Plano de Jogo (A Solução)
                        [Descreva a estratégia RevHackers para resolver isso. Não fale de funcionalidades, fale de TRANSFORMACAO.]
                        
                        # 📦 Escopo de Implementação (Sprints)
                        [Liste os entregáveis técnicos e estratégicos em bullets. Ex: Setup de CRM, Automação de Outbound, Playbook de Vendas, etc.]
                        
                        # 💰 Detalhamento do Investimento
                        [Se houver valores, crie uma tabela ou lista detalhada:]
                        - Valor Total: [R$ X]
                        - Condições de Pagamento: [Ex: 12x, à vista com 10% off]
                        - Descontos Aplicados: [Ex: Isenção de Setup]
                        - Inclusos: [Ex: Setup, Onboarding, Consultoria]
                        [Se não houver valores claros, use: "A discutir conforme escopo final".]
                        `
                    }, {
                        role: 'user',
                        content: `Analise esta transcrição com EXTREMA ATENÇÃO AOS NÚMEROS E VALORES.
                        
                        Sua tarefa extra: DETECTAR E INTERPRETAR A OFERTA FINANCEIRA COMPLETAMENTE.
                        - Separe o que é valor de SETUP do que é RECORRÊNCIA (Monthly Retainer).
                        - Identifique descontos mencionados (ex: "se fechar hoje", "pagamento anual").
                        - Identifique parcelamentos (ex: "12 vezes", "trimestral").
                        
                        Gere:
                        1. O Conteúdo da Proposta (campo 'summary') seguindo a estrutura markdown. No item 'Detalhamento do Investimento', seja minucioso.
                        2. Um código Mermaid.js (campo 'mindmap').
                        3. Extraia os valores financeiros:
                           - setup_fee: Valor de entrada / setup.
                           - installment_value: Valor da mensalidade ou parcela recorrente.
                           - investment_total: Valor Total do Contrato (Soma do primeiro ano ou valor total do projeto).
                        4. Extraia dados do cliente (Contexto):
                           - client_name: Nome da EMPRESA (ex: Revolut, Heineken).
                           - client_contact_name: Nome da PESSOA com quem falamos (ex: Gabin, João).
                           - client_email: Email citado na reunião (se houver).
                        
                        Retorne APENAS JSON:
                        {
                            "summary": "markdown string...",
                            "mindmap": "graph TD...",
                            "investment_total": 0.00,
                            "setup_fee": 0.00,
                            "installment_value": 0.00,
                            "client_name": "Empresa",
                            "client_contact_name": "Pessoa",
                            "client_email": "..."
                        }
                        
                        Transcrição:
                        ${transcript.substring(0, 25000)}`
                    }],
                    model: 'gpt-4o'
                }
            });

            if (error) throw error;

            if (data?.response) {
                // Robust JSON Parse with detailed logging
                console.log("Raw AI Response:", data.response);

                let cleanJson = data.response.replace(/```json/g, '').replace(/```/g, '');
                const firstBrace = cleanJson.indexOf('{');
                const lastBrace = cleanJson.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
                }

                console.log("Attempting to parse:", cleanJson);

                try {
                    const parsed = JSON.parse(cleanJson);
                    if (parsed.summary) setValue('summary', parsed.summary);
                    if (parsed.mindmap) setValue('mindmap_code', parsed.mindmap);
                    if (parsed.investment_total) setValue('investment_total', parsed.investment_total.toString());
                    if (parsed.setup_fee) setValue('setup_fee', parsed.setup_fee.toString());
                    if (parsed.installment_value) setValue('installment_value', String(parsed.installment_value));

                    // AI Extracted Contact Data (Fallback/Correction)
                    if (parsed.client_name) {
                        setValue('client_name', parsed.client_name);
                        // Auto-update title if it's empty or generic
                        const currentTitle = watch('title');
                        if (!currentTitle || currentTitle.includes('Proposta') || currentTitle === '') {
                            setValue('title', `Proposta ${parsed.client_name}`);
                        }
                    }
                    if (parsed.client_contact_name) setValue('client_contact_name', parsed.client_contact_name);
                    if (parsed.client_email) setValue('client_email', parsed.client_email);

                } catch (parseError: any) {
                    console.error("JSON PARSE ERROR:", parseError);
                    throw new Error(`Parse Error: ${parseError.message.slice(0, 50)}...`);
                }

                toast({ title: 'Conteúdo Gerado!', description: 'Resumo, Visual e Valores extraídos com sucesso.' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro na IA', description: 'Falha ao gerar escopo.', variant: 'destructive' });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/admin/proposals')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">{isEditing ? 'Editar Página' : 'Nova Página do Cliente'}</h1>
                        <p className="text-zinc-500 text-sm">Crie uma sala de negociação ou página de entrega.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-zinc-800 rounded-lg px-8 shadow-lg shadow-black/5">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input & AI */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Basic Settings */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Cliente (Empresa)</Label>
                                <Input {...register('client_name')} placeholder="Nome da Empresa" className="bg-white border-zinc-200 h-10 shadow-sm focus:ring-black" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Contato (Nome)</Label>
                                <Input {...register('client_contact_name')} placeholder="Nome da Pessoa" className="bg-white border-zinc-200 h-10 shadow-sm focus:ring-black" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Email</Label>
                                <Input {...register('client_email')} placeholder="email@cliente.com" className="bg-white border-zinc-200 h-10 shadow-sm focus:ring-black" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <input type="hidden" {...register('category')} />
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Status</Label>
                                <select {...register('status')} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm">
                                    <option value="draft">Rascunho</option>
                                    <option value="sent">Enviado</option>
                                    <option value="approved">Aprovado</option>
                                    <option value="rejected">Rejeitado</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Valor Total (R$)</Label>
                                <Input type="number" {...register('investment_total')} className="bg-white border-zinc-200 h-10 shadow-sm focus:ring-black font-bold" placeholder="0.00" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Setup / Entrada (R$)</Label>
                                <Input type="number" {...register('setup_fee')} className="bg-white border-zinc-200 h-10 shadow-sm focus:ring-black" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Mensal / Parcela (R$)</Label>
                                <Input type="number" {...register('installment_value')} className="bg-white border-zinc-200 h-10 shadow-sm focus:ring-black" placeholder="0.00" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Título Interno</Label>
                            <Input {...register('title')} placeholder="Ex: Proposta de Growth - Q1 2026" className="font-medium text-lg h-12 bg-white border-zinc-200 shadow-sm focus:ring-black" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">URL Slug (Link Público)</Label>
                            <Input {...register('slug')} placeholder="acme-kickoff-q1" className="bg-zinc-50 border-zinc-200 font-mono text-sm shadow-sm focus:ring-black" />
                        </div>
                    </div>

                    <div className="w-full h-px bg-zinc-100" />

                    {/* 2. AI Intelligence Agent */}
                    <div>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-black text-white">
                                    <Sparkles size={14} fill="currentColor" />
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Intelligence Agent</span>
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Gerador de Estratégia</h2>
                            <p className="text-zinc-500 max-w-lg text-sm mt-1">
                                Importe uma reunião do tl;dv para que a IA extraia o contexto de vendas e gere uma proposta de alto valor.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {/* Step 1: Link & Manual Input */}
                            <div className="group border border-zinc-200 rounded-xl p-6 hover:border-zinc-300 transition-colors bg-white relative">
                                <div className="absolute top-6 left-6 flex flex-col items-center gap-1 h-full">
                                    <div className="w-6 h-6 rounded-full border border-zinc-200 text-[10px] font-bold text-zinc-500 flex items-center justify-center bg-zinc-50 z-10">1</div>
                                    <div className="w-px h-full bg-zinc-100" />
                                </div>

                                <div className="pl-12 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-900">Fonte de Dados</h3>
                                            <p className="text-xs text-zinc-500">Escolha a origem do conteúdo para a IA.</p>
                                        </div>
                                    </div>

                                    {/* Tabs for Source */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 border-b border-zinc-100 pb-2">
                                            <button type="button" className="text-xs font-semibold text-black border-b-2 border-black pb-2 -mb-2.5">Link (tl;dv / Loom)</button>
                                            <button type="button" className="text-xs font-medium text-zinc-400 hover:text-zinc-600 pb-2 -mb-2.5 transition-colors">Transcrição Manual</button>
                                        </div>

                                        {/* Link Input Section */}
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <Input
                                                    {...register('recording_url')}
                                                    placeholder="https://tldv.io/..."
                                                    className="font-mono text-sm bg-zinc-50 border-zinc-200 focus:bg-white transition-all h-10 flex-1"
                                                />
                                                <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-10 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                                            onClick={async () => {
                                                                setLoadingHistory(true);

                                                                // Local Mock Data for Fallback/Demo
                                                                const MOCK_MEETINGS = [
                                                                    {
                                                                        name: "Kickoff RevHackers - Projeto Growth (Demo)",
                                                                        date: new Date().toISOString(),
                                                                        duration: 3600,
                                                                        url: "https://tldv.io/app/meetings/demo-1",
                                                                        transcript: "Speaker A: Vamos focar em ROI.\nSpeaker B: Concordo, meta de 100k.\nSpeaker A: Setup de 5k e mensal de 10k.",
                                                                        clientName: "Cliente Demo Corp",
                                                                        clientEmail: "contato@clientedemo.com"
                                                                    },
                                                                    {
                                                                        name: "Follow-up Mensal - Campanha Q1 (Demo)",
                                                                        date: new Date(Date.now() - 86400000).toISOString(),
                                                                        duration: 1800,
                                                                        url: "https://tldv.io/app/meetings/demo-2",
                                                                        transcript: "Speaker A: Resultados positivos no LinkedIn.\nSpeaker B: Vamos escalar para o próximo mês.",
                                                                        clientName: "Beta Inc",
                                                                        clientEmail: "ceo@beta.com"
                                                                    }
                                                                ];

                                                                try {
                                                                    // Attempt 1: Try via Backend Edge Function (Secure Proxy)
                                                                    const { data, error } = await supabase.functions.invoke('fetch-tldv-meeting', {
                                                                        body: {
                                                                            action: 'list',
                                                                            apiKey: '14539301-bff7-4b91-9689-3af63ae7d5cc'
                                                                        }
                                                                    });

                                                                    if (!error && data?.success && Array.isArray(data.data)) {
                                                                        if (data.data.length > 0) {
                                                                            // Normalize Backend Data
                                                                            const normalized = data.data.map((m: any) => ({
                                                                                id: m.id,
                                                                                name: m.name || m.title || "Sem Título",
                                                                                date: m.date || m.createdAt || new Date().toISOString(),
                                                                                duration: m.duration || 0,
                                                                                url: m.url || m.recordingUrl,
                                                                                transcript: m.transcript || "",
                                                                                // Smart extraction: "Kickoff - Acme Corp" -> "Acme Corp"
                                                                                clientName: m.clientName || (m.name && m.name.includes('-') ? m.name.split('-')[1].trim() : ""),
                                                                                clientEmail: m.clientEmail || ""
                                                                            }));
                                                                            setMeetingHistory(normalized);
                                                                            return;
                                                                        }
                                                                    }

                                                                    // Trigger fallback if backend returned error or empty
                                                                    throw new Error(data?.error || error?.message || "Backend Error");

                                                                } catch (backendError: any) {
                                                                    console.warn("Backend failed, trying direct fetch...", backendError);

                                                                    try {
                                                                        // Attempt 2: Direct Fetch (Client-side)
                                                                        // Note: This relies on the API supporting CORS. If it fails, we go to mock.
                                                                        const directResponse = await fetch("https://pasta.tldv.io/v1alpha1/meetings?limit=5", {
                                                                            method: 'GET',
                                                                            headers: {
                                                                                'x-api-key': '14539301-bff7-4b91-9689-3af63ae7d5cc',
                                                                                'Content-Type': 'application/json'
                                                                            }
                                                                        });

                                                                        if (directResponse.ok) {
                                                                            const rawData = await directResponse.json();
                                                                            let meetings = rawData.results || rawData.data || rawData || [];

                                                                            // Normalize
                                                                            const normalized = meetings.map((m: any) => ({
                                                                                id: m.id,
                                                                                name: m.name || m.title || "Sem Título",
                                                                                date: m.date || m.createdAt || new Date().toISOString(),
                                                                                duration: m.duration || 0,
                                                                                url: m.url || m.recordingUrl,
                                                                                transcript: m.transcript || "",
                                                                                clientName: (m.name && m.name.includes('-') ? m.name.split('-')[1].trim() : ""),
                                                                                clientEmail: ""
                                                                            }));

                                                                            if (normalized.length > 0) {
                                                                                setMeetingHistory(normalized);
                                                                                toast({ title: 'Sucesso', description: 'Reuniões carregadas (Direct Mode).' });
                                                                                return;
                                                                            }
                                                                        }
                                                                        throw new Error("Direct Fetch Failed: " + directResponse.status);

                                                                    } catch (directError: any) {
                                                                        // Fallback to Mock
                                                                        console.warn("All APIs failed. Using Mock.", directError);
                                                                        setMeetingHistory(MOCK_MEETINGS);
                                                                        toast({
                                                                            title: 'Modo Demonstração Ativado',
                                                                            description: `Falha na conexão real (${backendError.message || 'Network'}). Exibindo dados locais.`,
                                                                            duration: 5000,
                                                                            variant: 'default'
                                                                        });
                                                                    }
                                                                } finally {
                                                                    setLoadingHistory(false);
                                                                }
                                                            }}
                                                        >
                                                            <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                                            Histórico
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl bg-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Últimas Reuniões (tl;dv)</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 mt-2">
                                                            {/* API Key input removed as per user request (Backend handles auth) */}

                                                            <div className="max-h-[50vh] overflow-y-auto space-y-2 p-1">
                                                                {loadingHistory ? (
                                                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-300" /></div>
                                                                ) : meetingHistory.length > 0 ? (
                                                                    meetingHistory.map((meeting, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="p-4 border border-zinc-100 rounded-lg hover:bg-zinc-50/80 cursor-pointer transition-all flex items-center justify-between group"
                                                                            onClick={async () => {
                                                                                const url = meeting.url || meeting.recordingUrl;

                                                                                // 1. Reset Context (New Video = New Proposal) - Enforce Fresh Start
                                                                                setValue('recording_url', url);
                                                                                setValue('loom_url', url);

                                                                                // Clear Generated Financials & Outputs to avoid mixing data
                                                                                setValue('setup_fee', '');
                                                                                setValue('installment_value', '');
                                                                                setValue('investment_total', '');
                                                                                setValue('summary', '');
                                                                                setValue('mindmap_code', '');

                                                                                // Clear/Overwrite Client Data
                                                                                setValue('client_contact_name', '');
                                                                                setValue('client_name', meeting.clientName || '');
                                                                                setValue('client_email', meeting.clientEmail || '');

                                                                                // Immediate Title Update
                                                                                if (meeting.clientName) {
                                                                                    setValue('title', `Proposta ${meeting.clientName}`);
                                                                                } else {
                                                                                    // Fallback if clientName empty: Use Meeting Title or clear
                                                                                    setValue('title', meeting.name ? `Proposta - ${meeting.name}` : '');
                                                                                }


                                                                                setGenerating(true);
                                                                                toast({ title: 'Processando...', description: 'Extraindo dados da reunião...' });

                                                                                // If we already have transcript in metadata (rare but possible)
                                                                                if (meeting.transcript) {
                                                                                    setValue('transcript', meeting.transcript);
                                                                                    setValue('manual_transcript', meeting.transcript);
                                                                                    // Overwrite if specific data exists
                                                                                    if (meeting.clientName) setValue('client_name', meeting.clientName);
                                                                                    if (meeting.clientEmail) setValue('client_email', meeting.clientEmail);

                                                                                    toast({ title: 'Dados Carregados', description: 'Transcrição pronta.' });
                                                                                    setHistoryOpen(false);
                                                                                    setGenerating(false);
                                                                                    return;
                                                                                }

                                                                                try {
                                                                                    // 1. Try Backend Proxy with Key Injection
                                                                                    const { data, error } = await supabase.functions.invoke('fetch-tldv-meeting', {
                                                                                        body: {
                                                                                            meetingUrl: url,
                                                                                            apiKey: '14539301-bff7-4b91-9689-3af63ae7d5cc',
                                                                                            meetingId: meeting.id // Pass ID just in case backend uses it
                                                                                        }
                                                                                    });

                                                                                    if (!error && data?.success && data.data.transcript) {
                                                                                        setValue('transcript', data.data.transcript);
                                                                                        setValue('manual_transcript', data.data.transcript);
                                                                                        // FORCE Update Client Data if API serves it
                                                                                        if (data.data.clientName) {
                                                                                            setValue('client_name', data.data.clientName);
                                                                                            setValue('title', `Proposta ${data.data.clientName}`);
                                                                                        }
                                                                                        if (data.data.clientEmail) setValue('client_email', data.data.clientEmail);

                                                                                        toast({ title: 'Transcrição Extraída!' });
                                                                                        setHistoryOpen(false);
                                                                                        return;
                                                                                    }

                                                                                    throw new Error("Backend invoke failed");

                                                                                } catch (invokeError) {
                                                                                    console.warn("Backend transcript fetch failed, trying direct...", invokeError);

                                                                                    // 2. Direct Fetch Fallback
                                                                                    if (meeting.id) {
                                                                                        try {
                                                                                            const tRes = await fetch(`https://pasta.tldv.io/v1alpha1/meetings/${meeting.id}/transcript`, {
                                                                                                headers: { 'x-api-key': '14539301-bff7-4b91-9689-3af63ae7d5cc' }
                                                                                            });

                                                                                            if (tRes.ok) {
                                                                                                const tData = await tRes.json();
                                                                                                // Normalize Transcript (Handle top-level array OR object with .data)
                                                                                                const transcriptArray = Array.isArray(tData) ? tData : (Array.isArray(tData.data) ? tData.data : []);

                                                                                                const transcriptText = transcriptArray.length > 0
                                                                                                    ? transcriptArray.map((t: any) => `${t.speaker || 'Speaker'}: ${t.text}`).join('\n')
                                                                                                    : (typeof tData === 'string' ? tData : JSON.stringify(tData, null, 2));

                                                                                                setValue('transcript', transcriptText);
                                                                                                setValue('manual_transcript', transcriptText);
                                                                                                toast({ title: 'Transcrição Recuperada (Direct)' });
                                                                                                setHistoryOpen(false);
                                                                                                return;
                                                                                            }
                                                                                        } catch (directErr) {
                                                                                            console.error("Direct transcript fetch failed", directErr);
                                                                                        }
                                                                                    }

                                                                                    toast({
                                                                                        title: 'Aviso: Transcrição Pendente',
                                                                                        description: 'Link carregado, mas não foi possível baixar a transcrição automaticamente. Por favor, cole manualmente se necessário.',
                                                                                    });
                                                                                } finally {
                                                                                    setGenerating(false);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div>
                                                                                <div className="font-semibold text-sm text-zinc-900">{meeting.name || 'Sem Título'}</div>
                                                                                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                                                                                    <span>{meeting.date ? new Date(meeting.date).toLocaleDateString() : 'Data desconhecida'}</span>
                                                                                    <span>•</span>
                                                                                    <span>{meeting.duration ? `${Math.round(meeting.duration / 60)} min` : '-- min'}</span>
                                                                                </div>
                                                                            </div>
                                                                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 text-xs">
                                                                                Selecionar <ArrowLeft className="w-3 h-3 rotate-180 ml-2" />
                                                                            </Button>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-center p-8 text-zinc-400 text-sm">Nenhuma reunião encontrada.</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                <Button
                                                    type="button"
                                                    onClick={async () => {
                                                        const url = watch('recording_url');
                                                        if (!url) return toast({ title: 'Insira um link', variant: 'destructive' });
                                                        setGenerating(true);
                                                        try {
                                                            const { data } = await supabase.functions.invoke('fetch-tldv-meeting', { body: { meetingUrl: url, apiKey: '14539301-bff7-4b91-9689-3af63ae7d5cc' } });
                                                            if (data?.success) {
                                                                setValue('transcript', data.data.transcript);
                                                                setValue('manual_transcript', data.data.transcript);
                                                                if (!watch('client_name')) setValue('client_name', data.data.clientName);
                                                                if (data.data.clientName) setValue('title', `Proposta ${data.data.clientName}`);
                                                                toast({ title: 'Sucesso', description: 'Transcrição carregada.' });
                                                            }
                                                        } catch (e) { toast({ title: 'Erro', variant: 'destructive' }); }
                                                        finally { setGenerating(false); }
                                                    }}
                                                    disabled={generating || !watch('recording_url')}
                                                    className="h-10 bg-zinc-900 text-white hover:bg-black px-4 shadow-sm"
                                                    title="Extrair Manualmente"
                                                >
                                                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 rotate-180" />}
                                                </Button>
                                            </div>

                                            {/* Video Preview - Above Transcript */}
                                            {(() => {
                                                const rawUrl = watch('recording_url');
                                                // Extract URL if user pasted full <iframe> code
                                                let embedSrc = rawUrl?.match(/src="([^"]+)"/)?.[1] || rawUrl;

                                                // Convert Loom Share to Embed
                                                if (embedSrc?.includes('loom.com/share')) {
                                                    embedSrc = embedSrc.replace('loom.com/share', 'loom.com/embed');
                                                }

                                                const isTldv = embedSrc?.includes('tldv.io');

                                                return embedSrc ? (
                                                    <div className="mb-4 rounded-lg border border-zinc-200 bg-black aspect-video relative group overflow-hidden">
                                                        <iframe
                                                            src={embedSrc}
                                                            className="w-full"
                                                            style={{
                                                                height: isTldv ? 'calc(100% + 220px)' : '100%',
                                                                marginTop: isTldv ? '-200px' : '0',
                                                                borderRadius: '8px'
                                                            }}
                                                            allowFullScreen
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                                                            frameBorder="0"
                                                            scrolling="no"
                                                        />
                                                        <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                            Preview
                                                        </div>
                                                        <a
                                                            href={embedSrc}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute bottom-2 right-2 bg-white/90 text-zinc-900 text-[10px] font-medium px-2 py-1 rounded shadow-sm hover:bg-white z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Abrir Nova Aba ↗
                                                        </a>
                                                    </div>
                                                ) : null;
                                            })()}

                                            {/* Manual Transcript Area */}
                                            <div className="space-y-2 pt-2">
                                                <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Transcrição (Edite se necessário)</Label>
                                                <Textarea
                                                    {...register('manual_transcript')}
                                                    placeholder="Cole a transcrição aqui manualmente ou aguarde a importação..."
                                                    className="min-h-[150px] text-xs font-mono bg-zinc-50 border-zinc-200 resize-y"
                                                    onChange={(e) => {
                                                        setValue('manual_transcript', e.target.value);
                                                        setValue('transcript', e.target.value);
                                                    }}
                                                />
                                            </div>

                                            {/* Additional Assets Inputs */}
                                            {/* Additional Assets Inputs */}
                                            <div className="pt-4 border-t border-zinc-100">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">Whimsical / Miro / Figjam (Manual Embed)</Label>
                                                    <Input
                                                        {...register('mindmap_url')}
                                                        placeholder="Cole a URL ou código de embed do board..."
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Generate */}
                            <div className="group border border-zinc-200 rounded-xl p-6 bg-zinc-50/50 hover:bg-zinc-50 transition-colors relative">
                                <div className="absolute top-6 left-6 flex flex-col items-center gap-1 h-full">
                                    <div className="w-6 h-6 rounded-full border border-zinc-300 text-[10px] font-bold text-zinc-600 flex items-center justify-center bg-white shadow-sm z-10">2</div>
                                </div>

                                <div className="pl-12">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-900">Gerar Estratégia</h3>
                                            <p className="text-xs text-zinc-500">A IA criará o resumo executivo, precificação e mapa mental.</p>
                                        </div>
                                        <Collapsible>
                                            <CollapsibleTrigger asChild>
                                                <button className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 uppercase tracking-wider bg-white px-2 py-1 rounded border border-zinc-200 shadow-sm">
                                                    <Eye size={10} />
                                                    Debug
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="absolute top-full left-0 right-0 z-20 mt-2 p-4 bg-white border border-zinc-200 rounded-lg shadow-xl w-full">
                                                    <Textarea
                                                        {...register('transcript')}
                                                        className="min-h-[200px] font-mono text-[10px] text-zinc-500 bg-zinc-50 resize-none focus:ring-0"
                                                        readOnly
                                                        placeholder="Transcrições aparecerão aqui..."
                                                    />
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleGenerateScope}
                                        disabled={generating || !watch('transcript')}
                                        className="w-full h-12 bg-zinc-900 hover:bg-black text-white font-medium text-sm shadow-md disabled:opacity-50 disabled:shadow-none transition-all rounded-lg active:scale-[0.99]"
                                    >
                                        <span className="font-semibold">Gerar Proposta Completa (AI)</span>
                                    </Button>

                                    {/* Submit / Save Button */}
                                    <div className="pt-4 mt-4 border-t border-zinc-200">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md transition-all rounded-lg"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            SALVAR E VISUALIZAR PROPOSTA
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Generated Content */}
                    <div className="space-y-6">
                        <Card className="border-zinc-100 shadow-sm h-full bg-zinc-50/50 sticky top-6">
                            <CardContent className="p-6 space-y-6 h-full flex flex-col">
                                <h3 className="font-bold text-zinc-900 border-b border-zinc-200 pb-4 mb-2 text-sm uppercase tracking-wide">Assets Gerados</h3>

                                {/* Video Preview Removed (Moved to Left Col) */}

                                <div className="space-y-3 flex-1 pb-4 border-b border-zinc-100">
                                    {/* Leaving this empty space or removing if no other top element */}
                                    <Label className="text-xs text-zinc-500 uppercase font-semibold">Logo (Upload)</Label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-zinc-700 text-xs font-medium py-2 px-4 rounded-md shadow-sm transition-colors w-full">
                                                {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                {uploadingLogo ? 'Enviando...' : 'Selecionar Imagem'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    disabled={uploadingLogo}
                                                />
                                            </label>
                                        </div>

                                        {watch('client_logo') && (
                                            <div className="bg-white border border-zinc-200 rounded-lg p-3 relative group">
                                                <img
                                                    src={watch('client_logo')}
                                                    alt="Logo Preview"
                                                    className="h-12 w-auto object-contain mx-auto"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setValue('client_logo', '')}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <div className="w-3 h-3 flex items-center justify-center font-bold text-[10px]">✕</div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <Label className="text-xs text-zinc-500 uppercase font-semibold">Resumo Executivo</Label>
                                    <Textarea
                                        {...register('summary')}
                                        placeholder="Conteúdo gerado pela IA..."
                                        className="min-h-[150px] bg-white border-zinc-200 text-xs leading-relaxed"
                                    />
                                </div>

                                {/* Mermaid Code - Only show if content exists */}
                                {watch('mindmap_code') && (
                                    <div className="space-y-3 pt-4 border-t border-zinc-100">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-zinc-500 uppercase font-semibold">Mermaid.js Code</Label>
                                            <a href="https://mermaid.live" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Testar ↗</a>
                                        </div>
                                        <Textarea
                                            {...register('mindmap_code')}
                                            className="min-h-[300px] font-mono text-[11px] bg-white resize-none shadow-sm h-full rounded-md border-zinc-200 focus:ring-black"
                                            placeholder="# Proposta..."
                                        />
                                    </div>
                                )}

                                {/* Mermaid Code Input (Visible for editing) */}
                                <div className="space-y-3 pt-4 border-t border-zinc-100">
                                    <Label className="text-xs text-zinc-500 uppercase font-semibold">Código Mermaid (Visual)</Label>
                                    <Textarea
                                        {...register('mindmap_code')}
                                        className="min-h-[100px] font-mono text-[10px] bg-zinc-50 resize-none shadow-sm rounded-md border-zinc-200"
                                        placeholder="graph TD..."
                                    />
                                </div>

                                {watch('mindmap_url') && (
                                    <div className="space-y-3 pt-4 border-t border-zinc-100">
                                        <Label className="text-xs text-zinc-500 uppercase font-semibold">Visual Embed (Miro / Figjam)</Label>
                                        <div className="w-full aspect-video bg-zinc-100 rounded-lg border border-zinc-200 overflow-hidden relative">
                                            <iframe
                                                src={watch('mindmap_url')?.replace('miro.com/app/board', 'miro.com/app/live-embed')}
                                                className="w-full h-full"
                                                frameBorder="0"
                                                allowFullScreen
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                                                Preview
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProposalForm;
