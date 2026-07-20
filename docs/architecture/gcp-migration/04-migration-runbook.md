# Runbook de migração — planejamento

## Natureza deste documento

Este é um plano de fases e gates. Não contém comandos de execução e não autoriza acesso a produção, exportação, provisioning, deploy, secrets, DNS ou cutover. Qualquer ação real dessas categorias requer aprovação explícita de Giulliano com alvo, custo/impacto, rollback e validação.

## Regras de segurança

1. Supabase permanece funcional até substituto testado e rollback aprovado.
2. Produção não é fonte de experimento; POC usa dados sintéticos.
3. Uma única autoridade de escrita existe por domínio em cada fase.
4. Nenhum navegador acessa Cloud SQL.
5. Auth, banco, Storage e frontend não mudam simultaneamente.
6. Toda promoção depende de evidência, não apenas de exit code.
7. Falha de reconciliação, isolamento, restore ou rollback interrompe a fase.

## Fase 0 — descoberta e decisão

### Atividades planejadas

- Obter, com autorização, inventário de schema efetivo por ambiente: tabelas, colunas, constraints, indexes, sequences, views, functions, triggers, policies, grants, owners, extensions, cron e publicação Realtime.
- Inventariar configurações de Auth, templates, providers, redirects, hooks, usuários e relações de perfil sem exportar valores nesta fase.
- Inventariar buckets, políticas, objetos, metadata, URLs persistidas e acessos públicos.
- Mapear 31 Edge Functions versionadas, seus callers, auth, service role, terceiros, timeout, retry, idempotência e volume.
- Medir banco, conexões, consultas, IOPS, tráfego, Realtime, Storage e custos.
- Resolver drift entre migrações e tipos gerados.
- Aprovar modelo de tenant, papéis, opção arquitetural, RTO/RPO, região e orçamento.

### Gate

- Inventários reconciliados e assinados.
- Nenhuma métrica não verificada usada para sizing.
- Matriz de dados/PII e requisitos de residência/retention aprovada.
- Riscos críticos do sistema atual tratados ou aceitos explicitamente.

## Fase 1 — prova local com dados sintéticos

### Escopo sugerido

Escolher um domínio de baixo risco, sem pagamento, Auth migration, Storage em massa ou integração irreversível. Construir um contrato de API pequeno que inicialmente possa operar contra Supabase e uma implementação candidata contra PostgreSQL local.

### Evidência requerida

- Contrato e validação de payload.
- Token fake/issuer local ou fixture segura; nenhum segredo real.
- Contexto de usuário/tenant transacional.
- Testes positivos e negativos de dois tenants.
- Paridade de constraints, erros e transações relevantes.
- Medição básica de latência e uso de conexão.
- Plano de remoção/rollback do piloto.

### Gate

POC local reprodutível com dados sintéticos, sem dependência de produção e sem conexão direta do browser ao banco.

## Fase 2 — fundação de staging

### Checkpoint humano prévio

Antes de criar qualquer recurso pago ou configurar Firebase/Cloud Run, solicitar aprovação escrita com:

- ação e recursos exatos;
- projeto/ambiente alvo;
- estimativa de custo e quotas;
- IAM e secrets envolvidos;
- rollback/remoção;
- testes e evidência esperada.

### Atividades após aprovação

- Criar separação completa de staging.
- Aplicar schema candidato a partir de fonte versionada e revisada.
- Usar dados sintéticos ou conjunto mascarado aprovado.
- Configurar observabilidade, budgets, backups e restore antes da aplicação.
- Implantar apenas a fatia piloto e mocks/sandboxes de terceiros.

### Gate

- Infraestrutura revisada por outra pessoa.
- Restore de staging demonstrado.
- Nenhum segredo no código, imagem ou logs.
- Testes de tenant, papel, webhook e pool aprovados.

## Fase 3 — migração de contratos por domínio

Para cada domínio:

1. documentar comportamento atual e owner;
2. criar contrato de API e matriz de autorização;
3. colocar a API na frente do backend atual;
4. migrar leituras do frontend por feature flag;
5. observar erros/latência e comparar respostas;
6. migrar escrita somente após idempotência e transações estarem provadas;
7. manter caminho de rollback enquanto não houver divergência.

Ordem deve ser escolhida por risco. Funções administrativas, pagamentos, Auth e automações de terceiros ficam depois de fluxos somente leitura/baixo impacto.

### Gate por domínio

- Testes de contrato e isolamento verdes.
- Métricas dentro de limites aprovados.
- Logs sem PII/segredos.
- Rollback exercitado.
- Owner de negócio aceita paridade funcional.

## Fase 4 — rehearsal de dados e objetos

Rehearsals ocorrem em staging e repetem o processo completo com tempo medido.

### Banco

- Capturar ponto consistente e registrar watermark.
- Transferir schema e dados com ferramenta aprovada.
- Preservar tipos, timezones, defaults, sequences, constraints, indexes e ownership lógico.
- Aplicar deltas por mecanismo escolhido e provar idempotência.
- Analisar extensões incompatíveis e substituir comportamento, não apenas sintaxe.

### Storage

- Copiar objetos preservando bytes, tamanho, MIME type, metadata e checksum.
- Mapear bucket/key antigo para novo e identificar URLs persistidas.
- Testar objetos públicos, privados, signed URL, upload, delete e expiração.
- Repetir incrementalmente sem duplicar ou tornar público o que era privado.

