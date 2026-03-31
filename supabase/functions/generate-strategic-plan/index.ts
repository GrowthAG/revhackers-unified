// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "npm:@supabase/supabase-js@2"

async function withAutoRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`[Auto-Retry] Falha na rede/OpenAI. Tentativa ${i + 1} de ${retries}. Aguardando ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error("Unreachable");
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateParams {
  rei_responses: any;
  segment?: string;
  objective?: string;
  isB2B?: boolean;
  projectType?: string;
  projectId?: string;
  projectDuration?: string;
  siteAnalysis?: any;
  enrichedIntelligence?: {
    personas?: any;
    benchmark?: any;
    market?: any;
  };
  clientName?: string;
  clientCompany?: string;
  tradeName?: string;
  jobId?: string; // ID from the ai_generation_jobs table
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let jobId: string | undefined;

  try {
    const payload: GenerateParams = await req.json();
    const { rei_responses, segment, objective, isB2B, projectType, projectId, projectDuration, siteAnalysis, enrichedIntelligence, clientName, clientCompany, tradeName } = payload;
    jobId = payload.jobId;

    if (!rei_responses) {
      throw new Error('rei_responses is required');
    }

    // @ts-ignore
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('API keys are not configured on the server');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        throw new Error("Acesso Negado: Cabeçalho de autorização (JWT) ausente.");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        throw new Error("Acesso Negado: Token inválido ou expirado. " + (authError?.message || ''));
    }

    console.log('[generate-strategic-plan] Initiating generation for segment:', segment);

    // Sanitize REI responses to remove noise, empty fields, and internal UI state
    // This ensures the AI only sees real data and saves tokens
    const sanitizeAnswers = (raw: any) => {
      if (!raw || typeof raw !== 'object') return raw;
      const cleaned: any = {};

      for (const [key, value] of Object.entries(raw)) {
        // Ignore internal metadata, boolean flags, or empty strings
        if (key.startsWith('_') || key === 'id' || key === 'project_id' || key === 'metadata') continue;
        if (value === '' || value === null || value === undefined) continue;
        if (Array.isArray(value) && value.length === 0) continue;
        if (typeof value === 'object' && Object.keys(value).length === 0) continue;

        cleaned[key] = value;
      }
      return cleaned;
    };

    const cleanResponses = sanitizeAnswers(rei_responses);
    const scoringContext = rei_responses.radar_data ? `Radar de Maturidade: ${JSON.stringify(rei_responses.radar_data)}` : '';
    // Type detection - use only projectType field (string matching is fragile and causes false positives)
    const isCrmOps  = projectType === 'crm_ops';
    const isFounder = projectType === 'founder';
    const isDev     = projectType === 'dev' || projectType === 'site';

    // --- INTEGRATION: Meeting Recording Transcript Search ---
    // Source: meeting_recordings table (Chrome extension pipeline)
    // Replaces legacy Notion dependency - recordings are stored in Supabase directly
    let transcriptText = "";

    if (projectId) {
        try {
            console.log('[generate-strategic-plan] Searching meeting_recordings for project:', projectId);

            // Query the most recent completed recording linked to this project
            const recRes = await fetch(
                `${SUPABASE_URL}/rest/v1/meeting_recordings?rei_project_id=eq.${projectId}&transcript_status=eq.completed&order=happened_at.desc&limit=1&select=transcript,ai_insights,ai_summary`,
                {
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Accept': 'application/json',
                    }
                }
            );

            if (recRes.ok) {
                const recordings: any[] = await recRes.json();
                if (recordings && recordings.length > 0) {
                    const rec = recordings[0];
                    const rawTranscript = rec.transcript || '';
                    const aiInsights = rec.ai_insights;

                    // Build enriched transcript context: raw text + AI-extracted intelligence
                    const parts: string[] = [];

                    if (rawTranscript) {
                        parts.push('--- TRANSCRICAO DA REUNIAO ---');
                        parts.push(rawTranscript.substring(0, 12000));
                    }

                    if (aiInsights) {
                        parts.push('');
                        parts.push('--- INTELIGENCIA EXTRAIDA DA REUNIAO ---');

                        if (aiInsights.resumo_executivo) {
                            parts.push(`Resumo executivo: ${aiInsights.resumo_executivo}`);
                        }
                        if (aiInsights.inteligencia_estrategica?.desafios_especificos?.length) {
                            parts.push(`Desafios identificados: ${aiInsights.inteligencia_estrategica.desafios_especificos.join(', ')}`);
                        }
                        if (aiInsights.inteligencia_estrategica?.concorrentes_mencionados?.length) {
                            const concNames = aiInsights.inteligencia_estrategica.concorrentes_mencionados
                                .map((c: any) => c.nome || c).join(', ');
                            parts.push(`Concorrentes mencionados: ${concNames}`);
                        }
                        if (aiInsights.inteligencia_estrategica?.stack_tecnologica?.length) {
                            parts.push(`Stack tecnologica: ${aiInsights.inteligencia_estrategica.stack_tecnologica.join(', ')}`);
                        }
                        if (aiInsights.kickoff_data?.definicao_sucesso) {
                            parts.push(`Definicao de sucesso para o cliente: ${aiInsights.kickoff_data.definicao_sucesso}`);
                        }
                        if (aiInsights.kickoff_data?.gargalos_atuais?.length) {
                            parts.push(`Gargalos atuais: ${aiInsights.kickoff_data.gargalos_atuais.join(', ')}`);
                        }
                        if (aiInsights.acoes_proximas?.length) {
                            parts.push(`Proximas acoes acordadas: ${aiInsights.acoes_proximas.join('; ')}`);
                        }
                    }

                    if (parts.length > 0) {
                        transcriptText = parts.join('\n');
                        console.log(`[generate-strategic-plan] Meeting transcript loaded: ${transcriptText.length} characters`);
                    }
                } else {
                    console.log('[generate-strategic-plan] No completed recording found for project. Proceeding without transcript.');
                }
            } else {
                console.log('[generate-strategic-plan] meeting_recordings query failed:', recRes.status);
            }
        } catch (e: any) {
            console.error('[generate-strategic-plan] Error during recording fetch:', e.message);
            // Non-blocking. Plan generation continues without transcript.
        }
    } else {
        console.log('[generate-strategic-plan] No projectId provided - transcript search skipped.');
    }
    // --- END INTEGRATION ---

    // --- INTEGRATION: Client Reference Materials ---
    let materialsContext = "";
    if (projectId) {
      try {
        // @ts-ignore
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        // @ts-ignore
        const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
          const matRes = await fetch(
            `${SUPABASE_URL}/rest/v1/rei_materials?project_id=eq.${projectId}&status=eq.ready&select=*`,
            {
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              }
            }
          );

          if (matRes.ok) {
            const materials = await matRes.json();
            console.log(`[generate-strategic-plan] Found ${materials.length} reference materials`);

            for (const mat of materials) {
              materialsContext += `\nMATERIAL: ${mat.original_name || 'Sem nome'} (Tipo: ${mat.material_type})`;
              if (mat.description) materialsContext += `\nDescrição do cliente: ${mat.description}`;
              if (mat.extracted_text) materialsContext += `\nConteúdo extraído:\n${mat.extracted_text.substring(0, 6000)}`;
              if (mat.source_type === 'link' && mat.file_url) materialsContext += `\nLink: ${mat.file_url}`;
              materialsContext += '\n---';
            }
          }
        }
      } catch (matError: any) {
        console.warn('[generate-strategic-plan] Materials fetch failed (non-blocking):', matError.message);
      }
    }
    // --- END MATERIALS INTEGRATION ---

    // --- INTEGRATION: Meeting Intelligence from diagnostic_data ---
    // The process-meeting-audio function saves structured intelligence to
    // rei_projects.diagnostic_data under keys: strategic_intelligence,
    // onboarding_artifacts, proposal_artifacts, last_meeting_summary.
    // This data is richer than the raw transcript and should feed the plan.
    let meetingIntelligenceContext = "";
    if (projectId) {
      try {
        const projRes = await fetch(
          `${SUPABASE_URL}/rest/v1/rei_projects?id=eq.${projectId}&select=diagnostic_data`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Accept': 'application/json',
            }
          }
        );

        if (projRes.ok) {
          const projects: any[] = await projRes.json();
          if (projects && projects.length > 0) {
            const diagData = projects[0].diagnostic_data || {};
            const parts: string[] = [];

            // Strategic Intelligence (competitors, benchmarks, challenges, tech stack)
            const si = diagData.strategic_intelligence;
            if (si && typeof si === 'object') {
              parts.push('--- INTELIGENCIA ESTRATEGICA DA REUNIAO ---');
              if (si.concorrentes_mencionados?.length) {
                const names = si.concorrentes_mencionados.map((c: any) => {
                  if (typeof c === 'string') return c;
                  return `${c.nome || c.name || ''}${c.contexto ? ' (' + c.contexto + ')' : ''}`;
                }).join(', ');
                parts.push(`Concorrentes citados pelo cliente: ${names}`);
              }
              if (si.referencias_benchmarking?.length) {
                parts.push(`Referencias de benchmarking: ${si.referencias_benchmarking.join(', ')}`);
              }
              if (si.desafios_especificos?.length) {
                parts.push(`Desafios especificos relatados: ${si.desafios_especificos.join('; ')}`);
              }
              if (si.objetivos_curto_prazo?.length) {
                parts.push(`Objetivos de curto prazo: ${si.objetivos_curto_prazo.join('; ')}`);
              }
              if (si.stack_tecnologica?.length) {
                parts.push(`Stack tecnologica mencionada: ${si.stack_tecnologica.join(', ')}`);
              }
              parts.push('');
            }

            // Onboarding Artifacts (client context, strengths, bottlenecks, personas, timeline)
            const oa = diagData.onboarding_artifacts;
            if (oa && typeof oa === 'object') {
              parts.push('--- ARTEFATOS DE ONBOARDING DA REUNIAO ---');
              if (oa.contexto_cliente) parts.push(`Contexto do cliente: ${oa.contexto_cliente}`);
              if (oa.pontos_fortes?.length) {
                parts.push(`Pontos fortes identificados: ${oa.pontos_fortes.join('; ')}`);
              }
              if (oa.gargalos_atuais?.length) {
                parts.push(`Gargalos atuais: ${oa.gargalos_atuais.join('; ')}`);
              }
              if (oa.personas_alvo?.length) {
                const personaNames = oa.personas_alvo.map((p: any) =>
                  typeof p === 'string' ? p : `${p.titulo || p.nome || ''} - ${p.descricao || ''}`
                ).join('; ');
                parts.push(`Personas-alvo identificadas: ${personaNames}`);
              }
              if (oa.cronograma_macrometras) {
                const cronStr = typeof oa.cronograma_macrometras === 'string'
                  ? oa.cronograma_macrometras
                  : JSON.stringify(oa.cronograma_macrometras);
                parts.push(`Cronograma e macro-metas: ${cronStr}`);
              }
              if (oa.definicao_sucesso) parts.push(`Definicao de sucesso: ${oa.definicao_sucesso}`);
              parts.push('');
            }

            // Proposal Artifacts (project vision, suggested scope, timeline)
            const pa = diagData.proposal_artifacts;
            if (pa && typeof pa === 'object') {
              parts.push('--- PROPOSTA EXTRAIDA DA REUNIAO ---');
              if (pa.visao_projeto) parts.push(`Visao do projeto: ${pa.visao_projeto}`);
              if (pa.escopo_sugerido) {
                const escopoStr = typeof pa.escopo_sugerido === 'string'
                  ? pa.escopo_sugerido
                  : Array.isArray(pa.escopo_sugerido) ? pa.escopo_sugerido.join('; ') : JSON.stringify(pa.escopo_sugerido);
                parts.push(`Escopo sugerido: ${escopoStr}`);
              }
              if (pa.timeline_sugerida) parts.push(`Timeline sugerida: ${pa.timeline_sugerida}`);
              parts.push('');
            }

            // Last meeting summary
            if (diagData.last_meeting_summary) {
              parts.push(`Resumo da ultima reuniao: ${diagData.last_meeting_summary}`);
              parts.push('');
            }

            if (parts.length > 0) {
              meetingIntelligenceContext = parts.join('\n');
              console.log(`[generate-strategic-plan] Meeting intelligence loaded from diagnostic_data: ${meetingIntelligenceContext.length} chars`);
            }
          }
        }
      } catch (miError: any) {
        console.warn('[generate-strategic-plan] Meeting intelligence fetch failed (non-blocking):', miError.message);
      }
    }
    // --- END MEETING INTELLIGENCE INTEGRATION ---

    // Determine effective project duration
    const effectiveDuration = projectDuration || (isDev ? '6 semanas' : '90 dias');
    console.log(`[generate-strategic-plan] Using project duration: ${effectiveDuration}`);

    // --- SITE ANALYSIS CONTEXT ---
    let siteContext = '';
    if (siteAnalysis && typeof siteAnalysis === 'object') {
      console.log('[generate-strategic-plan] Injecting site analysis context');
      const sa = siteAnalysis;
      siteContext = `

