# Primeira tarefa segura do Developer

## Objetivo

Criar uma auditoria local, determinística e sem acesso externo que transforme o acoplamento atual ao Supabase em um inventário versionável. A tarefa implementa parte de `E0-T1` e prepara `E0-T6`; ela **não inicia a migração de runtime**.

## Escopo autorizado

O Developer poderá alterar somente:

- `scripts/audit-supabase-dependencies.mjs`;
- `tests/audit-supabase-dependencies.test.mjs`;
- `docs/architecture/gcp-migration/supabase-dependency-baseline.json`;
- scripts estritamente necessários no `package.json`, sem trocar dependências.

Todo o trabalho deve ocorrer na branch/worktree do Developer e permanecer local até revisão do Supervisor. Não há autorização para push, merge ou deploy.

## Comportamento esperado

O auditor deve percorrer apenas arquivos versionados e produzir um JSON ordenado e estável com:

1. imports de `@supabase/supabase-js` e wrappers locais do cliente;
2. nomes de variáveis `SUPABASE_*` e `VITE_SUPABASE_*`, nunca seus valores;
3. usos de `.from`, `.rpc`, `.channel`, `.storage` e `.functions.invoke` associados ao cliente Supabase;
4. referências a `/rest/v1`, `/auth/v1`, `/storage/v1`, `/realtime/v1` e `/functions/v1`;
5. diretórios implantáveis em `supabase/functions`, excluindo `_shared`;
6. seções de funções em `supabase/config.toml`, incluindo diretórios sem seção e seções sem diretório;
7. migrations, scripts, workflows e prerender que dependam de Supabase;
8. totais por categoria e lista de arquivos, sempre com caminhos relativos.

O JSON, stdout e stderr são **metadata-only**: categoria, caminho relativo, contagem, número de linha e nomes/símbolos pertencentes a uma allowlist explícita. É proibido incluir trecho-fonte, valor encontrado, URL literal, payload, texto adjacente ou conteúdo integral de qualquer linha.

O baseline deve refletir exatamente o commit-base auditado e permitir comparação explícita em mudanças posteriores. Reduções são esperadas durante a migração, mas qualquer alteração no baseline precisa de revisão intencional.

## Regras de segurança

- Não ler `.env`, keychain, Secret Manager, configuração remota ou conteúdo ignorado pelo Git.
- Não imprimir tokens, URLs com credenciais, payloads, PII ou valores de variáveis.
- Não copiar snippets das migrations ou do código para JSON, stdout, stderr, snapshots ou mensagens de erro.
- Não acessar Supabase, Google Cloud, GitHub, Hostinger ou qualquer rede.
- Não instalar pacote nem alterar lockfile.
- Não modificar código da aplicação, migrations ou configuração de deploy.
- Não apagar, mover, renomear ou arquivar arquivos.

## Critérios de aceitação

- O teste usa fixtures temporárias e cobre presença, ausência, duplicata e ordenação determinística.
- A execução no repositório identifica exatamente 39 diretórios implantáveis e a seção órfã `autentique-webhook` na base atual.
- O relatório não contém padrões de segredo nem valores oriundos de `.env`.
- Uma fixture com segredo-sentinela prova que o valor não aparece no JSON, stdout ou stderr, inclusive quando a auditoria falha.
- Duas execuções consecutivas produzem bytes idênticos.
- O teste falha de forma legível quando o baseline muda sem atualização revisada.
- `npm test` e o comando de auditoria terminam com sucesso, sem rede.
- O diff final contém somente os arquivos autorizados acima.

## Evidência para o Supervisor

O handoff deve incluir commit-base, comando executado, hash do relatório, totais por categoria, resultado dos testes, diff dos arquivos autorizados e riscos residuais. Exit code isolado não é evidência suficiente.

## Perfil obrigatório para execução pelo agente

Usar somente `revhackers_developer_restricted`, com `allowedTools` explícito `fs_*`. No provedor Claude Code isso libera apenas leitura/listagem/edição de arquivos e bloqueia shell, rede, subagentes e MCP; o agente não executa testes, Git ou comandos. O agente principal/revisor executa auditoria, testes, inspeção de diff e commit depois do handoff. Fallback Codex continua proibido porque o CAO aplica nele apenas contenção por prompt.
