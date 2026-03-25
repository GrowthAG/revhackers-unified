import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SalesRoomTab } from '@/components/project-os/views/SalesRoomTab';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PitchDeckPresentation() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        supabase.from('rei_projects')
            .select('*')
            .eq('id', id)
            .single()
            .then(({ data }) => setProject(data));
    }, [id]);

    if (!project) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#FF004D] animate-spin mb-4" />
                <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Carregando Motor de ROI...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative">
            <Button 
                variant="ghost" 
                className="fixed top-6 left-6 z-50 text-zinc-500 hover:text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[9px]" 
                onClick={() => window.close()}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Encerrar Apresentação (Voltar ao Dossiê)
            </Button>
            
            <div className="pt-24 px-8 pb-12">
                <SalesRoomTab project={project} />
            </div>
        </div>
    );
}
