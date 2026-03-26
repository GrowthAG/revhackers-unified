# RevHackers Chrome Extension
**Versao:** 1.0.0 | **Manifest:** MV3 | **Plataforma:** Google Chrome

---

## O que e esta extensao

Ferramenta interna da RevHackers que substitui o Notion e o tl;dv. Captura dados de duas fontes e envia direto para o banco de dados (Supabase):

1. **Gravacao de reunioes** - grava audio de calls no Google Meet e transcreve automaticamente com Whisper
2. **OSINT LinkedIn** - raspagem de perfis de clientes no LinkedIn com um clique

Sem precisar de Notion. Sem precisar de tl;dv. Tudo vai direto para o Hub.

---

## Instalacao

1. Abra o Chrome e acesse `chrome://extensions`
2. Ative o **Modo do desenvolvedor** (toggle no canto superior direito)
3. Clique em **Carregar sem compactacao** (Load unpacked)
4. Selecione a pasta `chrome-extension/` do projeto
5. A extensao aparece na barra do Chrome com o icone RevHackers

> Fixe a extensao na barra clicando no icone de puzzle e fixando RevHackers.

---

## Como usar - Gravacao de Reunioes (Google Meet)

### Passo a passo

1. Entre em qualquer reuniao no Google Meet (`meet.google.com`)
2. Clique no icone da extensao RevHackers na barra do Chrome
3. Clique em **Iniciar Gravacao**
4. O timer aparece mostrando o tempo gravado
5. Ao terminar, clique em **Parar Gravacao**
6. A extensao envia o audio automaticamente para transcricao
7. Em alguns minutos a transcricao aparece no projeto correspondente no Hub

### Auto-gravacao

Ative a opcao **Auto Record** no popup para gravar automaticamente ao entrar em qualquer reuniao Meet.

### Onde aparece no Hub

- Menu **Projetos** - selecione o projeto do cliente
- Aba **Reunioes** ou **Diagnostico**
- A transcricao e os insights da IA ficam salvos em `meeting_recordings`

---

## Como usar - OSINT LinkedIn

### Passo a passo

1. Abra o perfil LinkedIn do cliente (URL: `linkedin.com/in/username`)
2. Um botao verde **"Enviar para RevHackers"** aparece automaticamente no perfil
3. Clique no botao
4. Os dados sao extraidos e enviados para o Hub em segundos

### O que e capturado

- Nome completo e headline
- Numero de seguidores e conexoes
- Texto completo do "Sobre"
- Ultimas 5 experiencias profissionais
- 3 principais habilidades (skills)
- Badge LinkedIn Top Voice (se tiver)
- Foto de perfil
- Posts recentes
- Authority Score calculado pela IA

### Onde aparece no Hub

- Menu **Projetos** - selecione o projeto founder
- Aba **Inteligencia de Mercado**
- Secao **LinkedIn Scraped Persona Widget**

### Funciona tambem em paginas de empresa

A extensao detecta URLs `linkedin.com/company/nome` e extrai dados da empresa (nome, seguidores, descricao, setor).

---

## Permissoes utilizadas

| Permissao | Para que serve |
|---|---|
| `activeTab` | Acessar a aba atual para scraping e gravacao |
| `storage` | Salvar estado de gravacao entre sessoes |
| `scripting` | Injetar scripts nas paginas do LinkedIn e Meet |
| `tabCapture` | Capturar audio da aba do Meet |
| `offscreen` | Processar audio em background sem travar a UI |

---

## Arquitetura tecnica

```
Google Meet (audio)
    |
    v
background.js (Service Worker MV3)
    |-- tabCapture API
    |-- offscreen.js (MediaRecorder)
    |
    v
Supabase Edge Function: transcribe-meeting
    |-- Whisper API (OpenAI) para transcricao
    |-- GPT-5.4 para insights estruturados
    |
    v
Supabase DB: meeting_recordings
    |-- transcript TEXT
    |-- ai_insights JSONB
    |-- ai_summary TEXT


LinkedIn Profile
    |
    v
content-linkedin.js (Content Script)
    |-- Scraping via DOM (seletores CSS)
    |-- Botao injetado no perfil
    |
    v
background.js
    |
    v
Supabase Edge Function: scrape-profile
    |-- GPT-5.4 para Authority Score e Archetype
    |
    v
Supabase DB: clients.linkedin_data (JSONB)
```

---

## Resolucao de problemas

**O botao nao aparece no LinkedIn**
- Atualize a pagina (`F5`)
- Confirme que a URL e `linkedin.com/in/` ou `linkedin.com/company/`
- O LinkedIn muda os seletores CSS periodicamente - pode precisar de atualizacao da extensao

**A gravacao nao inicia**
- Confirme que esta em uma pagina `meet.google.com`
- Verifique as permissoes de microfone do Chrome
- Abra o Console do Chrome (`F12`) e procure erros com `[RevHackers]`

**A transcricao nao aparece no Hub**
- O processo leva de 2 a 5 minutos dependendo do tamanho da call
- Verifique em Supabase Dashboard se o registro aparece em `meeting_recordings`
- Confirme que o secret `OPENAI_API_KEY` esta configurado no Supabase

---

## Suporte interno

Qualquer problema tecnico: abrir issue no repositorio ou contato direto com o dev.

**Versao do projeto:** RevHackers Growth Hub - develop branch
**Banco:** Supabase projeto `eqspbruarsdybpfeijnf`
