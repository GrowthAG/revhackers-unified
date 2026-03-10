---
description: Tracker de Contexto e Versionamento de Tarefas. Módulo de Alinhamento de Projetos e Escopo.
---

# Módulo de Contexto e Alinhamento de Projetos

Sempre que a IA iniciar uma nova tarefa ou o usuário solicitar a troca de contexto/projeto (ex: mudar do "REI CRM" para o "REI Founder" ou "Blog"), siga obrigatoriamente esta rotina estrutural para garantir que **nunca mais "esqueça"** ou perca o fio da meada das alterações feitas no projeto atual, evitando sobreposição indevida do código.

## 1. Regra de Checagem Inicial Anti-Amnésia
Antes de escrever ou alterar qualquer linha de código em novas sessões ou após receber uma "virada de chave" do Usuário:
- Pare e acalme-se.
- Revalide mentalmente: **"Qual é a branch (ambiente), o tipo de protocolo (se for REI), os arquivos centrais e o estado atual da UI?"**
- Procure proativamente por artefatos recentes no diretório do "usuário" (`.gemini/antigravity/brain/...` ex: `task.md`, `implementation_plan.md`) usando ferramentas nativas (ex: `view_file` e `run_command` com `ls`) para retomar a linha exata de raciocínio da sessão passada.

## 2. A Ferramenta Mestre: O Arquivo "task.md"
Como recurso primário, a IA deve utilizar a criação/leitura do arquivo `task.md` (na aba e diretório de Artefatos) como um **Checklist Vivo e Imutável**.
* Toda vez que o foco ou projeto do RevHacker mudar:
  - Adicione a nova demanda, bug ou funcionalidade como bloco/seção no final.
  - Marque como `[ ]` Pendente, `[/]` Em Progresso, `[x]` Concluído as sub-tarefas iterativas.
* Esse arquivo servirá como âncora de *Single Source of Truth* para todos os turnos de contexto entre a IA e o Giulliano.

## 3. Commit de Fechamento de Etapa (The Checkpoint)
Quando um módulo extenso, uma seção robusta de Backend, ou uma interface for finalizada (Válida, Testada no `test_diag.ts` ou Aprovada visualmente pelo usuário):
1. **Declare explicitamente no chat o "Checkpoint":** *"Etapa X do módulo Y foi consolidada com sucesso."*
2. **Revise a Documentação Interna / Blocos de Código:** Se a alteração introduziu novos status, schemas ou if/loops robustos (ex: um novo array de formulário para o `projectType` X), garanta que a semântica da regra de negócio está nítida no código e documentada no seu relatório. Assim, no dia seguinte, edições de refatoração ("Clean Up routines") **NÃO** vão remover lógicas exclusivas achando que eram blocos órfãos (ex: deletar a geração de premissas do REI Founder).

## Como Ativar Essa Skill Proativamente
Toda vez que o usuário solicitar `/atualizacao_contexto` ou mandar uma mensagem abertamente de transição (Ex: *"Terminamos a refatoração do CRM. Ontem fizemos a aba de Leads. Hoje vamos focar no form do Founder"*), a IA obrigatoriamente deve:
1. Resumir o estado atual num bullet rápido contextual (só do que foi deixado intacto/fechado).
2. Criar ou plugar as novas pendências do "Founder" ou do projeto Y num `task.md`.
3. Informar na reposta ao usuário: *"Contexto pivotado com sucesso para o Projeto [Y] (REI Founder). Tarefas atualizadas no arquivo de Acompanhamento (Task.md). Daremos inicio ao Step 1."*
