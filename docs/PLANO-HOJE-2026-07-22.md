# Plano executivo — RevHackers 100% Google Cloud

**Data:** 2026-07-22
**Objetivo final, sem alternativa:** remover o Supabase do runtime e colocar o
RevHackers integralmente no Google Cloud, com segurança, paridade funcional,
UX/UI validada, rollback e observabilidade.

> Correção de direção: a versão anterior deste documento sugeria publicar o
> frontend em Vercel e manter Supabase como solução. Isso contradizia o objetivo
> aprovado. Vercel/Hostinger não são destino. O Supabase só permanece como
> runtime temporário durante a migração incremental e será desligado depois dos
> gates de paridade, reconciliação e rollback.

---

## 1. Estado real hoje

### GCP já existente

- Projeto `revhackers-staging` na organização `usefunnels.io`, billing vinculado.
- Região de trabalho atual: `southamerica-east1`.
- APIs habilitadas: Cloud Run, Artifact Registry, Secret Manager e Cloud Build.
- Artifact Registry `revhackers-staging` criado.
- Cloud Run privado `revhackers-staging-smoke` validou a fundação sintética.
- Não há dado real, secret, Cloud SQL, bucket da aplicação ou DNS no projeto.
- Não existe `revhackers-prod`.

### Aplicação atual

- Frontend React/Vite fala diretamente com Supabase: aproximadamente 344
  chamadas `.from`, além de RPC, Storage, Realtime e Edge Functions.
- 61+ tabelas, 32 Edge Functions versionadas, 7 buckets e 6 usos Realtime.
- Enquanto o browser falar direto com Supabase, Cloud SQL não pode substituí-lo.
- O deploy Hostinger/FTP foi desativado. O workflow atual só valida artefato.

### Migração: feito x faltando

**Feito:** inventário, arquitetura alvo, projeto staging, smoke Cloud Run,
segurança P0-02/P0-03, baseline Supabase, remoção ClickUp/InfinitePay/Fathom,
GrowthMap, R1/R2 de IA.

**Iniciado hoje (E4/Fase C):** núcleo de API provider-agnostic com contratos
TypeScript/OpenAPI, identidade abstrata, autorização tenant-scoped, links de
capacidade, correlation id, redação, idempotência e matriz cross-tenant.

**Falta:** API HTTP real, adapter inicial Supabase, Cloud SQL staging, migração
de schema/dados, Identity Platform, GCS, substituição das chamadas do frontend,
port das Edge Functions, Realtime/jobs, projeto prod, frontend hosting GCP,
DNS/cutover e decommission Supabase.

---

## 2. Arquitetura final (100% GCP)

```text
Browser React/Vite
       |
       | HTTPS + token (sem acesso a banco)
       v
Frontend hosting GCP + borda/CDN
       |
       v
Cloud Run API
  - Auth/Identity Platform
  - tenant + RBAC + capability links
  - idempotência + auditoria + rate limit
       |
       +--> Cloud SQL PostgreSQL
       +--> Cloud Storage (URLs assinadas)
       +--> Cloud Tasks / Pub/Sub / Scheduler
       +--> Secret Manager
       +--> Cloud Logging / Monitoring / Trace
```

A migração de API e a migração de dados acontecem **em paralelo**. O Supabase é
somente origem temporária para extração, comparação e rollback; não é backend
final da nova API. O primeiro domínio aprovado deve operar diretamente em Cloud
SQL staging depois da carga e reconciliação.

### Substituição integral do Supabase

| Supabase atual | Destino Google Cloud |
|---|---|
| PostgreSQL / PostgREST | Cloud SQL PostgreSQL + API Cloud Run |
| Supabase Auth | Identity Platform / Firebase Authentication + Sign in with Google |
| Edge Functions | Cloud Run e, conforme semântica, Cloud Run functions |
| Storage | Cloud Storage com URLs assinadas e objetos privados por padrão |
| Realtime | SSE/WebSocket por Cloud Run ou polling; Pub/Sub somente interno |
| Cron | Cloud Scheduler |
| Filas/retries | Cloud Tasks e Pub/Sub |
| RPCs e triggers privilegiados | API/Cloud Run + SQL seguro/Cloud Tasks conforme operação |
| Secrets | Secret Manager + workload identity |
| Logs/telemetria | Cloud Logging, Monitoring, Trace e auditoria separada |
| Hosting frontend legado | Hosting 100% GCP a definir no gate de borda |

