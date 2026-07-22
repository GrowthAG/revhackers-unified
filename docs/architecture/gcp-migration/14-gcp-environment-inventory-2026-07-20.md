# Inventário GCP — estado observado em 2026-07-20

Consulta iniciada em modo somente leitura com `giulliano@usefunnels.io` após renovação da
autenticação. Em seguida, com autorização para iniciar a fundação reversível, foram
habilitadas apenas as APIs de Cloud Run, Artifact Registry, Secret Manager e Cloud Build.
Foi criado apenas um repositório Docker e um serviço Cloud Run sintético privado para
smoke test; nenhum dado, secret, DNS ou IAM foi criado ou alterado.

## Projetos encontrados

| Projeto | Identificação observada | Recursos observados | Decisão |
|---|---|---|---|
| `juriai-app` | JuriAI | Cloud Run, Cloud SQL `juriai-db`, buckets de staging | Não reutilizar; produto separado |
| `revhackers-staging` | RevHackers Staging | Artifact Registry `revhackers-staging`; Cloud Run `revhackers-staging-smoke`; APIs fundacionais habilitadas | Primeiro ambiente dedicado |
| `revhackers-workspace-admin` | Administração Google Workspace | APIs administrativas, Storage/BigQuery; Cloud Run não habilitado | Não é runtime RevHackers |
| `winged-verbena-497317-u0` | Funnels AI Lab | APIs de IA, Sheets, Drive e observabilidade | Não reutilizar sem decisão explícita |
| `effective-hawk-69nlt` | Sem nome visível | Nenhuma finalidade confirmada | Não usar |
| `gen-lang-client-0509934040` | Default Gemini Project | Finalidade de laboratório/Gemini | Não usar como produção |
| `sys-34227969109215138405804384` | Projeto sem título | Finalidade não confirmada | Não usar |
| `sys-34290429701994457663397744` | Projeto sem título | Finalidade não confirmada | Não usar |

## Conclusão

No início da consulta não havia projeto dedicado. Durante esta rodada, foi criado
`revhackers-staging` na organização `usefunnels.io` e vinculado à conta de billing
`billingAccounts/016669-43980-E06832`, já usada pelo Funnels AI Lab. O projeto está
ativo, com Artifact Registry em `southamerica-east1` e o serviço privado
`revhackers-staging-smoke` na mesma região. O serviço usa a imagem pública de smoke test,
escala mínima zero/máxima um, e não contém dados ou secrets do produto. Ainda não há
Cloud SQL, buckets ou serviço real da aplicação.

Ainda não existe `revhackers-prod`.

Atualização de 2026-07-22: após reautenticação, o billing foi confirmado pelo CLI como ativo em `billingAccounts/016669-43980E-F06832`. O `billing/quota_project` local, que apontava incorretamente para `juriai-app`, foi corrigido para `revhackers-staging`. Foram habilitadas no staging as APIs Cloud Billing (`cloudbilling.googleapis.com`), Cloud SQL Admin (`sqladmin.googleapis.com`) e Identity Toolkit (`identitytoolkit.googleapis.com`). Habilitar as APIs não criou instância nem cobrança de runtime. O custo/sizing proposto para a primeira instância está em `15-cloud-sql-staging-sizing-2026-07-22.md`.

## Próximo gate humano

Antes de criar recurso faturável, Giulliano precisa aprovar:

1. o gate de custo do Cloud SQL staging (estimativa oficial em `15-cloud-sql-staging-sizing-2026-07-22.md`);
2. definir e criar `revhackers-prod` separadamente somente depois do piloto;
3. o primeiro serviço real já está definido: API GrowthMap;
4. IAM de workload, backup/restore e rollback descritos no gate de sizing.

Até o próximo gate, não devem ser criados Cloud SQL, buckets, secrets, DNS ou deploys de
produção. O serviço smoke permanece isolado e reversível.
