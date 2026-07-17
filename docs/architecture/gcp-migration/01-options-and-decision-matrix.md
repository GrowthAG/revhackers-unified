# Opções e matriz de decisão

## Premissas

- **Fato verificado:** a aplicação depende de Supabase Postgres/PostgREST, Auth, Storage, Realtime, RPCs, cron e Edge Functions.
- **Fato verificado:** tamanho, tráfego, custos, região, RTO/RPO e SLA não foram medidos nesta auditoria.
- **Decisão ainda não tomada:** não há aprovação para Cloud SQL, Identity Platform/Firebase Auth, Cloud Run, região, tier, alta disponibilidade ou data de migração.
- **Critério obrigatório:** o navegador nunca acessará Cloud SQL diretamente nem receberá credenciais de banco.

Os custos abaixo são relativos. Uma comparação monetária exige telemetria real, requisitos de disponibilidade, calculadora atualizada e preços negociados; nenhum valor foi inventado.

## Opções viáveis

### A. Manter Supabase temporariamente e endurecer o estado atual

Preserva frontend, Auth, PostgREST/RLS, Storage, Realtime, RPCs e Edge Functions. O trabalho imediato é fechar lacunas de inventário, schema drift, autorização, segredos, logs, testes e recuperação.

- **Custo relativo:** baixo incremento; custo atual não verificado.
- **Complexidade:** baixa para continuidade, média para corrigir dívida de segurança.
- **Segurança:** pode melhorar rapidamente, mas continua dependente de políticas RLS e configurações Supabase corretas.
- **Lock-in:** alto nas APIs Supabase atuais.
- **Latência:** menor risco de regressão porque o caminho atual é preservado.
- **Operabilidade:** conhecida pela equipe apenas por inferência; runbooks e métricas não estão comprovados.
- **Risco de migração:** mínimo agora; adia a redução de lock-in.

### B. Migração incremental por API, mantendo Supabase como sistema de registro durante a transição

Introduz uma API server-side, candidata a Cloud Run, na frente de domínios selecionados. O navegador migra por fatias da API Supabase para contratos próprios. Banco, Auth, Storage e Realtime permanecem no Supabase até cada substituto ser provado. Escritas críticas têm uma única autoridade por fase; dual-write só é admitido com idempotência e reconciliação comprovadas.

- **Custo relativo:** médio durante a coexistência.
- **Complexidade:** média/alta, distribuída em etapas controláveis.
- **Segurança:** melhora ao centralizar validação/autorização, mas cria duas superfícies temporárias.
- **Lock-in:** cai gradualmente; contratos HTTP próprios reduzem acoplamento do frontend.
- **Latência:** pode aumentar um salto por requisição; deve ser medida por domínio e região.
- **Operabilidade:** requer observabilidade e ownership novos, mas permite aprendizado antes do cutover de dados.
- **Risco de migração:** médio e controlável por canários, rollback por domínio e manutenção do sistema atual.

### C. Substituição completa por serviços gerenciados no Google Cloud

Arquitetura candidata: frontend estático; API/worker em Cloud Run; PostgreSQL gerenciado em Cloud SQL; identidade em Identity Platform/Firebase Auth ou outro emissor aprovado; objetos em Cloud Storage; jobs com Scheduler/Tasks/Pub/Sub; observabilidade nativa. Todos os acessos do navegador passam pela API.

- **Custo relativo:** indeterminado e potencialmente alto, sobretudo com coexistência, HA, banco superdimensionado, egress e logs.
- **Complexidade:** alta; exige reimplementar ou adaptar todas as capacidades Supabase inventariadas.
- **Segurança:** boa se a API, IAM, rede e banco forem corretamente projetados; risco alto se a migração remover RLS sem substituição testada.
- **Lock-in:** troca lock-in Supabase por serviços GCP, embora PostgreSQL e contratos próprios ofereçam alguma portabilidade.
- **Latência:** depende da colocação regional, cold starts, conexão ao banco e localização de usuários/terceiros.
- **Operabilidade:** maior controle, com mais responsabilidade por capacidade, conexões, backups, recuperação e incidentes.
- **Risco de migração:** alto sem fases e rehearsals; big-bang não é recomendado.

## Matriz comparativa

Escala: 1 é mais favorável/baixo; 5 é menos favorável/alto. Em “segurança alcançável” e “controle operacional”, 5 é melhor. As notas são inferências arquiteturais, não medições.

| Critério | Peso provisório | A: manter | B: incremental por API | C: substituição completa |
|---|---:|---:|---:|---:|
| Custo de transição | 15% | 1 | 3 | 5 |
| Complexidade de entrega | 15% | 2 | 3 | 5 |
| Segurança alcançável | 20% | 3 | 4 | 4 |
| Redução de lock-in | 10% | 1 | 4 | 4 |
| Risco de latência | 10% | 1 | 3 | 4 |
| Controle operacional | 10% | 2 | 4 | 5 |
| Risco de migração | 20% | 1 | 3 | 5 |

Uma soma ponderada não é apresentada porque os pesos não foram aprovados e várias entradas dependem de evidência ausente. Transformar números provisórios em falsa precisão prejudicaria a decisão.

## Decisão posterior à auditoria

Giulliano aprovou C como destino final: Google Cloud substituirá integralmente o Supabase. B foi aprovada como estratégia de entrega: migração incremental por API e por domínio, com coexistência temporária. A permanece somente como medida transitória para manter o sistema atual seguro enquanto seus substitutos são construídos.

**Não recomendado:** big-bang; conexão do navegador ao Cloud SQL; cópia de produção antes de aprovação; desligamento de Supabase antes de reconciliação e rollback comprovados; reescrita simultânea de Auth, banco, Storage, funções e frontend.

## Evidência necessária para decidir

**Perguntas abertas**

1. Qual problema de negócio a migração deve resolver e como será medido?
2. Qual é o custo atual completo do Supabase e integrações, separado por ambiente?
3. Qual é o perfil real de banco, Storage, Realtime e Edge Functions?
4. Qual unidade de tenant e quais papéis/permissões devem existir?
5. A organização aceita coexistência temporária e custo duplicado?
6. Quais RTO/RPO, SLA e residência de dados são obrigatórios?
7. Quais competências e carga de operação GCP estão disponíveis na equipe?
8. Auth precisa migrar, ou pode permanecer Supabase durante a primeira etapa?
9. Qual frontend/hosting futuro é desejado, se houver mudança?

## Gate de execução

O destino final deixou de ser provisório. A execução ainda depende de Giulliano aprovar por escrito: escopo da fase, orçamento, região, separação de ambientes, identidade, modelo de tenant, RTO/RPO, critérios de sucesso e limites de rollback. A decisão de migrar não autoriza por si só provisionamento ou acesso a produção; cada ação desse tipo requer checkpoint específico.
