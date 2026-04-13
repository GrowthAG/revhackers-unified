# Task: Otimizar code splitting para reduzir bundle sizes

## Contexto
O build atual tem chunks muito grandes:
- `index.js`: 844KB
- `ReiDashboard`: 598KB
- `ProjectDetails`: 409KB

## Objetivo
Reduzir os chunks principais para abaixo de 300KB via code splitting mais agressivo.

## Arquivos
- `src/App.tsx` (rotas com React.lazy)
- `vite.config.ts` (manualChunks)

## Implementacao
1. Em `vite.config.ts`, configurar manualChunks:
   ```ts
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'vendor-react': ['react', 'react-dom', 'react-router-dom'],
           'vendor-supabase': ['@supabase/supabase-js'],
           'vendor-charts': ['recharts'],
           'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit'],
           'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
           'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
         }
       }
     }
   }
   ```
2. Em App.tsx, garantir que TODAS as paginas admin usam React.lazy
3. Verificar se componentes pesados dentro de paginas podem ser lazy-loaded:
   - `ProjectOsContainer` dentro de `ProjectDetails`
   - `AIPlaybookGenerator` dentro de `ProjectDetails`
   - `REIWizard` (formulario grande)
4. Usar `React.Suspense` com skeleton loading em cada lazy boundary
5. Prefetch de rotas provaveis:
   - No Dashboard, prefetch Pipeline e Projects
   - Em Projects list, prefetch ProjectDetails

## Criterio de Aceite
- Nenhum chunk acima de 300KB (exceto vendor chunks)
- Tempo de carregamento inicial reduzido
- Navegacao entre paginas nao mostra tela branca (Suspense com skeleton)
- Build sem warnings de chunk size
- Todas as rotas continuam funcionando
