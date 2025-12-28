# RevHackers Article Design System
**Ultra Minimalist Editorial Standard**

---

## 🎯 Princípios de Design

1. **Clareza Absoluta** - Cada elemento tem um propósito claro
2. **Hierarquia Visual** - O olho flui naturalmente pelo conteúdo
3. **Respiração** - Espaçamento generoso, nunca apertado
4. **Consistência** - Todos os artigos seguem o mesmo padrão
5. **Zero Vibecode** - Sem gradientes, sombras exageradas ou animações desnecessárias

---

## 📐 Typography System

### Família de Fontes
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Escala Tipográfica

| Elemento | Tamanho | Peso | Line Height | Cor | Uso |
|----------|---------|------|-------------|-----|-----|
| **H1** | 36px | 700 | 1.2 | #000 | Título principal (Hero) |
| **H2** | 28px | 700 | 1.3 | #000 | Seções principais |
| **H3** | 22px | 600 | 1.4 | #1a1a1a | Subseções |
| **H4** | 18px | 600 | 1.4 | #1a1a1a | Detalhes |
| **Body** | 17px | 400 | 1.7 | #374151 | Texto corrido |
| **Lead** | 20px | 400 | 1.6 | #4b5563 | Parágrafo de abertura |
| **Caption** | 14px | 400 | 1.5 | #6b7280 | Legendas, notas |
| **Small** | 13px | 400 | 1.5 | #9ca3af | Metadados |

---

## 📏 Spacing System

### Vertical Rhythm
```
- Entre H2 e conteúdo: 16px
- Entre parágrafos: 24px
- Entre seções (H2): 64px
- Entre H3 e conteúdo: 12px
- Antes de listas: 16px
- Depois de listas: 24px
- Antes de blockquote: 32px
- Depois de blockquote: 32px
```

### Container
```
- Max-width: 720px (leitura confortável)
- Padding lateral: 24px (mobile) / 0px (desktop)
- Margin auto (centralizado)
```

---

## 🧩 Componentes HTML

### 1. Parágrafo (Body Text)
```html
<p class="article-body">
  RevOps alinha Marketing, Vendas e Customer Success em torno de uma única métrica: receita.
</p>
```
**CSS:**
```css
.article-body {
  font-size: 17px;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 24px;
}
```

---

### 2. Parágrafo de Abertura (Lead)
```html
<p class="article-lead">
  Neste artigo, vamos explorar como implementar RevOps de forma prática.
</p>
```
**CSS:**
```css
.article-lead {
  font-size: 20px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 32px;
}
```

---

### 3. Títulos de Seção (H2)
```html
<h2 class="article-h2">Por que RevOps é importante?</h2>
```
**CSS:**
```css
.article-h2 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: #000;
  margin-top: 64px;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
```

---

### 4. Subtítulos (H3)
```html
<h3 class="article-h3">Benefícios principais</h3>
```
**CSS:**
```css
.article-h3 {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  color: #1a1a1a;
  margin-top: 40px;
  margin-bottom: 12px;
}
```

---

### 5. Listas (Bullets)
```html
<ul class="article-list">
  <li>Redução de atrito entre times</li>
  <li>Visibilidade completa do funil</li>
  <li>Decisões baseadas em dados</li>
</ul>
```
**CSS:**
```css
.article-list {
  margin: 16px 0 24px 0;
  padding-left: 24px;
}

.article-list li {
  font-size: 17px;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 8px;
  padding-left: 8px;
}

.article-list li::marker {
  color: #000;
  font-size: 14px;
}
```

---

### 6. Listas Numeradas
```html
<ol class="article-list-numbered">
  <li>Alinhe métricas entre times</li>
  <li>Implemente ferramentas integradas</li>
  <li>Crie dashboards compartilhados</li>
</ol>
```
**CSS:**
```css
.article-list-numbered {
  margin: 16px 0 24px 0;
  padding-left: 24px;
  counter-reset: item;
}

.article-list-numbered li {
  font-size: 17px;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 12px;
  padding-left: 8px;
}

.article-list-numbered li::marker {
  color: #000;
  font-weight: 600;
}
```

---

### 7. Citações (Blockquote)
```html
<blockquote class="article-quote">
  <p>"RevOps é o sistema operacional da receita."</p>
  <cite>— Jason Lemkin, SaaStr</cite>
</blockquote>
```
**CSS:**
```css
.article-quote {
  margin: 32px 0;
  padding-left: 24px;
  border-left: 3px solid #000;
  font-style: italic;
}

.article-quote p {
  font-size: 20px;
  line-height: 1.6;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.article-quote cite {
  font-size: 15px;
  font-style: normal;
  color: #6b7280;
  font-weight: 500;
}
```

---

