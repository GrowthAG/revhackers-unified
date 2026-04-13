# Task: Refatorar ChatbotManager para usar ID especifico

## Contexto
O `src/components/shared/ChatbotManager.tsx` usa seletores CSS genericos (`iframe[src*="widget.leadconnectorhq"]`) para identificar o chatbot. Isso e fragil e ja causou bug onde iframes de booking eram removidos.

## Objetivo
Trocar a deteccao por data-attribute dedicado no iframe do chatbot.

## Arquivos
- `src/components/shared/ChatbotManager.tsx`

## Implementacao
1. Quando o chatbot iframe for injetado, adicionar `data-revhackers-chatbot="true"` ao elemento
2. Em `removeAllChatWidgets()`, trocar o seletor para `iframe[data-revhackers-chatbot]`
3. Remover qualquer seletor baseado em `src*=` para iframes
4. Testar que a pagina `/agenda-giulliano` mantem o iframe de booking intacto
5. Testar que o chatbot ainda aparece e desaparece corretamente nas rotas de venda (SALES_ROUTES)

## Criterio de Aceite
- Nenhum iframe que nao seja o chatbot e removido por removeAllChatWidgets()
- Chatbot aparece nas SALES_ROUTES
- Chatbot e removido nas demais rotas
- Iframe de booking em /agenda-giulliano nunca e tocado
