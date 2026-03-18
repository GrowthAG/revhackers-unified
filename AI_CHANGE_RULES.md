# AI Change Rules

## Diretrizes Operacionais
O objetivo deste documento é orientar diretrizes de proposição de algoritmos aos agentes e interfaces de programação autônoma, visando maximizar a consistência da estabilidade da base existente, inibir regressões secundárias e resguardar estruturas lógicas construídas como contenção contra anomalias (fallback mechanisms).

## Princípios de Manutencão
- **Estabilidade base > Redução de linhas**. A continuidade de fluxo operacional é prioritária em relação à implementação idealizada unicamente pela padronização.
- **Detalhamento do Risco > Refatoração Agressiva**. Alterações complexas precisam prever seus efeitos sistêmicos.
- **Tipagem Estrita > Desligamento de Contrato Acidental**. Alterações para tipos frouxos (`any`, abstrações não verificadas) limitam a blindagem do transpilador no longo prazo.
- Modificações granulares e reversíveis em nível atômico tem primazia contra mudanças com dependências ramificadas.
- Inferências contextuais exigem verificação contígua ao invés de suposições originadas em arquiteturas tradicionais paralelas não implementadas pelo repositório.

## Parâmetros Formais
1. Não introduza ou elimine comportamento observável pela interface nativa sem demarcar de que forma esta via será substituída.
2. Evite a remoção de condicionalidades e fluxos assíncronos de escape preventivo sem fundamentar de modo prático a desconstrução técnica do motivo original ao qual serve.
3. Considere caminhos indexados na web e integrações dependentes antes de recomendar remoções ou renomeações diretas no roteamento URL.
4. Qualquer proposta associada à infraestrutura de Sessão/Geração de Tokens de Autenticação não deve proceder antes de avaliação end-to-end do provedor de serviço (Supabase).
5. Intervenções atreladas à área administrativa e fluxos sequenciais do sistema REI exigem prudência adicional; o processamento do cliente (UI) tende a ser fortemente interligado à modelagem exata armazenada e consultada via API para posterior consumo.
6. Atualizações em pacotes do banco de dados na nuvem ou Edge Functions devem considerar compatibilidade retroativa para não ocasionar conflito nos Clients (Deno x React Front).

## Metodologia de Classificação de Incrementos
As propostas de atualização devem ser caracterização internamente na sua resolução:
- **Operação Conservadora**: Ajustes passivos limitados a marcação (JSX/HTML/CSS), correção local em tipagem folha, formatações de conteúdo, alteração visual sem mutação de estado relacional ou alteração do uso de constantes literais.
- **Avaliação em Paridade**: Modificações lidando com elevação ou desconstrução de Hooks Contextuais para múltiplos filhos, revisões significativas em agrupamentos de query REST/GraphQL, e injeção de libs terceiras. Sugerir a lógica conceitual primeiramente.
- **Interrupção Metodológica**: Alterações disruptivas com reflexos massivos de framework (SSR radical onde não se encontra nativo, ou troca global de ferramenta de cache analítico/roteador) devem ser ignoradas do processo corretivo e reservadas exclusivamente para registro e avaliação de adoção arquitetural profunda.

## Práticas Restringidas
- Enviar sugestões pautadas singularmente na replicação paralela textual (buscas simplistas de Regex que excluem a checagem das hierarquias).
- Proposições atreladas à formatação de repositório global sem evidência de limitação sintática que justifique a migração.
- Deleção indiscriminada sob alegação de obsolescência presumida de blocos funcionais se não submetido à verificação cruzada (verificações estruturais por declaração, string literal, etc).
- Acoplamentos na cadeia de compilação sem definição expressa do pipeline infraestrutural.
