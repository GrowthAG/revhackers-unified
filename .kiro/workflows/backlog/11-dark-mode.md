# Task: Implementar dark mode toggle para area de conteudo

## Contexto
A sidebar ja e dark (bg-zinc-950). O conteudo principal e sempre light. O design system Nobibecode tem tokens que suportam dark mode.

## Objetivo
Adicionar toggle de dark mode que afeta a area de conteudo (nao a sidebar, que ja e dark).

## Arquivos
- Criar: `src/contexts/ThemeContext.tsx`
- Editar: `src/components/layout/AppShell.tsx`
- Editar: `tailwind.config.ts` (adicionar darkMode: 'class')
- Editar: `src/index.css` (CSS variables para dark)

## Paleta Dark (Nobibecode)
```
Fundo:           bg-zinc-950 (dark) / bg-white (light)
Fundo card:      bg-zinc-900 (dark) / bg-white (light)
Fundo subtle:    bg-zinc-800 (dark) / bg-zinc-50 (light)
Texto primario:  text-zinc-100 (dark) / text-zinc-900 (light)
Texto secundario: text-zinc-400 (dark) / text-zinc-500 (light)
Bordas:          border-zinc-800 (dark) / border-zinc-200 (light)
Accent:          #00CC6A (igual em ambos)
```

## Implementacao
1. ThemeContext com state `theme: 'light' | 'dark'`, persistido em localStorage
2. Toggle no header/sidebar (icone Sun/Moon do Lucide)
3. Adicionar class `dark` no `<html>` element quando dark mode ativo
4. Configurar `darkMode: 'class'` no tailwind.config.ts
5. Adicionar variantes `dark:` nos componentes principais:
   - AppShell main content area
   - Cards (border, bg)
   - Texto (primario, secundario)
   - Inputs e selects
6. NAO alterar a sidebar (ja e dark permanente)
7. Respeitar preferencia do sistema como default (`prefers-color-scheme`)

## Criterio de Aceite
- Toggle funciona e persiste entre sessoes
- Sidebar permanece dark em ambos os modos
- Todos os componentes admin sao legiveis em dark mode
- Accent #00CC6A permanece igual
- Nenhum texto ilegivel ou contraste insuficiente
- Default segue preferencia do sistema
