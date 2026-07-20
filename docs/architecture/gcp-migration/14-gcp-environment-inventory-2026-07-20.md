# Inventário GCP — estado observado em 2026-07-20

Consulta somente leitura realizada com `giulliano@usefunnels.io` após renovação da autenticação.
Nenhum projeto, API, recurso, billing ou IAM foi criado ou alterado nesta rodada.

## Projetos encontrados

| Projeto | Identificação observada | Recursos observados | Decisão |
|---|---|---|---|
| `juriai-app` | JuriAI | Cloud Run, Cloud SQL `juriai-db`, buckets de staging | Não reutilizar; produto separado |
| `revhackers-workspace-admin` | Administração Google Workspace | APIs administrativas, Storage/BigQuery; Cloud Run não habilitado | Não é runtime RevHackers |
| `winged-verbena-497317-u0` | Funnels AI Lab | APIs de IA, Sheets, Drive e observabilidade | Não reutilizar sem decisão explícita |
| `effective-hawk-69nlt` | Sem nome visível | Nenhuma finalidade confirmada | Não usar |
| `gen-lang-client-0509934040` | Default Gemini Project | Finalidade de laboratório/Gemini | Não usar como produção |
| `sys-34227969109215138405804384` | Projeto sem título | Finalidade não confirmada | Não usar |
| `sys-34290429701994457663397744` | Projeto sem título | Finalidade não confirmada | Não usar |

## Conclusão

Não há evidência de um projeto `revhackers-dev`, `revhackers-staging` ou
`revhackers-prod` já provisionado. A migração ainda não possui fundação GCP própria.

A consulta de billing não pôde ser concluída porque a Cloud Billing API está desabilitada
e habilitá-la seria uma alteração remota não autorizada. Nenhuma API foi habilitada para
resolver essa limitação.

## Próximo gate humano

Antes de criar qualquer recurso, Giulliano precisa aprovar:

1. criação ou escolha do projeto GCP dedicado da RevHackers;
2. conta de billing autorizada;
3. separação `staging`/`prod`;
4. região principal;
5. orçamento mensal e alertas;
6. IAM inicial e responsáveis por aprovação.

Até esse gate, o trabalho seguro permanece em contratos, fixtures sintéticas, testes e
documentação — sem Cloud SQL, buckets, secrets, DNS ou deploy.
