# Mapeamento das 31 Supabase Edge Functions versionadas

## Escopo, método e legenda

Este inventário foi refeito sobre o estado atual do repositório. Há 32 diretórios em `supabase/functions`: `_shared` e 31 funções implantáveis. Fathom, InfinitePay e ClickUp foram retirados do código ativo; ocorrências remotas/históricas permanecem apenas para reconciliação. A classificação é estática; volume, duração, taxa de erro, callers externos e funções realmente implantadas não foram consultados em produção.

`supabase/config.toml` possui seção para 21 das 31 funções: 19 com `verify_jwt=true` e duas implantáveis com `false`. Onze funções não têm seção explícita e há uma seção órfã, `autentique-webhook`, sem diretório. “Gateway JWT” abaixo descreve o arquivo, não prova a configuração remota nem autorização de recurso/tenant.

### Componentes alvo

- **Service**: Cloud Run Service para HTTP síncrono, OAuth callback ou ingresso público de webhook.
- **Tasks**: Cloud Tasks entregando a worker HTTP privada em Cloud Run; adequado a trabalho unitário, retry controlado e idempotência.
- **Job**: Cloud Run Job para batch finito, sem endpoint público, com checkpoint/reexecução explícitos.
- **Scheduler**: Cloud Scheduler apenas dispara endpoint/job autenticado; não contém regra de negócio.
- **Pub/Sub**: evento durável/fan-out; consumidores continuam idempotentes porque entrega duplicada é possível.

Uma seta representa composição, não produto alternativo. Exemplo: `Service → Tasks` significa resposta rápida no ingresso e efeitos em worker privada. “Separar” indica que a Edge Function atual acumula responsabilidades que não devem permanecer num único deploy.

### Autenticação alvo

- **Usuário**: token OIDC do ambiente validado no backend, membership/tenant e policy de recurso.
- **Admin**: Usuário mais papel administrativo server-side e auditoria.
- **Workload**: identidade IAM com audience e invoker mínimos; nunca `service_role` compartilhada.
- **Webhook**: assinatura/segredo, timestamp/replay guard quando suportado e idempotency key.
- **Capability pública**: token opaco/slug de escopo mínimo, quando o requisito anônimo for aprovado.

### Ondas recomendadas

| Onda | Conteúdo | Gate de entrada |
|---|---|---|
| 1 | Proxies stateless e análise sem escrita crítica | API/auth base, SSRF/rate limits e contrato testado |
| 2 | IA interna, RAG e geração com estado | tenant/policies, job ledger, quota e custo por operação |
| 3 | Reuniões, cron e pipelines assíncronos | filas, idempotência, sandbox, dead-letter e reconciliação |
| 4 | GoHighLevel/OAuth e automações comerciais | credenciais por ambiente, sandbox, OAuth seguro e compensação |
| 5 | Pagamento e administração de identidade | Auth alvo, auditoria, zero divergência e rollback aprovado |

## Onda 1 — proxies e análise stateless

| Função | Semântica e dependências verificadas | Mapeamento alvo | Auth atual → alvo | Risco/gate |
|---|---|---|---|---|
| `analyze-diagnostic` | Analisa diagnóstico/founder via OpenAI; sem tabela detectada | **Service** | Gateway JWT → Usuário + rate limit | Médio: custo/PII em prompt; validar tamanho, modelo, timeout e contrato |
| `analyze-site` | Proxy para Google PageSpeed Insights | **Service** | Gateway JWT → Usuário; capability só se fluxo público for aprovado | Médio: URL controlada pelo caller e custo/quota; normalizar URL e bloquear destinos privados |
| `crux-benchmark` | Consulta Chrome UX Report para site e competidores | **Service** | JWT validado no código; seção ausente → Usuário | Médio: múltiplas URLs, quota e enumeração; SSRF não se aplica ao endpoint fixo, mas validar host de entrada |
| `fetch-cnpj` | Consulta BrasilAPI por CNPJ; sem escrita | **Service** | Gateway JWT → Usuário/capability aprovada | Baixo/médio: dado pessoal/empresarial, cache e rate limit |
| `generate-image` | Gera imagem via OpenAI; sem banco | **Service** inicialmente; **Tasks** se duração medida exceder limite síncrono | Sem seção e sem auth explícita → Usuário + quota | Alto de custo/abuso: bloquear uso anônimo, moderar prompt e limitar tamanho |
| `inspect-website` | Faz fetch de URL arbitrária, parseia HTML e chama OpenAI | **Service** | Gateway JWT, sem validação interna de JWT → Usuário | Alto: SSRF, resposta/tamanho remoto, prompt injection e egress; allowlist/resolução de IP e limites são gate |

