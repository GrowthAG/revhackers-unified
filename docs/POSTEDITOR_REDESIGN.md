# PostEditor - Redesign Ultra Minimalista

## 🎯 Objetivo
Criar uma interface fluida, intuitiva e sem confusão para criação de artigos.

## ❌ Problemas Atuais
1. Tabs desnecessárias (Editor/Visualização)
2. "Novo Artigo" duplicado
3. Gerador de Prompt muito grande
4. Layout desorganizado
5. Falta hierarquia visual

## ✅ Nova Estrutura

### Layout em Seções Numeradas

```
┌──────────────────────────────────────────────────────────────┐
│ [← Voltar]                              [Salvar] [Publicar]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1  INFORMAÇÕES BÁSICAS                                  │ │
│ │                                                         │ │
│ │    Título do Artigo *                                   │ │
│ │    [_____________________________________________]      │ │
│ │                                                         │ │
│ │    URL (Slug) *                    Categoria *          │ │
│ │    [___________________]           [____________]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 2  CAPA DO ARTIGO                                       │ │
│ │                                                         │ │
│ │    [Upload de Imagem]                                   │ │
│ │                                                         │ │
│ │    ▼ Gerador de Prompt AI (opcional)                    │ │
│ │    └─ [Colapsável - Inicialmente fechado]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3  CONTEÚDO                                             │ │
│ │                                                         │ │
│ │    Resumo de Impacto (Excerpt) *                        │ │
│ │    [_____________________________________________]      │ │
│ │                                                         │ │
│ │    Corpo do Artigo *                                    │ │
│ │    Cole o texto puro. O sistema formatará.              │ │
│ │    [                                                ]   │ │
│ │    [                                                ]   │ │
│ │    [                                                ]   │ │
│ │                                                         │ │
│ │    💡 Dica: ## Título | - Lista | **Negrito**           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 4  PUBLICAÇÃO                                           │ │
│ │                                                         │ │
│ │    [○ Rascunho] [● Publicado]                           │ │
│ │                                                         │ │
│ │    [Salvar Rascunho]  [Publicar Artigo]                │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 🎨 Design Specs

### Seções
- **Background**: bg-white
- **Border**: border border-gray-200
- **Padding**: p-6
- **Spacing**: space-y-6 (entre seções)
- **Border Radius**: rounded-lg

### Numeração
- **Tamanho**: w-8 h-8
- **Background**: bg-black
- **Texto**: text-white font-bold
- **Border Radius**: rounded-full

### Títulos de Seção
- **Tamanho**: text-sm
- **Peso**: font-bold
- **Cor**: text-black
- **Transform**: uppercase
- **Tracking**: tracking-wider

### Gerador de Prompt (Colapsável)
- **Estado Inicial**: Fechado
- **Trigger**: Botão com ícone ▼/▲
- **Animação**: Suave (transition-all)
- **Background**: bg-gray-50 quando aberto

### Botões de Ação
- **Salvar Rascunho**: variant="outline", border-gray-300
- **Publicar**: bg-black text-white

## 📝 Ordem dos Campos

1. **Informações Básicas**
   - Título (full width)
   - Slug (50%) + Categoria (50%)

2. **Capa**
   - Upload de imagem
   - Gerador de Prompt (colapsável)

3. **Conteúdo**
   - Resumo (Excerpt)
   - Corpo do Artigo (Textarea grande)
   - Dica de sintaxe

4. **Publicação**
   - Toggle Rascunho/Publicado
   - Botões de ação

## 🔧 Mudanças Técnicas

### Remover
- ❌ `<Tabs>` component
- ❌ `activeTab` state
- ❌ Botão "Visualizar" no header
- ❌ TabsList e TabsTrigger

### Adicionar
- ✅ Seções numeradas (1, 2, 3, 4)
- ✅ Estado `promptExpanded` para colapsar
- ✅ Componente `Collapsible` para Gerador de Prompt

### Manter
- ✅ Toda a lógica de save/upload
- ✅ Validações
- ✅ Estados do formulário

## 🎯 Benefícios

1. **Fluxo Linear** - Usuário segue 1→2→3→4
2. **Menos Confusão** - Sem tabs, sem duplicação
3. **Mais Espaço** - Gerador de Prompt colapsável
4. **Visual Limpo** - Seções bem definidas
5. **Profissional** - Ultra minimalista

---

## 📦 Próximos Passos

1. Remover Tabs do JSX
2. Criar seções numeradas
3. Implementar Collapsible para Prompt Generator
4. Ajustar espaçamentos
5. Testar fluxo completo
