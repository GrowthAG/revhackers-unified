// ============================================================================
// DiagnosticService.ts — PONTO DE ENTRADA DE COMPATIBILIDADE
// P-01: Este arquivo era monolítico (67KB / 1293 linhas).
// Foi dividido em 4 módulos focados em src/services/diagnostic/:
//   - types.ts       — interfaces TypeScript
//   - mapper.ts      — label maps, helpers de mapeamento e verificação
//   - generators.ts  — funções puras de geração de plano/diagnóstico
//   - index.ts       — classe DiagnosticService (wrapper de compat)
//
// Este arquivo agora é apenas um re-export — nenhum consumidor existente
// (páginas, componentes) precisa mudar seus imports.
// ============================================================================

export {
    DiagnosticService,
    // Types
    type StrategicPlanData,
    type DiagnosticResult,
    type ImplementationStep,
    type DiagnosticSignal,
    type DiagnosticRisk,
    type DiagnosticOpportunity,
    type StrategicDecision,
    // Helpers (usados diretamente em alguns componentes)
    mapLabel,
    mapLabels,
    checkHasCRM,
    checkIsB2B,
    LABEL_MAPS,
} from './diagnostic/index';
