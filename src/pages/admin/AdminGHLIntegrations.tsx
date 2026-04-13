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
import { getAllReiProjects } from "@/api/reiProjects";

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
        const toastId = toast.loading("Finalizando Handshake com Funnels...");

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
            const projects = await getAllReiProjects();
            
            const activeOrgIds = new Set(
                projects
                    .filter(p => p.status !== 'lead' && p.status !== 'diagnostic')
                    .map(p => p.organization_id)
            );
            
            const filteredOrgs = orgs.filter(org => org.is_master || activeOrgIds.has(org.id));
            setOrganizations(filteredOrgs);
            
            // Map the initial state for edits
            const initialEdits: Record<string, any> = {};
            filteredOrgs.forEach(org => {
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
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 border-2 border-zinc-200">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => navigate('/admin/integrations')}
                                    className="p-0 h-auto hover:bg-transparent text-zinc-400 hover:text-black pr-2 mr-2 rounded-none transition-colors"
                                >
                                    <ChevronLeft size={16} className="mr-1"/> VOLTAR
                                </Button>
                                <span className="h-1.5 w-1.5 bg-[#00CC6A]" />
                                <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">Multi-Tenant Routing</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                                Funnels Sub-Contas
                            </h1>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Mapeie as chaves de API OAuth e URLs de Webhook exclusivas para orquestração e roteamento de cada cliente.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={startOAuthFlow}
                                className="bg-[#00CC6A] text-black hover:bg-black hover:text-white transition-all font-black uppercase text-xs tracking-widest h-12 px-6 rounded-none shadow-none"
                            >
                                <KeyRound size={18} className="mr-2" />
                                AUTORIZAR FUNNELS
                            </Button>
                            <div className="h-12 w-12 bg-black border-2 border-black flex items-center justify-center transition-all cursor-default">
                                <Server className="text-[#00CC6A]" size={20} />
                            </div>
                        </div>
                    </div>

                    {!GHL_CLIENT_ID && (
                        <div className="bg-white border-2 border-dashed border-red-500 p-6 flex items-start gap-4 text-red-900">
                            <div className="bg-red-50 p-2 shrink-0">
                                <AlertCircle className="text-red-500" size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-widest text-red-600">Alerta de Infraestrutura</h4>
                                <p className="text-xs font-bold text-zinc-500 mt-2">
                                    Para ativar o Handshake transparente, sua variável de ambiente <code>VITE_GHL_CLIENT_ID</code> precisa estar configurada.
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
                                        "bg-white border-2 p-6 transition-all",
                                        isMaster ? "border-black" : "border-zinc-200 hover:border-black"
                                    )}>
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                                            
                                            {/* Info Col */}
                                            <div className="w-full lg:w-1/4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={cn("p-2 border-2", isMaster ? "bg-black text-white border-black" : "bg-zinc-50 text-zinc-500 border-zinc-200")}>
                                                        <Building2 size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg text-zinc-900 uppercase tracking-tight">{org.name}</h3>
                                                        <span className="text-xxs font-black text-zinc-400 uppercase tracking-widest">{org.slug}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {isMaster ? (
                                                        <Badge className="bg-black text-[#00CC6A] text-[0.6rem] font-black tracking-widest uppercase rounded-none border-none py-1">
                                                            NÓ MASTER
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-zinc-500 border-2 border-zinc-200 bg-white text-[0.6rem] font-black tracking-widest uppercase rounded-none py-1">
                                                            WORKER
                                                        </Badge>
                                                    )}
                                                    {hasAccessToken ? (
                                                        <Badge className="bg-[#00CC6A] text-black text-[0.6rem] font-black tracking-widest uppercase rounded-none border-none py-1">
                                                            OAUTH ATIVO
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-zinc-100 text-zinc-400 border-none text-[0.6rem] font-black tracking-widest uppercase rounded-none py-1">
                                                            S/ CONEXÃO
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Inputs Col */}
                                            <div className="w-full lg:flex-1 grid grid-cols-1 gap-6 pt-1 lg:pt-0">
                                                <div className="space-y-2">
                                                    <label className="text-[0.65rem] font-black text-zinc-500 uppercase tracking-widest">Location ID (Funnels)</label>
                                                    <Input 
                                                        value={editState.ghl_location_id}
                                                        onChange={(e) => handleChange(org.id, 'ghl_location_id', e.target.value)}
                                                        placeholder="Ex: oFTw9DcsKRU..."
                                                        className="font-mono text-sm bg-zinc-50 border-2 border-zinc-200 focus-visible:ring-black focus-visible:border-black rounded-none"
                                                    />
                                                    <p className="text-[0.65rem] font-bold text-zinc-400">Chave estrutural de orquestração via OAuth.</p>
                                                </div>
                                            </div>

                                            <div className="w-full lg:w-auto pt-6 lg:pt-0 flex flex-col justify-end gap-3 h-full">
                                                <Button 
                                                    onClick={() => handleSave(org.id, org.name)}
                                                    disabled={savingId === org.id}
                                                    className="w-full bg-black text-white hover:bg-[#00CC6A] hover:text-black transition-all font-black uppercase text-[0.65rem] tracking-widest px-8 h-10 mt-auto rounded-none"
                                                >
                                                    {savingId === org.id ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} className="mr-2" /> SALVAR</>}
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
