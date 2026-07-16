# 🚀 Instruções de Deploy - Notion Design System

**Status:** ✅ Pronto para produção  
**Build:** ✅ Testado e aprovado  
**Data:** 2026-04-03

---

## ✅ PRÉ-REQUISITOS

Antes de fazer deploy, confirme:

- [x] Build passa sem erros (`npm run build`)
- [x] Todos os componentes testados
- [x] Design system compliance OK
- [x] Sem TypeScript errors
- [x] Dependências instaladas (`cmdk`)

---

## 🔧 PASSO A PASSO

### 1. Build para Produção

```bash
# Limpar build anterior
rm -rf dist/

# Build production
npm run build

# Verificar se passou
# Deve mostrar: "✓ 5042 modules transformed"
```

### 2. Testar Build Localmente

```bash
# Preview do build
npm run preview

# Acessar: http://localhost:4173/admin
# Testar:
# - Sidebar abre/fecha
# - Cmd+K funciona
# - Navegação funciona
# - Sem erros no console
```

### 3. Deploy para Hostinger (FTP)

**Opção A: Via FTP Client (FileZilla)**

```
Host: ftp.revhackers.com.br
Username: [seu_usuario]
Password: [sua_senha]
Port: 21

1. Conectar ao FTP
2. Navegar para /public_html/
3. Fazer backup da pasta atual (renomear para public_html_backup)
4. Upload da pasta dist/ para /public_html/
5. Renomear dist/ para public_html/
```

**Opção B: Via Script (se configurado)**

```bash
# Se existe script de deploy
npm run deploy

# Ou seguir guia:
# .agent/workflows/deploy_hostinger.md
```

### 4. Validação Pós-Deploy

Acessar: `https://revhackers.com.br/admin`

**Checklist:**
- [ ] Página carrega sem erros
- [ ] Sidebar aparece
- [ ] Sidebar colapsa/expande
- [ ] Command Palette abre (Cmd+K)
- [ ] Navegação funciona
- [ ] Cores estão corretas (zinc + #00CC6A)
- [ ] Sem erros no console
- [ ] Mobile responsivo

---

## 🐛 TROUBLESHOOTING

### Problema: Sidebar não aparece

**Causa:** CSS não carregou ou z-index baixo

**Solução:**
```bash
# Verificar se CSS foi incluído no build
ls dist/assets/*.css

# Verificar no navegador:
# DevTools > Network > Verificar se CSS carregou
```

### Problema: Command Palette não abre

**Causa:** Biblioteca `cmdk` não foi incluída no build

**Solução:**
```bash
# Verificar se cmdk está instalado
npm list cmdk

# Se não estiver:
npm install cmdk

# Rebuild
npm run build
```

### Problema: Rotas quebradas

**Causa:** Configuração de SPA no servidor

**Solução:**
Criar `.htaccess` na raiz:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Problema: Cores erradas

**Causa:** Cache do navegador

**Solução:**
```bash
# Hard refresh no navegador:
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# Ou limpar cache:
# DevTools > Application > Clear storage
```

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Métricas para Acompanhar

**1. Performance**
```bash
# Google PageSpeed Insights
https://pagespeed.web.dev/

# Lighthouse (DevTools)
# Performance > 90
# Accessibility > 90
```

**2. Erros**
```bash
# Console do navegador
# Verificar se há erros JavaScript

# Sentry (se configurado)
# Monitorar erros em produção
```

**3. Uso**
```bash
# Google Analytics (se configurado)
# Eventos para trackear:
# - Command Palette opened
# - Sidebar collapsed
# - Navigation clicks
```

---

## 🔄 ROLLBACK (Se Necessário)

Se algo der errado:

### Via FTP
```
1. Conectar ao FTP
2. Deletar /public_html/
3. Renomear /public_html_backup/ para /public_html/
4. Aguardar propagação (1-5 min)
```

### Via Git (se versionado)
```bash
# Reverter commit
git revert HEAD

# Rebuild
npm run build

# Redeploy
npm run deploy
```

---

## ✅ CHECKLIST FINAL DE DEPLOY

### Pré-Deploy
- [ ] Build passa sem erros
- [ ] Testes locais OK
- [ ] Backup do site atual feito
- [ ] Credenciais FTP prontas

### Deploy
- [ ] Upload dos arquivos OK
- [ ] Permissões corretas (755)
- [ ] .htaccess configurado
- [ ] Cache limpo

### Pós-Deploy
- [ ] Site carrega
- [ ] Sidebar funciona
- [ ] Command Palette funciona
- [ ] Navegação funciona
- [ ] Mobile OK
- [ ] Sem erros no console
- [ ] Performance OK (>90)

### Comunicação
- [ ] Avisar equipe sobre deploy
- [ ] Documentar mudanças
- [ ] Coletar feedback inicial

---

## 📞 SUPORTE

### Se Precisar de Ajuda

**Documentação:**
- `FINAL_SUMMARY.md` - Resumo completo
- `IMPLEMENTATION_COMPLETE.md` - Checklist
- `START_HERE_NOTION_IMPLEMENTATION.md` - Guia inicial

**Logs:**
- `.kiro/context/session_log.md` - Histórico de implementação

**Contato:**
- Kiro (AI) - Disponível para dúvidas
- Equipe RevHackers - Suporte interno

---

## 🎉 SUCESSO!

Após deploy bem-sucedido:

1. ✅ Interface Notion-style em produção
2. ✅ Navegação intuitiva (Sidebar + Cmd+K)
3. ✅ Loading states profissionais
4. ✅ Design 100% Nobibecode
5. ✅ Performance otimizada

**Parabéns! 🚀**

---

**Criado por:** Kiro (AI)  
**Data:** 2026-04-03  
**Versão:** 1.0.0
