# Inventário GCP — estado observado em 2026-07-20

Consulta iniciada em modo somente leitura com `giulliano@usefunnels.io` após renovação da
autenticação. Em seguida, com autorização para iniciar a fundação reversível, foram
habilitadas apenas as APIs de Cloud Run, Artifact Registry, Secret Manager e Cloud Build.
Nenhum recurso de runtime, dado, secret, DNS ou IAM foi criado ou alterado.

## Projetos encontrados

| Projeto | Identificação observada | Recursos observados | Decisão |
|---|---|---|---|
| `juriai-app` | JuriAI | Cloud Run, Cloud SQL `juriai-db`, buckets de staging | Não reutilizar; produto separado |
| `revhackers-staging` | RevHackers Staging | Billing vinculado; APIs fundacionais habilitadas; nenhum runtime provisionado | Primeiro ambiente dedicado |
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
ativo e possui as APIs fundacionais habilitadas, mas ainda não possui Cloud Run, Cloud SQL,
buckets, secrets ou deploys.

Ainda não existe `revhackers-prod`.

A consulta de billing não pôde ser concluída pelo CLI nesta sessão; o vínculo já está
registrado no checkpoint anterior. A Cloud Billing API não foi habilitada adicionalmente.

## Próximo gate humano

Antes de criar qualquer recurso, Giulliano precisa aprovar:

1. confirmar `revhackers-staging` como alvo autorizado;
2. definir e criar `revhackers-prod` separadamente;
3. separar `staging`/`prod`;
4. região principal;
5. orçamento mensal e alertas;
6. IAM inicial e responsáveis por aprovação.

Até o próximo gate, o trabalho seguro permanece em contratos, fixtures sintéticas, testes
e documentação — sem Cloud SQL, buckets, secrets, DNS ou deploy.
