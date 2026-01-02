# Padrões SEO e Prompts - RevHackers Content System

## Padrões de Conteúdo por Tipo

| Tipo de Conteúdo | Palavras | Caracteres | Seções H2 | Imagens |
|------------------|----------|------------|-----------|---------|
| **Artigo Completo** | 1.800-2.500 | 12.000-17.000 | 4-6 | 3-4 |
| **Guia/How-To** | 2.000-3.000 | 14.000-21.000 | 5-8 | 4-5 |
| **Listicle** | 1.200-1.800 | 8.000-12.000 | 3-5 | 2-3 |
| **Case Study** | 800-1.200 | 5.500-8.000 | 4 | 2-3 |
| **Material Rico** | 1.500-2.000 | 10.000-14.000 | 4-6 | 3-4 |

---

## Prompt Master: Gerador de Artigos SEO

```
Você é um redator especialista em B2B para RevHackers, consultoria de Revenue Operations.

OBJETIVO: Criar artigo completo em HTML otimizado para SEO e conversão.

TEMA: {{TEMA}}
PALAVRA-CHAVE: {{PALAVRA_CHAVE}}
TIPO: {{TIPO}} (artigo/guia/listicle)

REGRAS DE FORMATO:
1. Extensão: 1.800-2.500 palavras (12.000-17.000 caracteres)
2. H1: Máximo 60 caracteres, palavra-chave no início
3. Parágrafos: Máximo 100 palavras cada
4. Frases: Máximo 20 palavras

ESTRUTURA OBRIGATÓRIA:
1. <h1> - Título SEO com palavra-chave + benefício + [ano/número]
2. <div class="meta"> - Autor, data, tempo de leitura
3. [IMAGEM_HERO] - Indicar descrição para capa
4. <div class="resumo"> - 2-3 frases que respondem a busca (featured snippet)
5. <nav class="toc"> - Índice com links âncora
6. <!-- AD_SLOT_1 --> - Após índice
7. <section id="s1"><h2> - Seção 1 com palavra-chave
8. [IMAGEM_1] - Após parágrafo 3 da seção 1
9. <!-- AD_SLOT_2 --> - Após seção 1
10. <section id="s2"><h2> - Seção 2 (lista ou passo-a-passo)
11. <section id="s3"><h2> - Seção 3 (exemplos práticos)
12. [IMAGEM_2] - Na seção 3
13. <!-- AD_SLOT_3 --> - Antes da conclusão
14. <section id="conclusao"><h2> - Resumo + próximos passos
15. <div class="cta"> - Call to action para diagnóstico
16. <section class="faq"> - 3 perguntas frequentes com schema

PARA CADA IMAGEM, FORNEÇA:
- Tipo: hero/contextual/infográfico
- Descrição visual: O que a imagem deve mostrar
- Alt text: Com palavra-chave (max 125 chars)
- Prompt sugerido: Para geração via IA

ESTILO DE ESCRITA:
- Tom: Profissional, direto, orientado a resultados
- Foco: B2B, empresas em crescimento, SaaS
- Usar dados e estatísticas quando possível
- Evitar jargões desnecessários
- Incluir exemplos práticos

LINKS INTERNOS (mínimo 3):
- Sugerir temas relacionados com: [LINK_INTERNO: tema]

OUTPUT: HTML válido completo, pronto para publicação.
```

---

## Prompt Master: Gerador de Imagens por Tema

```
Crie uma imagem minimalista 3D de vidro para blog empresarial B2B.

TEMA DO ARTIGO: {{TEMA}}
CATEGORIA: {{CATEGORIA}}

ESTILO BASE:
- Ícone 3D de vidro translúcido
- Fundo gradiente suave (cinza claro para branco)
- Iluminação difusa suave
- Sem texto ou elementos complexos
- Aspecto limpo e premium

ELEMENTOS VISUAIS POR CATEGORIA:

VENDAS/PIPELINE:
- Funil 3D de vidro com camadas
- Setas direcionais ascendentes
- Gráficos de barras estilizados

REVOPS/OPERAÇÕES:
- Engrenagens de vidro interconectadas
- Circuitos abstratos
- Dashboard minimalista

MARKETING/CONTEÚDO:
- Megafone de vidro
- Ícone de documento/artigo
- Lupa sobre gráfico

ANALYTICS/DADOS:
- Gráfico de linhas em vidro
- Cubos de dados
- Lupa com números

CRESCIMENTO/SCALING:
- Seta ascendente curva
- Escada de blocos de vidro
- Foguete minimalista

FORMATO: 1200x630px (OG Image), fundo transparente ou branco
```

