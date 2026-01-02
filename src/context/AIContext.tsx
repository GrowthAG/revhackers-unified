import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface AgentOption {
    id: string;
    name: string;
    prompt: string;
    role?: string;
    model?: string;
    description?: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface Session {
    id: string;
    agentId: string | null;
    title: string;
    messages: Message[];
    lastMessageAt: Date;
}

type AIContextType = {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    contextType: 'general' | 'article' | 'material' | 'project';
    contextId: string | null;
    setContext: (type: 'general' | 'article' | 'material' | 'project', id?: string | null) => void;

    // Global AI State
    agents: AgentOption[];
    sessions: Session[];
    isLoadingAI: boolean;
    refreshAI: () => Promise<void>;

    // Navigation / Action
    selectedAgentId: string | null;
    setSelectedAgentId: (id: string | null) => void;
    openAgentChat: (agentId: string) => void;
    deleteSession: (sessionId: string) => Promise<void>;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [contextType, setContextType] = useState<'general' | 'article' | 'material' | 'project'>('general');
    const [contextId, setContextId] = useState<string | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

    const [agents, setAgents] = useState<AgentOption[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    const navigate = useNavigate();

    const refreshAI = useCallback(async () => {
        setIsLoadingAI(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load Agents
            const { data: agentsData } = await supabase
                .from('agents')
                .select('id, name, system_prompt, role, model, description')
                .order('created_at', { ascending: false });

            if (agentsData) {
                setAgents(agentsData.map(a => ({
                    id: a.id,
                    name: a.name,
                    prompt: a.system_prompt,
                    role: (a as any).role,
                    model: (a as any).model,
                    description: (a as any).description
                })));
            }

            // Load Sessions
            const { data: sessionsData } = await supabase
                .from('chat_sessions')
                .select('id, agent_id, title, created_at, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (sessionsData) {
                setSessions(sessionsData.map(s => ({
                    id: s.id,
                    agentId: s.agent_id,
                    title: s.title || 'Nova Conversa',
                    messages: [],
                    lastMessageAt: new Date(s.updated_at || s.created_at)
                })));
            }
        } catch (error) {
            console.error('Error refreshing AI context:', error);
        } finally {
            setIsLoadingAI(false);
        }
    }, []);

    const openAgentChat = (agentId: string) => {
        setSelectedAgentId(agentId);
        navigate(`/admin/ai-chat?agent=${agentId}`);
    };

    const deleteSession = async (sessionId: string) => {
        try {
            const { error } = await supabase
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;
            await refreshAI();
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    };

    const setContext = (type: 'general' | 'article' | 'material' | 'project', id: string | null = null) => {
        setContextType(type);
        setContextId(id);
    };

    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;

        if (path.includes('/blog/')) {
            setContextType('article');
            setContextId(path.split('/blog/')[1]);
        } else if (path.includes('/materiais/')) {
            setContextType('material');
            setContextId(path.split('/materiais/')[1]);
        } else if (path.includes('/admin/jornada/')) {
            setContextType('project');
            setContextId(path.split('/admin/jornada/')[1]);
        } else {
            setContextType('general');
            setContextId(null);
        }
    }, [location.pathname]);

    // Perform initial fetch
    useEffect(() => {
        refreshAI();
    }, [refreshAI]);

    return (
        <AIContext.Provider value={{
            isSidebarOpen,
            toggleSidebar,
            openSidebar,
            closeSidebar,
            contextType,
            contextId,
            setContext,
            agents,
            sessions,
            isLoadingAI,
            refreshAI,
            selectedAgentId,
            setSelectedAgentId,
            openAgentChat,
            deleteSession
        }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
