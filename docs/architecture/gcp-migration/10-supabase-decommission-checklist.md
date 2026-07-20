# Checklist objetivo de decommission do Supabase

## Regra de decisão

O Supabase só pode ser desativado depois de todos os itens do **Gate A — zero runtime** estarem `PASS`, o período de estabilização aprovado ter terminado e Giulliano autorizar a ação específica. A exclusão do projeto e a destruição de cópias ocorrem apenas no **Gate B — exclusão**, após a retenção aprovada e uma segunda autorização.

`PASS` exige evidência anexada e revisada. `N/A` exige justificativa e aprovação do owner de negócio/segurança; ausência de evidência é `FAIL`. O tamanho da janela de observação, retenção, RTO/RPO e tolerâncias ainda são **entradas não verificadas** e precisam ser aprovados antes de usar este checklist.

### Distinção essencial

- **Zero runtime:** nenhum usuário, workload, build, job, terceiro ou domínio depende do Supabase; não há novas escritas; a cópia preservada serve somente a rollback/auditoria durante prazo aprovado.
- **Zero dado exclusivo:** todo dado/objeto/identidade necessário existe no alvo, reconciliado no mesmo watermark. Não significa apagar antecipadamente a cópia de rollback.
- **Exclusão:** depois da retenção, projeto/dados/credenciais podem ser destruídos somente com autorização irreversível separada.

## Pacote mínimo de evidência

O pacote final deve identificar:

- versões de frontend, backend, schema e infraestrutura;
- ambientes e período observado, com timezone;
- lista de domínios, callers, funções, buckets, jobs, RPCs, canais e terceiros;
- snapshot/watermark final e relatórios de reconciliação;
- resultados completos de testes, restore, rollback e segurança;
- telemetria de rede/aplicação/terceiros que demonstra zero uso;
- owners/reviewers, exceções, riscos residuais e aprovações;
- plano de retenção, localização lógica do arquivo, acesso e data de destruição, sem expor segredo ou PII.

## Gate A — zero dependência de runtime

### 1. Código, imports e dependências

- [ ] **Imports zero:** nenhum bundle/runtime ativo importa `@supabase/supabase-js`, wrappers locais do cliente Supabase ou SDK equivalente.
- [ ] **Manifest zero:** dependências e lockfiles ativos não incluem o SDK Supabase por necessidade de runtime. Dependência mantida apenas em ferramenta histórica precisa estar fora de build/deploy e justificada.
- [ ] **Inicialização zero:** não existe `createClient` Supabase nem client singleton alcançável no frontend, backend, workers, jobs, scripts de build/prerender ou service worker.
- [ ] **API direta zero:** nenhuma chamada ativa usa `.from`, `.rpc`, `.channel`, `.storage`, `.functions.invoke`, `/rest/v1`, `/auth/v1`, `/storage/v1`, `/realtime/v1`, `/functions/v1` ou GraphQL Supabase.
- [ ] **Config zero:** variáveis `SUPABASE_*`, `VITE_SUPABASE_*`, URLs/anon keys e project refs não entram em runtime, build, deploy, preview, testes end-to-end ou artifact ativo.
- [ ] **Prerender zero:** `scripts/prerender.js` e qualquer gerador de rotas/conteúdo usam API/fonte GCP do ambiente correto e não consultam Supabase.
- [ ] **Código morto tratado:** referências remanescentes estão somente em migrations/documentação/arquivo histórico explicitamente excluídos de build e deploy.

**Evidência objetiva:** relatório de scan em todos os arquivos versionados e artifacts descompactados, grafo de dependências, source maps quando existentes e teste de build sem variáveis Supabase. A allowlist de arquivos históricos deve ser curta, revisada e não executável.

### 2. Chamadas e tráfego

- [ ] **Rede zero:** logs de egress/DNS/proxy e traces mostram zero requisição aos hosts/project refs Supabase durante a janela aprovada, cobrindo frontend, APIs, jobs, CI, prerender e ferramentas operacionais.
- [ ] **Browser zero:** teste instrumentado de todas as jornadas críticas mostra zero request Supabase no navegador, inclusive login, refresh, upload, realtime e páginas públicas.
- [ ] **Terceiros zero:** webhooks, OAuth redirects, callbacks, automações e integrações não chamam endpoints Supabase.
- [ ] **Fallback desligado:** feature flags não podem reativar Supabase silenciosamente; rollback exige procedimento e autoridade explícitos durante retenção.
- [ ] **Erros zero relacionados:** dashboards não mostram tentativas bloqueadas, DNS failures ou retries para Supabase; “zero sucesso” sem verificar falhas não basta.