<ANALISE_DO_SITE_DO_CLIENTE>
Segmento: ${sa.segmento || 'Nao identificado'}
Publico-alvo: ${sa.publico_alvo || 'Nao identificado'}
Produtos/Servicos: ${Array.isArray(sa.produtos_servicos) ? sa.produtos_servicos.join(', ') : (sa.produtos_servicos || 'Nao identificados')}
Proposta de valor: ${sa.resumo_proposta || 'Nao identificada'}
Diferenciais: ${sa.diferenciais || 'Nao identificados'}
Maturidade digital: ${sa.maturidade_digital || 'Nao avaliada'}
Tom de comunicacao: ${sa.tom_comunicacao || 'Nao avaliado'}
Pontos fracos do site: ${Array.isArray(sa.pontos_fracos_site) ? sa.pontos_fracos_site.join(', ') : (sa.pontos_fracos_site || 'Nao avaliados')}
Ferramentas detectadas: ${sa.ferramentas_detectadas || 'Nenhuma'}
Oportunidades: ${Array.isArray(sa.oportunidades_estrategicas) ? sa.oportunidades_estrategicas.join(', ') : (sa.oportunidades_estrategicas || 'Nao identificadas')}
</ANALISE_DO_SITE_DO_CLIENTE>

INSTRUCAO CRITICA SOBRE O CONTEXTO DO SITE:
- Use as informacoes acima para personalizar TODAS as secoes do plano ao negocio REAL do cliente.
- Nos pilares: referencie os produtos/servicos reais do cliente, nao genéricos.
- No roadmap: inclua acoes especificas para o segmento e publico-alvo identificados.
- Nos OKRs: use metricas relevantes para o tipo de negocio do cliente.
- No diagnostico: aponte gaps reais baseados na maturidade digital observada.
- Nos quick wins: sugira acoes concretas baseadas nos pontos fracos do site.
- NUNCA ignore a analise do site. O plano DEVE ser contextualizado ao negocio real.
`;
    } else {
      console.log('[generate-strategic-plan] No site analysis available');
    }
    // --- END SITE ANALYSIS CONTEXT ---

    // --- PIPELINE & CRM CONTEXT ---
    let pipelineContext = '';
    const pipelines = cleanResponses.revops_custom_pipelines;
    const lostReasons = cleanResponses.revops_custom_lost_reasons;
    
    if (pipelines && Array.isArray(pipelines) && pipelines.length > 0) {
        pipelineContext += '\\n<ESTRUTURA_DE_FUNIL_ATUAL>\\n';
        pipelines.forEach((pipe: any) => {
            pipelineContext += `- Funil: ${pipe.name}\\n`;
            if (pipe.stages && Array.isArray(pipe.stages)) {
                pipelineContext += `  Etapas: ${pipe.stages.join(' ➔ ')}\\n`;
            }
        });
        pipelineContext += '</ESTRUTURA_DE_FUNIL_ATUAL>\\n';
    }

    if (lostReasons && Array.isArray(lostReasons) && lostReasons.length > 0) {
        pipelineContext += '\\n<MOTIVOS_DE_PERDA_ATUAIS>\\n';
        const reasonsList = lostReasons.map((lr: any) => lr.reason).join(', ');
        pipelineContext += `Motivos mapeados: ${reasonsList}\\n`;
        pipelineContext += '</MOTIVOS_DE_PERDA_ATUAIS>\\n';
    }

    if (pipelineContext) {
        pipelineContext += '\\nINSTRUCAO CRITICA DA ARQUITETURA DE VENDAS:\\n- Se a estrutura de funil ou motivos de perda constarem acima, USE ESTES DADOS para fundamentar o diagnóstico e os quick wins (exemplo: proponha automações focadas NESTAS etapas e mitigação para ESTES motivos de perda especificos).\\n';
    }
    // --- END PIPELINE & CRM CONTEXT ---

    // --- ENRICHED INTELLIGENCE CONTEXT ---
    let enrichmentContext = '';
    if (enrichedIntelligence) {
      console.log('[generate-strategic-plan] Injecting enriched intelligence context');
      const ei = enrichedIntelligence;
      const lines: string[] = [];
      lines.push('<INTELIGENCIA_DE_MERCADO_JA_VALIDADA>');
      lines.push('ATENCAO: Os dados abaixo foram pesquisados e validados por IA. VOCE DEVE usar esses dados como fonte primaria de verdade.');
      lines.push('As personas, concorrentes e benchmarks abaixo devem ser REFERENCIADOS diretamente nos pilares, roadmap, OKRs e executive_summary.');
      lines.push('');

      if (ei.personas?.personas && Array.isArray(ei.personas.personas)) {
        lines.push('--- PERSONAS DO ICP (Ideal Customer Profile) ---');
        ei.personas.personas.forEach((p: any, i: number) => {
          lines.push(`Persona ${i+1}: ${p.nome} - ${p.cargo}`);
          if (p.bio_curta) lines.push(`  Bio: ${p.bio_curta}`);
          if (p.dores_principais) lines.push(`  Dores: ${p.dores_principais.join('; ')}`);
          if (p.gatilhos_mentais) lines.push(`  Gatilhos: ${p.gatilhos_mentais.join('; ')}`);
          if (p.canais_favoritos) lines.push(`  Canais: ${p.canais_favoritos.join(', ')}`);
          if (p.pitch_elevador) lines.push(`  Pitch: ${p.pitch_elevador}`);
        });
        lines.push('');
      }

      if (ei.benchmark) {
        lines.push('--- BENCHMARK DO SEGMENTO ---');
        if (ei.benchmark.cac_medio) lines.push(`CAC Medio do segmento: ${ei.benchmark.cac_medio}`);
        if (ei.benchmark.taxa_conversao) lines.push(`Taxa de conversao media: ${ei.benchmark.taxa_conversao}`);
        if (ei.benchmark.ciclo_vendas) lines.push(`Ciclo de vendas medio: ${ei.benchmark.ciclo_vendas}`);
        if (ei.benchmark.ltv_cac_ratio) lines.push(`LTV:CAC ideal: ${ei.benchmark.ltv_cac_ratio}`);
        if (ei.benchmark.comparativo_mercado) lines.push(`Comparativo: ${ei.benchmark.comparativo_mercado}`);
        lines.push('');
      }

      if (ei.market) {
        if (ei.market.concorrentes_benchmark && Array.isArray(ei.market.concorrentes_benchmark)) {
          lines.push('--- CONCORRENTES MAPEADOS ---');
          ei.market.concorrentes_benchmark.forEach((c: any) => {
            lines.push(`- ${c.nome}${c.url ? ' (' + c.url + ')' : ''}: Fortes: ${c.pontos_fortes || 'N/A'}. Fracos: ${c.pontos_fracos || 'N/A'}`);
          });
          lines.push('');
        }
        if (ei.market.tendencias_2025 && Array.isArray(ei.market.tendencias_2025)) {
          lines.push('--- TENDENCIAS DO MERCADO ---');
          ei.market.tendencias_2025.forEach((t: any) => {
            lines.push(`- ${t.titulo}: ${t.descricao || t.impacto || ''}`);
          });
          lines.push('');
        }
        if (ei.market.tam_sam_som) {
          lines.push(`TAM: ${ei.market.tam_sam_som.tam}`);
          lines.push(`SAM: ${ei.market.tam_sam_som.sam}`);
          lines.push(`SOM: ${ei.market.tam_sam_som.som}`);
        }
      }

      lines.push('</INTELIGENCIA_DE_MERCADO_JA_VALIDADA>');
      lines.push('');
      lines.push('INSTRUCAO CRITICA: Use os NOMES EXATOS das personas acima nos pilares e roadmap.');
      lines.push('INSTRUCAO CRITICA: Use os CONCORRENTES REAIS acima na analise competitiva do plano.');
      lines.push('INSTRUCAO CRITICA: Use os BENCHMARKS acima para calibrar OKRs e projecoes.');
      enrichmentContext = lines.join('\n');
    } else {
      console.log('[generate-strategic-plan] No enriched intelligence available');
    }
    // --- END ENRICHED INTELLIGENCE CONTEXT ---

    let strategicContext = `Crie um plano estratégico de Growth altamente tático e contextualizado para um projeto de ${effectiveDuration}.
