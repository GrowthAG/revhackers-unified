
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Wand2, ArrowLeft, RefreshCw, Save, ExternalLink, Upload, FileText, Video, X, ShieldAlert } from 'lucide-react';
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

    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<ProposalFormValues>({
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
                qualified_score: 5,
                funnel_plan: 'none',
                funnel_promo_active: false,
                project_duration: initialData?.crm_data?.project_duration || '3'
            }
        }
    });

    // [NEW] LocalStorage Persistence (Draft System)
    const STORAGE_KEY = 'revhackers_proposal_draft';
    const allValues = watch();

    // 1. Load Draft on Mount
    useEffect(() => {
        if (!isEditing) {
            const savedDraft = localStorage.getItem(STORAGE_KEY);
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    // Only prompt if form is mostly empty
                    const currentTitle = getValues('title');
                    if (!currentTitle || currentTitle === '') {
                        if (confirm('Encontramos um rascunho não salvo. Deseja restaurar os dados?')) {
                            // Reset form with saved data
                            Object.entries(parsed).forEach(([key, value]: [any, any]) => {
                                setValue(key, value);
                            });
                            toast({ title: 'Rascunho restaurado' });
                        } else {
                            localStorage.removeItem(STORAGE_KEY);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing draft:', e);
                }
            }
        }
    }, [isEditing, setValue, getValues]);

    // 2. Auto-save Draft (Debounced + Unmount)
    useEffect(() => {
        if (isEditing) return;

        const saveToStorage = () => {
            if (allValues.client_name || allValues.transcript || allValues.detailed_scope) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
            }
        };

        // Debounced save
        const timer = setTimeout(saveToStorage, 2000);

        // Save on unmount
        return () => {
            clearTimeout(timer);
            saveToStorage();
        };
    }, [allValues, isEditing]);

    // 3. Save on Browser/Tab Close
    useEffect(() => {
        if (isEditing) return;

        const handleBeforeUnload = () => {
            if (allValues.client_name || allValues.transcript || allValues.detailed_scope) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [allValues, isEditing]);

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

    // [NEW] Sync Title with Client Name
    const clientName = watch('client_name');
    useEffect(() => {
        if (!isEditing && clientName) {
            const currentTitle = watch('title');
            // If title is empty or matches pattern, update it
            if (!currentTitle || currentTitle.includes('Proposta REVHACKERS x')) {
                setValue('title', `Proposta REVHACKERS x ${clientName}`);
            }
        }
    }, [clientName, isEditing, setValue, watch]);

    // [NEW] HTML Conversion Helper
    const convertTextToHtml = (text: string) => {
        if (!text) return '';
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // List Items
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                if (!inList) {
                    html += '<ul class="space-y-2 mb-6 list-none">';
                    inList = true;
                }
                const content = trimmed.substring(1).trim();
                html += `<li class="flex items-start gap-3"><span class="w-1.5 h-1.5 rounded-full bg-revgreen mt-2 shrink-0"></span><span class="text-zinc-700">${content}</span></li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }

                // Headers (Uppercase)
                if (trimmed === trimmed.toUpperCase() && trimmed.length > 5 && !trimmed.includes(':')) {
                    html += `<h3 class="text-xl font-bold text-zinc-900 mt-8 mb-4 tracking-tight">${trimmed}</h3>`;
                }
                // Bold Keys (Key: Value)
                else if (trimmed.includes(':') && trimmed.split(':')[0].length < 30) {
                    const parts = trimmed.split(':');
                    html += `<p class="mb-3 text-zinc-600"><strong class="text-zinc-900">${parts[0]}:</strong> ${parts.slice(1).join(':')}</p>`;
                }
                // Paragraphs
                else {
                    html += `<p class="mb-4 text-zinc-600 leading-relaxed">${trimmed}</p>`;
                }
            }
        });

        if (inList) html += '</ul>';
        return html;
    };

    // AI Helper: Convert Text/HTML to JSON Cards
    const handleConvertToCards = async () => {
        const currentScope = getValues('detailed_scope');
        if (!currentScope) {
            toast({ title: 'Erro', description: "O campo de escopo está vazio.", variant: 'destructive' });
            return;
        }

        try {
            setLoading(true);
            toast({ title: 'Processando', description: "A IA está estruturando seu texto em Cards Visuais..." });

            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    messages: [{
                        role: 'system',
                        content: ` Você é um Consultor Estratégico de Receita (Revenue Operations).
MISSÃO: Transformar o contexto da proposta em um ROADMAP VISUAL de exatamente 8 SEMANAS.

REGRAS DE OURO:
1. O conteúdo deve ser 100% PERSONALIZADO para o cliente em questão, usando termos técnicos discutidos na call.
2. Não use placeholders ou textos genéricos.
3. Idioma: Português (Brasil).
4. Estruture em 5 fases lógicas que cubram as 8 semanas.

FORMATO JSON OBRIGATÓRIO (RETORNE APENAS O ARRAY):
[
  {
    "phase": "Fase 1: Título Criativo",
    "duration": "Semana 1",
    "description": "Explicação clara e objetiva do que será feito.",
    "deliverables": ["Entregável 1", "Entregável 2"],
    "status": "pending"
  }
]`
                    }, {
                        role: 'user',
                        content: `TEXTO PARA CONVERSÃO EM CARDS:\n\n${currentScope}\n\n---\nBaseado no texto acima, gere as 5 fases da implementação de 8 semanas no formato JSON solicitado.`
                    }],
                    model: 'gpt-4o'
                }
            });

            if (error) throw error;

            const content = data?.response || data?.choices?.[0]?.message?.content || "";
            let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            // Try to extract array if wrapped
            const firstBracket = cleanJson.indexOf('[');
            const lastBracket = cleanJson.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
            }

            // Validate
            JSON.parse(cleanJson);

            setValue('detailed_scope', cleanJson);
            toast({ title: 'Sucesso', description: "Texto convertido em Cards Visuais com sucesso!" });

        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: "Falha ao converter texto. Tente simplificar o conteúdo.", variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

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
            setValue('title', `Proposta de Implementação RevHackers X ${cName}`);
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

    // Sync Client Name to Title automatically
    const watchedClientName = watch('client_name');
    useEffect(() => {
        if (watchedClientName && (!watch('title') || watch('title').includes('Proposta'))) {
            setValue('title', `Proposta de Implementação RevHackers X ${watchedClientName}`);
        }
    }, [watchedClientName, setValue, watch]);

    const onSubmit = async (data: ProposalFormValues) => {
        setLoading(true);
        try {
            // [FIX] Ensure numeric fields are strings (DB Schema is text)
            // [FIX] Only include fields that definitely exist in DB
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

                // CAST NUMBERS TO STRING
                investment_total: data.investment_total ? String(data.investment_total) : null,
                setup_fee: data.setup_fee ? String(data.setup_fee) : null,
                installment_value: data.installment_value ? String(data.installment_value) : null,
                installment_count: data.installment_count ? Number(data.installment_count) : null, // This might need to be cast if DB is text, checking... let's keep number if defined, or string if text. Previous code sent number. If DB is text, string is safer.

                status: data.status || 'draft',
                category: data.category || 'proposal',
                mindmap_code: data.mindmap_code || null,

                // [FIX] These fields might not exist in all migrations, check validity or keep if confident.
                // Assuming "loom_url" is not in provided migration, but "crm_data" is.
                // We'll move extra fields to crm_data to be safe if they are not columns

                headline: data.headline || null,
                subheadline: data.subheadline || null,
                brief_explanation: data.brief_explanation || null,
                detailed_scope: data.detailed_scope || null,
                payment_terms: data.payment_terms || null,

                // Merge extra UI fields into crm_data to persist them without schema errors
                crm_data: {
                    ...data.crm_data,
                    loom_url: data.loom_url || null,
                    bid_document_url: data.bid_document_url || null,
                    call_detail_summary: data.call_detail_summary || null,
                    booking_url: data.booking_url || null,
                    proposal_source: data.proposal_source || 'call'
                }
            };

            let proposalId = initialData?.id;
            let slug = data.slug;

            if (isEditing && initialData?.id) {
                const { error } = await supabase.from('proposals').update(payload).eq('id', initialData.id);
                if (error) throw error;

                // Only clear draft if save successful
                localStorage.removeItem(STORAGE_KEY);
                toast({ title: 'Proposta atualizada!' });
                navigate('/admin/proposals');
            } else {
                const { data: newProposal, error } = await supabase.from('proposals').insert(payload).select().single();
                if (error) throw error;

                if (!newProposal) throw new Error("Falha ao criar proposta: Nenhum dado retornado.");

                proposalId = newProposal.id;
                slug = newProposal.slug;

                localStorage.removeItem(STORAGE_KEY);
                toast({ title: 'Proposta criada com sucesso!' });

                // AUTO-OPEN Public Page
                if (proposalId && slug) {
                    // Safe navigation
                    const targetUrl = `/p/${slug}`;
                    window.open(targetUrl, '_blank');
                    navigate(`/admin/proposals/edit/${proposalId}`);
                } else {
                    console.error("Missing ID or Slug for new proposal");
                    navigate('/admin/proposals');
                }
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            toast({
                title: 'Erro ao salvar',
                description: error.message || "Verifique os campos e tente novamente.",
                variant: 'destructive'
            });
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

        const crmData = watch('crm_data');
        const hasDiagnosis = crmData?.source === 'rei_diagnosis';
        const sourceDoc = watch('bid_document_url');

        if (!transcript && !sourceDoc && !hasDiagnosis) {
            toast({ title: 'Erro', description: 'Adicione uma fonte de dados (Transcrição, Documento ou Diagnóstico Prévio).', variant: 'destructive' });
            return;
        }

        setGenerating(true);
        try {
            // Construct Context Block
            let contextBlock = "";
            let diagnosisBlock = "";

            if (contextMetadata) {
                contextBlock = `
                CONTEXTO DA CALL (METADATA):
                - Título: ${contextMetadata.name || 'N/A'}
                - Duração: ${Math.round((contextMetadata.duration || 0) / 60)} min
                - Participantes: ${contextMetadata.participants ? contextMetadata.participants.map((p: any) => p.name).join(', ') : 'Não listado'}
                `;
            }

            if (hasDiagnosis) {
                diagnosisBlock = `
                DADOS DO DIAGNÓSTICO ESTRATÉGICO (REI):
                - ICP/Segmento: ${crmData.segmento || crmData.icpDescription || 'N/A'}
                - Principais Dores: ${crmData.desafios ? crmData.desafios.join(', ') : crmData.painDescription || 'N/A'}
                - Gatilho de Compra: ${crmData.buyingTrigger || 'N/A'}
                - Concorrentes: ${crmData.concorrentes || 'N/A'}
                - Objetivo Principal: ${crmData.objetivoPrincipal || 'N/A'}
                - Faturamento: ${crmData.faturamento || 'N/A'}
                - Time Comercial: SDRs: ${crmData.sdrCount || 0}, Closers: ${crmData.closerCount || 0}
                - Ferramentas: ${crmData.crm || 'N/A'}
                
                USE ESTES DADOS PARA PERSONALIZAR A PROPOSTA (Cite as dores específicas e como resolvemos).
                `;
            }

            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    raw_mode: true,
                    messages: [{
                        role: 'system',
                        content: `🧠 ESTRATEGISTA SÊNIOR DE REVENUE OPERATIONS E CUSTOMER SUCCESS.

Sua tarefa é analisar a transcrição/briefing/diagnóstico e criar uma PROPOSTA COMERCIAL ÚNICA E PERSONALIZADA.

⚠️ CRÍTICO: NÃO USE MODELOS PADRÃO. O Escopo deve refletir EXATAMENTE o que foi discutido/diagnosticado.

ESTRUTURA DE RESPOSTA (JSON):
1. "summary": Documento de Texto (Markdown) seguindo ESTRITAMENTE este formato visual:

   Sistema de Geração de Demanda & Atendimento Automatizado (ou Título Adequado ao Projeto)
   
   01
   Objetivo do Projeto
   [Extraia da transcrição: O que o cliente quer resolver? Ex: Garantir resposta rápida, organizar CRM...]
   
   02
   Horizonte do Projeto
   [Extraia da transcrição: Duração (ex: 90 dias), Modelo (Piloto/Rollout)...]
   
   03
   Fase 1 - [Nome da Fase Extraído]
   [O que será feito na primeira etapa?]
   
   04
   Fase 2 - [Nome da Fase Extraído]
   [O que será feito na sequência?]
   
   ... (Adicione quantas fases forem necessárias conforme a transcrição)
   
   XX
   Fora do Escopo
   [O que NÃO será feito?]
   
   XX
   Consideração Final
   [Resumo de valor]

2. "detailed_scope": Array para o Roadmap Visual. Deve ESPELHAR as fases descritas no texto acima.
   Exemplo (Não copie, gere o seu):
   [
     { "phase": "Fase 1 - [Nome]", "duration": "[Tempo]", "description": "...", "deliverables": ["..."] },
     { "phase": "Fase 2 - [Nome]", "duration": "[Tempo]", "description": "...", "deliverables": ["..."] }
   ]`
                    }, {
                        role: 'user',
                        content: `${contextBlock}

${diagnosisBlock}

FONTE DE DADOS DO CLIENTE:
${transcript ? `TRANSCRIÇÃO:\n${transcript.substring(0, 15000)}` : 'Utilize os dados do DIAGNÓSTICO acima como base principal.'}

---
Gere o JSON de proposta baseado no PROMPT MESTRE.

Gere o JSON de proposta baseado no PROMPT MESTRE.

Model de JSON de saída:
{
    "summary": "Sistema de Geração de Demanda...\\n\\n01\\nObjetivo...\\n\\n02\\nHorizonte...\\n\\n03\\nFase 1...",
    "headline": "Proposta Comercial: [Nome do Cliente]",
    "detailed_scope": [
        { "phase": "Fase 1 - [Nome]", "duration": "Semana 1", "description": "...", "deliverables": ["..."], "status": "pending" },
        { "phase": "Fase 2 - [Nome]", "duration": "Semana 2", "description": "...", "deliverables": ["..."], "status": "pending" }
    ],
    "investment_total": 0,
    "setup_fee": 0,
    "installment_value": 0,
    "client_name": "[NOME DA EMPRESA - Nunca o nome da pessoa]",
    "client_contact_name": "[NOME DA PESSOA COM QUEM FALAMOS]",
    "client_email": "[EMAIL SE MENCIONADO OU VAZIO]"
}`
                    }],
                    model: 'gpt-4o'
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
                                                                toast({ title: 'Dados do Cliente Carregados', description: `${data.data.clientName || 'Empresa'} - ${data.data.clientContactName || 'Contato'}` });
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-zinc-400">Empresa</Label>
                                    <Input {...register('client_name')} className="bg-white h-9 text-xs font-bold" placeholder="Ex: Nome da Empresa" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-zinc-400">Contato Principal</Label>
                                    <Input {...register('client_contact_name')} className="bg-white h-9 text-xs font-bold" placeholder="Nome do Decisor" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase text-zinc-400">E-mail</Label>
                                    <Input {...register('client_email')} className="bg-white h-9 text-xs" placeholder="email@empresa.com.br" />
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
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">P</div>
                            <div>
                                <h3 className="text-zinc-900 font-bold text-lg leading-none">Estrutura da Proposta</h3>
                                <p className="text-zinc-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Dados estratégicos e cronograma de implementação</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Título Público da Proposta</Label>
                                <Input {...register('title')} className="text-lg font-bold bg-white border-zinc-200" placeholder="Ex: Proposta de Implementação RevHackers X Nome do Cliente" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Resumo Estratégico (Texto)</Label>
                                <Textarea {...register('summary')} className="min-h-[120px] text-sm bg-white" placeholder="Descreva os objetivos principais e o valor do projeto..." />
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

                        <div className="space-y-3 pt-8 border-t border-zinc-100/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Cronograma Visual (JSON)</Label>
                                    <p className="text-[10px] text-zinc-400 font-medium">Estrutura de fases que aparece no Roadmap da proposta.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleConvertToCards}
                                        disabled={loading}
                                        className="h-8 px-4 text-[10px] uppercase font-bold tracking-widest bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm transition-all"
                                    >
                                        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Wand2 className="w-3 h-3 mr-2" />}
                                        Gerar Roadmap (8 Semanas)
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                {...register('detailed_scope')}
                                className="min-h-[220px] font-mono text-xs leading-relaxed border-zinc-200 bg-zinc-50/10 focus:bg-white transition-all p-4 shadow-inner"
                                placeholder="A IA preencherá este campo com a estrutura da jornada..."
                            />
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" />
                                    Importante: Este campo deve conter o JSON gerado pela IA para habilitar a visualização de cards na página do cliente.
                                </p>
                            </div>
                        </div>

                        {/* FUNNEL SUBSCRIPTION (OPTIONAL) */}
                        <div className="space-y-4 pt-8 border-t border-zinc-100/50">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Ferramenta Funnel (Opcional)</h3>
                            <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-xs font-medium text-zinc-700">Plano Selecionado</Label>
                                    <select
                                        {...register('crm_data.funnel_plan')}
                                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                                    >
                                        <option value="none">Não incluir</option>
                                        <option value="monthly_697">Mensal R$ 697</option>
                                        <option value="monthly_997">Mensal R$ 997</option>
                                        <option value="annual_6997">Anual R$ 6.997 (2 meses off)</option>
                                        <option value="annual_9997">Anual R$ 9.997 (2 meses off)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-zinc-700">Desconto (%)</Label>
                                    <Input
                                        {...register('crm_data.platform_discount_percent')}
                                        type="number"
                                        className="bg-white h-10"
                                        placeholder="0"
                                        min="0" max="100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-zinc-700">Meses de Bônus</Label>
                                    <Input
                                        {...register('crm_data.platform_bonus_months')}
                                        type="number"
                                        className="bg-white h-10"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* Promo Checkbox - Only show if plan is selected */}
                                <div className="flex items-center space-x-2 pt-8 md:col-span-1">
                                    <input
                                        type="checkbox"
                                        id="funnel_promo"
                                        {...register('crm_data.funnel_promo_active')}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label
                                        htmlFor="funnel_promo"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                    >
                                        🎁 1º Mês Grátis
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-zinc-700">Tempo de Projeto (Meses)</Label>
                                    <select
                                        {...register('crm_data.project_duration')}
                                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                                    >
                                        <option value="3">3 Meses</option>
                                        <option value="6">6 Meses</option>
                                        <option value="12">12 Meses</option>
                                    </select>
                                </div>
                            </div>
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
                    </div >
                </div >

                <div className="flex justify-end pt-8">
                    <Button type="submit" disabled={loading} className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-green-900/10">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Proposta
                    </Button>
                </div>
            </div >
        </form >
    );
};

export default ProposalForm;
