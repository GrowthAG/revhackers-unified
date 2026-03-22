/**
 * RevHackers Clipper - Content Script: LinkedIn
 *
 * Injetado em:
 *   https://www.linkedin.com/in/*    (perfis pessoais)
 *   https://www.linkedin.com/company/* (paginas de empresa)
 *
 * Responsabilidades:
 * - Extrair dados do perfil diretamente do DOM autenticado do usuario
 * - Construir o objeto ScrapedLinkedInProfile conforme o schema da Edge Function scrape-profile
 * - Enviar mensagem LINKEDIN_SCRAPED para o background service worker
 * - Injetar botao "Enviar para RevHackers" na pagina
 *
 * IMPORTANTE: Seletores CSS do LinkedIn mudam com frequencia.
 * Manter essa lista atualizada e parte da manutencao continua da extensao.
 */

const LOG_PREFIX = '[revhackers-ext]';

// ============================================================
// HELPERS DE EXTRACAO DOM
// ============================================================

/**
 * Retorna textContent limpo de um elemento, ou null se nao encontrado.
 */
function getText(selector, root = document) {
    const el = root.querySelector(selector);
    return el ? el.textContent.trim().replace(/\s+/g, ' ') || null : null;
}

/**
 * Retorna textContent do primeiro elemento de uma lista de seletores.
 */
function getTextAny(selectors, root = document) {
    for (const sel of selectors) {
        const text = getText(sel, root);
        if (text) return text;
    }
    return null;
}

/**
 * Converte string com numero formatado (ex: "12.400 seguidores") para inteiro.
 */
function parseFollowerCount(text) {
    if (!text) return null;
    const clean = text.replace(/[.,\s]/g, '').match(/\d+/);
    return clean ? parseInt(clean[0], 10) : null;
}

// ============================================================
// EXTRACAO DO PERFIL
// ============================================================

