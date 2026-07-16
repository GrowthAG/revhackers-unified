import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SEOProvider } from './components/shared/SEO.tsx'


// Crash Protection: Catch unhandled Supabase auth errors that might cause White Screen
window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || '';
    if (message.includes('Invalid Refresh Token') || message.includes('Refresh Token Not Found')) {
        console.warn('⚠️ [CRASH PREVENTED] Suppressing fatal Supabase Auth error:', message);
        event.preventDefault(); // Prevent browser from treating this as a fatal error

        // Clear potentially corrupted tokens
        localStorage.removeItem('sb-eqspbruarsdybpfeijnf-auth-token');
        localStorage.removeItem('supabase.auth.token');
    }
});

createRoot(document.getElementById("root")!).render(
    <SEOProvider>
        <App />
    </SEOProvider>
);
