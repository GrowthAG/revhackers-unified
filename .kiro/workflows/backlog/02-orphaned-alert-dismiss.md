# Task: Persistir dismiss do OrphanedRecordingsAlert

## Contexto
O componente `src/components/admin/OrphanedRecordingsAlert.tsx` aparece toda vez que o usuario entra no AdminDashboard. Nao ha persistencia do dismiss.

## Objetivo
Salvar o estado de dismiss no localStorage com TTL de 24h. Apos 24h, o alerta reaparece se ainda houver gravacoes orfas.

## Arquivos
- `src/components/admin/OrphanedRecordingsAlert.tsx`

## Implementacao
1. Ao clicar "IGNORAR", salvar em localStorage: `{ dismissed_at: ISO timestamp, count: number }`
2. Key: `revhackers_orphaned_alert_dismissed`
3. No mount do componente, verificar se existe dismiss valido (< 24h) E se o count atual e igual ao count salvo
4. Se o count mudou (novas gravacoes orfas), mostrar o alerta novamente mesmo dentro das 24h
5. Se dismiss valido e count igual, nao renderizar o componente

## Criterio de Aceite
- Clicar "IGNORAR" esconde o alerta
- Recarregar a pagina nao mostra o alerta (dentro de 24h, mesmo count)
- Apos 24h, o alerta reaparece
- Se novas gravacoes orfas aparecem, o alerta volta imediatamente
