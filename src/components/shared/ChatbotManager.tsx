import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// IDs dos Widgets GHL (preencher com IDs reais)
const BOT_SALES_ID = import.meta.env.VITE_GHL_SALES_BOT_ID || "";
const BOT_CONTENT_ID = import.meta.env.VITE_GHL_CONTENT_BOT_ID || "";

// Rotas onde o chatbot DEVE aparecer (somente frontend publico)
const SALES_ROUTES = ['/', '/servicos', '/quem-somos', '/booking', '/agenda', '/agenda-diagnostico'];
const CONTENT_PREFIXES = ['/blog', '/cases', '/materiais', '/comunidade'];

function isPublicRoute(path: string): false | 'sales' | 'content' {
    if (SALES_ROUTES.includes(path) || path.startsWith('/servicos/')) return 'sales';
    for (const prefix of CONTENT_PREFIXES) {
        if (path === prefix || path.startsWith(prefix + '/')) return 'content';
    }
    return false;
}

function removeAllChatWidgets() {
    // GHL chat widget script
    const ghlScript = document.getElementById('ghl-chat-script');
    if (ghlScript) ghlScript.remove();
    // GHL chat-widget custom elements
    document.querySelectorAll('chat-widget').forEach(el => el.remove());
    // LeadConnector containers
    document.querySelectorAll('[id*="chat-widget"], [class*="chat-widget"], [id*="leadconnector"], [class*="leadconnector"]').forEach(el => el.remove());
    // Remove only iframes tagged by our chatbot loader - never touch booking/calendar iframes
    document.querySelectorAll('iframe[data-revhackers-chatbot]').forEach(el => el.remove());
}

const ChatbotManager = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const routeType = isPublicRoute(path);

        if (routeType === 'sales') {
            loadChatbot(BOT_SALES_ID);
        } else if (routeType === 'content') {
            loadChatbot(BOT_CONTENT_ID);
        } else {
            // Tudo que NAO e rota publica: remover chatbot agressivamente
            removeAllChatWidgets();
            // Repetir para pegar widgets que carregam com delay
            const t1 = setTimeout(removeAllChatWidgets, 500);
            const t2 = setTimeout(removeAllChatWidgets, 2000);
            const t3 = setTimeout(removeAllChatWidgets, 5000);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [location]);

    return null;
};

function tagChatIframes() {
    document.querySelectorAll('iframe[src*="leadconnector"], iframe[src*="widget.leadconnectorhq"]').forEach(el => {
        if (!el.hasAttribute('data-revhackers-chatbot')) {
            el.setAttribute('data-revhackers-chatbot', 'true');
        }
    });
}

function loadChatbot(widgetId: string) {
    // Remover widget anterior
    const existingScript = document.getElementById('ghl-chat-script');
    const existingWidget = document.querySelector('chat-widget');
    if (existingScript) existingScript.remove();
    if (existingWidget) existingWidget.remove();

    if (!widgetId || widgetId.includes('YOUR_')) return;

    const script = document.createElement('script');
    script.src = "https://widget.leadconnectorhq.com/loader.js";
    script.setAttribute("data-resources-url", "https://widget.leadconnectorhq.com/chat-widget/loader.js");
    script.setAttribute("data-widget-id", widgetId);
    script.id = 'ghl-chat-script';
    script.async = true;
    document.body.appendChild(script);

    // Tag chat iframes as they appear so removeAllChatWidgets targets only them
    const observer = new MutationObserver(() => tagChatIframes());
    observer.observe(document.body, { childList: true, subtree: true });
    // Stop observing after 10s (widget should be loaded by then)
    setTimeout(() => observer.disconnect(), 10000);
}

export default ChatbotManager;
