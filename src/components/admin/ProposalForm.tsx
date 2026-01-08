
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Wand2, ArrowLeft, RefreshCw, Save, ExternalLink, Upload, FileText, Video, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';
import { useAI } from '@/context/AIContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

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
    category: 'proposal';
    mindmap_code: string;
    setup_fee: string;
    installment_value: string;
    installment_count: string;
    loom_url?: string;
    mindmap_url?: string;
    manual_transcript?: string;
    headline?: string;
    subheadline?: string;
    brief_explanation?: string;
    mindmap_embed?: string;
    detailed_scope?: string;
    payment_terms?: string;
    crm_data?: any;
    proposal_source?: 'call' | 'bid';
    bid_document_url?: string;
    call_detail_summary?: string;
    agenda_link?: string;
    booking_url?: string;
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
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [meetingHistory, setMeetingHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const { agents } = useAI();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProposalFormValues>({
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            client_name: initialData?.client_name || '',
            client_contact_name: initialData?.client_contact_name || '',
            client_email: initialData?.client_email || '',
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
            installment_count: initialData?.installment_count || '6',
            loom_url: initialData?.loom_url || '',
            mindmap_url: initialData?.mindmap_url || '',
            manual_transcript: initialData?.manual_transcript || '',
            headline: initialData?.headline || '',
            subheadline: initialData?.subheadline || '',
            brief_explanation: initialData?.brief_explanation || '',
            mindmap_embed: initialData?.mindmap_embed || '',
            detailed_scope: initialData?.detailed_scope || '',
            payment_terms: initialData?.payment_terms || '',
            proposal_source: initialData?.proposal_source || 'call',
            bid_document_url: initialData?.bid_document_url || '',
            call_detail_summary: initialData?.call_detail_summary || '', // Registered new field
            booking_url: initialData?.booking_url || 'https://pages.revhackers.com.br/widget/booking/MmyRuRPox3ZComQA3jJ1',
            crm_data: initialData?.crm_data || {
                pain_points: [],
                budget_range: '',
                decision_makers: '',
                urgency: '',
                next_steps: '',
                qualified_score: 5
            }
        }
    });

    const watchedTitle = watch('title');
    const watchedSource = watch('proposal_source');

    useEffect(() => {
        if (!isEditing && watchedTitle) {
            const baseSlug = watchedTitle
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            // Add timestamp to ensure uniqueness
            const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
            setValue('slug', uniqueSlug);
        }
    }, [watchedTitle, isEditing, setValue]);

    const updateFieldsWithMetadata = (m: any, force = false) => {
        if (!m) return;

        let cName = m.clientName;
        if (!cName && (m.name || m.title)) {
            const n = m.name || m.title;
            if (n.includes('with')) {
                const parts = n.split('with');
                cName = parts[parts.length - 1].trim();
            }
            else if (n.includes(' x ')) cName = n.split(' x ')[0].toLowerCase().includes('revhackers') ? n.split(' x ')[1].trim() : n.split(' x ')[0].trim();
            else if (n.includes('>')) cName = n.split('>')[1].trim();
            else if (n.includes('-')) {
                const parts = n.split('-');
                cName = parts[parts.length - 1].trim();
            } else {
                cName = n.replace('Reunião de ', '').replace('Kickoff ', '').trim();
            }
        }

        const shouldSet = (field: keyof ProposalFormValues) => {
            const current = watch(field);
            return force || !current || current === "" || current === "0" || current === 0;
        };

        const INTERNAL_NAMES = ['Giulliano', 'RevHackers', 'Bot', 'Notetaker'];
        const isInternal = (str: string) => str && INTERNAL_NAMES.some(i => str.toLowerCase().includes(i.toLowerCase()));

        // 1. Find Valid External Participant
        let validContactName = m.clientContactName;
        let validEmail = m.clientEmail;

        const allParticipants = m.participants || m.attendees || [];
        if (Array.isArray(allParticipants) && allParticipants.length > 0) {
            // Find first person who is NOT internal
            const externalPerson = allParticipants.find((p: any) => {
                const n = p.name || p.display_name || "";
                const e = p.email || p.emailAddress || "";
                return (n && !isInternal(n)) || (e && !isInternal(e));
            });

            if (externalPerson) {
                validContactName = externalPerson.name || externalPerson.display_name || validContactName;
                validEmail = externalPerson.email || externalPerson.emailAddress || validEmail;
            }
        }

        if (cName && shouldSet('client_name') && !isInternal(cName)) setValue('client_name', cName);

        if (validContactName && shouldSet('client_contact_name') && !isInternal(validContactName)) {
            setValue('client_contact_name', validContactName);
        }

        if (validEmail && shouldSet('client_email') && !isInternal(validEmail)) {
            setValue('client_email', validEmail);
        }

        // 5. Fallback: Parse Transcript if no metadata (API invalid/empty)
        if ((!validContactName || !validEmail) && m.transcript) {
            const speakerRegex = /^([^:\n]+):/gm;
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
            let match;
            const seenSpeakers = new Set<string>();

            // Limit scan to first 20k chars to avoid lag
            const txt = m.transcript.substring(0, 20000);

            while ((match = speakerRegex.exec(txt)) !== null) {
                const name = match[1].trim();
                // Filter out short names, internal names, and generic labels
                if (name.length > 2 && !isInternal(name) && !name.includes('Speaker') && !seenSpeakers.has(name)) { // Added 'Speaker' check
                    seenSpeakers.add(name);
                    validContactName = name;
                    break; // Found the first non-internal speaker!
                }
            }

            // B. Extract Email
            if (!validEmail) {
                const emails = txt.match(emailRegex);
                if (emails && emails.length > 0) {
                    const found = emails.find((e: string) => !isInternal(e) && !e.includes('tldv.io') && !e.includes('notetaker'));
                    if (found) validEmail = found.toLowerCase();
                }
            }

            if (validContactName && shouldSet('client_contact_name')) {
                setValue('client_contact_name', validContactName);
                // Don't set 'Empresa de...' - leave blank for user to fill
            }

            if (validEmail && shouldSet('client_email')) {
                setValue('client_email', validEmail);
                // Try to extract company name from email domain
                if (shouldSet('client_name') && !validEmail.match(/gmail|outlook|hotmail|yahoo|icloud/i)) {
                    const domain = validEmail.split('@')[1]?.split('.')[0];
                    if (domain && domain.length > 2) {
                        setValue('client_name', domain.charAt(0).toUpperCase() + domain.slice(1));
                    }
                }
            }
        }

        if (m.transcript && shouldSet('transcript')) {
            setValue('transcript', m.transcript);
            setValue('manual_transcript', m.transcript);
        }

        if (m.crm_data) {
            setValue('crm_data', m.crm_data);
        }

        if (cName && (force || !watch('title') || watch('title').includes('Proposta'))) {
            setValue('title', `Proposta REVHACKERS x ${cName}`);
        }
    };

    const watchedUrl = watch('recording_url');
    useEffect(() => {
        const fetchMetadata = async () => {
            if (watchedUrl && (watchedUrl.includes('tldv.io') || watchedUrl.includes('call')) && watchedUrl.length > 20) {
                try {
                    const { data, error } = await supabase.functions.invoke('fetch-tldv-meeting', {
                        body: { meetingUrl: watchedUrl }
                    });

                    if (data?.success && data.data) {
                        updateFieldsWithMetadata(data.data);
                        // Automatically generate proposal data if we got a transcript
                        if (data.data.transcript && data.data.transcript.length > 100) {
                            // Small delay to let fields populate first
                            setTimeout(() => {
                                handleGenerateScope(data.data.transcript);
                            }, 500);
                        }
                    }
                } catch (e) {
                    console.warn("Auto-fetch metadata failed:", e);
                }
            }
        };
        fetchMetadata();
    }, [watchedUrl, setValue]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'document') => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (type === 'logo') setUploadingLogo(true);
        else setUploadingDoc(true);

        try {
            const publicUrl = await uploadImageToSupabase(file, 'lovable-uploads');
            if (publicUrl) {
                if (type === 'logo') {
                    setValue('client_logo', publicUrl);
                    toast({ title: 'Logo enviado com sucesso!' });
                } else {
                    setValue('bid_document_url', publicUrl);
                    toast({ title: 'Documento enviado!', description: 'Extraindo dados estratégicos...' });
                }
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro no upload', variant: 'destructive' });
        } finally {
            if (type === 'logo') setUploadingLogo(false);
            else setUploadingDoc(false);
        }
    };

    const onSubmit = async (data: ProposalFormValues) => {
        setLoading(true);
        try {
            // Only include fields that exist in the database
            const payload = {
                title: data.title,
                slug: data.slug,
                client_name: data.client_name,
                client_contact_name: data.client_contact_name || null,
                client_email: data.client_email || null,
                client_logo: data.client_logo || null,
                recording_url: data.recording_url || null,
                transcript: data.transcript || null,
                summary: data.summary || null,
                investment_total: data.investment_total ? Number(data.investment_total) : null,
                setup_fee: data.setup_fee ? Number(data.setup_fee) : null,
                installment_value: data.installment_value ? Number(data.installment_value) : null,
                installment_count: data.installment_count ? Number(data.installment_count) : null,
                status: data.status || 'draft',
                category: data.category || 'proposal',
                mindmap_code: data.mindmap_code || null,
                loom_url: data.loom_url || null,
                headline: data.headline || null,
                subheadline: data.subheadline || null,
                brief_explanation: data.brief_explanation || null,
                detailed_scope: data.detailed_scope || null,
                payment_terms: data.payment_terms || null,
                crm_data: data.crm_data || null,
            };

            if (isEditing && initialData?.id) {
                const { error } = await supabase.from('proposals').update(payload).eq('id', initialData.id);
                if (error) throw error;
                toast({ title: 'Proposta atualizada!' });
                // Stay on page or navigate to details
                // navigate(`/admin/proposals/${initialData.id}`); 
            } else {
                const { data: newProposal, error } = await supabase.from('proposals').insert(payload).select().single();
                if (error) throw error;
                toast({ title: 'Proposta criada!' });
                if (newProposal?.id) {
                    // Redirect to the edit/view page of the new proposal
                    navigate(`/admin/proposals/edit/${newProposal.id}`);
                }
            }
        } catch (error: any) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchMeetingHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase.functions.invoke('fetch-tldv-meeting', {
                body: { action: 'list' }
            });
            if (!error && data?.success && Array.isArray(data.data)) {
                setMeetingHistory(data.data);
            }
        } catch (e: any) {
            console.warn("Failed to fetch history:", e);
            toast({ title: 'Erro ao buscar histórico', description: e.message || 'Verifique se a função foi deployada.', variant: 'destructive' });
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleGenerateScope = async (input?: string | { text: string; type: 'transcript' | 'bid'; metadata?: any }) => {
        let transcript = '';
        let contextMetadata: any = null;

        if (input) {
            if (typeof input === 'string') {
                transcript = input;
            } else {
                transcript = input.text;
                contextMetadata = input.metadata;
            }
        }

        // Fallback to form watch if not passed explicitly
        if (!transcript) transcript = watch('transcript');

        const sourceDoc = watch('bid_document_url');

        if (!transcript && !sourceDoc) {
            toast({ title: 'Erro', description: 'Adicione uma fonte de dados válida primeiro (Transcrição ou Documento).', variant: 'destructive' });
            return;
        }

        setGenerating(true);
        try {
            // Construct Context Block
            let contextBlock = "";
            if (contextMetadata) {
                contextBlock = `
                CONTEXTO DA CALL (METADATA):
                - Título: ${contextMetadata.name || 'N/A'}
                - Duração: ${Math.round((contextMetadata.duration || 0) / 60)} min
                - Participantes: ${contextMetadata.participants ? contextMetadata.participants.map((p: any) => p.name).join(', ') : 'Não listado'}
                - Data: ${contextMetadata.createdAt ? new Date(contextMetadata.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                
                USE ESTES DADOS PARA:
                1. Identificar quem é o Decisor (pelo cargo/nome).
                2. Estimar o 'Budget' baseado no nível dos participantes.
                3. Se a call for curta (<15min), seja direto. Se longa (>40min), detalhe mais a estratégia.
                `;
            }

            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    raw_mode: true,
                    messages: [{
                        role: 'system',
                        content: `Você é um consultor de RevOps. REGRAS: 1) Extraia SOMENTE dados REAIS da transcrição. 2) O campo "summary" deve ser TEXTO PURO formatado com emojis, NÃO objeto/array. 3) O campo "detailed_scope" deve ser TEXTO PURO em formato de documento profissional. 4) Retorne APENAS JSON válido com strings de texto.`
                    }, {
                        role: 'user',
                        content: `TRANSCRIÇÃO:
${transcript.substring(0, 18000)}

Retorne JSON com TEXTO PURO (não objetos) para summary e detailed_scope:

{
  "summary": "🎯 DORES DO CLIENTE:\\n• [dor real 1]\\n• [dor real 2]\\n\\n💰 BUDGET: [valor ou A definir]\\n\\n👤 DECISOR: [nome, cargo]\\n\\n📋 PRÓXIMOS PASSOS:\\n• [passo 1]\\n• [passo 2]\\n\\n⭐ SCORE: X/10",
  
  "headline": "Proposta REVHACKERS x [EMPRESA]",
  
  "detailed_scope": "FASE 0 – Diagnóstico Estratégico (30 dias)\\n\\nObjetivo: [baseado na call]\\n\\nEntregáveis:\\n• [item real]\\n• [item real]\\n\\n📌 Saída da fase: [resultado]\\n\\n---\\n\\nFASE 1 – Geração de Demanda\\n\\nObjetivo: [objetivo]\\n\\nFoco inicial:\\n• [canal mencionado - Google Ads, Meta, LinkedIn]\\n• [integração - HubSpot, CRM]\\n\\nEntregáveis:\\n• [entregável]\\n\\n📌 Resultado esperado: [resultado]\\n\\n---\\n\\nFASE 2 – Automação & Escala\\n\\nObjetivo: [objetivo]\\n\\nEntregáveis:\\n• [item]\\n\\n📌 Resultado: [resultado]",
  
  "client_name": "[EMPRESA REAL]",
  "client_contact_name": "[NOME REAL - busque quem se apresentou]", 
  "client_email": "[BUSQUE EMAIL na transcrição ou cabeçalho. Ex: @empresa.com.br. Se não achar, deixe em branco]",
  "investment_total": 0,
  "setup_fee": 0,
  "installment_value": 0
}`
                    }],
                    model: 'gpt-5.2'
                }
            });

            console.log('[AI GEN] Response received:', { success: !error, hasData: !!data, errorMsg: error?.message });

            if (error) throw error;

            const rawResponse = data?.response || data?.choices?.[0]?.message?.content || "";
            console.log('[AI GEN] Raw response length:', rawResponse?.length || 0);

            if (!rawResponse || rawResponse.length < 50) {
                throw new Error("Resposta da IA muito curta ou vazia. Tente novamente.");
            }

            // Clean the response
            let cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBrace = cleanJson.indexOf('{');
            const lastBrace = cleanJson.lastIndexOf('}');

            if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
                console.error("Invalid JSON structure:", rawResponse.substring(0, 500));
                throw new Error("Formato de resposta inválido. Tente novamente.");
            }

            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);

            let parsed;
            try {
                parsed = JSON.parse(cleanJson);
            } catch (parseError) {
                console.error("JSON Parse Error. Raw:", cleanJson.substring(0, 1000));
                throw new Error("Erro ao processar resposta da IA. Tente com uma transcrição menor.");
            }


            // Apply parsed values to form (handle objects)
            const toString = (val: any) => typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val || '');

            if (parsed.summary) setValue('summary', toString(parsed.summary));
            if (parsed.call_summary) setValue('call_detail_summary', toString(parsed.call_summary));
            if (parsed.detailed_scope) setValue('detailed_scope', toString(parsed.detailed_scope));
            if (parsed.headline) setValue('headline', toString(parsed.headline));

            if (parsed.investment_total) setValue('investment_total', String(parsed.investment_total));
            if (parsed.setup_fee) setValue('setup_fee', String(parsed.setup_fee));
            if (parsed.installment_value) setValue('installment_value', String(parsed.installment_value));

            // Handle client name - avoid "Empresa de..."
            if (parsed.client_name && !parsed.client_name.includes("Empresa de") && !["Não mencionado", "N/A"].includes(parsed.client_name)) {
                setValue('client_name', parsed.client_name);
            }
            if (parsed.client_contact_name && !["Não mencionado", "N/A"].includes(parsed.client_contact_name)) {
                setValue('client_contact_name', parsed.client_contact_name);
            }
            if (parsed.client_email && !["Não mencionado", "N/A"].includes(parsed.client_email)) {
                setValue('client_email', parsed.client_email);
            }

            if (parsed.crm_data) {
                setValue('crm_data', parsed.crm_data);
            }

            toast({ title: '✅ Proposta Extraída!', description: 'Revise os campos e ajuste se necessário.' });
        } catch (error: any) {
            console.error("AI GEN ERROR:", error);
            toast({ title: 'Erro na IA', description: error.message, variant: 'destructive' });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-7xl mx-auto pb-20 px-8">
            {/* Header Ultra Minimalista */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/admin/proposals')} className="rounded-full w-8 h-8 hover:bg-zinc-50 transition-all">
                        <ArrowLeft className="w-4 h-4 text-zinc-400" />
                    </Button>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight text-zinc-900 leading-none">
                            {isEditing ? 'Editar Proposta' : 'Nova Proposta'}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-12 pb-32">

                {/* 1. SINGLE CARD: VIDEO + DATA SOURCE */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            Fonte de Dados & Review
                        </h2>
                        {watch('recording_url') && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(watch('recording_url'), '_blank')}
                                className="h-6 text-[10px] font-bold uppercase text-zinc-400 hover:text-zinc-900"
                            >
                                Abrir Externo <ExternalLink className="w-2.5 h-2.5 ml-1" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* MEETING PICKER & CLIENT DATA */}
                        <div className="space-y-6">
                            {/* Meeting Picker Button */}
                            <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                <Label className="text-[10px] font-bold uppercase text-zinc-400">Selecionar Reunião do tl;dv</Label>

                                <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setHistoryOpen(true);
                                                fetchMeetingHistory();
                                            }}
                                            className="w-full h-12 bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest"
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            {watch('recording_url') ? 'Trocar Reunião' : 'Escolher Reunião'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                                        <DialogHeader>
                                            <DialogTitle>Suas Reuniões Recentes</DialogTitle>
                                            <DialogDescription>Clique em uma reunião para selecionar e preencher os dados automaticamente.</DialogDescription>
                                        </DialogHeader>
                                        <div className="overflow-y-auto max-h-[60vh] space-y-2 py-4">
                                            {loadingHistory ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                                                    <span className="ml-2 text-sm text-zinc-500">Carregando reuniões...</span>
                                                </div>
                                            ) : meetingHistory.length === 0 ? (
                                                <div className="text-center py-12 text-zinc-400 text-sm">
                                                    Nenhuma reunião encontrada. Verifique sua API Key do tl;dv.
                                                </div>
                                            ) : (
                                                meetingHistory.map((meeting: any) => (
                                                    <div
                                                        key={meeting.id || meeting.url}
                                                        onClick={async () => {
                                                            const url = meeting.url || meeting.share_url || `https://tldv.io/app/meetings/${meeting.id}`;
                                                            setValue('recording_url', url);
                                                            setHistoryOpen(false);
                                                            // Auto-fetch full details
                                                            toast({ title: 'Carregando dados...', description: meeting.name || meeting.title });
                                                            const { data } = await supabase.functions.invoke('fetch-tldv-meeting', { body: { meetingUrl: url } });
                                                            if (data?.success) {
                                                                updateFieldsWithMetadata(data.data, true);
                                                                toast({ title: 'Dados carregados!', description: `Cliente: ${data.data.clientName || 'N/A'}` });
                                                            }
                                                        }}
                                                        className="p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                                                <Video className="w-5 h-5 text-zinc-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-zinc-900 truncate group-hover:text-black">
                                                                    {meeting.name || meeting.title || 'Reunião'}
                                                                </h4>
                                                                <p className="text-xs text-zinc-400 mt-0.5">
                                                                    {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data N/A'}
                                                                    {meeting.duration && ` • ${Math.round(meeting.duration / 60)} min`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {watch('recording_url') && (
                                    <div className="p-3 bg-white rounded-lg border border-zinc-100 flex items-center justify-between">
                                        <span className="text-xs text-zinc-600 truncate flex-1">{watch('recording_url')}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setValue('recording_url', '')}
                                            className="h-6 w-6 shrink-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-zinc-400">Cliente</Label>
                                    <Input {...register('client_name')} className="bg-white h-9 text-xs font-bold" placeholder="Empresa" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-zinc-400">Email</Label>
                                    <Input {...register('client_email')} className="bg-white h-9 text-xs" placeholder="email@client..." />
                                </div>
                            </div>
                        </div>

                        {/* VIDEO PREVIEW - Thumbnail with external link */}
                        {watch('recording_url') ? (
                            <a
                                href={watch('recording_url')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl overflow-hidden relative shadow-lg shadow-zinc-900/5 border border-zinc-100 bg-zinc-900 aspect-video group flex items-center justify-center hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                                <div className="text-center">
                                    <Video className="w-12 h-12 text-white/50 mx-auto mb-3" />
                                    <span className="text-white/80 text-sm font-medium">Clique para assistir no tl;dv</span>
                                    <div className="mt-2">
                                        <ExternalLink className="w-4 h-4 text-white/40 mx-auto" />
                                    </div>
                                </div>
                            </a>
                        ) : (
                            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-300 text-xs font-medium uppercase tracking-widest aspect-video">
                                Preview do Vídeo
                            </div>
                        )}
                    </div>
                </div>
                {/* 3. GENERATE ACTION */}
                <div className="flex flex-col items-center py-4 gap-2">
                    <Button
                        type="button"
                        onClick={() => handleGenerateScope()}
                        disabled={generating || !watch('recording_url')}
                        className="h-12 px-8 bg-zinc-900 hover:bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
                    >
                        {generating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando Call...</>
                        ) : (
                            <><Wand2 className="w-4 h-4 mr-2" /> Extrair Dados com IA</>
                        )}
                    </Button>
                    <p className="text-[10px] text-zinc-400 text-center max-w-md">
                        A IA analisa a transcrição e preenche: Resumo Executivo, Escopo do Projeto, Dores do Cliente e valores sugeridos.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold">P</div>
                            <div>
                                <h3 className="text-zinc-900 font-bold text-lg leading-none">Documento da Proposta</h3>
                                <p className="text-zinc-400 text-xs mt-1 font-medium">Dados extraídos da call + seu mapa mental</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Título da Proposta</Label>
                                <Input {...register('title')} className="text-lg font-bold bg-white border-zinc-200" placeholder="Proposta REVHACKERS x Cliente" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Resumo Executivo</Label>
                                <Textarea {...register('summary')} className="min-h-[120px] text-sm bg-white" placeholder="Resumo da reunião e próximos passos..." />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Transcrição da Call</Label>
                                <Badge variant="outline" className="text-[9px] bg-zinc-50">Importado do tl;dv</Badge>
                            </div>
                            <Textarea
                                {...register('transcript')}
                                className="min-h-[200px] font-mono text-xs leading-relaxed border-zinc-200 bg-zinc-50/10 focus:bg-white transition-all p-4"
                                placeholder="Transcrição será carregada automaticamente..."
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Mapa Mental (Embed)</Label>
                                <a
                                    href="https://whimsical.com/mind-maps"
                                    target="_blank"
                                    rel="noopener"
                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Criar no Whimsical
                                </a>
                            </div>

                            <Input
                                {...register('mindmap_code')}
                                className="font-mono text-xs bg-white border-zinc-200"
                                placeholder="https://whimsical.com/embed/..."
                            />

                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                1. Crie um mapa mental no <strong>Whimsical</strong> (use a IA deles para gerar)<br />
                                2. Clique em <strong>Share → Embed</strong><br />
                                3. Cole a URL de embed aqui
                            </p>

                            {/* Preview if URL exists */}
                            {watch('mindmap_code') && watch('mindmap_code').includes('http') && (
                                <div className="w-full aspect-video bg-white rounded-xl border border-zinc-100 overflow-hidden">
                                    <iframe
                                        src={watch('mindmap_code')}
                                        className="w-full h-full border-none"
                                        sandbox="allow-scripts"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        title="Mapa Mental"
                                    />
                                </div>
                            )}
                        </div>

                        {/* ESCOPO DO PROJETO */}
                        <div className="space-y-3 pt-8 border-t border-zinc-100/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Escopo do Projeto</Label>
                                <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">Gerado pela IA</Badge>
                            </div>
                            <Textarea
                                {...register('detailed_scope')}
                                className="min-h-[200px] font-mono text-xs leading-relaxed border-zinc-200 bg-zinc-50/10 focus:bg-white transition-all p-4"
                                placeholder="O escopo será gerado automaticamente ao clicar em 'Gerar Proposta Estratégica' ou edite manualmente aqui..."
                            />
                            <p className="text-[10px] text-zinc-400">
                                Descreva as fases do projeto, entregáveis e KPIs esperados. Este campo é editável.
                            </p>
                        </div>

                        {/* FINANCIALS & CLOSING */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t border-zinc-100/50">
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Investimento Total (R$)</Label>
                                <Input {...register('investment_total')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="60000" />
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Setup Fee (R$)</Label>
                                <Input {...register('setup_fee')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="10000" />
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Valor Mensal (R$)</Label>
                                <Input {...register('installment_value')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="10000" />
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Nº de Parcelas</Label>
                                <Input {...register('installment_count')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8">
                    <Button type="submit" disabled={loading} className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-green-900/10">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Proposta
                    </Button>
                </div>
            </div>
        </form >
    );
};

export default ProposalForm;