function scrapeProfile() {
    const profileUrl = window.location.href.split('?')[0].replace(/\/$/, '');
    const isCompanyPage = profileUrl.includes('/company/');

    // --- IDENTIDADE ---
    const fullName = getTextAny([
        'h1.text-heading-xlarge',
        'h1[class*="inline"]',
        '.pv-top-card--list li:first-child',
        'h1',
    ]) || 'Nome nao encontrado';

    const headline = getTextAny([
        '.text-body-medium.break-words',
        '[data-field="headline"]',
        '.pv-top-card-section__headline',
    ]) || '';

    const location = getTextAny([
        '.pv-text-details__left-panel .text-body-small',
        '.pv-top-card--list-bullet li:first-child',
        '[data-field="location"]',
    ]);

    // --- FOTO DE PERFIL ---
    let profileImageUrl = null;
    const imgEl = document.querySelector(
        '.pv-top-card__photo img, .profile-photo-edit__preview img, .presence-entity__image, img.evi-image'
    );
    if (imgEl && imgEl.src && !imgEl.src.includes('data:')) {
        profileImageUrl = imgEl.src;
    }

    // --- METRICAS DE AUDIENCIA ---
    let followerCount = null;
    let connectionCount = null;

    // Texto de seguidores aparece em diferentes lugares dependendo do layout
    const followerTexts = Array.from(
        document.querySelectorAll('span, p, div')
    ).filter(el => {
        const t = el.textContent.trim();
        return (t.includes('seguidor') || t.includes('follower')) && /\d/.test(t) && t.length < 60;
    });

    if (followerTexts.length > 0) {
        followerCount = parseFollowerCount(followerTexts[0].textContent);
    }

    const connectionEl = document.querySelector(
        '.pv-top-card--list-bullet li:nth-child(2), [data-field="connections_count"]'
    );
    if (connectionEl) {
        const connText = connectionEl.textContent;
        if (connText.includes('500+') || connText.includes('500 +')) {
            connectionCount = 500;
        } else {
            connectionCount = parseFollowerCount(connText);
        }
    }

    // --- ABOUT ---
    let about = null;
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
        const aboutContainer = aboutSection.closest('section') || aboutSection.parentElement;
        const aboutText = aboutContainer?.querySelector('.inline-show-more-text, [class*="full-width"]');
        about = aboutText ? aboutText.textContent.trim().replace(/\s+/g, ' ') : null;
    }

    // Fallback: procura secao "Sobre" pelo label
    if (!about) {
        const allSections = document.querySelectorAll('section');
        for (const sec of allSections) {
            const sectionTitle = sec.querySelector('h2')?.textContent?.trim() || '';
            if (sectionTitle.toLowerCase().includes('sobre') || sectionTitle.toLowerCase().includes('about')) {
                const content = sec.querySelector('[class*="full-width"], .inline-show-more-text, span[aria-hidden="true"]');
                if (content) {
                    about = content.textContent.trim().replace(/\s+/g, ' ');
                    break;
                }
            }
        }
    }

    // --- EXPERIENCIA ---
    const experience = [];
    let currentRole = null;

    const expSection = document.querySelector('#experience');
    if (expSection) {
        const expContainer = expSection.closest('section') || expSection.parentElement;
        const expItems = expContainer?.querySelectorAll('li.artdeco-list__item, li[class*="pvs-list__item"]') || [];

        let count = 0;
        for (const item of expItems) {
            if (count >= 5) break;

            const titleEl = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"], [data-field="experience_company_logo"] ~ div span[aria-hidden="true"]'
            );
            const companyEl = item.querySelector(
                '.t-14.t-normal span[aria-hidden="true"]'
            );
            const durationEl = item.querySelector(
                '.t-14.t-black--light span[aria-hidden="true"]'
            );
            const descEl = item.querySelector(
                '.pvs-list__outer-container .t-14 span[aria-hidden="true"]'
            );

            const title = titleEl?.textContent?.trim() || null;
            const company = companyEl?.textContent?.trim() || null;

            if (!title || !company) continue;

            const entry = {
                title,
                company,
                duration: durationEl?.textContent?.trim() || null,
                description: descEl?.textContent?.trim()?.substring(0, 300) || null,
            };

            experience.push(entry);

            if (count === 0) {
                currentRole = {
                    title: entry.title,
                    company: entry.company,
                    duration: entry.duration,
                };
            }

            count++;
        }
    }

    // --- SKILLS ---
    const topSkills = [];
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
        const skillsContainer = skillsSection.closest('section') || skillsSection.parentElement;
        const skillItems = skillsContainer?.querySelectorAll('li.artdeco-list__item, li[class*="pvs-list__item"]') || [];

        let skillCount = 0;
        for (const item of skillItems) {
            if (skillCount >= 3) break;
            const skillName = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
            if (skillName?.textContent?.trim()) {
                topSkills.push(skillName.textContent.trim());
                skillCount++;
            }
        }
    }

    // --- TOP VOICE ---
    const isTopVoice = !!(
        document.querySelector('[aria-label*="Top Voice"], [title*="Top Voice"], .premium-nav-top-voice') ||
        Array.from(document.querySelectorAll('span, div')).find(
            el => el.textContent.trim() === 'LinkedIn Top Voice'
        )
    );

    // --- POSTS DO ULTIMO MES ---
    // LinkedIn nao exibe esse numero diretamente; tenta inferir pela secao de atividade
    let postsLastMonthCount = null;
    const activitySection = document.querySelector('#recent-activity-top-card');
    if (activitySection) {
        const activityText = activitySection.textContent;
        const postMatch = activityText.match(/(\d+)\s*(postagens?|posts?)/i);
        if (postMatch) {
            postsLastMonthCount = parseInt(postMatch[1], 10);
        }
    }

    // --- SNIPPETS DE POSTS RECENTES ---
    const recentPostSnippets = [];
    const postItems = document.querySelectorAll(
        '.feed-shared-update-v2__description-wrapper span[dir="ltr"], .feed-shared-text span[dir="ltr"]'
    );
    let snippetCount = 0;
    for (const p of postItems) {
        if (snippetCount >= 3) break;
        const text = p.textContent.trim();
        if (text.length > 30) {
            recentPostSnippets.push(text.substring(0, 200));
            snippetCount++;
        }
    }

    // ============================================================
    // MONTA O OBJETO FINAL (ScrapedLinkedInProfile)
    // ============================================================
    const profile = {
        profileUrl,
        fullName,
        headline,
        scrapedAt: new Date().toISOString(),
    };

    if (location)          profile.location          = location;
    if (profileImageUrl)   profile.profileImageUrl   = profileImageUrl;
    if (followerCount !== null) profile.followerCount = followerCount;
    if (connectionCount !== null) profile.connectionCount = connectionCount;
    if (about)             profile.about             = about;
    if (currentRole)       profile.currentRole       = currentRole;
    if (experience.length) profile.experience        = experience;
    if (topSkills.length)  profile.topSkills         = topSkills;
    if (isTopVoice)        profile.isTopVoice        = true;
    if (postsLastMonthCount !== null) profile.postsLastMonthCount = postsLastMonthCount;
    if (recentPostSnippets.length) profile.recentPostSnippets = recentPostSnippets;

    return profile;
}

// ============================================================
// BOTAO "ENVIAR PARA REVHACKERS"
// ============================================================

let buttonInjected = false;

