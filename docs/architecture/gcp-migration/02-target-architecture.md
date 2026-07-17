# Arquitetura alvo candidata

## Status

Google Cloud foi aprovado como destino final e o Supabase será removido do runtime após a migração. Este documento descreve a arquitetura de referência incremental para chegar a esse estado. Serviços específicos, região, tier, alta disponibilidade e implantação real continuam sujeitos a decisão e checkpoint.

## Princípios obrigatórios

1. O navegador acessa somente endpoints públicos autenticados e armazenamento por URL pública controlada ou URL assinada de curta duração. Nunca acessa o banco nem recebe credenciais de banco.
2. Autenticação identifica o caller; autorização server-side decide a operação, o tenant e o recurso.
3. O backend não confia em `tenant_id`, papel ou ownership enviados pelo cliente sem revalidá-los.
4. Toda operação de banco ocorre com papel de mínimo privilégio, contexto de requisição transacional e trilha de auditoria.
5. O Supabase funcional permanece disponível até cada substituto passar por testes, reconciliação e rollback.
6. Dev, staging e produção não compartilham projetos, bancos, buckets, emissores, secrets ou service accounts.

## Trust boundaries e fluxo síncrono

```text
[Navegador não confiável]
        |
        | HTTPS + token de usuário
        v
[Borda/WAF/Load Balancer a decidir]
        |
        v
[API server-side candidata: Cloud Run]
  - valida token
  - resolve usuário/tenant/papel
  - valida payload e ownership
  - aplica autorização e rate limit
  - emite correlation/audit id
        |
        | identidade de workload + conexão privada/protegida
        v
[PostgreSQL gerenciado candidato: Cloud SQL]
  - papel sem superuser/BYPASSRLS
  - constraints e RLS/queries com tenant
  - sem exposição pública ao navegador
```

**Fato verificado:** hoje o browser fala diretamente com APIs Supabase e depende de RLS. **Inferência:** a API candidata deve começar como fachada para um domínio pequeno, mantendo Supabase atrás dela, antes de qualquer troca de banco.

## Componentes e responsabilidades

### Frontend

- Continuar como artefato estático React/Vite durante a primeira fase.
- Substituir chamadas Supabase por clientes de domínio tipados, endpoint por endpoint.
- Não tomar decisões de autorização; guards de rota servem apenas à experiência do usuário.
- Enviar token do emissor aprovado e correlation id; nunca enviar credenciais de serviço.
- Tratar publicações por token/slug como capacidades explícitas e de escopo mínimo, não como leitura ampla de tabela.

O hosting pode permanecer no destino atual durante a migração. Cloud Storage/CDN ou Firebase Hosting são opções futuras, não requisitos para migrar backend.

### API/backend

- Contratos HTTP versionados e validação de schema de entrada/saída.
- Middleware de autenticação, autorização, tenant, rate limit, idempotência e auditoria.
- Separação entre rotas de usuário, administração, webhooks e chamadas internas.
- Timeouts, limites de payload, retries somente para operações idempotentes e circuit breakers para terceiros.
- Conexões ao PostgreSQL limitadas por instância e pool dimensionado; concurrency do runtime precisa respeitar o teto do banco.
- Workload identity/IAM para serviços GCP; secrets obtidos no servidor.

### Banco

Se Cloud SQL for escolhido:

- PostgreSQL compatível com as extensões realmente necessárias e suportadas, validado por prova local/staging.
- Rede e método de conexão decididos por threat model; nenhum endereço/credencial no bundle do frontend.
- Papéis separados para migração, aplicação, leitura, jobs e break-glass.
- Aplicação sem superuser, owner ou `BYPASSRLS`.
- Contexto confiável de usuário e tenant definido pelo backend dentro da transação; nunca por SQL arbitrário do cliente.
- Constraints, chaves estrangeiras, unicidade, índices, triggers e RPCs portados somente após inventário de comportamento.
- `SECURITY DEFINER` evitado; quando indispensável, owner dedicado, `search_path` fixo, argumentos validados, `EXECUTE` explicitamente concedido e negado ao público por padrão.

### Identidade

Duas rotas são compatíveis com a fase incremental:

1. manter Supabase Auth e fazer a API validar tokens Supabase;
2. migrar depois para Identity Platform/Firebase Auth ou outro OIDC aprovado.

A API deve isolar o provedor por uma camada de verificação e mapear `issuer + subject` para um usuário interno. Assim, mudança de emissor não altera o modelo de autorização. Migração de senha, OTP, convites, recovery, templates, redirects e sessões exige projeto próprio e não deve ser misturada ao cutover do banco.

