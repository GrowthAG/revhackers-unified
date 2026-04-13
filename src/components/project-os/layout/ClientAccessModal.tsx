import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Globe, Upload, QrCode, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ReiProject } from '@/api/reiProjects';
import { getDisplayName } from '@/lib/projectUtils';

// Minimal utility safely extracted
function getProjectDisplayName(project: ReiProject): string {
    return getDisplayName({
        trade_name: project?.trade_name,
        client_company: project?.client_company,
        client_name: project?.client_name
    });
}

interface ClientAccessModalProps {
    project: ReiProject;
    stageCategory: string | null;
}

export function ClientAccessModal({ project, stageCategory }: ClientAccessModalProps) {
    const { toast } = useToast();
    const displayName = getProjectDisplayName(project);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 text-xxs font-bold uppercase tracking-widest rounded-none transition-all"
                >
                    <Share2 size={12} className="mr-2" /> Compartilhar Hub
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-zinc-200">
                <div className="p-6 bg-zinc-950 text-white">
                    <DialogTitle className="font-black text-xl tracking-tight mb-1 text-white">Acessos do Cliente</DialogTitle>
                    <DialogDescription className="text-zinc-400 text-xs">
                        Compatilhe os links mágicos e Hub de controle com a conta {displayName}.
                    </DialogDescription>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Link do Hub */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-zinc-500" />
                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-900">Hub do Cliente (Portal Principal)</span>
                        </div>
                        <div className="flex">
                            <div className="flex-1 bg-zinc-50 border border-zinc-200 border-r-0 px-3 flex items-center overflow-hidden h-9">
                                <span className="text-xs font-mono text-zinc-500 truncate">{`${window.location.origin}/hub/${project.id}`}</span>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/hub/${project.id}`);
                                    toast({ title: 'Hub Copiado', description: 'Link enviado para a área de transferência.' });
                                }} 
                                className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 rounded-none px-4 h-9 uppercase text-2xs font-bold tracking-wider transition-all"
                            >
                                Copiar
                            </Button>
                        </div>
                    </div>

                    {/* Link de Uploads */}
                    {stageCategory === 'execucao' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-4 h-4 text-zinc-500" />
                                <span className="text-xxs font-black uppercase tracking-widest text-zinc-900">Recebimento de Materiais (Acervo)</span>
                            </div>
                            <div className="flex">
                                <div className="flex-1 bg-zinc-50 border border-zinc-200 border-r-0 px-3 flex items-center overflow-hidden h-9">
                                    <span className="text-xs font-mono text-zinc-500 truncate">{`${window.location.origin}/upload-materiais/${project.id}`}</span>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/upload-materiais/${project.id}`);
                                        toast({ title: 'Upload Copiado', description: 'Formulário de acervo enviado para área de transferência.' });
                                    }} 
                                    className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 rounded-none px-4 h-9 uppercase text-2xs font-bold tracking-wider transition-all"
                                >
                                    Copiar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* QR Code */}
                    <div className="pt-6 border-t border-zinc-100 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-4">
                            <QrCode className="w-4 h-4 text-zinc-500" />
                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-900">QR Code: Hub Presencial</span>
                        </div>
                        <div className="p-3 bg-white border border-zinc-200 shadow-sm">
                            <QRCodeSVG
                                value={`${window.location.origin}/hub/${project.id}`}
                                size={140}
                                level={"Q"}
                                includeMargin={true}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