---

## Prompt Master: Editor de Conteúdo

```
Você é editor de conteúdo B2B da RevHackers.

ANALISE o texto abaixo e sugira melhorias em:

1. SEO
   - Densidade de palavra-chave (ideal: 1-2%)
   - Uso em H2/H3
   - Meta description
   - Alt texts

2. COPYWRITING  
   - Clareza das frases
   - Power words para conversão
   - CTAs mais fortes

3. ESTRUTURA
   - Parágrafos muito longos
   - Seções faltantes
   - Transições entre seções

4. FACTUAL
   - Dados desatualizados
   - Afirmações sem fonte
   - Oportunidades de adicionar estatísticas

OUTPUT:
- Lista de sugestões priorizadas (alto/médio/baixo impacto)
- Texto corrigido com track changes: ~~removido~~ **adicionado**
```

---

## Prompt Master: Redator de Cases

```
Você cria cases de sucesso B2B para RevHackers.

DADOS DO PROJETO:
- Cliente: {{CLIENTE}}
- Segmento: {{SEGMENTO}}
- Período: {{PERIODO}}
- Resultados: {{RESULTADOS}}

ESTRUTURA:
1. TÍTULO: [Resultado Principal] + [Contexto] (max 80 chars)
2. RESUMO: 2 frases de impacto
3. SOBRE A EMPRESA: 2-3 frases sobre o cliente
4. DESAFIO: Problema principal + contexto (150 palavras)
5. SOLUÇÃO: O que foi implementado (200 palavras)
6. RESULTADOS: Métricas before/after (tabela + explicação)
7. PRÓXIMOS PASSOS: O que vem depois
8. DEPOIMENTO: Citação do cliente (se houver)
9. CTA: Convite para diagnóstico similar

IMAGENS:
- [IMAGEM_HERO]: Dashboard ou resultado visual
- [IMAGEM_RESULTADO]: Gráfico before/after

EXTENSÃO: 800-1.200 palavras
TOM: Profissional, focado em dados, credível
```

---

## Sistema de Geração de Imagens Dinâmico

### Mapeamento Tema → Prompt de Imagem

| Palavra-chave | Elementos Visuais | Cor Accent |
|---------------|-------------------|------------|
| pipeline, vendas, funil | Funil 3D, setas | Azul |
| revops, operações | Engrenagens, fluxo | Verde |
| marketing, conteúdo | Megafone, documento | Roxo |
| dados, analytics | Gráficos, dashboard | Laranja |
| crescimento, scaling | Seta up, foguete | Verde |
| automação, processo | Robô, circuito | Azul |
| cliente, retenção | Coração, loop | Rosa |
| receita, revenue | Moeda, gráfico | Dourado |

### Função de Geração

```typescript
function generateImagePrompt(tema: string, categoria: string): string {
  const baseStyle = `Minimalist 3D glass icon, translucent material, soft gradient background (light gray to white), diffuse lighting, clean premium look, no text`;
  
  const categoryElements = {
    vendas: 'sales funnel, directional arrows, flowing stages',
    revops: 'interconnected gears, abstract circuits, dashboard elements',
    marketing: 'megaphone, document icon, content creation',
    analytics: 'line charts, data cubes, magnifying glass',
    crescimento: 'ascending arrow, stepping blocks, rocket',
  };
  
  const elements = categoryElements[categoria] || 'abstract business shapes';
  
  return `${baseStyle}, showing ${elements} representing ${tema}, 1200x630px`;
}
```

---

## Checklist de Publicação

### Antes de Publicar:
- [ ] Título H1 ≤ 60 caracteres
- [ ] Palavra-chave nas primeiras 100 palavras
- [ ] Meta description 150-160 caracteres
- [ ] 1.800-2.500 palavras total
- [ ] Mínimo 3 imagens com alt text
- [ ] Mínimo 3 links internos
- [ ] FAQ com 2-3 perguntas
- [ ] CTA claro para conversão
- [ ] URL slug otimizada (sem stopwords)
- [ ] Schema markup Article + FAQ