**Evidência objetiva:** conjunto conhecido de hosts/refs, período completo, fontes de telemetria e cobertura de jornadas. O período é uma decisão humana; não é inventado aqui.

### 3. Usuários, Auth e sessões

- [ ] **Usuários reconciliados:** total e contagens por estado (ativo, inativo, convidado, bloqueado) no alvo igualam o snapshot lógico aprovado; toda divergência está explicada e assinada.
- [ ] **Identidades sem colisão:** mapping `issuer + subject` → usuário interno é único e todas as memberships/papéis foram reconciliadas.
- [ ] **Fluxos completos:** login, refresh, logout, OTP/magic link, recovery, atualização de senha, convite, disable/delete e redirects usam somente o provedor alvo.
- [ ] **Sessões antigas encerradas:** sessões/tokens Supabase expiraram ou foram revogados conforme política aprovada; nenhuma API alvo os aceita.
- [ ] **Token cross-environment negado:** tokens dev/staging/Supabase falham em produção por issuer/audience; claims de papel/tenant adulteradas falham.
- [ ] **Templates/providers/hooks migrados:** e-mail, redirect allowlists, SMTP/provider, hooks e configurações efetivas foram substituídos ou retirados.
- [ ] **Funções administrativas migradas:** `invite-member` e `delete-user` operam no alvo com auditoria, tenant e compensação.

**Evidência objetiva:** reconciliação sem PII no relatório, matrizes positiva/negativa, amostra determinística e logs de auditoria. Identidade/autorização não aceitam divergência inexplicada.

### 4. Banco, dados e PostgREST

- [ ] **Autoridade de escrita zero:** Supabase recebe zero escrita após o watermark final; todos os writers conhecidos apontam para a API GCP.
- [ ] **Schema reconciliado:** tabelas, colunas, defaults, sequences, constraints, indexes, views, functions, triggers, grants, owners e extensões têm destino/retirada documentado.
- [ ] **Dados reconciliados:** counts totais e por tenant/status/período, min/max, FKs, duplicatas, sequences e checksums por chunk passam no mesmo ponto lógico.
- [ ] **Dado exclusivo zero:** não há linha necessária presente apenas no Supabase nem delta pendente/retry não aplicado.
- [ ] **Financeiro/identidade zero divergência:** toda divergência inexplicada é zero; tolerância para outros domínios precisa ser definida e aprovada, nunca presumida.
- [ ] **URLs/referências remapeadas:** colunas JSON/texto não contêm URL Supabase ainda necessária ao runtime.
- [ ] **PostgREST zero:** frontend/backend/terceiros não acessam tabelas ou views por PostgREST; API server-side alvo é a fronteira.
- [ ] **Backup/restore aprovado:** backup final é restaurável em ambiente isolado e o restore foi inspecionado, não apenas iniciado.

**Evidência objetiva:** manifest de snapshot, watermark, canonicalização de `NULL`/timezone/decimal/JSON/bytes, checksums, relatório de constraints e teste funcional. Dados reais só são acessados/exportados com aprovação específica.

### 5. Storage e objetos

- [ ] **Buckets inventariados:** todos os buckets efetivos, incluindo qualquer não criado nas migrations, têm decisão migrar/retirar.
- [ ] **Objetos reconciliados:** contagem, soma de bytes, checksum, MIME, metadata e key/prefix são iguais ao snapshot; exceções são assinadas.
- [ ] **Referências válidas:** cada referência de banco resolve para objeto GCP existente; nenhum runtime depende de URL Supabase pública/assinada.
- [ ] **Upload/download zero:** todos os fluxos usam Cloud Storage/API alvo, com URL assinada curta e ownership tenant-scoped quando privado.
- [ ] **Privacidade preservada:** objeto privado não ficou público; ativos públicos possuem requisito explícito e cache/URL de destino testados.
- [ ] **Lifecycle/restore testados:** versionamento, retenção, deleção, restore, malware/content controls e CORS aprovados conforme classe.
- [ ] **Tráfego Storage Supabase zero:** logs mostram zero GET/POST/DELETE/list durante a janela aprovada.

### 6. Realtime

- [ ] **Cinco fluxos classificados:** tarefas Orqflow, hub messages, generation jobs, avatar/profile e kickoff têm substituto ou retirada aprovada; ClickUp foi retirado.
- [ ] **Channels zero:** nenhum código ativo cria channel/subscription Supabase e nenhum browser mantém websocket ao Realtime.
- [ ] **Publicação zero:** tabelas/publicações Supabase Realtime não são necessárias a caller ativo.
- [ ] **Isolamento testado:** subscriber do tenant A não recebe evento B; reconnect, ordering, lag e revoke foram testados no alvo.
- [ ] **Telemetria zero:** conexões/mensagens Supabase Realtime são zero durante a janela aprovada.

