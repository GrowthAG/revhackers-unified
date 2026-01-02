import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Send, Plus, MessageSquare, Trash2, Loader2, Bot,
    FileText, Save, Eye, EyeOff, Search, Edit2, Check,
    Feather, ChevronRight, X, Sparkles, Mic, Upload, ArrowLeft, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAI } from '@/context/AIContext';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export const MODELS = [
    { value: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI • Inteligência Máxima', color: '#10a37f' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'OpenAI • Resposta Rápida', color: '#10a37f' },
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Anthropic • Raciocínio Avançado', color: '#d97757' },
    { value: 'gemini-2-0-flash', label: 'Gemini 2.0 Flash', description: 'Google • Velocidade Extrema', color: '#4285f4' },
    { value: 'gemini-1-5-pro', label: 'Gemini 1.5 Pro', description: 'Google • Contexto Estendido 2M', color: '#4285f4' },
    { value: 'gemini-1-5-flash', label: 'Gemini 1.5 Flash', description: 'Google • Processamento Veloz', color: '#4285f4' },
    { value: 'manus', label: 'Manus', description: 'Híbrido • Agente Híbrido Avançado', color: '#000000' },
    { value: 'perplexity-sonar', label: 'Perplexity', description: 'Web • Motor de Busca em Tempo Real', color: '#00a99d' },
];

const AGENTS = [
    { id: 'article', name: 'Gerador de Artigos', prompt: 'Você é um redator B2B especializado.' },
    { id: 'editor', name: 'Editor de Conteúdo', prompt: 'Você é editor de conteúdo.' },
    { id: 'sales', name: 'Consultor de Vendas', prompt: 'Especialista em Vendas B2B.' },
];

const DEFAULT_TONES = [
    { id: 'normal', label: 'Normal', prompt: 'Responda normalmente.', predefined: true },
    { id: 'conciso', label: 'Conciso', prompt: 'Seja extremamente conciso e direto. Evite floreios.', predefined: true },
    { id: 'explicativo', label: 'Explicativo', prompt: 'Explique detalhadamente, como se estivesse ensinando.', predefined: true },
    { id: 'formal', label: 'Formal', prompt: 'Use um tone formal e corporativo.', predefined: true },
    { id: 'disruptor', label: 'Disruptor Digital', prompt: 'Use um tone provocativo, inovador e desafiador do status quo.', predefined: true },
    { id: 'giuliano', label: 'Giuliano Style', prompt: 'Seja estratégico, focado em ROI e Growth, usando termos técnicos de RevOps.', predefined: true },
];

interface Message { role: 'user' | 'assistant'; content: string; }
interface Session { id: string; agentId: string | null; title: string; messages: Message[]; lastMessageAt: Date; }

const AdminAIChat = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { agents, sessions, isLoadingAI: isLoadingGlobal, refreshAI, selectedAgentId, setSelectedAgentId } = useAI();

    // State
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Config
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [agentKnowledgeCount, setAgentKnowledgeCount] = useState<number>(0);
    const [agentKnowledgeFilenames, setAgentKnowledgeFilenames] = useState<string[]>([]);
    const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);

    // Tone State
    const [tones, setTones] = useState(DEFAULT_TONES);
    const [selectedTone, setSelectedTone] = useState<string>('normal');
    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

    // Tone Editor State
    const [isToneModalOpen, setIsToneModalOpen] = useState(false);
    const [toneModalStep, setToneModalStep] = useState<'initial' | 'paste' | 'describe' | 'preview'>('initial');
    const [newToneName, setNewToneName] = useState('');
    const [newToneTranscript, setNewToneTranscript] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Fetch knowledge count when agent changes
    useEffect(() => {
        if (!selectedAgentId || selectedAgentId === 'default') {
            setAgentKnowledgeCount(0);
            setAgentKnowledgeFilenames([]);
            return;
        }
        const fetchCount = async () => {
            setIsLoadingKnowledge(true);
            try {
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
        fetchCount();
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

    const handleSendMessage = async (overrideText?: string) => {
        const messageText = overrideText || input;
        if (!messageText.trim() || loading || isLoadingGlobal) return;

        const userMsg: Message = { role: 'user', content: messageText.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        if (!overrideText) setInput('');
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

            // --- SECURITY UPDATE: Send only ID, backend handles the rest ---
            const { data: chatData, error: chatError } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agentId: selectedAgentId || 'default', // Pass ID
                    messages: newMessages,
                    sessionId: sessionId
                }
            });

            if (chatError) throw chatError;

            if (chatData?.success) {
                const botMsg: Message = { role: 'assistant', content: chatData.response };
                setMessages(prev => [...prev, botMsg]);
                if (sessionId) {
                    await supabase.from('chat_messages').insert({
                        session_id: sessionId,
                        role: 'assistant',
                        content: botMsg.content
                    });
                }
                refreshAI();
            }
        } catch (error: any) {
            console.error('Error in chat workflow:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Desculpe, ocorreu um erro na comunicação." }]);
            toast.error("Erro ao enviar mensagem.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeTone = async () => {
        if (!newToneTranscript.trim()) return;
        setIsAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Linguista System Agent
                    messages: [{ role: 'user', content: `Analise:\n\n"${newToneTranscript}"` }]
                }
            });
            if (data?.success) {
                setGeneratedPrompt(data.response);
                setToneModalStep('preview');
            }
        } catch (error) { toast.error("Erro ao analisar tom."); }
        finally { setIsAnalyzing(false); }
    };

    const handleSaveTone = () => {
        if (!newToneName || !generatedPrompt) return;
        const newTone = { id: `custom-${Date.now()}`, label: newToneName, prompt: generatedPrompt, predefined: false };
        setTones([...tones, newTone]);
        setSelectedTone(newTone.id);
        setIsToneModalOpen(false);
        resetToneModal();
        setIsStyleMenuOpen(false);
        toast.success("Estilo criado!");
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

    const handleRemoveFile = () => {
        setAttachedFile(null);
        setAttachedPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <AdminLayout>
            <div className="flex h-[calc(100vh-64px)] w-full bg-white overflow-hidden relative">
                <div className="flex-1 flex flex-col bg-white relative h-full min-w-0">
                    <header className="h-[80px] border-b border-zinc-100 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-xl sticky top-0 z-[60]">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/agents')}
                                className="group flex items-center gap-4 px-4 py-2 hover:bg-zinc-50 rounded-2xl transition-all border border-transparent"
                            >
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-black shadow-sm group-hover:scale-95 transition-transform">
                                    <Bot size={20} />
                                </div>
                                <div className="text-left">
                                    <h1 className="text-[15px] font-bold text-black tracking-tight leading-none mb-1.5">
                                        {selectedAgentId === 'default' ? 'Assistente Geral' : (agents.find(a => a.id === selectedAgentId)?.name || 'Carregando...')}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Motor Ativo</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="w-[220px] h-[48px] border-zinc-100 bg-zinc-50/50 hover:bg-white hover:shadow-lg hover:border-zinc-200 transition-all rounded-full px-6 flex items-center gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: MODELS.find(m => m.value === selectedModel)?.color || '#000' }}
                                        />
                                        <span className="text-[13px] font-bold text-black truncate">
                                            {MODELS.find(m => m.value === selectedModel)?.label}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl p-1 z-[100]">
                                    {MODELS.map(m => (
                                        <SelectItem key={m.value} value={m.value} className="text-[12px] font-semibold py-3 rounded-xl focus:bg-zinc-50 border-none outline-none">
                                            <div className="flex items-center gap-2.5 text-left">
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: m.color }}
                                                />
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-black text-[13px] font-bold leading-tight">{m.label}</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium leading-none">{m.description}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto w-full scroll-smooth bg-white scrollbar-elegant">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
                                <div className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center mb-8 shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-500">
                                    <Bot className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-black tracking-tight mb-8">Como posso ajudar hoje?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                    {[
                                        "Escrever copy de anúncio B2B",
                                        "Analisar métricas de RevOps",
                                        "Criar briefing de conteúdo",
                                        "Planejar funil de Growth"
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(suggestion)}
                                            className="p-4 text-left border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-black hover:shadow-lg hover:shadow-black/5 rounded-2xl transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <p className="text-[13px] font-bold text-zinc-600 group-hover:text-black transition-colors">{suggestion}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-[760px] mx-auto w-full py-20 px-6 sm:px-8 space-y-12">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className="flex gap-6 group animate-in fade-in slide-in-from-bottom-3 duration-500">
                                        <div className={cn(
                                            "w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm transition-transform",
                                            msg.role === 'assistant' ? 'bg-zinc-50 text-black border border-zinc-100' : 'bg-black text-white'
                                        )}>
                                            {msg.role === 'assistant' ? <Bot size={20} /> : 'EU'}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1.5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                                                    {msg.role === 'assistant' ? 'RevAssistant' : 'Você'}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "text-[15px] leading-[1.8] font-medium prose prose-zinc max-w-none text-zinc-800",
                                                msg.role === 'assistant' ? 'opacity-100' : 'opacity-90'
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-6 animate-in fade-in duration-300">
                                        <div className="w-10 h-10 rounded-[14px] bg-zinc-50 border border-zinc-100 text-black flex items-center justify-center shrink-0 shadow-sm">
                                            <Bot size={20} className="animate-pulse" />
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full animate-bounce delay-75"></div>
                                                <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full animate-bounce delay-150"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={endRef} className="h-32" />
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white to-transparent pb-10">
                        <div className="max-w-[800px] mx-auto w-full relative">
                            {attachedPreview && (
                                <div className="absolute -top-32 left-0 p-3 bg-white border border-zinc-200 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-3">
                                    <img src={attachedPreview} className="w-16 h-16 object-cover rounded-xl" />
                                    <button onClick={handleRemoveFile} className="p-1 px-3 bg-zinc-100 hover:bg-zinc-200 text-[10px] font-bold rounded-lg uppercase">Remover</button>
                                </div>
                            )}

                            <div className="relative group transition-all">
                                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-100 to-zinc-50 rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                                <div className="relative flex items-end gap-3 p-3 bg-zinc-50 border border-zinc-100 group-focus-within:bg-white group-focus-within:border-zinc-200 rounded-[28px] shadow-sm transition-all overflow-hidden min-h-[64px]">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-100 hover:border-black rounded-full transition-all text-zinc-400 hover:text-black shrink-0 shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                        placeholder="Pergunte qualquer coisa..."
                                        rows={1}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium text-black py-2.5 px-3 resize-none max-h-[300px] outline-none"
                                        style={{ height: 'auto' }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = `${target.scrollHeight}px`;
                                        }}
                                    />
                                    <div className="flex items-center gap-2 p-1">
                                        <button
                                            onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                                            className={cn(
                                                "px-5 h-10 rounded-full text-[12px] font-bold border transition-all flex items-center gap-2 shadow-sm",
                                                selectedTone !== 'normal'
                                                    ? 'bg-black border-black text-white hover:bg-zinc-800'
                                                    : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:text-black'
                                            )}
                                        >
                                            <Feather size={14} />
                                            {selectedTone !== 'normal' ? tones.find(t => t.id === selectedTone)?.label : 'Estilo'}
                                        </button>
                                        <button
                                            onClick={() => handleSendMessage()}
                                            disabled={loading || !input.trim()}
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg group",
                                                loading || !input.trim() ? 'bg-zinc-100 text-zinc-300' : 'bg-black text-white hover:scale-105 active:scale-95 shadow-black/10'
                                            )}
                                        >
                                            <Send size={18} className={cn("transition-transform", !loading && input.trim() && "group-hover:-translate-y-0.5 group-hover:translate-x-0.5")} />
                                        </button>
                                    </div>
                                </div>
                                {isStyleMenuOpen && (
                                    <div className="absolute bottom-full right-0 mb-6 w-72 bg-white rounded-[28px] shadow-2xl border border-zinc-100 overflow-hidden z-[60] animate-in slide-in-from-bottom-2 duration-300 p-2">
                                        <div className="px-5 py-4 border-b border-zinc-50">
                                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Estilo de Resposta</span>
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto scrollbar-elegant py-1">
                                            {tones.map(tone => (
                                                <button key={tone.id} onClick={() => { setSelectedTone(tone.id); setIsStyleMenuOpen(false); }} className="w-full text-left px-5 py-3.5 text-[13px] font-bold hover:bg-zinc-50 rounded-2xl transition-all flex items-center justify-between group">
                                                    <span className={selectedTone === tone.id ? 'text-black' : 'text-zinc-400 group-hover:text-black'}>{tone.label}</span>
                                                    {selectedTone === tone.id && <Check size={16} className="text-green-500" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-zinc-50">
                                            <button onClick={() => { setIsToneModalOpen(true); setIsStyleMenuOpen(false); }} className="w-full py-3.5 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-black/5">NOVO ESTILO</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="mt-4 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                                Growth Intelligence Hub &bull; Powered by RevHackers
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {isToneModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden flex relative">
                        <button onClick={() => { setIsToneModalOpen(false); resetToneModal(); }} className="absolute top-8 right-8 text-zinc-300 hover:text-black transition-colors"><X size={32} /></button>

                        <div className="w-1/2 p-20 flex flex-col justify-center bg-zinc-50/50">
                            <Sparkles size={48} className="mb-8" />
                            <h2 className="text-4xl font-extrabold text-black uppercase tracking-tighter leading-none mb-6">Capture seu tom personalizado</h2>
                            <p className="text-zinc-500 text-lg font-medium leading-relaxed">A IA irá mimetizar seu estilo de escrita para respostas ultra-personalizadas.</p>
                        </div>

                        <div className="w-1/2 p-20 flex flex-col justify-center bg-white border-l border-zinc-100">
                            {toneModalStep === 'initial' && (
                                <button onClick={() => setToneModalStep('paste')} className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all">COMEÇAR AGORA</button>
                            )}
                            {toneModalStep === 'paste' && (
                                <div className="h-full flex flex-col">
                                    <textarea value={newToneTranscript} onChange={e => setNewToneTranscript(e.target.value)} className="flex-1 w-full p-6 border-2 border-zinc-100 rounded-3xl bg-zinc-50/30 focus:bg-white focus:border-black transition-all mb-6 outline-none font-medium" placeholder="Cole de 2 a 3 parágrafos do seu melhor texto..." />
                                    <button onClick={handleAnalyzeTone} disabled={isAnalyzing || !newToneTranscript.trim()} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest">
                                        {isAnalyzing ? <Loader2 className="animate-spin mx-auto" /> : "PROCESSAR ESTILO"}
                                    </button>
                                </div>
                            )}
                            {toneModalStep === 'preview' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Identificação</label>
                                        <input value={newToneName} onChange={e => setNewToneName(e.target.value)} className="w-full p-4 border rounded-xl font-bold" placeholder="Ex: Tone CEO RevHackers" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">DNA Detectado</label>
                                        <textarea value={generatedPrompt} onChange={e => setGeneratedPrompt(e.target.value)} className="w-full h-48 p-4 border rounded-xl font-mono text-xs text-zinc-600" />
                                    </div>
                                    <button onClick={handleSaveTone} className="w-full py-5 bg-[#03FC3B] text-black rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#03FC3B]/20">SALVAR DNA</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout >
    );
};

export default AdminAIChat;