Você DEVE basear cada insight, cada risco e cada etapa do roadmap ESPECIFICAMENTE nas dores relatadas nas respostas e na transcrição da call.
LEI IMUTÁVEL: NUNCA crie cenários genéricos de "aumentar vendas" ou "melhorar processos". Cite QUAIS processos estão ruins segundo o cliente. Diga QUANTO é o budget, QUAL ferramenta eles usam atualmente, QUAL é o tamanho do time.
O cronograma DEVE respeitar a duração de ${effectiveDuration}. Distribua as fases proporcionalmente.
Os OKRs devem ter metas de CAC, LTV e ROAS onde aplicável.
REGRA DE FORMATAÇÃO OBRIGATÓRIA: NUNCA use o caractere em dash (travessão longo). Use apenas hífen simples (-), dois pontos (:), ponto (.) ou vírgula (,) como separadores. Isso se aplica a TODOS os campos do JSON.`;

    if (isCrmOps) {
      strategicContext = `Crie um Roadmap cirúrgico focado EXATAMENTE em ${effectiveDuration} de implementação de RevOps/CRM de excelência.
O roadmap deve transformar o caos atual (vide respostas e transcrição) em uma máquina previsível.
Distribua as fases proporcionalmente ao prazo de ${effectiveDuration}:
- Fase 1 (Fundação Operacional): Centralizar os dados fragmentados do cliente, mapear processo atual e configurar o Projeto Técnico do CRM.
- Fase 2 (SLA e Automações): Velocidade de resposta ao lead, automação de Passagem de Bastão MKT→SDR→Closer e painéis de pipeline.
- Fase 3 (Governança e Retenção): Rito de Revisão de Pipeline semanal, Higiene de Dados e Onboarding do CS.
LEI IMUTÁVEL: Seja ABSURDAMENTE específico. Se o cliente reclamou de leads frios, escreva "Filtro de Leads Frios com Lead Scoring no Funnels". Nomeie TODAS as ferramentas, cargos e gargalos citados. Os OKRs devem ter métricas de Taxa de Conversão, Velocidade do Pipeline e % de preenchimento do CRM.
REGRA DE FORMATAÇÃO OBRIGATÓRIA: NUNCA use o caractere em dash (travessão longo). Use apenas hífen simples (-), dois pontos (:), ponto (.) ou vírgula (,) como separadores.`;
    } else if (isFounder) {
      strategicContext = `Crie um Protocolo de Autoridade Digital e Personal Branding para EXATAMENTE ${effectiveDuration} no LinkedIn.
