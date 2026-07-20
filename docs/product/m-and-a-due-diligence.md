# Due diligence — possível operação com The Growth Hub

Documento vivo. Criado em 2026-07-20, atualizado em 2026-07-20 (mesma data,
segunda rodada, após acesso autorizado ao produto). **Nenhum valuation,
receita, contrato, equipe, margem ou tecnologia privada foi mencionado por
ninguém até este ponto — nada disso aparece neste documento porque não foi
fornecido, não porque foi omitido.**

## Distinção crítica de escopo (confirmada por Giulliano em 2026-07-20)

- **`GrowthAG/revhackers-growth-hub`** (repositório GitHub mencionado
  inicialmente) é um **repositório interno/histórico do próprio ecossistema
  RevHackers**. Ele **não deve ser tratado como evidência de arquitetura ou
  propriedade do alvo de M&A** e não é usado neste documento para nenhuma
  finalidade de diligência.
- **O alvo real da diligência é o produto The Growth Hub**, acessado em
  `https://thegrowthhub.com.br`. Toda evidência técnica/de produto deste
  documento vem exclusivamente desse domínio.

## Classificação usada em todo o documento

Cada afirmação abaixo é marcada com uma das cinco categorias pedidas:

1. **[PÚBLICO]** — observado na interface pública de `thegrowthhub.com.br`,
   sem login.
2. **[DASHBOARD]** — observado no dashboard autenticado, sessão já logada
   como "Giulliano Alves" ao acessar `thegrowthhub.com.br/dashboard`
   (login pré-existente, não contornado nem criado por mim).
3. **[FORNECIDO]** — informação dada verbalmente por Giulliano nesta
   conversa, não observada por mim em nenhum material.
4. **[HIPÓTESE]** — inferência razoável, não verificada diretamente.
5. **[CONFIRMAR COM PARCEIROS]** — pergunta ou lacuna que só quem está
   conduzindo a operação (ou a contraparte, via data room) pode responder.

---

## 1. Contexto da possível operação

**[FORNECIDO]** Existe uma operação real em andamento envolvendo o The
Growth Hub. A fase é preliminar de diligência de produto e tecnologia.
Ainda não há data room completo, termos financeiros ou contratos.

**[CONFIRMAR COM PARCEIROS]** Formato da operação (aquisição, fusão,
parceria, licenciamento, aquihire); estágio formal de conversas (NDA? LOI?
exclusividade?); quem representa o The Growth Hub; prazo, se houver.

---

## 2. Materiais analisados

| Material | Status |
|---|---|
| `https://thegrowthhub.com.br` (site público) | **Acessado em 2026-07-20** — ver seção 3 |
| `https://thegrowthhub.com.br/dashboard` (autenticado) | **Acessado em 2026-07-20** — sessão já estava logada como "Giulliano Alves"; ver seção 3 |
| `GrowthAG/revhackers-growth-hub` (GitHub) | **Não usado** — confirmado por Giulliano como repositório interno RevHackers, fora do escopo desta diligência |
| Data room formal do The Growth Hub | Não existe ainda, ou não foi compartilhado |

**Nota sobre a sessão autenticada:** a conta logada no dashboard já
pertence a Giulliano/RevHackers (não foi criada nem contornada por mim) —
ou seja, já existe algum tipo de relação de uso/acesso prévio ao produto,
não é um acesso concedido especificamente para esta diligência. Isso é
relevante para a seção 12 (esclarecer a natureza dessa relação prévia).

