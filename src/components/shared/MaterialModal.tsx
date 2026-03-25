import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import DownloadForm from './download-form';
import { removeEmojis } from '@/utils/stringUtils';

interface MaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: {
        title?: string;
        material_name?: string;
        type?: string;
        material_type?: string;
        materialId?: string;
        id?: string;
        link_material?: string;
        material_url?: string;
    } | null;
    onSuccess: () => void;
}

const MaterialModal = ({ isOpen, onClose, material, onSuccess }: MaterialModalProps) => {
    if (!material) return null;

    const cleanTitle = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return removeEmojis(text);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-100 p-12 shadow-none rounded-none">
                <DialogHeader className="mb-10 text-left space-y-4">
                    <DialogTitle className="text-sm font-bold text-black uppercase tracking-[0.3em] border-b border-black pb-4 w-fit">
                        {material.type === 'Consultoria' || material.type === 'Diagnóstico' ? 'Solicitação de Diagnóstico' : 'Acesso ao Material'}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs font-normal leading-relaxed uppercase tracking-widest">
                        {material.type === 'Consultoria' || material.type === 'Diagnóstico' ? 'Contexto:' : 'Conteúdo Selecionado:'}
                        <span className="font-bold text-black block mt-2 text-sm leading-tight normal-case tracking-normal">
                            {cleanTitle(material.title || material.material_name || 'Material')}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="text-left">
                    <DownloadForm
                        materialId={material.materialId || material.id || 'unknown'}
                        materialType={material.type || material.material_type || 'material'}
                        linkMaterial={material.link_material || material.material_url}
                        onSubmit={onSuccess}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MaterialModal;
