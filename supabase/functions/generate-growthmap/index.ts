// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── System prompts por framework ────────────────────────────────────────────
const SYSTEM_PROMPTS: Record<string, string> = {
  tam_sam_som: `Você é um analista de mercado sênior especializado no mercado brasileiro.
Com base no contexto do cliente fornecido, gere TAM/SAM/SOM com valores REALISTAS em BRL calibrados ao segmento específico.
- TAM: mercado total endereçável (ex: todo o mercado de CRM no Brasil)
- SAM: mercado disponível e endereçável pelo modelo de negócio atual
- SOM: meta realista para 3 anos considerando o estágio atual da empresa
Responda SOMENTE com JSON válido no formato exato:
{"tam":{"value":"R$ X bi","label":"R$ X bi","description":"descrição do TAM"},"sam":{"value":"R$ X mi","label":"R$ X mi","description":"descrição do SAM"},"som":{"value":"R$ X mi","label":"R$ X mi","description":"descrição do SOM"}}`,

  swot: `Você é um consultor estratégico sênior com 15 anos de experiência em empresas brasileiras.
Gere análise SWOT calibrada com os dados reais do cliente — não seja genérico.
Cada quadrante deve ter EXATAMENTE 4 itens específicos ao contexto do cliente.
Responda SOMENTE com JSON válido:
{"forcas":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}],"fraquezas":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}],"oportunidades":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}],"ameacas":[{"text":"..."},{"text":"..."},{"text":"..."},{"text":"..."}]}`,

  pestel: `Gere análise PESTEL completa para o contexto do cliente brasileiro.
Cada fator deve ter 3-4 bullets específicos ao segmento e contexto macro do Brasil em 2025-2026.
Responda SOMENTE com JSON válido:
{"politico":{"bullets":["...","...","..."]},"economico":{"bullets":["...","...","..."]},"social":{"bullets":["...","...","..."]},"tecnologico":{"bullets":["...","...","..."]},"ambiental":{"bullets":["...","...","..."]},"legal":{"bullets":["...","...","..."]}}`,

  porter_5_forces: `Gere análise completa das 5 Forças de Porter calibrada ao setor e empresa do cliente.
Para cada força, indique o nível (baixo/medio/alto) e uma descrição específica de 2-3 frases.
Responda SOMENTE com JSON válido:
{"rivalidade":{"level":"alto","description":"..."},"novos_entrantes":{"level":"medio","description":"..."},"substitutos":{"level":"medio","description":"..."},"fornecedores":{"level":"baixo","description":"..."},"compradores":{"level":"alto","description":"..."}}`,

  vrio_benchmark: `Gere análise de benchmarking VRIO comparando o cliente com seus principais concorrentes.
Avalie recursos-chave em V (Valor), R (Raridade), I (Imitabilidade), O (Organização).
Classifique como: vantagem_sustentavel | vantagem_competitiva | paridade | desvantagem
Responda SOMENTE com JSON válido:
{"competitors":["Concorrente A","Concorrente B"],"resources":[{"name":"Recurso 1","level":"vantagem_competitiva","competitors":{"Concorrente A":"paridade","Concorrente B":"desvantagem"}}]}`,

  empathy_map: `Você é um especialista em Design Thinking e pesquisa qualitativa com ICP brasileiro.
Gere Mapa de Empatia completo para o perfil de cliente ideal (ICP) da empresa.
Cada categoria deve ter 3-4 bullets específicos e contextualizados ao segmento brasileiro.
Responda SOMENTE com JSON válido:
{"pensa_sente":["...","...","..."],"ve":["...","...","..."],"fala_faz":["...","...","..."],"ouve":["...","...","..."],"dores":["...","...","...","...","..."],"ganhos":["...","...","...","...","..."]}`,

  customer_journey: `Mapeie a jornada completa do cliente em 8 etapas desde a descoberta até a advocacia.
Para cada etapa: nome claro, descrição de 2-3 frases, emoção predominante e tipo (positive/negative/neutral).
Seja específico ao contexto e segmento do cliente.
Responda SOMENTE com JSON válido:
{"stages":[{"number":1,"name":"Consciência","description":"...","emotion":"Curioso mas cético","emotion_type":"neutral"},{"number":2,"name":"Consideração","description":"...","emotion":"...","emotion_type":"negative"},...]}`,

  vpc: `Gere Value Proposition Canvas completo alinhando o perfil do cliente ao mapa de valor da empresa.
Seja específico: jobs to be done reais, dores concretas, ganhos tangíveis.
Responda SOMENTE com JSON válido:
{"customer_profile":{"jobs":["...","...","...","..."],"pains":["...","...","...","..."],"gains":["...","...","...","..."]},"value_map":{"products":["...","...","..."],"pain_relievers":["...","...","...","..."],"gain_creators":["...","...","...","..."]}}`,

  usp: `Defina a Proposta Única de Valor e 5 pilares de diferenciação da empresa.
O statement deve ser uma frase de posicionamento poderosa, clara e específica.
Cada pilar deve ter título, descrição de 1 frase e 2-3 bullets de evidência.
Responda SOMENTE com JSON válido:
{"statement":"...","pillars":[{"title":"Pilar 1","description":"...","bullets":["...","...","..."]},{"title":"Pilar 2","description":"...","bullets":["...","...","..."]},...]}`,

  aarrr: `Você é especialista em Growth com foco em SaaS e PMEs brasileiras.
Com os dados reais do REI fornecidos, gere análise AARRR calibrada comparando métricas atuais vs benchmarks ideais.
Para cada estágio: métrica principal, meta de benchmark, valor atual (se disponível no contexto), status (critico/alerta/ok/meta) e 4-5 táticas específicas.
Status logic: critico se muito abaixo do benchmark, alerta se próximo, ok se dentro, meta se não há dado.
Responda SOMENTE com JSON válido:
{"aquisicao":{"metric":"CAC orgânico","meta":"< R$ 300","current_value":"R$ 1.240","status":"critico","tactics":["tática 1","tática 2","tática 3","tática 4"]},"ativacao":{"metric":"% trials que completam onboarding em 7 dias","meta":"> 40%","current_value":null,"status":"meta","tactics":["..."]},"retencao":{"metric":"Churn early-stage 90 dias","meta":"< 15%","current_value":"28%","status":"critico","tactics":["..."]},"receita":{"metric":"Ticket médio anual","meta":"R$ 2.400 – R$ 4.800","current_value":"R$ 1.200","status":"alerta","tactics":["..."]},"referencia":{"metric":"% novas contas via indicação","meta":"> 15%","current_value":null,"status":"meta","tactics":["..."]},"reativacao":{"metric":"% churned reativados em 60 dias","meta":"> 10%","current_value":null,"status":"meta","tactics":["..."]}}`,

  north_star: `Defina a North Star Metric mais adequada para este estágio e modelo de negócio da empresa.
Explique por que esta é a métrica certa (4-5 razões) e liste 3 leading indicators que a predizem.
Responda SOMENTE com JSON válido:
{"metric_name":"Pipeline ativo em 30 dias","description":"...","current_value":"...","target_value":"...","why_this_metric":["Razão 1","Razão 2","Razão 3","Razão 4"],"leading_indicators":[{"label":"Adoção do Time Comercial","description":"..."},{"label":"WhatsApp Conectado no Dia 1","description":"..."},{"label":"NPS Cohort Dia 30 > 40","description":"..."}]}`,

  gtm: `Gere estratégia Go-To-Market completa com posicionamento claro e plano de lançamento em 3 fases.
Seja específico ao segmento brasileiro, canais disponíveis e diferenciais do produto.
Responda SOMENTE com JSON válido:
{"positioning":"Para [público] que [problema], [empresa] é [categoria] que [diferencial]. Diferente de [concorrente], [evidência].","key_differentials":["diferencial 1","diferencial 2","diferencial 3"],"launch_phases":[{"name":"Fase 1 — Validação","duration":"Meses 1-2","actions":["ação 1","ação 2","ação 3"],"color":"orange"},{"name":"Fase 2 — Tração","duration":"Meses 3-6","actions":["ação 1","ação 2","ação 3"],"color":"blue"},{"name":"Fase 3 — Escala","duration":"Meses 7-12","actions":["ação 1","ação 2","ação 3"],"color":"green"}]}`,

  ice_score: `Priorize as 8 iniciativas mais impactantes para este momento da empresa usando ICE Score.
Impact (1-10): impacto no crescimento. Confidence (1-10): confiança na estimativa. Ease (1-10): facilidade de execução.
Score = (Impact × Confidence × Ease) / 100. Priority: high (>5), medium (3-5), low (<3).
Responda SOMENTE com JSON válido:
{"initiatives":[{"name":"Iniciativa 1","impact":9,"confidence":8,"ease":7,"score":5.04,"priority":"high"},{"name":"Iniciativa 2","impact":8,"confidence":6,"ease":5,"score":2.4,"priority":"medium"},...]}`,

  lean_canvas: `Gere Lean Canvas completo para o modelo de negócio atual da empresa.
Seja específico e use dados do contexto do cliente para cada bloco.
Responda SOMENTE com JSON válido:
{"problema":["problema 1","problema 2","problema 3"],"solucao":["solução 1","solução 2","solução 3"],"metricas_chave":["métrica 1","métrica 2","métrica 3"],"proposta_valor":"...","vantagem_injusta":"...","canais":["canal 1","canal 2","canal 3"],"segmento_clientes":{"early_adopters":"...","mass_market":"..."},"estrutura_custos":["custo 1","custo 2","custo 3"],"fontes_receita":["receita 1","receita 2"]}`,

  design_thinking: `Gere Design Thinking Canvas com as 5 fases aplicadas ao contexto do produto/serviço da empresa.
Para cada fase, liste os principais outputs e atividades recomendadas.
Responda SOMENTE com JSON válido:
{"phases":[{"number":1,"name":"Empatia","description":"...","activities":["...","...","..."],"outputs":["...","..."]},{"number":2,"name":"Definição","description":"...","activities":["..."],"outputs":["..."]},{"number":3,"name":"Ideação","description":"...","activities":["..."],"outputs":["..."]},{"number":4,"name":"Prototipação","description":"...","activities":["..."],"outputs":["..."]},{"number":5,"name":"Teste","description":"...","activities":["..."],"outputs":["..."]}]}`,
};

