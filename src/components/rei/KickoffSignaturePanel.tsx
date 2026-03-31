import React, { useState, useEffect } from "react";
import { CheckCircle2, QrCode, ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Confetti from "react-confetti";
import { supabase } from "@/integrations/supabase/client";
import { ReiProject, updateReiProject } from "@/api/reiProjects";
import { toast } from "sonner";

interface KickoffSignaturePanelProps {
    project: ReiProject;
    onUpdate: () => void;
}

export const KickoffSignaturePanel: React.FC<KickoffSignaturePanelProps> = ({ project, onUpdate }) => {
    const oppData = (project.opportunity_data as any) || {};
    
    // Dynamic Route for Native Signature Component
    const signLink = `${window.location.origin}/public/kickoff/${project.id}`;

    const [isSigned, setIsSigned] = useState(oppData.kickoff_signed || false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Config State
    const existingConfig = oppData.contract_config || null;
    const [isConfiguring, setIsConfiguring] = useState(!existingConfig);
    const [contractSource, setContractSource] = useState<'native' | 'external'>(existingConfig?.source || (existingConfig?.url ? 'external' : 'native'));
    const [configUrl, setConfigUrl] = useState(existingConfig?.url || '');
    
    const defaultLimits = [
        { title: "Limites de Engenharia", description: "Construção de até 2 Kanbans de Vendas operacionais no CRM." },
        { title: "Limites de Automação", description: "Setup restrito a 5 fluxos complexos de automação (Email/Wpp)." },
        { title: "Coparticipação do Cliente", description: "Atrasos na entrega de materiais pelo cliente pausam os 90 dias do SLA." },
        { title: "Licenciamento de Softwares", description: "Custos de licenças anuais (CRMs, Automações) são pagos pelo cliente." }
    ];
    
    const [configLimits, setConfigLimits] = useState<{title: string, description: string}[]>(
        existingConfig?.custom_limits || defaultLimits
    );
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // Check local database on mount for native signatures
    useEffect(() => {
        const checkNativeSignature = async () => {
            const { data } = await supabase.from('document_signatures')
                .select('id')
                .eq('project_id', project.id)
                .eq('reference_id', 'kickoff_validation')
                .limit(1);
                
            if (data && data.length > 0 && !isSigned) {
                setIsSigned(true);
                await updateReiProject(project.id, {
                    opportunity_data: { ...oppData, kickoff_signed: true }
                });
            }
        };
        if (!isSigned) checkNativeSignature();
    }, [project.id, isSigned]);

    // Escuta em tempo real o webhooks / assinaturas
    useEffect(() => {
        if (!project.id || isSigned) return;

        const channel = supabase
            .channel(`project-kickoff-native-${project.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'document_signatures',
                    filter: `project_id=eq.${project.id}`
                },
                async (payload) => {
                    const newSign = payload.new as any;
                    
                    if (newSign?.reference_id === 'kickoff_validation' && !isSigned) {
                        setIsSigned(true);
                        setShowConfetti(true);
                        toast.success("O Cliente assinou o documento com sucesso!");
                        
                        await updateReiProject(project.id, {
                            opportunity_data: { ...oppData, kickoff_signed: true, kickoff_signed_at: new Date().toISOString() }
                        });
                        
                        onUpdate();
                        setTimeout(() => setShowConfetti(false), 6000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [project.id, isSigned, oppData, onUpdate]);

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            const cleanLimits = configLimits.filter(l => l.title.trim() !== '' && l.description.trim() !== '');
            const newContractConfig = {
                source: contractSource,
                url: contractSource === 'external' ? configUrl : '',
                custom_limits: cleanLimits
            };

            await updateReiProject(project.id, {
                opportunity_data: { 
                    ...oppData, 
                    contract_config: newContractConfig
                }
            });
            
            // Auto Update local state to avoid blinking
            oppData.contract_config = newContractConfig;
            
            toast.success("Contrato validado e QR Code gerado!");
            setIsConfiguring(false);
            onUpdate();
        } catch (e) {
            toast.error("Erro ao salvar configuração de contrato.");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const addLimit = () => setConfigLimits([...configLimits, { title: '', description: '' }]);
    const removeLimit = (idx: number) => setConfigLimits(configLimits.filter((_, i) => i !== idx));
    const updateLimit = (idx: number, field: 'title' | 'description', val: string) => {
        const newLimits = [...configLimits];
        newLimits[idx] = { ...newLimits[idx], [field]: val };
        setConfigLimits(newLimits);
    };

    return (
        <div className="relative overflow-hidden bg-white border border-zinc-200 shadow-sm">
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }} recycle={false} numberOfPieces={500} />}
            
            {/* Decoração de Fundo Premium */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-zinc-50 blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-zinc-50 blur-3xl opacity-60 pointer-events-none" />

            {isConfiguring ? (
                <div className="relative p-8 lg:p-10 space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700 uppercase tracking-widest mb-2">
                            Passo 1: Setup do Contrato
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Parametrizar Escopo do Kickoff</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">
                            Antes de mostrar o QR Code para o cliente, cole a URL do contrato original e liste os principais pontos de atenção (SLA e Restrições) acordados para este escopo.
                        </p>
                    </div>
                    
                    <div className="space-y-6 max-w-3xl">
                        <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-widest mb-3">
                                    Origem do Contrato Principal
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setContractSource('native')}
                                        className={`p-4 border text-left transition-all flex flex-col gap-1 ${
                                            contractSource === 'native' 
                                                ? 'bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900' 
                                                : 'bg-transparent border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <span className="text-sm font-bold text-zinc-900">Interno (Nativo)</span>
                                        <span className="text-[11px] text-zinc-500">Gerado e assinado via CRM</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setContractSource('external')}
                                        className={`p-4 border text-left transition-all flex flex-col gap-1 ${
                                            contractSource === 'external' 
                                                ? 'bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900'
                                                : 'bg-transparent border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <span className="text-sm font-bold text-zinc-900">Externo (Autentique)</span>
                                        <span className="text-[11px] text-zinc-500">Link hospedado em outro lugar</span>
                                    </button>
                                </div>
                            </div>

                            {contractSource === 'external' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                                        Link Oficial do Contrato
                                    </label>
                                    <input 
                                        type="url" 
                                        value={configUrl}
                                        onChange={e => setConfigUrl(e.target.value)}
                                        placeholder="https://app.autentique.com.br/..."
                                        className="w-full bg-white border border-zinc-300 p-4 text-sm text-zinc-900 focus:ring-black focus:border-black outline-none transition-shadow" 
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-2">
                                        Cole a URL do documento assinado no Autentique, DocuSign ou similar.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest block">
                                        Termos Resumidos (Bullet Points)
                                    </label>
                                    <p className="text-xs text-zinc-500 mt-1">O que vai aparecer fixo na tela para o cliente assinar na hora.</p>
                                </div>
                                <button 
                                    onClick={addLimit} 
                                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-white hover:bg-zinc-900 border border-zinc-200 hover:border-zinc-900 px-4 py-2 transition-all shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Novo Termo
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {configLimits.map((limit, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-white border border-zinc-200 shadow-sm relative group">
                                        <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center shrink-0 font-bold text-xs text-zinc-500">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input 
                                                type="text" 
                                                value={limit.title}
                                                onChange={e => updateLimit(idx, 'title', e.target.value)}
                                                placeholder="Título (Ex: Limites de Automação)"
                                                className="w-full font-bold bg-transparent border-b border-zinc-200 pb-2 text-sm text-zinc-900 focus:border-black outline-none transition-colors" 
                                            />
                                            <textarea 
                                                value={limit.description}
                                                onChange={e => updateLimit(idx, 'description', e.target.value)}
                                                placeholder="Detalhes curtos..."
                                                rows={2}
                                                className="w-full bg-transparent text-sm text-zinc-600 outline-none resize-none" 
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removeLimit(idx)} 
                                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all absolute top-4 right-4"
                                            title="Remover termo"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                            <button 
                                onClick={handleSaveConfig}
                                disabled={isSavingConfig}
                                className="bg-zinc-900 hover:bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingConfig ? 'Consolidando...' : 'Salvar e Abrir QR Code'}
                            </button>
                            {existingConfig && (
                                <button 
                                    onClick={() => setIsConfiguring(false)}
                                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-4"
                                >
                                    Cancelar Edição
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Left Side: Termo Live (Aesthetics Apple Style) */}
                    <div className="flex-1 w-full space-y-8">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                    {isSigned ? <><CheckCircle2 className="w-3.5 h-3.5 text-[#00CC6A]" /> SLA Autorizado</> : <><QrCode className="w-3.5 h-3.5" /> Assinatura Nativa</>}
                                </div>
                                {!isSigned && (
                                    <button 
                                        onClick={() => setIsConfiguring(true)}
                                        className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 underline underline-offset-4 transition-colors"
                                    >
                                        Editar Limites
                                    </button>
                                )}
                            </div>
                            
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Termo de Alinhamento (Live)</h2>
                            <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
                                Leia as diretrizes abaixo para o cliente e peça-o para escanear o QR Code para formalização digital.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {configLimits.map((limit, idx) => (
                                <div key={idx} className="bg-zinc-50 border border-zinc-100 p-4 flex items-start gap-3 transition-colors hover:border-zinc-200">
                                    <div className="w-8 h-8 bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
                                        <CheckCircle2 className="w-4 h-4 text-[#00A389]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900">{limit.title}</h4>
                                        <p className="text-xs text-zinc-500 mt-1 leading-snug">{limit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!isSigned && (
                            <div className="pt-6 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h5 className="text-sm font-bold text-zinc-900 leading-none">Visão do Cliente</h5>
                                    <p className="text-xs text-zinc-500">Acesse ou envie o link público para assinatura à distância.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {existingConfig?.source === 'external' && configUrl && (
                                        <a 
                                            href={configUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 underline underline-offset-4"
                                        >
                                            Ver Contrato Original
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => window.open(signLink, '_blank')}
                                        className="bg-zinc-900 border border-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest py-3 px-6 transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
                                    >
                                        Link da Tela Pública <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: QR Code Magic Box */}
                    <div className="w-full lg:w-auto shrink-0 flex flex-col items-center">
                        <div className={`p-8 rounded-[2rem] border transition-all duration-700 relative overflow-hidden flex flex-col items-center justify-center min-w-[320px] min-h-[320px] ${
                            isSigned 
                                ? 'bg-[#00CC6A]/5 border-[#00CC6A]/20 shadow-[0_8px_30px_rgb(0,204,106,0.12)]' 
                                : 'bg-white border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
                        }`}>
                            
                            {isSigned ? (
                                <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-[#00CC6A]/10 flex items-center justify-center mx-auto shadow-inner rounded-full mb-6">
                                        <CheckCircle2 className="w-12 h-12 text-[#00CC6A]" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-zinc-900 tracking-tight">Escopo Formalizado</h4>
                                        <p className="text-sm text-zinc-500 mt-2 leading-relaxed max-w-[200px] mx-auto">
                                            Os limites e regras operacionais foram assinados juridicamente pelo cliente.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center animate-in fade-in duration-500">
                                    <div className="bg-white p-3 border border-zinc-100 shadow-sm mb-6 max-w-fit mx-auto transition-transform hover:scale-105 cursor-pointer">
                                        <QRCodeSVG value={signLink} size={190} level="M" includeMargin={false} fgColor="#09090b"  />
                                    </div>
                                    <h4 className="text-lg font-black text-zinc-900 tracking-tight">"Ciente do Escopo"</h4>
                                    <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed max-w-[260px] mx-auto text-balance">
                                        Aponte a câmera para atestar eletronicamente que você está ciente de todo o escopo firmado em contrato e concorda com as regras operacionais repassadas.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};
