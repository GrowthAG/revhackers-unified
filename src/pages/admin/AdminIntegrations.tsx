import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Activity, Settings2, ShieldCheck, Zap, MessageSquare, Database, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdminIntegrations = () => {
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        handleAuthCallback();
    }, []);

    const handleAuthCallback = async () => {
        const code = searchParams.get('code');
        if (!code) return;

        setLoading(true);
        const toastId = toast.loading("Verificando conexão...");

        try {
            // Se houver callback OAuth, processar aqui (ex: GHL OAuth já pega em outra página, mantido caso algo caia aqui)
            setSearchParams({});
            toast.success("Callback recebido", { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error("Erro: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="h-3 w-3 bg-[#00CC6A] animate-pulse rounded-none" />
                            <div className="text-left border-l-2 border-zinc-900 pl-4">
                                <p className="text-[0.55rem] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Node Status</p>
                                <p className="text-sm font-black text-[#00CC6A] uppercase tracking-widest leading-none">Operacional</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
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
