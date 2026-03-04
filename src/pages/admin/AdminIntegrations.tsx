import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Activity, Settings2, ShieldCheck, Zap, MessageSquare, Database } from "lucide-react";
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-revgreen" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Configurações de Sistema</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                                Integrações
                            </h1>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Gerencie as conexões externas para automação e extração de dados estratégicos.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-zinc-50 px-5 py-3 rounded-2xl border border-zinc-100">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status Global</p>
                                <p className="text-sm font-bold text-zinc-900">Sistemas Operacionais</p>
                            </div>
                            <div className="h-10 w-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center shadow-sm">
                                <Activity className="text-revgreen" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Google Workspace */}
                        <div className={cn(
                            "group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden",
                            googleConnected ? "border-revgreen/30" : "border-zinc-200"
                        )}>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-zinc-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                        <Database className={googleConnected ? "text-revgreen" : "text-zinc-400"} size={24} />
                                    </div>
                                    {googleConnected ? (
                                        <Badge variant="outline" className="bg-revgreen/10 text-revgreen border-revgreen/20 px-3 py-1 font-bold">
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
                                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-revgreen/10 flex items-center justify-center">
                                                <ShieldCheck className="text-revgreen" size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase">Conta Principal</p>
                                                <p className="text-sm font-bold text-zinc-900 truncate">{connectedEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 pt-2">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recursos Ativos</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Sincronização de Agenda", active: googleConnected },
                                            { label: "Inteligência de Meet", active: googleConnected },
                                            { label: "Indexação de Drive", active: googleConnected },
                                            { label: "Camada de Segurança 2", active: googleConnected }
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={cn("w-1 h-1 rounded-full", f.active ? "bg-revgreen" : "bg-zinc-200")} />
                                                <span className={cn("text-[11px] font-medium", f.active ? "text-zinc-700" : "text-zinc-400")}>{f.label}</span>
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
                                            className="w-full h-12 rounded-xl border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 transition-all font-bold"
                                        >
                                            Desconectar Integração
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleConnectGoogle}
                                            disabled={loading}
                                            className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-bold shadow-lg"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Autorizar Conexão"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-zinc-900 rounded-3xl p-8 space-y-6 flex flex-col justify-center text-white">
                            <div className="space-y-3">
                                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                    <ShieldCheck className="text-revgreen" size={20} />
                                </div>
                                <h3 className="text-xl font-bold">Seguranca de Dados</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Nossas integrações utilizam criptografia de ponta a ponta e os protocolos OAuth2 mais rigorosos do mercado. Seus dados nunca são armazenados sem autorização explícita.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-center">
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em]">
                            RevHackers Enterprise Secure Node
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminIntegrations;
