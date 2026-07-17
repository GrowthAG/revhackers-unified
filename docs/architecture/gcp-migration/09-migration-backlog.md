# Backlog de migração para Google Cloud

## Natureza e regras de uso

Este backlog ordena trabalho de descoberta, desenho, implementação futura, rehearsals e decommission. Ele não é autorização para provisionar, acessar produção, exportar dados, escrever secrets, configurar Firebase/Cloud Run, alterar DNS, fazer deploy, push/merge ou desativar Supabase. Cada item externo mantém o checkpoint humano de [04-migration-runbook.md](./04-migration-runbook.md).

Estado inicial deste documento: todos os itens estão **pendentes**, salvo a decisão de destino registrada em [06-approved-direction.md](./06-approved-direction.md). Owner, datas, região, custo, volumes, SLO, RTO/RPO e thresholds ainda não foram aprovados.

### Gate comum de conclusão

Uma tarefa não termina por exit code ou resumo. Sua evidência deve registrar versão, ambiente, entrada não secreta, resultado inspecionado, divergências, reviewer, riscos residuais e rollback. Produção exige aprovação própria mesmo quando o mesmo trabalho passou em staging.

## Épicos e ordem recomendada

```text
E0 Governança e evidência
 ├──> E1 Tenant/Auth/contratos ─┐
 ├──> E2 Topologia/IAM/rede ────┼──> E5 Staging + piloto
 └──> E3 Schema/dados ──────────┤
                                │
E1 + partes locais de E3 ──> E4 Fundação local da API ─┘
          |
          v
E5 ───────+--> E6 Banco/API/RPC/triggers
          +--> E7 Storage/Realtime
          +--> E8 Functions ondas 2–4
          +--> E9 Identidade e onda 5
                         |
                         v
E10 Rehearsals integrados e prontidão de produção
                         |
                         v
E11 Cutover incremental e estabilização
                         |
                         v
E12 Decommission Supabase
```

E1, E2 e E3 podem avançar em paralelo conforme suas dependências específicas; E4 é local e não espera provisioning cloud. E6–E9 podem avançar em paralelo somente depois de contratos, tenant boundary, staging e observabilidade existirem. Autoridade de escrita continua única por domínio; não se cria dual-write sem ledger, fencing e reconciliação previamente aprovados.

## E0 — governança, baseline e decisões bloqueantes

**Objetivo:** transformar entradas não verificadas em decisões rastreáveis antes de sizing ou implementação.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E0-T1 | Congelar baseline documental/código em `5acc0ed` e registrar deltas posteriores relevantes | Nenhuma | Commit, inventário e diff inspecionados; nenhum segredo incluído |
| E0-T2 | Nomear owner técnico, segurança, negócio, dados, identidade, integrações, custo e incidente | Autoridade de Giulliano | Matriz RACI aprovada; ninguém recebe permissão cloud por este artefato |
| E0-T3 | Definir critérios de sucesso, prazo desejado, janela, estabilização e abort | E0-T2 | Decisão assinada; números não inferidos do repositório |
| E0-T4 | Aprovar RTO/RPO, disponibilidade, retenção, LGPD/residência e classes de PII | E0-T2 | Registro jurídico/negócio/técnico e riscos aceitos |
| E0-T5 | Medir custo e uso atuais de Supabase/Hostinger/terceiros por ambiente | Aprovação para sistemas medidos | Relatório de fonte, período e método; sem exposição de credenciais |
| E0-T6 | Inventariar schema/Auth/Storage/Realtime/functions/cron efetivos e reconciliar com Git | Aprovação para leitura dos ambientes | Snapshot não secreto, drift explicado, 39 funções reconciliadas |
| E0-T7 | Tratar a credencial bearer literal histórica como possível incidente | E0-T2; autorização do owner para ação externa | Classificação, owner/provedor, secret scan preventivo e pedido separado de rotação/revogação; valor nunca reproduzido e histórico não reescrito automaticamente |

**Gate E0:** modelo de evidência, owners e entradas para arquitetura aprovados. Sem E0, project tier, região, cronograma e custo permanecem indeterminados.

## E1 — tenant, autorização, identidade e contratos