ATENÇÃO CRÍTICA: Este é um Founder Protocol: o cliente é o produto. NÃO é um plano de empresa. Não crie OKRs de "aumentar vendas da empresa" ou "implementar CRM". O foco é 100% na pessoa, na audiência e na conversão de autoridade em oportunidade.
Estruture em 3 fases:
1. Mês 1 (Posicionamento e Identidade): Definir nicho de autoridade, POV único, ICP do perfil pessoal. Calibrar bio, headline, conteúdo fixado e banner do LinkedIn com base nos dados do cliente.
2. Mês 2 (Máquina de Conteúdo): Cadência 3x/semana, formatos de alto alcance (carrossel, text post, vídeo curto), estratégia de comentários em contas âncora do nicho.
3. Mês 3 (Loop de Conversão): Transformar audiência em pipeline: conexões estratégicas no ICP, DM ativo, convites para palestras, parcerias com criadores.
LEI IMUTÁVEL: Cite o nicho exato do founder, o ICP do perfil (cargo, empresa, segmento), os canais e formatos que ele mencionou. Os OKRs devem ter metas de impressões/mês, seguidores qualificados, conexões de 1º grau no ICP e inbounds via DM. NÃO use métricas de "engajamento genérico". Os pillars devem ser: Contexto Atual do Perfil / Posicionamento e Conteúdo / Alvos de Autoridade.`;
    } else if (isDev) {
      strategicContext = `Crie um Roadmap de Entrega de Projeto Digital para EXATAMENTE ${effectiveDuration}.
ATENÇÃO CRÍTICA: Este é um projeto de desenvolvimento/site. NÃO é um plano de growth contínuo. Não crie OKRs de geração de demanda ou funil de vendas. O foco é ENTREGA com qualidade, prazo e resultado técnico mensurável.
Distribua as fases proporcionalmente ao prazo de ${effectiveDuration}:
- Fase 1 (Briefing e Arquitetura): Definir escopo técnico, sitemap, stack tecnológica, referências visuais. Wireframe aprovado antes de qualquer linha de código.
- Fase 2 (Desenvolvimento e Integrações): Codificar páginas prioritárias, integrar ferramentas (CRM, Analytics, formulários), revisão de copy e testes internos de performance e responsividade.
- Fase 3 (QA, Lançamento e Handover): Rodada de feedback do cliente, ajustes finais, go-live controlado, configuração de DNS, treinamento de uso e entrega do repositório.
LEI IMUTÁVEL: Cite QUAIS páginas serão entregues, QUAL stack foi escolhida, QUAL meta de performance (LCP < 2.5s, GTmetrix ≥ 90). Os OKRs devem ser entregáveis concretos: wireframe aprovado, páginas em produção, Core Web Vitals no verde, handover documentado. Os pillars devem ser: Escopo e Arquitetura / Stack e Integrações / Performance e Entrega.
REGRA DE FORMATAÇÃO OBRIGATÓRIA: NUNCA use o caractere em dash (travessão longo). Use apenas hífen simples (-), dois pontos (:), ponto (.) ou vírgula (,) como separadores.`;
    }

    // ── Knowledge Base: Strategic Frameworks ──
    // Conceitos de livros de referência que fundamentam a metodologia RevHackers
    let frameworkContext = `
FRAMEWORK BASE: ONBOARDING ORQUESTRADO (Donna Weber):
O onboarding é a jornada completa de levar o cliente ao sucesso. NÃO é apenas implementação técnica.
6 etapas: Embarque → Passagem de Bastão → Kickoff → Adoção → Revisão → Expansão.
Começa ANTES do fechamento da venda. A janela crítica são os primeiros 90 dias.
Mais de 50% do churn está vinculado a onboarding deficiente.
O Plano de Sucesso deve incluir: visão do cliente, resultados desejados, cronograma, papéis (RACI) e métricas.
Cada etapa do onboarding_data que você gerar DEVE mapear para essas 6 fases.

FRAMEWORK: VIESES COGNITIVOS (Kahneman):
- Aversão à perda: mostre o custo de NÃO agir no diagnóstico (2x mais impactante que ganhos).
- Ancoragem: apresente benchmarks do setor ANTES de mostrar os números do cliente.
- Facilidade cognitiva: recomendações claras e diretas são mais persuasivas que textos longos.`;

    if (!isFounder && !isDev) {
      frameworkContext += `

FRAMEWORK - RECEITA PREVISÍVEL (Aaron Ross):
3 tipos de leads: Seeds (referral/orgânico) + Nets (inbound/marketing) + Spears (outbound/prospecção ativa).
Especialização de funções: SDR (prospecta) → AE/Closer (fecha) → CS (retém e expande).
7 erros fatais: atribuir prospecção a vendedores, não ter ICP definido, depender de um único canal, não rastrear métricas por etapa.
O "Vale da Morte" é a transição de crescimento orgânico para crescimento previsível.
Use esses conceitos ao estruturar geração de demanda, pipeline e OKRs do plano.`;
    }

    const prompt = `Você é o Diretor Estratégico "World-Class" de Growth & RevOps na RevHackers. Você age com autoridade absoluta, pragmatismo brutal e foco obsessivo em eficiência e MRR. Você não tem pena de cortar "gordura" processual ou apontar falhas na arquitetura que o cliente desenhou.
Acabamos de realizar o Onboarding/Diagnóstico (Kickoff) com um cliente.
As respostas do diagnóstico (REI) fornecidas revelam os gargalos, o caos interno e as restrições da empresa.

REGRA ABSOLUTA DE IDIOMA E ORTOGRAFIA:
1. TODO o texto gerado DEVE estar em Português do Brasil IMPECÁVEL.
2. É ESTRITAMENTE OBRIGATÓRIO o uso correto de todos os acentos e pontuações (ex: Reunião, Identificado, Ação, Avaliação, Afiliados).
3. Nunca cometa erros de digitação grosseiros como "Afilaidos", "Indetificado" ou "Finalacao". Revise as palavras mentalmente antes de gerá-las no JSON.

${frameworkContext}

CONCEXTO DO CLIENTE:
Segmento: ${segment || 'B2B'}
Objetivo Principal: ${objective || 'Crescimento Previsível'}
Modelo B2B: ${isB2B !== false ? 'Sim' : 'Não'}

