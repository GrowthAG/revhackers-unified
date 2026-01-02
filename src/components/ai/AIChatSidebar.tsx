import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { useAI } from '@/context/AIContext';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const MODEL_OPTIONS = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'claude-3-haiku', label: 'Claude Haiku' },
];

const ARTICLE_GENERATOR_PROMPT = `Você é redator B2B da RevHackers. Crie artigos em HTML otimizados para SEO.

PADRÃO: 1.800-2.500 palavras (12.000-17.000 caracteres)

ESTRUTURA OBRIGATÓRIA:
1. H1: Max 60 chars, palavra-chave no início + [ano/número]
2. Meta: autor, data, tempo leitura
3. [IMAGEM_HERO] - descrição + alt text + prompt para gerar
4. Resumo: 2-3 frases (featured snippet)
5. TOC: índice com links âncora
6. <!-- AD_SLOT_1 --> após TOC
7. Seções H2 (4-6) com H3 quando necessário
8. [IMAGEM_1] após seção 1
9. <!-- AD_SLOT_2 --> após seção 1
10. [IMAGEM_2] na seção prática
11. <!-- AD_SLOT_3 --> antes conclusão
12. Conclusão + próximos passos
13. CTA: diagnóstico gratuito
14. FAQ: 3 perguntas com schema

IMAGENS: Para cada, forneça tipo, descrição, alt text, e prompt:
"Ícone 3D de vidro minimalista, fundo gradiente cinza-branco, iluminação suave, mostrando [ELEMENTO] representando [TEMA]"

Tom: Profissional, direto, orientado a resultados. Foco B2B.`;

const CONTENT_EDITOR_PROMPT = `Você é editor de conteúdo B2B da RevHackers.

ANALISE o texto e sugira melhorias em:

1. SEO: Densidade palavra-chave (1-2%), uso em H2/H3, meta description
2. COPYWRITING: Clareza, power words, CTAs
3. ESTRUTURA: Parágrafos longos, seções faltantes, transições
4. DADOS: Estatísticas desatualizadas, afirmações sem fonte

OUTPUT: Lista priorizada + texto corrigido com ~~removido~~ **adicionado**`;

const CASE_WRITER_PROMPT = `Você cria cases de sucesso B2B para RevHackers.

ESTRUTURA (800-1.200 palavras):
1. TÍTULO: [Resultado] + [Contexto] (max 80 chars)
2. RESUMO: 2 frases de impacto
3. SOBRE: 2-3 frases do cliente
4. DESAFIO: Problema + contexto (150 palavras)
5. SOLUÇÃO: O que foi implementado (200 palavras)
6. RESULTADOS: Métricas before/after (tabela)
7. PRÓXIMOS PASSOS
8. CTA: diagnóstico similar

IMAGENS: [IMAGEM_HERO] dashboard, [IMAGEM_RESULTADO] gráfico before/after
Tom: Profissional, focado em dados, credível.`;

const SALES_PROMPT = `Você é consultor de vendas B2B expert em empresas SaaS e tech.

ÁREAS DE EXPERTISE:
- Pipeline de vendas e estruturação
- Qualificação BANT/SPIN/MEDDIC
- Cadências de prospecção outbound
- Tratamento de objeções
- Técnicas de fechamento
- Métricas de vendas (conversion rate, cycle time)

Seja direto, prático e orientado a ação. Use exemplos reais quando possível.`;

const REVOPS_PROMPT = `Você é estrategista de Revenue Operations da RevHackers.

ÁREAS DE EXPERTISE:
- Métricas: CAC, LTV, Churn, NRR, ARR
- Integração vendas + marketing + CS
- Automação de processos (HubSpot, Salesforce)
- Tech stack e ferramentas
- Forecasting e previsibilidade
- Processos operacionais

Foco em dados, ROI e eficiência operacional. Seja prático e acionável.`;

interface Agent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatSession {
    id: string;
    agentId: string;
    title: string;
    messages: ChatMessage[];
}

