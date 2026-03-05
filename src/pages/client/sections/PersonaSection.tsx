import React, { useState } from 'react';
import { EditableField, usePlanEdit } from '@/components/plan/PlanEditContext';
import { MessageSquare, Mail, Instagram, Facebook, Globe, Youtube, Linkedin, Send } from 'lucide-react';

// ── Female name list for avatar gender detection ──────────────────────────
const femaleNames = ['maria', 'ana', 'mariana', 'juliana', 'fernanda', 'patricia', 'carla', 'claudia', 'lucia', 'beatriz', 'camila', 'amanda', 'priscila', 'gabriela', 'alessandra', 'bruna', 'larissa', 'natalia', 'leticia', 'aline'];

function detectGender(name: string) {
    const first = name.split(' ')[0].toLowerCase();
    return femaleNames.some(f => first.includes(f)) ? 'women' : 'men';
}

function nameToIndex(name: string, idx: number) {
    let hash = idx * 7;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 70;
    return Math.abs(hash) + 1;
}

// ── Persona Avatar ────────────────────────────────────────────────────────
function PersonaAvatar({ name, index }: { name: string; index: number }) {
    const gender = detectGender(name);
    const imgIdx = nameToIndex(name, index);
    const url = `https://randomuser.me/api/portraits/${gender}/${imgIdx}.jpg`;
    const initial = name?.charAt(0) || '?';
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="w-14 h-14 rounded-full bg-zinc-700 border-2 border-zinc-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-black">{initial}</span>
            </div>
        );
    }

    return (
        <img
            src={url}
            alt={name}
            className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white/20"
            onError={() => setError(true)}
        />
    );
}

// ── Channel Icon Resolver ─────────────────────────────────────────────────
function resolveChannel(channel: string) {
    const lower = channel.toLowerCase().trim();
    if (lower.includes('whatsapp')) return { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'WhatsApp' };
    if (lower.includes('linkedin')) return { icon: <Linkedin className="w-3.5 h-3.5" />, label: 'LinkedIn' };
    if (lower.includes('email') || lower.includes('e-mail')) return { icon: <Mail className="w-3.5 h-3.5" />, label: 'E-mail' };
    if (lower.includes('instagram')) return { icon: <Instagram className="w-3.5 h-3.5" />, label: 'Instagram' };
    if (lower.includes('facebook')) return { icon: <Facebook className="w-3.5 h-3.5" />, label: 'Facebook' };
    if (lower.includes('google')) return { icon: <Globe className="w-3.5 h-3.5" />, label: 'Google' };
    if (lower.includes('youtube')) return { icon: <Youtube className="w-3.5 h-3.5" />, label: 'YouTube' };
    return { icon: <Send className="w-3.5 h-3.5" />, label: channel };
}

// ── Trait Slider ──────────────────────────────────────────────────────────
function TraitSlider({ left, right, value, personaIndex, traitKey }: {
    left: string; right: string; value: number; personaIndex: number; traitKey: string;
}) {
    const { isEditing, setField, getField } = usePlanEdit();
    const path = `persona_data.personas.${personaIndex}.personality.${traitKey}`;
    const rawVal = getField(path);
    const v = rawVal !== '' && !isNaN(Number(rawVal)) ? Number(rawVal) : value;

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 text-xs">
                <style>{`
          .trait-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 99px; background: #e4e4e7; outline: none; cursor: pointer; }
          .trait-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #09090b; border: 2px solid #00CC6A; cursor: grab; transition: transform 0.15s; }
          .trait-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.3); }
        `}</style>
                <span className="w-20 text-right text-zinc-500 leading-tight">{left}</span>
                <div className="flex-1 relative py-1">
                    <input type="range" min="0" max="100" value={v} onChange={e => setField(path, e.target.value)} className="trait-slider w-full" />
                </div>
                <span className="w-20 text-zinc-500 leading-tight">{right}</span>
                <span className="w-6 text-right font-mono text-xs text-[#00CC6A] shrink-0">{v}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className={`w-20 text-right ${v < 40 ? 'text-zinc-800 font-semibold' : 'text-zinc-400'}`}>{left}</span>
            <div className="flex-1 h-1 bg-zinc-100 rounded-full relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-900 rounded-full shadow-sm transition-all" style={{ left: `calc(${v}% - 5px)` }} />
            </div>
            <span className={`w-20 ${v > 60 ? 'text-zinc-800 font-semibold' : 'text-zinc-400'}`}>{right}</span>
        </div>
    );
}