<GLOSSARIO_DE_CAMPOS_REI>
ATENÇÃO CRITICA: Os campos abaixo tem nomes tecnicos que PODEM SER AMBIGUOS. Use ESTE glossario como referencia OBRIGATORIA antes de interpretar qualquer valor do JSON.
- revops_cac_atual = Custo de Aquisicao de Cliente ATUAL ou DESEJADO em Reais. Este e o CAC REAL do cliente. NAO confunda com custos de ferramentas.
- revops_tech_debt_cost = Custo ANUAL de ferramentas e plataformas satelites (Apollo, Snovio, etc). NAO e CAC. E o custo de manutencao do stack tecnologico.
- revops_mrr_atual = Receita Recorrente Mensal ATUAL em Reais (valor absoluto, nao percentual).
- revops_ticket_medio = Ticket Medio por contrato/deal em Reais.
- revops_sales_cycle_days = Ciclo medio de vendas em DIAS (do primeiro contato ate o fechamento).
- revops_win_rate = Taxa de conversao de proposta enviada para venda fechada em PERCENTUAL.
- revops_tamanho_time = Composicao do time comercial (quantidade de SDRs + Closers).
- revops_pipeline_stagnation = Gargalos do pipeline, etapas onde os deals ficam travados com tempo medio de estagnacao.
- revops_flow_cadencia = Nivel de organizacao da cadencia de contato com leads (caotico/basico/estruturado).
- revops_automacoes_core = Nivel de automacao atual de marketing e vendas (manual/parcial/avancado).
- revops_forecasting_accuracy = Onde e como o forecast e feito (no CRM ou fora dele).
- revops_onboarding_handoff = Qualidade da passagem de bastao de vendas para CS/sucesso do cliente.
- revops_hub_central = Ferramenta central de CRM e as ferramentas satelites.
- revops_lead_scoring = Tipo de lead scoring usado (manual/automatizado/framework).
- revops_icp_framework = Framework de qualificacao de ICP usado pela empresa.
- revops_sla_marketing_vendas = Existencia e estrutura do SLA entre marketing e vendas.
- revops_speed_to_lead_sla = Tempo de resposta ao lead (tempo entre entrada do lead e primeiro contato).
- revops_shadow_it_index = Nivel de uso de ferramentas nao-oficiais pelos vendedores (planilhas, WhatsApp pessoal, etc).
- revops_toxic_compensation = Modelo de remuneracao variavel (saudavel baseado em qualidade ou toxico baseado em volume).
- revops_cpq_friction = Nivel de friccao na geracao de propostas comerciais (automatizado/parcial/manual).
- revops_economic_buyer_mapped = Se o decisor economico esta mapeado nos deals.
- revops_health_score_tracking = Se existe health score de clientes para CS.
- revops_expansion_playbook = Se existe playbook de expansao/upsell.
- revops_routing_vip = Como os leads VIP sao distribuidos.
- revops_win_loss_analysis = Tipo de analise de deals ganhos vs perdidos (inexistente/informal/estruturada).
- revops_integracoes = Nivel de integracao entre ferramentas (isoladas/hub_satelites/totalmente_integrado).
- revops_data_hygiene_owner = Quem e responsavel pela higiene de dados.
- revops_custom_pipelines = Estrutura dos funis/pipelines de vendas com suas etapas.
- revops_custom_lost_reasons = Motivos de perda de deals mapeados pela empresa.

REGRA ABSOLUTA DE INTERPRETACAO:
1. Se o campo diz "cac_atual", o valor E o CAC. Use ESSE valor para definir metas de CAC.
2. Se o campo diz "tech_debt_cost", o valor E o custo de ferramentas. NAO use como CAC.
3. Se o campo diz "mrr_atual", o valor E a receita mensal. NAO divida por 12.
4. Se o campo diz "ticket_medio", o valor E por deal/contrato. NAO multiplique.
5. NUNCA invente faixas de valores. Use os valores EXATOS informados pelo cliente.
6. Se "speed_to_lead_sla" contem "informal", significa que a resposta existe mas nao e mensurada formalmente.
7. Se "expansion_playbook" contem "parcial" ou "nao_estruturado", NAO assuma que upsell ja funciona. Trate como gap.
8. Se "toxic_compensation" contem "coletivo_distribuido", o modelo e de comissao coletiva (nao toxico). NAO sugira mudar modelo de comissionamento.
9. Se "data_hygiene_owner" menciona ferramentas mas NAO menciona uma pessoa, significa que NINGUEM e responsavel por higiene de dados. Trate como gap critico.
10. Se "custom_lost_reasons" contem "Outros / Sem motivo claro", isso indica que a maioria dos deals perdidos NAO tem motivo catalogado - isso e um problema operacional grave que deve ser mencionado.
</GLOSSARIO_DE_CAMPOS_REI>

Respostas Reais do Diagnóstico:
${JSON.stringify(cleanResponses, null, 2)}
${scoringContext}

${transcriptText ? `
<TRANSCRIPT_CONTEXT>
${transcriptText}
</TRANSCRIPT_CONTEXT>
[CRÍTICO - ANTI-ALUCINAÇÃO]: O texto HTML <TRANSCRIPT_CONTEXT> é uma transcrição bruta (Discovery) e POSSUI ruído. Filtre o ruído, mas PRESERVE EXATAMENTE as dores factuais e citações diretas do cliente (Ex: "A gente gasta X", "Trocamos a plataforma Y", "Os vendedores não lançam as coisas no CRM").` : ''}

${materialsContext ? `
<MATERIAIS_REFERENCIA>
${materialsContext}
</MATERIAIS_REFERENCIA>
[INSTRUÇÃO MATERIAIS]: O cliente forneceu materiais de referência próprios (transcrições, mapas mentais, MindMeister, fluxogramas). Use-os como arma tática primária:
- SE QUESTIONE: "O que o cliente desenhou no material dele está maduro o suficiente? Se não, onde estão as falhas operacionais?"
- APROPRIAÇÃO CRÍTICA: Se nos materiais o cliente mapeou "Fases de CS", "Níveis de Escala", ou um "Roadmap de NMRR", você DEVE obrigatoriamente sugar esses conceitos e expandi-los taticamente de forma assustadoramente detalhada nos "pilares" e "roadmap_phases".
- NUNCA descarte o que eles enviaram. Transforme os rascunhos que eles anexaram num plano de guerra prático!
- Referencie explicitamente os materiais nas recomendações (ex: "Conforme mapeado no MindMeister de vocês na fase The Attack...")
- Baseia projeções e metas em dados reais encontrados nos materiais (não em benchmarks genéricos)
- Se houver planilhas ou metas de MRR no material (ex: 350K Target), crie OKRs voltados EXATAMENTE para o número deles.` : ''}
${siteContext}
${pipelineContext}
${enrichmentContext}
${meetingIntelligenceContext ? `
<INTELIGENCIA_DA_REUNIAO>
${meetingIntelligenceContext}
</INTELIGENCIA_DA_REUNIAO>
[INSTRUCAO REUNIAO]: Os dados acima foram extraidos e estruturados por IA a partir da gravacao da reuniao de kickoff. Eles representam fatos confirmados pelo cliente durante a call.
- Concorrentes citados DEVEM aparecer na analise competitiva e nos pilares.
- Desafios especificos DEVEM fundamentar os riscos e o diagnostico.
- Objetivos de curto prazo DEVEM ser refletidos nos OKRs e quick wins.
- Gargalos atuais DEVEM ser atacados nos primeiros ciclos do roadmap.
- Personas-alvo identificadas DEVEM ser consideradas na estrategia de aquisicao.
- A visao do projeto e escopo sugerido DEVEM ser incorporados ao executive_summary e thesis_statement.
` : ''}
${strategicContext}

[REGRA CRITICA - PRIORIDADE MAXIMA - ANTI-CONTAMINACAO DE BENCHMARKS]:
Os dados de ENRICHMENT/BENCHMARK acima sao REFERENCIA DE MERCADO apenas.
Para metricas do CLIENTE, use EXCLUSIVAMENTE os valores do campo REI:
- CAC do cliente = valor EXATO de "revops_cac_atual" (NAO use benchmark de mercado como CAC do cliente)
- MRR do cliente = valor EXATO de "revops_mrr_atual"
- Ticket medio = valor EXATO de "revops_ticket_medio"  
- Ciclo de vendas = valor EXATO de "revops_sales_cycle_days"
- Win rate = valor EXATO de "revops_win_rate"
Se "revops_cac_atual" = 1000, entao o CAC do cliente e R$1.000. QUALQUER valor diferente no expected_outcome e ERRO.
Benchmarks devem ser usados apenas para COMPARAR, nunca para SUBSTITUIR os dados reais do cliente.