### 8. Destaque Inline (Bold/Strong)
```html
<p>O primeiro passo é <strong>alinhar as métricas</strong> entre todos os times.</p>
```
**CSS:**
```css
.article-body strong {
  font-weight: 600;
  color: #000;
}
```

---

### 9. Ênfase (Italic)
```html
<p>Isso é <em>fundamental</em> para o sucesso.</p>
```
**CSS:**
```css
.article-body em {
  font-style: italic;
  color: #1a1a1a;
}
```

---

### 10. Info Box (Nota/Aviso)
```html
<div class="article-info-box">
  <div class="article-info-icon">💡</div>
  <div class="article-info-content">
    <strong>Dica Prática:</strong> Comece com uma métrica simples como MRR antes de expandir.
  </div>
</div>
```
**CSS:**
```css
.article-info-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 24px 0;
}

.article-info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.article-info-content {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
}

.article-info-content strong {
  color: #000;
  font-weight: 600;
}
```

---

### 11. Divisor de Seção
```html
<hr class="article-divider" />
```
**CSS:**
```css
.article-divider {
  border: none;
  height: 1px;
  background: #e5e7eb;
  margin: 48px 0;
}
```

---

### 12. Imagem com Legenda
```html
<figure class="article-figure">
  <img src="/path/to/image.jpg" alt="Descrição" class="article-image" />
  <figcaption class="article-caption">Figura 1: Dashboard de RevOps integrado</figcaption>
</figure>
```
**CSS:**
```css
.article-figure {
  margin: 32px 0;
}

.article-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.article-caption {
  font-size: 14px;
  line-height: 1.5;
  color: #6b7280;
  text-align: center;
  margin-top: 8px;
  font-style: italic;
}
```

---

### 13. CTA (Call-to-Action)
```html
<div class="article-cta">
  <h3>Quer implementar RevOps na sua empresa?</h3>
  <p>Faça um diagnóstico gratuito com nossos especialistas.</p>
  <a href="/diagnostico" class="article-cta-button">Agendar Diagnóstico</a>
</div>
```
**CSS:**
```css
.article-cta {
  margin: 64px 0 32px 0;
  padding: 32px;
  background: #000;
  border-radius: 12px;
  text-align: center;
}

.article-cta h3 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.article-cta p {
  font-size: 16px;
  color: #d1d5db;
  margin-bottom: 20px;
}

.article-cta-button {
  display: inline-block;
  padding: 12px 32px;
  background: #10b981;
  color: #000;
  font-weight: 600;
  font-size: 15px;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s;
}

.article-cta-button:hover {
  background: #059669;
}
```

---

### 14. Tabela Comparativa
```html
<div class="article-table-wrapper">
  <table class="article-table">
    <thead>
      <tr>
        <th>Métrica</th>
        <th>Antes</th>
        <th>Depois</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>CAC</td>
        <td>$500</td>
        <td>$350</td>
      </tr>
      <tr>
        <td>LTV</td>
        <td>$2,000</td>
        <td>$3,500</td>
      </tr>
    </tbody>
  </table>
</div>
```
**CSS:**
```css
.article-table-wrapper {
  overflow-x: auto;
  margin: 24px 0;
}

.article-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.article-table th {
  text-align: left;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #000;
}

.article-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}

.article-table tr:last-child td {
  border-bottom: none;
}
```

---

## 🎨 Paleta de Cores

```
Preto Principal: #000000
Preto Suave: #1a1a1a
Cinza Escuro (Texto): #374151
Cinza Médio: #6b7280
Cinza Claro: #9ca3af
Cinza Muito Claro: #e5e7eb
Fundo Claro: #f9fafb
Branco: #ffffff
Accent (RevGreen): #10b981
```

---

## 📱 Responsividade

### Mobile (<768px)
```css
@media (max-width: 768px) {
  .article-h2 { font-size: 24px; }
  .article-h3 { font-size: 20px; }
  .article-body { font-size: 16px; }
  .article-lead { font-size: 18px; }
  .article-quote p { font-size: 18px; }
}
```

---

## ✅ Checklist de Qualidade

Antes de publicar um artigo, verificar:
- [ ] Título H2 para cada seção principal
- [ ] Parágrafos com no máximo 4 linhas
- [ ] Listas usadas para enumerar pontos
- [ ] Pelo menos 1 citação ou destaque
- [ ] CTA no final do artigo
- [ ] Imagens com legendas descritivas
- [ ] Espaçamento consistente
- [ ] Sem "walls of text" (blocos de texto muito longos)

---

## 🚀 Próximos Passos

1. Implementar componente `ArticleRenderer.tsx`
2. Criar parser de texto puro → HTML
3. Aplicar CSS global para artigos
4. Testar com artigo real
5. Documentar exemplos de uso
