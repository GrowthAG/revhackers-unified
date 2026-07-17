# Autenticação, autorização e isolamento de tenant

## Estado atual verificado

### Supabase Auth

- O cliente usa sessão persistida, refresh automático e detecção de sessão na URL.
- Fluxos encontrados: senha, OTP/magic link por e-mail, recuperação, atualização de senha, logout e convite administrativo.
- Cadastro público é bloqueado no cliente.
- `profiles` fornece papel e dados de perfil. Os papéis consumidos pelo frontend são `super_admin`, `admin` e `user`; algumas políticas SQL também mencionam `analyst`.
- `ProtectedRoute` exige usuário e bloqueia `user` em rotas internas, mas esse guard não protege API nem banco.
- Edge Functions misturam três padrões: validação explícita com `getUser`, helper compartilhado com consulta de papel e dependência do `verify_jwt` do gateway. Muitas elevam para service role depois da entrada.

### RLS

- As migrações usam `auth.uid()` e `auth.role()` para políticas, triggers e proteção contra elevação de papel.
- Não há uso detectado de `auth.jwt()` no histórico.
- Há políticas de ownership por usuário e papel, mas também muitas políticas históricas amplas para `authenticated`, `anon` ou `service_role`.
- O histórico contém organizações, clientes, contas de cliente e projetos em diferentes pontos; tipos gerados e migrações divergem.
- Não foi identificado um modelo único e comprovado de tenant aplicado a todas as tabelas.

**Inferência:** o sistema tem autorização por papel e alguns controles por usuário/recurso, mas o repositório não prova isolamento end-to-end entre tenants. “Usuário autenticado” não equivale a “usuário autorizado para este tenant”.

## Modelo alvo a decidir

Antes de implementar, Giulliano precisa aprovar a unidade canônica de tenant e as relações. Um modelo candidato, ainda não decidido, é:

```text
identity (issuer, subject)
        -> user
        -> tenant_membership (tenant_id, role, status)
        -> resource (tenant_id, ...)
```

Regras propostas:

1. Todo recurso privado tem `tenant_id` não nulo ou relação inequívoca até um tenant.
2. Membership ativa e papel são consultados server-side.
3. `tenant_id` do body/query nunca é autoridade; é comparado com o tenant resolvido.
4. Papéis globais, se existirem, são raros, auditados e separados de papéis por tenant.
5. Links públicos são capacidades opacas, com hash armazenado, escopo mínimo, expiração, estado e revogação.
6. Jobs e webhooks carregam tenant derivado de registro interno, não de campo externo não confiável.

**Perguntas abertas**

- `organization`, `client_account`, `client` ou `rei_project` é o tenant?
- Um usuário pode pertencer a vários tenants? Com papéis diferentes?
- `super_admin` é global; `admin` é global ou por tenant?
- Clientes devem ler apenas seu projeto, todos os projetos da conta ou uma organização inteira?
- Quais páginas públicas por slug/token precisam permanecer anônimas?

## Verificação de token proposta

A API deve validar, em cada requisição protegida:

1. formato e algoritmo permitido;
2. assinatura contra chave confiável/JWKS com cache e rotação segura;
3. emissor e audiência exatos do ambiente;
4. expiração e `not-before`, com tolerância de relógio definida;
5. tipo/uso do token quando o provedor distinguir ID e access token;
6. revogação/estado do usuário quando necessário para ações sensíveis;
7. mapeamento de `issuer + subject` para usuário interno ativo.

Claims de papel ou tenant podem acelerar a decisão, mas autorização mutável deve ser confirmada em fonte server-side ou ter estratégia explícita de invalidação. Token válido sem membership válida resulta em `403`.

Chamadas internas usam identidade de workload e audience própria. Webhooks usam assinatura/segredo do provedor, replay protection e idempotência; não fingem ser usuário final.

## Autorização proposta

Para cada endpoint, uma policy de aplicação define:

- ação (`read`, `create`, `update`, `delete`, `approve`, `administer`);
- tipo e identificador do recurso;
- tenant resolvido;
- papéis/atributos aceitos;
- estado do recurso e campos mutáveis;
- regra para acesso público, se houver;
- evento de auditoria.

O backend carrega o recurso pelo par `(tenant_id, resource_id)` sempre que possível. Consultar apenas por `resource_id` e filtrar depois facilita IDOR e deve ser evitado.

## Substituição segura de helpers Supabase no PostgreSQL

`auth.uid()` e `auth.role()` são helpers do ambiente Supabase/PostgREST; não surgem automaticamente no Cloud SQL.

Padrão candidato:

