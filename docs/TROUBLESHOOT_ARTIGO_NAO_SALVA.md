# 🔍 TROUBLESHOOTING: Artigo Não Salva no Supabase

## ❌ Problema:
Artigo criado no admin não aparece no banco de dados.

## 🎯 Possíveis Causas:

### 1. **Erro de Permissão (RLS)**
**Sintoma:** Toast de erro aparece
**Solução:** Verificar políticas RLS da tabela `blog_posts`

```sql
-- Ver políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'blog_posts';

-- Criar política de INSERT se não existir
CREATE POLICY "Users can insert blog posts"
ON blog_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);
```

---

### 2. **Sessão Expirada**
**Sintoma:** Erro "author_id is required"
**Solução:** Fazer logout e login novamente

---

### 3. **Campo Obrigatório Faltando**
**Sintoma:** Toast "Preencha todos os campos obrigatórios"
**Campos obrigatórios:**
- ✅ Título
- ✅ Slug
- ✅ Resumo (Excerpt)
- ✅ Categoria

---

### 4. **Erro no Console do Navegador**
**Como verificar:**
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Procure por erros em vermelho
4. Procure por `❌ Erro no Insert Supabase:`

---

## ✅ SOLUÇÃO RÁPIDA:

### Passo 1: Verificar Console
Abra o DevTools e veja se há erros.

### Passo 2: Verificar Supabase Studio
1. Abra `http://localhost:54323`
2. Vá em **Table Editor** → `blog_posts`
3. Veja se o artigo está lá (mesmo como rascunho)

### Passo 3: Testar Permissões
Execute no SQL Editor do Supabase:

```sql
-- Ver se você está autenticado
SELECT auth.uid();

-- Tentar inserir manualmente
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  author_id,
  published,
  date,
  read_time
) VALUES (
  'Teste Manual',
  'teste-manual',
  'Teste de inserção manual',
  'Conteúdo de teste',
  'RevOps',
  auth.uid(),
  false,
  NOW(),
  '5 min'
);

-- Se der erro, copie a mensagem
```

---

## 🚨 ERRO COMUM: Permissões RLS

Se você ver erro tipo:
```
new row violates row-level security policy
```

**Execute:**
```sql
-- Desabilitar RLS temporariamente (APENAS PARA TESTE LOCAL)
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- Ou criar política permissiva
CREATE POLICY "Allow all for authenticated users"
ON blog_posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## 📋 CHECKLIST DE DEBUG:

- [ ] Abrir DevTools (F12) e verificar Console
- [ ] Verificar se toast de erro apareceu
- [ ] Verificar Supabase Studio (`http://localhost:54323`)
- [ ] Verificar se está logado no admin
- [ ] Testar inserção manual via SQL
- [ ] Verificar políticas RLS
- [ ] Verificar se todos os campos obrigatórios foram preenchidos

---

## 💡 PRÓXIMO PASSO:

**Me diga:**
1. Você viu algum toast de erro?
2. Tem algum erro no Console (F12)?
3. Consegue acessar o Supabase Studio?

Vou te ajudar a resolver! 🚀
