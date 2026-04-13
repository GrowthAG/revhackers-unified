import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardCheck,
    ChevronDown,
    ChevronUp,
    Activity,
    Calendar,
    FileText,
    Loader2,
    BarChart3,
    ArrowRight,
    Link2,
    Check,
} from 'lucide-react';
import { getReiResponsesByProject, type ReiResponse } from '@/api/reiResponses';
import { REI_CONFIGS } from '@/config/rei/index';
import type { REIType, REISection } from '@/types/rei';

// Labels for crm_ops fields (not in REI_CONFIGS)
const CRM_OPS_LABELS: Record<string, string> = {
    revops_objetivo_principal: 'Objetivo Principal',
    revops_segmento: 'Segmento',
    revops_concorrente1_nome: 'Concorrente 1',
    revops_concorrente2_nome: 'Concorrente 2',
    revops_concorrente3_nome: 'Concorrente 3',
    revops_tamanho_time: 'Tamanho do Time',
    revops_mrr_atual: 'MRR Atual',
    revops_cac_atual: 'CAC Atual',
    revops_sales_cycle_days: 'Ciclo de Vendas (dias)',
    revops_custom_pipelines: 'Pipelines Customizados',
    revops_custom_lost_reasons: 'Motivos de Perda',
};

interface DiagnosticResponsesPanelProps {
    projectId: string;
    projectType?: string;
}

// Build a flat map of field ID -> label from REI config sections
function buildFieldLabels(type: string): Record<string, string> {
    const labels: Record<string, string> = {};

    // Check standard REI configs
    const reiType = type as REIType;
    const config = REI_CONFIGS[reiType];
    if (config?.sections) {
        for (const section of config.sections) {
            for (const q of section.questions) {
                labels[q.id] = q.label;
            }
        }
    }

    // Always merge crm_ops labels
    Object.assign(labels, CRM_OPS_LABELS);

    return labels;
}

// Group form data fields by REI section if config is available
function groupBySection(
    formData: Record<string, any>,
    type: string
): { title: string; fields: { key: string; label: string; value: any }[] }[] {
    const reiType = type as REIType;
    const config = REI_CONFIGS[reiType];

    if (config?.sections) {
        const groups: { title: string; fields: { key: string; label: string; value: any }[] }[] = [];
        const usedKeys = new Set<string>();

        for (const section of config.sections) {
            const fields: { key: string; label: string; value: any }[] = [];
            for (const q of section.questions) {
                if (formData[q.id] !== undefined && formData[q.id] !== '' && formData[q.id] !== null) {
                    fields.push({ key: q.id, label: q.label, value: formData[q.id] });
                    usedKeys.add(q.id);
                }
            }
            if (fields.length > 0) {
                groups.push({ title: section.title, fields });
            }
        }

        // Add remaining fields not in config
        const remaining: { key: string; label: string; value: any }[] = [];
        for (const [key, value] of Object.entries(formData)) {
            if (!usedKeys.has(key) && value !== undefined && value !== '' && value !== null) {
                const label = CRM_OPS_LABELS[key] || humanizeKey(key);
                remaining.push({ key, label, value });
            }
        }
        if (remaining.length > 0) {
            groups.push({ title: 'Outros Campos', fields: remaining });
        }

        return groups;
    }

    // No config - flat grouping
    const allLabels = buildFieldLabels(type);
    const fields = Object.entries(formData)
        .filter(([_, v]) => v !== undefined && v !== '' && v !== null)
        .map(([key, value]) => ({
            key,
            label: allLabels[key] || humanizeKey(key),
            value,
        }));

    return fields.length > 0 ? [{ title: 'Respostas', fields }] : [];
}

