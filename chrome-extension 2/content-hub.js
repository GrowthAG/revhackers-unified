/**
 * RevHackers Clipper - Hub Observer
 * Injetado no Growth Hub para capturar o JWT do Supabase e enviar a extensao.
 * Also stores refresh_token and expires_at so the extension can auto-refresh.
 */

const LOG_PREFIX = '[rh-hub-spy]';
let lastJwt = null;

function scanForAuth() {
    let jwt = null;
    let email = null;
    let refreshToken = null;
    let expiresAt = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            try {
                const session = JSON.parse(localStorage.getItem(key));
                if (session && session.access_token) {
                    jwt = session.access_token;
                    email = session.user?.email || null;
                    refreshToken = session.refresh_token || null;
                    // Supabase stores expires_at as unix seconds
                    expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
                }
            } catch(e) {}
        }
    }

    if (jwt !== lastJwt) {
        lastJwt = jwt;
        console.log(`${LOG_PREFIX} auth change detected - jwt: ${jwt ? 'present' : 'absent'}, refreshToken: ${refreshToken ? 'present' : 'absent'}`);
        try {
            if (jwt) {
                chrome.runtime.sendMessage({ type: 'SET_AUTH', jwt, email }, () => {
                   if (chrome.runtime.lastError) { /* ignore disconnections */ }
                });
                // Also persist refresh token and expiry directly in extension storage
                // so popup can refresh without needing the service worker
                const storagePayload = {};
                if (refreshToken) storagePayload.refreshToken = refreshToken;
                if (expiresAt > 0) storagePayload.tokenExpiresAt = expiresAt;
                if (Object.keys(storagePayload).length > 0) {
                    chrome.storage.local.set(storagePayload, () => {
                        if (chrome.runtime.lastError) { /* ignore */ }
                        else console.log(`${LOG_PREFIX} refresh token and expiry persisted to extension storage`);
                    });
                }
            } else {
                chrome.runtime.sendMessage({ type: 'CLEAR_AUTH' }, () => {
                   if (chrome.runtime.lastError) { /* ignore disconnections */ }
                });
            }
        } catch(e) {
            // Extension context invalidated
        }
    }
}

// Escanear a cada 2.5s para manter a sessao quente e evitar loops.
setInterval(scanForAuth, 2500);
scanForAuth();