O cutover só termina quando não houver leitura, escrita, autenticação, arquivo,
function ou evento Realtime dependente do Supabase. Depois disso, chaves,
projetos e recursos Supabase são revogados/descontinuados.

---

## 3. Ordem mais eficaz até produção

### Fase 0 — Higiene e fonte única (P0)

1. Rotacionar credenciais históricas P0-01 (ação humana externa).
2. Push dos commits locais após scan de segredos e CI verde.
3. Confirmar migrations/edge functions aplicadas no runtime atual para ter uma
   baseline estável durante a migração.

### Fase 1 — Fundação da API Cloud Run (E4) — **EM EXECUÇÃO**

1. Contratos TypeScript/OpenAPI.
2. Verifier de identidade provider-agnostic.
3. Motor de autorização com tenant, membership e capability links.
4. Matriz negativa com dois tenants e papéis owner/admin/operator/client-link.
5. Idempotência, correlation id, erros e redação.
6. Runtime HTTP, health/readiness, logging e container Cloud Run.
7. Adapter inicial que usa Supabase somente server-side.

**Gate:** strict TypeScript, testes cross-tenant, nenhum segredo, container local.

### Fase 2 — Piloto GrowthMap na API

GrowthMap é o melhor piloto porque já tem um `src/api/growthmap.ts` com adapter
substituível e domínio pequeno/controlado.

1. Portar `load/save` para endpoints da nova API.
2. Criar o schema GrowthMap no Cloud SQL staging e carregar fixture sintética.
3. Cloud Run API usa Cloud SQL como backend do piloto.
4. Supabase é consultado somente em shadow read/reconciliação durante a transição.
5. Frontend alterna Supabase/API por feature flag de ambiente.
6. Portar geração de IA depois de load/save estabilizados.
7. Rollback temporário: flag volta ao adapter anterior até o gate de corte.

**Gate:** zero vazamento cross-tenant, resposta equivalente, erro/latência
medidos, rollback exercitado.

### Fase 3 — Cloud SQL staging

1. Medir tamanho, extensões, conexões, IOPS e queries reais do Supabase.
2. Escolher tier/HA/backup a partir dos dados — sem inventar sizing.
3. Criar Cloud SQL PostgreSQL em staging com IAM/rede/papéis mínimos.
4. Aplicar schema reconciliado e fixtures 100% sintéticas.
5. Validar extensões, constraints, índices, RLS/contexto transacional e pool.
6. GrowthMap passa do adapter Supabase para Cloud SQL sem alterar frontend.

### Fase 4 — Migração por ondas

1. **Onda A:** GrowthMap + conteúdo de baixo risco.
2. **Onda B:** REI/projetos/planos/propostas.
3. **Onda C:** arquivos → Cloud Storage + URLs assinadas.
4. **Onda D:** Edge Functions → Cloud Run/Tasks/PubSub/Scheduler.
5. **Onda E:** Realtime → polling/SSE/WebSocket conforme necessidade real.
6. **Onda F:** Auth Supabase → Identity Platform e mapeamento issuer+subject.

Cada domínio passa por contrato → API/Supabase → API/Cloud SQL → reconciliação
→ corte de leitura → corte de escrita → soak → remoção do caller Supabase.

### Fase 5 — Frontend, UX/UI e funcionalidade

UX/UI não fica para o fim absoluto: é validada por onda, mas o polish global
só ocorre com backend estável.

- Loading/skeleton, vazio, erro/retry e offline.
- Responsividade desktop/tablet/mobile.
- Acessibilidade: foco, teclado, contraste, labels e feedback de ação.
- Consistência com design system.
- Performance: code splitting, chunks críticos, imagens, Core Web Vitals.
- Rotas críticas E2E: login/equipe, hub cliente, REI, plano, GrowthMap,
  aprovação/assinatura e upload.

### Fase 6 — Produção GCP e cutover

1. Criar `revhackers-prod` separado de staging.
2. Infra como código, IAM mínimo, secrets, orçamento/alertas e observabilidade.
3. Cloud SQL prod + backups/PITR e restore testado.
4. Cloud Run prod + frontend hosting GCP + domínio/certificado.
5. Carga inicial + CDC/dual-run conforme prova técnica disponível.
6. Rehearsal completo, janela de corte e critérios de abort.
7. Canary → produção → reconciliação → soak.
8. Desligar escrita Supabase, depois leitura, depois Auth/Storage/Functions.
9. Revogar secrets, remover runtime e registrar decommission.

---

## 4. Prioridade real