## Onda 2 — IA, conteúdo e enriquecimento

| Função | Semântica e dependências verificadas | Mapeamento alvo | Auth atual → alvo | Risco/gate |
|---|---|---|---|---|
| `agent-chat` | Chat OpenAI com RAG em `agents`, `agent_documents`, `agent_libraries` e RPC `match_agent_knowledge` | **Service** | JWT validado no código → Usuário + ownership de agent/tenant | Alto: RAG cross-tenant, prompt injection, custo e logs; testes negativos por biblioteca/agente |
| `agent-documents` | CRUD de bibliotecas/documentos, crawl de URL e embeddings OpenAI | **Service** para CRUD/list; **Service → Tasks** para crawl/upload_chunks | Helper compartilhado, ownership parcial e admin em ações → Usuário/Admin; worker por Workload | Alto: crawl SSRF, acesso entre bibliotecas, batch parcial e vetores; separar ações e ledger |
| `auto-enrich-project` | Enriquecimento de oportunidade/projeto por BrasilAPI e PageSpeed; lê `clients`, escreve `enrichment_data` | **Service → Tasks** | JWT ou service key validado no código → Usuário com ownership; Workload interno | Alto: service-role bypass e IDOR; idempotência por recurso/versão e tenant obrigatório |
| `enrich-strategic-data` | Gera benchmark/personas/mercado via OpenAI; retorno síncrono | **Service** inicialmente; migrar para **Tasks** se duração/custo medidos exigirem | JWT validado no código → Usuário + quota/tenant | Médio/alto: saída não determinística, custo e payload de diagnóstico |
| `generate-playbook` | Lê `meeting_recordings`, `rei_responses`, `strategic_plans`; OpenAI retorna playbook | **Service → Tasks** | JWT validado no código → Usuário + autorização do projeto | Alto: acesso a transcrição/PII e job longo; resultado versionado e idempotente |
| `generate-project-tasks` | Gera sprints/tarefas com OpenAI e grava `orqflow_sprints`/`orqflow_tasks` | **Tasks** | JWT validado no código → Usuário autorizador no ingresso; Workload no worker | Alto: overwrite, duplicação e escrita em lote; idempotency key e transação/compensação |
| `generate-strategic-plan` | Geração extensa OpenAI/Anthropic, lê reunião, atualiza `ai_generation_jobs` | **Service → Tasks** | JWT validado no código → Usuário no ingresso; Workload no worker | Alto: job longo, fallback de modelo, custo e estado parcial; job ledger já sugerido pelo código |
| `generate-success-plan` | Gera critérios/riscos, lê/escreve planos, projetos, oportunidades e reuniões | **Tasks** | JWT ou service key validados no código → Usuário autorizador no ingresso; Workload no worker | Alto: múltiplos IDs de entrada, PII e estado parcial; idempotência por plano/versão |
| `market-intelligence` | OpenAI; pode atualizar `rei_projects` | **Service → Tasks** quando houver `projectId`; Service para preview sem escrita | JWT validado no código → Usuário + ownership de projeto | Alto: caller autenticado hoje não prova tenant; separar preview de persistência |
| `research-intelligence` | Pesquisa OpenAI por tipo; atualiza `ai_generation_jobs` | **Service → Tasks** | JWT validado no código → Usuário no ingresso; Workload no worker | Alto: retries/custo, alegações factuais e job state; fontes e erro precisam ser auditáveis |
| `scrape-profile` | Recebe dados extraídos do LinkedIn, usa OpenAI e atualiza `clients`/`rei_projects` | **Service → Tasks** | JWT validado no código → Usuário + ownership/consentimento | Alto: PII, termos do terceiro, mass assignment e vínculo por IDs; base legal é entrada não verificada |