function injectButton() {
    if (buttonInjected) return;
    if (!document.querySelector('h1')) return; // Perfil ainda nao carregou

    // Tenta inserir proximo ao botao de Conectar ou Seguir
    const connectBtn = document.querySelector(
        'button[aria-label*="Connect"], button[aria-label*="Follow"], button[aria-label*="Conectar"], button[aria-label*="Seguir"]'
    );

    const insertionPoint = connectBtn ? connectBtn.closest('.pvs-profile-actions, .pv-top-card-v2-ctas') || connectBtn.parentElement : null;

    const btn = document.createElement('button');
    btn.id = 'revhackers-send-btn';
    btn.textContent = 'Enviar para RevHackers';

    Object.assign(btn.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 16px',
        background: '#09090b',
        color: '#ffffff',
        border: '1px solid #27272a',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '700',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        cursor: 'pointer',
        letterSpacing: '0.01em',
        flexShrink: '0',
        marginLeft: '8px',
    });

    btn.onmouseenter = () => { btn.style.background = '#18181b'; };
    btn.onmouseleave = () => { btn.style.background = '#09090b'; };

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Coletando dados...';
        btn.style.opacity = '0.7';

        try {
            const profileData = scrapeProfile();
            console.log(`${LOG_PREFIX} scraped profile: "${profileData.fullName}" | followers: ${profileData.followerCount ?? 'N/A'}`);

            chrome.runtime.sendMessage(
                { type: 'LINKEDIN_SCRAPED', data: profileData },
                (response) => {
                    if (response?.success) {
                        btn.textContent = 'Enviado';
                        btn.style.background = '#052e16';
                        btn.style.borderColor = '#00CC6A';
                        btn.style.color = '#00CC6A';
                    } else {
                        btn.textContent = 'Erro - tente novamente';
                        btn.style.background = '#450a0a';
                        btn.style.borderColor = '#ef4444';
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        console.error(`${LOG_PREFIX} send failed: ${response?.error}`);
                    }
                }
            );
        } catch (err) {
            console.error(`${LOG_PREFIX} scrape error:`, err.message);
            btn.textContent = 'Erro na coleta';
            btn.style.background = '#450a0a';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });

    if (insertionPoint) {
        insertionPoint.appendChild(btn);
    } else {
        // Fallback: insere logo abaixo do h1
        const h1 = document.querySelector('h1');
        if (h1 && h1.parentElement) {
            const wrapper = document.createElement('div');
            wrapper.style.marginTop = '8px';
            wrapper.appendChild(btn);
            h1.parentElement.insertAdjacentElement('afterend', wrapper);
        }
    }

    buttonInjected = true;
    console.log(`${LOG_PREFIX} revhackers button injected`);
}

// ============================================================
// INICIALIZACAO E OBSERVER
// O LinkedIn e uma SPA: o DOM muda sem recarregar a pagina.
// Usa MutationObserver para detectar quando o perfil carregou.
// ============================================================

let initObserver = null;

function tryInit() {
    // Verifica se estamos em uma pagina de perfil (nao em feed ou outras)
    const path = window.location.pathname;
    if (!path.startsWith('/in/') && !path.startsWith('/company/')) return;

    // Verifica se o h1 do perfil ja carregou
    if (!document.querySelector('h1')) return;

    injectButton();
}

function startInitObserver() {
    if (initObserver) return;

    let initTimeout = null;

    initObserver = new MutationObserver(() => {
        clearTimeout(initTimeout);
        initTimeout = setTimeout(tryInit, 600);
    });

    initObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// ============================================================
// API PUBLICA - permite que popup.js chame via scripting.executeScript
// ============================================================

/**
 * Expoe scrapeProfile no escopo global para que popup.js possa invocar via
 * chrome.scripting.executeScript + window.__revhackersScrapeCurrent().
 */
window.__revhackersScrapeCurrent = scrapeProfile;

// ============================================================
// LISTENER DE MENSAGENS DO POPUP / BACKGROUND
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const action = request.type || request.action;

    if (action === 'SCRAPE_AND_SEND' || action === 'triggerScrape') {
        try {
            const profileData = scrapeProfile();
            console.log(`${LOG_PREFIX} SCRAPE_AND_SEND triggered for: "${profileData.fullName}"`);

            chrome.runtime.sendMessage(
                { type: 'LINKEDIN_SCRAPED', data: profileData },
                (response) => {
                    sendResponse(response || { success: false, error: 'Sem resposta do background' });
                }
            );
        } catch (err) {
            console.error(`${LOG_PREFIX} SCRAPE_AND_SEND error:`, err.message);
            sendResponse({ success: false, error: err.message });
        }
        return true; // canal assincrono
    }
});

// Inicializacao imediata + observer para SPAs
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        startInitObserver();
        tryInit();
    });
} else {
    startInitObserver();
    tryInit();
}

console.log(`${LOG_PREFIX} content-linkedin.js initialized on ${window.location.href}`);
