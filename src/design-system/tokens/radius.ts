/**
 * Design Tokens - Border Radius
 * Nobibecode: máximo rounded-2xl
 */

export const RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px - Nobibecode padrão
  // full: '9999px' - EVITAR em cards
} as const;

export type RadiusToken = typeof RADIUS;
