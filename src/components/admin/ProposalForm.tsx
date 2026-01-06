
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Wand2, ArrowLeft, RefreshCw, Save, ExternalLink, Upload, FileText, Video, X, Sparkles } from 'lucide-react';
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
    category: 'proposal' | 'kickoff' | 'onboarding' | 'qbr' | 'other';
    mindmap_code: string;
    setup_fee: string;
    installment_value: string;
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
            const slug = watchedTitle
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', slug);
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
                // Heuristic: If we found a name but no company, suggest "Empresa de [Nome]"
                if (shouldSet('client_name')) {
                    setValue('client_name', `Empresa de ${validContactName}`);
                }
            }

            if (validEmail && shouldSet('client_email')) {
                setValue('client_email', validEmail);
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
            setValue('title', `Proposta ${cName}`);
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
            const payload = {
                ...data,
                investment_total: data.investment_total ? Number(data.investment_total) : null,
                setup_fee: data.setup_fee ? Number(data.setup_fee) : null,
                installment_value: data.installment_value ? Number(data.installment_value) : null,
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
                    messages: [{
                        role: 'system',
                        content: `Você é o SENIOR GROWTH PARTNER da RevHackers. Sua missão é extrair inteligência comercial de calls para alimentar o CRM e gerar Propostas.

                        DIRETRIZES PARA O "call_summary":
                        - O RESUMO DEVE SER RICO E ESTRUTURADO em Markdown.
                        - Crie as seguintes seções (H3 ###):
                          ### Contexto do Cliente
                          (Quem são, setor, tamanho, momento atual. USE OS DADOS DE PARTICIPANTES SE DISPONÍVEL)
                          
                          ### Desafios e Dores
                          (Lista detalhada dos problemas mencionados)
                          
                          ### Decisão e Orçamento
                          (Quem decide, budget disponível, urgência. Identifique o Decisor na lista de participantes)
                          
                          ### Próximos Passos
                          (O que ficou combinado de ação concreta)

                        DIRETRIZES PARA O ESCOPO:
                        - "detailed_scope": OBRIGATÓRIO: Crie um PLANO DE AÇÃO em Markdown. Divida em FASES (Fase 1: Setup, Fase 2: Implementação, etc). Liste "Entregáveis" e "KPIs de Sucesso".
                        - "mindmap": Gere um código MERMAID válido (graph TD). Simples e visual. NÃO use caracteres especiais complexos.

                        REGRAS DE RESPOSTA (100% EM PORTUGUÊS):
                        - RETORNE APENAS JSON VÁLIDO.
                        - Se não encontrar um dado, NUNCA INVENTE. Use "Não mencionado".
                        - PREENCHA O "crm_data" COM CUIDADO.`
                    }, {
                        role: 'user',
                        content: `Analise este material (${watchedSource === 'bid' ? 'Documento/Bid' : 'Transcrição de Reunião'}) e gere a proposta estratégica em JSON.
                        
                        ${contextBlock}

                        Conteúdo:
                        ${transcript.substring(0, 25000)}

                        JSON Schema:
                        {
                            "summary": "Resumo Executivo curto (focado na estratégia)...",
                            "call_summary": "### Contexto do Cliente\nTexto...\n\n### Desafios e Dores\n- Dor 1\n- Dor 2\n...",
                            "mindmap": "mermaid code...",
                            "investment_total": 0.00,
                            "setup_fee": 0.00,
                            "installment_value": 0.00,
                            "client_name": "Nome da Empresa",
                            "client_contact_name": "Nome do Cliente",
                            "client_email": "email@cliente.com",
                            "headline": "Título da Proposta...",
                            "subheadline": "Subtítulo estratégico...",
                            "brief_explanation": "Contexto curto...",
                            "detailed_scope": "### FASE 1: ...\n- Entregáveis: ...\n- KPIs: ...",
                            "payment_terms": "Condições de pagamento...",
                            "crm_data": {
                                "pain_points": ["Dor 1", "Dor 2"],
                                "budget_range": "Range ou Valor",
                                "decision_makers": "Nomes/Cargos",
                                "urgency": "Alta/Média/Baixa",
                                "next_steps": "Ação",
                                "qualified_score": 0
                            }
                        }`
                    }],
                    model: 'gpt-4o'
                }
            });

            if (error) throw error;

            const rawResponse = data?.response || data?.choices?.[0]?.message?.content || "";
            let cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBrace = cleanJson.indexOf('{');
            const lastBrace = cleanJson.lastIndexOf('}');
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);

            const parsed = JSON.parse(cleanJson);
            if (parsed.summary) setValue('summary', parsed.summary);
            if (parsed.call_summary) setValue('call_detail_summary', parsed.call_summary);
            if (parsed.detailed_scope) setValue('detailed_scope', parsed.detailed_scope);
            if (parsed.headline) setValue('headline', parsed.headline);
            if (parsed.subheadline) setValue('subheadline', parsed.subheadline);

            if (parsed.mindmap) {
                // Remove markdown wrappers if AI put them to prevent Syntax Error
                let cleanMindmap = parsed.mindmap.replace(/```mermaid/g, '').replace(/```/g, '').trim();
                setValue('mindmap_code', cleanMindmap);
            }

            if (parsed.investment_total) setValue('investment_total', String(parsed.investment_total));
            if (parsed.setup_fee) setValue('setup_fee', String(parsed.setup_fee));
            if (parsed.installment_value) setValue('installment_value', String(parsed.installment_value));

            if (parsed.client_name && !["Não mencionado", "N/A", "Empresa"].includes(parsed.client_name)) {
                updateFieldsWithMetadata({
                    clientName: parsed.client_name,
                    clientContactName: (parsed.client_contact_name && !["Não mencionado", "N/A", "Pessoa"].includes(parsed.client_contact_name)) ? parsed.client_contact_name : "",
                    clientEmail: (parsed.client_email && !["Não mencionado", "N/A"].includes(parsed.client_email)) ? parsed.client_email : "",
                    ...parsed
                }, true);
            } else {
                if (parsed.headline) setValue('headline', parsed.headline);
                if (parsed.summary) setValue('summary', parsed.summary);
                if (parsed.detailed_scope) setValue('detailed_scope', parsed.detailed_scope);
                if (parsed.crm_data) setValue('crm_data', parsed.crm_data);
            }

            toast({ title: 'Inteligência Aplicada!' });
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
                        {/* URL INPUT & CLIENT DATA */}
                        <div className="space-y-6">
                            <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                <Label className="text-[10px] font-bold uppercase text-zinc-400">URL da Reunião (tl;dv)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        {...register('recording_url')}
                                        placeholder="Cole o link do tl;dv..."
                                        className="bg-white border-zinc-200"
                                    />
                                    <Button
                                        type="button"
                                        onClick={async () => {
                                            const url = watch('recording_url');
                                            if (!url) return;
                                            toast({ title: 'Sincronizando...', description: 'Conectando ao tl;dv...' });
                                            const { data } = await supabase.functions.invoke('fetch-tldv-meeting', { body: { meetingUrl: url } });
                                            if (data?.success) {
                                                updateFieldsWithMetadata(data.data, true);
                                                const foundEmail = data.data.clientEmail || "Não encontrado";
                                                const foundClient = data.data.clientName || "Não identificado";
                                                toast({
                                                    title: 'Sincronização Concluída',
                                                    description: `Cliente: ${foundClient} | Email: ${foundEmail}`,
                                                    variant: 'default'
                                                });
                                            } else {
                                                toast({ title: 'Erro', description: 'Dados não encontrados.', variant: 'destructive' });
                                            }
                                        }}
                                        className="bg-zinc-900 text-white font-bold text-xs hover:bg-black px-4 rounded-lg"
                                    >
                                        Sync
                                    </Button>
                                </div>
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

                        {/* VIDEO PREVIEW (Right Side of Grid) */}
                        {watch('recording_url') ? (
                            <div className="rounded-xl overflow-hidden relative shadow-lg shadow-zinc-900/5 border border-zinc-100 bg-black aspect-video group">
                                <div className="w-full h-full relative overflow-hidden">
                                    {/* 
                                        UPDATED CROP STRATEGY: 
                                        Video is on the RIGHT side of the page.
                                        We need to Shift LEFT to bring right side into view.
                                        - Scale Width: 180% (Make it wider so we can slide it)
                                        - Left: -80% (Slide left side/notes out of view)
                                        - Check Height as well.
                                     */}
                                    <iframe
                                        src={watch('recording_url')}
                                        className="absolute top-0 left-[-80%] w-[180%] h-[130%] -mt-[6%] border-none"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        title="Preview da Call"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-300 text-xs font-medium uppercase tracking-widest aspect-video">
                                Preview do Vídeo
                            </div>
                        )}
                    </div>
                </div>
                {/* 3. GENERATE ACTION */}
                <div className="flex justify-center py-4">
                    <Button
                        type="button"
                        onClick={() => handleGenerateScope()}
                        disabled={generating || !watch('recording_url')}
                        className="h-12 px-8 bg-zinc-900 hover:bg-black text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
                    >
                        {generating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando Proposta IA...</>
                        ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Gerar Proposta Estratégica</>
                        )}
                    </Button>
                </div>

                {/* 4. PROPOSAL DOCUMENT FIELDS */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold">P</div>
                            <div>
                                <h3 className="text-zinc-900 font-bold text-lg leading-none">Documento da Proposta</h3>
                                <p className="text-zinc-400 text-xs mt-1 font-medium">Edite o conteúdo antes de enviar</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Título / Headline</Label>
                                <Input {...register('headline')} className="text-lg font-bold bg-white border-zinc-200" placeholder="Título de Impacto" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Resumo Executivo</Label>
                                <Textarea {...register('summary')} className="min-h-[120px] text-sm bg-white" placeholder="Resumo..." />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Plano de Ação (Fases & Entregáveis)</Label>
                                <Badge variant="outline" className="text-[9px] bg-zinc-50">Markdown Suportado</Badge>
                            </div>
                            <Textarea
                                {...register('detailed_scope')}
                                className="min-h-[400px] font-mono text-sm leading-relaxed border-zinc-200 bg-zinc-50/10 focus:bg-white transition-all p-6"
                                placeholder="Fase 1: ..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Mapa Mental (Mermaid)</Label>
                            <Textarea {...register('mindmap_code')} className="min-h-[100px] font-mono text-xs bg-zinc-50 border-zinc-100" />
                        </div>

                        {/* FINANCIALS & CLOSING */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-zinc-100/50">
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Investimento Total</Label>
                                <Input {...register('investment_total')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="0.00" />
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Setup Fee</Label>
                                <Input {...register('setup_fee')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="0.00" />
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-zinc-400">Mensal</Label>
                                <Input {...register('installment_value')} type="number" className="font-bold text-zinc-900 bg-transparent border-none text-lg h-auto p-0" placeholder="0.00" />
                            </div>
                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-blue-400">Agenda (Embed Cal.com)</Label>
                                <Input {...register('booking_url')} className="font-medium text-blue-900 bg-transparent border-none text-xs h-auto p-0 placeholder:text-blue-300" placeholder="https://cal.com/..." />
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
