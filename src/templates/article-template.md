# Template de Artigo RevHackers

## Padrão de Formatação

### Estatísticas Obrigatórias
- **Palavras:** 1.800 - 2.500
- **Caracteres:** ~12.000 - 17.000
- **Tempo de leitura:** 7-10 minutos
- **Seções H2:** 4-6
- **Imagens:** 3 (hero + 2 contextuais)

---

## Estrutura HTML

```html
<!-- TÍTULO -->
<h1>Palavra-chave no Início: Título de até 60 caracteres</h1>

<!-- HERO IMAGE -->
[IMAGEM_HERO]
<!-- Descrição: Visual representando o tema principal -->
<!-- Alt: "palavra-chave - descrição breve" -->

<!-- FEATURED SNIPPET -->
<div class="featured-snippet">
  📌 <strong>Resumo:</strong> [50 palavras resumindo o artigo]
</div>

<!-- ÍNDICE -->
<nav class="toc">
  <h2>Neste artigo</h2>
  <ul>
    <li><a href="#secao-1">Seção 1</a></li>
    <li><a href="#secao-2">Seção 2</a></li>
  </ul>
</nav>

<!-- INTRODUÇÃO -->
<p>Parágrafo de abertura com problema + promessa de solução (100 palavras)</p>

<!-- SEÇÃO 1 -->
<h2 id="secao-1">Seção Principal 1</h2>
<p>Conteúdo com dados e estatísticas (300-400 palavras)</p>

<!-- DICA -->
<blockquote class="tip">
  💡 <strong>Dica:</strong> Insight prático para o leitor
</blockquote>

<!-- SEÇÃO 2 -->
<h2 id="secao-2">Seção Principal 2</h2>
<p>Conteúdo...</p>

<!-- IMAGEM CONTEXTUAL 1 -->
[IMAGEM_CONTEXTUAL_1]

<!-- TABELA COMPARATIVA -->
<table>
  <thead>
    <tr><th>Aspecto</th><th>Antes</th><th>Depois</th></tr>
  </thead>
  <tbody>
    <tr><td>Métrica</td><td>Valor A</td><td>Valor B</td></tr>
  </tbody>
</table>

<!-- LISTA COM ÍCONES -->
<ul class="icon-list">
  <li>✅ Benefício 1</li>
  <li>✅ Benefício 2</li>
  <li>✅ Benefício 3</li>
</ul>

<!-- IMAGEM CONTEXTUAL 2 -->
[IMAGEM_CONTEXTUAL_2]

<!-- CITAÇÃO -->
<blockquote class="quote">
  "Citação de especialista ou cliente relevante."
  <cite>— Nome, Cargo na Empresa</cite>
</blockquote>

<!-- CONCLUSÃO -->
<h2>Conclusão</h2>
<p>Resumo dos pontos + CTA (150 palavras)</p>

<div class="cta-box">
  <strong>Próximo passo:</strong> 
  <a href="/agendar">Agende um diagnóstico gratuito</a>
</div>

<!-- FAQ -->
<section class="faq" itemscope itemtype="https://schema.org/FAQPage">
  <h2>Perguntas Frequentes</h2>
  
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Pergunta 1?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Resposta 1.</p>
    </div>
  </div>
</section>
```

## Checklist de Validação

- [ ] Título com palavra-chave no início (máx 60 chars)
- [ ] Contagem: 1.800-2.500 palavras
- [ ] 3 placeholders de imagem
- [ ] Featured snippet no início
- [ ] Índice/TOC com links âncora
- [ ] Pelo menos 1 tabela
- [ ] Pelo menos 1 blockquote de dica
- [ ] Lista com ícones/emojis
- [ ] FAQ com schema markup
- [ ] CTA na conclusão
