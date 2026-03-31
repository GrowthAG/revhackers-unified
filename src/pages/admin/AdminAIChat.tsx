import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Send, Plus, Bot, FileText, X, Search, Globe,
    Sparkles, Loader2, ChevronDown, Mic2, BrainCircuit, Feather, Trash2, Pencil,
    Download, FileType, Check
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/context/AIContext';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

const ModelIcon = ({ provider, className, color }: { provider: string, className?: string, color?: string }) => {
    // OpenAI Logo
    if (provider === 'OpenAI') return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color: color }}>
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729ZM13.2599 21.9628a3.9965 3.9965 0 0 1-2.2736-.7166 3.9965 3.9965 0 0 1-1.3143-3.2369v-4.6344l4.2479 2.4518v3.9113a4.113 4.113 0 0 1-.66 2.2248Zm-4.2479-11.8596L4.7641 7.6514a3.9965 3.9965 0 0 1 2.2736-.7166 3.9965 3.9965 0 0 1 1.3143 3.2369V14.806l-4.2479-2.4518V8.4432c0-.79.3248-1.5453.9058-2.1264V10.1032Zm1.5647-5.2638a3.9965 3.9965 0 0 1 2.253.7166 3.9965 3.9965 0 0 1 1.335 3.2369v1.666L9.911 13.236 7.6369 11.9231l4.2272-2.4402a4.113 4.113 0 0 1 2.7667-1.1444 4.113 4.113 0 0 1-4.0537-3.4994Zm8.6534 3.029V10.1032l-4.2479 2.4518 4.2479 2.4518v3.9113a3.9965 3.9965 0 0 1-2.2736.7166c-.5245 0-1.049-.1041-1.5205-.3039l-.4979-.2419v-1.666l4.294-2.4784 2.2736 1.3129a4.113 4.113 0 0 1-2.2756-6.142v-2.2248ZM10.7412 14.806l-4.294-2.4784-2.2736 1.3129a4.113 4.113 0 0 1 2.2285-3.6695 4.113 4.113 0 0 1 1.5835-2.4725v2.2248l4.2479 2.4518-4.2479 2.4518-4.2479-2.4518v3.9113c0 .5245.1041 1.049.3039 1.5205l.2419.4979v1.666l-4.294 2.4784 4.294-2.4784Z" />
        </svg>
    );

    // Anthropic Logo
    if (provider === 'Anthropic') return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color: color }}>
            <path d="M17.43 19.38L13.62 12.87L14.73 11H18L19.5 13.62L20.8 15.86L22.11 18.09L23.41 20.33H19.06L17.43 19.38ZM11.13 12.87L7.33 19.38L5.7 20.33H1.34L11.13 3.5L16.03 11.9L14.92 13.8L11.13 7.33L8.97 11.02L7.33 13.83L11.13 20.33H15.48L11.13 12.87Z" />
        </svg>
    );

    // Perplexity Logo (Asterisk)
    if (provider === 'Perplexity') return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color: color }}>
            <path d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z" />
        </svg>
    );

    // Google Logo
    if (provider === 'Google') return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color: color }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
        </svg>
    );

    return <Bot className={className} />;
};

