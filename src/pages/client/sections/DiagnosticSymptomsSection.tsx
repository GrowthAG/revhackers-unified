import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

interface DiagnosticSectionProps {
    plan: any;
}

export default function DiagnosticSection({ plan }: DiagnosticSectionProps) {
    const diagnostic = plan.diagnostic_data || {};
    const context = diagnostic.context_mirror || null;
    const signals = diagnostic.signals || [];

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full text-foreground">
            {/* Cabeçalho */}
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Diagnóstico"
                    titleLine1="Sintomas e Cenário"
                    titleLine2="Visão do Campo"
                    description="O contexto de negócio que você vive hoje e os sinais mapeados em nossa imersão inicial."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full flex flex-col justify-start gap-8">
                {/* ── Context Mirror - Dark Block ── */}
                {context && (
                    <div className="bg-zinc-950 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {[
                                { label: 'Segmento', value: context.segment },
                                { label: 'Objetivo Principal', value: context.objective },
                                { label: 'Maturidade Digital', value: context.maturity },
                                { label: 'Restrições', value: context.restrictions },
                            ].map((item, i) => (
                                <div key={i} className={`p-7 md:p-8 ${i < 2 ? 'border-b border-zinc-800' : ''} ${i % 2 === 0 ? 'md:border-r border-zinc-800' : ''}`}>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] block mb-3">{item.label}</span>
                                    <EditableField
                                        path={`diagnostic_data.context_mirror.${['segment', 'objective', 'maturity', 'restrictions'][i]}`}
                                        className="text-lg font-bold text-white leading-snug"
                                        placeholder={item.value || '-'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Sinais Estratégicos - Card Grid ── */}
                {signals.length > 0 && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-bold text-zinc-900 uppercase tracking-[0.2em]">Sinais Estratégicos</h4>
                            <span className="text-[11px] font-bold text-zinc-400">
                                {signals.length} {signals.length === 1 ? 'sinal mapeado' : 'sinais mapeados'}
                            </span>
                        </div>

                        <div className={`grid grid-cols-1 ${signals.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                            {signals.map((signal: any, i: number) => {
                                return (
                                    <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                Sinal {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Quote */}
                                        <div className="mb-auto pb-5">
                                            <EditableField
                                                path={`diagnostic_data.signals.${i}.text`}
                                                className="text-[17px] font-bold text-zinc-900 leading-snug tracking-tight"
                                                placeholder={signal.text}
                                                multiline
                                            />
                                        </div>

                                        {/* Impact */}
                                        <div className="pt-4 border-t border-zinc-100">
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 block mb-1.5">Impacto Real</span>
                                            <EditableField
                                                path={`diagnostic_data.signals.${i}.impact`}
                                                className="text-sm font-medium text-zinc-500 leading-relaxed"
                                                placeholder={signal.impact}
                                                multiline
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
