// @ts-ignore - Supabase Deno environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Supabase Deno environment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * scrape-profile - OSINT Receiver Webhook
 *
 * ARCHITECTURE SHIFT:
 *   BEFORE: Function received a LinkedIn URL and asked GPT to "scrape" it.
 *           GPT cannot access URLs. Every result was a hallucination.
 *
 *   NOW:    Function is a strict REST receiver.
 *           The Chrome Extension scrapes the LinkedIn DOM locally (inside the
 *           user's authenticated browser session) and POSTs the raw, real data.
 *           This function only uses the LLM to CLASSIFY and ANALYZE the real data.
 *           Real Data IN -> Deterministic Score -> LLM Analysis -> Database OUT.
 *
 * Auth: Supabase JWT required (Authorization: Bearer <token>)
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ================================================================
// SCHEMA CONTRACT
// Chrome Extension developers MUST conform to this interface.
// Every field marked required WILL cause a 400 if absent/invalid.
// ================================================================

/**
 * ScrapedLinkedInProfile
 *
 * The exact JSON body the Chrome Extension must POST to this endpoint.
 * All fields are scraped from the live LinkedIn DOM - no inference allowed.
 */
export interface ScrapedLinkedInProfile {
    // --- IDENTITY (required) ---
    /** Canonical LinkedIn URL. Ex: https://www.linkedin.com/in/handle */
    profileUrl: string;
    /** Full name as displayed in the profile header */
    fullName: string;
    /** Headline text below the name */
    headline: string;

    // --- IDENTITY (optional) ---
    /** City, state, country as displayed */
    location?: string;
    /** Absolute URL of the profile photo */
    profileImageUrl?: string;

    // --- AUDIENCE METRICS (scraped from DOM if visible) ---
    /** Follower count as integer. Ex: 12400 */
    followerCount?: number;
    /** Connection count as integer. Ex: 500 (LinkedIn caps display at 500+) */
    connectionCount?: number;

    // --- CONTENT (optional but highly recommended) ---
    /** Full "About" section text */
    about?: string;
    /** Current/most recent position */
    currentRole?: {
        title: string;
        company: string;
        /** Ex: "Jan 2023 - Presente (2 anos)" */
        duration?: string;
    };
    /** Work history - up to 5 most recent positions */
    experience?: Array<{
        title: string;
        company: string;
        duration?: string;
        description?: string;
    }>;
    /** Top 3-5 skills listed on the profile */
    topSkills?: string[];
    /** Education section */
    education?: Array<{
        institution: string;
        degree?: string;
        period?: string;
    }>;

    // --- AUTHORITY INDICATORS ---
    /** Whether the profile shows a LinkedIn Top Voice badge */
    isTopVoice?: boolean;
    /** Number of posts/articles in the last 30 days (visible in activity section) */
    postsLastMonthCount?: number;
    /** First 2-3 post text snippets for content style analysis */
    recentPostSnippets?: string[];

    // --- META (required) ---
    /** ISO 8601 timestamp of when the Extension performed the scrape */
    scrapedAt: string;

    // --- LINKAGE (optional) ---
    /** RevHackers clients.id - if provided, result is persisted to the client record */
    clientId?: string;
    /** RevHackers rei_projects.id - if provided, result is linked to the project */
    projectId?: string;
}

// ================================================================
// ARCHETYPES
// ================================================================

const ARCHETYPES = ['Executor', 'Visionario', 'Tecnico', 'Relacionamento', 'Analitico'] as const;
type Archetype = typeof ARCHETYPES[number];

// ================================================================
// AUTHORITY SCORE - 100% deterministic formula
// LLM is NOT involved in score calculation.
// Formula is reproducible, auditable, and version-controlled here.
//
// Breakdown (total: 100):
//   Followers:    0-30 pts  (log scale)
//   Posts/month:  0-20 pts  (content frequency)
//   Profile fill: 0-25 pts  (completeness of key sections)
//   Top Voice:    0-15 pts  (badge)
//   Connections:  0-10 pts  (network density proxy)
// ================================================================

function calculateAuthorityScore(profile: ScrapedLinkedInProfile): number {
    let score = 0;

    // Followers (0-30)
    const followers = profile.followerCount ?? 0;
    if      (followers >= 50000) score += 30;
    else if (followers >= 10000) score += 25;
    else if (followers >= 5000)  score += 18;
    else if (followers >= 1000)  score += 11;
    else if (followers >= 500)   score += 6;
    else if (followers >= 100)   score += 3;

    // Posts/month (0-20)
    const posts = profile.postsLastMonthCount ?? 0;
    if      (posts >= 12) score += 20;
    else if (posts >= 8)  score += 16;
    else if (posts >= 4)  score += 11;
    else if (posts >= 1)  score += 6;

    // Profile completeness (0-25)
    if (profile.about) {
        if (profile.about.length > 400) score += 10;
        else if (profile.about.length > 100) score += 6;
        else score += 3;
    }
    if (profile.headline && profile.headline.length > 40)       score += 5;
    if ((profile.experience ?? []).length >= 3)                 score += 4;
    if ((profile.topSkills ?? []).length >= 3)                  score += 3;
    if ((profile.education ?? []).length > 0)                   score += 2;
    if ((profile.recentPostSnippets ?? []).length > 0)          score += 1;

    // Top Voice badge (0-15)
    if (profile.isTopVoice) score += 15;

    // Connection density (0-10)
    const conns = profile.connectionCount ?? 0;
    if      (conns >= 500) score += 10;
    else if (conns >= 200) score += 6;
    else if (conns >= 50)  score += 3;

    return Math.min(100, score);
}

// ================================================================
// PAYLOAD VALIDATOR
// Returns array of human-readable error strings.
// Empty array = valid.
// ================================================================

function validatePayload(body: unknown): string[] {
    const errors: string[] = [];
    const p = body as Record<string, unknown>;

    // Required string fields
    if (!p.profileUrl || typeof p.profileUrl !== 'string') {
        errors.push('profileUrl (string) obrigatorio');
    } else {
        const LINKEDIN_PATTERN = /^https:\/\/(www\.)?linkedin\.com\/(in|company|school)\/[a-zA-Z0-9\-_%]+\/?/;
        if (!LINKEDIN_PATTERN.test(p.profileUrl.trim())) {
            errors.push('profileUrl deve ser linkedin.com/in/... ou linkedin.com/company/...');
        }
    }
    if (!p.fullName || typeof p.fullName !== 'string' || (p.fullName as string).trim().length < 2) {
        errors.push('fullName (string, min 2 chars) obrigatorio');
    }
    if (!p.headline || typeof p.headline !== 'string') {
        errors.push('headline (string) obrigatorio');
    }
    if (!p.scrapedAt || typeof p.scrapedAt !== 'string' || isNaN(Date.parse(p.scrapedAt as string))) {
        errors.push('scrapedAt (ISO 8601 string) obrigatorio');
    }

    // Optional numeric fields
    if (p.followerCount !== undefined && (typeof p.followerCount !== 'number' || p.followerCount < 0)) {
        errors.push('followerCount deve ser um numero inteiro >= 0');
    }
    if (p.connectionCount !== undefined && (typeof p.connectionCount !== 'number' || p.connectionCount < 0)) {
        errors.push('connectionCount deve ser um numero inteiro >= 0');
    }
    if (p.postsLastMonthCount !== undefined && (typeof p.postsLastMonthCount !== 'number' || p.postsLastMonthCount < 0)) {
        errors.push('postsLastMonthCount deve ser um numero inteiro >= 0');
    }

    // Optional array fields
    if (p.topSkills !== undefined && !Array.isArray(p.topSkills)) {
        errors.push('topSkills deve ser array de strings');
    }
    if (p.experience !== undefined && !Array.isArray(p.experience)) {
        errors.push('experience deve ser array de objetos');
    }
    if (p.recentPostSnippets !== undefined && !Array.isArray(p.recentPostSnippets)) {
        errors.push('recentPostSnippets deve ser array de strings');
    }

    // Optional UUID fields
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (p.clientId !== undefined && (typeof p.clientId !== 'string' || !UUID_PATTERN.test(p.clientId as string))) {
        errors.push('clientId deve ser um UUID valido');
    }
    if (p.projectId !== undefined && (typeof p.projectId !== 'string' || !UUID_PATTERN.test(p.projectId as string))) {
        errors.push('projectId deve ser um UUID valido');
    }

    return errors;
}

// ================================================================
// SAFE TEXT - strip control chars, cap length, no ``` fences
// ================================================================
function safe(value: unknown, max = 300): string {
    if (!value) return '';
    return String(value)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/```/g, "'''")
        .substring(0, max)
        .trim();
}

// ================================================================
// MAIN HANDLER
// ================================================================

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // ============================================================
    // PHASE 2: AUTH GATE - JWT required
    // Chrome Extension sends the logged-in user's Supabase JWT.
    // Unauthenticated requests are dropped immediately with 401.
    // ============================================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Autorizacao necessaria. Envie o JWT no header Authorization: Bearer <token>.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    // @ts-ignore
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Token invalido ou expirado.' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        // @ts-ignore
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY nao configurado nos Supabase Secrets');

        // Payload size guard (5MB absolute ceiling - audio never expected here)
        const contentLength = Number(req.headers.get('content-length') ?? 0);
        if (contentLength > 5_000_000) {
            return new Response(JSON.stringify({ error: 'Payload excede 5MB' }), {
                status: 413,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const rawBody = await req.json();

        // ============================================================
        // PHASE 1: STRICT PAYLOAD VALIDATION
        // Reject malformed payloads before any processing.
        // ============================================================
        const validationErrors = validatePayload(rawBody);
        if (validationErrors.length > 0) {
            return new Response(JSON.stringify({
                error: 'Payload invalido',
                fields: validationErrors,
                hint: 'Consulte a interface ScrapedLinkedInProfile para o schema correto.',
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const profile = rawBody as ScrapedLinkedInProfile;

        // ============================================================
        // STEP 1: Deterministic authority score
        // Formula is pure math - no LLM, no randomness, always reproducible.
        // ============================================================
        const authorityScore = calculateAuthorityScore(profile);

        console.log(`[scrape-profile] Real profile received: "${profile.fullName}" | followers: ${profile.followerCount ?? 'N/A'} | score: ${authorityScore} | user: ${user.email}`);

        // ============================================================
        // STEP 2: LLM Analysis - ONLY on real scraped data
        // GPT receives structured text extracted from the profile.
        // It does NOT receive a URL. It does NOT search the web.
        // Its only job: classify archetype + qualitative commentary.
        // ============================================================
        const profileContext = [
            `Nome: ${safe(profile.fullName, 100)}`,
            `Headline: ${safe(profile.headline, 200)}`,
            profile.location    ? `Localizacao: ${safe(profile.location, 100)}`                                    : null,
            profile.followerCount !== undefined ? `Seguidores: ${profile.followerCount.toLocaleString('pt-BR')}` : null,
            profile.connectionCount !== undefined ? `Conexoes: ${profile.connectionCount >= 500 ? '500+' : String(profile.connectionCount)}` : null,
            profile.isTopVoice  ? 'Badge: LinkedIn Top Voice ativo'                                                : null,
            profile.postsLastMonthCount !== undefined ? `Posts no ultimo mes: ${profile.postsLastMonthCount}`     : null,
            profile.about       ? `Sobre (${profile.about.length} chars): ${safe(profile.about, 800)}`            : null,
            profile.currentRole ? `Cargo atual: ${safe(profile.currentRole.title, 80)} em ${safe(profile.currentRole.company, 80)}${profile.currentRole.duration ? ' (' + safe(profile.currentRole.duration, 50) + ')' : ''}` : null,
            (profile.experience ?? []).length > 0
                ? `Experiencia anterior: ${profile.experience!.slice(0, 3).map(e => `${safe(e.title, 60)} @ ${safe(e.company, 60)}`).join(' | ')}`
                : null,
            (profile.topSkills ?? []).length > 0
                ? `Skills: ${profile.topSkills!.slice(0, 5).map(s => safe(s, 50)).join(', ')}`
                : null,
            (profile.recentPostSnippets ?? []).length > 0
                ? `Amostras de posts: "${profile.recentPostSnippets!.slice(0, 2).map(s => safe(s, 200)).join(' | ')}"`
                : null,
        ].filter(Boolean).join('\n');

        const systemPrompt = `Voce e um Especialista em Personal Branding B2B da RevHackers. Sua funcao e classificar perfis LinkedIn reais em arquetipos estrategicos e identificar gaps de posicionamento.

REGRAS ABSOLUTAS:
- Analise SOMENTE os dados fornecidos pelo sistema. NAO invente informacoes ausentes.
- Use apenas hifen simples (-) como separador. NUNCA use o caractere em dash longo.
- Todas as respostas devem estar em portugues brasileiro correto.
- Siga estritamente o Schema JSON. Os 5 arquetipos disponiveis sao EXATAMENTE: ${ARCHETYPES.join(', ')}.
  Executor: resultados, metricas, eficiencia operacional.
  Visionario: futuro, tendencias, transformacao, inovacao.
  Tecnico: produto, tecnologia, metodologia, frameworks.
  Relacionamento: pessoas, cultura, networking, parcerias.
  Analitico: dados, pesquisa, estrategia, benchmarks.`;

        const userPrompt = `Analise este perfil LinkedIn real (dados coletados do DOM pelo sistema) e retorne o JSON de analise:

${profileContext}

Retorne EXATAMENTE este JSON (sem campos extras):
{
  "archetype": "um dos 5 arquetipos listados",
  "archetypeReason": "1 frase explicando a classificacao com base nos dados acima",
  "managementStyle": "Strategic" | "Operational" | "Hybrid",
  "summary": "analise estrategica em 2-3 frases. NAO copie a bio. Foque no impacto e posicionamento.",
  "softSkills": ["skill 1", "skill 2", "skill 3"],
  "blindSpots": ["gap 1 identificado nos dados", "gap 2"],
  "brandingGaps": ["o que falta no posicionamento digital baseado no que foi observado"],
  "actionableInsight": "conselho pratico e direto em 1-2 frases para implementar amanha"
}`;

        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-5.4-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt   },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
                max_tokens: 700,
            }),
        });

        if (!gptResponse.ok) {
            const errText = await gptResponse.text();
            throw new Error(`OpenAI API error ${gptResponse.status}: ${errText.substring(0, 200)}`);
        }

        const gptData = await gptResponse.json();
        const rawContent: string = gptData.choices?.[0]?.message?.content ?? '';

        let analysis: Record<string, any> = {};
        try {
            analysis = JSON.parse(rawContent.trim());
        } catch {
            console.error('[scrape-profile] GPT Structured Output falhou na validação JSON, usando fallback');
            analysis = {
                archetype: 'Executor',
                archetypeReason: 'Analise indisponivel.',
                managementStyle: 'Hybrid',
                summary: '',
                softSkills: [],
                blindSpots: [],
                brandingGaps: [],
                actionableInsight: '',
            };
        }

        // ============================================================
        // STEP 3: Compose final result
        // Deterministic fields are never overridden by LLM output.
        // ============================================================
        const resolvedArchetype: Archetype = ARCHETYPES.includes(analysis.archetype as Archetype)
            ? (analysis.archetype as Archetype)
            : 'Executor';

        const result = {
            // Raw data passthrough - source of truth, never modified
            profileUrl:         profile.profileUrl,
            fullName:           profile.fullName,
            headline:           profile.headline,
            location:           profile.location           ?? null,
            profileImageUrl:    profile.profileImageUrl    ?? null,
            followerCount:      profile.followerCount      ?? null,
            connectionCount:    profile.connectionCount    ?? null,
            about:              profile.about              ?? null,
            currentRole:        profile.currentRole        ?? null,
            topSkills:          profile.topSkills          ?? [],
            isTopVoice:         profile.isTopVoice         ?? false,
            postsLastMonthCount: profile.postsLastMonthCount ?? null,
            scrapedAt:          profile.scrapedAt,
            is_inferred:        false, // always false - this endpoint only accepts real DOM data

            // Deterministic score (formula above, not LLM)
            authorityScore,

            // LLM classification (operates on real data only)
            archetype:         resolvedArchetype,
            archetypeReason:   String(analysis.archetypeReason  ?? '').substring(0, 300),
            managementStyle:   ['Strategic', 'Operational', 'Hybrid'].includes(analysis.managementStyle)
                                 ? analysis.managementStyle : 'Hybrid',
            summary:           String(analysis.summary          ?? '').substring(0, 600),
            softSkills:        Array.isArray(analysis.softSkills)   ? analysis.softSkills.slice(0, 5)   : [],
            blindSpots:        Array.isArray(analysis.blindSpots)   ? analysis.blindSpots.slice(0, 3)   : [],
            brandingGaps:      Array.isArray(analysis.brandingGaps) ? analysis.brandingGaps.slice(0, 3) : [],
            actionableInsight: String(analysis.actionableInsight ?? '').substring(0, 400),

            // Audit trail
            analyzedAt: new Date().toISOString(),
            analyzedBy: user.id,
        };

        // ============================================================
        // STEP 4: Persist to DB when clientId is provided
        // ============================================================
        if (profile.clientId) {
            const { error: updateError } = await supabase
                .from('clients')
                .update({
                    linkedin_url:        profile.profileUrl,
                    linkedin_data:       result,
                    linkedin_scraped_at: profile.scrapedAt,
                } as any)
                .eq('id', profile.clientId);

            if (updateError) {
                // Non-blocking - log but don't fail the request
                console.warn(`[scrape-profile] Failed to persist to clients/${profile.clientId}: ${updateError.message}`);
            } else {
                console.log(`[scrape-profile] Persisted to clients/${profile.clientId}`);
            }
        } else if (profile.projectId) {
            // STEP 5: Persist to Lead Object if it's not a closed client yet (War Room)
            const { data: projData } = await supabase
                .from('rei_projects')
                .select('market_data')
                .eq('id', profile.projectId)
                .single();
            
            if (projData) {
                const updatedMarket = (projData as any).market_data || {};
                updatedMarket.linkedin_osint = result;

                const { error: pErr } = await supabase
                    .from('rei_projects')
                    .update({ market_data: updatedMarket } as any)
                    .eq('id', profile.projectId);
                    
                if (pErr) {
                    console.warn(`[scrape-profile] Failed to persist OSINT to rei_projects/${profile.projectId}: ${pErr.message}`);
                } else {
                    console.log(`[scrape-profile] OSINT Persisted perfectly to rei_projects/${profile.projectId}`);
                }
            }
        }

        console.log(`[scrape-profile] Done: "${result.fullName}" | archetype: ${result.archetype} | score: ${result.authorityScore}`);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error('[scrape-profile] Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
