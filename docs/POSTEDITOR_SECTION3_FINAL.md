# Seção 3: Conteúdo - ULTRA MINIMALISTA (Cores RevHackers)

## Paleta de Cores:
- Preto: #000000
- Branco: #ffffff
- Cinza: #6b7280, #e5e7eb, #f9fafb
- RevGreen: #10b981

```tsx
{/* Seção 3: Conteúdo */}
<div className="bg-white p-6 rounded-lg border border-gray-200">
  <SectionHeader number="3" title="Conteúdo" />
  
  <div className="space-y-6">
    {/* Resumo de Impacto */}
    <div className="p-5 bg-gray-50 border-l-4 border-revgreen rounded-r-lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-revgreen" />
        </div>
        <div className="flex-1">
          <label htmlFor="excerpt" className="block text-sm font-bold text-black mb-1">
            Resumo de Impacto (Excerpt) *
          </label>
          <p className="text-xs text-gray-600">
            Uma ou duas frases que vendem o clique. Aparece nos cards de preview.
          </p>
        </div>
      </div>
      <Textarea
        id="excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Ex: Descubra como estruturar demos que convertem 3x mais do que a média do mercado..."
        className="min-h-[100px] bg-white border-gray-200 focus:border-black text-gray-900"
        required
      />
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <span className="font-semibold text-black">Caracteres:</span>
        <span>{excerpt.length}/160</span>
        <span className="text-gray-400">•</span>
        <span className={excerpt.length > 160 ? 'text-red-600 font-semibold' : 'text-revgreen'}>
          {excerpt.length <= 160 ? 'Ideal para SEO' : 'Muito longo'}
        </span>
      </div>
    </div>

    {/* Corpo do Artigo */}
    <div className="p-5 bg-white border-2 border-gray-200 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-revgreen rounded-full flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-black" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-black mb-1">
                Corpo do Artigo *
              </label>
              <p className="text-xs text-gray-600">
                Cole o texto puro. O sistema formatará automaticamente.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-gray-100"
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
        className="min-h-[500px] font-mono text-sm bg-gray-50 border-gray-200 focus:border-black text-gray-900 placeholder:text-gray-400"
        required
      />

      {/* Dica de Sintaxe - Ultra Minimalista */}
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
        <div className="flex items-start gap-2">
          <div className="w-1 h-full bg-revgreen rounded-full shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-black mb-2">Sintaxe Suportada:</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">##</code>
                <span>Título H2</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">###</code>
                <span>Subtítulo H3</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">-</code>
                <span>Lista</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">1.</code>
                <span>Lista numerada</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">**</code>
                <span>Negrito</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">*</code>
                <span>Itálico</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">{">"}</code>
                <span>Citação</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-black">---</code>
                <span>Divisor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de Palavras */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span><strong className="text-black">{content.split(/\s+/).filter(w => w).length}</strong> palavras</span>
          <span className="text-gray-400">•</span>
          <span><strong className="text-black">{readTime}</strong> de leitura</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-gray-300 hover:border-black"
        >
          <Eye className="w-3 h-3 mr-1" /> Preview
        </Button>
      </div>
    </div>
  </div>
</div>
```

## 🎨 Diferenciação Visual (Ultra Minimalista):

### **Resumo de Impacto:**
- ✅ Background: `bg-gray-50`
- ✅ Borda esquerda verde: `border-l-4 border-revgreen`
- ✅ Ícone: Preto com verde
- ✅ Contador: Preto/Cinza/Verde

### **Corpo do Artigo:**
- ✅ Background: `bg-white`
- ✅ Borda dupla: `border-2 border-gray-200`
- ✅ Ícone: Verde com preto
- ✅ Textarea: `bg-gray-50`
- ✅ Sintaxe: Grid limpo com códigos em caixas brancas

---

## 🎯 Cores Usadas:

```
Resumo:
├─ Background: Cinza claro (#f9fafb)
├─ Borda: Verde (#10b981)
└─ Ícone: Preto + Verde

Artigo:
├─ Background: Branco (#ffffff)
├─ Borda: Cinza (#e5e7eb)
└─ Ícone: Verde + Preto
```

**100% Ultra Minimalista. Sem azul. Apenas as cores da marca!** ✅

**Aplicar agora?** 🚀