**Objetivo:** definir a fronteira de segurança que substituirá `auth.uid()`, `auth.role()`, RLS e service role.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E1-T1 | Aprovar unidade canônica de tenant e relações usuário–membership–recurso | E0-T4, E0-T6 | ERD e invariantes com dois tenants; exceções globais explícitas |
| E1-T2 | Aprovar matriz de papéis, ações e escopo global/tenant | E1-T1 | Tabela endpoint/recurso/ação/papel revisada por negócio e segurança |
| E1-T3 | Escolher provedor de identidade e estratégia de migração/convivência | E0-T4, E1-T1 | ADR cobre senha, OTP, recovery, convite, disable, sessão e rollback |
| E1-T4 | Definir token verification por ambiente e mapping `issuer + subject` | E1-T3 | Casos token expirado, audiência/issuer errado, revoke e key rotation |
| E1-T5 | Especificar contexto transacional/RLS ou queries tenant-scoped no PostgreSQL | E1-T1, E1-T2 | Prova local mostra ausência de vazamento no pool, papel sem `BYPASSRLS` e invariantes relacionais por tenant, preferencialmente FKs compostas com `tenant_id` |
| E1-T6 | Catalogar contratos HTTP/eventos e links públicos/capabilities | E0-T6, E1-T2 | OpenAPI/AsyncAPI ou formato equivalente; erros e versionamento definidos |
| E1-T7 | Automatizar matriz negativa e privilege escalation de `03` | E1-T4–T6 | Testes com dois tenants, papéis e workloads; zero efeito cross-tenant |
| E1-T8 | Aprovar ADR de custódia OAuth para Google e GHL | E1-T1–T4, E2-T7 | `state` de uso único ligado a usuário/tenant/ambiente, PKCE quando suportado, redirects allowlisted, tokens fora de resposta/log, criptografia/rotação/revogação e refresh concorrente controlado |

**Gate E1:** nenhuma API, job, migration ou fila pode ser promovida sem tenant/policy e teste negativo correspondente.

## E2 — topologia, IAM, rede, CI/CD, DNS e custo

**Objetivo:** detalhar [07-gcp-project-topology.md](./07-gcp-project-topology.md) sem criar recursos.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E2-T1 | Verificar disponibilidade de `revhackers-dev`, `revhackers-staging`, `revhackers-prod`, organização, folder e billing target | E0-T2; aprovação para consulta/ação quando aplicável | IDs aprovados ou novos nomes decididos; nenhum ID inventado |
| E2-T2 | Selecionar região com residência, latência, serviço, HA e custo medidos | E0-T4, E0-T5 | Matriz com medições e decisão humana |
| E2-T3 | Desenhar IAM humano/workload e break-glass por projeto | E1-T2, E2-T1 | Policy diff revisado por outra pessoa; nenhum wildcard cross-environment |
| E2-T4 | Desenhar VPC, ingresso, conexão privada ao banco, egress e WAF/rate limit | E2-T2, threat model | Diagrama e testes de negação; browser sem rota ao banco |
| E2-T5 | Definir pipeline, artifact promotion, runtime config do frontend, provenance, branch/environment protections e migration role | Inventário do GitHub, E2-T3 | Backend promove o mesmo digest; frontend prova runtime config externo ou builds por ambiente no mesmo commit/inputs; segredo não aparece em output |
| E2-T6 | Definir budgets, quotas, labels, alert routing e política de não produção | E0-T5, E2-T1 | Valores e destinatários aprovados; alerta não tratado como hard cap |
| E2-T7 | Inventariar DNS/certificados/CSP/CORS/OAuth redirects/webhooks e planejar rollback | E0-T6 | Matriz hostname → owner → TTL → consumidor, sem mudança real |
| E2-T8 | Escolher e desenhar IaC, state, locking, bootstrap, import e drift detection | E2-T1–T4 | ADR e plano de recuperação/proteção contra destruição; nenhuma execução ou state real criado |
| E2-T9 | Transformar guardrails em políticas verificáveis | E2-T3–T4, E2-T8 | Testes/policy-as-code bloqueiam chaves de service account, IAM público não aprovado, IP público de banco e buckets sem acesso uniforme |

**Checkpoint humano E2:** antes de qualquer criação paga, pedido escrito com ação, projeto, custo/impacto, IAM, rollback e validação.

## E3 — schema, banco, dados e reconciliação