// ── Default Personas ──────────────────────────────────────────────────────
const defaultPersonas = [
    {
        name: 'Ricardo Mendes', age: 44, role: 'CEO / Founder B2B',
        company_context: 'Empresa B2B com 50 a 200 colaboradores', location: 'São Paulo, SP',
        bio: 'Ricardo lidera a operação comercial e precisa de previsibilidade de receita. Está exausto de ferramentas fragmentadas e dashboards que nunca batem.',
        channels: ['E-mail', 'WhatsApp', 'Google', 'LinkedIn'],
        personality: { analytical_creative: 25, passive_active: 70, reserved_extroverted: 55, reactive_preventive: 35 },
        pain: 'Churn alto e não sabe por quê. Dados fragmentados entre 5 ferramentas sem visão unificada.',
        trigger: 'MRR estagnado por 3 meses ou queda de NPS abaixo de 7.',
        message: 'Transforme dados dispersos em receita previsível com um sistema único de Revenue Operations.',
        wiifm: 'Dormir tranquilo sabendo exatamente de onde vem o lucro e o prejuízo.',
    },
    {
        name: 'Mariana Costa', age: 38, role: 'Head de Vendas',
        company_context: 'Scale-up ou mid-market em crescimento acelerado', location: 'Belo Horizonte, MG',
        bio: 'Mariana lidera o time de vendas e lida com pipeline invisível e follow-up manual. Quer previsibilidade de quota e automações que funcionem.',
        channels: ['WhatsApp', 'LinkedIn', 'E-mail'],
        personality: { analytical_creative: 50, passive_active: 80, reserved_extroverted: 65, reactive_preventive: 40 },
        pain: 'Time perde 40% do tempo em tarefas manuais que não geram receita. CRM não é usado.',
        trigger: 'Metas não batidas por 2 trimestres e pressão da diretoria.',
        message: 'Automatize o que não vende e libere seu time para fechar contratos maiores.',
        wiifm: 'Bater meta e ser reconhecida sem trabalhar mais horas.',
    },
    {
        name: 'Felipe Rodrigues', age: 33, role: 'Head de Marketing e Growth',
        company_context: 'SaaS B2B com investimento em marketing digital', location: 'Curitiba, PR',
        bio: 'Felipe é responsável por gerar leads e está sob pressão constante de CAC. Investe em tráfego pago mas não consegue rastrear o impacto real.',
        channels: ['LinkedIn', 'Google', 'Instagram', 'E-mail'],
        personality: { analytical_creative: 70, passive_active: 75, reserved_extroverted: 60, reactive_preventive: 55 },
        pain: 'Não consegue provar ROI das campanhas para justificar budget para a diretoria.',
        trigger: 'Corte de budget iminente ou troca de gestão questionando resultados.',
        message: 'Rastreamento ponta a ponta do lead ao contrato fechado em dashboards que qualquer diretoria entende.',
        wiifm: 'Budget aprovado, promoção e reconhecimento técnico pelo time.',
    },
];