// ─── Extração de conexões REI por framework ───────────────────────────────────
function computeREIConnections(framework_id: string, rei: any) {
  const connections: Array<{ label: string; value: string; insight: string; type: string }> = [];
  if (!rei) return connections;

  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (rei[k] !== undefined && rei[k] !== null && rei[k] !== '') return String(rei[k]);
    }
    return null;
  };

  if (framework_id === 'aarrr') {
    const churn = get('taxaChurn', 'churn_mensal', 'revops_churn', 'taxa_churn');
    if (churn) connections.push({ label: 'Churn atual', value: churn, insight: 'Benchmark AARRR: churn early-stage < 15%', type: Number(churn.replace(/[^0-9.]/g, '')) > 20 ? 'critical' : 'warning' });
    const cac = get('cac_atual', 'revops_cac', 'custo_aquisicao');
    if (cac) connections.push({ label: 'CAC atual', value: cac, insight: 'Meta de aquisição orgânica: CAC < R$ 300', type: 'warning' });
    const ticket = get('ticket_medio', 'revops_ticket_medio', 'ticketMedio');
    if (ticket) connections.push({ label: 'Ticket médio', value: ticket, insight: 'Meta de expansão de receita: R$ 2.400–4.800/ano', type: 'ok' });
    const conv = get('taxa_conversao', 'taxaConversao', 'revops_taxa_conversao');
    if (conv) connections.push({ label: 'Taxa de conversão', value: conv, insight: 'Impacta diretamente a etapa de Ativação', type: 'warning' });
  } else if (framework_id === 'north_star') {
    const fat = get('faturamento', 'revops_faturamento', 'mrr_atual');
    if (fat) connections.push({ label: 'Faturamento atual', value: fat, insight: 'Base para North Star de crescimento sustentável', type: 'ok' });
    const meta = get('crescimento_meta', 'metaCrescimento', 'meta_crescimento');
    if (meta) connections.push({ label: 'Meta de crescimento', value: meta, insight: 'Define o target da North Star Metric', type: 'warning' });
    const churn = get('taxaChurn', 'churn_mensal', 'revops_churn');
    if (churn) connections.push({ label: 'Churn atual', value: churn, insight: 'Churn alto corrói a North Star — prioridade de retenção', type: 'critical' });
  } else if (framework_id === 'swot' || framework_id === 'porter_5_forces' || framework_id === 'vrio_benchmark') {
    const conc = get('concorrentes', 'revops_concorrentes', 'competitors');
    if (conc) connections.push({ label: 'Concorrentes informados', value: conc, insight: 'Alimenta análise competitiva e posicionamento VRIO', type: 'warning' });
    const canais = get('canais', 'revops_canais', 'canais_aquisicao');
    if (canais) connections.push({ label: 'Canais de aquisição', value: canais, insight: 'Define poder de barganha com compradores e novos entrantes', type: 'ok' });
    const crm = get('crm', 'revops_crm_atual', 'crm_atual');
    if (crm) connections.push({ label: 'Stack atual (CRM)', value: crm, insight: 'Contexto de lock-in e barreira tecnológica', type: 'ok' });
  } else if (framework_id === 'tam_sam_som') {
    const seg = get('segmento', 'revops_segmento', 'sector');
    if (seg) connections.push({ label: 'Segmento', value: seg, insight: 'Delimita o TAM endereçável', type: 'ok' });
    const ticket = get('ticket_medio', 'revops_ticket_medio', 'ticketMedio');
    if (ticket) connections.push({ label: 'Ticket médio', value: ticket, insight: 'Base para cálculo de SOM realista', type: 'ok' });
  } else if (framework_id === 'gtm') {
    const pain = get('revops_maior_dor', 'maiorDor', 'main_challenge', 'bigger_pain');
    if (pain) connections.push({ label: 'Maior dor do cliente', value: pain, insight: 'Eixo central do posicionamento GTM', type: 'critical' });
    const canais = get('canais', 'revops_canais', 'canais_aquisicao');
    if (canais) connections.push({ label: 'Canais atuais', value: canais, insight: 'Ponto de partida para o plano de aquisição GTM', type: 'ok' });
  } else if (framework_id === 'vpc' || framework_id === 'empathy_map') {
    const pain = get('revops_maior_dor', 'maiorDor', 'main_challenge');
    if (pain) connections.push({ label: 'Maior dor relatada', value: pain, insight: 'Pain principal para VPC e Mapa de Empatia', type: 'critical' });
    const seg = get('segmento', 'revops_segmento', 'sector');
    if (seg) connections.push({ label: 'Segmento do ICP', value: seg, insight: 'Define o perfil de cliente para o canvas', type: 'ok' });
  }

  return connections;
}

