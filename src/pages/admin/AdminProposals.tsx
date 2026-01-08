
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, ExternalLink, Copy, Trash2, Edit2, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            return data;
        },
    });

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta página?")) return;

        try {
            const { error } = await supabase.from("proposals").delete().eq("id", id);
            if (error) throw error;
            toast.success("Página excluída com sucesso");
            refetch();
        } catch (error) {
            toast.error("Erro ao excluir página");
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

    const groupedProposals = useMemo(() => {
        if (!proposals) return {};

        const filtered = proposals.filter((proposal) =>
            proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.reduce((acc, proposal) => {
            const client = proposal.client_name || "Sem Cliente";
            if (!acc[client]) acc[client] = [];
            acc[client].push(proposal);
            return acc;
        }, {} as Record<string, typeof proposals>);
    }, [proposals, searchTerm]);

    return (
        <AdminLayout>
            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Centro de Propostas</h1>
                        <p className="text-zinc-500 mt-2">Crie propostas comerciais conectadas ao tl;dv.</p>
                    </div>
                    <Button
                        onClick={() => navigate("/admin/proposals/new")}
                        className="bg-[#03FC3B] text-black hover:bg-[#02e635] font-bold rounded-full px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Proposta
                    </Button>
                </div>

                <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Buscar por cliente, título ou tipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white border-zinc-200"
                            />
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {isLoading ? (
                            <div className="text-center text-zinc-500 py-12">Carregando Hub...</div>
                        ) : Object.keys(groupedProposals).length === 0 ? (
                            <div className="text-center text-zinc-500 py-12">Nenhum registro encontrado.</div>
                        ) : (
                            Object.entries(groupedProposals).map(([clientName, clientProposals]) => (
                                <Collapsible
                                    key={clientName}
                                    open={openClients[clientName]}
                                    onOpenChange={() => toggleClient(clientName)}
                                    className="border border-zinc-100 rounded-xl bg-white shadow-sm overflow-hidden"
                                >
                                    <div className="flex items-center justify-between p-4 bg-zinc-50/30 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => toggleClient(clientName)}>
                                        <div className="flex items-center gap-3">
                                            {clientProposals[0].client_logo ? (
                                                <img src={clientProposals[0].client_logo} alt={clientName} className="w-8 h-8 rounded object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-zinc-200 flex items-center justify-center">
                                                    <Folder className="w-4 h-4 text-zinc-500" />
                                                </div>
                                            )}
                                            <span className="font-semibold text-lg text-zinc-900">{clientName}</span>
                                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 rounded-full px-2">
                                                {clientProposals.length} items
                                            </Badge>
                                        </div>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                                                {openClients[clientName] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>

                                    <CollapsibleContent>
                                        <div className="p-2 space-y-2 bg-white">
                                            {clientProposals.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 ml-11 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 rounded-md bg-indigo-50 text-indigo-600">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-zinc-800">{item.title}</span>
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wide">
                                                                    Proposta
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                                                                <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                                                                <span>•</span>
                                                                <span className={`
                                                                    ${item.status === 'approved' ? 'text-green-600' :
                                                                        item.status === 'sent' ? 'text-blue-600' : 'text-zinc-500'}
                                                                `}>
                                                                    {item.status === 'approved' ? 'Aprovado' :
                                                                        item.status === 'sent' ? 'Enviado' : 'Rascunho'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCopyLink(item.slug); }}>
                                                            <Copy className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); window.open(`/p/${item.slug}`, '_blank'); }}>
                                                            <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/admin/proposals/edit/${item.id}`); }}>
                                                            <Edit2 className="w-4 h-4 text-zinc-400 hover:text-zinc-900" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="hover:bg-red-50 hover:text-red-500">
                                                            <Trash2 className="w-4 h-4 text-zinc-400" />
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
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProposals;
