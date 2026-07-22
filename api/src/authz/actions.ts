/**
 * Ações de autorização (migração GCP — E4/Fase C).
 * Ref: doc 03, "Autorização proposta".
 */

export type Action = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'administer';

export const ALL_ACTIONS: readonly Action[] = ['read', 'create', 'update', 'delete', 'approve', 'administer'];
