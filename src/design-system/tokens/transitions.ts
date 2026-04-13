/**
 * Design Tokens - Transitions
 * Animações rápidas e suaves (como Notion)
 */

export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type TransitionToken = typeof TRANSITIONS;
