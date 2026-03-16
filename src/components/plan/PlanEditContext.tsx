import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Loader2, Check, Download } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface PlanEditContextType {
    isEditing: boolean;
    saving: boolean;
    savedAt: Date | null;
    getField: (path: string) => any;
    setField: (path: string, value: any) => void;
    save: () => Promise<void>;
    pendingChanges: Record<string, any>;
}

// ── Context ────────────────────────────────────────────────────────────────
const PlanEditCtx = createContext<PlanEditContextType | null>(null);

export function usePlanEdit() {
    const ctx = useContext(PlanEditCtx);
    if (!ctx) throw new Error('usePlanEdit must be used within PlanEditProvider');
    return ctx;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
}

function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.');
    const clone = JSON.parse(JSON.stringify(obj));
    let current = clone;
    for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined || current[keys[i]] === null) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return clone;
}

// ── Provider ───────────────────────────────────────────────────────────────
export function PlanEditProvider({
    children,
    plan,
    planId,
    isEditing,
    onPlanUpdate,
}: {
    children: React.ReactNode;
    plan: any;
    planId: string;
    isEditing: boolean;
    onPlanUpdate: (plan: any) => void;
}) {
    const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    const getField = useCallback(
        (path: string) => (path in pendingChanges ? pendingChanges[path] : getNestedValue(plan, path)),
        [plan, pendingChanges]
    );

    const setField = useCallback((path: string, value: any) => {
        setPendingChanges(prev => ({ ...prev, [path]: value }));
    }, []);

    const save = useCallback(async () => {
        if (!planId || Object.keys(pendingChanges).length === 0) return;
        setSaving(true);
        try {
            let updated = { ...plan };
            for (const [path, value] of Object.entries(pendingChanges)) {
                updated = setNestedValue(updated, path, value);
            }
            const topKeys = new Set(Object.keys(pendingChanges).map(p => p.split('.')[0]));
            const payload: Record<string, any> = {};
            topKeys.forEach(k => { payload[k] = updated[k]; });

            const { error } = await supabase.from('strategic_plans').update(payload).eq('id', planId);
            if (error) throw error;

            onPlanUpdate(updated);
            setPendingChanges({});
            setSavedAt(new Date());
        } catch (err) {
            console.error('Error saving plan edits:', err);
        } finally {
            setSaving(false);
        }
    }, [plan, planId, pendingChanges, onPlanUpdate]);

    // --- Auto-Save Effect ---
    // Keep a stable reference to pendingChanges length and the save function
    const pendingCount = Object.keys(pendingChanges).length;
    useEffect(() => {
        if (pendingCount === 0 || !isEditing) return;

        const timer = setTimeout(() => {
            save();
        }, 2000); // 2 seconds debounce

        return () => clearTimeout(timer);
    }, [pendingChanges, isEditing, save, pendingCount]);

    return (
        <PlanEditCtx.Provider value={{ isEditing, saving, savedAt, getField, setField, save, pendingChanges }}>
            {children}
        </PlanEditCtx.Provider>
    );
}

// ── EditableField ──────────────────────────────────────────────────────────
export function EditableField({
    path,
    className = '',
    multiline = false,
    placeholder,
}: {
    path: string;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
}) {
    const { isEditing, getField, setField } = usePlanEdit();
    const value = getField(path);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => { setLocalValue(getField(path)); }, [path, getField]);

    if (!isEditing) return <span className={className}>{value || placeholder || ''}</span>;

    const cls = `w-full bg-transparent border-b-2 border-[#00CC6A] focus:outline-none resize-none transition-colors ${className}`;

    return multiline ? (
        <textarea
            value={localValue}
            onChange={e => { setLocalValue(e.target.value); setField(path, e.target.value); }}
            className={cls}
            rows={Math.max(2, (localValue || '').split('\n').length)}
            placeholder={placeholder}
        />
    ) : (
        <input
            type="text"
            value={localValue}
            onChange={e => { setLocalValue(e.target.value); setField(path, e.target.value); }}
            className={cls}
            placeholder={placeholder}
        />
    );
}

// ── EditToolbar ────────────────────────────────────────────────────────────
export function EditToolbar() {
    const { isEditing, saving, savedAt, save, pendingChanges } = usePlanEdit();
    const hasChanges = Object.keys(pendingChanges).length > 0;

    if (!isEditing) return null;

    return (
        <>
            <style>{`
        @media print {
          .plan-edit-bar, header, footer { display: none !important; }
          body, html { height: auto !important; overflow: visible !important; }
          .plan-presentation { height: auto !important; overflow: visible !important; }
          main { overflow: visible !important; height: auto !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>
            <div className="plan-edit-bar fixed top-0 left-0 right-0 z-[200] bg-zinc-950 border-b border-[#00CC6A]/30 flex items-center justify-between px-6 py-2.5">
                <div className="flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 text-[#00CC6A]" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Modo Edição - Admin</span>
                    {hasChanges && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {Object.keys(pendingChanges).length} alteração{Object.keys(pendingChanges).length !== 1 ? 'ões' : ''} não salva{Object.keys(pendingChanges).length !== 1 ? 's' : ''}
                        </span>
                    )}
                    {savedAt && !hasChanges && (
                        <span className="ml-2 text-[10px] text-[#00CC6A] font-mono flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Salvo às {savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500">Clique em qualquer texto para editar</span>
                    <button
                        onClick={() => window.print()}
                        title="Exportar como PDF"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        <Download className="w-3 h-3" /> PDF
                    </button>
                    <button
                        onClick={save}
                        disabled={saving || !hasChanges}
                        className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${hasChanges ? 'bg-[#00CC6A] text-black hover:bg-[#00AA55]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </>
    );
}