**Limite respeitado:** análise restrita ao que estava visível na interface,
sem inspecionar rede/backend/código-fonte deles, sem clicar em nenhum botão
de ação que pudesse gerar custo ou alterar dados do lado deles (ex.: não
cliquei em "Regenerar" nem em botões de geração de novo framework). Havia
uma geração de IA em andamento na conta ("Gerando 25 de 37: ICE Score
Framework") durante o acesso — não interagi com esse processo.

---

## 3. Funcionalidades observadas

### [PÚBLICO] — site institucional (`thegrowthhub.com.br`)

- Posicionamento: "Crescimento como infraestrutura" / tagline "Growth
  infrastructure as a subscription".
- Descrição do produto: "Capacidades especializadas modulares, organizadas
  por assinatura e orquestradas por método e uma camada de inteligência
  artificial."
- Quatro componentes citados na home: **GrowthMap™** ("Direção
  estratégica"), **SquadMatch™** ("Capacidade modular"), **Execution Loop**
  ("Execução contínua"), **Aprendizado acumulado** ("Memória que fica no
  sistema").
- Seção "O problema" com messaging de posicionamento: "Projetos acabam.
  Infraestruturas operam." — argumento central é continuidade vs. reinício
  a cada trimestre, dependência de pessoas, contexto perdido.
- Seção de stack/integrações declaradas (categoria "Dados & Analytics"):
  Google Analytics 4, Looker Studio, Google Tag Manager, Microsoft Power
  BI, Tableau, Mixpanel, Amplitude, Hotjar, Microsoft Clarity, Metabase,
  Databox, Supermetrics, BigQuery, Segment, FullStory — apresentadas como
  "stack adaptável" (integrações declaradas no marketing, não confirma uso
  técnico real).

### [DASHBOARD] — produto autenticado

Estrutura de navegação observada (menu lateral):

- **GrowthMap** (item raiz)
  - Catálogo de Frameworks
  - Sua empresa
  - Inteligência Estratégica (submenu)
  - Concepção de Valor (submenu)
  - MVP e Validação Ágil (submenu)
  - Escalabilidade (submenu)
- **SquadMatch** (item raiz separado)
- **ExecutionLoop** (item raiz separado)

**Catálogo de Frameworks — confirmado "35 frameworks estratégicos
organizados pelos 4 pilares do GrowthMap"**, com os nomes exatos observados:

- **Inteligência Estratégica (9):** Industry Insights, TAM/SAM/SOM, Análise
  PESTEL, Análise SWOT, Cinco Forças de Porter, Benchmarking VRIO, Análise
  VRIO Interna, Blue Ocean Strategy, Ansoff Matrix.
- **Concepção de Valor (7, contagem parcial visível):** Jobs To Be Done,
  Mapa de Empatia, Customer Journey Map, Value Proposition Canvas, Proposta
  Única de Valor, Design Thinking Canvas, Game Changing Idea.
- **MVP e Validação Ágil (6):** Caminho para MVP, Lean Canvas, Minimum
  Viable Product, [3 itens adicionais visíveis parcialmente na captura, não
  lidos por completo — rolagem interrompida].
- **Escalabilidade (10):** Funil Pirata (AARRR), Go-to-Market Strategy,
  Marketing e Branding, Growth Loops, Programa de Parceiros, Game Changing
  Scaling, Horizon 1-2-3 (McKinsey), Performance Metrics, Estratégia
  Financeira, North Star Metric.

**Tela "Sua empresa" (Industry Insights)** — mostra, para o perfil de
empresa ativo na conta ("Funnels | CRM Brasileiro All-in-One", **não é o
The Growth Hub nem a RevHackers** — é um terceiro perfil analisado dentro
da conta), cartões de "Vetores de Crescimento" e "Desafios do Setor" em
texto corrido gerado, mais uma seção "TAM / SAM / SOM" com um botão
"Regenerar" (não clicado) — confirma que cada bloco de framework é
gerado (e regenerável) individualmente, não é texto estático.

**Cada perfil de empresa** tem um cabeçalho fixo mostrando nome/descrição
curta e ações rápidas (duplicar, exportar, chat/anotação) — ícones de
cópia, download e um ícone de balão de fala observados no topo do painel.

---

## 4. Análise preliminar de produto

**[HIPÓTESE, com base direta nas evidências da seção 3]:**

- O produto é estruturado como um **gerador de relatório estratégico
  multi-framework por empresa/cliente**, não uma ferramenta de análise
  contínua de dados ao vivo — o padrão observado (geração assíncrona,
  botão "Regenerar" por bloco) sugere que cada seção é uma chamada de IA
  independente sobre o perfil da empresa, arquitetura conceitualmente
  parecida com o `DiagnosticService.ts`/`enrich-strategic-data` que já
  existe no RevHackers (confirmado, código próprio), mas **com catálogo de
  frameworks muito mais amplo e explicitamente estruturado (35 nomeados,
  navegáveis, com contagem por pilar) do que o SWOT-like solto que o
  RevHackers tem hoje.**
- Múltiplos perfis de "empresa" parecem coexistir na mesma conta (o
  cabeçalho tinha um seletor/dropdown ao lado do nome da empresa) — sugere
  suporte a múltiplos clientes/projetos por conta, não um relatório único.
- "SquadMatch" e "ExecutionLoop" aparecem como pilares de produto
  **separados** do GrowthMap (não estão dentro do catálogo de frameworks) —
  não consegui observar o conteúdo deles nesta rodada (não cliquei para não
  aumentar o escopo de interação com uma conta que tinha geração ativa em
  andamento). **Lacuna, não hipótese: conteúdo real de SquadMatch e
  ExecutionLoop precisa de uma segunda sessão de observação.**

**[CONFIRMAR COM PARCEIROS]** Posicionamento de preço real, plano usado
pela conta logada, se há tiers de produto, público-alvo declarado
formalmente (o site fala em geral "crescimento como infraestrutura", sem
segmento explícito visível na home).

---

## 5. Análise técnica observada

**Ainda lacuna quase total, por desenho — análise ficou limitada ao que é
visível na interface, sem inspecionar rede, backend ou código-fonte deles**
(fora do escopo autorizado desta diligência, que é só interface visível).

O único indício técnico indireto: a lista de "stack adaptável" na home
(seção 3, [PÚBLICO]) — são ferramentas com as quais o produto declara
integrar, não a stack de implementação do próprio The Growth Hub.

**[CONFIRMAR COM PARCEIROS]** Stack real de implementação, arquitetura de
dados/multi-tenancy, provedor de IA usado para gerar os frameworks, custo
por geração, volume de dados armazenado por cliente.

---

## 6. Sinergias possíveis com RevHackers

- **[HIPÓTESE, reforçada pela seção 3]:** a maior sinergia concreta que
  apareceu é o **catálogo de 35 frameworks nomeados e estruturados por
  pilar** — isso é diretamente comparável ao "núcleo de diagnóstico" que o
  RevHackers já tem, mas hoje sem essa estrutura fixa. Se a operação
  envolver acesso a esse catálogo/metodologia, resolveria de forma direta o
  gap que a Frente 3 do plano mestre já identificou (framework gerado por
  IA em texto livre, sem schema fixo).
- **[HIPÓTESE]** Se o público do The Growth Hub for parecido com o do
  RevHackers (o messaging fala em geral "empresas em crescimento", sem
  segmento explícito), há potencial de sobreposição de base — sinergia de
  cross-sell ou risco de canibalização, não dá para diferenciar sem dado de
  clientes real.
- **[CONFIRMAR COM PARCEIROS]** Qualquer sinergia de equipe, dados ou
  parcerias comerciais que só apareceria com acesso ao data room.

---

## 7. Riscos de integração

- **[HIPÓTESE]** Esforço de integração técnica depende inteiramente da
  stack real deles (lacuna, seção 5).
- **[FATO, contexto RevHackers]** RevHackers está em meio à própria
  migração (Supabase → GCP, não iniciada tecnicamente — confirmado em
  `docs/PLANO-MESTRE.md`). Rodar uma integração de produto adicional
  durante essa migração aumenta a superfície de risco simultânea — risco de
  sequenciamento, não de tecnologia específica do alvo.
- **[FATO, já vivido internamente]** Se o The Growth Hub também depende de
  LLMs para gerar os 35 frameworks (evidência indireta: botão "Regenerar"
  por bloco sugere geração via IA), herdar esse padrão sem visibilidade de
  custo por geração é exatamente o problema que a Frente 2 do plano mestre
  já documentou dentro do próprio RevHackers.

---

## 8. Riscos de propriedade intelectual

- **[CONFIRMAR COM PARCEIROS]** Patente, marca registrada, código
  proprietário sob licença restritiva, termos de uso que impeçam
  replicação/reuso pós-operação.
- **[FATO]** Esta diligência seguiu a regra de não copiar código
  proprietário nem reproduzir a marca — nenhuma captura de tela literal da
  interface deles foi anexada a este documento, os nomes de framework
  listados são nomenclatura de metodologia de negócio genérica (SWOT,
  PESTEL, TAM/SAM/SOM, etc. são domínio público), não texto proprietário
  copiado.
- **[CONFIRMAR COM PARCEIROS]** Quem detém a titularidade dos frameworks
  "próprios" deles (nomes como "GrowthMap™", "SquadMatch™" aparecem com
  símbolo de marca no site — indício de marca registrada ou pretendida,
  não confirmado como registro formal).

---

## 9. Riscos de segurança e dados

- **[CONFIRMAR COM PARCEIROS]** Política de dados, se processam PII de
  clientes finais, certificações, LGPD/DPO.
- **[FATO, contexto RevHackers]** RevHackers já tem histórico real de
  achados de segurança nesta mesma sessão/projeto (RLS aberta, credencial
  vazada — ver `docs/departments/security/`). Qualquer integração de dados
  de clientes do The Growth Hub precisaria do mesmo nível de escrutínio já
  aplicado internamente, antes de qualquer merge de base de dados.
- **[HIPÓTESE]** Se a operação envolver migração de dados de clientes do
  The Growth Hub para dentro do ambiente RevHackers, isso é evento de
  tratamento de dados pessoais que provavelmente exige base legal — pergunta
  jurídica, não técnica.

---

## 10. Perguntas para o data room

**Produto e mercado:**
1. Lista completa de funcionalidades (incluindo SquadMatch e ExecutionLoop,
   não observados em detalhe nesta rodada).
2. Número de clientes ativos, churn, NPS.
3. Preço e modelo de cobrança reais (o site não expõe isso publicamente).

**Tecnologia:**
4. Stack completa (linguagens, frameworks, banco, hospedagem).
5. Provedor(es) de IA usado(s) para gerar os 35 frameworks e custo por
   geração/regeneração.
6. Arquitetura de multi-tenancy e isolamento de dados entre clientes.
7. Cobertura de testes, maturidade de CI/CD.
8. Incidentes de segurança conhecidos.

**Propriedade intelectual e jurídico:**
9. Registro formal de marca para "GrowthMap™", "SquadMatch™" e demais
   nomes com símbolo de marca observados.
10. Contratos de licenciamento de terceiros.
11. Cláusulas de não-concorrência com fundadores/investidores.

**Financeiro (perguntas, nenhum valor assumido):**
12. Receita recorrente atual e histórico.
13. Estrutura de custos.
14. Dívidas, passivos, litígios.

**Equipe:**
15. Organograma, fundadores/decisores, retenção pós-operação esperada.

**Dados e privacidade:**
16. Retenção/exclusão de dados de clientes.
17. Base legal LGPD, DPO nomeado.

**Relação prévia (novo, desta rodada):**
18. Qual é a natureza da conta já existente de Giulliano/RevHackers no The
    Growth Hub (teste, cliente pagante, parceria informal)? Isso muda o
    contexto de "quem está diligenciando quem".

---

## 11. Informações ainda não disponíveis

- Qualquer dado financeiro real.
- Registro formal de propriedade intelectual (confirmação de marca/patente).
- Stack técnica real de implementação.
- Base de clientes e métricas reais de produto.
- Conteúdo detalhado de SquadMatch e ExecutionLoop.
- Natureza formal da relação prévia entre a conta de Giulliano e o The
  Growth Hub.
- Estágio formal da negociação (NDA/LOI/exclusividade).

---

## 12. Próximos passos da diligência

1. **Esclarecer com Giulliano** a natureza da conta já autenticada no The
   Growth Hub (pergunta 18 da seção 10) — isso muda a moldura de toda a
   diligência.
2. Segunda sessão de observação autorizada: abrir "SquadMatch" e
   "ExecutionLoop" (não abertos nesta rodada) e completar a contagem de
   "MVP e Validação Ágil" (6 itens, só 3 confirmados por nome).
3. Levar as perguntas da seção 10 para quem estiver conduzindo as
   conversas com a contraparte.
4. Manter este documento vivo: cada achado real substitui a lacuna
   correspondente, sempre com a tag de categoria (`[PÚBLICO]`,
   `[DASHBOARD]`, `[FORNECIDO]`, `[HIPÓTESE]`, `[CONFIRMAR COM PARCEIROS]`).