// ─── Build context string from REI responses ─────────────────────────────────
function buildContext(rei: any, company_name: string, company_description: string, segment: string, competitors?: string[]) {
  const lines = ['<CONTEXTO_DO_CLIENTE>'];
  lines.push(`Empresa: ${company_name}`);
  lines.push(`Descrição: ${company_description}`);
  lines.push(`Segmento: ${segment || 'Não informado'}`);
  if (competitors?.length) lines.push(`Concorrentes: ${competitors.join(', ')}`);

  if (rei) {
    const fields: Record<string, string[]> = {
      'Faturamento mensal': ['faturamento', 'revops_faturamento', 'mrr_atual'],
      'Ticket médio': ['ticket_medio', 'revops_ticket_medio', 'ticketMedio'],
      'CAC': ['cac_atual', 'revops_cac'],
      'Churn mensal': ['taxaChurn', 'churn_mensal', 'revops_churn'],
      'Taxa de conversão': ['taxa_conversao', 'taxaConversao'],
      'CRM utilizado': ['crm', 'revops_crm_atual'],
      'Time size': ['teamSize', 'revops_tamanho_time'],
      'Budget disponível': ['budget', 'revops_budget'],
      'Maior dor': ['revops_maior_dor', 'maiorDor', 'main_challenge'],
      'Objetivo principal': ['objetivo', 'revops_objetivo', 'objective'],
      'Canais de aquisição': ['canais', 'revops_canais'],
      'Concorrentes': ['concorrentes', 'revops_concorrentes'],
      'Ciclo de vendas': ['ciclo_vendas', 'revops_ciclo_vendas'],
      'Meta de crescimento': ['crescimento_meta', 'metaCrescimento'],
      'Gargalo operacional': ['gargalo', 'revops_gargalo'],
    };

    for (const [label, keys] of Object.entries(fields)) {
      for (const k of keys) {
        if (rei[k] !== undefined && rei[k] !== null && rei[k] !== '') {
          lines.push(`${label}: ${JSON.stringify(rei[k])}`);
          break;
        }
      }
    }
  }

  lines.push('</CONTEXTO_DO_CLIENTE>');
  return lines.join('\n');
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Acesso Negado: Authorization header ausente.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const {
      project_id,
      framework_id,
      rei_responses,
      segment = '',
      company_name = 'Empresa',
      company_description = '',
      competitors,
    } = body;

    if (!framework_id) {
      return new Response(JSON.stringify({ error: 'framework_id é obrigatório.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = SYSTEM_PROMPTS[framework_id];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Framework desconhecido: ${framework_id}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const clientContext = buildContext(rei_responses, company_name, company_description, segment, competitors);
    const userPrompt = `${clientContext}\n\nGere a análise ${framework_id.toUpperCase().replace(/_/g, ' ')} para esta empresa. Responda SOMENTE com JSON válido, sem markdown, sem explicações.`;

    // ── Anthropic call ────────────────────────────────────────────────────────
    // @ts-ignore
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      console.error('[GrowthMap] Anthropic error:', err);
      return new Response(JSON.stringify({ error: 'Erro na geração de IA. Tente novamente.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiRes.json();
    const rawText: string = aiData.content?.[0]?.text ?? '{}';

    // ── Parse JSON safely ──────────────────────────────────────────────────────
    let parsedData: any = {};
    try {
      // Extract JSON block (Claude sometimes wraps in markdown)
      const match = rawText.match(/\{[\s\S]*\}/);
      parsedData = match ? JSON.parse(match[0]) : JSON.parse(rawText);
    } catch (e) {
      console.error('[GrowthMap] JSON parse error:', e, rawText.slice(0, 200));
      return new Response(JSON.stringify({ error: 'Resposta inválida da IA. Tente regenerar.' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const rei_connections = computeREIConnections(framework_id, rei_responses);

    // ── Auto-generate actions from framework data ──────────────────────────────
    const generated_actions: Array<{ title: string; priority: string; connected_to_sprint: boolean }> = [];
    if (framework_id === 'aarrr' && parsedData.aquisicao?.tactics) {
      const stages = ['aquisicao', 'ativacao', 'retencao'] as const;
      for (const stage of stages) {
        const s = parsedData[stage];
        if (s?.status === 'critico' || s?.status === 'alerta') {
          generated_actions.push({
            title: `[${stage.toUpperCase()}] ${s.tactics?.[0] ?? 'Revisar estratégia'}`,
            priority: s.status === 'critico' ? 'high' : 'medium',
            connected_to_sprint: false,
          });
        }
      }
    } else if (framework_id === 'ice_score' && parsedData.initiatives) {
      for (const init of parsedData.initiatives.slice(0, 3)) {
        generated_actions.push({ title: init.name, priority: init.priority, connected_to_sprint: false });
      }
    } else if (framework_id === 'north_star') {
      generated_actions.push(
        { title: 'Definir dashboard de acompanhamento da North Star Metric', priority: 'high', connected_to_sprint: false },
        { title: 'Alinhar time sobre a métrica principal e leading indicators', priority: 'high', connected_to_sprint: false },
      );
    }

    // ── Log usage (best-effort) ────────────────────────────────────────────────
    try {
      // @ts-ignore
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
      // @ts-ignore
      const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);
      await sb.from('ai_usage_log').insert({
        function_name: 'generate-growthmap',
        model: 'claude-3-5-sonnet-20241022',
        input_tokens: aiData.usage?.input_tokens ?? 0,
        output_tokens: aiData.usage?.output_tokens ?? 0,
        project_id: project_id ?? null,
        metadata: { framework_id },
      }).throwOnError();
    } catch (_) { /* non-blocking */ }

    return new Response(JSON.stringify({
      framework_id,
      data: parsedData,
      rei_connections,
      generated_actions,
      generated_at: new Date().toISOString(),
      status: 'done',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[GrowthMap] Unhandled error:', error);
    return new Response(JSON.stringify({ error: error.message ?? 'Erro interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
