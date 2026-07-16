import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Definição dos IDs dos Widgets (PREENCHER AQUI)
// Você precisará pegar esses IDs no seu GoHighLevel > Sites > Chat Widget
const BOT_SALES_ID = "YOUR_SALES_BOT_ID"; // Bot 1: Home, Serviços
const BOT_CONTENT_ID = "YOUR_CONTENT_BOT_ID"; // Bot 2: Cases, Blog, Materiais

const ChatbotManager = () => {
    const location = useLocation();

    useEffect(() => {
        // Função para carregar o script do GHL
        const loadChatbot = (widgetId: string) => {
            // Remover qualquer widget existente antes de adicionar o novo
            const existingScript = document.getElementById('ghl-chat-script');
            const existingWidget = document.querySelector('chat-widget');

            if (existingScript) existingScript.remove();
            if (existingWidget) existingWidget.remove();

            if (!widgetId || widgetId.includes('YOUR_')) return; // Não carregar se não tiver ID configurado

            const script = document.createElement('script');
            script.src = "https://widget.leadconnectorhq.com/loader.js";
            script.setAttribute("data-resources-url", "https://widget.leadconnectorhq.com/chat-widget/loader.js");
            script.setAttribute("data-widget-id", widgetId);
            script.id = 'ghl-chat-script';
            script.async = true;

            document.body.appendChild(script);
        };

        const path = location.pathname;

        // Lógica de Roteamento do Bot
        if (
            path === '/' ||
            path === '/servicos' ||
            path.startsWith('/servicos/') ||
            path === '/quem-somos' ||
            path === '/booking' ||
            path === '/agenda'
        ) {
            // Grupo A: Bot de Vendas/Atendimento
            console.log("Loading Sales Bot...");
            loadChatbot(BOT_SALES_ID);
        } else if (
            path === '/blog' ||
            path.startsWith('/blog/') ||
            path === '/cases' ||
            path.startsWith('/cases/') ||
            path === '/materiais' ||
            path.startsWith('/materiais/') ||
            path === '/comunidade'
        ) {
            // Grupo B: Bot de Conteúdo/Nutrição
            console.log("Loading Content Bot...");
            loadChatbot(BOT_CONTENT_ID);
        } else {
            // Outras páginas (Admin, Login, etc): Remover bot ou usar padrão?
            // Decisão: Remover para limpar a interface em áreas logadas/técnicas
            const existingScript = document.getElementById('ghl-chat-script');
            if (existingScript) existingScript.remove();
            const existingWidget = document.querySelector('chat-widget');
            if (existingWidget) existingWidget.remove();
        }

    }, [location]);

    return null; // Componente lógico, não renderiza nada visualmente
};

export default ChatbotManager;
