import React, { useState } from 'react';
import { ReiProject } from '@/api/reiProjects';
import { Cpu, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProposalForm from '@/components/admin/ProposalForm';
import { AIProvider } from '@/context/AIContext';

interface SalesRoomTabProps {
    project: ReiProject;
}

export const SalesRoomTab: React.FC<SalesRoomTabProps> = ({ project }) => {
    const [showBuilder, setShowBuilder] = useState(false);

    return (
        <div className="max-w-4xl mx-auto py-12">
            {!showBuilder ? (
                <div className="bg-white p-12 border border-zinc-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-20 h-20 bg-zinc-50 flex items-center justify-center border border-zinc-100 mb-6 shadow-sm">
                        <Presentation className="w-10 h-10 text-zinc-300" />
                    </div>
                    
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase mb-4">
                        Deal Room / Proposta Executiva
                    </h1>
                    
                    <p className="text-base font-medium text-zinc-500 max-w-lg mb-10 leading-relaxed">
                        Apresente seu diagnóstico, escopo técnico e cronograma em uma página exclusiva e imersiva para o cliente (Pitch Deck). Configure a proposta e gere o link de checkout.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Button 
                            size="lg"
                            className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest h-14 px-10 "
                            onClick={() => setShowBuilder(true)}
                        >
                            <Cpu className="w-5 h-5 mr-3" />
                            Começar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Construtor de Proposta</h2>
                        <Button variant="outline" onClick={() => setShowBuilder(false)}>Cancelar</Button>
                    </div>
                    {/* The project parameter is mapped to the initialData representing the old Model */}
                    <div className="bg-white overflow-hidden border border-zinc-200">
                        <AIProvider>
                            <ProposalForm 
                                initialData={{
                                    client_name: project.client_name || project.client_company,
                                    client_email: project.client_email,
                                    crm_data: {
                                        project_id: project.id,
                                        pain_points: (project.opportunity_data as any)?.opportunity_notes || '',
                                        project_duration: (project.opportunity_data as any)?.contract_data?.contract_duration_months || '6',
                                    }
                                }}
                            />
                        </AIProvider>
                    </div>
                </div>
            )}
        </div>
    );
};
