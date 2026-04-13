import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Non-empty string - catches empty strings from malformed AI output */
const ne = z.string().min(1);

// ---------------------------------------------------------------------------
// Executive Summary
// ---------------------------------------------------------------------------

const executiveSummarySchema = z.object({
  context: ne,
  problem: ne,
  solution: ne,
  expected_outcome: ne,
});

// ---------------------------------------------------------------------------
// Current vs Future
// ---------------------------------------------------------------------------

const currentVsFutureSchema = z.object({
  current: z.array(ne).length(5),
  future: z.array(ne).length(5),
});

// ---------------------------------------------------------------------------
// Quick Wins
// ---------------------------------------------------------------------------

const quickWinSchema = z.object({
  day: ne,
  action: ne,
  outcome: ne,
  owner: z.enum(['revhackers', 'cliente', 'ambos']),
});

// ---------------------------------------------------------------------------
// Thesis Statement
// ---------------------------------------------------------------------------

const thesisStatementSchema = z.object({
  before: ne,
  highlight: ne,
  after: ne,
});

// ---------------------------------------------------------------------------
// Context Mirror
// ---------------------------------------------------------------------------

const contextMirrorSchema = z.object({
  segment: ne,
  objective: ne,
  maturity: ne,
  restrictions: ne,
});

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

const signalSchema = z.object({
  type: z.enum(['positive', 'negative', 'neutral']),
  headline: ne,
  text: ne,
  impact: ne,
});

// ---------------------------------------------------------------------------
// Risks
// ---------------------------------------------------------------------------

const riskSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  headline: ne,
  text: ne,
  mitigation: ne,
});

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

const decisionSchema = z.object({
  title: ne,
  recommendation: ne,
  basedOn: z.array(ne),
  ruleApplied: ne,
  implication: ne,
});

// ---------------------------------------------------------------------------
// Pillars (4 strategic pillars)
// ---------------------------------------------------------------------------

const pillarSchema = z.object({
  name: ne,
  icon: ne,
  items: z.array(ne),
});

// ---------------------------------------------------------------------------
// Thesis Pillars (3 thesis pillars)
// ---------------------------------------------------------------------------

const thesisPillarSchema = z.object({
  icon: ne,
  title: ne,
  description: ne,
  actions: z.array(ne),
});

// ---------------------------------------------------------------------------
// Methodology Steps
// ---------------------------------------------------------------------------

const methodologyStepSchema = z.object({
  phase: ne,
  tagline: ne,
  name: ne,
  description: ne,
  principles: z.array(ne),
});

// ---------------------------------------------------------------------------
// Roadmap Phases
// ---------------------------------------------------------------------------

const roadmapPhaseSchema = z.object({
  name: ne,
  title: ne,
  items: z.array(ne).length(4),
});

// ---------------------------------------------------------------------------
// OKRs
// ---------------------------------------------------------------------------

const okrSchema = z.object({
  objective: ne,
  description: ne,
  timeline: ne,
  sub_results: z.array(ne),
});

// ---------------------------------------------------------------------------
// Onboarding Data
// ---------------------------------------------------------------------------

const onboardingKickoffSchema = z.object({
  main_title: ne,
  p1_title: ne, p1_desc: ne, p1_output: ne,
  p2_title: ne, p2_desc: ne, p2_output: ne,
  p3_title: ne, p3_desc: ne, p3_output: ne,
});

const onboardingSetupSchema = z.object({
  main_title: ne,
  p1_title: ne, p1_desc: ne,
  p2_title: ne, p2_desc: ne,
  p3_title: ne, p3_desc: ne,
});

const onboardingTrainingSchema = z.object({
  main_title: ne,
  p1_title: ne, p1_desc: ne,
  p2_title: ne, p2_desc: ne,
  p3_title: ne, p3_desc: ne,
});

const onboardingAdoptionSchema = z.object({
  main_title: ne,
  p1_title: ne, p1_desc: ne,
  p2_title: ne, p2_desc: ne,
});

const onboardingHandoverSchema = z.object({
  main_title: ne,
  p1_title: ne, p1_desc: ne,
  p2_title: ne, p2_desc: ne,
});

