# Task: Reconectar reiScoring com campos reais dos REIs

## Contexto
`src/utils/reiScoring.ts` usa interface `WizardData` com campos que nao existem nos REIs reais (`segmento`, `tamanho`, `metricas`, `gargalo`, `prontidao`). Esses campos eram de um quiz publico antigo. Os scores salvos no DB estao incorretos.

## Objetivo
Reescrever o scoring para usar os campos reais de cada tipo de REI, gerando scores precisos.

## Arquivos
- `src/utils/reiScoring.ts`
- Referenciar: `src/config/rei/consultingQuestions.ts` (33 campos)
- Referenciar: `src/config/rei/founderQuestions.ts` (14 campos)
- Referenciar: `src/config/rei/devQuestions.ts` (16 campos)

## Implementacao
1. Definir dimensoes de scoring por tipo de REI:
   - **consulting**: Maturidade Comercial, Infraestrutura Tech, Processos, Equipe, Dados
   - **founder**: Personal Brand, Posicionamento, Conteudo, Networking
   - **dev**: Presenca Digital, UX, Performance, SEO
   - **crm_ops**: Stack, Automacao, Dados, Processos
2. Para cada dimensao, mapear quais campos do REI contribuem:
   ```ts
   const CONSULTING_DIMENSIONS = {
     comercial: ['hasTeam', 'teamSize', 'avgTicket', 'monthlyRevenue'],
     tech: ['currentCrm', 'trackingTools', 'automationLevel'],
     // ...
   }
   ```
3. Scoring por campo:
   - Campos boolean: 0 ou 1
   - Campos select/enum: mapeamento explicito de valor para score 0-1
   - Campos texto livre: 0.5 (presente) ou 0 (vazio)
4. Score final: media ponderada das dimensoes (0-100)
5. Retornar tambem scores por dimensao para visualizacao radar
6. Manter backward compatibility: funcao aceita tanto dados antigos quanto novos

## Criterio de Aceite
- Scoring funciona para todos os 4 tipos de REI
- Scores refletem a realidade dos dados preenchidos
- Score por dimensao disponivel para visualizacao
- Dados antigos nao causam erro (fallback gracioso)
- Score salvo no DB e correto apos recalculo