**Objetivo:** produzir uma fonte de schema portável e um método comprovado de migração sem usar produção como laboratório.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E3-T1 | Reconciliar 106 migrations, tipos gerados e snapshot efetivo | E0-T6 | Catálogo de tabelas/views/functions/triggers/policies/grants/extensions com origem |
| E3-T2 | Classificar 22 funções tipadas, RPCs chamadas, 16 triggers detectados e `SECURITY DEFINER` | E3-T1, E1-T2 | Decisão portar para SQL/API/job/retirar, com testes de comportamento |
| E3-T3 | Substituir semanticamente `auth.uid()`/`auth.role()` e revisar grants/default privileges | E1-T5, E3-T2 | Testes diretos por papel; nenhum `PUBLIC EXECUTE` ou bypass não aprovado |
| E3-T4 | Validar extensões `vector`, `moddatetime`, `pgcrypto`, `pg_cron`, `pg_net` | E3-T1 | Compatibilidade e substituto documentados; cron/net não copiados cegamente |
| E3-T5 | Definir snapshot, watermark, delta/CDC e autoridade de escrita por domínio | E0-T3, E3-T1 | Máquina de estados por domínio/tenant, epoch/fencing token, ledger de roteamento, rejeição no writer não autoritativo, idempotência, delta reverso, freeze/abort e rollback |
| E3-T6 | Construir reconciliação de counts/checksums/sequences/FKs e resultados funcionais | E3-T1 | Fixtures sintéticas detectam perda, duplicata, timezone/JSON/decimal divergente |
| E3-T7 | Definir backups/PITR/restore e executar prova local/staging quando autorizado | E0-T4, E2, staging | Restore inspecionado, tempo registrado e RTO/RPO comparados |

**Gate E3:** nenhum dado real é copiado até schema, reconciliação, restore e rollback passarem em dados sintéticos/staging.

## E4 — fundação local da API, eventos e observabilidade

**Objetivo:** provar contratos e controles localmente, sem cloud e com dados sintéticos.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E4-T1 | Implementar esqueleto de API com validação, auth adapter, tenant context e audit ID | E1 | Testes positivos/negativos locais e contrato versionado |
| E4-T2 | Implementar padrão de idempotency ledger, retry, dead-letter e replay seguro | E1-T6, E3-T5 | Duplicata, reorder, timeout e poison message testados |
| E4-T3 | Implementar adapters para banco, Storage, identity e terceiros sem acoplar contratos ao provedor | E1, E3 | Fakes locais; nenhuma credencial/endpoint real |
| E4-T4 | Definir log schema, redaction, métricas, tracing e auditoria | E0-T4, E1-T2 | Testes provam ausência de token, PII proibida e payload integral |
| E4-T5 | Criar harness de comparação Supabase/implementação candidata com fixtures | E3-T6 | Diferenças categorizadas e output determinístico onde aplicável |
| E4-T6 | Provar pool/concurrency/transaction context localmente | E1-T5 | Contexto não vaza entre tenants e conexões têm limite explícito |

**Gate E4:** POC reproduzível local, sem produção, sem browser→banco e sem secret real.

## E5 — staging e piloto da onda 1

**Objetivo:** criar, somente após aprovação, a primeira fatia GCP observável e reversível.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E5-T1 | Solicitar aprovação exata para fundação de `revhackers-staging` | E0–E4 | Pedido inclui custo, IAM, recursos, rollback e validação |
| E5-T2 | Aplicar topologia/IAM/rede/budget/observabilidade de staging | Aprovação E5-T1 | Diff de IaC revisado, inventário real e testes de negação |
| E5-T3 | Restaurar banco/Storage de staging a partir de fixture sintética | E3-T7, E5-T2 | Restore, checksum e isolamento aprovados |
| E5-T4 | Migrar uma função onda 1 sem escrita crítica | E4, E5-T3 | Contrato, SSRF/rate limit, auth, telemetria e rollback aprovados |
| E5-T5 | Mudar somente caller de staging por feature flag e comparar | E5-T4 | Métricas dentro de limites aprovados; endpoint Supabase permanece fallback |
| E5-T6 | Repetir piloto com falha induzida e rollback | E5-T5 | Tempo, perda zero, alerta e evidência inspecionados |

**Gate E5:** piloto de staging aprovado e pelo menos um rollback exercitado. Isso não autoriza produção.

## E6 — API de domínio, PostgREST, RPCs, triggers e banco

**Objetivo:** retirar o acesso direto do browser e migrar dados por domínio.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E6-T1 | Priorizar domínios por risco/coupling e escolher primeiro aggregate | E1, E3, E5 | ADR de domínio piloto; pagamentos/Auth ficam fora do primeiro |
| E6-T2 | Colocar API própria diante do Supabase para o domínio | E4, E6-T1 | Frontend usa contrato próprio; comportamento atual preservado |
| E6-T3 | Migrar leituras e depois escritas para PostgreSQL alvo em staging | E3, E5 | Autoridade única, counts/checksums e testes de transação |
| E6-T4 | Portar/substituir RPCs e triggers do domínio | E3-T2–T4 | Paridade funcional e teste direto de privilégio |
| E6-T5 | Repetir por domínio, mantendo rollback enquanto houver delta | E6-T2–T4 | Gate individual de contrato, tenant, observabilidade e negócio |
| E6-T6 | Remover cliente PostgREST/RPC do bundle ativo após todos os callers | E6-T5 | Scan estático + teste de rede mostram zero chamada Supabase no domínio |

