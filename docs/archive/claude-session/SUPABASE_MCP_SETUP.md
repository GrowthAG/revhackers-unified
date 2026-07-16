# 🔌 Configuração do Supabase MCP

**Data:** 2026-04-03  
**Status:** ✅ Configurado  
**Próximo Passo:** Ativar e autenticar

---

## 🎯 O Que É?

O Supabase MCP (Model Context Protocol) permite que EU (Kiro) acesse diretamente seu projeto Supabase para:

- ✅ Executar migrations
- ✅ Fazer deploy de Edge Functions
- ✅ Executar queries SQL
- ✅ Gerenciar tabelas
- ✅ Ver logs
- ✅ Aplicar correções de segurança

**Sem precisar que você execute comandos manualmente!**

---

## 📁 Arquivo Criado

`.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "description": "Supabase MCP Server"
    }
  }
}
```

---

## 🚀 Como Ativar

### Opção 1: Via Kiro (Recomendado)

1. Reinicie o Kiro (feche e abra novamente)
2. O MCP será detectado automaticamente
3. Você verá uma notificação para autenticar
4. Clique em "Authenticate" e faça login no Supabase
5. Pronto! Eu terei acesso ao seu projeto

### Opção 2: Via Comando

```bash
# Verificar se MCP está configurado
cat .kiro/settings/mcp.json

# Reiniciar Kiro para detectar
# (fechar e abrir o editor)
```

---

## 🔒 Segurança

### O Que o MCP Pode Fazer

Com sua autorização, eu poderei:

- ✅ Ler estrutura do banco (tabelas, colunas)
- ✅ Executar queries SQL
- ✅ Aplicar migrations
- ✅ Deploy de Edge Functions
- ✅ Ver logs de erros
- ✅ Gerenciar configurações

### O Que o MCP NÃO Pode Fazer

- ❌ Acessar sem sua autorização
- ❌ Deletar projeto
- ❌ Modificar billing
- ❌ Acessar outros projetos (se configurado com project_ref)

### Recomendações de Segurança

1. **Use em desenvolvimento, não produção**
   ```json
   {
     "url": "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF_DEV"
   }
   ```

2. **Modo read-only (opcional)**
   ```json
   {
     "url": "https://mcp.supabase.com/mcp?read_only=true"
   }
   ```

3. **Limitar features (opcional)**
   ```json
   {
     "url": "https://mcp.supabase.com/mcp?features=database,docs"
   }
   ```

---

## 🎯 Configuração Recomendada para Este Projeto

### Para Desenvolvimento (Seguro)

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF&features=database,edge_functions,debugging",
      "description": "Supabase MCP - Development Project Only"
    }
  }
}
```

### Para Produção (Muito Cuidado!)

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=SEU_PROJECT_REF&read_only=true&features=database,debugging",
      "description": "Supabase MCP - Production (Read-Only)"
    }
  }
}
```

---

## 📊 Features Disponíveis

| Feature | O Que Faz | Recomendado |
|---------|-----------|-------------|
| `database` | Queries, migrations, tabelas | ✅ Sim |
| `edge_functions` | Deploy de functions | ✅ Sim |
| `debugging` | Logs e advisors | ✅ Sim |
| `docs` | Buscar documentação | ✅ Sim |
| `account` | Gerenciar projetos | ⚠️ Cuidado |
| `storage` | Gerenciar storage | ⚠️ Cuidado |
| `branching` | Branches (experimental) | ⚠️ Cuidado |

---

## 🧪 Como Testar

Depois de autenticar, você pode me pedir:

```
"Kiro, liste as tabelas do banco usando MCP"
"Kiro, aplique a migration de handoff usando MCP"
"Kiro, faça deploy da Edge Function auto-handoff usando MCP"
"Kiro, mostre os logs de erro das últimas 24h usando MCP"
```

---

## 🔧 Troubleshooting

### MCP não aparece

1. Verificar se arquivo existe:
   ```bash
   cat .kiro/settings/mcp.json
   ```

2. Reiniciar Kiro completamente

3. Verificar logs do Kiro

### Autenticação falha

1. Fazer logout do Supabase
2. Fazer login novamente
3. Garantir que escolheu a organização correta

### Permissões negadas

1. Verificar se você é admin do projeto
2. Verificar se o project_ref está correto
3. Tentar sem project_ref primeiro

---

## 📝 Próximos Passos

### Agora (Imediato)

1. [ ] Reiniciar Kiro
2. [ ] Autenticar no Supabase
3. [ ] Testar com "liste as tabelas"

### Depois (Quando Funcionar)

1. [ ] Aplicar correções de segurança via MCP
2. [ ] Fazer deploy da Edge Function via MCP
3. [ ] Aplicar migration via MCP
4. [ ] Testar handoff completo

---

## 🎉 Benefícios

### Antes (Sem MCP)

```
Você: "Kiro, corrija as vulnerabilidades"
Kiro: "Corrigi nos arquivos. Agora execute:"
      supabase db push
      supabase functions deploy auto-handoff
Você: [executa comandos manualmente]
Você: [testa manualmente]
```

### Depois (Com MCP)

```
Você: "Kiro, corrija as vulnerabilidades e faça deploy"
Kiro: "Corrigindo... ✅"
      "Aplicando migration... ✅"
      "Deploy da function... ✅"
      "Testando... ✅"
      "Pronto! Sistema seguro e funcionando."
```

**Ganho:** De 30 minutos → 2 minutos

---

## 🔗 Documentação Oficial

- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [GitHub Repo](https://github.com/supabase-community/supabase-mcp)
- [Security Best Practices](https://supabase.com/docs/guides/getting-started/mcp#security-risks)

---

**Criado por:** Kiro (AI)  
**Data:** 2026-04-03  
**Status:** Aguardando ativação
