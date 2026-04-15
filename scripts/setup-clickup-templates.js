/**
 * setup-clickup-templates.js
 *
 * Cria no ClickUp as 4 pastas de template (uma por tipo de projeto),
 * cada uma com Sprint 1 estruturada (statuses + tarefas).
 *
 * Apos rodar: salve cada pasta como template na UI do ClickUp
 * e anote os template IDs para o clickup-provision.
 *
 * Uso: node scripts/setup-clickup-templates.js
 */

const API_KEY = 'pk_84197570_GYIBMGTI4Z9MCTUUVG6T8THHO6YJR0BB';
const SPACE_ID = '90175101115';
const BASE = 'https://api.clickup.com/api/v2';

// 650ms entre chamadas = ~92 req/min (limite do Unlimited: 100/min)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, path, body) {
  await sleep(700);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`[${method}] ${path} -> ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

// NOTA: Statuses customizados nao podem ser criados via API do ClickUp.
// Configure os 8 statuses diretamente no Space pela UI do ClickUp:
// Space > "..." > Edit Statuses > aplicar os 8 statuses > "Apply to all"
// Assim todas as listas novas herdam automaticamente.

// Prioridades ClickUp: 1=urgent 2=high 3=normal 4=low
const P = { urgent: 1, high: 2, normal: 3, low: 4 };

// ─── TEMPLATES ────────────────────────────────────────────────────────────
const TEMPLATES = {

  // ── CONSULTING 360 ──────────────────────────────────────────────────────
  consulting: {
    folderName: '[TEMPLATE] Consulting - 360 Graus',
    sprintName: 'Sprint 1: Diagnostico e Fundacao',
    tasks: [
      {
        name: '[META] Objetivo da Sprint 1',
        description: `## Meta da Sprint\nEntregar o Diagnostico 360 aprovado e a estrategia de crescimento validada pelo cliente.\n\n## Indicadores de sucesso\n- [ ] Diagnostico entregue e aprovado\n- [ ] Alavancas de crescimento priorizadas\n- [ ] Estrategia validada em call com cliente\n- [ ] Sprint 2 planejada`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[ACESSO] Solicitar acessos das plataformas',
        description: `## O que fazer\nColetar todos os acessos necessarios para o diagnostico.\n\n## Plataformas\n- [ ] Meta Ads (conta de anuncio + BM)\n- [ ] Google Ads\n- [ ] Google Analytics 4\n- [ ] Google Search Console\n- [ ] GoHighLevel (sub-conta)\n- [ ] Instagram / LinkedIn (se aplicavel)\n\n## Entregavel\nPlanilha de acessos preenchida e confirmada.`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[ACESSO] Instalar stack de tracking',
        description: `## O que fazer\nGarantir que o tracking esta correto antes de qualquer analise.\n\n## Checklist\n- [ ] GTM instalado e publicado\n- [ ] GA4 com eventos customizados (scroll, CTA click, form submit)\n- [ ] Meta Pixel + Conversions API\n- [ ] Microsoft Clarity (heatmap)\n- [ ] Testar eventos no DebugView do GA4\n\n## Entregavel\nPrint do GA4 Debug com eventos disparando corretamente.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[DIAGNOSTICO] Auditar campanhas pagas',
        description: `## O que fazer\nAnalisar performance dos ultimos 90 dias em todos os canais pagos.\n\n## O que analisar\n- [ ] CPL por canal e campanha\n- [ ] ROAS e CPA\n- [ ] Criativos: top 3 e bottom 3\n- [ ] Publicos: overlap, saturacao\n- [ ] Funil de conversao: topo -> fundo\n\n## Entregavel\nSecao de Pago no Relatorio de Diagnostico 360.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[DIAGNOSTICO] Auditar funil organico',
        description: `## O que fazer\nMapear performance SEO e conteudo.\n\n## O que analisar\n- [ ] Palavras-chave posicionadas (Search Console)\n- [ ] Paginas com mais trafego e maior bounce\n- [ ] Backlink profile\n- [ ] Core Web Vitals\n- [ ] Top 5 conteudos por trafego\n\n## Entregavel\nSecao de Organico no Relatorio de Diagnostico 360.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[DIAGNOSTICO] Auditar CRM e pipeline de vendas',
        description: `## O que fazer\nMapear eficiencia do processo comercial atual.\n\n## O que analisar\n- [ ] Taxa de conversao por etapa do pipeline\n- [ ] Tempo medio em cada etapa\n- [ ] Motivos de perda mais frequentes\n- [ ] Velocidade de primeiro contato (lead -> resposta)\n- [ ] Volume de leads por canal\n\n## Entregavel\nSecao de CRM no Relatorio de Diagnostico 360.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[DIAGNOSTICO] Benchmark de concorrentes',
        description: `## O que fazer\nAnalise de 3 concorrentes diretos.\n\n## Para cada concorrente\n- [ ] Posicionamento e proposta de valor\n- [ ] Canais de aquisicao ativos\n- [ ] Estimativa de trafego (SemRush/Similarweb)\n- [ ] Criativos e angulos de copy mais recentes\n- [ ] Presenca e engajamento nas redes\n\n## Entregavel\nTabela comparativa de benchmark.`,
        priority: P.normal,
        status: 'BACKLOG',
      },
      {
        name: '[DIAGNOSTICO] Entrega: Relatorio 360 - MILESTONE',
        description: `## Entregavel\nRelatorio completo com diagnostico de todos os pilares.\n\n## Estrutura do relatorio\n- [ ] Resumo executivo (1 pagina)\n- [ ] Diagnostico por pilar (Pago / Organico / CRM / Produto)\n- [ ] Benchmark de concorrentes\n- [ ] Top 3 alavancas de crescimento priorizadas\n- [ ] Proximo passo recomendado\n\n## Aprovacao\n- [ ] Review interno\n- [ ] Apresentacao ao cliente\n- [ ] Aprovacao formal pelo cliente`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[ESTRATEGIA] Definir ICP e segmentacao primaria',
        description: `## O que fazer\nDocumentar quem exatamente queremos atrair.\n\n## Entregavel: Documento de ICP com\n- [ ] Perfil demografico (cargo, empresa, setor, porte)\n- [ ] Dores principais (3 a 5)\n- [ ] Objecoes mais frequentes\n- [ ] Canais onde este ICP vive\n- [ ] Vocabulario: como ele descreve o proprio problema`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[ESTRATEGIA] Priorizar alavancas e aprovar com cliente - CHECKPOINT',
        description: `## O que fazer\nCall de alinhamento estrategico com o cliente.\n\n## Agenda da call\n- [ ] Apresentar diagnostico (20 min)\n- [ ] Apresentar as 3 alavancas priorizadas\n- [ ] Validar budget e recursos disponiveis\n- [ ] Definir KRs para os proximos 90 dias\n- [ ] Aprovar inicio da execucao\n\n## Entregavel\nAta da call + estrategia aprovada assinada.`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[RECORRENTE] Check-in semanal com cliente',
        description: `## Recorrente: toda semana\n\n- [ ] Enviar pauta com 24h de antecedencia\n- [ ] Atualizar dashboard antes da call\n- [ ] Registrar decisoes e proximos passos\n- [ ] Atualizar tarefas no ClickUp apos call`,
        priority: P.normal,
        status: 'BACKLOG',
      },
      {
        name: '[REVIEW] Sprint Review - Fechamento da Sprint 1',
        description: `## O que revisar\n- [ ] Comparar entregas vs meta da sprint\n- [ ] Levantar impedimentos que ocorreram\n- [ ] Calcular velocidade da sprint\n- [ ] Documentar aprendizados\n- [ ] Planejar Sprint 2 com base nos aprendizados\n\n## Metricas a registrar\n- Tarefas concluidas / total\n- Tempo medio de ciclo\n- Satisfacao do cliente (1-10)`,
        priority: P.high,
        status: 'BACKLOG',
      },
    ],
  },

  // ── CRM OPS ─────────────────────────────────────────────────────────────
  crm_ops: {
    folderName: '[TEMPLATE] RevOps e CRM',
    sprintName: 'Sprint 1: Arquitetura e Setup',
    tasks: [
      {
        name: '[META] Objetivo da Sprint 1',
        description: `## Meta da Sprint\nGHL estruturado, pipeline configurado e fluxo principal de leads funcionando ponta a ponta.\n\n## Indicadores de sucesso\n- [ ] Pipeline criado e validado\n- [ ] Primeiro lead passando pelo fluxo automatizado\n- [ ] Time treinado no basico do sistema\n- [ ] Sprint 2 planejada`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[SETUP] Criar e configurar sub-conta GHL',
        description: `## O que fazer\nConfigurar a Location do cliente no GoHighLevel.\n\n## Checklist\n- [ ] Criar Location com nome e dados do cliente\n- [ ] Configurar fuso horario e moeda\n- [ ] Adicionar logo e identidade visual\n- [ ] Configurar email e SMTP\n- [ ] Configurar numero de WhatsApp\n- [ ] Adicionar usuarios do time com permissoes corretas`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[SETUP] Criar pipelines e etapas do funil',
        description: `## O que fazer\nEstruturar os pipelines conforme fluxo comercial do cliente.\n\n## Para cada pipeline\n- [ ] Definir nome e objetivo\n- [ ] Criar etapas (stages) em ordem logica\n- [ ] Configurar probabilidades por etapa\n- [ ] Mapear responsavel por etapa\n\n## Pipelines minimos\n- [ ] Pipeline Comercial (lead -> fechamento)\n- [ ] Pipeline de Onboarding (fechamento -> entrega)\n- [ ] Pipeline Pos-Venda (se aplicavel)`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[SETUP] Configurar Custom Fields por etapa',
        description: `## O que fazer\nCriar campos customizados para capturar dados relevantes em cada etapa.\n\n## Checklist\n- [ ] Mapear quais dados precisam ser coletados por etapa\n- [ ] Criar campos no GHL (texto, dropdown, data, numero)\n- [ ] Configurar campos obrigatorios por etapa\n- [ ] Testar preenchimento com contato ficticio`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[AUTOMACAO] Fluxo: lead capturado - primeiro contato',
        description: `## Objetivo\nGarantir primeiro contato em menos de 5 minutos apos o lead entrar.\n\n## Fluxo\n- [ ] Trigger: formulario preenchido / lead criado\n- [ ] Acao: enviar WhatsApp de boas-vindas (template aprovado)\n- [ ] Acao: criar task de follow-up para o SDR\n- [ ] Acao: notificar responsavel via email/app\n- [ ] Testar fluxo com lead real ou ficticio`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[AUTOMACAO] Fluxo: no-show e reagendamento',
        description: `## Objetivo\nRecuperar automaticamente leads que nao aparecem na reuniao.\n\n## Fluxo\n- [ ] Trigger: reuniao marcada nao confirmada (24h antes)\n- [ ] Acao: lembrete automatico (WhatsApp + email)\n- [ ] Trigger: no-show confirmado\n- [ ] Acao: mensagem de reagendamento em 1h\n- [ ] Acao: segunda tentativa em 24h\n- [ ] Acao: mover para etapa "Reengajamento" se sem resposta em 48h`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[INTEGRACAO] Conectar WhatsApp Business',
        description: `## O que fazer\nIntegrar o numero de WhatsApp do cliente ao GHL.\n\n## Opcoes\n- [ ] Opção A: WhatsApp API oficial (Meta) - requer aprovacao\n- [ ] Opcao B: Twilio bridge\n- [ ] Opcao C: Integracoes nativas do GHL\n\n## Checklist\n- [ ] Definir numero (novo ou existente)\n- [ ] Configurar no GHL\n- [ ] Testar envio e recebimento\n- [ ] Configurar templates de mensagem aprovados pela Meta`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[INTEGRACAO] Conectar formularios ao GHL',
        description: `## O que fazer\nGarantir que todos os pontos de entrada de leads chegam ao GHL.\n\n## Checklist\n- [ ] Mapear todos os formularios ativos (site, LP, redes)\n- [ ] Configurar webhook ou integracao nativa para cada\n- [ ] Testar fluxo completo: formulario -> GHL -> notificacao\n- [ ] Confirmar que dados chegam nos campos corretos`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[TESTE] Teste end-to-end com lead ficticio - MILESTONE',
        description: `## O que fazer\nValidar que toda a arquitetura funciona ponta a ponta.\n\n## Roteiro de teste\n- [ ] Preencher formulario como lead ficticio\n- [ ] Confirmar chegada no GHL (< 30 seg)\n- [ ] Confirmar disparo do WhatsApp automatico (< 5 min)\n- [ ] Avancar manualmente pelas etapas do pipeline\n- [ ] Confirmar automacoes ativas em cada etapa\n- [ ] Confirmar notificacoes chegando ao time\n\n## Aprovacao\n- [ ] Aprovado internamente\n- [ ] Demonstrado ao cliente`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[TREINAMENTO] Treinar time no uso do pipeline',
        description: `## O que fazer\nCapacitar o time comercial para usar o GHL no dia a dia.\n\n## Agenda\n- [ ] Navegar pelo pipeline e etapas (15 min)\n- [ ] Registrar interacoes e notas (10 min)\n- [ ] Agendar reunioes pelo calendario do GHL (10 min)\n- [ ] Usar as automacoes corretamente (15 min)\n- [ ] Sessao de duvidas (10 min)\n\n## Entregavel\nSOP de uso documentado + gravacao da sessao`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[RECORRENTE] Check-in semanal com cliente',
        description: `## Recorrente: toda semana\n\n- [ ] Revisar leads na semana (volume, origem, conversao)\n- [ ] Identificar etapas com maior queda\n- [ ] Ajustar automacoes se necessario\n- [ ] Registrar decisoes no ClickUp`,
        priority: P.normal,
        status: 'BACKLOG',
      },
      {
        name: '[REVIEW] Sprint Review - Fechamento da Sprint 1',
        description: `## O que revisar\n- [ ] Pipeline configurado conforme acordado?\n- [ ] Fluxos automatizados testados e aprovados?\n- [ ] Time treinado?\n- [ ] Primeiros leads reais passando pelo fluxo?\n\n## Metricas\n- Tempo medio de primeiro contato\n- Taxa de resposta dos leads\n- Numero de automacoes ativas`,
        priority: P.high,
        status: 'BACKLOG',
      },
    ],
  },

  // ── DEV / LANDING PAGE ──────────────────────────────────────────────────
  dev: {
    folderName: '[TEMPLATE] Dev - Sites e Landing Pages',
    sprintName: 'Sprint 1: Discovery e Design',
    tasks: [
      {
        name: '[META] Objetivo da Sprint 1',
        description: `## Meta da Sprint\nDesign aprovado, copy aprovada e ambiente de desenvolvimento pronto.\n\n## Indicadores de sucesso\n- [ ] Wireframe aprovado pelo cliente\n- [ ] Design high-fi aprovado\n- [ ] Copy de todas as secoes aprovada\n- [ ] Ambiente de dev configurado\n- [ ] Sprint 2 (desenvolvimento) pode comecar`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[DISCOVERY] Briefing completo do projeto',
        description: `## O que capturar\n- [ ] Objetivo principal da pagina (converter? gerar lead? vender?)\n- [ ] Publico-alvo: quem vai acessar, qual a dor principal\n- [ ] CTA principal e secundario\n- [ ] Tom de voz: formal, descontraido, tecnico\n- [ ] Restricoes: cores proibidas, palavras a evitar\n- [ ] Prazo e prioridades\n- [ ] Integracao necessaria (CRM, email, WhatsApp)\n\n## Entregavel\nDocumento de briefing assinado pelo cliente.`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[DISCOVERY] Benchmark: 5 referencias aprovadas',
        description: `## O que fazer\nColeta e aprovacao de referencias visuais.\n\n## Processo\n- [ ] Pesquisar 10 referencias (sites do segmento + fora do segmento)\n- [ ] Selecionar 5 finalistas com justificativa\n- [ ] Apresentar ao cliente\n- [ ] Registrar o que o cliente gosta e o que nao gosta\n\n## Entregavel\nMoodboard aprovado com anotacoes do cliente.`,
        priority: P.high,
        status: 'A FAZER',
      },
      {
        name: '[DISCOVERY] Arquitetura de informacao',
        description: `## O que fazer\nDefinir quais secoes existem e em qual ordem.\n\n## Checklist\n- [ ] Mapear jornada do usuario na pagina\n- [ ] Definir secoes: Hero, Problema, Solucao, Prova Social, CTA...\n- [ ] Definir hierarquia de informacao por secao\n- [ ] Definir elementos visuais por secao (video, imagem, icone, grafico)\n\n## Entregavel\nDocumento de arquitetura em texto ou tabela.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[COPY] Escrever e aprovar toda a copy - CHECKPOINT',
        description: `## O que escrever\nPara cada secao definida na arquitetura:\n- [ ] Headline principal (H1)\n- [ ] Subheadline de apoio\n- [ ] Corpo de texto\n- [ ] CTA (texto do botao)\n\n## Processo\n- [ ] Primeiro rascunho interno\n- [ ] Review de copy (clareza, FOMO, prova social)\n- [ ] Enviar para aprovacao do cliente\n- [ ] Incorporar ajustes\n\n## Entregavel\nCopy aprovada em documento compartilhado.`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[DESIGN] Wireframe low-fi',
        description: `## O que fazer\nPrototipo de estrutura sem visual (so layout e texto).\n\n## Ferramentas\nFigma, Whimsical ou Balsamiq.\n\n## Checklist\n- [ ] Versao desktop (1440px)\n- [ ] Versao mobile (375px)\n- [ ] Todas as secoes mapeadas na arquitetura\n- [ ] Indicacao de onde vao imagens, videos, icones\n\n## Aprovacao\n- [ ] Revisao interna\n- [ ] Aprovacao pelo cliente (call de 30 min)`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[DESIGN] Prototipo high-fi no Figma - MILESTONE',
        description: `## O que fazer\nDesign visual completo e fiel ao que sera desenvolvido.\n\n## Checklist\n- [ ] Desktop (1440px) - todas as secoes\n- [ ] Mobile (375px) - todas as secoes\n- [ ] Hover states e interacoes documentados\n- [ ] Componentes organizados (cores, tipografia, espacamentos)\n- [ ] Export de assets preparado\n\n## Aprovacao\n- [ ] Revisao interna\n- [ ] Call de aprovacao com cliente\n- [ ] Ajustes pos-feedback\n- [ ] Aprovacao final registrada`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[SETUP] Configurar ambiente de desenvolvimento',
        description: `## O que fazer\nPreparar o ambiente antes de comecar a codar.\n\n## Checklist\n- [ ] Definir stack (Vite/Next.js/Wordpress conforme escopo)\n- [ ] Criar repositorio no GitHub\n- [ ] Configurar deploy pipeline (Vercel/Netlify/Hostinger)\n- [ ] Configurar dominio de preview\n- [ ] Instalar dependencias base\n- [ ] Confirmar acesso do cliente ao repositorio`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[RECORRENTE] Check-in semanal com cliente',
        description: `## Recorrente: toda semana\n\n- [ ] Compartilhar progresso do design\n- [ ] Coletar feedback antecipado\n- [ ] Registrar ajustes no ClickUp\n- [ ] Confirmar prazos de aprovacao`,
        priority: P.normal,
        status: 'BACKLOG',
      },
      {
        name: '[REVIEW] Sprint Review - Fechamento da Sprint 1',
        description: `## Checklist\n- [ ] Design aprovado?\n- [ ] Copy aprovada?\n- [ ] Ambiente configurado?\n- [ ] Repositorio criado?\n- [ ] Sprint 2 planejada com tarefas de desenvolvimento?\n\n## Gate de entrada para Sprint 2\nSo iniciar o desenvolvimento com design 100% aprovado.`,
        priority: P.high,
        status: 'BACKLOG',
      },
    ],
  },

  // ── FOUNDER / LINKEDIN ──────────────────────────────────────────────────
  founder: {
    folderName: '[TEMPLATE] Founder - LinkedIn e Personal Brand',
    sprintName: 'Sprint 1: Posicionamento e Base Editorial',
    tasks: [
      {
        name: '[META] Objetivo da Sprint 1',
        description: `## Meta da Sprint\nPosicionamento definido, perfil LinkedIn otimizado e primeiros 12 posts publicados.\n\n## Indicadores de sucesso\n- [ ] Posicionamento aprovado pelo founder\n- [ ] Perfil LinkedIn com score alto\n- [ ] 12 posts publicados no mes\n- [ ] Banco de 30 pautas criado\n- [ ] Primeiras metricas de engajamento coletadas`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[MARCA] Workshop de posicionamento',
        description: `## O que fazer\nSessao de 60-90 minutos para definir o nucleo da marca pessoal.\n\n## Perguntas centrais\n- [ ] Qual e o seu grande resultado entregue (proof point)?\n- [ ] Para quem especificamente voce resolve problemas?\n- [ ] Qual o angulo unico: por que voce e diferente de outros do mesmo nicho?\n- [ ] Quem voce decididamente NAO e / NAO atende?\n- [ ] Qual o proximo nivel que voce quer ser associado?\n\n## Entregavel\nDocumento de Posicionamento aprovado (1 pagina).`,
        priority: P.urgent,
        status: 'A FAZER',
      },
      {
        name: '[MARCA] Definir ICP e tom de voz',
        description: `## ICP do founder\n- [ ] Cargo, setor e porte da empresa do seguidor ideal\n- [ ] Top 3 dores que ele tem e que o founder resolve\n- [ ] Vocabulario: como ele descreve o proprio problema\n- [ ] Onde ele busca conteudo (LinkedIn, podcasts, newsletters)\n\n## Tom de voz\n- [ ] 3 adjetivos que devem descrever o conteudo\n- [ ] 3 adjetivos que devem ser evitados\n- [ ] Exemplos de conteudo que o founder admira\n\n## Entregavel\nGuia de tom de voz (meia pagina).`,
        priority: P.high,
        status: 'A FAZER',
      },
      {
        name: '[MARCA] Otimizar perfil LinkedIn - MILESTONE',
        description: `## O que otimizar\n- [ ] Foto profissional (fundo limpo, olho na camera, sorriso real)\n- [ ] Banner: comunica proposta de valor em 3 segundos\n- [ ] Headline: quem voce ajuda + como + resultado\n- [ ] About: historia + credenciais + CTA no final\n- [ ] Featured: pin dos 3 melhores posts ou link para captacao\n- [ ] Experiencias: resultados numericos em todas as posicoes chave\n- [ ] Habilidades: alinhar com palavras-chave do nicho\n\n## Aprovacao\n- [ ] Review interno\n- [ ] Aprovacao do founder\n- [ ] Publicado`,
        priority: P.urgent,
        status: 'BACKLOG',
      },
      {
        name: '[CONTEUDO] Definir 5 pilares editoriais',
        description: `## O que fazer\nEscolher os 5 temas centrais que vao guiar todo o conteudo.\n\n## Criterios para um bom pilar\n- Conectado a dor do ICP\n- Conectado a expertise do founder\n- Permite variedade de formatos\n- Gera autoridade percebida\n\n## Formato de entrega\n| Pilar | Objetivo | Tipo de post ideal |\n|---|---|---|\n| Ex: Gestao | Mostrar lideranca | Listagem, opniao |\n\n## Entregavel\nTabela de pilares aprovada pelo founder.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[CONTEUDO] Criar banco de 50 hooks',
        description: `## O que fazer\n10 hooks por pilar editorial.\n\n## Formula de hook\n- Provoca curiosidade OU\n- Gera identificacao imediata OU\n- Faz uma promessa especifica\n\n## Exemplos\n- "O erro que me custou 200k que eu nunca mais vou cometer"\n- "Como eu fechei 3 clientes sem gastar 1 real em anuncio"\n- "Voce esta errando na contratacao e provavelmente nem sabe"\n\n## Entregavel\nBanco de hooks em documento aprovado pelo founder.`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[CONTEUDO] Mapear 30 pautas do mes',
        description: `## O que fazer\n30 pautas prontas para o mes inteiro (excesso intencional).\n\n## Distribuicao sugerida\n- 12 posts de texto (reflexao, opniao, lista)\n- 8 carrosseis (tutorial, passo a passo, comparativo)\n- 6 posts de historia pessoal (vulnerabilidade estrategica)\n- 4 posts de prova social (resultado de cliente, bastidores)\n\n## Entregavel\nCalendario editorial do mes aprovado.`,
        priority: P.normal,
        status: 'BACKLOG',
      },
      {
        name: '[PRODUCAO] Semana 1: escrever, aprovar e publicar 3 posts',
        description: `## Processo por post\n- [ ] Escrever rascunho (hook + corpo + CTA)\n- [ ] Review interno (clareza, gramatica, forca do hook)\n- [ ] Aprovar com founder (max 24h de prazo)\n- [ ] Publicar no horario de pico (7h-9h ou 18h-20h)\n- [ ] Registrar metricas em 24h`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[PRODUCAO] Semana 2: escrever, aprovar e publicar 3 posts',
        description: `## Processo por post\n- [ ] Escrever rascunho (hook + corpo + CTA)\n- [ ] Review interno\n- [ ] Aprovar com founder (max 24h)\n- [ ] Publicar\n- [ ] Registrar metricas em 24h\n\n## Analise da semana 1\n- [ ] Qual post teve mais impressoes?\n- [ ] Qual teve mais engajamento?\n- [ ] Ajustar pauta com base nos dados`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[PRODUCAO] Semana 3: escrever, aprovar e publicar 3 posts',
        description: `## Processo por post\n- [ ] Escrever rascunho\n- [ ] Review interno\n- [ ] Aprovar com founder (max 24h)\n- [ ] Publicar\n- [ ] Registrar metricas em 24h`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[PRODUCAO] Semana 4: escrever, aprovar e publicar 3 posts',
        description: `## Processo por post\n- [ ] Escrever rascunho\n- [ ] Review interno\n- [ ] Aprovar com founder (max 24h)\n- [ ] Publicar\n- [ ] Registrar metricas em 24h`,
        priority: P.high,
        status: 'BACKLOG',
      },
      {
        name: '[RECORRENTE] Check-in semanal com cliente',
        description: `## Recorrente: toda semana\n\n- [ ] Revisar metricas da semana (impressoes, engajamento, seguidores)\n- [ ] Avaliar posts aprovados para proxima semana\n- [ ] Coletar historias e bastidores para novos conteudos\n- [ ] Ajustar tom ou pilar se necessario`,
        priority: P.normal,
        status: 'BACKLOG',
      },
      {
        name: '[REVIEW] Sprint Review - Fechamento da Sprint 1',
        description: `## O que revisar\n- [ ] 12 posts publicados?\n- [ ] Engajamento medio por post\n- [ ] Crescimento de seguidores no mes\n- [ ] Leads ou mensagens geradas organicamente\n- [ ] Qual pilar performou melhor?\n- [ ] Ajustes para Sprint 2\n\n## Meta minima para Sprint 1\n- Engajamento medio > 2%\n- Pelo menos 1 lead organico gerado\n- Perfil visivelmente mais forte`,
        priority: P.high,
        status: 'BACKLOG',
      },
    ],
  },
};