## E7 — Storage e Realtime

**Objetivo:** substituir buckets/URLs e os seis fluxos Realtime sem ampliar acesso.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E7-T1 | Inventariar buckets efetivos, objetos, bytes, ACL/policies, MIME e URLs persistidas | E0-T6 | Inclui bucket `lovable-uploads` citado no frontend ou explica ausência |
| E7-T2 | Classificar objetos públicos/privados e definir key tenant-scoped/signed URLs | E1-T1, E7-T1 | Testes anônimo, cross-tenant, overwrite, MIME, tamanho e expiração |
| E7-T3 | Ensaiar cópia incremental e remapeamento de URL em staging | E3-T5–T6, E7-T2 | Count, bytes, checksum canônico do conteúdo, metadata e referências reconciliadas; não confiar apenas em ETag/MD5 específico do provedor |
| E7-T4 | Classificar seis fluxos Realtime em polling, SSE/WebSocket ou evento interno | E1-T6, E0-T6 | Latência/requisito de negócio medidos; subscription autorizada |
| E7-T5 | Implementar e testar substitutos por fluxo | E4, E7-T4 | Cross-tenant subscription falha; reconnect/ordering/lag observados |
| E7-T6 | Remover URLs/clientes Storage e canais Realtime Supabase ativos | E7-T3, E7-T5 | Código, rede e configuração em zero no ambiente promovido |

## E8 — Edge Functions ondas 2, 3 e 4

**Objetivo:** migrar as funções não financeiras por lotes pequenos conforme [08-edge-functions-mapping.md](./08-edge-functions-mapping.md).

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E8-T1 | Confirmar callers, deploy/auth efetivos, volume/duração e owner das 39 funções | E0-T6 | Matriz reconciliada; função sem uso recebe decisão de retirada |
| E8-T2 | Migrar onda 2 (IA/conteúdo) por função | E4–E6 | Quota/custo, job ledger, tenant e paridade por função |
| E8-T3 | Migrar ingress/worker de reuniões e proteger áudio/transcrição | E7 Storage, E4-T2 | Upload, PII, retry, ownership e lifecycle de objeto testados |
| E8-T4 | Migrar ClickUp e schedules | E4-T2, E5, sandbox | Assinatura, idempotência, rate limit, dead-letter e reconciliação |
| E8-T5 | Separar `google-meetings` em OAuth/list/sync/jobs | E1-T3, E2-T7, E7 | Refresh token nunca é exibido; `state`, sharing e callback testados |
| E8-T6 | Migrar GHL/OAuth/webhooks/relay | E4-T2, E8-T4, sandbox | Tokens protegidos, compensação, replay e loop prevention |
| E8-T7 | Eliminar chamadas internas `/functions/v1`, `functions.invoke` e referência ausente `fill-rei-from-transcript` | E8-T2–T6 | Grafo novo usa IAM/contratos; scan e traces sem endpoint Supabase |

**Gate por função:** os dez critérios em `08` devem passar individualmente; uma onda não é unidade de rollback.

## E9 — identidade, pagamentos e administração

**Objetivo:** migrar os fluxos de maior impacto somente após a fundação estar estável.

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E9-T1 | Ensaiar mapping de usuário/membership e colisões sem presumir portabilidade de senha | E1-T3, E3-T6, staging | Counts por estado, amostra determinística e zero colisão inexplicada |
| E9-T2 | Provar login, refresh, OTP, recovery, convite, disable, logout e sessão antiga | E9-T1 | Matriz positiva/negativa e rollback do emissor |
| E9-T3 | Reimplementar `invite-member` e `delete-user` com auditoria/compensação | E9-T2 | Elevação, self-delete, cross-tenant e partial failure testados |
| E9-T4 | Reimplementar `infinitepay-create-link` derivando valor/NSU/redirect server-side | E6 domínio propostas, sandbox | Caller não altera valor, moeda, merchant, owner ou redirect; checkout de sandbox reconciliado |
| E9-T5 | Reimplementar webhook InfinitePay com ledger e efeitos assíncronos | E4-T2, E9-T4 | Assinatura oficial sobre raw body, consulta server-side ao provedor, conferência merchant/order/valor/moeda e gravação atômica de evento único + estado financeiro + outbox; replay/duplicata/reorder testados |
| E9-T6 | Rehearsal de cutover Auth e pagamentos separado do banco | E9-T1–T5 | Zero divergência inexplicada, rollback e aceite de negócio/segurança |

