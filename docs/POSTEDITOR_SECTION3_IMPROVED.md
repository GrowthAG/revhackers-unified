# Seção 3: Conteúdo - VERSÃO MELHORADA

## Layout Visual Aprimorado

```tsx
{/* Seção 3: Conteúdo */}
<div className="bg-white p-6 rounded-lg border border-gray-200">
  <SectionHeader number="3" title="Conteúdo" />
  
  <div className="space-y-6">
    {/* Resumo de Impacto */}
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <label htmlFor="excerpt" className="block text-sm font-bold text-blue-900 mb-1">
            Resumo de Impacto (Excerpt) *
          </label>
          <p className="text-xs text-blue-700">
            Uma ou duas frases que vendem o clique. Aparece nos cards de preview do blog.
          </p>
        </div>
      </div>
      <Textarea
        id="excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Ex: Descubra como estruturar demos que convertem 3x mais do que a média do mercado..."
        className="min-h-[100px] bg-white border-blue-300 focus:border-blue-500 text-gray-900"
        required
      />
      <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
        <span className="font-semibold">Caracteres:</span>
        <span>{excerpt.length}/160 (ideal para SEO)</span>
      </div>
    </div>

    {/* Corpo do Artigo */}
    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-revgreen" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-black mb-1">
                Corpo do Artigo *
              </label>
              <p className="text-xs text-gray-600">
                Cole o texto puro. O sistema formatará automaticamente em HTML profissional.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-gray-200"
              onClick={insertV2Template}
            >
              <FileText className="w-3 h-3 mr-1" /> Template V2
            </Button>
          </div>
        </div>
      </div>

      <Textarea
        id="content"
        value={content}
        onChange={handleContentChange}
        placeholder="Cole o texto do artigo aqui...

## Título Principal

Parágrafo introdutório com **negrito** e *itálico*.

### Subtítulo

- Item de lista 1
- Item de lista 2

> Citação importante
> — Autor

---

Outro parágrafo..."
        className="min-h-[500px] font-mono text-sm bg-white border-gray-300 focus:border-black text-gray-900 placeholder:text-gray-400"
        required
      />

      {/* Dica de Sintaxe - Mais Visível */}
      <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-revgreen shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-black mb-1">Sintaxe Suportada:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
              <div><code className="bg-gray-100 px-1 rounded">## Título</code> → H2</div>
              <div><code className="bg-gray-100 px-1 rounded">### Subtítulo</code> → H3</div>
              <div><code className="bg-gray-100 px-1 rounded">- Lista</code> → Bullet</div>
              <div><code className="bg-gray-100 px-1 rounded">1. Lista</code> → Numerada</div>
              <div><code className="bg-gray-100 px-1 rounded">**texto**</code> → Negrito</div>
              <div><code className="bg-gray-100 px-1 rounded">*texto*</code> → Itálico</div>
              <div><code className="bg-gray-100 px-1 rounded">> Citação</code> → Quote</div>
              <div><code className="bg-gray-100 px-1 rounded">---</code> → Divisor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de Palavras */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span><strong className="text-black">{content.split(/\s+/).filter(w => w).length}</strong> palavras</span>
          <span><strong className="text-black">{readTime}</strong> de leitura</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('preview')}
          className="text-xs"
        >
          <Eye className="w-3 h-3 mr-1" /> Preview
        </Button>
      </div>
    </div>
  </div>
</div>
```

## 🎨 Melhorias Implementadas:

### **Resumo de Impacto:**
1. ✅ **Background azul claro** - Destaque visual
2. ✅ **Ícone azul** - Identidade visual clara
3. ✅ **Descrição expandida** - "Aparece nos cards de preview"
4. ✅ **Contador de caracteres** - Feedback em tempo real
5. ✅ **Placeholder melhor** - Exemplo concreto

### **Corpo do Artigo:**
1. ✅ **Background cinza claro** - Separação visual do Resumo
2. ✅ **Ícone preto com verde** - Identidade RevHackers
3. ✅ **Placeholder com exemplo** - Mostra sintaxe na prática
4. ✅ **Dica de sintaxe expandida** - Grid com todos os comandos
5. ✅ **Contador de palavras** - Feedback de progresso
6. ✅ **Botão Preview** - Acesso rápido à visualização
7. ✅ **Altura maior** - min-h-[500px] para mais espaço

## 🎯 Diferenças Visuais Claras:

```
┌─────────────────────────────────────┐
│ 🔵 RESUMO (Azul)                    │
│    ├─ Background: bg-blue-50        │
│    ├─ Border: border-blue-200       │
│    └─ Ícone: Azul                   │
├─────────────────────────────────────┤
│ ⚫ ARTIGO (Cinza/Preto)             │
│    ├─ Background: bg-gray-50        │
│    ├─ Border: border-gray-300       │
│    └─ Ícone: Preto + Verde          │
└─────────────────────────────────────┘
```

## 📊 Feedback em Tempo Real:

- **Resumo:** Contador de caracteres (0/160)
- **Artigo:** Palavras + Tempo de leitura
- **Sintaxe:** Grid visual com exemplos

---

**Aplicar estas melhorias agora?** 🎯