const DEFAULT_AGENTS: Agent[] = [
    { id: 'article-gen', name: 'Gerador de Artigos', description: 'Cria artigos SEO em HTML (1.800-2.500 palavras)', systemPrompt: ARTICLE_GENERATOR_PROMPT },
    { id: 'content-editor', name: 'Editor de Conteúdo', description: 'Revisa e otimiza textos existentes', systemPrompt: CONTENT_EDITOR_PROMPT },
    { id: 'case-writer', name: 'Redator de Cases', description: 'Transforma projetos em cases de sucesso', systemPrompt: CASE_WRITER_PROMPT },
    { id: 'sales', name: 'Consultor Vendas', description: 'Pipelines, qualificação, fechamento', systemPrompt: SALES_PROMPT },
    { id: 'revops', name: 'Estrategista RevOps', description: 'CAC, LTV, automações, processos', systemPrompt: REVOPS_PROMPT },
];

export const AIChatSidebar = () => {
    const { isSidebarOpen, closeSidebar, selectedAgentId } = useAI();

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentModel, setCurrentModel] = useState('gpt-4o-mini');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Find selected agent
    const selectedAgent = selectedAgentId
        ? DEFAULT_AGENTS.find(a => a.id === selectedAgentId) || null
        : null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Reset messages when agent changes
    useEffect(() => {
        if (selectedAgentId) {
            setMessages([]);
            setCurrentSession(null);
        }
    }, [selectedAgentId]);

    const handleNewChat = () => {
        setMessages([]);
        setCurrentSession(null);
    };

    const handleSelectSession = (session: ChatSession) => {
        setCurrentSession(session);
        setMessages(session.messages);
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
            setCurrentSession(null);
            setMessages([]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading || !selectedAgent) return;

        const userMessage: ChatMessage = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agent: {
                        name: selectedAgent.name,
                        model: currentModel,
                        personality: selectedAgent.systemPrompt,
                        goal: selectedAgent.description,
                    },
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                }
            });

            if (error) throw error;

            if (data?.success) {
                const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
                const updatedMessages = [...newMessages, assistantMessage];
                setMessages(updatedMessages);

                if (currentSession) {
                    setSessions(prev => prev.map(s =>
                        s.id === currentSession.id ? { ...s, messages: updatedMessages } : s
                    ));
                } else {
                    const newSession: ChatSession = {
                        id: Date.now().toString(),
                        agentId: selectedAgent.id,
                        title: input.slice(0, 25) + (input.length > 25 ? '...' : ''),
                        messages: updatedMessages
                    };
                    setSessions(prev => [newSession, ...prev]);
                    setCurrentSession(newSession);
                }
            } else {
                throw new Error(data?.error || 'Erro desconhecido');
            }
        } catch (err: any) {
            setMessages([...newMessages, { role: 'assistant', content: `Erro: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const agentSessions = sessions.filter(s => s.agentId === selectedAgent?.id);

    if (!isSidebarOpen || !selectedAgent) return null;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-black z-40"
            />

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-zinc-950 z-50 flex flex-col"
            >
                {/* Header */}
                <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-white">{selectedAgent.name}</span>
                    <button onClick={closeSidebar} className="text-zinc-500 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sessions List */}
                <div className="border-b border-zinc-800 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-medium">Conversas</span>
                        <button onClick={handleNewChat} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Nova
                        </button>
                    </div>
                    {agentSessions.length === 0 ? (
                        <p className="text-xs text-zinc-600">Nenhuma conversa ainda</p>
                    ) : (
                        <div className="space-y-0.5 max-h-28 overflow-y-auto">
                            {agentSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => handleSelectSession(session)}
                                    className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-xs group ${currentSession?.id === session.id
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400 hover:bg-zinc-900'
                                        }`}
                                >
                                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate flex-1 text-left">{session.title}</span>
                                    <button
                                        onClick={(e) => handleDeleteSession(session.id, e)}
                                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-zinc-400">{selectedAgent.name}</p>
                                <p className="text-xs text-zinc-600 mt-1">{selectedAgent.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx}>
                                    <p className="text-[10px] text-zinc-500 mb-1">
                                        {msg.role === 'assistant' ? selectedAgent.name : 'Você'}
                                    </p>
                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'text-zinc-300' : 'text-white'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Pensando...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <select
                            value={currentModel}
                            onChange={(e) => setCurrentModel(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-zinc-400 text-xs rounded px-2 py-1"
                        >
                            {MODEL_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Mensagem..."
                            className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 text-sm"
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            variant="ghost"
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