// ─── EXECUCAO ─────────────────────────────────────────────────────────────
async function run() {
  const results = [];

  for (const [type, template] of Object.entries(TEMPLATES)) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`▶ Criando template: ${template.folderName}`);

    // 1. Criar Folder
    const folder = await api('POST', `/space/${SPACE_ID}/folder`, {
      name: template.folderName,
    });
    console.log(`  ✓ Folder criado: ${folder.id}`);

    // 2. Criar List (Sprint 1) — statuses herdados do Space
    const list = await api('POST', `/folder/${folder.id}/list`, {
      name: template.sprintName,
    });
    console.log(`  ✓ Sprint List criada: ${list.id}`);

    // 3. Criar tasks
    const taskIds = [];
    for (const task of template.tasks) {
      const created = await api('POST', `/list/${list.id}/task`, {
        name: task.name,
        description: task.description,
        priority: task.priority,
      });
      taskIds.push(created.id);
      process.stdout.write(`    + ${task.name.substring(0, 60)}\n`);
    }

    results.push({
      type,
      folderName: template.folderName,
      folderId: folder.id,
      sprintListId: list.id,
      taskCount: taskIds.length,
    });

    console.log(`  ✓ ${taskIds.length} tarefas criadas`);
  }

  // ─── Resumo final ───────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log('CONCLUIDO. Guarde estes IDs:\n');
  for (const r of results) {
    console.log(`[${r.type}]`);
    console.log(`  Folder:     ${r.folderId}  (${r.folderName})`);
    console.log(`  Sprint List: ${r.sprintListId}`);
    console.log(`  Tarefas:    ${r.taskCount}`);
    console.log();
  }

  console.log('PROXIMO PASSO:');
  console.log('  No ClickUp, abra cada pasta acima, clique nos "..."');
  console.log('  e selecione "Salvar como template".');
  console.log('  Copie os template IDs e me envie para configurar o clickup-provision.');
}

run().catch((err) => {
  console.error('\n✗ ERRO:', err.message);
  process.exit(1);
});