// ── PersonaCard ───────────────────────────────────────────────────────────
function PersonaCard({ persona, index }: { persona: any; index: number }) {
    const p = persona;
    const channels = p.channels || ['LinkedIn', 'E-mail', 'WhatsApp'];
    const personality = p.personality || { analytical_creative: 50, passive_active: 50, reserved_extroverted: 50, reactive_preventive: 50 };

    return (
        <div className="flex flex-col bg-white border border-zinc-200 overflow-hidden h-full">
            {/* Dark header with avatar */}
            <div className="bg-zinc-950 p-5">
                <div className="flex items-start gap-4 mb-3">
                    <div className="shrink-0">
                        <PersonaAvatar name={p.name} index={index} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="block mb-1">
                            <EditableField path={`persona_data.personas.${index}.name`} className="text-white font-black text-lg leading-tight block" placeholder={p.name} />
                        </div>
                        <div className="block mb-1.5">
                            <EditableField path={`persona_data.personas.${index}.role`} className="text-[#00CC6A] text-sm font-semibold uppercase tracking-wide block" placeholder={p.role} />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            {p.age && <EditableField path={`persona_data.personas.${index}.age`} className="text-zinc-500 text-xs" placeholder={`${p.age} anos`} />}
                            {p.age && p.location && <span className="text-zinc-600">·</span>}
                            {p.location && <EditableField path={`persona_data.personas.${index}.location`} className="text-zinc-500 text-xs" placeholder={p.location} />}
                        </div>
                    </div>
                </div>
                {p.company_context && (
                    <EditableField path={`persona_data.personas.${index}.company_context`} className="text-zinc-400 text-xs border-t border-zinc-800 pt-3 block" placeholder={p.company_context} />
                )}
            </div>

            {/* Bio */}
            {p.bio && (
                <div className="px-5 pt-4 pb-0">
                    <EditableField path={`persona_data.personas.${index}.bio`} className="text-zinc-500 text-xs leading-relaxed" placeholder={p.bio} multiline />
                </div>
            )}

            {/* Pain + Trigger */}
            <div className="grid grid-cols-2 gap-3 p-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded p-3">
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">😤 Dor Principal</p>
                    <EditableField path={`persona_data.personas.${index}.pain`} className="text-xs text-zinc-800 leading-relaxed font-medium" placeholder={p.pain} multiline />
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded p-3">
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">⚡ Evento Crítico</p>
                    <EditableField path={`persona_data.personas.${index}.trigger`} className="text-xs text-zinc-800 leading-relaxed font-medium" placeholder={p.trigger} multiline />
                </div>
            </div>

            {/* Message + WIIFM */}
            <div className="px-4 pb-3 space-y-2">
                <div className="p-3 bg-black rounded">
                    <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className="w-3 h-3 text-[#00CC6A]" />
                        <p className="text-xs font-bold text-[#00CC6A] uppercase tracking-widest">Mensagem que Converte</p>
                    </div>
                    <EditableField path={`persona_data.personas.${index}.message`} className="text-xs text-white font-semibold italic" placeholder={p.message} multiline />
                </div>
                {p.wiifm && (
                    <div className="p-2.5 border border-zinc-200 rounded">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">O que ele ganha</p>
                        <EditableField path={`persona_data.personas.${index}.wiifm`} className="text-xs text-zinc-600" placeholder={p.wiifm} />
                    </div>
                )}
            </div>

            {/* Personality Traits */}
            <div className="px-4 pb-3">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Perfil</p>
                <div className="space-y-2">
                    <TraitSlider left="Analítico" right="Criativo" value={personality.analytical_creative ?? 50} personaIndex={index} traitKey="analytical_creative" />
                    <TraitSlider left="Passivo" right="Ativo" value={personality.passive_active ?? 50} personaIndex={index} traitKey="passive_active" />
                    <TraitSlider left="Reservado" right="Extrovertido" value={personality.reserved_extroverted ?? 50} personaIndex={index} traitKey="reserved_extroverted" />
                    <TraitSlider left="Reativo" right="Preventivo" value={personality.reactive_preventive ?? 50} personaIndex={index} traitKey="reactive_preventive" />
                </div>
            </div>

            {/* Channels */}
            <div className="mt-auto border-t border-zinc-100 px-4 py-3 flex items-center gap-3">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">Canais:</p>
                <div className="flex gap-2">
                    {channels.slice(0, 5).map((ch: string, i: number) => {
                        const resolved = resolveChannel(ch);
                        return <span key={i} className="text-zinc-500" title={resolved.label}>{resolved.icon}</span>;
                    })}
                </div>
            </div>
        </div>
    );
}

// ── PersonaSection ────────────────────────────────────────────────────────
export default function PersonaSection({ plan }: { plan: any }) {
    const personaData = plan.persona_data || {};
    const personas = personaData.personas || [];
    const displayPersonas = personas.length > 0 ? personas : defaultPersonas;
    const isREIFallback = personaData._data_source === 'rei_fallback';
    const isDefault = personas.length === 0;

    return (
        <div className="space-y-10">
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-px bg-zinc-900" />
                    <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Quem Compramos</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-[1.05] mb-4">
                    Persona &<br />
                    <span className="text-zinc-400">Tomadores de Decisão</span>
                </h2>
                <p className="text-zinc-500">
                    Perfis detalhados dos decisores: personalidade, canais, dores, gatilhos e critérios de compra.
                </p>
                {isREIFallback && !isDefault && (
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <p className="text-xs text-zinc-400">Persona construída com base no ICP declarado no REI — aprofundamento disponível via "Deep Personas"</p>
                    </div>
                )}
                {isDefault && (
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <p className="text-xs text-zinc-400">Perfis de referência — personalize via "Deep Personas" ou preenchendo o campo ICP no formulário REI</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayPersonas.slice(0, 3).map((persona: any, i: number) => (
                    <PersonaCard key={i} persona={persona} index={i} />
                ))}
            </div>
        </div>
    );
}
