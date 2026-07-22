/**
 * GrowthMap API — Camada de abstração por domínio
 *
 * ARQUITETURA DE MIGRAÇÃO GCP:
 * Esta camada é o único ponto de acesso ao backend para o domínio GrowthMap.
 * Hoje usa Supabase como adapter. Quando a API GCP (Cloud Run) estiver pronta,
 * basta trocar o adapter aqui — GrowthMap.tsx e FrameworkCard.tsx não mudam.
 *
 * Para migrar para GCP:
 *   1. Crie src/api/adapters/growthmap-gcp.ts com o mesmo contrato
 *   2. Troque a linha: import { adapter } from './adapters/growthmap-supabase'
 *      por:            import { adapter } from './adapters/growthmap-gcp'
 *   3. Teste, reconcilie, desative Supabase.
 *
 * Ref: docs/architecture/gcp-migration/02-target-architecture.md
 * Ref: docs/architecture/gcp-migration/08-edge-functions-mapping.md (Onda 2)
 */

import { supabase } from '@/integrations/supabase/client';
import { growthMapGcpDataAdapter } from '@/api/adapters/growthmap-gcp';
import type {
  GrowthMapState,
  FrameworkResult,
  REIConnection,
} from '@/types/growthmap';

// ─── Catalog ──────────────────────────────────────────────────────────────────

export const FRAMEWORK_CATALOG = [
  // Pilar 1 — Inteligência Estratégica
  { id: 'tam_sam_som',      pillar: 'inteligencia_estrategica' as const, title: 'TAM / SAM / SOM',         subtitle: 'Dimensionamento de mercado em BRL' },
  { id: 'swot',             pillar: 'inteligencia_estrategica' as const, title: 'Análise SWOT',             subtitle: 'Forças, fraquezas, oportunidades e ameaças' },
  { id: 'pestel',           pillar: 'inteligencia_estrategica' as const, title: 'PESTEL',                   subtitle: '6 fatores macro-ambientais' },
  { id: 'porter_5_forces',  pillar: 'inteligencia_estrategica' as const, title: '5 Forças de Porter',       subtitle: 'Análise competitiva do setor' },
  { id: 'vrio_benchmark',   pillar: 'inteligencia_estrategica' as const, title: 'Benchmarking VRIO',        subtitle: 'Comparativo vs concorrentes' },
  // Pilar 2 — Concepção de Valor
  { id: 'empathy_map',      pillar: 'concepcao_valor' as const,          title: 'Mapa de Empatia',          subtitle: 'Visão empática do público-alvo' },
  { id: 'customer_journey', pillar: 'concepcao_valor' as const,          title: 'Customer Journey Map',     subtitle: 'Jornada da descoberta à fidelização' },
  { id: 'vpc',              pillar: 'concepcao_valor' as const,          title: 'Value Proposition Canvas', subtitle: 'Alinhamento perfil × mapa de valor' },
  { id: 'usp',              pillar: 'concepcao_valor' as const,          title: 'Proposta Única de Valor',  subtitle: 'A promessa da marca e pilares de diferenciação' },
  // Pilar 3 — MVP & Validação
  { id: 'lean_canvas',      pillar: 'mvp_validacao' as const,            title: 'Lean Canvas',              subtitle: 'Modelo de negócio enxuto' },
  { id: 'design_thinking',  pillar: 'mvp_validacao' as const,            title: 'Design Thinking Canvas',   subtitle: '5 fases de inovação centrada no usuário' },
  // Pilar 4 — Escalabilidade
  { id: 'aarrr',            pillar: 'escalabilidade' as const,           title: 'Funil Pirata AARRR',       subtitle: 'Mapeamento do funil de crescimento por estágio' },
  { id: 'gtm',              pillar: 'escalabilidade' as const,           title: 'Go-To-Market',             subtitle: 'Plano de lançamento e canais de aquisição' },
  { id: 'ice_score',        pillar: 'escalabilidade' as const,           title: 'ICE Score',                subtitle: 'Priorização Impacto × Confiança × Facilidade' },
  { id: 'north_star',       pillar: 'escalabilidade' as const,           title: 'North Star Metric',        subtitle: 'A única métrica que guia toda a equipe' },
] as const;

export type FrameworkId = typeof FRAMEWORK_CATALOG[number]['id'];

// ─── Domain types ──────────────────────────────────────────────────────────────

