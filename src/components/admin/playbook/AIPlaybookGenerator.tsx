import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Send, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AIPlaybookGeneratorProps {
    projectId: string;
    projectName: string;
}

const FRAMEWORKS = [
    { id: 'Outbound B2B e SLA', name: 'Máquina Outbound & SLA de Vendas', desc: 'Processos de prospecção fria, ICP, Cadências e Qualificação.' },
    { id: 'Inbound e Funis', name: 'Motor Inbound & Growth', desc: 'SLA de Qualificação de Inbound, Conteúdo, e Automação de MKT.' },
    { id: 'CS e Retenção', name: 'Onboarding & Sucesso do Cliente', desc: 'Rotinas de Handoff (Vendas->CS), Mapa de Risco e Upsell.' },
    { id: 'Estruturação CRM', name: 'Arquitetura de CRM', desc: 'Pipelines, Motivos de Perda, Regras de Negócio e Campos.' },
    { id: 'Review Trimestral B2B', name: 'QBR (Quarterly Business Review)', desc: 'Análise executiva trimestral com planos de ação para a próxima Sprint.' },
];

export const AIPlaybookGenerator: React.FC<AIPlaybookGeneratorProps> = ({ projectId, projectName }) => {
    const { toast } = useToast();
    const [framework, setFramework] = useState(FRAMEWORKS[0].id);
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setContent('');
        setIsPublished(false);
        try {
            // Force Edge Function call
            // We assume edge function returns { markdown: string }
            const { data, error } = await supabase.functions.invoke('generate-playbook', {
                body: { projectId, framework }
            });

            if (error) {
                console.error("Function Error:", error);
                throw error;
            }

            if (data?.error) {
                throw new Error(data.error);
            }

            if (data?.markdown) {
                setContent(data.markdown);
                toast({
                    title: 'Rascunho Premium Gerado',
                    description: 'O Arquivo de 80% foi redigido. Agora é com você (20% refinamento).',
                });
            } else {
                throw new Error("Formato de resposta inválido da IA.");
            }
        } catch (error: any) {
            console.error('Failed to generate playbook:', error);
            toast({
                title: 'Erro na Geração',
                description: error.message || 'Ocorreu um erro ao conectar com o arquiteto de IA.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!content.trim()) return;
        
        setIsPublishing(true);
        try {
            // 1. Ensure a Knowledge Library exists for this project
            let libraryId = null;
            const { data: existingLib } = (await supabase
                .from('knowledge_libraries')
                .select('id')
                .eq('project_id', projectId)
                .single()) as any;

            if (existingLib) {
                libraryId = existingLib.id;
            } else {
                // Auto-create Wiki if it doesn't exist
                const { data: newLib, error: libErr } = await supabase
                    .from('knowledge_libraries')
                    .insert({
                        name: `Wiki: ${projectName}`,
                        description: `Documentação oficial do projeto ${projectName}`,
                        project_id: projectId,
                        type: 'project_wiki',
                        is_global: false
                    } as any)
                    .select('id')
                    .single();
                
                if (libErr) throw libErr;
                libraryId = newLib.id;
            }

            // 2. Insert the document
            const { error: docErr } = await supabase
                .from('agent_documents')
                .insert({
                    library_id: libraryId,
                    filename: `Playbook: ${framework}`,
                    content: content,
                    metadata: {
                        visibility: 'shared', // Instantly visible on the Client Hub
                        type: 'playbook',
                        framework: framework,
                        published_at: new Date().toISOString()
                    }
                } as any);

            if (docErr) throw docErr;

            setIsPublished(true);
            toast({
                title: 'Playbook Publicado com Sucesso!',
                description: 'O documento já está disponível no Hub do Cliente.',
            });

        } catch (error: any) {
            console.error('Failed to publish playbook:', error);
            toast({
                title: 'Erro de Publicação',
                description: error.message || 'Não foi possível injetar o playbook no Hub.',
                variant: 'destructive',
            });
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            
            {/* Left Sidebar: Controls & Frameworks */}
            <div className="lg:col-span-1 border border-zinc-200 bg-zinc-50/50 p-6 overflow-y-auto hidden-scrollbar flex flex-col">
                <div className="mb-6">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-4">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 mb-2">Fábrica de Playbooks</h2>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        A IA vai cruzar as respostas cruas do cliente (Diagnóstico REI) com a sua Estratégia de Onboarding para gerar a base de documentação rigorosa. Absolutamente Zero Data-Entry.
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    <label className="text-xxs font-bold uppercase tracking-widest text-zinc-400">1. Escolha o Output (Framework)</label>
                    {FRAMEWORKS.map((fw) => (
                        <div 
                            key={fw.id}
                            onClick={() => setFramework(fw.id)}
                            className={`p-3 border cursor-pointer transition-all duration-200 ${
                                framework === fw.id 
                                ? 'border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900/10 dark:border-zinc-400 dark:bg-zinc-900' 
                                : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className={`w-4 h-4 ${framework === fw.id ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                                <span className={`text-sm font-bold ${framework === fw.id ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700'}`}>{fw.name}</span>
                            </div>
                            <p className="text-tiny text-zinc-500 line-clamp-2">{fw.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-auto space-y-4">
                    <div className="text-xxs text-zinc-400 flex items-start gap-2 bg-white border border-zinc-100 p-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">
                            Lembre-se: O Rascunho corresponde a 80% do trabalho braçal. Você como consultor de Growth é o responsável pelos 20% do refinamento técnico.
                        </span>
                    </div>
                    
                    <Button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold tracking-wide shadow-sm"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando Contexto...</>
                        ) : (
                            <><Zap className="w-4 h-4 mr-2" /> Gerar Base Automática</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="lg:col-span-2 border border-zinc-200 bg-white overflow-hidden flex flex-col shadow-sm">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                            <FileText className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 leading-tight">Editor Especialista (Markdown)</h3>
                            <p className="text-xxs font-medium text-zinc-500 tracking-wider uppercase">Refino Tático • Nível C-Level</p>
                        </div>
                    </div>

                    <Button 
                        size="sm"
                        onClick={handlePublish}
                        disabled={isPublishing || !content.trim() || isPublished}
                        className={`h-9 px-4 text-xs font-bold transition-all ${
                            isPublished 
                            ? 'bg-zinc-100 text-[#00E577] border border-zinc-200 hover:bg-zinc-100' 
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        }`}
                    >
                        {isPublishing ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Injetando no Hub...</>
                        ) : isPublished ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Playbook Publicado</>
                        ) : (
                            <><Send className="w-3.5 h-3.5 mr-2" /> Publicar no Hub do Cliente</>
                        )}
                    </Button>
                </div>

                <div className="flex-1 p-0 relative">
                    {!content && !isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/80 backdrop-blur-sm z-10 text-center px-12">
                            <div className="w-16 h-16 bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-sm">
                                <Zap className="w-6 h-6 text-zinc-300" />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-900 mb-2">Tela de Refinamento</h4>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                Escolha o framework na barra lateral e gere a base tática inicial para começar a refinar o seu playbook.
                            </p>
                        </div>
                    )}
                    
                    <Textarea
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setIsPublished(false);
                        }}
                        placeholder="# Seu Playbook Tático..."
                        className="w-full h-full min-h-[500px] p-8 border-0 focus-visible:ring-0 resize-none font-mono text-mini leading-relaxed text-zinc-800 bg-white"
                        style={{ outline: 'none', boxShadow: 'none' }}
                    />
                </div>
            </div>

        </div>
    );
};