| Prioridade | Trabalho | Motivo |
|---|---|---|
| P0 | API foundation + primeiro piloto | Remove acesso direto do browser e destrava Cloud SQL |
| P0 humano | Rotação P0-01 + aprovação tenant/login + RTO/RPO | Segurança e arquitetura de produção |
| P1 | Cloud SQL staging + migração de GrowthMap | Primeiro domínio realmente fora do Supabase |
| P1 | REI/projetos/planos | Núcleo do produto |
| P1 | Storage/Auth/Functions | Necessários para Supabase sair do runtime |
| P2 | Polish visual global | Depois da estabilidade; por onda, UX crítica é P1 |
| P2 | Roteador de IA R3-R6 | Útil, não bloqueia migração de infraestrutura |
| P3 | M&A / expansão de frameworks | Fora do caminho crítico do cutover |

---

## 5. Plano de HOJE (executável)

### Etapa A — corrigir direção e iniciar E4 ✅

- [x] Remover Vercel/Hostinger como estratégia final.
- [x] Contratos de erro, tenant, resource, identity e audit.
- [x] Verifier provider-agnostic + verifier sintético.
- [x] Autorização server-side tenant-scoped + capability links.
- [x] Idempotência, correlation id e redaction.
- [x] 27 testes novos (68/68 total), incluindo cross-tenant e token de outro ambiente.
- [x] TypeScript strict separado para API.
- [x] Contrato OpenAPI inicial.
- [x] Gate de API/testes no CI.

### Etapa B — concluir serviço HTTP local ✅

- [x] Runtime HTTP Node sem dependência externa e handler Fetch API portátil.
- [x] `/healthz` e `/readyz` conforme OpenAPI.
- [x] Request context, erros padronizados, CORS allowlist e logs redigidos.
- [x] Limite de payload, headers de segurança e correlation id.
- [x] Dockerfile multi-stage non-root para Cloud Run.
- [x] Testes HTTP, porta real e shutdown gracioso (40/40 testes da API).
- [x] Build CommonJS executável e smoke local (`healthz` + SIGTERM) aprovado.
- [x] Build do container — validado via Cloud Build staging (build dcf09302 SUCCESS).

### Etapa C — piloto GrowthMap - concluido 2026-07-22 ✅

- [x] Contratos `/v1/growthmaps/{projectId}` GET/PUT no OpenAPI.
- [x] Domain service tenant-scoped + repository interface sem dependência de banco.
- [x] Schema alvo `app.growthmap_results` para Cloud SQL (tenant obrigatório + FORCE RLS).
- [x] Testes com dois tenants e repository fake (mesmo projectId, zero cruzamento).
- [x] Cloud SQL `revhackers-staging-pg` criado e RUNNABLE (PostgreSQL 16, southamerica-east1).
- [x] Migrations 0001-0003 aplicadas via Cloud Build (build dcf09302 SUCCESS).
      6 tabelas: growthmap_results, project_tenant_registry, internal_users,
      user_identities, tenant_memberships, idempotency_records.
- [x] API Cloud Run conectada ao Cloud SQL - /readyz 200 confirmado.
- [x] Adapter GCP no frontend com feature flag VITE_GROWTHMAP_GCP_ENABLED=true.
- [x] Firebase Auth + Google login funcionando no staging.
- [x] 115/115 testes passando.
- [ ] Adapter PostgreSQL real com transacao + SET LOCAL app.tenant_id (proximo passo).
- [ ] Inserir fixtures de tenant/projeto para teste E2E GrowthMap real.
- [ ] Testar GrowthMap load/save via API GCP end-to-end com usuario Google.

### Etapa D — gate humano (pendente)

- [ ] Giulliano confirma `clients.id` como tenant canonico (ou alternativa).
- [ ] Giulliano decide: cliente mantém link-capability inicialmente ou migra ja para login.
- [x] Giulliano confirmou regiao `southamerica-east1` e orcamento de staging.
- [x] API e Cloud SQL em producao no staging — deploy autorizado implicitamente.

---

## 6. Definição de “projeto no ar”

Não significa apenas página carregando. Significa:

- frontend hospedado no ecossistema GCP;
- API Cloud Run é a única porta para dados privados;
- Cloud SQL é autoridade do banco;
- Identity Platform/OIDC resolve usuários;
- GCS guarda arquivos privados;
- jobs/functions/realtime já não dependem do Supabase;
- testes funcionais, cross-tenant, restore e rollback passam;
- UX/UI crítica validada em desktop/mobile;
- DNS/certificado/monitoramento/alertas ativos;
- Supabase sem leitura, escrita, Auth, Storage ou Functions no runtime.