const onboardingDataSchema = z.object({
  kickoff: onboardingKickoffSchema,
  setup: onboardingSetupSchema,
  training: onboardingTrainingSchema,
  adoption: onboardingAdoptionSchema,
  handover: onboardingHandoverSchema,
});

// ---------------------------------------------------------------------------
// STRICT Schema - for validating NEW plan generation
// ---------------------------------------------------------------------------

export const strategicPlanDiagnosticSchema = z.object({
  summary: ne,
  executive_summary: executiveSummarySchema,
  current_vs_future: currentVsFutureSchema,
  quick_wins: z.array(quickWinSchema).length(6),
  thesis_statement: thesisStatementSchema,
  context_mirror: contextMirrorSchema,
  signals: z.array(signalSchema),
  risks: z.array(riskSchema),
  decisions: z.array(decisionSchema),
  pillars: z.array(pillarSchema).length(4),
  thesis_pillars: z.array(thesisPillarSchema).length(3),
  methodology_steps: z.array(methodologyStepSchema).min(2),
  roadmap_phases: z.array(roadmapPhaseSchema).length(3),
  okrs: z.array(okrSchema).length(3),
  onboarding_data: onboardingDataSchema,
});

// ---------------------------------------------------------------------------
// Inferred TypeScript type
// ---------------------------------------------------------------------------

export type StrategicPlanDiagnostic = z.infer<typeof strategicPlanDiagnosticSchema>;

// ---------------------------------------------------------------------------
// LENIENT Schema - for reading existing plans from DB (fields may be missing)
// ---------------------------------------------------------------------------

const optStr = z.string().optional().default('');

const executiveSummarySchemaLenient = z.object({
  context: optStr,
  problem: optStr,
  solution: optStr,
  expected_outcome: optStr,
}).optional().default({ context: '', problem: '', solution: '', expected_outcome: '' });

const currentVsFutureSchemaLenient = z.object({
  current: z.array(z.string()).optional().default([]),
  future: z.array(z.string()).optional().default([]),
}).optional().default({ current: [], future: [] });

const quickWinSchemaLenient = z.object({
  day: optStr,
  action: optStr,
  outcome: optStr,
  owner: z.enum(['revhackers', 'cliente', 'ambos']).optional().default('revhackers'),
});

const thesisStatementSchemaLenient = z.object({
  before: optStr,
  highlight: optStr,
  after: optStr,
}).optional().default({ before: '', highlight: '', after: '' });

const contextMirrorSchemaLenient = z.object({
  segment: optStr,
  objective: optStr,
  maturity: optStr,
  restrictions: optStr,
}).optional().default({ segment: '', objective: '', maturity: '', restrictions: '' });

const signalSchemaLenient = z.object({
  type: z.enum(['positive', 'negative', 'neutral']).optional().default('neutral'),
  headline: optStr,
  text: optStr,
  impact: optStr,
});

const riskSchemaLenient = z.object({
  severity: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  headline: optStr,
  text: optStr,
  mitigation: optStr,
});

const decisionSchemaLenient = z.object({
  title: optStr,
  recommendation: optStr,
  basedOn: z.array(z.string()).optional().default([]),
  ruleApplied: optStr,
  implication: optStr,
});

const pillarSchemaLenient = z.object({
  name: optStr,
  icon: optStr,
  items: z.array(z.string()).optional().default([]),
});

const thesisPillarSchemaLenient = z.object({
  icon: optStr,
  title: optStr,
  description: optStr,
  actions: z.array(z.string()).optional().default([]),
});

const methodologyStepSchemaLenient = z.object({
  phase: optStr,
  tagline: optStr,
  name: optStr,
  description: optStr,
  principles: z.array(z.string()).optional().default([]),
});

const roadmapPhaseSchemaLenient = z.object({
  name: optStr,
  title: optStr,
  items: z.array(z.string()).optional().default([]),
});

const okrSchemaLenient = z.object({
  objective: optStr,
  description: optStr,
  timeline: optStr,
  sub_results: z.array(z.string()).optional().default([]),
});

const onboardingKickoffSchemaLenient = z.object({
  main_title: optStr,
  p1_title: optStr, p1_desc: optStr, p1_output: optStr,
  p2_title: optStr, p2_desc: optStr, p2_output: optStr,
  p3_title: optStr, p3_desc: optStr, p3_output: optStr,
}).optional().default({
  main_title: '', p1_title: '', p1_desc: '', p1_output: '',
  p2_title: '', p2_desc: '', p2_output: '',
  p3_title: '', p3_desc: '', p3_output: '',
});

