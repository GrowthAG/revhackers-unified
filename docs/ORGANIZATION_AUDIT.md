# Auditoria de organização local

Data da auditoria: 2026-07-16.

## Fonte canônica

`/Users/giullianoalves/Projects/active/RevHackers/repository`

A árvore foi reconstruída a partir da branch `develop` no commit `a940b6c`, que
estava 131 commits à frente da antiga `main`. O histórico da tentativa anterior
de monorepo foi reconciliado sem incorporar os commits locais que continham
vídeos e `token.pickle`.

## Classificação das cópias encontradas

| Local | Classificação | Destino |
| --- | --- | --- |
| `Projects/active/revhackers-growth-hub` | fonte anterior, conteúdo já incorporado | quarentena após validação |
| `Backups/revhackers-growth-hub-backup-*` | backup exato anterior ao commit | manter até o push validado |
| `Projects/active/Site RevHackers` | snapshot legado de janeiro de 2026 | arquivar somente documentos exclusivos |
| `Desktop/.../usefunnels.io-rebuild (1)/revhackers-growth-hub` | clone antigo da `main` | quarentena |
| `Desktop/.../Revhackers-Upload*` | builds antigos para upload | quarentena |
| `Desktop/.../Site_RevHackers_v13` | build antigo e um documento privado | separar documento e remover build |
| `Desktop/.../00_Projetos Antigravity/Site RevHackers` | templates genéricos | quarentena |

## Conteúdo excluído do repositório público

- Tutoriais de Funnels e seus metadados.
- Binários `ffmpeg` e `yt-dlp`.
- Tokens OAuth em formato pickle.
- Contratos, certificados e apresentações internas.
- Scripts temporários e correções one-off já preservados no histórico Git.
- Segundo lockfile; npm e `package-lock.json` são o padrão do projeto.

## Validação realizada

- Build Vite concluído.
- Prerender: 81 rotas geradas, 0 falhas.
- O lint ainda registra dívida técnica preexistente no código ativo.
- A configuração de testes não encontra testes unitários no padrão configurado.

Nenhuma pasta histórica deve ser excluída definitivamente antes de a branch
organizada ser publicada e conferida em um clone limpo.
