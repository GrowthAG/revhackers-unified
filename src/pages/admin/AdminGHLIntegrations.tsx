import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Server, Save, ChevronLeft, Building2, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getAllOrganizations, updateOrganizationSettings, type Organization } from "@/api/organizations";

const GHL_CLIENT_ID = import.meta.env.VITE_GHL_CLIENT_ID || "";
const GHL_SCOPES = "opportunities.readonly opportunities.write contacts.readonly contacts.write locations.readonly locations/customValues.readonly locations/customValues.write users.readonly";

const AdminGHLIntegrations = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Estado local para edicao (id -> changes)
    const [edits, setEdits] = useState<Record<string, { ghl_location_id: string; rei: string; contact: string }>>({});

    useEffect(() => {
        handleOAuthCallback().then(() => {
            loadData();
        });
    }, []);

    const handleOAuthCallback = async () => {
        const code = searchParams.get('code');
        if (!code) return;

        setLoading(true);
        const toastId = toast.loading("Finalizando Handshake com a HighLevel...");

        try {
            const redirectUri = window.location.origin + window.location.pathname;
            const { data, error } = await supabase.functions.invoke('ghl-oauth-callback', {
                body: { code, redirect_uri: redirectUri }
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            toast.success(data?.message || "Subconta autorizada com sucesso na V2!", { id: toastId });
            
            // Clean URL
            setSearchParams({});
        } catch (err: any) {
            console.error(err);
            toast.error("Falha no Handshake OAuth: " + err.message, { id: toastId, duration: 10000 });
            setSearchParams({});
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const orgs = await getAllOrganizations();
            setOrganizations(orgs);
            
            // Map the initial state for edits
            const initialEdits: Record<string, any> = {};
            orgs.forEach(org => {
                const settings = org.settings || {};
                const hooks = settings.ghl_webhooks || {};
                initialEdits[org.id] = {
                    ghl_location_id: settings.ghl_location_id || "",
                    rei: hooks.rei || "",
                    contact: hooks.contact || ""
                };
            });
            setEdits(initialEdits);
        } catch (error) {
            toast.error("Erro ao carregar as organizações.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (orgId: string, orgName: string) => {
        const data = edits[orgId];
        if (!data) return;

        setSavingId(orgId);
        try {
            const newSettings = {
                ghl_location_id: data.ghl_location_id.trim(),
                ghl_webhooks: {
                    rei: data.rei.trim(),
                    contact: data.contact.trim()
                }
            };
            // O update mantém as configurações antigas (incluindo access_token) pois a api/organizations faz o merge
            await updateOrganizationSettings(orgId, newSettings);
            toast.success(`Configurações de ${orgName} salvas!`);
        } catch (error) {
            toast.error(`Falha ao salvar configurações de ${orgName}.`);
        } finally {
            setSavingId(null);
        }
    };

    const handleChange = (orgId: string, field: 'ghl_location_id' | 'rei' | 'contact', value: string) => {
        setEdits(prev => ({
            ...prev,
            [orgId]: {
                ...prev[orgId],
                [field]: value
            }
        }));
    };

    const startOAuthFlow = () => {
        if (!GHL_CLIENT_ID) {
            toast.error("GHL_CLIENT_ID não está configurado nas globais de ambiente (.env).");
            return;
        }
        const redirectUri = window.location.origin + window.location.pathname;
        const oauthUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${GHL_CLIENT_ID}&scope=${encodeURIComponent(GHL_SCOPES)}`;
        window.location.href = oauthUrl;
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#F8F9FA] p-8 pb-32">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 border border-zinc-200 shadow-sm">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => navigate('/admin/integrations')}
                                    className="p-0 h-auto hover:bg-transparent text-zinc-400 hover:text-zinc-900 pr-2 border-r border-zinc-200 mr-2 rounded-none"
                                >
                                    <ChevronLeft size={16} className="mr-1"/> Voltar
                                </Button>
                                <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">Multi-Tenant Routing</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                                GoHighLevel Subcontas
                            </h1>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Mapeie as chaves de API OAuth e URLs de Webhook exclusivas para o roteamento isolado de cada cliente.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={startOAuthFlow}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 shadow-md shadow-blue-600/20"
                            >
                                <KeyRound size={18} className="mr-2" />
                                Autorizar Nova Subconta (V2)
                            </Button>
                            <div className="h-16 w-16 bg-blue-600 border border-blue-700 flex items-center justify-center shadow-lg transform rotate-3 ml-4">
                                <Server className="text-white" size={28} />
                            </div>
                        </div>
                    </div>

                    {!GHL_CLIENT_ID && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-4 text-amber-900">
                            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-sm">Falta a Variável VITE_GHL_CLIENT_ID</h4>
                                <p className="text-sm mt-1">
                                    Para o painel roubar os tokens automaticamente e usar o fluxo OAuth V2, cole o <strong>Client ID</strong> gerado pelo GHL no seu arquivo <code>.env</code> do servidor.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-zinc-300" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {organizations.map((org) => {
                                const editState = edits[org.id] || { ghl_location_id: '', rei: '', contact: '' };
                                const isMaster = org.is_master;
                                const hasAccessToken = !!org.settings?.access_token;

                                return (
                                    <div key={org.id} className={cn(
                                        "bg-white border p-6 transition-all",
                                        isMaster ? "border-blue-600 shadow-sm" : "border-zinc-200 hover:border-zinc-300"
                                    )}>
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                                            
                                            {/* Info Col */}
                                            <div className="w-full lg:w-1/4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={cn("p-2", isMaster ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600")}>
                                                        <Building2 size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-zinc-900 uppercase tracking-tight">{org.name}</h3>
                                                        <span className="text-xs text-zinc-500 font-mono">{org.slug}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {isMaster ? (
                                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xxs tracking-widest uppercase">
                                                            Agência Master
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-zinc-500 text-xxs tracking-widest uppercase">
                                                            Cliente Filha
                                                        </Badge>
                                                    )}
                                                    {hasAccessToken ? (
                                                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xxs tracking-widest uppercase font-bold">
                                                            ✅ OAuth V2 Ativo
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-zinc-50 text-zinc-400 border-zinc-200 text-xxs tracking-widest uppercase">
                                                            ❌ Sem Token V2
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Inputs Col */}
                                            <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1 lg:pt-0">
                                                <div className="space-y-2">
                                                    <label className="text-xxs font-bold text-zinc-500 uppercase tracking-wider">Location ID (GHL)</label>
                                                    <Input 
                                                        value={editState.ghl_location_id}
                                                        onChange={(e) => handleChange(org.id, 'ghl_location_id', e.target.value)}
                                                        placeholder="Ex: oFTw9DcsKRU..."
                                                        className="font-mono text-sm bg-zinc-50 border-zinc-200 focus-visible:ring-black"
                                                    />
                                                    <p className="text-tiny text-zinc-400">Deve ser exato para rotear Oauth.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xxs font-bold text-zinc-500 uppercase tracking-wider">Webhook Inbound Geral</label>
                                                    <Input 
                                                        value={editState.contact}
                                                        onChange={(e) => handleChange(org.id, 'contact', e.target.value)}
                                                        placeholder="https://services.leadconnectorhq.com/hooks/..."
                                                        className="text-xs bg-zinc-50 border-zinc-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xxs font-bold text-zinc-500 uppercase tracking-wider">Webhook de Diagnósticos</label>
                                                    <Input 
                                                        value={editState.rei}
                                                        onChange={(e) => handleChange(org.id, 'rei', e.target.value)}
                                                        placeholder="https://services.leadconnectorhq.com/hooks/..."
                                                        className="text-xs bg-zinc-50 border-zinc-200"
                                                    />
                                                </div>
                                            </div>

                                            {/* Actions Col */}
                                            <div className="w-full lg:w-auto pt-6 lg:pt-0 flex flex-col gap-3">
                                                <Button 
                                                    onClick={() => handleSave(org.id, org.name)}
                                                    disabled={savingId === org.id}
                                                    className="w-full bg-black text-white hover:bg-zinc-800 font-bold px-8 h-12"
                                                >
                                                    {savingId === org.id ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} className="mr-2" /> Salvar</>}
                                                </Button>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminGHLIntegrations;
