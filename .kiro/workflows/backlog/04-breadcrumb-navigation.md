# Task: Implementar breadcrumb navegavel no header de paginas admin

## Contexto
O `src/components/layout/PageHeader.tsx` existe mas o breadcrumb e apenas visual. O padrao Notion tem breadcrumbs clicaveis que permitem navegar entre niveis.

## Objetivo
Criar um sistema de breadcrumb automatico baseado na rota atual, clicavel em cada nivel.

## Arquivos
- `src/components/layout/PageHeader.tsx` (ou criar se nao existe)
- `src/components/layout/AppShell.tsx`
- `src/pages/admin/ProjectDetails.tsx`
- `src/pages/admin/AdminDashboard.tsx`

## Design (Nobibecode)
```
Container:      h-12 flex items-center px-6 border-b border-zinc-100
Separador:      text-zinc-300 mx-1.5 "/"
Item clicavel:  text-sm text-zinc-400 font-medium hover:text-zinc-900 cursor-pointer
Item atual:     text-sm text-zinc-900 font-bold
```

## Implementacao
1. Criar hook `useBreadcrumbs()` que parseia `useLocation().pathname` e retorna array de `{ label, path }`
2. Map de rotas para labels:
   - `/admin` -> "Dashboard"
   - `/admin/pipeline` -> "Pipeline"
   - `/admin/projects` -> "Projetos"
   - `/admin/projects/:id` -> nome do projeto (via context ou prop)
   - `/admin/projects/:id/execucao` -> "OrqFlow OS"
3. Renderizar no PageHeader com Link do react-router-dom
4. Ultimo item nao e link (e a pagina atual)
5. Integrar no AppShell para aparecer automaticamente em todas as paginas admin

## Criterio de Aceite
- Breadcrumb aparece em todas as paginas admin
- Cada nivel (exceto o ultimo) e clicavel
- Nome do projeto aparece no breadcrumb de ProjectDetails
- Estilo segue Nobibecode (zinc scale, sem cores vibrantes)
