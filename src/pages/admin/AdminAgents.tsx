import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Cpu, Search, ChevronRight,
    Activity, Terminal, Send, Bot
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAI } from '@/context/AIContext';

const AdminAgents = () => {
    const navigate = useNavigate();
    const { agents, refreshAI } = useAI();
    const [search, setSearch] = useState('');
    const [hubQuery, setHubQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.querySelector<HTMLInputElement>('input[placeholder*="Pesquisar"]')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este agente?')) {
            try {
                const { error } = await supabase
                    .from('agents')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                toast.success('Agente excluído com sucesso');
                refreshAI();
            } catch (error: any) {
                console.error('Error deleting agent:', error);
                toast.error(error.message || 'Erro ao excluir agente');
            }
        }
    };

    const filteredAgents = (agents || []).filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.role || '').toLowerCase().includes(search.toLowerCase())
    );

    const getModelDisplay = (m: string) => {
        const models: Record<string, { label: string; color: string; provider: string }> = {
            'gpt-4o': { label: 'GPT-4o', color: 'bg-zinc-100 text-zinc-900 border-zinc-200', provider: 'OpenAI' },
            'gpt-4o-mini': { label: '4o Mini', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'OpenAI' },
            'claude-3-5-sonnet-20240620': { label: '3.5 Sonnet', color: 'bg-zinc-100 text-zinc-900 border-zinc-200', provider: 'Anthropic' },
            'claude-3-opus-20240229': { label: 'Opus', color: 'bg-zinc-100 text-zinc-900 border-zinc-200', provider: 'Anthropic' },
            'claude-3-5-haiku-20241022': { label: 'Haiku', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'Anthropic' },
            'gemini-1.5-pro': { label: '1.5 Pro', color: 'bg-zinc-100 text-zinc-900 border-zinc-200', provider: 'Google' },
            'gemini-1.5-flash': { label: 'Flash', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'Google' },
            'manus': { label: 'Manus', color: 'bg-zinc-900 text-white border-zinc-800', provider: 'AGENT' },
            'perplexity-sonar': { label: 'Sonar', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'WEB' },
        };

        const found = Object.entries(models).find(([key]) => m.toLowerCase().includes(key.toLowerCase()));
        return found ? found[1] : { label: m.toUpperCase(), color: 'bg-zinc-50 text-zinc-500 border-zinc-100', provider: 'AI' };
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white pb-20">
                {/* Header Section */}
                <div className="max-w-5xl mx-auto px-6 pt-20 pb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-40">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Intelligence</span>
                                <span className="text-zinc-300">/</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Hub</span>
                            </div>
                            <h1 className="text-4xl font-black text-black tracking-tighter">
                                Central de Inteligência
                            </h1>
                        </div>
                        <Button
                            onClick={() => navigate('/admin/agents/builder')}
                            className="bg-black text-white px-6 h-12 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 group shrink-0 text-sm shadow-lg shadow-black/10"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            Novo Agente
                        </Button>
                    </div>

                    <div className="mb-24 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">
                            Central de Inteligência
                        </h1>
                        <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
                            Orcestre sua frota de agentes especialistas e escale suas operações com precisão e inteligência avançada.
                        </p>

                        <div className="max-w-3xl mx-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-[32px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                            <div className="relative flex items-center bg-white border border-zinc-200 rounded-[28px] p-2 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="w-12 h-12 flex items-center justify-center text-zinc-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Qual seu objetivo hoje? Ex: Criar estratégia de Growth..."
                                    value={hubQuery}
                                    onChange={(e) => setHubQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && hubQuery.trim()) {
                                            navigate(`/admin/ai-chat?q=${encodeURIComponent(hubQuery.trim())}`);
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-black placeholder:text-zinc-300 px-2"
                                />
                                <button
                                    onClick={() => {
                                        if (hubQuery.trim()) {
                                            navigate(`/admin/ai-chat?q=${encodeURIComponent(hubQuery.trim())}`);
                                        }
                                    }}
                                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
                                >
                                    Iniciar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-12 pb-6 border-b border-zinc-100">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                            Especialistas Disponíveis
                        </h2>
                        <div className="relative group w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 transition-colors group-focus-within:text-black" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar Agente..."
                                className="w-full bg-zinc-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-black outline-none focus:bg-zinc-100 transition-all placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    {/* Agents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map(agent => {
                            const modelInfo = getModelDisplay(agent.model || '');
                            return (
                                <div
                                    key={agent.id}
                                    className="group relative bg-white border border-zinc-100 rounded-[24px] p-6 hover:border-zinc-200 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-500">
                                            <Bot size={28} />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/agents/builder/${agent.id}`); }}
                                                className="w-8 h-8 bg-white hover:bg-black hover:text-white flex items-center justify-center text-zinc-400 rounded-full transition-all border border-zinc-100 hover:border-black"
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(agent.id, e)}
                                                className="w-8 h-8 bg-white hover:bg-red-600 hover:text-white flex items-center justify-center text-zinc-400 rounded-full transition-all border border-zinc-100 hover:border-red-600"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1" onClick={() => navigate(`/admin/ai-chat?agent=${agent.id}`)}>
                                        <div className="flex flex-col gap-1 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{agent.model || 'GPT-4o'}</span>
                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">v2.4</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-black tracking-tight">{agent.name}</h3>
                                        </div>
                                        <p className="text-zinc-500 text-[13px] font-medium leading-relaxed line-clamp-3">
                                            {agent.description || "Agente especializado em fluxos estratégicos e automação inteligente."}
                                        </p>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-6" onClick={() => navigate(`/admin/ai-chat?agent=${agent.id}`)}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{agent.role || 'EXPERT'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-black font-bold text-[13px] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            Acessar <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredAgents.length === 0 && (search || agents.length === 0) && (
                        <div className="py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <Bot className="w-10 h-10 text-zinc-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-black tracking-tight mb-2">
                                {search ? `Nenhum agente para "${search}"` : "Frota de Inteligência"}
                            </h3>
                            <p className="text-zinc-500 text-sm font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                                {search ? "Não encontramos correspondências para sua busca técnica." : "Comece orchestrando sua frota de agentes para automatizar e escalar suas operações."}
                            </p>
                            {search ? (
                                <button onClick={() => setSearch('')} className="bg-zinc-100 text-black px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">
                                    Limpar Filtros
                                </button>
                            ) : (
                                <Button
                                    onClick={() => navigate('/admin/agents/builder')}
                                    className="bg-black text-white px-8 h-12 rounded-full font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                                >
                                    Criar Primeiro Agente
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Minimalist Footer */}
                <div className="mt-20 text-center opacity-20 hover:opacity-100 transition-opacity">
                    <p className="text-black font-bold text-[8px] uppercase tracking-[0.5em]">System v2.0 &bull; RevHackers Hub</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAgents;
