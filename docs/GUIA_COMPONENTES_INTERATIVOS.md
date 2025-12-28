# 🎨 GUIA DE COMPONENTES INTERATIVOS PARA ARTIGOS

## 🎯 Objetivo:
Tornar os artigos mais **interativos, visuais e engajadores** usando componentes prontos.

---

## 📦 COMPONENTES DISPONÍVEIS:

### 1. **Steps (Passos Numerados)**
**Quando usar:** Processos, roadmaps, timelines

**Componente:** `ArticleSteps`

**Exemplo de uso no JSON:**
```json
{
  "type": "steps",
  "title": "Lançando o Piloto em 30 Dias",
  "steps": [
    {
      "number": "01",
      "title": "Seleção (Dia 1-7)",
      "description": "Use dados de intenção e firmográficos para selecionar as 20 contas com maior propensão de compra.",
      "variant": "light"
    },
    {
      "number": "02",
      "title": "Intelligence (Dia 8-14)",
      "description": "Crie dossiês de inteligência para cada conta. Notícias recentes, relatórios anuais, podcasts onde os diretores falaram.",
      "variant": "dark"
    },
    {
      "number": "03",
      "title": "Ativação (Dia 15+)",
      "description": "Inicie a campanha de Ads e a cadência de prospecção personalizada baseada nos dossiês criados.",
      "variant": "light"
    }
  ]
}
```

---

### 2. **Result Box (Caixa de Resultado)**
**Quando usar:** Destacar métricas, resultados, conquistas

**Componente:** Inline no conteúdo

**Exemplo:**
```json
{
  "type": "result",
  "label": "RESULT",
  "text": "Taxa de abertura de porta de 40% em contas F500."
}
```

**Ou use diretamente no markdown:**
```markdown
> **RESULT:** Taxa de abertura de porta de 40% em contas F500.
```

---

### 3. **Stack de Tecnologias**
**Quando usar:** Listar ferramentas, tecnologias, frameworks

**Componente:** `ArticleStack`

**Exemplo:**
```json
{
  "type": "stack",
  "title": "Stack de ABM Moderno",
  "categories": [
    {
      "name": "Intent Data",
      "tools": ["6sense", "Bombora"]
    },
    {
      "name": "Ad Targeting",
      "tools": ["LinkedIn", "Terminus"]
    },
    {
      "name": "Personalization",
      "tools": ["Mutiny", "Uberflip"]
    },
    {
      "name": "Gifting/Direct Mail",
      "tools": ["Reachdesk", "Sendoso"]
    }
  ]
}
```

---

### 4. **Red Flags (Alertas)**
**Quando usar:** Listar erros comuns, armadilhas, sinais de alerta

**Componente:** `ArticleRedFlags`

**Exemplo:**
```json
{
  "type": "red_flags",
  "title": "Por que seu ABM vai falhar",
  "items": [
    {
      "title": "Vendas e Marketing desalinhados",
      "description": "Marketing gera 'leads', vendas ignora"
    },
    {
      "title": "Falta de paciência",
      "description": "O ciclo de vendas Enterprise é de 6-12 meses, não espere ROI em 30 dias"
    },
    {
      "title": "Conteúdo fraco",
      "description": "Enviar whitepaper genérico para um CTO é pedir para ser bloqueado"
    }
  ]
}
```

---

### 5. **Tiers/Cards (Níveis)**
**Quando usar:** Comparar estratégias, níveis, planos

**Componente:** `ArticleBlueprint` ou custom cards

**Exemplo:**
```json
{
  "type": "tiers",
  "title": "Os 3 Níveis de Ataque",
  "description": "Segmente sua lista em camadas (Tiers) e ajuste o esforço de engenharia para cada uma.",
  "tiers": [
    {
      "name": "Tier 1",
      "subtitle": "STRATEGIC (1:1)",
      "highlight": "limitado",
      "description": "Top 10 contas. Orçamento limitado. Campanha feita do zero exclusivamente para elas."
    },
    {
      "name": "Tier 2",
      "subtitle": "SCALE (1:FEW)",
      "description": "Top 50 contas. Segmentadas por indústria. Conteúdo adaptado, não exclusivo."
    },
    {
      "name": "Tier 3",
      "subtitle": "PROGRAMMATIC (1:MANY)",
      "description": "Top 500 contas. Personalização via token (Nome/Empresa) e Ads dinâmicos."
    }
  ]
}
```

---

### 6. **Takeaways (Principais Aprendizados)**
**Quando usar:** Resumir pontos-chave no início ou fim

**Componente:** `ArticleTakeaways`

**Exemplo:**
```json
{
  "type": "takeaways",
  "title": "Key Takeaways",
  "items": [
    {
      "title": "Qualidade > Quantidade",
      "description": "20 contas bem trabalhadas valem mais que 1.000 leads frios."
    },
    {
      "title": "Inteligência é Tudo",
      "description": "Dossiês personalizados aumentam taxa de resposta em 300%."
    }
  ]
}
```

---

### 7. **Info Box (Caixa de Informação)**
**Quando usar:** Definições, conceitos, explicações

**Componente:** `ArticleInfoBox`

**Exemplo:**
```json
{
  "type": "info_box",
  "title": "O que é ABM?",
  "content": "Account-Based Marketing é uma estratégia B2B onde marketing e vendas trabalham juntos para criar campanhas personalizadas para contas específicas de alto valor."
}
```

---

## 🎨 COMO USAR NO EDITOR:

### **Opção 1: Formato JSON V2** (Recomendado)
Cole o JSON completo no campo "Corpo do Artigo":

```json
{
  "sections": [
    {
      "type": "strategic_context",
      "content": "Introdução do artigo..."
    },
    {
      "type": "steps",
      "title": "Lançando o Piloto em 30 Dias",
      "steps": [...]
    },
    {
      "type": "red_flags",
      "title": "Por que seu ABM vai falhar",
      "items": [...]
    }
  ]
}
```

### **Opção 2: Markdown Simples**
Use markdown normal e o sistema vai renderizar:

```markdown
## Título Principal

Parágrafo normal com **negrito** e *itálico*.

### Subtítulo

- Item de lista 1
- Item de lista 2

> Citação importante
> — Autor

---

Outro parágrafo...
```

---

## 📋 TEMPLATE COMPLETO DE ARTIGO INTERATIVO:

```json
{
  "sections": [
    {
      "type": "strategic_context",
      "content": "Contexto estratégico que prende a atenção..."
    },
    {
      "type": "key_takeaways",
      "title": "Key Takeaways",
      "items": [
        {
          "title": "Ponto 1",
          "description": "Descrição..."
        }
      ]
    },
    {
      "type": "steps",
      "title": "Framework Passo a Passo",
      "steps": [...]
    },
    {
      "type": "stack",
      "title": "Stack Tecnológica",
      "categories": [...]
    },
    {
      "type": "red_flags",
      "title": "Erros Comuns",
      "items": [...]
    },
    {
      "type": "tiers",
      "title": "Níveis de Implementação",
      "tiers": [...]
    },
    {
      "type": "cta",
      "title": "Próximos Passos",
      "description": "Quer ajuda para implementar?",
      "button_text": "Falar com um Especialista",
      "button_link": "#"
    }
  ]
}
```

---

## 🚀 PRÓXIMOS PASSOS:

1. **Execute `CRIAR_POLICIES_COMPLETAS.sql`** para corrigir permissões
2. **Teste criar um artigo** usando o template acima
3. **Veja o resultado** no frontend

**Quer que eu crie um artigo de exemplo usando todos esses componentes?** 🎯
