import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Activity, Settings2, ShieldCheck, Zap, MessageSquare, Database, Server, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface OrphanedDeal {
    opportunity_id: string;
    client_name: string;
    hours_since_won: number;
    reconciliation_status: string;
}

const AdminIntegrations = () => {
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [orphanedDeals, setOrphanedDeals] = useState<OrphanedDeal[]>([]);
    const [reconciling, setReconciling] = useState(false);

    useEffect(() => {
        handleAuthCallback();
        loadOrphanedDeals();
    }, []);

    const handleAuthCallback = async () => {
        const code = searchParams.get('code');
        if (!code) return;

        setLoading(true);
        const toastId = toast.loading("Verificando conexão...");

        try {
            setSearchParams({});
            toast.success("Callback recebido", { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error("Erro: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const loadOrphanedDeals = async () => {
        try {
            const { data, error } = await supabase
                .from('v_orphaned_won_deals' as any)
                .select('opportunity_id, client_name, hours_since_won, reconciliation_status')
                .eq('reconciliation_status', 'ORPHANED')
                .limit(10);
            if (!error && data) {
                setOrphanedDeals(data as unknown as OrphanedDeal[]);
            }
        } catch {
            // View may not exist yet if migration not applied
        }
    };

    const handleReconcile = async () => {
        setReconciling(true);
        const toastId = toast.loading("Reconciliando deals órfãos...");
        try {
            const { data, error } = await supabase.rpc('reconcile_orphaned_won_deals' as any);
            if (error) throw error;
            const results = data as any[];
            const converted = results?.filter((r: any) => r.action_taken?.startsWith('CONVERTED')).length || 0;
            toast.success(`${converted} deal(s) reconciliado(s) com sucesso`, { id: toastId });
            loadOrphanedDeals();
        } catch (error: any) {
            toast.error("Erro na reconciliação: " + error.message, { id: toastId });
        } finally {
            setReconciling(false);
        }
    };

    const hasOrphans = orphanedDeals.length > 0;

    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#F8F9FA] p-8 pb-32">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 border-2 border-zinc-200">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-1.5 w-1.5 bg-[#00CC6A]" />
                                <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">Configurações de Sistema</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                                Integrações
                            </h1>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Gerencie as conexões externas para automação e extração de dados estratégicos.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-black border-2 border-black px-6 py-4">
                            <div className={cn(
                                "h-3 w-3 rounded-none",
                                hasOrphans ? "bg-amber-400 animate-pulse" : "bg-[#00CC6A] animate-pulse"
                            )} />
                            <div className="text-left border-l-2 border-zinc-900 pl-4">
                                <p className="text-[0.55rem] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Node Status</p>
                                <p className={cn(
                                    "text-sm font-black uppercase tracking-widest leading-none",
                                    hasOrphans ? "text-amber-400" : "text-[#00CC6A]"
                                )}>
                                    {hasOrphans ? 'Atenção Necessária' : 'Operacional'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Orphaned Deals Alert */}
                    {hasOrphans && (
                        <div className="bg-amber-50 border-2 border-amber-300 p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-wide">
                                        {orphanedDeals.length} deal(s) sem projeto criado
                                    </h3>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Deals marcados como &quot;won&quot; mas que falharam na conversão automática para projeto.
                                    </p>
                                    <div className="mt-3 space-y-1.5">
                                        {orphanedDeals.slice(0, 5).map((d) => (
                                            <div key={d.opportunity_id} className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-amber-900">{d.client_name}</span>
                                                <span className="font-mono text-amber-600">{d.hours_since_won}h sem projeto</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={handleReconcile}
                                disabled={reconciling}
                                className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[0.65rem] tracking-widest rounded-none border-none"
                            >
                                {reconciling ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                <span className="ml-2">{reconciling ? 'RECONCILIANDO...' : 'CORRIGIR AUTOMATICAMENTE'}</span>
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {/* Funnels Card */}
                        <div className="group relative bg-white border-2 border-zinc-200 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:border-black">
                            <div className="p-8 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-zinc-50 border-2 border-zinc-100 group-hover:scale-110 transition-transform duration-300">
                                        <Server className="text-zinc-900" size={24} />
                                    </div>
                                    <Badge variant="outline" className="bg-zinc-100 text-zinc-600 border-none px-3 py-1 font-black text-[0.65rem] tracking-widest uppercase rounded-none">
                                        INFRAESTRUTURA
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-zinc-900">Funnels Sub-Contas</h3>
                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                        Nó central de infraestrutura. Centralize o roteamento (Location IDs e Webhooks) das máquinas de vendas, orquestrando as automações de todos os clientes a partir de um único ambiente isolado.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={() => window.location.href = '/admin/integrations/ghl'}
                                        variant="outline"
                                        className="w-full h-12 border-2 border-zinc-200 text-zinc-900 hover:text-white hover:bg-black hover:border-black transition-all bg-white font-black uppercase text-[0.65rem] tracking-widest rounded-none"
                                    >
                                        GERENCIAR CONTAS FUNNELS
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="pt-24 text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-zinc-400">
                            <ShieldCheck size={14} />
                            <p className="text-[0.6rem] font-black uppercase tracking-widest">Nós criptografados ponta-a-ponta sob protocolo OAuth2</p>
                        </div>
                        <p className="text-xxs font-bold text-zinc-300 uppercase tracking-[0.4em]">
                            RevHackers Enterprise Secure Node
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminIntegrations;
