import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Cpu, Save, ArrowLeft, Database, Target, FileText, Play, Send,
    Globe, Type, Upload, Info, Plus, X, Trash2, Loader2, ChevronDown, Zap,
    Crosshair, Terminal, Binary, Box, Bot
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { KnowledgeUploader } from '@/components/ai/KnowledgeUploader';
import { toast } from 'sonner';
import AIEditorLayout from '@/components/layout/AIEditorLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type ActiveTab = 'config' | 'knowledge' | 'goals';
type KnowledgeType = 'url' | 'text' | 'faq' | 'file';

interface KnowledgeSource {
    id: string;
    type: KnowledgeType;
    name: string;
    content: string;
}

export const MODEL_OPTIONS = [
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Anthropic • Raciocínio Avançado', tech: 'CLD-3.5-S', color: '#d97757' },
    { value: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI • Inteligência Máxima', tech: 'GPT-4.0-O', color: '#10a37f' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'OpenAI • Resposta Rápida', tech: 'GPT-4.0-M', color: '#10a37f' },
    { value: 'gemini-2-0-flash', label: 'Gemini 2.0 Flash', description: 'Google • Velocidade Extrema', tech: 'GEM-2.0-F', color: '#4285f4' },
    { value: 'gemini-1-5-pro', label: 'Gemini 1.5 Pro', description: 'Google • Contexto Estendido 2M', tech: 'GEM-1.5-P', color: '#4285f4' },
    { value: 'gemini-1-5-flash', label: 'Gemini 1.5 Flash', description: 'Google • Processamento Veloz', tech: 'GEM-1.5-F', color: '#4285f4' },
    { value: 'manus', label: 'Manus', description: 'Híbrido • Agente Híbrido Avançado', tech: 'MANUS-1.0', color: '#000000' },
    { value: 'perplexity-sonar', label: 'Perplexity', description: 'Web • Motor de Busca em Tempo Real', tech: 'PPLX-S', color: '#00a99d' },
];

const AdminAgentBuilder = () => {
    const navigate = useNavigate();
    const { userRole } = useAuth();

    // Tabs
    const [activeTab, setActiveTab] = useState<ActiveTab>('config');

    // Basic Config
    const [name, setName] = useState('');
    const [model, setModel] = useState('gpt-4o-mini');

    // Knowledge
    const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
    const [activeKnowledgeModal, setActiveKnowledgeModal] = useState<KnowledgeType | null>(null);
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceContent, setNewSourceContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    // FAQ Q&A pairs
    const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);

    // Personality & Goals
    const [personality, setPersonality] = useState('');
    const [goal, setGoal] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    // Logger de estado para eliminação
    useEffect(() => {
        console.log(`[ELIMINAÇÃO] Estado 'files' atualizado:`, files.length, "arquivos.");
        if (files.length > 0) {
            files.forEach((f, i) => console.log(`   - File[${i}]: ${f.name} (${f.size} bytes)`));
        }
    }, [files]);
    // Test Mode (Chat State)
    const [testMessages, setTestMessages] = useState<{ role: string, content: string }[]>([]);
    const [testInput, setTestInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatModel, setChatModel] = useState('gpt-4o-mini');

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            loadAgent();
        }
    }, [id]);

    const loadAgent = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setName(data.name);
                setModel(data.model);
                setGoal(data.role);
                setPersonality(data.description);
                // O sistema guarda system_prompt como texto
                const prompt = typeof data.system_prompt === 'string' ? data.system_prompt : '';
                setAdditionalInfo(prompt);

                // Fetch documents via Edge Function (List action bypasses RLS)
                console.log(`[RAG DEBUG] Carregando documentos via Edge Function para agente ${id}...`);
                const { data: ragDocs, error: listError } = await supabase.functions.invoke('agent-documents', {
                    body: { action: 'list', agentId: id }
                });

                if (listError || !ragDocs?.success) {
                    console.error(`[RAG DEBUG] Erro ao carregar documentos via Edge Function:`, listError || ragDocs?.error);
                    // Fallback to direct DB query (might be blocked by RLS)
                    const { data: dbDocs } = await supabase
                        .from('agent_documents')
                        .select('id, filename, content, metadata')
                        .eq('agent_id', id);

                    if (dbDocs) {
                        processDocs(dbDocs);
                    }
                } else if (ragDocs?.documents) {
                    processDocs(ragDocs.documents);
                }

                function processDocs(docs: any[]) {
                    console.log(`[RAG DEBUG] Role: ${userRole} | Docs processados:`, docs.length, "itens");

                    if (docs.length > 0) {
                        const grouped: Record<string, KnowledgeSource> = {};
                        docs.forEach(d => {
                            const filename = d.filename || 'Documento';
                            const metadata = d.metadata as any;
                            let srcType: KnowledgeType = 'text';

                            if (metadata?.source_type) {
                                if (metadata.source_type === 'file') srcType = 'file';
                                else if (metadata.source_type === 'url') srcType = 'url';
                                else if (metadata.source_type === 'faq') srcType = 'faq';
                            }

                            if (!grouped[filename]) {
                                grouped[filename] = {
                                    id: filename,
                                    name: filename,
                                    type: srcType,
                                    content: d.content || ''
                                };
                            } else {
                                grouped[filename].content += d.content || '';
                            }
                        });
                        setKnowledgeSources(Object.values(grouped));
                    }
                }

                // Get profile for RLS debugging
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    console.log('[DEBUG] Profile DB:', profile);
                }
            }
        } catch (error: any) {
            console.error('Error loading agent:', error);
            toast.error('Erro ao carregar dados do agente');
        } finally {
            setIsLoading(false);
        }
    };

    const extractTextFromFile = async (file: File): Promise<string> => {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            console.log(`[RAG DEBUG] Extraindo PDF: ${file.name}...`);
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
                    const strings = content.items.map((item: any) => item.str);
                    fullText += strings.join(' ') + '\n';
                }
                return fullText;
            } catch (err) {
                console.error('Erro no processamento PDF, tentando fallback para texto:', err);
            }
        }

        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Nome do agente é obrigatório');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Salvando agente e processando cérebro (RAG)...', {
            description: 'Isso pode levar alguns segundos dependendo do tamanho dos documentos.',
            style: { background: '#000', color: '#fff', border: '1px solid #333' }
        });

        try {
            // 1. Save or Update Agent Basic Info
            const agentPayload = {
                name: name.trim(),
                role: goal || 'Assistente',
                description: personality,
                system_prompt: [
                    personality ? `Personalidade: ${personality}` : '',
                    goal ? `Objetivo: ${goal}` : '',
                    additionalInfo ? `Info Adicional: ${additionalInfo}` : ''
                ].filter(Boolean).join('\n\n') || 'Você é um assistente útil.',
                model: model,
                is_public: true,
            };

            let agentData;
            if (id) {
                const { data, error } = await supabase
                    .from('agents')
                    .update(agentPayload)
                    .eq('id', id)
                    .select()
                    .single();
                if (error) throw error;
                agentData = data;
            } else {
                const { data, error } = await supabase
                    .from('agents')
                    .insert(agentPayload)
                    .select()
                    .single();
                if (error) throw error;
                agentData = data;
            }

            if (!agentData) throw new Error("Falha ao recuperar dados do agente após salvar.");

            // 2. Process Knowledge Sources (AI Brain)
            const allChunks: { filename: string, content: string, metadata: any }[] = [];

            const chunkText = (text: string, chunkSize = 1500, overlap = 200) => {
                const chunks: string[] = [];
                let start = 0;
                while (start < text.length) {
                    const end = Math.min(start + chunkSize, text.length);
                    chunks.push(text.slice(start, end));
                    start += chunkSize - overlap;
                }
                return chunks;
            };

            // Extract from knowledgeSources
            for (const source of knowledgeSources) {
                const chunks = chunkText(source.content);
                chunks.forEach((c, i) => {
                    allChunks.push({
                        filename: source.name,
                        content: c,
                        metadata: { chunk_index: i, total_chunks: chunks.length, source_type: source.type }
                    });
                });
            }

            // Extract from uploaded files
            for (const file of files) {
                toast.loading(`Lendo arquivo: ${file.name}...`, { id: loadingToast });
                const text = await extractTextFromFile(file);

                const chunks = chunkText(text);
                console.log(`[RAG DEBUG] Arquivo ${file.name}: ${chunks.length} chunks gerados.`);

                chunks.forEach((c, i) => {
                    if (i === 0) console.log(`   [PEEK CHUNK 0] "${c.substring(0, 100).replace(/\n/g, ' ')}..."`);
                    allChunks.push({
                        filename: file.name,
                        content: c,
                        metadata: { chunk_index: i, total_chunks: chunks.length, source_type: 'file' }
                    });
                });
            }

            console.log(`[RAG DEBUG] AgentID: ${agentData.id} | Total de chunks preparados: ${allChunks.length}`);
            if (allChunks.length > 0) {
                // First delete old documents for this agent to avoid duplicates/stale data
                if (id) {
                    console.log(`[RAG DEBUG] Agente existente (${id}): Deletando conhecimento antigo...`);
                    toast.loading('Limpando conhecimento antigo do cérebro...', { id: loadingToast });

                    const { error: delError } = await supabase.functions.invoke('agent-documents', {
                        body: { action: 'delete', agentId: id }
                    });
                    if (delError) console.error('[RAG DEBUG] Erro ao deletar antigo:', delError);
                }

                // Upload in segments to avoid Edge Function timeouts
                const SEGMENT_SIZE = 10; // Reduced for debugging stability
                for (let i = 0; i < allChunks.length; i += SEGMENT_SIZE) {
                    const segment = allChunks.slice(i, i + SEGMENT_SIZE);
                    const progress = Math.round(((i + segment.length) / allChunks.length) * 100);

                    console.log(`[RAG DEBUG] Enviando segmento ${Math.floor(i / SEGMENT_SIZE) + 1} (${segment.length} chunks)...`);

                    // Debug: Peek at some content
                    segment.forEach((s, idx) => {
                        console.log(`   [CHUNK ${i + idx}] ${s.filename}: "${s.content.substring(0, 50)}..."`);
                    });

                    toast.loading(`Treinando o cérebro: ${progress}% concluído...`, {
                        id: loadingToast,
                        description: `Processando parte ${Math.floor(i / SEGMENT_SIZE) + 1} de ${Math.ceil(allChunks.length / SEGMENT_SIZE)}`
                    });

                    const { data: ragData, error: ragError } = await supabase.functions.invoke('agent-documents', {
                        body: {
                            action: 'upload_chunks',
                            agentId: agentData.id,
                            documents: segment
                        }
                    });

                    if (ragError) {
                        console.error('[RAG DEBUG] Erro no invoke:', ragError);
                        throw ragError;
                    }
                    if (ragData?.success === false) {
                        console.error('[RAG DEBUG] Erro retornado pela função:', ragData?.error);
                        throw new Error(ragData?.error || "Erro no processamento RAG");
                    }
                    console.log(`[RAG DEBUG] Segmento ${Math.floor(i / SEGMENT_SIZE) + 1} OK.`);
                }
            } else {
                console.log('[RAG DEBUG] Nenhum novo conhecimento para fazer upload.');
            }

            toast.success('Agente salvo com sucesso e cérebro treinado!', { id: loadingToast });

            // Navega para o chat com o agente recém-salvo
            setTimeout(() => {
                navigate(`/admin/ai-chat?agent=${agentData.id}`);
            }, 1000);
        } catch (error: any) {
            console.error('Error saving agent:', error);
            toast.dismiss(loadingToast);

            const errorMsg = error.message?.includes('Failed to send a request')
                ? "Erro de Conexão: O banco de dados não conseguiu falar com o 'Cérebro' (Edge Function). Verifique se o Supabase está rodando localmente ou se as funções foram publicadas."
                : `Erro ao salvar: ${error.message}`;

            toast.error(errorMsg);
            alert(`FALHA NO SALVAMENTO:\n${error.message}\n\nVerifique o Console (F12) para detalhes técnicos.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testInput.trim() || isLoading) return;

        const userMessage = testInput.trim();
        const newMessages = [...testMessages, { role: 'user', content: userMessage }];
        setTestMessages(newMessages);
        setTestInput('');
        setIsLoading(true);

        try {
            // Build knowledge context from sources + uploaded files
            let knowledgeContext = knowledgeSources
                .map(s => `[${s.name}]\n${s.content}`)
                .join('\n\n');

            // Add files content to preview context
            for (const file of files) {
                try {
                    const text = await extractTextFromFile(file);
                    knowledgeContext += `\n\n[Arquivo: ${file.name}]\n${text}`;
                } catch (fileErr) {
                    console.error(`Erro ao ler arquivo ${file.name}:`, fileErr);
                    // Skip this file but continue
                }
            }

            // Cap context size to avoid "Payload Too Large" (10MB Supabase limit, but browser/network might limit lower)
            const MAX_CONTEXT_CHARS = 100000;
            if (knowledgeContext.length > MAX_CONTEXT_CHARS) {
                console.warn(`Contexto de conhecimento muito grande (${knowledgeContext.length} chars). Truncando para ${MAX_CONTEXT_CHARS}.`);
                knowledgeContext = knowledgeContext.substring(0, MAX_CONTEXT_CHARS) + "\n\n[...CONTEÚDO TRUNCADO NO PREVIEW PARA EVITAR ERRO DE TAMANHO...]";
            }

            console.log('Invocando agent-chat com:', {
                agent: name || 'Agente de Teste',
                model: chatModel,
                contextLen: knowledgeContext.length,
                msgCount: newMessages.length
            });

            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agent: {
                        name: name || 'Agente de Teste',
                        model: chatModel,
                        personality,
                        goal,
                        additionalInfo,
                        knowledgeContext
                    },
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                }
            });

            if (error) {
                console.error('Erro de rede ou Supabase:', error);
                throw new Error(`Falha na conexão: ${error.message || 'Verifique sua conexão ou se a função está ativa'}`);
            }

            if (data?.success) {
                setTestMessages([...newMessages, { role: 'assistant', content: data.response }]);
            } else {
                console.error('Erro retornado pela função:', data?.error);
                throw new Error(data?.error || 'O cérebro do agente retornou um erro interno');
            }
        } catch (error: any) {
            console.error('Test error detail:', error);

            let descriptiveError = `Erro no chat: ${error.message}`;

            if (error.message?.includes('Failed to send a request') || error.message?.includes('Failed to fetch')) {
                descriptiveError = "🚨 Falha Grave de Conexão: Não foi possível alcançar a função 'agent-chat'. Certifique-se de que o Supabase local está ligado (`supabase start`) ou que a função está publicada.";
            } else if (error.message?.includes('404')) {
                descriptiveError = "🚨 Função não encontrada (404). Verifique se o nome 'agent-chat' está correto e se ela foi servida.";
            }

            toast.error(descriptiveError);
            setTestMessages([...newMessages, {
                role: 'assistant',
                content: descriptiveError
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddKnowledgeSource = () => {
        if (!newSourceName.trim()) {
            toast.error('Nome é obrigatório');
            return;
        }

        let content = newSourceContent;

        // For FAQ, compile Q&A pairs
        if (activeKnowledgeModal === 'faq') {
            const validItems = faqItems.filter(item => item.question.trim() && item.answer.trim());
            if (validItems.length === 0) {
                toast.error('Adicione pelo menos uma pergunta e resposta');
                return;
            }
            content = validItems.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
        }

        const newSource: KnowledgeSource = {
            id: Date.now().toString(),
            type: activeKnowledgeModal!,
            name: newSourceName,
            content
        };

        setKnowledgeSources([...knowledgeSources, newSource]);
        setNewSourceName('');
        setNewSourceContent('');
        setFaqItems([{ question: '', answer: '' }]);
        setActiveKnowledgeModal(null);
        toast.success('Fonte adicionada!');
    };

    const handleRemoveSource = (id: string) => {
        setKnowledgeSources(knowledgeSources.filter(s => s.id !== id));
    };

    // Tab Button using Segmented Control Style
    const TabButton = ({ id, label }: { id: ActiveTab, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex-1 px-6 py-2.5 text-[13px] font-bold transition-all duration-300 rounded-full
                ${activeTab === id
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
                }
            `}
        >
            {label}
        </button>
    );

    const KnowledgeTypeCard = ({
        type, icon: Icon, title, description
    }: {
        type: KnowledgeType, icon: any, title: string, description: string
    }) => {
        const count = knowledgeSources.filter(s => s.type === type).length;

        return (
            <button
                onClick={() => setActiveKnowledgeModal(type)}
                className="text-left p-6 bg-white border border-zinc-100 rounded-[24px] hover:border-zinc-200 hover:shadow-xl hover:shadow-black/5 transition-all group"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-black text-sm tracking-tight">{title}</h4>
                            {count > 0 && (
                                <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded-full">
                                    {count}
                                </span>
                            )}
                        </div>
                        <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">{description}</p>
                    </div>
                </div>
            </button>
        );
    };

    const getModalContent = () => {
        switch (activeKnowledgeModal) {
            case 'url':
                return {
                    title: 'Web Crawler',
                    placeholder: 'Cole as URLs (uma por linha)',
                    hint: 'O sistema irá extrair o conteúdo das páginas automaticamente.',
                };
            case 'text':
                return {
                    title: 'Texto',
                    placeholder: 'Cole ou escreva o conteúdo...',
                    hint: 'Adicione textos, artigos, documentações.',
                };
            case 'faq':
                return {
                    title: 'FAQ',
                    placeholder: 'Pergunta: Resposta\nPergunta: Resposta',
                    hint: 'Use o formato "Pergunta: Resposta" (uma por linha)',
                };
            default:
                return { title: '', placeholder: '', hint: '' };
        }
    };

    // Sidebar Content: Test Chat (ChatGPT Style)
    const AgentTester = (
        <div className="flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="h-20 border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                        <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <span className="text-[13px] font-bold text-black block leading-none mb-1">
                            Preview do Motor
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ativo</span>
                        </div>
                    </div>
                </div>

                <Select value={chatModel} onValueChange={setChatModel}>
                    <SelectTrigger className="h-10 w-40 text-xs font-bold border-zinc-100 bg-zinc-50 hover:bg-zinc-100 transition-all rounded-full px-4">
                        <SelectValue placeholder="Engine" />
                    </SelectTrigger>
                    <SelectContent>
                        {MODEL_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: opt.color || '#000' }} />
                                    {opt.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-zinc-50/30 scroll-smooth">
                {testMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-0 animate-in fade-in duration-700">
                        <div className="w-16 h-16 bg-white border border-zinc-100 rounded-[28px] shadow-xl shadow-black/5 flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-8 h-8 text-black" />
                        </div>
                        <p className="text-[13px] font-bold text-black uppercase tracking-widest">Aguardando Input</p>
                        <p className="text-[11px] text-zinc-400 mt-4 max-w-[240px] font-medium leading-relaxed">
                            Envie uma mensagem para validar o comportamento e a personalidade do seu agente.
                        </p>
                    </div>
                )}

                {testMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm ${msg.role === 'assistant' ? 'bg-black text-white' : 'bg-zinc-100'
                            }`}>
                            {msg.role === 'assistant' ? <Cpu className="w-4 h-4 text-revgreen" /> : 'USER'}
                        </div>
                        <div className={`max-w-[85%] text-[13px] leading-relaxed ${msg.role === 'assistant'
                            ? 'text-zinc-800 font-bold pt-1.5'
                            : 'bg-zinc-50 border border-zinc-100 text-zinc-900 px-4 py-2.5 rounded-2xl rounded-tr-none font-bold'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-zinc-200">
                            <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                        </div>
                        <div className="pt-2">
                            <span className="text-xs text-zinc-400">Digitando...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Input */}
            <div className="p-8 bg-white border-t border-zinc-100">
                <form onSubmit={(e) => { e.preventDefault(); handleSendTest(); }} className="relative bg-zinc-50 border border-zinc-200 rounded-[24px] focus-within:border-black transition-all">
                    <Input
                        placeholder="Enviar mensagem para teste..."
                        className="pl-6 pr-14 min-h-[64px] border-none bg-transparent shadow-none focus-visible:ring-0 text-[14px] font-medium text-black placeholder:text-zinc-400"
                        value={testInput}
                        onChange={e => setTestInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!testInput.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black text-white rounded-[18px] flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 transition-all shadow-lg shadow-black/10"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <div className="flex justify-between items-center mt-4 px-1">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Sincronizado</p>
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">v2.4</p>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <AIEditorLayout
                title={id ? `Editar: ${name}` : (name || "Novo Agente")}
                description={id ? "Atualize as configurações e treinamento" : "Configuração e Treinamento"}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/agents')} className="text-zinc-500 hover:text-zinc-900 rounded-full h-9">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} size="sm" className="bg-black text-white hover:bg-zinc-800 rounded-full h-9 px-5 shadow-sm">
                            <Save className="w-4 h-4 mr-2" /> {id ? 'Atualizar Agente' : 'Salvar Alterações'}
                        </Button>
                    </div>
                }
                sidebarContent={AgentTester}
            >
                {/* Tabs Navigation (Segmented Control) */}
                <div className="mb-8 p-1 bg-zinc-100/80 rounded-lg inline-flex w-full lg:w-auto min-w-[400px]">
                    <TabButton id="config" label="Configuração" />
                    <TabButton id="knowledge" label="Conhecimento" />
                    <TabButton id="goals" label="Metas" />
                </div>

                {/* Tab: Configuração */}
                {activeTab === 'config' && (
                    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
                                    <Terminal size={14} className="text-zinc-400" />
                                    Identidade do Agente
                                </Label>
                                <Input
                                    placeholder="Ex: Consultor Estratégico de Growth"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="h-12 border-zinc-200 bg-white focus:border-black rounded-xl text-base font-bold placeholder:text-zinc-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
                                    <Binary size={14} className="text-zinc-400" />
                                    Motor de Base
                                </Label>
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger className="h-12 border-zinc-200 bg-zinc-50/50 hover:border-black rounded-xl font-bold">
                                        <SelectValue placeholder="Selecionar Motor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MODEL_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color || '#000' }} />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{opt.label}</span>
                                                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{opt.description}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-zinc-900">Instruções de Identidade e Comportamento</Label>
                                <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Prompt do Sistema</span>
                            </div>

                            <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                💡 **Dica:** Defina aqui *quem* o agente é (Identidade). O **Tom de Voz** (estilo de escrita) será selecionado ou clonado individualmente no chat.
                            </p>

                            <div className="relative">
                                <Textarea
                                    placeholder="Ex: Você é um estrategista de Marketing focado em ROI. Sua comunicação deve ser baseada em dados, sendo direta e sem enrolação..."
                                    className="min-h-[280px] p-4 border-zinc-200 text-sm leading-relaxed resize-none bg-white rounded-xl focus:ring-1 focus:ring-black/5 focus:border-zinc-400 shadow-sm"
                                    value={personality}
                                    onChange={e => setPersonality(e.target.value)}
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] text-zinc-400 font-medium bg-white px-2 py-1 rounded-md border border-zinc-100 shadow-sm">
                                    {personality.length} caracteres
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Conhecimento */}
                {activeTab === 'knowledge' && (
                    <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KnowledgeTypeCard type="url" icon={Globe} title="Web Crawler" description="Sincronizar URLs para contexto dinâmico" />
                            <KnowledgeTypeCard type="text" icon={Type} title="Dados Brutos" description="Injeção manual de texto" />
                            <KnowledgeTypeCard type="faq" icon={Terminal} title="Base de Conhecimento" description="Padrões estruturados de Q&A" />
                        </div>

                        <div className="space-y-6 pt-4 border-t border-zinc-100">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-zinc-500" />
                                    Arquivos de Conhecimento
                                </h3>
                                <KnowledgeUploader files={files} onFilesChange={setFiles} />
                            </div>
                        </div>

                        {(knowledgeSources.length > 0 || files.length > 0) && (
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                    <Binary className="w-4 h-4 text-zinc-500" />
                                    Fontes Ativas ({knowledgeSources.length})
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {/* Existing persistent sources */}
                                    {knowledgeSources.map(source => (
                                        <div key={source.id} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                                                    {source.type === 'url' && <Globe className="w-5 h-5 text-zinc-400" />}
                                                    {source.type === 'text' && <Type className="w-5 h-5 text-zinc-400" />}
                                                    {source.type === 'faq' && <Terminal className="w-5 h-5 text-zinc-400" />}
                                                    {source.type === 'file' && <FileText className="w-5 h-5 text-zinc-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-900">{source.name}</p>
                                                    <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                                                        {source.type === 'url' ? 'Site/Link' :
                                                            source.type === 'text' ? 'Texto Manual' :
                                                                source.type === 'faq' ? 'FAQ' : 'Arquivo'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveSource(source.id)}
                                                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Staged uploaded files (not yet saved) */}
                                    {files.map((file, idx) => (
                                        <div key={`staged-${idx}`} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 border-dashed rounded-xl opacity-80">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-100">
                                                    <FileText className="w-5 h-5 text-zinc-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-500">{file.name}</p>
                                                    <p className="text-[10px] text-revgreen font-bold flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-revgreen animate-pulse"></span>
                                                        CLIQUE EM SALVAR PARA ATIVAR
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Metas */}
                {activeTab === 'goals' && (
                    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-zinc-50 to-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm text-zinc-900">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-zinc-900">Objetivo Principal</h3>
                                    <p className="text-xs text-zinc-500 mt-1">Defina claramente o que é sucesso para este agente.</p>
                                </div>
                            </div>
                            <Textarea
                                placeholder="Qual o objetivo principal deste agente? O que ele deve entregar?"
                                className="min-h-32 border-zinc-200 bg-white text-sm resize-none focus:ring-1 focus:ring-black/5 rounded-xl"
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                            />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-zinc-900">Instruções de Saída</h3>
                                    <p className="text-xs text-zinc-500 mt-1">Formatos específicos, restrições ou regras de compliance.</p>
                                </div>
                            </div>
                            <Textarea
                                placeholder="Regras específicas, contexto adicional, dados importantes..."
                                className="min-h-40 border-zinc-200 text-sm resize-none bg-zinc-50/30 focus:bg-white transition-colors rounded-xl"
                                value={additionalInfo}
                                onChange={e => setAdditionalInfo(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Modal for Knowledge Source */}
                {activeKnowledgeModal && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200">
                            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <h3 className="text-base font-bold text-zinc-900">{getModalContent().title}</h3>
                                <button onClick={() => setActiveKnowledgeModal(null)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-900">Nome da fonte</Label>
                                    <Input
                                        placeholder="Ex: Site Principal, FAQ de Vendas..."
                                        value={newSourceName}
                                        onChange={e => setNewSourceName(e.target.value)}
                                        className="h-11 border-zinc-200 rounded-lg"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-900">Conteúdo</Label>
                                    <Textarea
                                        placeholder={getModalContent().placeholder}
                                        value={newSourceContent}
                                        onChange={e => setNewSourceContent(e.target.value)}
                                        className="min-h-40 border-zinc-200 text-sm resize-none rounded-lg font-mono text-zinc-600"
                                    />
                                    <p className="text-xs text-zinc-500 ml-1">{getModalContent().hint}</p>
                                </div>
                            </div>
                            <div className="px-5 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50/50">
                                <Button variant="outline" onClick={() => setActiveKnowledgeModal(null)} className="rounded-lg h-9 text-xs font-semibold">
                                    Cancelar
                                </Button>
                                <Button onClick={handleAddKnowledgeSource} className="bg-black text-white hover:bg-zinc-800 rounded-lg h-9 text-xs font-semibold shadow-sm">
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar Fonte
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </AIEditorLayout>
        </AdminLayout>
    );
};

export default AdminAgentBuilder;
