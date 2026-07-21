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

A consulta de billing não pôde ser concluída pelo CLI nesta sessão; o vínculo já está
registrado no checkpoint anterior. A Cloud Billing API não foi habilitada adicionalmente.

## Próximo gate humano

Antes de criar qualquer recurso, Giulliano precisa aprovar:

1. confirmar a região e orçamento de staging;
2. definir e criar `revhackers-prod` separadamente;
3. aprovar o primeiro serviço real a portar;
4. definir secrets, IAM de workload e rollback antes do deploy real.

Até o próximo gate, não devem ser criados Cloud SQL, buckets, secrets, DNS ou deploys de
produção. O serviço smoke permanece isolado e reversível.
