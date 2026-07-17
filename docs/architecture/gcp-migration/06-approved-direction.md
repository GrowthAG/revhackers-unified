# Direção arquitetural aprovada

## Decisão

Em 16 de julho de 2026, Giulliano definiu a direção final:

- toda a infraestrutura do RevHackers será migrada para Google Cloud;
- o Supabase não permanecerá como dependência de runtime no estado final;
- o projeto Supabase será desativado somente após migração, reconciliação, estabilização e aprovação específica de decommission.

Esta decisão encerra a comparação sobre o destino final. A discussão restante é como realizar a substituição com segurança, quais serviços GCP usar e em que ordem.

## Distinção obrigatória

Destino final e estratégia de execução são decisões diferentes:

- Destino final aprovado: Google Cloud sem Supabase em runtime.
- Estratégia aprovada: migração incremental, por domínio, com coexistência temporária.
- Não aprovado: big-bang, acesso direto do navegador ao banco ou desligamento antecipado do Supabase.

A coexistência é uma ferramenta de migração, não a arquitetura permanente.

## Capacidades que precisam ser substituídas

| Capacidade atual | Destino candidato no Google Cloud | Estado |
|---|---|---|
| Supabase Postgres/PostgREST | Cloud SQL PostgreSQL acessado por API server-side | serviço candidato; desenho detalhado pendente |
| Supabase Auth | Identity Platform/Firebase Auth ou OIDC aprovado | decisão de produto e plano de migração pendentes |
| Edge Functions | Cloud Run Services e Cloud Run Jobs | classificação das 39 funções pendente |
| Supabase Storage | Cloud Storage | inventário e remapeamento de URLs pendentes |
| Supabase Realtime | SSE/WebSocket por backend e Pub/Sub quando aplicável | classificação dos seis fluxos pendente |
| RPCs e triggers | API, jobs e funções PostgreSQL revisadas | inventário comportamental pendente |
| pg_cron e chamadas HTTP | Cloud Scheduler, Tasks, Jobs ou Pub/Sub | desenho por semântica pendente |
| secrets | Secret Manager e workload identity | política e rotação pendentes |
| observabilidade | Cloud Logging, Monitoring e Trace | SLOs e retenção pendentes |
| entrega do frontend | serviço GCP apropriado para artefato estático | escolha pendente |

Nenhum item desta tabela autoriza provisionamento.

## Critérios de extinção do Supabase

O Supabase somente poderá ser desativado quando todos os critérios abaixo tiverem evidência:

1. Nenhum fluxo de produção usa PostgREST, Auth, Storage, Realtime, RPC ou Edge Functions do Supabase.
2. Não existem imports ou variáveis de runtime Supabase no frontend e backend ativos.
3. Usuários, memberships, sessões e fluxos de recovery/convite foram migrados ou substituídos.
4. Banco e objetos foram reconciliados por contagem, checksum e testes funcionais.
5. Testes cross-tenant e de elevação de privilégio passam no ambiente alvo.
6. Jobs, cron, webhooks e integrações externas foram transferidos e observados.
7. Backups e restore do Google Cloud foram ensaiados.
8. Cutover e rollback foram exercitados em staging.
9. Produção passou pelo período de estabilização aprovado.
10. Export final, retenção legal e plano de auditoria foram aprovados.
11. Giulliano autorizou separadamente a desativação e eventual exclusão do projeto Supabase.

## Próximas decisões necessárias

- modelo canônico de tenant e papéis;
- topologia de projetos GCP para dev, staging e produção;
- região, RTO, RPO, disponibilidade e orçamento;
- provedor de identidade e método de migração dos usuários;
- formato da API e estratégia de contratos;
- domínio piloto;
- ordem de migração das 39 funções;
- retenção e prazo de decommission.

## Guardrail

A aprovação do destino final não é aprovação automática para billing, criação de projeto, Cloud SQL, Cloud Run, Identity Platform, Secret Manager, acesso à produção, deploy, DNS, cutover ou exclusão. Cada ação externa mantém seu checkpoint humano.