### 7. Cron, Scheduler, filas e eventos

- [ ] **Cron inventariado:** jobs versionados e criados fora do Git foram reconciliados; inclui sync de reuniões a cada 15 minutos detectado no histórico.
- [ ] **Cron Supabase zero:** `pg_cron`, `pg_net` e HTTP schedules no Supabase não executam trabalho necessário após cutover.
- [ ] **Schedules GCP ativos e autenticados:** cada schedule tem owner, timezone, target, service identity, retry, idempotência, alerta e runbook.
- [ ] **Filas drenadas:** tasks/tópicos antigos e novos não contêm efeito pendente; dead-letter foi reconciliada antes do watermark final.
- [ ] **Replay seguro:** duplicata, reorder, timeout e poison message não produzem efeito adicional.
- [ ] **Execução observada:** pelo menos a janela operacional aprovada foi observada sem depender do job Supabase.

### 8. RPCs, funções PostgreSQL e triggers

- [ ] **RPC callers zero:** nenhum runtime chama `/rpc` ou `.rpc` Supabase.
- [ ] **RPCs chamadas substituídas:** conversão de oportunidade, geração de plano, proposta por slug, busca vetorial, reconciliação e estado REI têm contrato/teste no alvo ou retirada aprovada.
- [ ] **Helpers substituídos:** não há dependência de `auth.uid()`, `auth.role()` ou semântica implícita Supabase no PostgreSQL alvo.
- [ ] **Triggers reconciliados:** cada trigger efetivo foi portado, movido para API/job ou retirado com comportamento coberto.
- [ ] **Privilégio revisado:** nenhuma função alvo necessária ao runtime usa owner, superuser, `BYPASSRLS`, `PUBLIC EXECUTE` ou `SECURITY DEFINER` inseguro.
- [ ] **Teste funcional:** resultados, transações, concorrência e falhas das RPCs/triggers críticas são equivalentes no alvo.

### 9. Edge Functions

- [ ] **31/31 decididas:** cada função de [08-edge-functions-mapping.md](./08-edge-functions-mapping.md) está migrada ou formalmente retirada por falta de caller/requisito.
- [ ] **Callers zero:** frontend, scripts, migrations, cron, webhooks e outras funções não chamam o endpoint Supabase de nenhuma das 31.
- [ ] **Config drift resolvido:** as dez funções sem seção e a seção órfã `autentique-webhook` foram reconciliadas com o estado efetivo.
- [ ] **Encadeamentos zero:** não existem `functions.invoke`, `/functions/v1` nem chamada à função ausente `fill-rei-from-transcript` em runtime.
- [ ] **Webhooks transferidos/desativados:** GHL reconhece apenas endpoints alvo testados; ClickUp e InfinitePay estão removidos e qualquer retry antigo está encerrado.
- [ ] **OAuth callbacks transferidos:** Google/GHL redirect URIs apontam ao alvo; nenhum token é devolvido ao navegador ou log.
- [ ] **Observação zero:** invocations/logs das Edge Functions Supabase são zero na janela aprovada, incluindo falhas 4xx/5xx.

### 10. Secrets, chaves e configuração

- [ ] **Runtime secret zero:** nenhum workload GCP/CI/frontend usa `SUPABASE_SERVICE_ROLE_KEY`, anon key, JWT secret, database password ou URL Supabase.
- [ ] **Inventário por nome:** secrets Supabase em CI, hosting, extensões, terceiros e gerenciadores foram localizados sem ler/imprimir valores.
- [ ] **Substitutos ativos:** workloads usam IAM/workload identity e secrets de terceiros separados por ambiente; nada sensível em `VITE_*`.
- [ ] **Revogação planejada:** ordem, impacto e rollback para revogar chaves Supabase estão aprovados; a revogação real exige checkpoint humano.
- [ ] **Credencial histórica tratada:** o bearer literal em migration foi classificado e rotacionado/revogado por autoridade, sem reproduzir seu valor.
- [ ] **Logs/artifacts limpos:** scanners e revisão mostram zero secret em source, image, artifact, migration, log e pacote de evidência.
- [ ] **Após estabilização:** credenciais Supabase são revogadas/removidas do runtime; preservação break-glass, se aprovada, é temporária, restrita e alertada.

### 11. DNS, domínios, CORS/CSP e terceiros

