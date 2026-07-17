import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SignatureEngine } from '@/components/legal/SignatureEngine';

/**
 * PlanSignPage - Página leve para assinatura mobile via QR Code.
 * Não carrega o plano inteiro, apenas os dados mínimos para assinar.
 * Rota: /plan/:token/sign
 */
export default function PlanSignPage() {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<any>(null);
    const [company, setCompany] = useState('');
    const [signerName, setSignerName] = useState('');
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPlanMeta();
    }, [token]);

    async function loadPlanMeta() {
        if (!token) { setLoading(false); return; }
        try {
            const { data, error: err } = await supabase
                .from('strategic_plans')
                .select('*, rei_projects(id)')
                .eq('access_token', token)
                .single();
            if (err) throw err;
            setPlan(data);
            if (data.status === 'approved') setDone(true);
            if (data.client_id) {
                const { data: cl } = await supabase
                    .from('clients').select('company').eq('id', data.client_id).single();
                if (cl) setCompany(cl.company);
            }
        } catch (_) {
            setError('Plano não encontrado.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSignatureSuccess(signerData: { name: string; email: string; cpf: string; role: string }) {
        try {
            const existing = plan.next_steps_data || {};
            const now = new Date().toISOString();
            await supabase.from('strategic_plans').update({
                status: 'approved',
                approved_at: now,
                next_steps_data: {
                    ...existing,
                    approved_by_name: signerData.name,
                    approved_by_email: signerData.email,
                    approved_by_cpf: signerData.cpf,
                    approved_by_role: signerData.role,
                    approved_at_iso: now,
                },
            } as any).eq('id', plan.id);

            // Dispara provisionamento do ClickUp em background (fire-and-forget intencional).
            // A UX do cliente nao espera — o admin acompanha o progresso no Hub via
            // clickup_integrations.sprints_status (Supabase Realtime).
            const projectId = plan.rei_projects?.id;
            if (projectId) {
                supabase.functions
                    .invoke('clickup-provision', {
                        body: {
                            project_id: projectId,
                            triggered_by: 'plan_approval',
                        },
                    })
                    .catch((err: unknown) => {
                        console.error('[PlanSignPage] clickup-provision falhou:', err);
                    });
                
                // Módulo 2: Dual Link Strategy - Hook de Aprovação
                // Dispara o update da Task Zero no ClickUp com o link do Portal do Cliente
                supabase.functions
                    .invoke('clickup-update-docs-link', {
                        body: { planId: plan.id }
                    })
                    .catch((err: unknown) => {
                        console.error('[PlanSignPage] clickup-update-docs-link falhou:', err);
                    });
            }

            setSignerName(signerData.name);
            setDone(true);
        } catch (err) {
            console.error('Erro ao aprovar plano nativo após assinatura:', err);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (error && !plan) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="text-center">
                    <X className="w-10 h-10 text-red-400 mx-auto mb-4" />
                    <p className="text-zinc-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/brand/revhackers-wordmark-white.png"
                        alt="RevHackers"
                        className="w-40 max-w-full h-auto mx-auto mb-6 brightness-0"
                    />
                    {company && (
                        <p className="text-xxs text-zinc-400 uppercase tracking-[0.2em] font-bold">
                            Planejamento Estratégico - {company}
                        </p>
                    )}
                </div>

                {done ? (
                    /* ── SUCESSO ─── */
                    <div className="bg-white border border-zinc-100 p-8 text-center shadow-sm">
                        <div className="w-14 h-14 bg-[#00CC6A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Check className="w-7 h-7 text-[#00CC6A]" />
                        </div>
                        <h1 className="text-xl font-black text-zinc-900 mb-2">Planejamento Aprovado</h1>
                        <p className="text-sm text-zinc-500">
                            {plan?.next_steps_data?.approved_by_name
                                ? `Assinado por ${plan.next_steps_data.approved_by_name}`
                                : 'Obrigado pela aprovação. Nossa equipe já está em ação.'}
                        </p>
                    </div>
                ) : (
                    <div className="w-full">
                        <SignatureEngine 
                            projectId={plan?.rei_projects?.id || ''}
                            referenceType="strategic_plan"
                            referenceId={plan.id}
                            documentContentToHash={JSON.stringify({
                                thesis: plan.thesis_data,
                                roadmap: plan.roadmap_data,
                                sla: plan.sla_data
                            })}
                            onSuccess={handleSignatureSuccess}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