1. A API valida o token e resolve usuário, tenant e papel.
2. A API abre transação com papel de aplicação sem `BYPASSRLS`.
3. A API define contexto local à transação por mecanismo parametrizado e controlado pelo servidor, por exemplo chaves `app.user_id`, `app.tenant_id` e `app.role`.
4. Policies/funções do banco leem esse contexto, rejeitam valor ausente e comparam com colunas do recurso.
5. O contexto expira automaticamente ao fim da transação; pool connections não carregam contexto entre requests.
6. A aplicação executa consultas parametrizadas e não permite que o cliente escolha statements de contexto.

Alternativa válida é concentrar toda autorização na API e usar constraints/queries tenant-scoped, sem RLS. Para esta base, defesa em profundidade com RLS tende a ser mais segura, mas a escolha precisa de prova de conexão/pooling e testes. Em ambos os casos, service jobs usam papel separado e ainda precisam de tenant explícito ou escopo documentado.

Cuidados para funções:

- substituir `SECURITY DEFINER` por operações da API quando possível;
- fixar `search_path` e owner dedicado quando indispensável;
- remover `EXECUTE` implícito do público e conceder apenas ao papel necessário;
- validar autorização dentro da função, não apenas no caller;
- testar chamadas diretas com papel de aplicação e de migração.

## Matriz mínima de testes negativos

Os testes abaixo são gates; não há evidência de que existam hoje.

| Caso | Preparação | Ação maliciosa | Resultado esperado |
|---|---|---|---|
| Leitura cross-tenant | usuário A no tenant A; recurso no B | consultar id do B | `404` ou `403`, zero dados e evento auditável |
| Lista cross-tenant | dados em A e B | listar sem filtro ou com `tenant_id=B` | somente A |
| Escrita cross-tenant | usuário A; recurso B | atualizar/deletar B | rejeição e nenhuma mudança |
| Criação forjada | usuário A | body declara tenant B | rejeição; servidor ignora tenant não autorizado |
| Relação forjada | objeto A | associar parent/attachment de B | rejeição por constraint/policy |
| Realtime cross-tenant | usuário A | assinar canal/filtro de B | subscription negada; nenhum evento |
| Storage cross-tenant | usuário A | gerar upload/download para chave B | URL não emitida ou acesso negado |
| Link público inválido | token expirado/revogado | ler/alterar recurso | rejeição sem revelar existência |
| Token de outro ambiente | token válido em dev | chamar staging/prod | `401` por issuer/audience |
| Token expirado/algoritmo errado | token adulterado | chamar API | `401` |
| Papel em claim adulterado | usuário comum | enviar claim/header admin | ignorado e rejeitado |
| Membership suspensa | token ainda válido | operar após suspensão | `403` imediato ou dentro do SLA definido |
| IDOR em subrecurso | comentário/arquivo de B | acessar via id direto | rejeição tenant-scoped |
| Contexto vazado no pool | request A seguido de B na mesma conexão | B tenta ler A | nenhum dado; contexto transacional limpo |
| Job com tenant ausente | evento incompleto | worker processa | dead-letter/erro, sem operação global |

## Testes de elevação de privilégio

1. `user` tenta alterar seu papel em `profiles`/membership.
2. `admin` de tenant A tenta atribuir papel ou convidar em B.
3. `admin` tenta criar `super_admin` global.
4. Caller autenticado invoca diretamente função que usa papel privilegiado.
5. Papel de aplicação tenta executar RPC destinada somente a worker/service.
6. Worker de uma fila tenta acessar tabela fora do seu domínio.
7. Link público tenta alterar campos além do estado permitido.
8. Mass assignment envia `role`, `tenant_id`, `owner_id`, `status` ou campos financeiros não autorizados.
9. Token roubado é usado depois de disable/revoke conforme o SLA definido.
10. SQL function com `SECURITY DEFINER` é chamada com objetos/search path maliciosos.

Cada teste deve validar resposta, ausência de efeito no banco, ausência de vazamento em logs e presença do evento de auditoria apropriado.

## Gates de aceitação

- Modelo de tenant e matriz de papéis aprovados.
- 100% dos endpoints/tabelas privadas mapeados a uma policy.
- Testes negativos automatizados executados com pelo menos dois tenants e papéis distintos.
- Nenhum papel de aplicação com superuser/owner/`BYPASSRLS`.
- Nenhum endpoint administrativo protegido somente pelo frontend.
- Estratégia de invalidação de sessão, convite, recovery e desativação aprovada.
- Links públicos com expiração/revogação e testes de enumeração.
- Evidência de que contexto não vaza em connection pooling.

Até esses gates, a substituição de Auth/RLS não deve ser autorizada.