export interface GenerateFrameworkParams {
  project_id: string;
  framework_id: FrameworkId | string;
  rei_responses?: Record<string, unknown>;
  segment?: string;
  company_name: string;
  company_description: string;
  competitors?: string[];
}

// ─── Adapter interface (swap here when GCP is ready) ─────────────────────────

interface GrowthMapAdapter {
  generate(params: GenerateFrameworkParams): Promise<FrameworkResult>;
  load(project_id: string): Promise<GrowthMapState | null>;
  save(project_id: string, framework: FrameworkResult): Promise<void>;
}

// ─── Supabase adapter (current runtime) ───────────────────────────────────────

const supabaseAdapter: GrowthMapAdapter = {

  async generate(params) {
    const { data, error } = await supabase.functions.invoke('generate-growthmap', {
      body: params,
    });

    if (error) throw new Error(`GrowthMap generate error: ${error.message}`);

    const catalog = FRAMEWORK_CATALOG.find(f => f.id === params.framework_id);
    return {
      id: data.framework_id,
      pillar: catalog?.pillar ?? 'inteligencia_estrategica',
      title: catalog?.title ?? params.framework_id,
      subtitle: catalog?.subtitle ?? '',
      status: 'done' as const,
      generated_at: data.generated_at,
      data: data.data,
      rei_connections: data.rei_connections ?? [],
      generated_actions: data.generated_actions ?? [],
    };
  },

  async load(project_id) {
    try {
      const { data, error } = await supabase
        .from('growthmap_results')
        .select('*')
        .eq('project_id', project_id)
        .maybeSingle();

      if (error || !data) return null;
      return data as unknown as GrowthMapState;
    } catch {
      return null;
    }
  },

  async save(project_id, framework) {
    try {
      const current = await supabaseAdapter.load(project_id);
      const updatedFrameworks = {
        ...(current?.frameworks ?? {}),
        [framework.id]: framework,
      };

      const { error } = await supabase
        .from('growthmap_results')
        .upsert(
          {
            project_id,
            company_name: current?.company_name ?? '',
            company_description: current?.company_description ?? '',
            frameworks: updatedFrameworks,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        );

      if (error) throw error;
    } catch (e) {
      console.error('[GrowthMap] save error:', e);
    }
  },
};

// Migração incremental do piloto: load/save podem operar 100% no GCP em staging,
// enquanto a geração de IA permanece na Edge Function até ser portada ao Cloud Run.
// A flag nasce desligada; produção atual não muda sem configuração explícita.
const useGcpDataPlane = import.meta.env.VITE_GROWTHMAP_GCP_ENABLED === 'true';
const activeAdapter: GrowthMapAdapter = useGcpDataPlane
  ? { generate: supabaseAdapter.generate, load: growthMapGcpDataAdapter.load, save: growthMapGcpDataAdapter.save }
  : supabaseAdapter;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Gera um framework via IA, com contexto completo do REI injetado.
 * Hoje: Supabase Edge Function → Anthropic claude-3-5-sonnet
 * Futuro: Cloud Run Service → mesmo contrato
 */
export async function generateFramework(
  params: GenerateFrameworkParams
): Promise<FrameworkResult> {
  return activeAdapter.generate(params);
}

/**
 * Carrega o estado completo do GrowthMap de um projeto.
 * Retorna null se ainda não existe (usuário nunca gerou nada).
 */
export async function getGrowthMap(
  project_id: string
): Promise<GrowthMapState | null> {
  return activeAdapter.load(project_id);
}

/**
 * Persiste um resultado de framework gerado.
 * Usa upsert por project_id — idempotente.
 */
export async function saveFrameworkResult(
  project_id: string,
  framework: FrameworkResult
): Promise<void> {
  return activeAdapter.save(project_id, framework);
}

/**
 * Extrai conexões REI do lado do cliente (preview instantâneo sem IA).
 * Usado para mostrar "N dados do REI" no card antes de gerar.
 * Lógica espelhada na Edge Function para consistência.
 */
export function extractREIConnections(
  framework_id: string,
  rei_responses: Record<string, unknown>
): REIConnection[] {
  const connections: REIConnection[] = [];
  if (!rei_responses) return connections;

  const get = (...keys: string[]): string | null => {
    for (const k of keys) {
      const v = rei_responses[k];
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return null;
  };

  if (framework_id === 'aarrr') {
    const churn = get('taxaChurn', 'churn_mensal', 'revops_churn');
    if (churn) {
      const pct = parseFloat(churn.replace(/[^0-9.]/g, ''));
      connections.push({
        label: 'Churn atual',
        value: churn,
        insight: `Benchmark AARRR: < 15%${!isNaN(pct) && pct > 15 ? ` — gap de ${(pct - 15).toFixed(0)}pp` : ''}`,
        type: !isNaN(pct) && pct > 25 ? 'critical' : 'warning',
      });
    }
    const cac = get('cac_atual', 'revops_cac');
    if (cac) connections.push({ label: 'CAC atual', value: cac, insight: 'Meta: aquisição orgânica < R$ 300', type: 'warning' });
    const ticket = get('ticket_medio', 'revops_ticket_medio', 'ticketMedio');
    if (ticket) connections.push({ label: 'Ticket médio', value: ticket, insight: 'Meta upsell: R$ 2.400–4.800/ano', type: 'ok' });
    const conv = get('taxa_conversao', 'taxaConversao', 'revops_taxa_conversao');
    if (conv) connections.push({ label: 'Taxa de conversão', value: conv, insight: 'Impacta etapa de Ativação no AARRR', type: 'warning' });
  }

  if (framework_id === 'north_star') {
    const fat = get('faturamento', 'revops_faturamento', 'mrr_atual');
    if (fat) connections.push({ label: 'Faturamento atual', value: fat, insight: 'Base para calibrar a North Star', type: 'ok' });
    const churn = get('taxaChurn', 'churn_mensal', 'revops_churn');
    if (churn) connections.push({ label: 'Churn', value: churn, insight: 'Churn alto corrói NRR — priority #1', type: 'critical' });
    const meta = get('crescimento_meta', 'metaCrescimento', 'meta_crescimento');
    if (meta) connections.push({ label: 'Meta de crescimento', value: meta, insight: 'Define o target da North Star', type: 'warning' });
  }

  if (['swot', 'porter_5_forces', 'vrio_benchmark'].includes(framework_id)) {
    const conc = get('concorrentes', 'revops_concorrentes');
    if (conc) connections.push({ label: 'Concorrentes', value: conc, insight: 'Alimenta análise competitiva', type: 'warning' });
    const crm = get('crm', 'revops_crm_atual');
    if (crm) connections.push({ label: 'Stack CRM', value: crm, insight: 'Contexto de lock-in tecnológico', type: 'ok' });
  }

  if (framework_id === 'tam_sam_som') {
    const ticket = get('ticket_medio', 'revops_ticket_medio', 'ticketMedio');
    if (ticket) connections.push({ label: 'Ticket médio', value: ticket, insight: 'Base para cálculo do SOM realista', type: 'ok' });
    const seg = get('segmento', 'revops_segmento', 'sector');
    if (seg) connections.push({ label: 'Segmento', value: seg, insight: 'Delimita o TAM endereçável', type: 'ok' });
  }

  if (['vpc', 'empathy_map', 'usp'].includes(framework_id)) {
    const pain = get('revops_maior_dor', 'maiorDor', 'main_challenge');
    if (pain) connections.push({ label: 'Maior dor do ICP', value: pain, insight: 'Eixo central do canvas de valor', type: 'critical' });
    const seg = get('segmento', 'revops_segmento');
    if (seg) connections.push({ label: 'Segmento', value: seg, insight: 'Define o perfil para o canvas', type: 'ok' });
  }

  if (framework_id === 'gtm') {
    const pain = get('revops_maior_dor', 'maiorDor', 'main_challenge');
    if (pain) connections.push({ label: 'Maior dor', value: pain, insight: 'Eixo central do posicionamento GTM', type: 'critical' });
    const canais = get('canais', 'revops_canais', 'canais_aquisicao');
    if (canais) connections.push({ label: 'Canais atuais', value: canais, insight: 'Ponto de partida do plano de aquisição', type: 'ok' });
  }

  return connections;
}

/**
 * Constrói estado inicial (todos os frameworks como 'pending').
 * Usado quando o projeto ainda não tem GrowthMap gerado.
 */
export function buildInitialState(
  project_id: string,
  company_name: string,
  company_description = ''
): GrowthMapState {
  const frameworks: Record<string, FrameworkResult> = {};
  for (const f of FRAMEWORK_CATALOG) {
    frameworks[f.id] = {
      id: f.id,
      pillar: f.pillar,
      title: f.title,
      subtitle: f.subtitle,
      status: 'pending',
    };
  }
  return { project_id, company_name, company_description, frameworks };
}
