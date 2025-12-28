# Sistema de Ajuda Inline para PostEditor

## 🎯 Objetivo:
Adicionar guias visuais discretos para ajudar usuários a preencher cada campo corretamente.

## 💡 Estratégia:

### 1. **Ícone de Ajuda (?) ao lado de cada label**
- Pequeno, discreto
- Hover mostra tooltip
- Não ocupa espaço

### 2. **Exemplos Inline**
- Texto cinza claro abaixo do campo
- Formato: "Ex: ..."
- Desaparece quando usuário começa a digitar

### 3. **Validação Visual em Tempo Real**
- ✓ Verde quando correto
- ⚠ Amarelo quando atenção
- ✗ Vermelho quando erro

---

## 📝 Guias por Campo:

### **Título do Artigo**
```
Label: Título do Artigo
Tooltip: "Use um título claro e direto. Máximo 60 caracteres para SEO."
Exemplo: "Como Estruturar um Funil de Vendas B2B"
Validação: ✓ 30-60 chars | ⚠ 60-80 chars | ✗ >80 chars
```

### **URL (Slug)**
```
Label: URL (Slug)
Tooltip: "Gerado automaticamente. Apenas letras minúsculas e hífens."
Exemplo: "como-estruturar-funil-vendas-b2b"
Status: "Auto-gerado ✓" (cinza claro)
```

### **Categoria**
```
Label: Categoria
Tooltip: "Escolha a categoria que melhor representa o conteúdo."
Placeholder: "Selecione uma categoria..."
```

### **Resumo de Impacto**
```
Label: Resumo de Impacto (Excerpt)
Tooltip: "Uma ou duas frases que aparecem nos cards de preview. Venda o clique!"
Exemplo: "Descubra o framework exato que empresas B2B usam para aumentar conversão em 3x."
Contador: 0/160 • Ideal para SEO
```

### **Corpo do Artigo**
```
Label: Corpo do Artigo
Tooltip: "Cole o texto puro. Use ## para títulos, - para listas, ** para negrito."
Botão: [?] Ver Guia Completo → Abre modal com exemplos
Grid de Sintaxe: Sempre visível
```

### **Capa do Post**
```
Label: Capa do Artigo
Tooltip: "Imagem 1200x630px. Use o Gerador de Prompt AI para criar capas padronizadas."
Recomendação: "Formato: JPG ou PNG | Tamanho máx: 2MB"
```

---

## 🎨 Implementação Visual:

### Componente Tooltip:
```tsx
<div className="flex items-center gap-2">
  <label className="text-sm font-bold text-black">
    Título do Artigo
  </label>
  <button
    type="button"
    className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-xs"
    title="Use um título claro e direto. Máximo 60 caracteres para SEO."
  >
    ?
  </button>
</div>
```

### Exemplo Inline:
```tsx
<p className="text-xs text-gray-400 mt-1">
  Ex: Como Estruturar um Funil de Vendas B2B
</p>
```

### Validação Visual:
```tsx
{title.length > 0 && (
  <div className="flex items-center gap-2 text-xs mt-1">
    {title.length >= 30 && title.length <= 60 ? (
      <span className="text-green-600">✓ Tamanho ideal</span>
    ) : title.length > 60 && title.length <= 80 ? (
      <span className="text-yellow-600">⚠ Um pouco longo</span>
    ) : (
      <span className="text-red-600">✗ Muito longo para SEO</span>
    )}
  </div>
)}
```

---

## 🚀 Próximo Passo:

Aplicar estas melhorias no PostEditor?

### Opções:
1. **Tooltips em todos os campos** (discreto, não invasivo)
2. **Exemplos inline** (sempre visíveis, cinza claro)
3. **Validação em tempo real** (feedback imediato)
4. **Modal de ajuda completo** (para quem precisa de mais detalhes)

**Qual você prefere? Ou todos?** 🎯
