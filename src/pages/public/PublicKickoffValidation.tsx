import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReiProjectById, type ReiProject } from '@/api/reiProjects';
import { SignatureEngine } from '@/components/legal/SignatureEngine';
import { ShieldCheck, Loader2, FileCheck2, ArrowUpRight } from 'lucide-react';

const PublicKickoffValidation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const data = await getReiProjectById(id);
                setProject(data);
            } catch (err) {
                console.error("Error fetching project:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500">
                <div className="p-8 text-center bg-white shadow-sm border">
                    Projeto não encontrado ou indisponível.
                </div>
            </div>
        );
    }

    const oppData = (project.opportunity_data as any) || {};
    const contractConfig = oppData.contract_config;

    // Default Fallback Limits (Legacy)
    const defaultLimits = [
        { title: "Kanbans e Pipelines", description: "Limitado a 02 (dois) Pipelines de Vendas operacionais." },
        { title: "Automações", description: "Limitado a configurar 05 (cinco) fluxos/gatilhos automatizados chaves. Demais fluxos incorrem em custo extra." },
        { title: "Limites de Migração", description: "Exclusivamente Cadastro de Contatos e Oportunidades. Histórico (Notas/Atividades) não será importado." },
        { title: "Coparticipação e SLA", description: "Nossas entregas dependem da agilidade do Cliente. Caso o Cliente atrase a entrega de acessos ou materiais, o relógio do projeto é pausado." },
        { title: "Licenciamento de Softwares", description: "Os custos oriundos das assinaturas de ferramentas de terceiros (CRMs, Disparadores) são de inteira responsabilidade do cliente." }
    ];

    const limitsToRender = contractConfig?.custom_limits || defaultLimits;
    const contractUrl = contractConfig?.url || '';

    // Generate Dynamic Hash String
    let documentContentToHash = `TERMO DE ACEITE E ALINHAMENTO DE KICK-OFF: PROJETO ${project.trade_name || project.client_company || project.client_name || project.id}\n` +
        `Data de Geração: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
        `Limitações Técnicas Acordadas:\n`;
    
    limitsToRender.forEach(limit => {
        documentContentToHash += `- ${limit.title}: ${limit.description}\n`;
    });

    if (contractUrl) {
        documentContentToHash += `\nLink Oficial do Contrato: ${contractUrl}\n`;
    }

    documentContentToHash += `\nDeclaro ter passado pela Reunião de Kick-off junto ao Especialista, li o contrato original, e estou de pleno acordo para iniciar a operação.`;

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Cabeçalho */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center mx-auto shadow-xl">
                        <FileCheck2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                        Termo de Validação de Kick-off
                    </h1>
                    <p className="text-zinc-500 max-w-xl mx-auto">
                        Alinhamento oficial de Setup e SLAs para o projeto firmado com <strong className="text-zinc-900">{project.trade_name || project.client_company || project.client_name}</strong>.
                    </p>
                </div>

                {/* Resumo do Escopo (Visual legal) */}
                <div className="bg-white border border-zinc-200 shadow-sm p-8 lg:p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100 rounded-bl-full -mr-16 -mt-16 sm:-mr-8 sm:-mt-8 pointer-events-none" />
                    
                    <div>
                        <h3 className="text-lg font-bold border-b border-zinc-100 pb-4 flex items-center gap-2 text-zinc-900">
                            <ShieldCheck className="w-5 h-5 text-zinc-700" />
                            Escopo e Limites Operacionais Acordados
                        </h3>
                        
                        <div className="prose prose-zinc max-w-none text-sm leading-relaxed mt-4">
                            <p className="text-zinc-600">
                                Este Termo de Alinhamento tem o objetivo de formalizar as premissas operacionais levantadas na Reunião de Kick-Off, 
                                em conformidade com o Contrato Original assinado. A assinatura fiduciária deste termo confere <strong>"Luz Verde" (Go) para o início do cronograma</strong> de implantação.
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Limits Render */}
                    <div className="bg-zinc-50 p-6 sm:p-8 border border-zinc-200">
                        <h4 className="font-black text-zinc-900 mb-6 uppercase tracking-widest text-xs">Resumo das Limitações Práticas</h4>
                        <ul className="space-y-5">
                            {limitsToRender.map((limit, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="w-6 h-6 bg-white border border-zinc-200 flex items-center justify-center shrink-0 font-bold text-xs text-zinc-500 shadow-sm mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <strong className="text-zinc-900 block text-sm mb-1">{limit.title}</strong>
                                        <span className="text-zinc-600 text-sm">{limit.description}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Official Contract Link block */}
                    {contractUrl ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-blue-50/50 border border-blue-100 rounded-sm">
                            <div>
                                <h4 className="font-bold text-zinc-900 text-sm">Contrato Completo Oficial</h4>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Acesse o seu contrato original hospedado remotamente (ex: Autentique/DocuSign).
                                </p>
                            </div>
                            <a 
                                href={contractUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-900 text-xs font-bold uppercase tracking-widest py-3 px-6 transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0"
                            >
                                Acessar Contrato <ArrowUpRight className="w-4 h-4" />
                            </a>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-zinc-50 border border-zinc-200 rounded-sm">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-zinc-200 border border-zinc-300 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
                                    Plataforma Nativa
                                </div>
                                <h4 className="font-bold text-zinc-900 text-sm">Contrato Oficial Integrado</h4>
                                <p className="text-xs text-zinc-500 mt-1">
                                    O seu contrato primário já se encontra assinado e verificado digitalmente através do nosso próprio ecossistema (Termo Nativo).
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="shadow-2xl shadow-zinc-200/50 overflow-hidden">
                    <SignatureEngine
                        projectId={project.id}
                        referenceType="strategic_plan"
                        referenceId="kickoff_validation"
                        documentContentToHash={documentContentToHash}
                        onSuccess={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        checkboxText="Declaro ter participado da Reunião de Kick-off, lido os termos acima, confirmando a ciência de todas as limitações e dando o de acordo definitivo para o início das operações de implantação do projeto."
                    />
                </div>
                
                {/* Footer Legal */}
                <p className="text-center text-xs text-zinc-400 font-medium pb-8 border-t border-zinc-100 pt-8 mt-12 px-4">
                    Assinatura eletrônica protegida por criptografia assimétrica e IP Logging.<br className="hidden sm:block" />
                    Este documento possui validade jurídica em conformidade com a MP 2.200-2/2001.
                </p>
            </div>
        </div>
    );
};

export default PublicKickoffValidation;
