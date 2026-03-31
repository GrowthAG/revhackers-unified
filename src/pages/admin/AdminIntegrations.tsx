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
    const [googleConnected, setGoogleConnected] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        checkIntegrations();
        handleAuthCallback();
    }, []);

    const checkIntegrations = async () => {
        const { data, error } = await supabase
            .from('integrations')
            .select('*')
            .eq('provider', 'google')
            .maybeSingle();

        if (data) {
            setGoogleConnected(true);
            setConnectedEmail(data.metadata?.email);
        } else {
            setGoogleConnected(false);
            setConnectedEmail(null);
        }
    };

    const handleAuthCallback = async () => {
        const code = searchParams.get('code');
        if (!code) return;

        setLoading(true);
        const toastId = toast.loading("Finalizando conexão com Google...");

        try {
            const redirectUrl = window.location.origin + window.location.pathname;
            const { data, error } = await supabase.functions.invoke('google-auth', {
                body: { action: 'exchange', code, redirectUrl }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            toast.success(`Google conectado com sucesso: ${data.email}`, { id: toastId });
            setGoogleConnected(true);
            setConnectedEmail(data.email);

            // Clean URL
            setSearchParams({});
        } catch (error: any) {
            console.error(error);
            toast.error("Erro na autorização: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGoogle = async () => {
        setLoading(true);
        try {
            const redirectUrl = window.location.origin + window.location.pathname;
            const { data, error } = await supabase.functions.invoke('google-auth', {
                body: { action: 'authorize', redirectUrl }
            });

            if (error) throw error;
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast.error("Erro ao iniciar integração: " + error.message);
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Tem certeza que deseja desconectar o Google Workspace?")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('integrations')
                .delete()
                .eq('provider', 'google');

            if (error) throw error;

            setGoogleConnected(false);
            setConnectedEmail(null);
            toast.success("Google desconectado");
        } catch (error: any) {
            toast.error("Erro ao desconectar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#F8F9FA] p-8 pb-32">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 border border-zinc-200 shadow-sm">
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
                        <div className="flex items-center gap-4 bg-zinc-50 px-5 py-3 border border-zinc-100">
                            <div className="text-right">
                                <p className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Status Global</p>
                                <p className="text-sm font-bold text-zinc-900">Sistemas Operacionais</p>
                            </div>
                            <div className="h-10 w-10 bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                                <Activity className="text-[#00CC6A]" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Google Workspace */}
                        <div className={cn(
                            "group relative bg-white border transition-all duration-300 overflow-hidden",
                            googleConnected ? "border-[#00CC6A]/30" : "border-zinc-200"
                        )}>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-zinc-50 group-hover:scale-110 transition-transform duration-300">
                                        <Database className={googleConnected ? "text-[#00CC6A]" : "text-zinc-400"} size={24} />
                                    </div>
                                    {googleConnected ? (
                                        <Badge variant="outline" className="bg-[#00CC6A]/10 text-[#00CC6A] border-[#00CC6A]/20 px-3 py-1 font-bold">
                                            CONECTADO
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-zinc-50 text-zinc-400 border-zinc-200 px-3 py-1 font-bold">
                                            DISPONÍVEL
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-900">Google Workspace</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Sincronize reuniões, agendas e ativos. As transcrições e documentos são indexados para análise avançada via IA.
                                    </p>
                                </div>

                                {googleConnected && (
                                    <div className="bg-zinc-50 p-4 border border-zinc-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#00CC6A]/10 flex items-center justify-center">
                                                <ShieldCheck className="text-[#00CC6A]" size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xxs font-bold text-zinc-400 uppercase">Conta Principal</p>
                                                <p className="text-sm font-bold text-zinc-900 truncate">{connectedEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 pt-2">
                                    <p className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Recursos Ativos</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Sincronização de Agenda", active: googleConnected },
                                            { label: "Inteligência de Meet", active: googleConnected },
                                            { label: "Indexação de Drive", active: googleConnected },
                                            { label: "Camada de Segurança 2", active: googleConnected }
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={cn("w-1 h-1 ", f.active ? "bg-[#00CC6A]" : "bg-zinc-200")} />
                                                <span className={cn("text-tiny font-medium", f.active ? "text-zinc-700" : "text-zinc-400")}>{f.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 mt-auto">
                                    {googleConnected ? (
                                        <Button
                                            onClick={handleDisconnect}
                                            disabled={loading}
                                            variant="outline"
                                            className="w-full h-12 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all font-bold"
                                        >
                                            Desconectar Integração
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleConnectGoogle}
                                            disabled={loading}
                                            className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-bold shadow-sm"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Autorizar Conexão"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* GoHighLevel Multi-Tenant */}
                        <div className="group relative bg-[#1853ea] border border-[#1853ea] transition-all duration-300 overflow-hidden text-white flex flex-col justify-between">
                            <div className="p-8 space-y-6 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                                        <Server className="text-white" size={24} />
                                    </div>
                                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-1 font-bold">
                                        INFRAESTRUTURA
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">GoHighLevel Subcontas</h3>
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        Nó central de roteamento Multi-Tenant. Centralize as Location IDs e URLs de webhook de todas as subcontas (Agência e Clientes) para isolamento de dados das automações.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={() => window.location.href = '/admin/integrations/ghl'}
                                        variant="outline"
                                        className="w-full h-12 border-white/20 text-white hover:text-black hover:bg-white transition-all font-bold bg-transparent"
                                    >
                                        Gerenciar Configurações
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-zinc-900 p-8 space-y-6 flex flex-col justify-center text-white md:col-span-2">
                            <div className="space-y-3">
                                <div className="h-10 w-10 bg-white/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="text-[#00CC6A]" size={20} />
                                </div>
                                <h3 className="text-xl font-bold">Seguranca de Dados</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Nossas integrações utilizam criptografia de ponta a ponta e os protocolos OAuth2 mais rigorosos do mercado. Seus dados nunca são armazenados sem autorização explícita.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-center">
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
