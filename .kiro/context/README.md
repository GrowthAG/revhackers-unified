# Sistema de Memória Contextual - RevHackers

Este diretório contém a memória persistente do projeto para garantir que nenhum contexto seja perdido entre sessões de IA.

## 📁 Estrutura

```
.kiro/context/
├── README.md              # Este arquivo
├── project_memory.md      # Contexto permanente do projeto
├── session_log.md         # Log cronológico de sessões
└── decisions/             # Decisões arquiteturais importantes
    └── [YYYY-MM-DD]-[titulo].md
```

## 🎯 Como Usar

### Para a IA (Kiro/Claude)
**SEMPRE** leia estes arquivos no início de qualquer sessão:
1. `project_memory.md` - Contexto geral
2. `session_log.md` - Última sessão
3. Decisões recentes em `decisions/`

### Para Desenvolvedores
Atualize estes arquivos quando:
- Houver mudança arquitetural significativa
- Novos padrões forem estabelecidos
- Decisões importantes forem tomadas
- Bugs críticos forem descobertos

## 📝 Convenções

### project_memory.md
- Mantém informações **permanentes** do projeto
- Atualizar quando arquitetura mudar
- Incluir exemplos de código
- Documentar problemas conhecidos

### session_log.md
- Registrar **cada sessão** de desenvolvimento
- Formato cronológico (mais recente no topo)
- Incluir contexto, decisões e próximos passos
- Listar arquivos modificados

### decisions/
- Criar arquivo para decisões **importantes**
- Formato: `YYYY-MM-DD-titulo-da-decisao.md`
- Incluir: contexto, alternativas, decisão final, consequências

## 🚀 Exemplo de Uso

```bash
# Início de nova sessão
cat .kiro/context/project_memory.md
cat .kiro/context/session_log.md

# Durante desenvolvimento
# ... fazer mudanças ...

# Fim da sessão
echo "## 📅 $(date +%Y-%m-%d) - Título" >> .kiro/context/session_log.md
# ... adicionar detalhes da sessão ...
```

## 🔄 Manutenção

- **Diária**: Atualizar `session_log.md`
- **Semanal**: Revisar `project_memory.md`
- **Mensal**: Arquivar sessões antigas
- **Sempre**: Documentar decisões importantes

---

**Criado em:** 2026-04-03  
**Mantido por:** Equipe RevHackers + IA