## Onda 3 — reuniões e assíncrono

| Função | Semântica e dependências verificadas | Mapeamento alvo | Auth atual → alvo | Risco/gate |
|---|---|---|---|---|
| `analyze-meeting-transcript` | Lê/escreve `meeting_recordings` e chama OpenAI | **Tasks** | Sem seção e sem auth explícita → somente Workload; ingresso de usuário cria task após ownership | Crítico: hoje usa service role sem gate local; transcrição/PII, duplicação e estado parcial |
| `process-meeting-audio` | Recebe áudio/transcrição da extensão, usa Whisper/OpenAI, grava reunião/projeto e avança pipeline | **Service** de ingest para objeto temporário → **Tasks** worker | JWT validado no código → Usuário + projeto/tenant; Workload no worker | Crítico: upload/PII, matching heurístico de cliente, múltiplas escritas e avanço automático de pipeline |
| `transcribe-meeting` | Busca Google Meet/Drive, fallback Whisper, atualiza gravação e dispara análise | **Tasks**; **Job** somente para reprocessamento batch | Sem seção e sem auth explícita → somente Workload; usuário agenda após ownership | Crítico: tokens OAuth em tabela, arquivo grande, retry caro e chamada fire-and-forget |
| `trigger-post-rei-enrichment` | Orquestra três enriquecimentos e cria/atualiza plano/projeto | **Pub/Sub → Tasks** por etapa, com saga/ledger | Helper: service/admin; user por e-mail do projeto; seção ausente → Usuário por membership/tenant; Workload nos consumidores | Crítico: ownership por e-mail é fraco, partial failure e chamadas sequenciais |
| `google-meetings` | OAuth callback/auth URL, lista Calendar/Drive, torna gravações públicas e persiste `client_meetings` | **Service** admin para OAuth/list; **Scheduler → Job** para sync; Tasks para organização/compartilhamento | Sem seção e sem auth explícita → Admin + OAuth `state`; Workload no job | Crítico: callback atual exibe refresh token, fallback contém endpoint Supabase literal e sharing público; separar antes de portar |

## Onda 4 — GoHighLevel

| Função | Semântica e dependências verificadas | Mapeamento alvo | Auth atual → alvo | Risco/gate |
|---|---|---|---|---|
| `ghl-create-location` | Cria location GHL e grava `clients`/`organizations` | **Service → Tasks** | Helper exige admin/super_admin → Admin no ingresso; Workload no worker | Crítico: criação externa irreversível/cota; idempotência por client/location e compensação |
| `ghl-deploy-strategy` | Publica personas/OKRs como custom values no GHL | **Tasks** | Helper exige admin/super_admin → Admin inicia; Workload executa | Alto: várias mutações parciais, token por organização e ausência de confirmação por item |
| `ghl-inspect` | Lê pipelines/custom fields de duas locations | **Service** admin; retirar se caller/uso não for provado | Sem seção e sem auth explícita → Admin | Crítico enquanto exposto: revela IDs/estrutura e usa credencial privilegiada; uso real é gate |
| `ghl-oauth-callback` | Troca code por tokens e grava `organizations.settings`; pode devolver tokens ao frontend | **Service** | Helper exige admin/super_admin → Admin + OAuth `state`, redirect allowlist; tokens nunca retornam ao browser | Crítico: armazenamento/retorno de token e associação por location; Secret Manager/criptografia e rotação |
| `ghl-oauth-refresh` | Atualiza tokens de organizações, adequado a cron/manual | **Scheduler → Job**; endpoint admin separado só se necessário | Helper exige admin/super_admin/service → Workload; Admin para operação manual auditada | Crítico: rotação concorrente, rate limit e perda de refresh token; compare-and-set e recovery |
| `ghl-outbound-relay` | Encaminha eventos para hooks GHL por organização/segredo | **Service → Tasks** | Gateway JWT apenas → Usuário/capability validada no ingresso; Workload entrega | Alto: caller escolhe event/payload/org; allowlist já parcial, mas faltam tenant, ledger e retry durável |
| `ghl-webhook-handoff` | Webhook cria/avança oportunidades, converte projeto e dispara enriquecimentos | **Service → Pub/Sub → Tasks** | `verify_jwt=false`, segredo em header → Webhook com assinatura/replay guard; Workload nos efeitos | Crítico: fluxo comercial multi-etapa, idempotência parcial, chamadas encadeadas e risco cross-tenant |