### Auth

Auth tem rehearsal separado. Deve provar migração/convivência de identidade, convites, OTP, recovery, sessão, desativação e mapping `issuer+subject`. Senhas não são presumidas portáveis. Se Auth permanecer Supabase, validar tokens no novo backend e documentar dependência.

### Edge Functions/jobs

- Classificar cada função em HTTP síncrona, webhook, job, cron ou worker.
- Executar testes com terceiros em sandbox/mocks.
- Validar retries, duplicatas, timeout, rate limit e dead-letter.
- Substituir chamadas internas por identidade de workload e contratos versionados.

### Gate do rehearsal

- Duração cabe na janela proposta com margem aprovada.
- Nenhuma divergência inexplicada.
- Restore e rollback executados no ambiente de ensaio.
- Runbook tem owners, tempos, checkpoints e critérios de abort.
- Pelo menos dois rehearsals consecutivos aprovados antes de produção.

## Reconciliação

### Banco

Para cada tabela/partição lógica:

- contagem total e por tenant/status/período;
- mínimos/máximos de chaves e timestamps;
- soma/estatísticas de campos financeiros quando semanticamente válidas;
- checksums por chunks ordenados, com serialização canônica de `NULL`, timezone, decimal, JSON e bytes;
- duplicatas em chaves naturais/únicas;
- órfãos de FK e constraints inválidas;
- valor das sequences acima da maior chave correspondente;
- amostra determinística de linhas e relações;
- resultado funcional de RPCs/views/triggers críticos.

Checksums diferentes não são aceitos como “erro de formatação” sem investigação e regra documentada. Dados mutáveis exigem watermark e delta para comparar o mesmo ponto lógico.

### Storage

- contagem por bucket/prefixo;
- soma de bytes;
- checksum de cada objeto ou amostra somente quando o provedor não permitir total, com risco aceito;
- metadata/MIME/ACL esperada;
- referências do banco resolvendo para objeto existente;
- nenhum objeto privado acessível anonimamente.

### Auth e autorização

- usuários ativos/inativos e memberships por estado;
- mapping de identity para usuário sem colisões;
- matriz de acesso positiva e negativa;
- sessões antigas conforme política aprovada;
- convites/recovery/links públicos com expiração e revogação.

### Aceitação

Os limiares numéricos de erro, latência, disponibilidade e duração são **perguntas abertas** e precisam ser aprovados antes do rehearsal. Para dados financeiros, identidade e autorização, divergência inexplicada deve ser zero.

## Preparação de cutover

### Checkpoints obrigatórios

- aprovação para acesso/exportação de produção;
- aprovação para recursos/custos de produção;
- aprovação para secrets/credenciais;
- aprovação para deploy real;
- aprovação separada para DNS, domínio ou configuração de entrega;
- reunião go/no-go com owners técnicos e de negócio.

### Plano a preencher antes do go/no-go

- janela e timezone;
- owner por etapa e canal de incidente;
- freeze ou estratégia de delta/CDC;
- watermark final;
- feature flags e percentuais de canário;
- dashboards e alertas;
- critérios de abort;
- tempo máximo para rollback;
- comunicação aos usuários;
- retenção segura do sistema antigo.

## Cutover planejado

Sequência conceitual, somente após aprovações:

1. confirmar saúde e backup/restore dos dois lados;
2. aplicar freeze ou capturar watermark conforme estratégia;
3. transferir delta final;
4. executar reconciliação bloqueante;
5. habilitar canário de leitura e depois escrita para a fatia aprovada;
6. observar métricas e auditoria;
7. expandir gradualmente ou abortar;
8. manter Supabase preservado e acessível ao rollback.

O roteamento de escrita precisa ser uma máquina de estados por domínio/tenant, registrada em ledger e protegida por epoch/fencing token. O lado não autoritativo deve rejeitar novas escritas. Feature flag sem fencing não é controle suficiente para canário ou rollback.

## Rollback

### Condições de acionamento

- vazamento ou falha de isolamento;
- erro de autorização/autenticação;
- divergência de dados;
- perda/duplicação de webhook ou pagamento;
- latência/erro acima do limite aprovado;
- saturação de banco/conexões;
- ausência de logs/auditoria essenciais;
- falha de delta ou impossibilidade de reconciliar.

### Estratégia

- parar expansão e novas escritas no alvo;
- preservar evidência e watermark;
- bloquear o writer alvo pelo novo epoch/fencing token;
- reconciliar e aplicar o delta reverso por processo aprovado;
- verificar a integridade reconciliada;
- somente então reabrir a escrita Supabase com epoch autoritativo novo;
- comunicar e abrir incidente/postmortem.

Dual-write torna rollback bidirecional e perigoso. Se usado, exige ledger de operações, idempotency key, ordem, replay e ferramenta de reconciliação provados antes.

O destino final aprovado exige desativar o Supabase. Essa desativação só pode ocorrer após período de estabilização aprovado, backup restaurável, reconciliação final e decisão humana separada. Deleção nunca faz parte do cutover inicial e exige autorização própria após retenção e auditoria.

## Registro de evidência

Cada fase deve guardar: versão de código/schema, origem dos dados, horário/watermark, responsáveis, configurações não secretas, resultados completos, divergências, aprovações, rollback exercitado e riscos residuais. Exit code sem inspeção não satisfaz o gate.
