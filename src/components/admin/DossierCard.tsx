import React, { useState } from 'react';
import { Bot, Globe, Loader2, AlertTriangle, Search, Hash, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateDossier, DossierResult } from '@/api/dossier';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DossierCardProps {
    clientUrl?: string;
}

export function DossierCard({ clientUrl }: DossierCardProps) {
    const [url, setUrl] = useState(clientUrl || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DossierResult | null>(null);

    const handleInspect = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const data = await generateDossier(url);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ condition, labelYes, labelNo }: { condition: boolean; labelYes: string; labelNo: string }) => (
        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${condition ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {condition ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
            {condition ? labelYes : labelNo}
        </Badge>
    );

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 shadow-xl mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Bot size={120} className="text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Search size={16} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Dossiê Pré-Kickoff</h4>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Auditoria Expressa de Marketing & Site</p>
                    </div>
                </div>

                {!result ? (
                    <div className="flex gap-2 items-center">
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://site-do-lead.com.br"
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 max-w-sm font-mono text-xs"
                        />
                        <Button
                            onClick={handleInspect}
                            disabled={!url || loading}
                            className="bg-white text-black hover:bg-zinc-200 rounded-none text-xs font-bold uppercase tracking-widest"
                        >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                            Gerar Dossiê
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* AI Summary */}
                        {result.success && result.ai_analysis && (
                            <div className="bg-zinc-800/50 p-4 border-l-2 border-revgreen">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-revgreen mb-2 flex items-center gap-2">
                                    <Bot size={12} /> Insight da Inteligência Artificial
                                </h5>
                                <div className="space-y-3">
                                    <p className="text-sm text-white leading-relaxed">
                                        <span className="text-zinc-400">Proposta de Valor:</span> {result.ai_analysis.resumo_proposta}
                                    </p>
                                    <p className="text-sm text-white leading-relaxed">
                                        <span className="text-zinc-400">Problema Identificado (Gap):</span> {result.ai_analysis.problema_identificado}
                                    </p>
                                    <div className="bg-black p-3 mt-2 border border-zinc-800">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Dica de Quebra-Gelo (Fale isso na call):</span>
                                        <p className="text-sm font-medium text-amber-400 italic">"{result.ai_analysis.sugestao_quebra_gelo}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technical Flags */}
                        {result.success && result.data && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <StatusBadge condition={result.data.hasPixel} labelYes="Meta Pixel OK" labelNo="Sem Meta Pixel" />
                                <StatusBadge condition={result.data.hasGTM} labelYes="GTM Instalado" labelNo="Sem GTM" />
                                <StatusBadge condition={result.data.hasRD || result.data.hasHubspot || result.data.hasActiveCampaign} labelYes="Usa CRM/MKT" labelNo="Sem CRM visível" />
                                <StatusBadge condition={result.ai_analysis?.proposta_de_valor_clara ?? true} labelYes="Copy Clara" labelNo="Copy Confusa" />
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            {/* Error Message */}
                            {!result.success && result.error && (
                                <div className="bg-red-950/30 p-4 border border-red-900/50 rounded-md">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2 flex items-center gap-2">
                                        <AlertTriangle size={12} /> Falha na Análise
                                    </h5>
                                    <p className="text-sm text-red-200/80">{result.error}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {result.data && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-[10px] uppercase font-bold tracking-widest">
                                                <Hash className="w-3 h-3 mr-2" />
                                                Ver Dados Brutos (HTML)
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-300">
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-white mb-4">Dados Brutos Extraídos</h3>
                                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-[10px] uppercase font-bold tracking-widest"
                                    onClick={() => setResult(null)}
                                >
                                    <Search className="w-3 h-3 mr-2" />
                                    Nova Auditoria
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
