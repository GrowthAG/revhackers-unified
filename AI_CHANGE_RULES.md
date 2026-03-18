# AI Change Rules

## Diretrizes Práticas
O objetivo deste documento é orientar modificações seguras no código, priorizando manter o que já funciona estável e evitando causar novos erros ao tentar modernizar componentes à força.

## Princípios Básicos
- **Estabilidade vale mais que redução de linhas**. Manter um fluxo funcionando bem é mais importante que refatorá-lo rapidamente.
- **Evite surpresas**. Alterações complexas precisam ter os efeitos listados antes de rodar os comandos.
- **Mantenha a Tipagem Estrita**. Mudar para `any` destrói a ajuda que o TypeScript fornece para quem manterá o código depois.
- Fazer pequenas mudanças é quase sempre melhor do que tentar refatorar tudo de uma vez.

## Regras Obrigatórias
1. Não tire nem adicione passos grandes na interface sem avisar antes.
2. Evite remover checagens de erro vazias, proteções ou fluxos limitadores de tempo sem explicar qual problema antigo isso resolvia.
3. Considere caminhos indexados na web antes de apenas sugerir a exclusão de uma rota ou redicionamento.
4. Qualquer proposta que toque na geração de Tokens ou no Contexto de Auth precisa ser duplamente validada.
5. Alterações ligadas ao backoffice e aos fluxos do REI exigem cuidado; a UI antiga pode quebrar fácil se a estrutura do JSON salva na API via Supabase for alterada levemente.
6. Atualizar algo no Backend (`supabase/functions`) não deve ser feito às pressas para não causar quebras de versão em quem acessa do Client.

## Como classificar os ajustes
Ao sugerir mudanças, deixe claro em qual destas categorias o ajuste cai:
- **Seguro**: Ajustes de visual, layout, correções de ortografia, marcação HTML, e tipagens simples.
- **Revisão Cautelosa**: Alterações usando Hooks globais, mudança na forma de buscar dados (`src/api/*`) ou integração pai/filho complexa.
- **Mudanças Estruturais / Arquiteturais**: Trocas profundas de bibliotecas base de roteamento ou de cache que podem impactar toda a compilação do projeto. Sugira a ideia sem aplicá-la agressivamente.

## O que NÃO fazer
- Buscar e substituir nomes de modo genérico e massivo.
- Organizar a estrutura de pastas inteira só para tentar "parecer com tutoriais da web".
- Acoplar funções complexas dentro dos comandos de *Build* sem garantir que está blindado pro ambiente de Produção.
