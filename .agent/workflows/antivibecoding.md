---
description: Diretrizes Definitivas Anti-Vibecoding para garantir uma estética Brutalista, Seca e Industrial (OS) no RevHackers.
---

# 🛑 Anti-Vibecoding: Protocolo de Arquitetura Visual RevHackers

"Vibe-coding" define a estética genérica de interfaces de prateleira geradas por inteligência artificial - cheias de bordas arredondadas, sombras suaves, emojis amigáveis e componentes fofos. O **RevHackers Growth Hub** é um Motor Operacional (OS), e sua estética deve transparecer **Engenharia, Controle e Autoridade**.

Sempre que atuar no código visual desta aplicação, **APLIQUE ESTAS DIRETRIZES COMO LEI ABSOLUTA**:

### 1. Fuga da Geometria Suave
- **Arredondamento Zero:** Todos os componentes (`Button`, `Card`, `Badge`, `Input`) DEVEM forçar a classe `rounded-none`.
- **Eliminação de Sombras "Soft":** Nunca utilize `shadow-md`, `shadow-lg` ou variações com blur. Sombras são proibidas ou devem ser sombras de bloco brutas (ex: `box-shadow: 4px 4px 0px black;`).
- **Cards Genéricos:** Evite empilhar blocos em grid sem necessidade. Priorize tabelas limpas ou divs com `border-2 border-zinc-200`.

### 2. Poda de Emojis e Iconografia "Amigável"
- **Zero Sparkles:** O ícone `Sparkles` (estrelinhas de inteligência artificial) é **absolutamente banido** da aplicação. A IA aqui não é mágica, é processamento bruto.
- **Substitutos de IA:** Utilize `Cpu`, `Zap`, `Database`, `Server`, `TerminalSquare` ou `Bot` da Lucide Icons.
- **Corte de Emojis:** Nenhum texto de UI, placeholder, ou "empty state" deve conter emojis (✨, 🚀, 💡).
- **Sem Ícones "Fofinhos"**: Para sinalizar algo online ou funcionando, não use um coração batendo (`Activity`). Use o brutalismo militar: um ponto verde estático (`h-3 w-3 bg-[#00CC6A] animate-pulse rounded-none`).

### 3. Paleta de Alta Tensão
- **Proibido Soft-Pastel:** Cores de prateleira Tailwind (azul bebê, indigo, violeta de saas) são proibidas, exceto quando especificamente configuradas para diferenciar tenants no painel.
- **As Cores Base:** 
	- `bg-white` e `bg-zinc-50/100` (Fundos)
	- `border-black` e `border-zinc-200` (Limites Físicos de geometria)
	- `text-zinc-900` e `text-zinc-400` (A hierarquia de leitura)
	- `bg-[#00CC6A] text-black` (O gatilho de ação "GO", botões primários)

### 4. Tipografia de Engenharia (The Apple/Notion Hybrid)
- **Minúscula/Case:** Substitua "fontes doces" por **MAIÚSCULAS** com alto espaçamento nos badges e headers (`uppercase tracking-widest text-[0.65rem] font-black`).
- **Nomenclatura Seca:** Títulos das telas nunca são "Bem-vindo às suas integrações!". São secos e operacionais: **CONFIGURAÇÕES DE SISTEMA | INTEGRAÇÕES | NÓ CENTRAL**.
- **Copys de Botões:** Em vez de "Começar nova configuração", prefira "GERENCIAR NÓ", "AUTORIZAR FUNNELS", "PROCESSAR".

### 5. Layout Asimétrico e Minimalista
- Um componente não precisa ser sempre um "Card". Às vezes, texto simples e limpo ancorado no rodapé com um ícone forte transmite a informação com dez vezes mais elegância.
- Espaço em branco (Whitespace) é sua ferramenta primária de design. Crie componentes que "respiram" e batam no olho do usuário pela secura arquitetônica.

> ⚡ **Ato Falho:** Se, ao finalizar uma tela, ela parecer um Dashboard Saas bonitinho de Startup B2B - ela falhou no teste Anti-Vibecoding. Deve parecer o terminal de lançamento da SpaceX.