const onboardingSetupSchemaLenient = z.object({
  main_title: optStr,
  p1_title: optStr, p1_desc: optStr,
  p2_title: optStr, p2_desc: optStr,
  p3_title: optStr, p3_desc: optStr,
}).optional().default({
  main_title: '', p1_title: '', p1_desc: '',
  p2_title: '', p2_desc: '', p3_title: '', p3_desc: '',
});

const onboardingTrainingSchemaLenient = z.object({
  main_title: optStr,
  p1_title: optStr, p1_desc: optStr,
  p2_title: optStr, p2_desc: optStr,
  p3_title: optStr, p3_desc: optStr,
}).optional().default({
  main_title: '', p1_title: '', p1_desc: '',
  p2_title: '', p2_desc: '', p3_title: '', p3_desc: '',
});

const onboardingAdoptionSchemaLenient = z.object({
  main_title: optStr,
  p1_title: optStr, p1_desc: optStr,
  p2_title: optStr, p2_desc: optStr,
}).optional().default({
  main_title: '', p1_title: '', p1_desc: '',
  p2_title: '', p2_desc: '',
});

const onboardingHandoverSchemaLenient = z.object({
  main_title: optStr,
  p1_title: optStr, p1_desc: optStr,
  p2_title: optStr, p2_desc: optStr,
}).optional().default({
  main_title: '', p1_title: '', p1_desc: '',
  p2_title: '', p2_desc: '',
});

const onboardingDataSchemaLenient = z.object({
  kickoff: onboardingKickoffSchemaLenient,
  setup: onboardingSetupSchemaLenient,
  training: onboardingTrainingSchemaLenient,
  adoption: onboardingAdoptionSchemaLenient,
  handover: onboardingHandoverSchemaLenient,
}).optional().default({});

export const strategicPlanDiagnosticSchemaLenient = z.object({
  summary: optStr,
  executive_summary: executiveSummarySchemaLenient,
  current_vs_future: currentVsFutureSchemaLenient,
  quick_wins: z.array(quickWinSchemaLenient).optional().default([]),
  thesis_statement: thesisStatementSchemaLenient,
  context_mirror: contextMirrorSchemaLenient,
  signals: z.array(signalSchemaLenient).optional().default([]),
  risks: z.array(riskSchemaLenient).optional().default([]),
  decisions: z.array(decisionSchemaLenient).optional().default([]),
  pillars: z.array(pillarSchemaLenient).optional().default([]),
  thesis_pillars: z.array(thesisPillarSchemaLenient).optional().default([]),
  methodology_steps: z.array(methodologyStepSchemaLenient).optional().default([]),
  roadmap_phases: z.array(roadmapPhaseSchemaLenient).optional().default([]),
  okrs: z.array(okrSchemaLenient).optional().default([]),
  onboarding_data: onboardingDataSchemaLenient,
});

export type StrategicPlanDiagnosticLenient = z.infer<typeof strategicPlanDiagnosticSchemaLenient>;

// ---------------------------------------------------------------------------
// Safe parse helpers
// ---------------------------------------------------------------------------

/**
 * Validates data against the STRICT schema (for new plan generation).
 * Returns typed data on success, or null on failure (logs errors to console).
 */
export function safeParseStrategicPlan(data: unknown): StrategicPlanDiagnostic | null {
  const result = strategicPlanDiagnosticSchema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  console.error(
    '[StrategicPlan] Validation failed - strict schema:',
    result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  );

  return null;
}

/**
 * Validates data against the LENIENT schema (for reading existing plans from DB).
 * Fills in defaults for missing fields. Returns typed data on success, or null on failure.
 */
export function safeParseStrategicPlanLenient(data: unknown): StrategicPlanDiagnosticLenient | null {
  const result = strategicPlanDiagnosticSchemaLenient.safeParse(data);

  if (result.success) {
    return result.data;
  }

  console.error(
    '[StrategicPlan] Validation failed - lenient schema:',
    result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  );

  return null;
}
