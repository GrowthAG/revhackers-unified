# Manifesto de desativação — edge functions órfãs (InfinitePay, Fathom, ClickUp)

Data: 2026-07-20. Projeto Supabase: `eqspbruarsdybpfeijnf` (REVHACKERS - DataBase).

Contexto: o código local que chamava estas functions foi removido em uma sessão
anterior (53 arquivos, ainda não commitados nesta sessão, working tree preservado
por instrução explícita de Giulliano). As functions abaixo continuavam `ACTIVE`
em produção, sem nenhum caller local, verificado por:
- `grep` em `src/` e `supabase/functions/`: zero referência ativa (exceto
  `types.ts` gerado e 2 URLs de conteúdo estático do ClickUp Docs, não é
  chamada de API).
- `get_logs(service=edge-function)`: zero invocações de qualquer edge function
  nas últimas 24h.
- `cron.job`: vazio, nenhum job agendado chamando estas functions.
- `clickup_config.webhook_secret`: existe (configurado em 2026-04-15), o que
  significa que pode haver uma inscrição de webhook ainda ativa do lado do
  ClickUp apontando para `clickup-sync` — não verificável sem acesso ao
  dashboard do ClickUp. Risco residual registrado.

## Ação tomada

Para cada function abaixo: código-fonte original salvo neste diretório
(`<slug>.index.ts`), depois a function foi **redeployada com um stub que
responde 410 Gone** a qualquer requisição, preservando o `verify_jwt` original.
Isso não apaga a function nem sua configuração/URL/secrets — apenas neutraliza
o comportamento. Reversível a qualquer momento redeployando o arquivo original
salvo aqui (ou revertendo via `deploy_edge_function` com o conteúdo original).

Nenhuma tabela, coluna, migration ou dado histórico foi tocado.

## Tabela

| Function | verify_jwt original | Callers locais confirmados | Risco antes de desativar | Ação |
|---|---|---|---|---|
| infinitepay-webhook | false | Nenhum | **Alto** — endpoint público, processa "pagamento aprovado" e mexe em `proposals`/`opportunities`/cria projeto/cliente sem nenhuma validação de assinatura do provedor | Desativado |
| infinitepay-create-link | false | Nenhum | Médio — proxy para API externa da InfinitePay, sem side-effect direto no banco | Desativado |
| infinitepay-checkout | false | Nenhum | **Alto** — processa cartão/PIX, marca `proposals.status = 'paid'` sem validação de assinatura | Desativado |
| fathom-webhook | false | Nenhum | Médio — grava `meeting_recordings`/`orqflow_tasks`, já corrigido para falhar fechado sem secret nesta sessão anterior, mas ainda aceita qualquer payload se secret vazar | Desativado |
| fathom-sync | true (exige usuário autenticado) | Nenhum | Baixo — exige login válido, mas chama API do Fathom que não existe mais para a empresa | Desativado |
| clickup-orchestrator | false | Nenhum | Médio — cria folder no ClickUp e grava `clickup_integrations` a partir de `project_id` sem autenticação | Desativado |
| clickup-sprint-orchestrator | false | Nenhum | Médio — cria Lists/Tasks no ClickUp a partir de `project_id` sem autenticação | Desativado |
| clickup-provision | false | Nenhum | Médio — mesmo padrão, state machine de provisionamento completa | Desativado |
| clickup-sync | true (mas valida HMAC próprio, fail-closed se secret ausente) | Nenhum caller local; **possível webhook externo real ainda registrado no ClickUp** (ver risco residual) | Baixo-médio | Desativado |
| clickup-update-docs-link | true | Nenhum | Baixo — exige login, só atualiza descrição de task no ClickUp | Desativado |
| clickup-notetaker-sync | false | Nenhum | Médio — sem autenticação, mas depende de `CLICKUP_API_KEY` que provavelmente já não é válida | Desativado |

## Risco residual não resolvido por esta ação

- **Webhook do ClickUp pode continuar registrado do lado deles**, apontando
  para `clickup-sync`. Como a function agora responde 410 a qualquer chamada,
  isso não representa mais risco de execução — só vai gerar erro do lado do
  ClickUp (que não temos mais acesso pra desregistrar, o script
  `register-clickup-webhook.js` foi removido). Sem impacto de segurança, só
  ruído/log de erro do lado deles.
- Mesma lógica se aplica a qualquer webhook configurado no painel da
  InfinitePay ou Fathom apontando para essas URLs — passam a receber 410 em
  vez de serem processados.