### Storage

- Objetos privados por padrão em bucket por ambiente.
- Upload preferencial por URL assinada de curta duração após autorização da API, com limite de tamanho, tipo, checksum e chave prefixada por tenant/recurso.
- Download público somente para ativos explicitamente públicos; URLs persistidas precisam de estratégia de remapeamento.
- Metadados/ownership no banco; verificação antivírus ou de conteúdo conforme risco.
- Migração preserva bytes, MIME type, nome, tamanho, checksum, metadata e política de acesso.

### Realtime

Os seis usos observados devem ser classificados por requisito:

- polling/refresh para estados tolerantes a atraso;
- SSE ou WebSocket por API para interação realmente em tempo real;
- Pub/Sub como barramento interno, não canal de autorização para navegador.

O canal server-side precisa autorizar subscription e filtrar por tenant/recurso. A publicação genérica de mudança de tabela não deve ser copiada sem análise.

### Jobs e integrações assíncronas

- Cloud Scheduler é candidato para agendas; Cloud Tasks para chamadas com retry/idempotência; Pub/Sub para fan-out/eventos. A escolha é por semântica, não por preferência.
- Webhooks públicos validam assinatura/segredo, timestamp quando suportado, replay window, tamanho, content type e idempotency key antes de efeitos.
- Jobs longos de IA, transcrição e provisionamento devem sair do request síncrono quando excederem limites definidos.
- Cada terceiro terá sandbox, quotas, timeout, política de retry e dead-letter documentados.

### Observabilidade

- Logs estruturados com `environment`, `service`, `version`, `request_id`, `tenant_hash`, operação e resultado; sem token, segredo, payload integral ou PII desnecessária.
- Métricas de taxa, erro, duração, saturação, conexões, filas, retries, webhook duplicates, custos e consumo de terceiros.
- Traces entre frontend/API/jobs/terceiros com sampling e redação.
- Auditoria separada de logs operacionais, imutável dentro do período aprovado e consultável por acesso controlado.

## Separação de ambientes

| Aspecto | Dev | Staging | Produção |
|---|---|---|---|
| Dados | sintéticos | sintéticos ou mascarados com aprovação | reais, acesso restrito |
| Projeto/cloud boundary | dedicado | dedicado | dedicado |
| Identidade | issuer/client próprio | issuer/client próprio | issuer/client próprio |
| Banco e Storage | próprios | próprios | próprios |
| Integrações | mocks/sandbox | sandbox | endpoints reais aprovados |
| Secrets/IAM | sem compartilhamento | sem compartilhamento | mínimo privilégio e break-glass |
| Deploy | livre dentro de guardrails | promoção aprovada | checkpoint humano |

**Pergunta aberta:** a topologia de projetos GCP e contas de faturamento ainda precisa de decisão humana e estimativa de impacto.

## Região, capacidade e disponibilidade

Nenhuma região ou configuração é proposta como fato. A decisão deve usar:

- localização atual dos dados e usuários;
- residência/contratos e integrações externas;
- latência medida entre frontend, API, banco e terceiros;
- tamanho, IOPS, CPU, memória, conexões e crescimento reais;
- RTO/RPO e necessidade de HA/read replicas;
- custo de computação, armazenamento, backups, egress e logs.

Sem essa evidência, tier, HA e região permanecem **não verificados**.

## Fluxo de transição

1. Browser continua usando Supabase para domínios não migrados.
2. Um domínio piloto passa a chamar a nova API.
3. Inicialmente, a API pode usar Supabase como backend, centralizando autorização e contrato.
4. Em staging, o mesmo contrato é validado contra PostgreSQL/Storage candidatos.
5. Somente após paridade, reconciliação e rollback o domínio muda sua autoridade de escrita.

Essa sequência reduz acoplamento sem declarar a infraestrutura final antes da evidência.

## Perguntas abertas de arquitetura

- Qual é o aggregate/tenant boundary e como usuários pertencem a ele?
- Quais rotas públicas por token/slug são requisitos legítimos?
- Quais operações precisam de transação multi-tabela ou consistência forte?
- Quais seis fluxos Realtime exigem baixa latência?
- Quais Edge Functions excedem limites de request e precisam de jobs?
- Quais extensões PostgreSQL são obrigatórias e suportadas no serviço escolhido?
- O Auth permanece Supabase durante o primeiro cutover?
- Qual frontend hosting e borda serão mantidos?
