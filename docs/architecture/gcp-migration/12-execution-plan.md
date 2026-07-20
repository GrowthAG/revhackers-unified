# Plano de execução imediato — RevHackers → Google Cloud

Atualizado em 2026-07-20. Este plano organiza a continuidade sem provisionar recursos,
alterar DNS ou desativar Supabase antes dos gates aprovados.

## Estado confirmado

- Destino aprovado: Google Cloud, migração incremental.
- Supabase continua sendo o runtime de produção até o cutover e a estabilização.
- Inventário técnico: 61 tabelas, 31 Edge Functions versionadas ativas no código, 47 funções observadas remotamente (incluindo legadas), 7 buckets e zero cron jobs ativos.
- Correções de segurança de banco e Storage foram aplicadas em produção e versionadas localmente.
- R1 (`ai_usage_log`) foi implementado localmente; o deploy das Edge Functions instrumentadas ainda não foi feito.
- O repositório local está 17 commits à frente de `origin/main`.
- Nenhum projeto GCP de produção/staging foi provisionado por este plano.

## Ordem de execução

### Fase A — higiene e sincronização

1. Trocar a senha Google exposta no histórico da conversa e revogar tokens temporários.
2. Revisar os três arquivos que contêm JWTs históricos e completar E0-T7 no provedor emissor.
3. Rodar CI local e revisar o diff completo.
4. Fazer push dos 17 commits para `origin/main`.
5. Confirmar o resultado do CI; não fazer deploy automático.

### Fase B — decisões mínimas de arquitetura

1. Aprovar `clients.id` como tenant canônico ou registrar uma alternativa.
2. Decidir se clientes continuam acessando por links-capability ou ganharão login no GCP.
3. Registrar RTO, RPO, retenção, residência/LGPD e janela de abort.
4. Medir custo atual de Supabase, Hostinger e terceiros por período definido.

### Fase C — fundação local (E4)

1. Criar contratos TypeScript/OpenAPI para `tenant`, `membership`, `resource` e `audit event`.
2. Criar um adapter de identidade sem dependência de Supabase, usando tokens sintéticos nos testes.
3. Criar matriz negativa com dois tenants e papéis `owner`, `admin`, `operator` e `client-link`.
4. Implementar idempotência, correlation ID, redaction e erro padronizado localmente.
5. Validar tudo com fixtures sintéticas; nenhum segredo ou dado real.

### Fase D — primeiro piloto GCP

Só depois das fases B/C e de aprovação explícita:

1. Criar `revhackers-staging` com orçamento, IAM mínimo e observabilidade.
2. Restaurar fixture sintética.
3. Publicar uma API de baixo risco em Cloud Run.
4. Exercitar rollback e reconciliação.

## Fora de escopo agora

- Migrar ou desligar Supabase.
- Alterar MX/DNS do Workspace.
- Fazer deploy do antigo `fathom-webhook`; Fathom está descontinuado. A integração de reuniões será baseada em Google Meet/Calendar/Drive e Gemini, com migração própria.
- Criar Cloud SQL, buckets ou credenciais GCP.
- Corrigir o login do alias `@revhackers.com.br`; esse tema fica separado.
- ClickUp foi removido do código ativo; tabelas e históricos ficam preservados até o gestor operacional próprio ser definido.

## Decisão de reuniões — Google Meet/Gemini

- **Fica:** Google Workspace/Meet como origem oficial de gravações e transcrições; Calendar para agenda; Drive para arquivos; Gemini para notas, resumos e inteligência nativa quando disponível na licença.
- **Fica, mas será redesenhado:** `meeting_recordings`, `client_meetings`, `google-meetings` e `analyze-meeting-transcript`, mantendo o modelo interno como camada de aplicação e não como nova fonte de gravação.
- **Revisar antes de portar:** `transcribe-meeting` e `process-meeting-audio`. O caminho primário deve consumir transcrição/artefato do Meet/Drive; Whisper ou áudio enviado manualmente só permanece como fallback explícito, com custo e consentimento controlados.
- **Sai:** Fathom webhook, chamadas, secrets, campos novos e qualquer fluxo que dependa de evento Fathom. A coluna histórica `fathom_meeting_id` não será removida agora para preservar dados; será tratada em uma migration de limpeza somente após confirmar que não há dados históricos necessários.
- **Removido:** ClickUp não será portado. O gestor operacional próprio do ecossistema RevHackers ainda será especificado. O GrowthHub permanece separado como benchmark/plataforma de pesquisa a implementar. Tabelas e histórico ClickUp permanecem somente para preservar dados durante a transição.
- **Não presumir:** Gemini não é automaticamente uma API de ingestão para o produto. Primeiro devemos confirmar quais artefatos a licença gera e onde ficam (Meet/Drive), depois definir o conector autorizado.

## Critérios de avanço

- Nenhuma mudança cloud sem pedido com projeto, custo, IAM, rollback e validação.
- Nenhum cliente real usado como fixture.
- Todo contrato novo tem teste cross-tenant negativo.
- O mesmo artefato é promovido entre ambientes.
- Supabase só sai depois de paridade funcional, reconciliação, restore e rollback aprovados.
