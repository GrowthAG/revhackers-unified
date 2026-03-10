---
description: Regras Oficiais de Diagramação, Tipografia Minimalista Apple/Notion-style e Espaçamento para Slides do REI 360 e CRM.
---

# Regras de Design e Diagramação REI 360 / CRM

**Essência Estratégica:** Minimalismo estilo Apple, diagramação sólida inspirada no Notion e ClickUp. Preenchimento inteligente de espaços (sem telas desabadas ou espaços soltos demais), foco absoluto na legibilidade e ausência total de "ruído" visual (quadriculados e afins).

## 1. Espaçamento Interno (Paddings Globais)
- **Nunca cole texto, gráficos ou componentes nas beiradas da tela.**
- Toda seção que atua como um slide/página DEVE conter margens (paddings) generosas nas laterais e no topo. O padrão para os envoltórios de tela é `p-10 md:p-16 lg:p-20`.
- Essa margem age como o "passe-partout" de um quadro: tudo que for renderizado deve vir centralizado dentro destas restrições.

## 2. Padrão Estrutural (Layout Master)
Todos os slides do Dossiê/Capa/Planejamento Estratégico devem herdar um contêiner flexível unificado que restrinja sua largura e gerencie a fluidez, garantindo que "nenhum buraco em branco desnecessário" fique exposto de forma pobre, mas que a "folga" do respiro atue ao redor das *colunas*, não isolando texto pobre:

```tsx
<div className="flex flex-col h-full bg-white overflow-y-auto w-full">
    {/* Bloco 1: O Header ganha sua área no topo */}
    <div className="flex-none p-10 md:p-16 lg:p-20 pb-4">
        <SectionHeader eyebrow="Categoria" titleLine1="Título Gigante" />
    </div>

    {/* Bloco 2: O Corpo preenche a altura e domina a largura máxima restrita (Nova regra Widescreen fluida) */}
    <div className="flex-1 p-10 md:p-16 lg:p-20 pt-4 max-w-[1600px] mx-auto w-full bg-white">
        {/* Usar preferencialmente Grid Layouts (grid-cols-2, grid-cols-4) para evitar linhas de texto muito longas e preencher o conteúdo de forma rica */}
    </div>
</div>
```

## 3. Tipografia (A Família Sans / Apple Style)
- **Monotonia Elegante:** As fontes seguem o estilo Inter ou San Francisco da Apple.
- **Eyebrow (subtítulos superiores):** Devem ser miúdos, espaçados, grossos e caixa-alta. Jamais menores que 12px para evitar perda de legibilidade em telas não-Retina.
  - *Classe:* `text-xs uppercase tracking-widest text-zinc-400 font-black`
- **Títulos Secionais:** Títulos grandes, grossos, com entrelinhas e tracking muito apertados. NUNCA utilize fontes finas (light ou thin) em títulos.
  - *Classe:* `text-4xl md:text-[3.25rem] font-black tracking-tight leading-[1.05] text-black`
- **Descritivos:** Convidativos e moderados. O contraste ajuda a "desaparecer" com o volume excessivo de texto.
  - *Classe:* `text-sm text-zinc-500 leading-relaxed font-medium`

## 4. O Preenchimento Ocupacional (Notion & ClickUp Style)
- Utilize divs de bordas finas com fundo muito sutil para encapsular arrays de informações (`border border-zinc-200 bg-zinc-50 rounded-xl ou 3xl`).
- Não se joga itens numa lista solta sobre um fundo branco livre sem um quadro ou divisórias amarrando as dependências.
- Ícones em alto contraste: Pílulas ou quadrados (`w-10 h-10`).
- Sem gradientes exagerados.

## 5. Simetria
- Os blocos internos de uma seção devem respeitar alinhamentos estritos (grid). Se algo tem `gap-4`, o item vizinho respeita o mesmo `gap-4`. 
- As bordas seguem padrão: `rounded-2xl` ou `rounded-3xl` para componentes macro, e `rounded-lg` para componentes micro.