const MODELS = [
    { value: 'gpt-5.2', label: 'GPT-5.2 (OpenAI Next)', description: 'OpenAI • Máxima Inteligência', color: '#10a37f', provider: 'OpenAI' },
    { value: 'gpt-4o', label: 'GPT-4o (Frontier)', description: 'OpenAI • Multimodal', color: '#10a37f', provider: 'OpenAI' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Economical)', description: 'OpenAI • Eficiente', color: '#10a37f', provider: 'OpenAI' },
    { value: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5 (Thinking)', description: 'Anthropic • Extended Thinking', color: '#d97757', provider: 'Anthropic' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', description: 'Anthropic • Ultra Rápido', color: '#d97757', provider: 'Anthropic' },
    { value: 'sonar-pro', label: 'Perplexity Sonar (Research)', description: 'Web • Busca Realtime', color: '#00a99d', provider: 'Perplexity' },
];

const DEFAULT_TONES = [
    { id: 'normal', label: 'Normal', prompt: 'Responda normalmente.', predefined: true },
    { id: 'conciso', label: 'Conciso', prompt: 'Seja extremamente conciso e direto. Evite floreios.', predefined: true },
    { id: 'explicativo', label: 'Explicativo', prompt: 'Explique detalhadamente, como se estivesse ensinando.', predefined: true },
    { id: 'formal', label: 'Formal', prompt: 'Use um tom formal e corporativo.', predefined: true },
];

interface Message {
    role: 'user' | 'assistant';
    content: string;
    fileName?: string;
    image_url?: string;
    preview?: string;
    respondingModel?: string; // New field for Anti-Fake verification
}
interface Session { id: string; agentId: string | null; title: string; messages: Message[]; lastMessageAt: Date; model?: string; }

interface Artifact {
    id: string;
    type: 'code' | 'markdown' | 'document' | 'search';
    title: string;
    content: string;
}


interface AdminAIChatProps {
    embed?: boolean;
}

const AdminAIChat = ({ embed = false }: AdminAIChatProps) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { sessions, isLoadingAI: isLoadingGlobal, refreshAI, selectedAgentId, setSelectedAgentId } = useAI();

    // State
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Config
    const [selectedModel, setSelectedModel] = useState('gpt-5.2');
    const [selectedAgentName, setSelectedAgentName] = useState<string>(''); // NEW: Agent Name State
    const [agentKnowledgeCount, setAgentKnowledgeCount] = useState<number>(0);
    const [agentKnowledgeFilenames, setAgentKnowledgeFilenames] = useState<string[]>([]);
    const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);

    // Tone State
    const [tones, setTones] = useState(() => {
        const saved = localStorage.getItem('revhackers_custom_tones');
        return saved ? JSON.parse(saved) : DEFAULT_TONES;
    });

    useEffect(() => {
        localStorage.setItem('revhackers_custom_tones', JSON.stringify(tones));
    }, [tones]);
    const [selectedTone, setSelectedTone] = useState<string>('normal');
    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

    // Tone Editor State
    const [isToneModalOpen, setIsToneModalOpen] = useState(false);
    const [toneModalStep, setToneModalStep] = useState<'initial' | 'paste' | 'describe' | 'preview'>('initial');
    const [newToneName, setNewToneName] = useState('');
    const [newToneTranscript, setNewToneTranscript] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [editingToneId, setEditingToneId] = useState<string | null>(null);

    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Artifacts / Side Panel State
    const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
    const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);

    // Knowledge Modal State
    const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

    // Research / Search State
    const [isResearching, setIsResearching] = useState(false);
    const [searchSteps, setSearchSteps] = useState<string[]>([]);
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    const endRef = useRef<HTMLDivElement>(null);

    // Sync URL Parameters
    useEffect(() => {
        const agentIdFromUrl = searchParams.get('agent') || 'default';
        const sessionIdFromUrl = searchParams.get('session');

        if (agentIdFromUrl !== selectedAgentId) {
            setSelectedAgentId(agentIdFromUrl);
        }

        if (sessionIdFromUrl) {
            const session = sessions.find(s => s.id === sessionIdFromUrl);
            if (session && session.id !== currentSession?.id) {
                handleSelectSession(session);
            }
        } else if (!sessionIdFromUrl && currentSession) {
            handleNewChat();
        }
    }, [searchParams, sessions]);

    // Update selectedModel when currentSession changes
    useEffect(() => {
        if (currentSession) {
            // Restore model used in this session
            if (currentSession.model) {
                setSelectedModel(currentSession.model);
            }
        }
    }, [currentSession]);

    // Fetch agent config (model) and knowledge count when agent changes
    useEffect(() => {
        if (!selectedAgentId || selectedAgentId === 'default') {
            setAgentKnowledgeCount(0);
            setAgentKnowledgeFilenames([]);
            setSelectedAgentName('');
            // Optionally reset model to default if no agent selected
            // setSelectedModel('gpt-4o'); 
            return;
        }

        const fetchAgentData = async () => {
            setIsLoadingKnowledge(true);
            try {
                // 1. Fetch Agent Config (Model + Name)
                const { data: agentData, error: agentError } = await supabase
                    .from('agents')
                    .select('model, name') // Fetch NAME too
                    .eq('id', selectedAgentId)
                    .single();

                if (agentData) {
                    if (agentData.model) setSelectedModel(agentData.model);
                    if (agentData.name) setSelectedAgentName(agentData.name);
                }

                // 2. Fetch Knowledge
                const { data } = await supabase.functions.invoke('agent-documents', {
                    body: { action: 'ping', agentId: selectedAgentId }
                });
                if (data?.success) {
                    setAgentKnowledgeCount(data.documentCount || 0);
                    setAgentKnowledgeFilenames(data.filenames || []);
                }
            } catch (err) {
                console.error('[RAG SYNC] Error:', err);
            } finally {
                setIsLoadingKnowledge(false);
            }
        };
        fetchAgentData();
    }, [selectedAgentId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleNewChat = () => {
        setCurrentSession(null);
        setMessages([]);
        setInput('');
    };

    const handleSelectSession = async (session: Session) => {
        setCurrentSession(session);
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('role, content, created_at')
                .eq('session_id', session.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages((data || []).map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            })));
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        }
    };

    // Handle initial query from Hub
    useEffect(() => {
        const query = searchParams.get('q');
        if (query && messages.length === 0 && !loading && !isLoadingGlobal) {
            handleSendMessage(query);
            // Prune the query after sending to avoid re-triggering
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('q');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, messages.length, loading, isLoadingGlobal]);

    const extractTextFromFile = async (file: File): Promise<string> => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        // 1. PDF Handling
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            try {
                if (!(window as any).pdfjsLib) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                const pdfjsLib = (window as any).pdfjsLib;
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map((item: any) => (item as any).str);
                    fullText += strings.join(' ') + '\n';
                }
                return fullText;
            } catch (err) {
                console.error('PDF error:', err);
            }
        }

        // 2. DOCX Handling (Mammoth)
        if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
            try {
                if (!(window as any).mammoth) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                const mammoth = (window as any).mammoth;
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                return result.value;
            } catch (err) {
                console.error('DOCX error:', err);
            }
        }

        // 3. Fallback: Text/JSON/CSV/MD
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const handleSendMessage = async (overrideText?: string) => {
        const messageText = overrideText || input;
        if (!messageText.trim() && !attachedFile) return;
        if (loading || isLoadingGlobal) return;

        // Force clear any lingering toasts to maintain OpenAI-style silence
        toast.dismiss();

        let finalContent = messageText.trim();
        const userMsg: Message = { role: 'user', content: finalContent };

        try {
            if (attachedFile) {
                try {
                    if (attachedFile.type.startsWith('image/')) {
                        const reader = new FileReader();
                        const base64Promise = new Promise<string>((resolve, reject) => {
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = () => reject(new Error('Erro ao ler imagem'));
                            reader.readAsDataURL(attachedFile);
                        });
                        const base64 = await base64Promise;
                        userMsg.image_url = base64;
                        finalContent = `[IMAGEM ANEXADA: ${attachedFile.name}]\n\n${finalContent || 'Analise a imagem acima.'}`;
                    } else {
                        const fileText = await extractTextFromFile(attachedFile);
                        finalContent = `[DOCUMENTO ANEXADO NA CONVERSA: ${attachedFile.name}]\n\n${fileText}\n\n-------------------\n\nPERGUNTA DO USUÁRIO: ${finalContent || 'Analise o documento acima.'}`;
                    }
                } catch (err) {
                    console.error('File extraction error:', err);
                    toast.error('Erro ao processar arquivo anexado.');
                    setLoading(false);
                    return;
                }
            }
            userMsg.content = finalContent;
        } catch (err) {
            console.error('File extraction error:', err);
            // This catch block is for the outer try, if file processing was successful,
            // but something else failed before the message was sent.
            // The file processing specific error handling is now in the inner try-catch.
        }

        const displayUserMsg: Message = {
            role: 'user',
            content: messageText.trim(),
            fileName: attachedFile?.name,
            preview: attachedPreview, // Keep preview for UI
            image_url: userMsg.image_url // CRITICAL: Keep image_url for next turns!
        };

        setMessages(prev => [...prev, displayUserMsg]);
        if (!overrideText) setInput('');
        setAttachedFile(null);
        setAttachedPreview(null);
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            let sessionId = currentSession?.id;

            if (!sessionId && user) {
                const { data: newSession, error: sessionError } = await supabase
                    .from('chat_sessions')
                    .insert({
                        user_id: user.id,
                        agent_id: selectedAgentId === 'default' ? null : selectedAgentId,
                        title: userMsg.content.slice(0, 50) + (userMsg.content.length > 50 ? '...' : ''),
                        // model: selectedModel // DISABLED TEMPORARILY: Waiting for migration (20260102193000)
                    })
                    .select()
                    .single();

                if (sessionError) throw sessionError;
                sessionId = newSession.id;
                setCurrentSession({
                    id: newSession.id,
                    agentId: selectedAgentId,
                    title: newSession.title,
                    messages: [],
                    lastMessageAt: new Date()
                });
                refreshAI();
                navigate(`/admin/ai-chat?agent=${selectedAgentId || 'default'}&session=${sessionId}`, { replace: true });
            }

            if (sessionId) {
                await supabase.from('chat_messages').insert({
                    session_id: sessionId,
                    role: 'user',
                    content: userMsg.content
                });
            }

            // --- PERPLEXITY ANIMATION TRIGGER ---
            if (selectedModel === 'sonar-pro') {
                setIsResearching(true);
                // Simulate steps
                setSearchSteps(['Analisando fontes...']);
                setTimeout(() => setSearchSteps(prev => [...prev, 'Cruzando dados em tempo real...']), 1500);
            }

            // --- SECURITY UPDATE: Send only ID, backend handles the rest ---
            const { data: chatData, error: chatError } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agentId: selectedAgentId || 'default', // Pass ID
                    messages: [...messages, userMsg],
                    sessionId: sessionId,
                    model: selectedModel, // PASS OVERRIDE
                    tone: tones.find(t => t.id === selectedTone)?.prompt || '' // PASS TONE
                }
            });

            if (chatError) throw chatError;

            // --- FIX: HANDLE ERRORS EXPLICITLY ---
            if (!chatData?.success) {
                console.error('[CHAT ERROR]', chatData?.error);
                throw new Error(chatData?.error || "Erro desconhecido do servidor.");
            }

            const botMsg: Message = {
                role: 'assistant',
                content: chatData.response,
                respondingModel: chatData.respondingModel // Store the REAL engine that answered
            };
            setMessages(prev => [...prev, botMsg]);

            // Artifact Detection Logic
            const artifactRegex = /\[ARTIFACT:(code|markdown|document|search):([^\]]+)\]([\s\S]*?)\[\/ARTIFACT\]/i;
            const responseToMatch = chatData.response || "";
            const match = responseToMatch.match(artifactRegex);
            if (match) {
                const [_, type, title, content] = match;
                const newArtifact: Artifact = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: type as any,
                    title: title.trim(),
                    content: content.trim()
                };
                setActiveArtifact(newArtifact);
                setIsArtifactPanelOpen(true);
            }

            if (sessionId) {
                await supabase.from('chat_messages').insert({
                    session_id: sessionId,
                    role: 'assistant',
                    content: botMsg.content
                });
            }
            refreshAI();

        } catch (error: any) {
            console.error('Error in chat workflow:', error);

            let errorMessage = "Desculpe, ocorreu um erro na comunicação.";

            // Supabase Edge Function detailed error extraction
            try {
                if (error.context && typeof error.context.json === 'function') {
                    const body = await error.context.json();
                    if (body.error) errorMessage = body.error;
                } else if (error.message && error.message.includes('non-2xx')) {
                    errorMessage = "O servidor da IA (Edge Function) retornou um erro inesperado. Verifique se as chaves API estão corretas e se a função foi deployada.";
                } else if (error.message) {
                    errorMessage = error.message;
                }
            } catch (e) {
                console.error("Failed to extract error details:", e);
                errorMessage = error.message || "Erro na Edge Function.";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Erro Detalhado:** ${errorMessage}` }]);
            toast.error("Falha na Conexão", {
                description: errorMessage
            });
        }
        finally {
            setLoading(false);
            setIsResearching(false);
        }
    };

    const handleAnalyzeTone = async () => {
        if (!newToneTranscript.trim()) return;
        setIsAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    raw_mode: true, // Use raw mode for character analysis
                    model: 'gpt-4o-mini',
                    messages: [{
                        role: 'user',
                        content: `Aja como um linguista especialista. Analise o texto abaixo e extraia as principais diretrizes de TOM DE VOZ, PERSONALIDADE e ESTILO DE ESCRITA. Transforme isso em uma instrução de sistema curta (máximo 300 caracteres) que comece com "Aja como...".\n\nTEXTO:\n"${newToneTranscript}"`
                    }]
                }
            });
            if (data?.success) {
                setGeneratedPrompt(data.response);
                setToneModalStep('preview');
            } else {
                toast.error(data?.error || "Erro ao analisar tom.");
            }
        } catch (error: any) { toast.error(error.message || "Erro ao analisar tom."); }
        finally { setIsAnalyzing(false); }
    };

    const handleSaveTone = () => {
        if (!newToneName || !generatedPrompt) return;

        if (editingToneId) {
            setTones(tones.map(t => t.id === editingToneId ? { ...t, label: newToneName, prompt: generatedPrompt } : t));
            setEditingToneId(null);
            toast.success("Estilo atualizado!");
        } else {
            const newTone = { id: `custom-${Date.now()}`, label: newToneName, prompt: generatedPrompt, predefined: false };
            setTones([...tones, newTone]);
            setSelectedTone(newTone.id);
            toast.success("Estilo criado!");
        }

        setIsToneModalOpen(false);
        resetToneModal();
        setIsStyleMenuOpen(false);
    };

    const handleDeleteTone = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTones(tones.filter(t => t.id !== id));
        if (selectedTone === id) setSelectedTone('normal');
        toast.success("Estilo removido!");
    };

    const handleEditTone = (tone: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingToneId(tone.id);
        setNewToneName(tone.label);
        setGeneratedPrompt(tone.prompt);
        setToneModalStep('describe');
        setIsToneModalOpen(true);
        setIsStyleMenuOpen(false);
    };

    const resetToneModal = () => {
        setToneModalStep('initial');
        setNewToneName('');
        setNewToneTranscript('');
        setGeneratedPrompt('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10MB.'); return; }
        setAttachedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setAttachedPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else setAttachedPreview(null);
    };

    const handleExportMarkdown = () => {
        if (!activeArtifact) return;
        const blob = new Blob([activeArtifact.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeArtifact.title.replace(/\s+/g, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Documento .md exportado!');
    };

    const handleExportPDF = () => {
        if (!activeArtifact) return;
        // Simple Print-based PDF for MVP (Ultraminimalist approach)
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>${activeArtifact.title}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; line-height: 1.6; }
                        h1 { font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        pre { background: #f4f4f5; padding: 20px; border-radius: 8px; font-family: monospace; }
                        .footer { margin-top: 50px; font-size: 10px; color: #a1a1aa; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${activeArtifact.title}</h1>
                    <div style="margin-top: 30px">${activeArtifact.content.replace(/\n/g, '<br/>')}</div>
                    <div class="footer">Gerado estrategicamente por RevHackers AI Hub • 2026</div>
                    <script>window.onload = () => { window.print(); window.close(); }</script>
                </body>
            </html>
        `);
        printWindow.document.close();
        toast.success('Preparando PDF para impressão...');
    };

    const ChatContent = (
        <div className={cn(
            "flex overflow-hidden bg-white",
            embed ? "h-full" : "h-[calc(100vh-64px)]"
        )}>
            {/* Chat Section */}
            <div className={cn(
                "flex flex-col flex-1 min-w-0 transition-all duration-500",
                isArtifactPanelOpen ? "lg:flex-[0.5] border-r border-zinc-100" : "flex-1"
            )}>
                <div className="h-24 border-b border-zinc-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
                    {!embed && (
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-black flex items-center justify-center text-white shadow-sm">
                                <Feather className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-black tracking-tight uppercase leading-none mb-1.5 flex items-center gap-3">
                                    {selectedAgentName || 'RevhackersAI'}
                                    <span className="flex w-1.5 h-1.5 bg-[#00CC6A]" />
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-2 py-0.5 ">
                                        <div className="w-2.5 h-2.5 flex items-center justify-center">
                                            <ModelIcon provider={MODELS.find(m => m.value === selectedModel)?.provider || ''} className="w-2.5 h-2.5" />
                                        </div>
                                        <span className="text-2xs font-black text-zinc-500 uppercase tracking-widest leading-none">
                                            {MODELS.find(m => m.value === selectedModel)?.label} • {MODELS.find(m => m.value === selectedModel)?.provider} ENGINE
                                        </span>
                                    </div>

                                    {agentKnowledgeCount > 0 ? (
                                        <button
                                            onClick={() => setIsKnowledgeModalOpen(true)}
                                            className="group flex items-center gap-1.5 bg-[#00CC6A]/10 text-[#00CC6A] px-2 py-0.5 border border-[#00CC6A]/20 font-bold hover:bg-[#00CC6A]/20 transition-all text-2xs uppercase tracking-widest"
                                        >
                                            <BrainCircuit className="w-2.5 h-2.5" />
                                            {agentKnowledgeCount} DATASET
                                        </button>
                                    ) : (
                                        <span className="text-2xs font-bold text-zinc-300 uppercase tracking-widest">
                                            Zero Data Injection
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Model Selector */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                className="h-9 px-3 gap-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-all"
                            >
                                <ModelIcon provider={MODELS.find(m => m.value === selectedModel)?.provider || ''} className="w-4 h-4" />
                                <span className="text-xs font-bold text-zinc-700">{MODELS.find(m => m.value === selectedModel)?.label}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform", isModelMenuOpen && "rotate-180")} />
                            </Button>

                            {isModelMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsModelMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-72 bg-white shadow-sm border border-zinc-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-3 py-2 border-b border-zinc-50 mb-1">
                                            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Modelos Disponíveis</span>
                                        </div>
                                        {MODELS.map((model) => (
                                            <button
                                                key={model.value}
                                                onClick={() => {
                                                    setSelectedModel(model.value);
                                                    setIsModelMenuOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-start gap-3 p-3 transition-all mb-1",
                                                    selectedModel === model.value ? "bg-zinc-50" : "hover:bg-zinc-50/50"
                                                )}
                                            >
                                                <div className="mt-0.5 p-1.5 bg-white border border-zinc-100 shadow-sm">
                                                    <ModelIcon provider={model.provider} className="w-4 h-4" color={model.color} />
                                                </div>
                                                <div className="flex flex-col items-start min-w-0">
                                                    <span className="text-xs font-bold text-zinc-900 leading-none mb-1">{model.label}</span>
                                                    <span className="text-xxs font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis w-full text-left">{model.description}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <Button onClick={handleNewChat} variant="ghost" size="icon" className="h-9 w-9 hover:bg-zinc-100 text-zinc-500">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth space-y-12 bg-white">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-1000">
                            <h2 className="text-4xl font-black text-black mb-2 tracking-ultratight uppercase">Como podemos agir hoje?</h2>
                            <p className="text-xxs font-black text-zinc-400 uppercase tracking-[0.3em]">Selecione um agente ou inicie uma nova inteligência</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex w-full gap-4 max-w-3xl mx-auto",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex flex-col gap-1 text-body leading-relaxed max-w-[85%]",
                                    msg.role === 'user' ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "relative px-0 py-2",
                                        msg.role === 'user'
                                            ? "bg-transparent text-black font-bold text-right"
                                            : "bg-transparent text-black"
                                    )}>
                                        {msg.fileName && (
                                            <div className="flex items-center gap-2 mb-2 p-1.5 bg-black/5 border border-black/5 w-fit">
                                                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                                <span className="text-tiny font-bold text-zinc-700 truncate max-w-[200px]">{msg.fileName}</span>
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">
                                            {(msg.content || '').replace(/\[ARTIFACT:[\s\S]*?\[\/ARTIFACT\]/ig, (match) => {
                                                const titleMatch = match.match(/\[ARTIFACT:(?:[^:]+):([^\]]+)\]/i);
                                                const title = titleMatch ? titleMatch[1] : 'Documento';
                                                return `\n\n> [!TIP]\n> **${title}** gerado. Veja no painel lateral.\n\n`;
                                            })}
                                        </div>

                                        {/* Anti-Fake Verification Badge */}
                                        {msg.role === 'assistant' && msg.respondingModel && (
                                            <div className="mt-3 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="p-1 bg-zinc-50 border border-zinc-100 ">
                                                    <ModelIcon
                                                        provider={MODELS.find(m => m.value === msg.respondingModel || m.value.includes(msg.respondingModel!))?.provider || 'Bot'}
                                                        className="w-2.5 h-2.5"
                                                    />
                                                </div>
                                                <span className="text-2xs font-black text-zinc-400 uppercase tracking-widest leading-none">
                                                    Verified Engine: {msg.respondingModel}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={endRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/80 backdrop-blur-md">
                    <div className="max-w-3xl mx-auto mb-4">
                        {attachedFile && (
                            <div className="flex items-center gap-3 p-2 bg-zinc-50 border border-zinc-200 w-fit animate-in fade-in slide-in-from-bottom-2">
                                {attachedPreview ? (
                                    <img src={attachedPreview} className="w-10 h-10 object-cover" />
                                ) : (
                                    <div className="w-10 h-10 bg-zinc-200 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-zinc-500" />
                                    </div>
                                )}
                                <div className="flex flex-col pr-4">
                                    <span className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">{attachedFile.name}</span>
                                    <span className="text-xxs text-zinc-400 font-medium uppercase tracking-widest">Pendente</span>
                                </div>
                                <button
                                    onClick={() => { setAttachedFile(null); setAttachedPreview(null); }}
                                    className="p-1 hover:bg-zinc-200 transition-colors"
                                >
                                    <X className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="max-w-3xl mx-auto relative flex items-end gap-2 p-2 bg-white border border-black transition-all">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setAttachedFile(file);
                                    if (file.type.startsWith('image/')) {
                                        const url = URL.createObjectURL(file);
                                        setAttachedPreview(url);
                                    } else {
                                        setAttachedPreview(null);
                                    }
                                }
                            }}
                        />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-black hover:bg-zinc-50" onClick={() => fileInputRef.current?.click()}>
                            <Plus className="w-4 h-4" />
                        </Button>

                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                                className={cn(
                                    "h-10 w-10 transition-all ",
                                    selectedTone !== 'normal' ? "text-[#00CC6A] bg-[#00CC6A]/10 shadow-sm" : "text-zinc-400 hover:text-black hover:bg-zinc-50"
                                )}
                            >
                                <Feather className="w-4 h-4" />
                            </Button>

                            {isStyleMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsStyleMenuOpen(false)} />
                                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white shadow-sm border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="px-3 py-2 border-b border-zinc-50 mb-1 flex justify-between items-center">
                                            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Estilos de Resposta</span>
                                            <button
                                                onClick={() => {
                                                    setIsToneModalOpen(true);
                                                    setToneModalStep('initial');
                                                    setIsStyleMenuOpen(false);
                                                }}
                                                className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {tones.map((tone) => (
                                                <div
                                                    key={tone.id}
                                                    onClick={() => {
                                                        setSelectedTone(tone.id);
                                                        setIsStyleMenuOpen(false);
                                                        toast.success(`Estilo: ${tone.label}`);
                                                    }}
                                                    className={cn(
                                                        "group w-full flex items-center justify-between p-2.5 transition-all mb-0.5 cursor-pointer",
                                                        selectedTone === tone.id ? "bg-black text-white font-bold" : "hover:bg-zinc-50 text-zinc-600"
                                                    )}
                                                >
                                                    <span className="text-xs truncate">{tone.label}</span>
                                                    <div className="flex items-center gap-1">
                                                        {!tone.predefined && (
                                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => handleEditTone(tone, e)}
                                                                    className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-black"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteTone(tone.id, e)}
                                                                    className="p-1 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {selectedTone === tone.id && <div className="w-1.5 h-1.5 bg-[#00CC6A] ml-1" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Comando ou Pergunta..."
                            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-0 shadow-none resize-none max-h-32 min-h-[40px] py-2 text-body placeholder:text-zinc-400 font-medium"
                            rows={1}
                        />

                        <Button
                            onClick={() => handleSendMessage()}
                            disabled={(!input.trim() && !attachedFile) || loading}
                            className={cn(
                                "h-11 px-8 uppercase text-xxs font-black tracking-widest transition-all ",
                                (input.trim() || attachedFile)
                                    ? "bg-black text-white hover:bg-zinc-800 shadow-sm"
                                    : "bg-white text-zinc-400 cursor-not-allowed border border-black"
                            )}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : "Enviar"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Artifact Side Panel */}
            {isArtifactPanelOpen && activeArtifact && (
                <div className="hidden lg:flex flex-col w-[50%] bg-zinc-50 border-l border-zinc-100 animate-in slide-in-from-right duration-500 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-black/5">
                                <FileText className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 truncate max-w-[300px]">
                                {activeArtifact.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 text-tiny font-black border-zinc-200 hover:bg-black hover:text-white transition-all uppercase tracking-widest"
                                onClick={() => {
                                    navigator.clipboard.writeText(activeArtifact.content);
                                    toast.success('Conteúdo copiado!');
                                }}
                            >
                                <Check className="w-3.5 h-3.5" />
                                Copiar
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 text-tiny font-black border-zinc-200 hover:border-black transition-all uppercase tracking-widest"
                                onClick={handleExportMarkdown}
                            >
                                <Download className="w-3.5 h-3.5" />
                                .MD
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 text-tiny font-black border-zinc-200 hover:border-black transition-all uppercase tracking-widest"
                                onClick={handleExportPDF}
                            >
                                <FileType className="w-3.5 h-3.5" />
                                PDF
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8  hover:bg-zinc-100"
                                onClick={() => setIsArtifactPanelOpen(false)}
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto">
                            {activeArtifact.type === 'code' ? (
                                <div className="bg-[#1e1e1e] p-6 shadow-sm relative group">
                                    <div className="absolute top-4 right-4 text-xxs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded">
                                        Code
                                    </div>
                                    <pre className="text-zinc-100 text-mini font-mono leading-relaxed overflow-x-auto">
                                        {activeArtifact.content}
                                    </pre>
                                </div>
                            ) : (
                                <div className="bg-white p-8 shadow-sm border border-zinc-200 text-zinc-800 leading-relaxed text-body whitespace-pre-wrap prose prose-zinc max-w-none">
                                    {activeArtifact.content}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Knowledge Discovery Modal */}
            {isKnowledgeModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl shadow-sm border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#00CC6A]/10 ">
                                    <BrainCircuit className="w-5 h-5 text-[#00CC6A]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900">Base de Conhecimento</h3>
                                    <p className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Documentos indexados para este agente</p>
                                </div>
                            </div>
                            <button onClick={() => setIsKnowledgeModalOpen(false)} className="p-2 hover:bg-zinc-100 transition-colors">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {isLoadingKnowledge ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="w-8 h-8 text-zinc-200 animate-spin" />
                                    <p className="text-sm text-zinc-400 font-medium italic">Sincronizando com o Cérebro...</p>
                                </div>
                            ) : agentKnowledgeFilenames.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {agentKnowledgeFilenames.map((name, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-100 hover:border-[#00CC6A]/20 transition-all group">
                                            <div className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-[#00CC6A] transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-mini font-bold text-zinc-700 truncate">{name}</p>
                                                <p className="text-xxs text-zinc-400 uppercase tracking-widest mt-0.5">Disponível em Tempo Real</p>
                                            </div>
                                            <div className="flex items-center gap-2 pr-2">
                                                <div className="px-2 py-1 bg-[#00CC6A]/10 text-2xs font-black text-[#00CC6A] uppercase border border-[#00CC6A]/20">Indexado</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Bot className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                                    <h4 className="text-sm font-bold text-zinc-400 italic">Este agente ainda não possui documentos configurados.</h4>
                                    <p className="text-tiny text-zinc-400 max-w-xs mx-auto mt-2">
                                        Adicione arquivos na base de conhecimento ou vincule este agente a uma livraria para habilitar o RAG.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/admin/knowledge')}
                                className="text-tiny font-black uppercase tracking-widest border-zinc-200 bg-white hover:bg-black hover:text-white transition-all h-10 px-6 "
                            >
                                Gerenciar Conhecimento
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Frame Experience (Perplexity) */}
            {isResearching && (
                <div className="hidden lg:flex flex-col w-[35%] bg-zinc-50 border-l border-zinc-100 animate-in slide-in-from-right duration-500 overflow-hidden shadow-sm">
                    <div className="p-6 bg-white border-b border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#00CC6A]/10 relative">
                                <Search className="w-5 h-5 text-[#00CC6A] animate-pulse" />
                                <div className="absolute inset-0 border border-[#00CC6A]/30 animate-ping opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Search Intelligence</h3>
                                <p className="text-xxs font-bold text-[#00CC6A]/60 uppercase tracking-widest">Real-time Web Analysis</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 "
                            onClick={() => setIsResearching(false)}
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* Search Query */}
                        <div className="p-4 bg-white border border-zinc-200 shadow-sm transition-all">
                            <span className="text-2xs font-black text-zinc-400 uppercase tracking-widest block mb-2">Analyzing Query</span>
                            <p className="text-sm font-bold text-zinc-800 italic">"{input || 'Explorando novas fronteiras...'}"</p>
                        </div>

                        {/* Search Steps / Preview */}
                        <div className="space-y-4">
                            <span className="text-2xs font-black text-zinc-400 uppercase tracking-widest block">Research Roadmap</span>

                            <div className="space-y-3">
                                {[
                                    { label: 'Initializing Deep Scan', status: 'complete', time: '0.2s' },
                                    { label: 'Verifying Global Sources', status: 'processing', time: '0.8s' },
                                    { label: 'Synthesizing Intelligence', status: 'pending', time: '--' }
                                ].map((step, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center justify-between p-3 border transition-all",
                                        step.status === 'complete' ? "bg-[#00CC6A]/10 border-[#00CC6A]/20" :
                                            step.status === 'processing' ? "bg-white border-zinc-200 shadow-sm animate-pulse" :
                                                "bg-zinc-50 border-zinc-100 opacity-50"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {step.status === 'complete' ? <div className="w-1.5 h-1.5 bg-[#00CC6A]" /> : <div className="w-1.5 h-1.5 bg-zinc-300" />}
                                            <span className="text-tiny font-bold text-zinc-700">{step.label}</span>
                                        </div>
                                        <span className="text-2xs font-mono text-zinc-400">{step.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Preview Placeholder */}
                        <div className="p-4 bg-zinc-900 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[#00CC6A]/10 opacity-50 transition-opacity group-hover:opacity-100" />
                            <div className="relative z-10 flex items-center gap-3 mb-4">
                                <Globe className="w-4 h-4 text-[#00CC6A]" />
                                <span className="text-xxs font-black text-[#00CC6A] uppercase tracking-widest">Live Preview</span>
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="h-2 w-full bg-white/10 animate-pulse" />
                                <div className="h-2 w-[80%] bg-white/5 animate-pulse" />
                                <div className="h-2 w-[90%] bg-white/5 animate-pulse" />
                            </div>
                        </div>

                        <p className="text-xxs text-zinc-400 text-center font-medium italic mt-auto pt-8">
                            *This frame represents a live preview of the research and data synthesis process.
                        </p>
                    </div>
                </div>
            )}

            {/* Tone creation Modal */}
            {isToneModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg shadow-sm border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                            <h3 className="text-tiny font-black text-black uppercase tracking-[0.2em]">Calibration Hub</h3>
                            <button onClick={() => setIsToneModalOpen(false)} className="p-2 hover:bg-zinc-100 ">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-8">
                            {toneModalStep === 'initial' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-zinc-500 mb-6">Selecione o método de calibração do seu tom de voz.</p>
                                    <button
                                        onClick={() => setToneModalStep('paste')}
                                        className="w-full flex items-center justify-between p-5 border border-zinc-100 hover:border-black hover:bg-zinc-50 transition-all text-left group"
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-mini font-black text-black uppercase tracking-widest leading-none mb-1">Engenharia de Estilo</h4>
                                            <p className="text-xxs text-zinc-400 font-bold uppercase tracking-wider">Analise sua escrita original</p>
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-zinc-200 group-hover:bg-black transition-colors" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setToneModalStep('describe');
                                            setGeneratedPrompt('');
                                        }}
                                        className="w-full flex items-center justify-between p-5 border border-zinc-100 hover:border-black hover:bg-zinc-50 transition-all text-left group"
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-mini font-black text-black uppercase tracking-widest leading-none mb-1">Configuração Manual</h4>
                                            <p className="text-xxs text-zinc-400 font-bold uppercase tracking-wider">Defina diretrizes de comportamento</p>
                                        </div>
                                        <div className="w-1.5 h-1.5 bg-zinc-200 group-hover:bg-black transition-colors" />
                                    </button>
                                </div>
                            )}

                            {toneModalStep === 'paste' && (
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Exemplo de Texto</label>
                                    <textarea
                                        className="w-full h-40 p-4 bg-zinc-50 border-none outline-none focus:ring-1 focus:ring-black text-sm"
                                        placeholder="Cole aqui um e-mail, artigo ou mensagem que represente o tom desejado..."
                                        value={newToneTranscript}
                                        onChange={(e) => setNewToneTranscript(e.target.value)}
                                    />
                                    <Button
                                        className="w-full h-12 bg-black text-white font-bold mt-4 hover:bg-zinc-800 transition-all font-black uppercase tracking-widest text-tiny"
                                        disabled={!newToneTranscript || isAnalyzing}
                                        onClick={handleAnalyzeTone}
                                    >
                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : 'Analisar Estilo'}
                                    </Button>
                                </div>
                            )}

                            {toneModalStep === 'describe' && (
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nome do Estilo</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black text-sm"
                                        placeholder="Ex: Consultivo, Amigável, etc."
                                        value={newToneName}
                                        onChange={(e) => setNewToneName(e.target.value)}
                                    />
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mt-4">Diretrizes</label>
                                    <textarea
                                        className="w-full h-32 p-4 bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black text-sm"
                                        placeholder="Descreva como a IA deve se comportar..."
                                        value={generatedPrompt}
                                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                                    />
                                    <Button
                                        className="w-full h-12 bg-black text-white font-bold mt-4"
                                        disabled={!newToneName || !generatedPrompt}
                                        onClick={handleSaveTone}
                                    >
                                        SALVAR ESTILO
                                    </Button>
                                </div>
                            )}

                            {toneModalStep === 'preview' && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-[#00CC6A]/10 flex items-center justify-center text-[#00CC6A] mx-auto mb-4">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-bold text-zinc-900">Estilo Analisado!</h4>
                                    <p className="text-sm text-zinc-500">Capturamos a essência do seu tom. Dê um nome a ele para salvar:</p>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-[#00CC6A] text-sm mt-4"
                                        placeholder="Ex: Meu Tom Profissional"
                                        value={newToneName}
                                        onChange={(e) => setNewToneName(e.target.value)}
                                    />
                                    <div className="p-4 bg-zinc-50 text-tiny text-zinc-400 text-left mt-4 border border-zinc-100 max-h-32 overflow-y-auto italic">
                                        {generatedPrompt}
                                    </div>
                                    <Button
                                        className="w-full h-12 bg-black text-white font-black uppercase tracking-widest text-tiny mt-6"
                                        disabled={!newToneName}
                                        onClick={handleSaveTone}
                                    >
                                        Salvar e Aplicar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (embed) {
        return ChatContent;
    }

    return (
        <AdminLayout>
            {ChatContent}
        </AdminLayout>
    );
};

export default AdminAIChat;
