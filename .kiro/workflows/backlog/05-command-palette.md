# Task: Conectar Command Palette (Cmd+K) a navegacao real

## Contexto
O `src/components/ui/CommandPalette.tsx` ja existe mas precisa ser conectado a dados reais (projetos, leads, clientes, paginas).

## Objetivo
Implementar busca real no Command Palette com categorias: Navegacao, Projetos, Clientes, Acoes.

## Arquivos
- `src/components/ui/CommandPalette.tsx`
- `src/components/layout/AppShell.tsx`

## Design (Nobibecode)
```
Overlay:        bg-black/60
Modal:          bg-white shadow-sm max-w-lg mx-auto mt-[20vh]
Input:          border-none text-base font-medium placeholder:text-zinc-400 px-4 py-3
Category:       text-xxs font-black uppercase tracking-widest text-zinc-400 px-4 py-2
Result item:    px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-50 cursor-pointer
Result active:  bg-zinc-100
Icon:           w-4 h-4 text-zinc-400
Text:           text-sm font-medium text-zinc-900
Shortcut:       text-xs text-zinc-400 font-mono ml-auto
```

## Implementacao
1. Registrar atalho Cmd+K (Mac) / Ctrl+K (Windows) globalmente no AppShell
2. Categorias estaticas de navegacao:
   - Dashboard (/admin), Pipeline (/admin/pipeline), Projetos (/admin/projects)
   - Clientes (/admin/clients), Materiais (/admin/materials)
3. Categorias dinamicas (busca no Supabase com debounce 300ms):
   - Projetos: buscar em `rei_projects` por `client_name`, `client_company`, `trade_name`
   - Clientes: buscar em `profiles` por `full_name`, `email`
   - Oportunidades: buscar em `opportunities` por `client_name`, `client_company`
4. Navegacao via `useNavigate()` ao selecionar item
5. Suporte a navegacao por teclado (ArrowUp/Down + Enter)
6. Fechar com Escape ou click fora

## Criterio de Aceite
- Cmd+K abre o palette de qualquer pagina admin
- Digitar filtra resultados em tempo real
- Navegacao por teclado funciona
- Selecionar um item navega para a pagina correta
- ESC fecha o palette
