
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/constants";

// UI Components
import AdminLayout from "@/components/layout/AdminLayout";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Plus, Search, FileText, ExternalLink, Copy, Trash2, Edit2,
    Folder, ChevronRight, ChevronDown, Rocket, CheckCircle2, Clock,
    MoreHorizontal, Filter
} from "lucide-react";

// Types
interface Proposal {
    id: string;
    created_at: string;
    title: string;
    client_name: string;
    client_logo?: string;
    client_email?: string;
    slug: string;
    status: string;
    // Add other fields as needed
}

const AdminProposals = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [openClients, setOpenClients] = useState<Record<string, boolean>>({});

    const { data: proposals, isLoading, refetch } = useQuery({
        queryKey: ["admin-proposals"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("proposals")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as unknown as Proposal[];
        },
    });

    // Actions
    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta proposta?")) return;
        try {
            const { error } = await supabase.from("proposals").delete().eq("id", id);
            if (error) throw error;
            toast.success("Proposta excluída com sucesso");
            refetch();
        } catch (error) {
            toast.error("Erro ao excluir proposta");
        }
    };

    const handleCopyLink = (slug: string) => {
        const url = `${window.location.origin}/p/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
    };

    const toggleClient = (clientName: string) => {
        setOpenClients(prev => ({ ...prev, [clientName]: !prev[clientName] }));
    };

    const handleDeleteClient = async (clientName: string) => {
        if (!confirm(`Tem certeza que deseja excluir TODAS as propostas de "${clientName}"? Esta ação não pode ser desfeita.`)) return;
        try {
            const { error } = await supabase.from("proposals").delete().eq("client_name", clientName);
            if (error) throw error;
            toast.success(`Cliente "${clientName}" excluído com sucesso`);
            refetch();
        } catch (error) {
            toast.error("Erro ao excluir cliente");
        }
    };

    const handleRenameClient = async (oldName: string) => {
        const newName = prompt("Novo nome do cliente:", oldName);
        if (!newName || newName === oldName) return;
        try {
            const { error } = await supabase.from("proposals").update({ client_name: newName }).eq("client_name", oldName);
            if (error) throw error;
            toast.success(`Cliente renomeado para "${newName}"`);
            refetch();
        } catch (error) {
            toast.error("Erro ao renomear cliente");
        }
    };

    // Stats & Grouping
    const groupedProposals = useMemo(() => {
        if (!proposals) return {};
        const filtered = proposals.filter((proposal) =>
            (proposal.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (proposal.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        return filtered.reduce((acc, proposal) => {
            const client = proposal.client_name || "Sem Cliente";
            if (!acc[client]) acc[client] = [];
            acc[client].push(proposal);
            return acc;
        }, {} as Record<string, typeof proposals>);
    }, [proposals, searchTerm]);

    const stats = useMemo(() => {
        if (!proposals) return { total: 0, approved: 0, active: 0 };
        return {
            total: proposals.length,
            approved: proposals.filter(p => p.status === 'approved').length,
            active: proposals.filter(p => p.status !== 'approved').length
        };
    }, [proposals]);

    return (
        <AdminLayout>
            <AdminPageLayout
                title="Centro de Propostas"
                description="Gerencie, crie e acompanhe propostas comerciais conectadas ao diagnóstico."
                backTo="/admin"
                maxWidth="7xl"
                actions={
                    <Button
                        onClick={() => navigate("/admin/proposals/new")}
                        className="bg-black text-white hover:bg-zinc-800 text-label h-10 px-6 rounded-none no-print shadow-none min-w-0"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        NOVA PROPOSTA
                    </Button>
                }
            >
                {/* 1. Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-200 bg-white mb-10 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                    <div className="p-6 flex items-start justify-between group hover:bg-zinc-50 transition-colors">
                        <div>
                            <p className="text-label text-zinc-400 mb-2">TOTAL PROPOSTAS</p>
                            <h3 className="text-3xl font-black text-zinc-900 tabular-nums">{stats.total}</h3>
                        </div>
                        <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center border border-zinc-200 group-hover:border-zinc-300">
                            <Rocket className="w-4 h-4 text-zinc-500" />
                        </div>
                    </div>
                    <div className="p-6 flex items-start justify-between group hover:bg-zinc-50 transition-colors">
                        <div>
                            <p className="text-label text-zinc-400 mb-2">STATUS: APPROVED</p>
                            <h3 className="text-3xl font-black text-[#00CC6A] tabular-nums">{stats.approved}</h3>
                        </div>
                        <div className="w-8 h-8 bg-[#00CC6A]/10 flex items-center justify-center border border-[#00CC6A]/20">
                            <CheckCircle2 className="w-4 h-4 text-[#00CC6A]" />
                        </div>
                    </div>
                    <div className="p-6 flex items-start justify-between group hover:bg-zinc-50 transition-colors">
                        <div>
                            <p className="text-label text-zinc-400 mb-2">IN NEGOTIATION</p>
                            <h3 className="text-3xl font-black text-zinc-900 tabular-nums">{stats.active}</h3>
                        </div>
                        <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center border border-zinc-200 group-hover:border-zinc-300">
                            <Clock className="w-4 h-4 text-zinc-500" />
                        </div>
                    </div>
                </div>

                {/* 2. Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 no-print">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar por cliente, título ou tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pl-12 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-label transition-none shadow-none"
                        />
                    </div>
                    {/* Add Filter Buttons if needed later */}
                </div>

                {/* 3. Proposals List (Grouped by Client) */}
                <div className="space-y-6 min-h-[500px]">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <div className="w-10 h-10 border-4 border-zinc-200 border-t-black animate-spin mx-auto mb-4"></div>
                            <p className="text-zinc-400 text-xs uppercase tracking-widest">Carregando Hub...</p>
                        </div>
                    ) : Object.keys(groupedProposals).length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-zinc-200 bg-zinc-50/50">
                            <p className="text-zinc-400 text-sm">Nenhuma proposta encontrada.</p>
                        </div>
                    ) : (
                        Object.entries(groupedProposals).map(([clientName, clientProposals]) => (
                            <Collapsible
                                key={clientName}
                                open={openClients[clientName]}
                                onOpenChange={() => toggleClient(clientName)}
                                className="bg-white border border-zinc-200 shadow-sm transition-all group overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 cursor-pointer bg-white group-hover:bg-zinc-50/50 transition-colors" onClick={() => toggleClient(clientName)}>
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-500 font-bold text-lg rounded-none group-hover:bg-black group-hover:text-white transition-colors">
                                            {clientName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-black tracking-tight uppercase">{clientName}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="inline-flex items-center text-label text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 h-5 tabular-nums">
                                                    [{clientProposals.length} PROPOSTAS]
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 no-print">
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleRenameClient(clientName); }}
                                                className="h-8 w-8 hover:bg-zinc-200 rounded-none"
                                                title="Renomear"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClient(clientName); }}
                                                className="h-8 w-8 hover:bg-zinc-100 hover:text-zinc-900 rounded-none"
                                                title="Excluir Cliente"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-none">
                                                {openClients[clientName] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </div>

                                <CollapsibleContent>
                                    <div className="border-t border-zinc-100 bg-zinc-50/30">
                                        {clientProposals.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 pl-[88px] hover:bg-white border-b border-zinc-100 last:border-0 transition-colors group/item">
                                                <div className="flex items-center gap-4">
                                                    <FileText className="w-4 h-4 text-zinc-400 group-hover/item:text-black transition-colors" />
                                                    <div>
                                                        <p className="font-semibold text-sm text-zinc-900">{item.title || "Sem Título"}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-label text-zinc-400 lowercase">
                                                                created()_ {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                            </span>
                                                            <span className={`text-label ${item.status === 'approved' ? 'text-[#00CC6A]' :
                                                                item.status === 'sent' ? 'text-zinc-900 border border-zinc-200 px-1' : 'text-zinc-400 border border-zinc-200 px-1 pb-0.5'
                                                                }`}>
                                                                {item.status === 'approved' ? 'APPROVED' :
                                                                    item.status === 'sent' ? 'SENT' : 'DRAFT'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity no-print pr-4">
                                                    {/* Handoff Trigger */}
                                                    {item.status === 'approved' && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('/admin/rei/novo', {
                                                                    state: {
                                                                        handoffData: {
                                                                            client_name: item.client_name,
                                                                            client_email: item.client_email,
                                                                            proposal_id: item.id
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="h-8 text-xxs uppercase font-bold tracking-wider rounded-sm bg-black hover:bg-zinc-800 text-white mr-2"
                                                            title="Passar Bastão para CS"
                                                        >
                                                            <Rocket className="w-3 h-3 mr-2 text-[#00CC6A]" />
                                                            Passar Bastão
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/admin/proposals/edit/${item.id}`); }} className="h-8 text-xxs uppercase font-bold tracking-wider rounded-none bg-white hover:bg-black hover:text-white border-zinc-200">
                                                        Editar
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCopyLink(item.slug); }} className="h-8 w-8 hover:bg-zinc-200 rounded-none" title="Copiar Link">
                                                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); window.open(`/p/${item.slug}`, '_blank'); }} className="h-8 w-8 hover:bg-zinc-200 rounded-none" title="Visualizar">
                                                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="h-8 w-8 hover:bg-zinc-100 hover:text-zinc-900 rounded-none" title="Excluir">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))
                    )}
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default AdminProposals;
