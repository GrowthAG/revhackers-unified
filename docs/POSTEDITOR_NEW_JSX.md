# PostEditor - Novo JSX (Redesign Completo)

## Substituir o return() atual (linha 322-759) por:

```tsx
  // Helper Component: Section Header
  const SectionHeader = ({ number, title }: { number: string; title: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
        {number}
      </div>
      <h3 className="text-sm font-bold text-black uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/posts')} 
          className="text-gray-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="border-gray-300"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Rascunho
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSaving}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Publicar
          </Button>
        </div>
      </div>

      {/* Seção 1: Informações Básicas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <SectionHeader number="1" title="Informações Básicas" />
        
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Título do Artigo *
            </label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Ex: Anatomia da Demo Perfeita..."
              className="h-11"
              required
            />
          </div>

          {/* Slug + Categoria */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
                URL (Slug) *
              </label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-do-post"
                className="h-11 bg-gray-50"
                disabled={!isEditing}
              />
              <p className="text-xs text-gray-400 mt-1">Auto-gerado a partir do título</p>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Categoria *
              </label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Capa do Artigo */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <SectionHeader number="2" title="Capa do Artigo" />
        
        <div className="space-y-4">
          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagem de Capa
            </label>
            {coverImage ? (
              <div className="relative">
                <img src={coverImage} alt="Capa" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setCoverImage('')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="cover-upload"
                />
                <label htmlFor="cover-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Clique para fazer upload</p>
                  <p className="text-xs text-gray-400 mt-1">1200x630px sugerido</p>
                </label>
              </div>
            )}
          </div>

          {/* Gerador de Prompt AI (Colapsável) */}
          <Collapsible open={promptExpanded} onOpenChange={setPromptExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-revgreen" />
                  Gerador de Prompt AI (opcional)
                </span>
                {promptExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Objeto Visual
                  </label>
                  <Input
                    value={promptObject}
                    onChange={(e) => setPromptObject(e.target.value)}
                    placeholder="Ex: Glass Rocket, Shield, Brain..."
                    className="h-9 text-sm"
                  />
                </div>
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    {generatePrompt()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPromptToClipboard}
                  className="w-full"
                >
                  <Copy className="mr-2 h-3 w-3" /> Copiar Prompt
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Seção 3: Conteúdo */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <SectionHeader number="3" title="Conteúdo" />
        
        <div className="space-y-4">
          {/* Resumo */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
              Resumo de Impacto (Excerpt) *
            </label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Uma ou duas frases que vendem o clique no artigo..."
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Corpo do Artigo */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                  Corpo do Artigo *
                </label>
                <p className="text-xs text-gray-500 mt-0.5">Cole o texto puro. O sistema formatará automaticamente.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={insertV2Template}
              >
                <FileText className="w-3 h-3 mr-1" /> Usar Template V2
              </Button>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Cole o texto do artigo aqui. Use linhas vazias para separar parágrafos, ## para títulos, - para listas..."
              className="min-h-[400px] font-mono text-sm"
              required
            />
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border border-gray-100 mt-2">
              <span className="font-semibold">Dica:</span>
              <span>## Título | - Lista | **Negrito** | *Itálico* | {">"} Citação</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 4: Publicação */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <SectionHeader number="4" title="Publicação" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published" className="text-sm font-medium cursor-pointer">
              {published ? 'Publicado' : 'Rascunho'}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
```

## Mudanças Principais:

1. ✅ Removido `<Tabs>` completamente
2. ✅ Criado `SectionHeader` helper component
3. ✅ 4 seções numeradas claramente definidas
4. ✅ Gerador de Prompt colapsável
5. ✅ Layout linear e fluido
6. ✅ Botões de ação no topo
7. ✅ Espaçamento consistente (space-y-6)

## Próximo Passo:

Aplicar esta mudança substituindo o return() atual?
