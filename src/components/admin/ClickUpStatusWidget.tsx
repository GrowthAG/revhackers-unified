import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, RefreshCw, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface ClickUpIntegration {
    id: string;
    workspace_status: 'pending' | 'ready' | 'failed' | 'archived';
    sprints_status: 'pending' | 'creating' | 'ready' | 'failed';
    clickup_folder_id: string | null;
    sprint_lists: any[];
    last_error: string | null;
    updated_at: string;
}

interface Props {
    projectId: string;
}

function StatusDot({ status }: { status: string }) {
    if (status === 'ready') return <span className="w-2 h-2 rounded-none bg-[#00CC6A] inline-block" />;
    if (status === 'failed') return <span className="w-2 h-2 rounded-none bg-red-500 inline-block" />;
    if (status === 'creating') return <span className="w-2 h-2 rounded-none bg-yellow-500 inline-block animate-pulse" />;
    return <span className="w-2 h-2 rounded-none bg-zinc-300 inline-block" />;
}

export function ClickUpStatusWidget({ projectId }: Props) {
    const [integration, setIntegration] = useState<ClickUpIntegration | null>(null);
    const [loading, setLoading] = useState(true);
    const [reprovisioning, setReprovisioning] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const load = useCallback(async () => {
        const { data } = await supabase
            .from('clickup_integrations')
            .select('id, workspace_status, sprints_status, clickup_folder_id, sprint_lists, last_error, updated_at')
            .eq('rei_project_id', projectId)
            .maybeSingle();
        setIntegration(data as ClickUpIntegration | null);
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        load();

        // Supabase Realtime: atualiza automaticamente quando clickup-provision muda o status
        const channel = supabase
            .channel(`clickup_integration_${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'clickup_integrations',
                    filter: `rei_project_id=eq.${projectId}`,
                },
                () => load()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [projectId, load]);

    async function handleReprovision() {
        setReprovisioning(true);
        try {
            const { error } = await supabase.functions.invoke('clickup-provision', {
                body: { project_id: projectId, triggered_by: 'admin_manual' },
            });
            if (error) throw error;
            // A resposta pode demorar - o Realtime vai atualizar o estado automaticamente
            setTimeout(load, 3000);
        } catch (err: any) {
            console.error('[ClickUpStatusWidget] reprovisionamento falhou:', err?.message);
        } finally {
            setTimeout(() => setReprovisioning(false), 5000);
        }
    }

    if (loading) {
        return (
            <div className="mt-4 border-t border-zinc-200 pt-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">ClickUp</p>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!integration) {
        return (
            <div className="mt-4 border-t border-zinc-200 pt-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">ClickUp</p>
                <p className="text-[11px] text-zinc-400">Nao provisionado</p>
            </div>
        );
    }

    const sprintCount = Array.isArray(integration.sprint_lists) ? integration.sprint_lists.length : 0;
    const folderUrl = integration.clickup_folder_id
        ? `https://app.clickup.com/90175101115/v/li/${integration.clickup_folder_id}`
        : null;

    const canReprovision =
        integration.workspace_status === 'ready' &&
        (integration.sprints_status === 'failed' || integration.sprints_status === 'pending');

    return (
        <div className="mt-4 border-t border-zinc-200 pt-4">
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between mb-2 group"
            >
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] group-hover:text-zinc-600 transition-colors">
                    ClickUp
                </p>
                <div className="flex items-center gap-1.5">
                    <StatusDot status={integration.sprints_status} />
                </div>
            </button>

            {/* Summary row sempre visivel */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">Workspace</span>
                    <span className={`text-[11px] font-black uppercase ${
                        integration.workspace_status === 'ready' ? 'text-[#00CC6A]' :
                        integration.workspace_status === 'failed' ? 'text-red-500' : 'text-zinc-400'
                    }`}>
                        {integration.workspace_status}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">Sprints</span>
                    <span className={`text-[11px] font-black uppercase ${
                        integration.sprints_status === 'ready' ? 'text-[#00CC6A]' :
                        integration.sprints_status === 'failed' ? 'text-red-500' :
                        integration.sprints_status === 'creating' ? 'text-yellow-500' : 'text-zinc-400'
                    }`}>
                        {integration.sprints_status === 'ready' ? `${sprintCount} criadas` : integration.sprints_status}
                    </span>
                </div>
            </div>

            {/* Detalhes expandidos */}
            {expanded && (
                <div className="mt-3 space-y-2">
                    {integration.last_error && (
                        <div className="flex items-start gap-1.5 bg-red-50 border border-red-100 p-2">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-red-600 leading-tight break-all">
                                {integration.last_error}
                            </p>
                        </div>
                    )}

                    {folderUrl && (
                        <a
                            href={folderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Abrir no ClickUp
                        </a>
                    )}

                    <p className="text-[10px] text-zinc-300">
                        Atualizado {new Date(integration.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            )}

            {/* Botao de reprovisionamento */}
            {canReprovision && (
                <button
                    onClick={handleReprovision}
                    disabled={reprovisioning}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {reprovisioning ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Provisionando...</>
                    ) : (
                        <><RefreshCw className="w-3 h-3" /> Reprovisionar</>
                    )}
                </button>
            )}

            {integration.sprints_status === 'creating' && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-yellow-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Criando sprints no ClickUp...
                </div>
            )}
        </div>
    );
}