- [ ] **DNS zero:** nenhum registro ativo necessário ao produto aponta a hostname Supabase; zonas e aliases foram revisados no provedor autoritativo.
- [ ] **Código/config zero:** URLs hard-coded, project refs e callbacks Supabase foram removidos do runtime, inclusive fallback de `google-meetings`.
- [ ] **OAuth/webhooks zero:** consoles Google/GHL e outros terceiros não mantêm callback/webhook Supabase ativo; ClickUp e InfinitePay não mantêm endpoints ativos.
- [ ] **CSP/CORS zero:** allowlists não autorizam endpoints/origins Supabase por legado.
- [ ] **URLs públicas migradas:** links em e-mails, templates, páginas indexadas, QR codes, materiais e dados persistidos foram substituídos ou redirecionados conforme plano.
- [ ] **TTL e rollback observados:** mudança DNS/callback cumpriu TTL/janela e foi validada de fora da rede; alteração real teve aprovação específica.
- [ ] **Certificados saudáveis:** endpoints GCP têm certificado, hostname e renovação monitorados antes de retirar o antigo.

### 12. Build, deploy, operações e suporte

- [ ] **Pipeline zero:** GitHub Actions/scripts não exigem Supabase para CI, build, preview, migration ou deploy.
- [ ] **Environments separados:** dev/staging/prod não compartilham issuer, banco, bucket, secret, service account ou integração real.
- [ ] **Runbooks atualizados:** on-call, incident, restore, replay, Auth, payment e support não instruem usar Supabase.
- [ ] **Alertas atualizados:** dashboards/alerts cobrem GCP e terceiros; nenhum alerta crítico depende de painel Supabase.
- [ ] **SLO/custo estáveis:** período aprovado atende limites de erro, latência, saturação e custo; limites têm fonte e owner.
- [ ] **Rollback exercitado:** staging demonstrou retorno seguro; em produção, rollback remanescente está documentado e restrito à janela aprovada.
- [ ] **Suporte preparado:** owners conhecem mudanças de login, links, upload, jobs e integrações; comunicação aprovada foi executada.

## Gate A — decisão de desativação

Somente marcar `PASS` quando:

- [ ] Todos os itens acima têm evidência e reviewer.
- [ ] Reconciliação final tem zero divergência inexplicada em financeiro, identidade e autorização.
- [ ] Testes cross-tenant/privilege escalation passam no alvo.
- [ ] Restore GCP e rollback foram exercitados.
- [ ] Período de estabilização aprovado terminou com tráfego Supabase zero.
- [ ] Export final e retenção foram aprovados.
- [ ] Pedido específico de desativação descreve ação, target, impacto/custo, rollback e validação.
- [ ] Giulliano autorizou explicitamente a desativação.

Desativar billing, pausar projeto, revogar chaves ou desligar serviços não é uma ação implícita deste checklist.

## Retenção entre desativação e exclusão

- [ ] Snapshot/export final é imutável, criptografado, restaurável e possui checksum/manifest.
- [ ] Local, classes de dado, base legal, prazo, owner, leitores e audit de acesso foram aprovados.
- [ ] Supabase preservado como rollback, se ainda necessário, está sem writers normais, com acesso mínimo e monitoramento.
- [ ] Há data/condição para encerrar rollback e data/condição separada para destruir arquivo/projeto.
- [ ] Solicitações de titular, legal hold, auditoria e incident response estão contempladas.
- [ ] Custo de retenção foi aprovado; duração não é escolhida por conveniência técnica.

## Gate B — exclusão irreversível

- [ ] Prazo de rollback e retenção terminou ou a obrigação remanescente está satisfeita por arquivo aprovado.
- [ ] Restore do arquivo final foi testado dentro da política.
- [ ] Telemetria desde o Gate A continuou mostrando zero uso/tentativa Supabase.
- [ ] Nenhum DNS, webhook, OAuth callback, secret, usuário operacional ou pipeline aponta ao projeto.
- [ ] Owners técnico, dados, segurança, jurídico/negócio e billing assinaram o pacote final.
- [ ] Pedido separado informa exatamente o projeto Supabase, o que será apagado, impacto, recuperabilidade, custo e validação pós-ação.
- [ ] Giulliano autorizou explicitamente exclusão/revogação final.
- [ ] Após ação autorizada, inventário, billing e falhas esperadas foram inspecionados e o audit record foi preservado.

## Critérios automáticos de `FAIL`

- Qualquer tráfego ou retry Supabase não explicado.
- Qualquer caller, sessão, webhook, cron, RPC, channel, object URL ou Edge Function ainda necessário.
- Qualquer divergência de identidade, autorização ou pagamento.
- Qualquer teste cross-tenant/elevação falho ou ausente.
- Backup sem restore testado.
- Secret exposto, logging de payload sensível ou token retornado ao browser.
- Dependência mascarada como “fallback temporário” sem prazo, owner e autorização.
- Item marcado `PASS` apenas por exit code, declaração de agente ou ausência de reclamação de usuário.
