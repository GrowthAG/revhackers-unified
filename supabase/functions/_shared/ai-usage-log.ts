// ============================================================================
// _shared/ai-usage-log.ts
//
// Helper de instrumentacao para R1 do backlog de roteamento de IA
// (docs/PLANO-MESTRE.md, Frente 2). Grava uma linha em public.ai_usage_log a
// cada chamada a um provider de IA (Claude/OpenAI), best-effort: uma falha ao
// gravar o log nunca deve derrubar a resposta real da edge function.
//
// Nao calcula custo estimado aqui de proposito - nao existe ainda tabela de
// precificacao por modelo (R2), e nenhum valor de custo deve ser inventado.
//
// Uso tipico:
//   const t0 = Date.now();
//   try {
//     const resp = await fetch(...);
//     await logAiUsage(supabaseAdmin, {
//       edgeFunction: 'generate-strategic-plan',
//       provider: 'anthropic',
//       model: 'claude-opus-4-7',
//       success: true,
//       inputTokens: data.usage?.input_tokens,
//       outputTokens: data.usage?.output_tokens,
//       latencyMs: Date.now() - t0,
//       metadata: { projectId, jobId },
//     });
//   } catch (err) {
//     await logAiUsage(supabaseAdmin, { ..., success: false, errorMessage: err.message });
//   }
// ============================================================================

export interface AiUsageLogEntry {
  edgeFunction: string;
  provider: string;
  model: string;
  success: boolean;
  errorMessage?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  latencyMs?: number | null;
  metadata?: Record<string, unknown>;
}

// deno-lint-ignore no-explicit-any
export async function logAiUsage(supabaseAdmin: any, entry: AiUsageLogEntry): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('ai_usage_log').insert({
      edge_function: entry.edgeFunction,
      provider: entry.provider,
      model: entry.model,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
      input_tokens: entry.inputTokens ?? null,
      output_tokens: entry.outputTokens ?? null,
      latency_ms: entry.latencyMs ?? null,
      metadata: entry.metadata ?? {},
    });
    if (error) {
      console.error('[ai-usage-log] Falha ao gravar uso de IA:', error.message);
    }
  } catch (err) {
    console.error('[ai-usage-log] Excecao ao gravar uso de IA:', err instanceof Error ? err.message : err);
  }
}
