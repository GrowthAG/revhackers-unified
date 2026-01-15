import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Cpu, Search, ChevronRight,
    Activity, Terminal, Send, Bot, Sparkles
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
            'gpt-5.2': { label: 'GPT-5.2', color: 'bg-zinc-900 text-white border-zinc-800', provider: 'OpenAI' },
            'gpt-4o': { label: 'GPT-4O', color: 'bg-zinc-100 text-zinc-900 border-zinc-200', provider: 'OpenAI' },
            'gpt-4o-mini': { label: 'GPT-4O MINI', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'OpenAI' },
            'claude-sonnet-4.5': { label: 'CLAUDE SONNET 4.5', color: 'bg-zinc-100 text-zinc-900 border-zinc-200', provider: 'Anthropic' },
            'claude-3-5-haiku-20241022': { label: 'CLAUDE 3.5 HAIKU', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'Anthropic' },
            'sonar-pro': { label: 'PERPLEXITY', color: 'bg-zinc-50 text-zinc-600 border-zinc-100', provider: 'Perplexity' },
        };

        const mLower = m.toLowerCase();
        const found = Object.entries(models).find(([key]) => mLower.includes(key.toLowerCase()));
        return found ? found[1] : { label: m.toUpperCase(), color: 'bg-zinc-50 text-zinc-500 border-zinc-100', provider: 'AI' };
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white pb-20">
                <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
                    {/* Minimalist Header */}
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
                                Central de Inteligência
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium">
                                Gerencie seus especialistas e orquestre operações complexas.
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/admin/agents/builder')}
                            className="bg-black text-white rounded-sm px-6 h-10 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Agente
                        </Button>
                    </div>

                    {/* Main Interaction Area */}
                    <div className="mb-20">
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-100 to-zinc-50 rounded-sm blur opacity-50 group-focus-within:opacity-75 transition duration-500"></div>
                            <div className="relative flex items-center bg-white border border-zinc-200 rounded-sm p-1.5 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 flex items-center justify-center text-zinc-400">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="O que você deseja realizar hoje?"
                                    value={hubQuery}
                                    onChange={(e) => setHubQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && hubQuery.trim()) {
                                            navigate(`/admin/ai-chat?q=${encodeURIComponent(hubQuery.trim())}`);
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none outline-none text-base font-medium text-black placeholder:text-zinc-300 px-2"
                                />
                                <button
                                    onClick={() => {
                                        if (hubQuery.trim()) {
                                            navigate(`/admin/ai-chat?q=${encodeURIComponent(hubQuery.trim())}`);
                                        }
                                    }}
                                    className="bg-zinc-900 text-white w-10 h-10 rounded-sm flex items-center justify-center hover:bg-black transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-50">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-sm animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Ativos</span>
                        </div>

                        <div className="relative group w-64">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 w-3.5 h-3.5 transition-colors group-focus-within:text-black" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filtrar..."
                                className="w-full bg-transparent border-none py-2 pl-6 pr-0 text-sm font-medium text-black outline-none placeholder:text-zinc-300 text-right"
                            />
                        </div>
                    </div>

                    {/* Agents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredAgents.map(agent => {
                            const modelInfo = getModelDisplay(agent.model || '');
                            return (
                                <div
                                    key={agent.id}
                                    onClick={() => navigate(`/admin/ai-chat?agent=${agent.id}`)}
                                    className="group relative bg-white border border-zinc-100 rounded-sm p-5 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 cursor-pointer flex flex-col h-[280px]"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 bg-zinc-50 rounded-sm flex items-center justify-center text-black group-hover:scale-105 transition-transform duration-500 border border-zinc-100/50">
                                            <Bot size={20} className="text-zinc-700" />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/agents/builder/${agent.id}`); }}
                                                className="w-8 h-8 bg-zinc-50 hover:bg-black hover:text-white flex items-center justify-center text-zinc-400 rounded-sm transition-all"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(agent.id, e)}
                                                className="w-8 h-8 bg-zinc-50 hover:bg-red-500 hover:text-white flex items-center justify-center text-zinc-400 rounded-sm transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-col gap-1.5 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${modelInfo.color} border bg-opacity-50`}>
                                                    {modelInfo.label}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-black tracking-tight">{agent.name}</h3>
                                        </div>
                                        <p className="text-zinc-400 text-xs font-medium leading-relaxed line-clamp-3">
                                            {agent.description || "Especialista em inteligência e automação."}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{agent.role || 'AGENT'}</span>
                                        <div className="w-6 h-6 rounded-sm bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-white">
                                            <ChevronRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* New Agent Card (Ghost) */}
                        <div
                            onClick={() => navigate('/admin/agents/builder')}
                            className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-sm p-5 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group h-[280px]"
                        >
                            <div className="w-12 h-12 rounded-sm bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:scale-110 group-hover:text-black transition-all shadow-sm">
                                <Plus size={20} />
                            </div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-black transition-colors">Criar Novo</span>
                        </div>
                    </div>

                    {filteredAgents.length === 0 && (search) && (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 text-sm">Nenhum agente encontrado.</p>
                        </div>
                    )}
                </div>

                {/* Minimalist Footer REMOVED */}
            </div>
        </AdminLayout>
    );
};

export default AdminAgents;
