import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { Card } from '@/components/ui/card';
import HealthScoreCard from '@/components/admin/HealthScoreCard';
import SuccessMilestones from '@/components/admin/SuccessMilestones';
import RiskMitigationPanel from '@/components/admin/RiskMitigationPanel';
import {
    Target, Shield, Rocket, CheckCircle2, Clock, ArrowRight,
    Cpu, Flag, Users, Activity,
} from 'lucide-react';

/**
 * SuccessPlanPresentation
 *
 * Pagina publica (via access_token) que mostra ao cliente:
 * - Desired Outcome (Required Outcome + Appropriate Experience)
 * - TTFV (Time to First Value)
 * - Milestones de onboarding por fase
 * - Health Score atual
 * - Fases do onboarding (Donna Weber)
 * - Riscos mapeados e mitigacao
 *
 * Rota: /success/:token
 */

export default function SuccessPlanPresentation() {
    const { token } = useParams<{ token: string }>();
    const [plan, setPlan] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPlan() {
            if (!token) { setLoading(false); return; }

            try {
                const { data, error } = await supabase
                    .from('strategic_plans')
                    .select('*, rei_projects(client_name, client_company, client_site, type)')
                    .eq('access_token', token)
                    .eq('plan_type', 'success_plan')
                    .single();

                if (error || !data) {
                    console.error('[SuccessPlan] Erro ao carregar:', error);
                    setLoading(false);
                    return;
                }

                setPlan(data);

                // Marcar como visualizado
                if (!data.viewed_at) {
                    await supabase
                        .from('strategic_plans')
                        .update({ viewed_at: new Date().toISOString() })
                        .eq('id', data.id);
                }

                // Carregar cliente
                if (data.client_id) {
                    const { data: clientData } = await supabase
                        .from('clients')
                        .select('name, company, logo_url, email')
                        .eq('id', data.client_id)
                        .single();
                    if (clientData) setClient(clientData);
                }
            } catch (err) {
                console.error('[SuccessPlan] Error:', err);
            } finally {
                setLoading(false);
            }
        }

        loadPlan();
    }, [token]);

    if (loading) {
        return (
            <PageLayout>
                <Section className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-[#00CC6A] border-t-transparent rounded-full animate-spin" />
                        <span className="text-zinc-500 text-xs font-mono animate-pulse uppercase tracking-widest">
                            Carregando Success Plan...
                        </span>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    if (!plan) {
        return (
            <PageLayout>
                <Section className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white mb-4">Success Plan nao encontrado</h2>
                        <p className="text-zinc-500 text-sm">O link pode ter expirado ou ser invalido.</p>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    const criteria = plan.success_criteria_data || {};
    const risks = plan.risk_mitigation_data || {};
    const collab = plan.collaboration_metadata || {};
    const project = (plan as any).rei_projects || {};
    const clientName = client?.company || project.client_company || project.client_name || 'Sua Empresa';

    const milestones = criteria.success_milestones || [];
    const completedCount = milestones.filter((m: any) => m.completed).length;

    const healthDimensions = criteria.health_dimensions || {
        adoption: { weight: 0.30, indicators: [], initial_score: 50 },
        engagement: { weight: 0.25, indicators: [], initial_score: 50 },
        growth: { weight: 0.25, indicators: [], initial_score: 50 },
        sentiment: { weight: 0.20, indicators: [], initial_score: 50 },
    };

    const onboardingPhases = criteria.onboarding_phases || [];

    return (
        <PageLayout>
            <div className="min-h-screen bg-zinc-950">

                {/* COVER */}
                <Section className="pt-32 pb-16">
                    <div className="container-custom max-w-5xl mx-auto">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3 mb-8">
                            {client?.logo_url && (
                                <img src={client.logo_url} alt="" className="w-8 h-8 object-contain bg-white p-1" />
                            )}
                            <span className="text-xxs font-black text-[#00CC6A] uppercase tracking-[0.25em]">
                                Success Plan
                            </span>
                            <div className="h-px bg-zinc-800 flex-1" />
                            <span className="text-xxs font-mono text-zinc-600">
                                {plan.created_at ? new Date(plan.created_at).toLocaleDateString('pt-BR') : ''}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
                            Plano de Sucesso
                            <br />
                            <span className="text-[#00CC6A]">{clientName}</span>
                        </h1>

                        {/* Desired Outcome Statement */}
                        {criteria.desired_outcome_statement && (
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl border-l-2 border-[#00CC6A] pl-6 mb-8">
                                {criteria.desired_outcome_statement}
                            </p>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-zinc-900 border border-zinc-800 p-4 ">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-[#00CC6A]" />
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">TTFV</span>
                                </div>
                                <span className="text-2xl font-black text-white">{criteria.ttfv_target_days || 14}</span>
                                <span className="text-xs text-zinc-500 ml-1">dias</span>
                            </Card>
                            <Card className="bg-zinc-900 border border-zinc-800 p-4 ">
                                <div className="flex items-center gap-2 mb-2">
                                    <Flag className="w-4 h-4 text-[#00CC6A]" />
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">Milestones</span>
                                </div>
                                <span className="text-2xl font-black text-white">{completedCount}/{milestones.length}</span>
                            </Card>
                            <Card className="bg-zinc-900 border border-zinc-800 p-4 ">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-[#00CC6A]" />
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">Riscos</span>
                                </div>
                                <span className="text-2xl font-black text-white">{(risks.risks || []).length}</span>
                                <span className="text-xs text-zinc-500 ml-1">mapeados</span>
                            </Card>
                            <Card className="bg-zinc-900 border border-zinc-800 p-4 ">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-[#00CC6A]" />
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">Fases</span>
                                </div>
                                <span className="text-2xl font-black text-white">{onboardingPhases.length}</span>
                            </Card>
                        </div>
                    </div>
                </Section>

                {/* DESIRED OUTCOME */}
                <Section className="py-16 border-t border-zinc-900">
                    <div className="container-custom max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <Target className="w-5 h-5 text-[#00CC6A]" />
                            <span className="text-xxs font-black text-[#00CC6A] uppercase tracking-[0.25em]">
                                Desired Outcome
                            </span>
                            <div className="h-px bg-zinc-800 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {criteria.required_outcome && (
                                <Card className="bg-zinc-900 border border-zinc-800 p-6 ">
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">
                                        Resultado Necessario
                                    </span>
                                    <p className="text-white font-medium mt-3 leading-relaxed">
                                        {criteria.required_outcome}
                                    </p>
                                </Card>
                            )}
                            {criteria.appropriate_experience && (
                                <Card className="bg-zinc-900 border border-zinc-800 p-6 ">
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">
                                        Experiencia Apropriada
                                    </span>
                                    <p className="text-white font-medium mt-3 leading-relaxed">
                                        {criteria.appropriate_experience}
                                    </p>
                                </Card>
                            )}
                        </div>

                        {criteria.ttfv_definition && (
                            <Card className="bg-zinc-900/50 border border-zinc-800 p-4 mt-4 flex items-start gap-3">
                                <Cpu className="w-4 h-4 text-[#00CC6A] mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-xxs font-black text-zinc-500 uppercase tracking-widest">
                                        Primeiro Valor (TTFV)
                                    </span>
                                    <p className="text-sm text-zinc-300 mt-1">{criteria.ttfv_definition}</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </Section>

                {/* HEALTH SCORE + MILESTONES */}
                <Section className="py-16 border-t border-zinc-900">
                    <div className="container-custom max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-5 h-5 text-[#00CC6A]" />
                            <span className="text-xxs font-black text-[#00CC6A] uppercase tracking-[0.25em]">
                                Progresso e Saude
                            </span>
                            <div className="h-px bg-zinc-800 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-5">
                                <HealthScoreCard
                                    dimensions={healthDimensions}
                                    milestonesCompleted={completedCount}
                                    totalMilestones={milestones.length}
                                />
                            </div>
                            <div className="lg:col-span-7">
                                <SuccessMilestones
                                    milestones={milestones}
                                    kickoffDate={plan.created_at}
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ONBOARDING PHASES */}
                {onboardingPhases.length > 0 && (
                    <Section className="py-16 border-t border-zinc-900">
                        <div className="container-custom max-w-5xl mx-auto">
                            <div className="flex items-center gap-3 mb-8">
                                <Rocket className="w-5 h-5 text-[#00CC6A]" />
                                <span className="text-xxs font-black text-[#00CC6A] uppercase tracking-[0.25em]">
                                    Fases do Onboarding
                                </span>
                                <div className="h-px bg-zinc-800 flex-1" />
                            </div>

                            <div className="space-y-4">
                                {onboardingPhases.map((phase: any, idx: number) => (
                                    <Card key={idx} className="bg-zinc-900 border border-zinc-800 p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Phase number */}
                                            <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-black text-[#00CC6A]">{idx + 1}</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-black text-white">{phase.name}</h3>
                                                    <span className="text-2xs font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                                                        {phase.duration_days} dias
                                                    </span>
                                                </div>

                                                {/* Objectives */}
                                                {phase.objectives?.length > 0 && (
                                                    <div className="mb-3">
                                                        <span className="text-2xs font-black text-zinc-500 uppercase tracking-widest">Objetivos</span>
                                                        <ul className="mt-1 space-y-1">
                                                            {phase.objectives.map((obj: string, oi: number) => (
                                                                <li key={oi} className="flex items-start gap-2">
                                                                    <ArrowRight className="w-3 h-3 text-[#00CC6A] mt-0.5 flex-shrink-0" />
                                                                    <span className="text-xs text-zinc-400">{obj}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Deliverables */}
                                                {phase.deliverables?.length > 0 && (
                                                    <div className="mb-3">
                                                        <span className="text-2xs font-black text-zinc-500 uppercase tracking-widest">Entregaveis</span>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {phase.deliverables.map((d: string, di: number) => (
                                                                <span key={di} className="text-xxs font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                                                                    {d}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Success signal */}
                                                {phase.success_signal && (
                                                    <div className="flex items-start gap-2 mt-2 bg-zinc-800/50 p-2.5">
                                                        <CheckCircle2 className="w-3 h-3 text-[#00CC6A] mt-0.5 flex-shrink-0" />
                                                        <span className="text-xs text-zinc-300">{phase.success_signal}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </Section>
                )}

                {/* RISK MITIGATION */}
                {(risks.risks?.length > 0 || risks.red_flags?.length > 0) && (
                    <Section className="py-16 border-t border-zinc-900">
                        <div className="container-custom max-w-5xl mx-auto">
                            <RiskMitigationPanel
                                risks={risks.risks || []}
                                redFlags={risks.red_flags || []}
                                churnPrevention={risks.churn_prevention}
                            />
                        </div>
                    </Section>
                )}

                {/* FOOTER */}
                <Section className="py-12 border-t border-zinc-900">
                    <div className="container-custom max-w-5xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Users className="w-4 h-4 text-zinc-600" />
                            <span className="text-xxs font-black text-zinc-600 uppercase tracking-[0.25em]">
                                Handoff: {collab.handoff_from || 'Sales'} {'->'} {collab.handoff_to || 'CSM'}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                            Success Plan gerado por RevHackers AI | Versao {collab.version || 1}
                        </p>
                    </div>
                </Section>
            </div>
        </PageLayout>
    );
}
