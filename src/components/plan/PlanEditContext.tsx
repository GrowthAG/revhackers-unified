import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlanEditContextType {
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    plan: any;
    planId: string;
    onPlanUpdate: (plan: any) => void;
}

const PlanEditCtx = createContext<PlanEditContextType | null>(null);

export function PlanEditProvider({ plan, planId, isEditing: initialEditing = false, onPlanUpdate, children }: {
    plan: any;
    planId: string;
    isEditing?: boolean;
    onPlanUpdate: (plan: any) => void;
    children: ReactNode;
}) {
    const [isEditing, setIsEditing] = useState(initialEditing);
    return (
        <PlanEditCtx.Provider value={{ isEditing, setIsEditing, plan, planId, onPlanUpdate }}>
            {children}
        </PlanEditCtx.Provider>
    );
}

export function PlanEditBar() {
    return null; // Placeholder - edit bar not needed for public view
}

export function usePlanEdit() {
    const ctx = useContext(PlanEditCtx);
    if (!ctx) return { isEditing: false, setIsEditing: () => { }, plan: null, planId: '', onPlanUpdate: () => { } };
    return ctx;
}