Retorne um JSON VÁLIDO EXATAMENTE NESTE FORMATO, e preencha TODOS os arrays com TÁTICAS AVANÇADAS, inferidas das respostas:
{
  "summary": "Resumo executivo cirúrgico atacando a dor principal (1-2 frases).",
  "executive_summary": {
    "context": "1-2 frases descrevendo o contexto operacional EXATO do cliente - segmento, tamanho, maturidade digital. Baseado nas respostas reais.",
    "problem": "1-2 frases definindo o problema central com dados concretos - cite dores literais da call/REI.",
    "solution": "1-2 frases sobre a solução proposta pela RevHackers - cite a metodologia específica e ferramentas.",
    "expected_outcome": "1-2 frases sobre o resultado esperado com métricas específicas - CAC, LTV, conversão, prazo."
  },
  "current_vs_future": {
    "current": ["Estado atual 1 - situação real negativa extraída do diagnóstico", "Estado atual 2 - gap operacional citado pelo cliente", "Estado atual 3 - ferramenta ou processo deficiente mencionado", "Estado atual 4 - consequência financeira ou de performance", "Estado atual 5 - risco ou dependência não mitigada"],
    "future": ["Estado futuro 1 - como ficará após a implementação", "Estado futuro 2 - melhoria operacional específica", "Estado futuro 3 - ferramenta ou processo implementado", "Estado futuro 4 - resultado financeiro ou de performance esperado", "Estado futuro 5 - autonomia ou governança conquistada"]
  },
  "quick_wins": [
    { "day": "Dia 1", "action": "Acao concreta do primeiro dia - cite ferramenta e responsavel", "outcome": "Resultado tangivel entregue ao final do dia", "owner": "revhackers" },
    { "day": "Dia 2", "action": "Acao do segundo dia", "outcome": "Entregavel concreto", "owner": "revhackers" },
    { "day": "Dia 3", "action": "Acao do terceiro dia", "outcome": "Entregavel concreto", "owner": "cliente" },
    { "day": "Dia 4-5", "action": "Acao dos dias 4 e 5", "outcome": "Entregavel concreto", "owner": "ambos" },
    { "day": "Dia 6", "action": "Acao do sexto dia", "outcome": "Entregavel concreto", "owner": "revhackers" },
    { "day": "Dia 7", "action": "Review + marco de conclusao da primeira semana", "outcome": "Confirmacao de que a base esta solida", "owner": "ambos" }
  ],
  "thesis_statement": {
    "before": "Frase que antecede o highlight - contextualize a necessidade (ex: Para escalar vendas sem perder margem, precisamos construir)",
    "highlight": "Conceito central da tese em 2-4 palavras destacadas (ex: Motor de Receita Integrado)",
    "after": "Conclusão da frase (ex: .)"
  },
  "context_mirror": {
    "segment": "Segmento ou nicho exato de atuação do cliente conforme as respostas (ex: SaaS B2B, E-commerce de moda, Consultor Independente de RH)",
    "objective": "Objetivo principal declarado pelo cliente nas respostas - direto e específico (ex: Implementar CRM com rastreamento completo em 90 dias)",
    "maturity": "Maturidade operacional/digital (ex: Inicial, Intermediária, Avançada) - baseada nas ferramentas e processos descritos",
    "restrictions": "Restrições LITERAIS de time, ferramentas ou orçamento extraídas diretamente das respostas e transcrição."
  },
  "signals": [
    { "type": "positive"|"negative"|"neutral", "text": "Citação ou sinal CLARO E ESPECÍFICO do cliente (Jamais genérico)", "impact": "Impacto real e numérico na operação" }
  ],
  "risks": [
    { "severity": "high"|"medium"|"low", "text": "Risco letal ATUAL baseado no relato", "mitigation": "Tática avançada da RevHackers para resolver. Exclua buzzwords como sinergia." }
  ],
  "decisions": [
    { "title": "Decisão Arrojada", "recommendation": "O que vamos cortar ou implementar sem dó", "basedOn": ["Dado real 1", "Dado real 2"], "ruleApplied": "Framework técnico adotado (ex: MEDDPICC, Lead Scoring)", "implication": "Resultância dura na equipe ou tech stack" }
  ],
  "pillars": [
    { "name": "Contexto Atual", "icon": "building", "items": ["Sintoma 1 específico relatado pelo cliente", "Sintoma 2 com dado numérico se disponível", "Restrição operacional citada na call", "Gap ou ineficiência mapeada no diagnóstico"] },
    { "name": "Tech Stack Visado", "icon": "settings", "items": ["Ferramenta atual vs. ferramenta ideal", "Integração necessária específica", "Gap de rastreamento identificado", "Automação prioritária a implementar"] },
    { "name": "Alvos de Curto Prazo", "icon": "search", "items": ["Alvo 1 com métrica ou prazo claro", "Alvo 2 baseado na dor principal", "Alvo 3 de quick win operacional", "Alvo 4 de resultado mensurável"] },
    { "name": "Compromissos Mútuos", "icon": "handshake", "items": ["Reuniões de RAPT mensais - Revisão, Alinhamento, Prioridade, Tática", "Disponibilidade de materiais e aprovações em até 48h", "Acessos compartilhados a CRM, Ads e Analytics", "Compartilhamento de resultados para fechar o loop de atribuição"] }
  ],
  "thesis_pillars": [
    { "icon": "Target", "title": "Nome do Pilar de Solução 1 - o mais urgente", "description": "Como EXATAMENTE este pilar resolve o gap diagnosticado - cite a ferramenta, o processo e a métrica alvo. 2-3 frases.", "actions": ["Ação concreta 1 com ferramenta nomeada", "Ação concreta 2 com prazo", "Ação concreta 3 com KPI"] },
    { "icon": "Zap", "title": "Nome do Pilar de Solução 2", "description": "O segundo vetor de transformação - conecte ao segundo sinal ou risco diagnosticado.", "actions": ["Ação concreta 1", "Ação concreta 2", "Ação concreta 3"] },
    { "icon": "Rocket", "title": "Nome do Pilar de Solução 3", "description": "O pilar de escala/consolidação - o que garante que os ganhos dos pilares 1 e 2 se mantenham.", "actions": ["Ação concreta 1", "Ação concreta 2", "Ação concreta 3"] }
  ],
  "methodology_steps": [
    { "phase": "01", "tagline": "Semana 1-2", "name": "Fundação / Setup", "description": "Táticas duras que faremos na semana 1 usando os nomes reais das ferramentas citadas (se aplicável).", "principles": ["Tática exata 1", "Tática exata 2"] }
  ],
  "roadmap_phases": [
    { "name": "Ciclo 01", "title": "Fundação e Diagnóstico (Preencha o período exato, ex: Dias 01-10 ou Mês 01)", "items": ["Ação 1 cirúrgica contra a dor principal", "Ação 2 baseada no contexto real", "Ação 3 com ferramenta específica", "Ação 4 de configuração técnica"] },
    { "name": "Ciclo 02", "title": "Execução e Automações (Período exato, ex: Dias 11-20 ou Mês 02)", "items": ["Ação 1 de execução concreta", "Ação 2 com métrica mensurável", "Ação 3 de automação e integração", "Ação 4 de treinamento da equipe"] },
    { "name": "Ciclo 03", "title": "Governança e Escala (Período final, ex: Dias 21-30 ou Mês 03)", "items": ["Ação 1 de governança operacional", "Ação 2 de revisão e otimização", "Ação 3 de documentação e passagem de bastão", "Ação 4 de consolidação de resultados"] }
  ],
  "okrs": [
    { "objective": "Nome do objetivo estratégico 1", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 1", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] },
    { "objective": "Nome do objetivo estratégico 2", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 2", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] },
    { "objective": "Nome do objetivo estratégico 3", "description": "O que este OKR resolve de concreto (Objective)", "timeline": "Trimestre 3", "sub_results": ["KR 1 com número específico", "KR 2 tático mensurável", "KR 3 com prazo"] }
  ],
  "onboarding_data": {
    "kickoff": {
      "main_title": "Frase cirúrgica sobre o gargalo central deste cliente - cite a dor exata relatada na call.",
      "p1_title": "Nome do pilar do kickoff voltado ao problema principal (ex: Revisão do Funil de Vendas)", "p1_desc": "Descrição técnica conectada à realidade do cliente - cite ferramentas e processos mencionados.", "p1_output": "Entregável concreto (ex: Documento de Diagnóstico Operacional)",
      "p2_title": "Nome do segundo pilar do kickoff (ex: Mapa de Responsáveis)", "p2_desc": "O que será definido e por quê, conectado ao contexto do diagnóstico.", "p2_output": "Entregável concreto (ex: Matriz de Responsabilidades Assinada)",
      "p3_title": "Nome do terceiro pilar do kickoff (ex: Inventário de Acessos)", "p3_desc": "Ação concreta conectada à infraestrutura do cliente - cite plataformas mencionadas.", "p3_output": "Entregável concreto (ex: Cofre de Credenciais Preenchido)"
    },
    "setup": {
      "main_title": "Frase de impacto sobre a importância da fundação técnica para ESTE cliente.",
      "p1_title": "Ação técnica principal de setup (ex: Estruturação do Pipeline no Funnels)", "p1_desc": "Descrição conectada aos processos e ferramentas do cliente - cite nomes reais.",
      "p2_title": "Segunda ação de setup (ex: Integração de Canais de Entrada)", "p2_desc": "Descrição específica ao contexto do diagnóstico.",
      "p3_title": "Terceira ação de setup (ex: Rastreamento de Ponta a Ponta)", "p3_desc": "Como implementamos o rastreamento com base na stack do cliente."
    },
    "training": {
      "main_title": "Frase sobre a importância da adoção da equipe para ESTE cliente.",
      "p1_title": "Formato de treinamento (ex: Sessões Gravadas por Módulo)", "p1_desc": "Como o treinamento é entregue - conectado ao nível de maturidade do time.",
      "p2_title": "Validação prática (ex: Simulação de Cenários Reais)", "p2_desc": "Como garantimos que o time absorveu - cenários baseados no dia a dia DELES.",
      "p3_title": "Marco de transição (ex: Migração Definitiva do Processo Antigo)", "p3_desc": "O momento em que o sistema antigo morre - cite qual era o processo anterior."
    },
    "adoption": {
      "main_title": "Frase sobre ajustes pós-treinamento conectada à realidade do cliente.",
      "p1_title": "Monitoramento silencioso (ex: Auditoria de Preenchimento)", "p1_desc": "Como monitoramos a adoção real - cite os campos e etapas críticos deste cliente.",
      "p2_title": "Ajustes estruturais (ex: Refinamento de Etapas de Funil)", "p2_desc": "Mudanças identificadas na prática - conectadas ao diagnóstico inicial."
    },
    "handover": {
      "main_title": "Frase sobre a transição de bastão e autonomia do cliente.",
      "p1_title": "Entregável de documentação (ex: Manual Operacional Completo)", "p1_desc": "O que é entregue para que o cliente opere sem dependência - cite as ferramentas.",
      "p2_title": "Entregável de análise (ex: Relatório de Resultados dos 90 Dias)", "p2_desc": "Métricas e resultados consolidados - conectados aos OKRs definidos no kickoff."
    }
  }
}

CRITICAL_RULE_ARRAYS: OBRIGATORIO retornar EXATAMENTE 3 itens em roadmap_phases (Ciclo 01, Ciclo 02, Ciclo 03), EXATAMENTE 3 itens em okrs (um por trimestre), EXATAMENTE 4 itens em pillars (Contexto, Tech Stack, Alvos, Compromissos), EXATAMENTE 3 itens em thesis_pillars (os 3 pilares da tese de solucao), pelo menos 2 itens em methodology_steps, EXATAMENTE 5 itens em current_vs_future.current e current_vs_future.future, e EXATAMENTE 6 itens em quick_wins. Arrays com apenas 1 item serao considerados invalidos.
CRITICAL_RULE_QUICK_WINS_OWNER: Cada quick_win DEVE ter o campo "owner" com um destes valores: "revhackers" (acao executada pela equipe RevHackers), "cliente" (acao que depende do cliente fornecer acesso, dados ou aprovacao), ou "ambos" (acao colaborativa). Distribua de forma realista: acoes tecnicas e de configuracao sao "revhackers", acoes de acesso e aprovacao sao "cliente", reunioes e reviews sao "ambos".
CRITICAL_RULE_EXECUTIVE_SUMMARY: O executive_summary DEVE ser ultra-cirúrgico - cada campo em 1-2 frases curtas e impactantes. O thesis_statement DEVE ser uma frase persuasiva e personalizada para ESTE cliente - NUNCA use a tese genérica. O quick_wins DEVE ter ações concretas dos primeiros 7 dias - o que acontece LITERALMENTE no Day 1, Day 2, etc. O current_vs_future DEVE contrastar o estado real atual (problemas) com o estado futuro (após a implementação) usando linguagem específica do diagnóstico.

CRITICAL_RULE_ONBOARDING: VOCÊ DEVE PREENCHER COMPLETAMENTE O onboarding_data substituindo as reticências (...) por frases autoritárias, técnicas e 100% voltadas à realidade do diagnóstico do cliente. Se ele falou sobre funis ruins no ActiveCampaign, preencha o p1_title de "setup" ou "training" falando diretamente sobre o ActiveCampaign. Seja extremamente cirúrgico e agressivo na entrega de valor. Nunca retorne genéricos do tipo "Construir funis de e-mail". Retorne "Mapeamento dos fluxos automáticos de abandono no ActiveCampaign citados na reunião".

CRITICAL_RULE_PORTUGUESE: TODO o conteúdo gerado DEVE ser 100% em PORTUGUÊS BRASILEIRO. PROIBIDO usar termos em inglês como "Blueprint", "Hand-off", "Go-Live", "Data Hygiene", "Pipeline Review", "Win Rate", "Speed to Lead", "Handover", "As-Is", "To-Be", "SOP", "Go-To-Market", "Break-Even", "Forecast", "Data-Driven", "Weekly Review". Use SEMPRE os equivalentes em português: "Projeto Técnico", "Passagem de Bastão", "Entrada em Produção", "Higiene de Dados", "Revisão de Pipeline", "Taxa de Conversão", "Velocidade de Resposta", "Processo Atual", "Processo Ideal", "Manual Operacional", "Estratégia de Entrada no Mercado", "Ponto de Equilíbrio", "Previsão de Receita", "Orientado por Dados", "Revisão Semanal". Acrônimos técnicos universais como CRM, SQL, MQL, ROAS, CAC, LTV, KPI, OKR, ICP, UTM são permitidos.
CRITICAL_RULE_BANNED_WORDS: É EXPRESSAMENTE PROIBIDO gerar e utilizar a palavra ou expressão "frustrante_repetitivo", "frustrante" ou "repetitivo" em QUALQUER lugar do JSON gerado, especialmente nos textos descritivos. Use termos profissionais e analíticos como "transição manual", "fricção operacional" ou "ineficiência no fluxo".
CRITICAL_RULE_SIGNALS_LANGUAGE: Nos arrays 'signals', 'risks' e 'decisions', os campos de texto descritivo DEVEM ser escritos em linguagem natural, fluída e humana estruturando uma frase completa (ex: "A cadência de emails está caótica e aumentando o ghosting"). É EXPRESSAMENTE PROIBIDO retornar nomes de variáveis em snake_case ou chaves de sistema vazadas do contexto (ex: PROIBIDO retornar "revops_flow_cadencia = caotico"). Traduza o dado técnico para o problema real na linguagem de negócios do cliente.
CRITICAL_RULE_TECH_STACK_OVERRIDE: Se o cliente relatou utilizar um CRM legado (ex: Agendor, Pipedrive, RD Station), o Tech Stack Visado DEVE obrigatoriamente tratar a ferramenta antiga como um sistema que SERÁ TOTALMENTE SUBSTITUÍDO pelo Funnels. NUNCA sugira que o Funnels irá integrar com o CRM atual ou atuar em paralelo. O Funnels assumirá a "camada central de operação de receita", substituindo a estrutura legada.
CRITICAL_RULE_CONSULTATIVE_PROJECT: Se a duração do projeto for de 30 dias ("30_days" ou "30 dias"), o projeto possui caráter ABSOLUTAMENTE CONSULTIVO e ORIENTATIVO. A RevHackers NÃO executa configurações técnicas (hands-on) nesses projetos. Você DEVE usar verbos e ações de mentoria, orientação, desenho de processo, auditoria e direcionamento. NUNCA use "nós vamos configurar no Funnels" ou "nós vamos implantar", e SEMPRE use "Orientar a configuração", "Desenhar a arquitetura para o cliente implantar", "Auditar o processo" ou "Acompanhar a adoção".
CRITICAL_RULE_TRADE_NAME: SE O \`tradeName\` FOI FORNECIDO (${tradeName}), VOCÊ DEVE USÁ-LO EM ESTRITAMENTE TODAS AS REFERÊNCIAS VISUAIS AO CLIENTE E NUNCA A RAZÃO SOCIAL LITERAL. O TRADE NAME É A MARCA FANTASIA. NOME FORNECIDO: ${tradeName || 'N/A'}.

- O JSON de saida deve validar SEM ERROS contra o schema esperado.
- Remova markdown, \`\`\`json, e chaves invisíveis - retorne texto puramente serializável.
- Use tom executivo direto, cortando gordura e fluff.
- SEJA EXATO SOBRE SISTEMAS (ex: Onde diz "Integracao de entrada", escreva "Integracao RD Station -> Funnels").
`;
    const response = await withAutoRetry(() => fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          { role: 'system', content: 'Você é o Diretor Estratégico da RevHackers. Gere análises baseadas puramente nos dados reais do cliente. Não alucine e siga rigidamente a estrutura do Schema JSON solicitado.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        reasoning_effort: 'high'
      })
    }));

    if (!response.ok) {
        const err = await response.text();
        console.error('[generate-strategic-plan] OpenAI API Error:', err);
        throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Recieved empty response from OpenAI');
    }

    let planData;
    try {
      planData = JSON.parse(content);
    } catch (e) {
      console.error('[generate-strategic-plan] Parse error on raw output:', content);
      throw new Error('Failed to parse JSON out of AI response');
    }

    // --- DEFENSIVE VALIDATION / FALLBACKS ---
    // Previne alucinacoes ou omissoes estruturais da IA que quebram o frontend 
    const enforceValidStructure = (data: any) => {
      const safe = { ...data };

      // 1. Executive Summary Fallback
      if (!safe.executive_summary || typeof safe.executive_summary !== 'object') {
         safe.executive_summary = {
           context: "Contexto operacional omitido pela Inteligência Artificial.",
           problem: "Gargalo central não detalhado durante a inferência.",
           solution: "Implementação da metodologia RevHackers padrão para estabilidade.",
           expected_outcome: "Estruturação de dados centralizada e cadência operacional garantida."
         };
      } else {
         safe.executive_summary.context = safe.executive_summary.context || "Contexto não detalhado.";
         safe.executive_summary.problem = safe.executive_summary.problem || "Problema não detalhado.";
         safe.executive_summary.solution = safe.executive_summary.solution || "Solução não detalhada.";
         safe.executive_summary.expected_outcome = safe.executive_summary.expected_outcome || "Resultado esperado não detalhado.";
      }

      // 2. Quick Wins Fallback
      if (!Array.isArray(safe.quick_wins) || safe.quick_wins.length === 0) {
         safe.quick_wins = [
           { day: "Dia 1", action: "Revisão do diagnóstico As-Is e processos", outcome: "Alinhamento concluído", owner: "ambos" },
           { day: "Dia 2", action: "Configuração base e higienização", outcome: "Ambiente pronto para uso inicial", owner: "revhackers" },
           { day: "Dia 3", action: "Fornecimento de acessos corporativos (Ads, CRM, Banco de Dados)", outcome: "Credenciais liberadas para operação", owner: "cliente" },
           { day: "Dia 4-5", action: "Implementação de propriedades operacionais", outcome: "Estruturas processuais no lugar", owner: "revhackers" },
           { day: "Dia 6", action: "Automação e auditoria sistêmica", outcome: "Relatório de conformidade verificado", owner: "revhackers" },
           { day: "Dia 7", action: "Rito de fechamento e go-live inicial", outcome: "Fundação sólida atestada", owner: "ambos" }
         ];
      } else {
         // Force correct keys if AI hallucinated alternative property names
         safe.quick_wins = safe.quick_wins.map((qw: any, i: number) => ({
             day: qw.day || qw.dia || "Dia " + (i + 1).toString(),
             action: qw.action || qw.acao || qw.titulo || qw.title || "Ação a definir",
             outcome: qw.outcome || qw.resultado || qw.impacto || qw.impact || "Entregável a definir",
             owner: qw.owner || qw.dono || qw.responsavel || "ambos"
         }));
      }

      // 3. Arrays Fallback
      if (!Array.isArray(safe.okrs)) safe.okrs = [];
      if (!Array.isArray(safe.roadmap_phases)) safe.roadmap_phases = [];
      if (!Array.isArray(safe.pillars)) safe.pillars = [];
      if (!Array.isArray(safe.thesis_pillars)) safe.thesis_pillars = [];
      if (!Array.isArray(safe.methodology_steps)) safe.methodology_steps = [];
      if (!Array.isArray(safe.decisions)) safe.decisions = [];
      if (!Array.isArray(safe.signals)) safe.signals = [];
      if (!Array.isArray(safe.risks)) safe.risks = [];
      if (!Array.isArray(safe.current_vs_future?.current)) {
          safe.current_vs_future = { current: ["Sintomas pendentes de mapeamento"], future: ["Meta operacional de longo prazo"] };
      }
      
      return safe;
    };
    
    planData = enforceValidStructure(planData);

    // Post-processamento: garantir que nenhum em dash (-) ou en dash (–) sobreviveu.
    // Regra absoluta do projeto (CLAUDE.md) - substitui por hifen simples.
    const purgeEmDashes = (node: any): any => {
      if (typeof node === 'string') return node.replace(/\u2014/g, '-').replace(/\u2013/g, '-');
      if (Array.isArray(node)) return node.map(purgeEmDashes);
      if (node !== null && typeof node === 'object') {
        const out: any = {};
        for (const [k, v] of Object.entries(node)) out[k] = purgeEmDashes(v);
        return out;
      }
      return node;
    };
    planData = purgeEmDashes(planData);

    if (jobId) {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { error: dbError } = await supabaseClient
          .from('ai_generation_jobs')
          .update({
             status: 'completed',
             result_data: planData,
             completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
        if (dbError) console.error('[generate-strategic-plan] Error updating job success state:', dbError);
      }
    }

    return new Response(JSON.stringify({ result: planData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[generate-strategic-plan] Caught Error:', error.message);
    
    if (jobId) {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabaseClient
          .from('ai_generation_jobs')
          .update({
             status: 'failed',
             error_log: error.message,
             completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
      }
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
