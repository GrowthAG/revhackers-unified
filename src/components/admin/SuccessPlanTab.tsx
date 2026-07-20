import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Cpu, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import HealthScoreCard from './HealthScoreCard';
import SuccessMilestones from './SuccessMilestones';
import RiskMitigationPanel from './RiskMitigationPanel';
import { completeMilestone } from '@/api/successPlan';
import { useToast } from '@/hooks/use-toast';

interface SuccessPlanTabProps {
    projectId: string;
}

export function SuccessPlanTab({ projectId }: SuccessPlanTabProps) {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const loadPlan = async () => {
        setLoading(true);
        try {
            const [planRes] = await Promise.all([
                supabase
                    .from('strategic_plans')
                    .select('*')
                    .eq('rei_project_id', projectId)
                    .eq('plan_type', 'success_plan')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
            ]);

            if (planRes.error) console.error('[SuccessPlanTab] Error:', planRes.error);
            setPlan(planRes.data);
        } catch (err) {
            console.error('[SuccessPlanTab] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlan();
    }, [projectId]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const { error } = await supabase.functions.invoke('generate-success-plan', {
                body: { project_id: projectId },
            });

            if (error) {
                toast({ title: 'Erro', description: error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Success Plan gerado', description: 'AI preencheu criterios de sucesso e riscos.' });
                await loadPlan();
            }
        } catch (err: any) {
            toast({ title: 'Erro', description: err?.message || 'Falha na geracao', variant: 'destructive' });
        } finally {
            setGenerating(false);
        }
    };

    const handleCompleteMilestone = async (index: number) => {
        if (!plan?.id) return;
        const success = await completeMilestone(plan.id, index);
        if (success) {
            toast({ title: 'Milestone concluido' });
            await loadPlan();
        }
    };

    const handleCopyLink = () => {
        if (!plan?.access_token) return;
        const url = `${window.location.origin}/success/${plan.access_token}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: 'Link copiado' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="border-2 border-dashed border-zinc-200 py-16 text-center">
                <Cpu className="w-8 h-8 text-black mx-auto mb-3" />
                <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">Nenhum Success Plan Encontrado</h3>
                <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
                    O Success Plan e criado automaticamente quando uma oportunidade e convertida em projeto.
                    Voce pode gerar um manualmente agora.
                </p>
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-xs h-10 px-6 w-full max-w-sm"
                >
                    {generating ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando com AI (pode levar 30s)...</>
                    ) : (
                        <><Cpu className="w-4 h-4 mr-2" /> Gerar Success Plan</>
                    )}
                </Button>
            </div>
        );
    }

    const criteria = plan.success_criteria_data || {};
    const risks = plan.risk_mitigation_data || {};
    const milestones = criteria.success_milestones || [];
    const completedCount = milestones.filter((m: any) => m.completed).length;
    const isPending = criteria.status === 'pending_generation';

    const healthDimensions = criteria.health_dimensions || {
        adoption: { weight: 0.30, indicators: [], initial_score: 50 },
        engagement: { weight: 0.25, indicators: [], initial_score: 50 },
        growth: { weight: 0.25, indicators: [], initial_score: 50 },
        sentiment: { weight: 0.20, indicators: [], initial_score: 50 },
    };

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">Success Plan</h2>
                    {criteria.desired_outcome_statement && (
                        <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{criteria.desired_outcome_statement}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {plan.access_token && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className="text-xs font-bold uppercase tracking-widest"
                        >
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#00CC6A]" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                            {copied ? 'Copiado' : 'Link Publico'}
                        </Button>
                    )}
                    {plan.access_token && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/success/${plan.access_token}`, '_blank')}
                            className="text-xs font-bold uppercase tracking-widest"
                        >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Visualizar
                        </Button>
                    )}
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        size="sm"
                        className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest"
                    >
                        {generating ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Gerando...</>
                        ) : (
                            <><Cpu className="w-3.5 h-3.5 mr-1.5" /> {isPending ? 'Gerar com Hardware AI' : 'Regenerar Processamento'}</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Pending state */}
            {isPending && (
                <div className="bg-zinc-50 border border-zinc-200 p-8 text-center max-w-2xl mx-auto">
                    <Cpu className="w-6 h-6 text-black mx-auto mb-3" />
                    <h3 className="text-sm font-black text-black uppercase tracking-widest mb-1">Aguardando Hardware</h3>
                    <p className="text-xs text-zinc-500 mb-6">
                        O success plan foi criado mas os criterios de sucesso ainda nao foram gerados pela AI.
                    </p>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-xs h-10 px-6 w-full"
                    >
                        {generating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando...</> : <><Cpu className="w-4 h-4 mr-2" /> Gerar Agora</>}
                    </Button>
                </div>
            )}

            {/* Content - only show if generated */}
            {!isPending && (
                <>
                    {/* Desired Outcome cards */}
                    {(criteria.required_outcome || criteria.appropriate_experience) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {criteria.required_outcome && (
                                <div className="bg-white border border-zinc-200 shadow-sm p-5">
                                    <span className="text-xxs font-black text-zinc-400 uppercase tracking-widest">
                                        Resultado Necessario
                                    </span>
                                    <p className="text-sm font-medium text-zinc-900 mt-2 leading-relaxed">
                                        {criteria.required_outcome}
                                    </p>
                                </div>
                            )}
                            {criteria.appropriate_experience && (
                                <div className="bg-white border border-zinc-200 shadow-sm p-5">
                                    <span className="text-xxs font-black text-zinc-400 uppercase tracking-widest">
                                        Experiencia Apropriada
                                    </span>
                                    <p className="text-sm font-medium text-zinc-900 mt-2 leading-relaxed">
                                        {criteria.appropriate_experience}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Health Score + Milestones */}
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
                                onCompleteMilestone={handleCompleteMilestone}
                            />
                        </div>
                    </div>

                    {/* Risk Mitigation */}
                    {(risks.risks?.length > 0 || risks.red_flags?.length > 0) && (
                        <RiskMitigationPanel
                            risks={risks.risks || []}
                            redFlags={risks.red_flags || []}
                            churnPrevention={risks.churn_prevention}
                        />
                    )}
                </>
            )}
        </div>
    );
}