## Onda 5 — pagamento e identidade administrativa

| Função | Semântica e dependências verificadas | Mapeamento alvo | Auth atual → alvo | Risco/gate |
|---|---|---|---|---|
| `delete-user` | Admin valida papel, remove usuário Auth e perfil | **Service** | JWT validado, exige super_admin → Admin forte, reautenticação/MFA se aprovado e auditoria | Crítico: irreversível e acoplado ao provedor de Auth; só após modelo de identidade/membership |
| `invite-member` | Admin convida usuário Auth e grava perfil/papel | **Service** | JWT validado, admin/super_admin com restrição de papel → Admin + tenant/membership | Crítico: elevação de privilégio, redirect e estados parciais Auth/perfil; convite idempotente e expiração |

## Funções sem seção explícita no deploy versionado

`analyze-meeting-transcript`, `crux-benchmark`, `generate-image`, `ghl-inspect`, `google-meetings`, `process-meeting-audio`, `transcribe-meeting` e `trigger-post-rei-enrichment` não têm seção em `supabase/config.toml`. Isso não permite concluir se JWT é exigido remotamente. Cada substituto deve declarar auth no código, IAM e configuração versionada; nenhum pode depender apenas do gateway.

## Dependências transversais que bloqueiam portabilidade direta

- `SUPABASE_SERVICE_ROLE_KEY` é usada amplamente; no alvo vira policies explícitas e service accounts de mínimo privilégio, não uma chave equivalente universal.
- Chamadas a `supabase.functions.invoke`/`/functions/v1` existem entre funções, inclusive referência a `fill-rei-from-transcript`, que não possui diretório. Todo edge do grafo precisa de contrato e identidade de workload.
- RPCs `match_agent_knowledge`, `convert_opportunity_to_project` e `convert_opportunity_to_project_v2` precisam de substituição comportamental testada.
- `ai_generation_jobs` e campos de status são embriões de ledger, mas não provam atomicidade, retry ou deduplicação completos.
- OpenAI, Anthropic, Google, GoHighLevel, BrasilAPI e URLs arbitrárias exigem política de egress, timeout, quota e sandbox por ambiente.
- Logs atuais podem incluir payload de webhook, tokens/PII ou conteúdo de reunião; redaction e retenção são gate antes do primeiro tráfego.

## Gates por função

Uma função somente sai do Supabase quando houver:

1. callers internos, frontend, scripts, cron e terceiros identificados;
2. contrato de entrada/saída e códigos de erro versionados;
3. auth, tenant, ownership e campos mutáveis definidos;
4. idempotency key, retry, timeout, dead-letter e compensação quando houver efeito;
5. testes positivos, cross-tenant, replay e privilege escalation;
6. sandbox/mocks dos terceiros e limites de custo;
7. telemetria sem segredo/PII e dashboard/alerta com owner;
8. comparação de resultado e rollback exercitado;
9. callers promovidos ao endpoint/evento novo e telemetria Supabase em zero durante a janela aprovada;
10. decisão explícita de portar ou retirar funções sem uso comprovado.