## E10 — rehearsals integrados e prontidão de produção

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E10-T1 | Executar rehearsal completo com snapshot/watermark/delta em staging | E6–E9 | Duração, checksums e divergências inspecionados |
| E10-T2 | Executar restore, rollback, replay de filas/webhooks e game day | E10-T1 | RTO/RPO comparados; nenhum dado/efeito perdido ou duplicado |
| E10-T3 | Validar carga/conexões/cold start/quotas com perfil aprovado | Métricas E0, E10-T1 | Resultado e margem explícitos; sem volume inventado |
| E10-T4 | Fazer security review de IAM, tenant, SSRF, OAuth, secrets e logs | E10-T1 | Findings críticos fechados ou aceitos por autoridade |
| E10-T5 | Executar pelo menos dois rehearsals consecutivos aprovados | E10-T1–T4 | Mesma sequência reproduzível, sem divergência inexplicada |
| E10-T6 | Preparar go/no-go, comunicação, owners, dashboards e abort | E10-T5 | Runbook preenchido e aprovado; todos os checkpoints externos listados |

## E11 — cutover incremental e estabilização

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E11-T1 | Solicitar aprovações separadas de produção, export, secrets, deploy e DNS | E10 | Cada pedido contém alvo, impacto/custo, rollback e validação |
| E11-T2 | Promover por domínio: leitura canário, escrita canário, expansão | Aprovações E11-T1 | Máquina de estados e fencing ativos, feature flag, métricas, audit e reconciliação a cada passo; writer não autoritativo rejeita escrita |
| E11-T3 | Aplicar delta final por domínio com autoridade única | E11-T2 | Watermark, checksum e nenhuma escrita perdida |
| E11-T4 | Manter Supabase como rollback read-only/operacional durante janela aprovada | E11-T3 | Saúde e acesso restrito monitorados; reabertura de escrita exige fencing, delta reverso reconciliado e ação de rollback aprovada |
| E11-T5 | Observar período de estabilização aprovado | E11-T3 | Zero tráfego Supabase, SLO e custo dentro de limites aprovados |

Uma falha de isolamento, Auth, pagamento, reconciliação, restore ou audit aciona abort; não vira risco residual por conveniência.

## E12 — decommission Supabase

| ID | Tarefa | Dependências | Evidência e gate |
|---|---|---|---|
| E12-T1 | Executar integralmente [10-supabase-decommission-checklist.md](./10-supabase-decommission-checklist.md) | E11-T5 | Checklist sem `N/A` não aprovado e pacote de evidência assinado |
| E12-T2 | Aprovar export final, retenção, acesso ao arquivo e destruição futura | E0-T4, E12-T1 | Decisão legal/negócio/segurança com datas e owners |
| E12-T3 | Solicitar aprovação específica para desativar runtime Supabase | E12-T1–T2 | Ação, alvo, impacto, custo, rollback e validação exatos |
| E12-T4 | Após desativação aprovada, observar ausência de regressão | E12-T3 | Monitoramento e suporte pelo período aprovado |
| E12-T5 | Solicitar aprovação separada para exclusão após retenção/rollback | E12-T4 e prazo aprovado | Evidência de que não existe dependência nem obrigação de retenção |
| E12-T6 | Revogar credenciais, remover DNS/config e encerrar billing conforme aprovação | E12-T5 | Inventário final, audit log e validação de inexistência de runtime |

## Checkpoints humanos consolidados

Giulliano precisa aprovar explicitamente antes de:

- criar projeto, habilitar billing/API/quota ou provisionar qualquer recurso;
- configurar Cloud Run, Firebase/Identity Platform, Cloud SQL, Storage, rede, IAM ou Secret Manager reais;
- consultar/exportar/copiar dados ou configuração de produção;
- alterar/rotacionar/revogar secrets e credenciais;
- fazer deploy, modificar GitHub, branch protection ou pipeline;
- alterar DNS, domínio, certificado, OAuth redirect ou webhook externo;
- executar cutover, freeze, rollback que afete usuários ou pagamento;
- desativar ou excluir Supabase.

O pedido deve declarar ação exata, target, custo/impacto esperado, rollback e validação. A aprovação do destino Google Cloud não substitui nenhum desses gates.
