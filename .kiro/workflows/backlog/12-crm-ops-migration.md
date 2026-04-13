# Task: Migrar crm_ops para o sistema REI_CONFIGS

## Contexto
O REI tipo `crm_ops` esta fora do sistema padrao `REI_CONFIGS` em `src/config/rei/index.ts`. Usa componentes standalone (`StepCrmOps1-5.tsx`) com campos em snake_case prefixados com `revops_`, enquanto os demais REIs usam camelCase.

## ATENCAO
Este e um problema arquitetural critico documentado no CLAUDE.md. A migracao deve ser feita com extremo cuidado para nao quebrar dados existentes.

## Arquivos
- Criar: `src/config/rei/crmOpsQuestions.ts`
- Editar: `src/config/rei/index.ts` (adicionar crm_ops ao REI_CONFIGS)
- Editar: `src/components/rei/REIWizard.tsx` (remover tratamento especial)
- Manter: `src/components/rei/steps/StepCrmOps1-5.tsx` (deprecar, nao deletar)

## Implementacao
1. Criar `crmOpsQuestions.ts` com as mesmas perguntas dos StepCrmOps1-5, mas usando camelCase:
   - `revops_segmento` -> `segment`
   - `revops_stack_crm` -> `crmStack`
   - `revops_objetivo` -> `objective`
   - (mapear todos os campos)
2. Adicionar ao REI_CONFIGS em index.ts:
   ```ts
   crm_ops: {
     type: 'crm_ops',
     label: 'CRM & RevOps',
     questions: crmOpsQuestions,
   }
   ```
3. Criar migration layer para dados existentes:
   - Funcao `normalizeCrmOpsData(data)` que mapeia campos antigos para novos
   - Usar no REIWizard ao carregar dados de projetos existentes
4. NAO deletar os StepCrmOps antigos (podem ter projetos usando)
5. Novos projetos crm_ops devem usar o sistema novo
6. Na edge function `generate-strategic-plan`, remover string matching para deteccao CRM:
   ```ts
   // REMOVER: const isCrmOps = objective?.includes('CRM')
   // USAR: const isCrmOps = project.type === 'crm_ops'
   ```

## Criterio de Aceite
- crm_ops aparece em REI_CONFIGS
- Novos projetos crm_ops usam camelCase
- Projetos existentes com revops_* continuam funcionando
- Deteccao de tipo usa campo estruturado, nao string matching
- Edge function usa project.type em vez de string matching
