/**
 * Design Tokens - Colors
 * Inspirado no Notion, adaptado para Nobibecode
 * 
 * Regras:
 * - Paleta zinc (preto/branco/cinza)
 * - Único accent: #00CC6A
 * - Sem gradientes
 * - Sem cores vibrantes
 */

export const COLORS = {
  // Base (backgrounds)
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F4F4F5',
    elevated: '#FFFFFF',
    dark: '#09090B',
  },
  
  // Text (zinc scale)
  text: {
    primary: '#18181B',      // zinc-900
    secondary: '#52525B',    // zinc-600
    tertiary: '#A1A1AA',     // zinc-400
    disabled: '#D4D4D8',     // zinc-300
    inverse: '#FFFFFF',
  },
  
  // Borders (sutis como Notion)
  border: {
    default: '#E4E4E7',      // zinc-200
    hover: '#D4D4D8',        // zinc-300
    focus: '#00CC6A',        // accent
    subtle: '#F4F4F5',       // zinc-100
  },
  
  // Accent (único permitido)
  accent: {
    primary: '#00CC6A',
    hover: '#00B35E',
    active: '#009A52',
    subtle: 'rgba(0, 204, 106, 0.1)',
    text: '#00CC6A',
  },
  
  // Status (minimalista)
  status: {
    success: '#00CC6A',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
} as const;

// Type helper
export type ColorToken = typeof COLORS;