function humanizeKey(key: string): string {
    return key
        .replace(/^revops_/, '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2);
    return String(value);
}

function getMaturityColor(percentage: number): string {
    if (percentage >= 80) return '#00CC6A';
    if (percentage >= 60) return '#52525b'; // zinc-600
    if (percentage >= 40) return '#a1a1aa'; // zinc-400
    return '#d4d4d8'; // zinc-300
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        consulting: 'Consultoria 360',
        founder: 'Founder Growth',
        dev: 'Dev Web & Design',
        crm_ops: 'CRM & RevOps',
        diagnostic: 'Diagnostico',
        rei: 'REI',
        quiz: 'Quiz',
    };
    return labels[type] || type;
}

function getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
        rei: 'REI (Reuniao Estrategica)',
        diagnostic: 'Diagnostico',
        quiz: 'Quiz Publico',
    };
    return labels[source] || source;
}

// ---- Collapsible Section ----
function CollapsibleSection({ title, children, defaultOpen = false }: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-zinc-200 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
                <span className="text-tiny font-black uppercase tracking-widest text-zinc-600">
                    {title}
                </span>
                {open
                    ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                }
            </button>
            {open && (
                <div className="px-4 py-3 space-y-3 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
}

// ---- Radar Mini Chart (text-based) ----
function RadarSummary({ radarData }: { radarData: { label: string; value: number }[] }) {
    if (!radarData || radarData.length === 0) return null;
    const max = 100;
    return (
        <div className="space-y-2">
            {radarData.map((item, i) => (
                <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-tiny font-bold text-zinc-600">{item.label}</span>
                        <span className="text-tiny font-black text-zinc-900">{item.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 overflow-hidden">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (item.value / max) * 100)}%`,
                                backgroundColor: getMaturityColor(item.value),
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---- Single Response Card ----
function ResponseCard({ response, projectType, index }: {
    response: ReiResponse;
    projectType: string;
    index: number;
}) {
    const [expanded, setExpanded] = useState(index === 0);

    const responses = response.responses as {
        form_data?: Record<string, any>;
        radar_data?: { label: string; value: number }[];
        insights?: string[];
        diagnostic_type?: string;
    } | null;

    const formData = responses?.form_data || {};
    const radarData = responses?.radar_data || [];
    const insights = responses?.insights || [];
    const diagType = responses?.diagnostic_type || response.source || projectType;

    const groups = groupBySection(formData, diagType);
    const completedAt = response.completed_at
        ? new Date(response.completed_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Data desconhecida';

    return (
        <div className="border border-zinc-200 shadow-sm bg-white overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-zinc-900 tracking-tight">
                                {getTypeLabel(diagType)}
                            </span>
                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5">
                                {getSourceLabel(response.source || 'rei')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span className="text-tiny text-zinc-500 font-medium">{completedAt}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Maturity Score Badge */}
                    {response.maturity_percentage != null && (
                        <div className="text-right">
                            <div className="flex items-end gap-1">
                                <span className="text-2xl font-black tracking-tight leading-none" style={{ color: getMaturityColor(response.maturity_percentage) }}>
                                    {Math.round(response.maturity_percentage)}
                                </span>
                                <span className="text-xxs font-bold text-zinc-400 mb-0.5">/100</span>
                            </div>
                            {response.maturity_level && (
                                <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">
                                    {response.maturity_level}
                                </span>
                            )}
                        </div>
                    )}
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-zinc-400" />
                        : <ChevronDown className="w-4 h-4 text-zinc-400" />
                    }
                </div>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-zinc-100 px-5 pb-5 space-y-5">
                    {/* Radar Data */}
                    {radarData.length > 0 && (
                        <div className="pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-zinc-500" />
                                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400">
                                    Score por Dimensao
                                </span>
                            </div>
                            <RadarSummary radarData={radarData} />
                        </div>
                    )}

                    {/* Insights */}
                    {insights.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4 text-zinc-500" />
                                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400">
                                    Insights
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-zinc-400 shrink-0 mt-1.5" />
                                        <span className="text-xs text-zinc-600 font-medium leading-relaxed">{insight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form Responses grouped by section */}
                    {groups.length > 0 && (
                        <div className="pt-2 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-zinc-500" />
                                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400">
                                    Respostas do Formulario
                                </span>
                            </div>
                            {groups.map((group, gi) => (
                                <CollapsibleSection key={gi} title={group.title} defaultOpen={gi === 0}>
                                    <div className="space-y-3">
                                        {group.fields.map((field) => (
                                            <div key={field.key}>
                                                <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                                                    {field.label}
                                                </span>
                                                <p className="text-xs text-zinc-700 font-medium leading-relaxed whitespace-pre-wrap">
                                                    {formatValue(field.value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleSection>
                            ))}
                        </div>
                    )}

                    {/* Empty state for no form data */}
                    {groups.length === 0 && radarData.length === 0 && insights.length === 0 && (
                        <div className="pt-4 text-center">
                            <p className="text-xs text-zinc-400">Nenhuma resposta detalhada disponivel para este diagnostico.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---- Main Panel ----
export default function DiagnosticResponsesPanel({ projectId, projectType }: DiagnosticResponsesPanelProps) {
    const [responses, setResponses] = useState<ReiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const wizardUrl = `${window.location.origin}/rei/wizard?projectId=${projectId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(wizardUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    useEffect(() => {
        async function load() {
            try {
                const data = await getReiResponsesByProject(projectId);
                setResponses(data);
            } catch (err) {
                console.error('Error loading diagnostic responses:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[40vh]">
                <Loader2 className="animate-spin text-zinc-300 w-6 h-6" />
            </div>
        );
    }

    if (responses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center border border-dashed border-zinc-200 bg-white px-6">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-4">
                    <ClipboardCheck className="w-5 h-5 text-zinc-900" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-2">REI Pendente</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-6">
                    O formulario REI ainda nao foi preenchido. Inicie agora ou compartilhe o link com o cliente para que ele preencha.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/rei/wizard?projectId=${projectId}`)}
                        className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-colors"
                    >
                        Preencher REI
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 border border-zinc-200 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 font-black uppercase tracking-widest text-[10px] h-10 px-4 transition-colors bg-white"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#00CC6A]" /> : <Link2 className="w-3.5 h-3.5" />}
                        {copied ? 'Copiado' : 'Copiar Link'}
                    </button>
                </div>
            </div>
        );
    }

    // Summary stats
    const latestResponse = responses[0];
    const totalDiagnostics = responses.length;

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="border border-zinc-200 shadow-sm bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                        <ClipboardCheck className="w-4 h-4 text-zinc-900" />
                    </div>
                    <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                        Resumo do REI
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400 block mb-1">Total</span>
                        <span className="text-2xl font-black text-zinc-900 tracking-tight">{totalDiagnostics}</span>
                    </div>
                    <div>
                        <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400 block mb-1">Tipo</span>
                        <span className="text-sm font-bold text-zinc-700">{getTypeLabel(projectType || 'consulting')}</span>
                    </div>
                    {latestResponse.maturity_percentage != null && (
                        <div>
                            <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400 block mb-1">Score Atual</span>
                            <span className="text-2xl font-black tracking-tight" style={{ color: getMaturityColor(latestResponse.maturity_percentage) }}>
                                {Math.round(latestResponse.maturity_percentage)}
                            </span>
                            <span className="text-xxs font-bold text-zinc-400 ml-1">/100</span>
                        </div>
                    )}
                    {latestResponse.maturity_level && (
                        <div>
                            <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400 block mb-1">Maturidade</span>
                            <span className="text-xxs font-black uppercase tracking-widest text-zinc-900 bg-zinc-100 px-3 py-1.5 inline-block">
                                {latestResponse.maturity_level}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Response Cards */}
            {responses.map((response, i) => (
                <ResponseCard
                    key={response.id}
                    response={response}
                    projectType={projectType || 'consulting'}
                    index={i}
                />
            ))}
        </div>
    );
}
