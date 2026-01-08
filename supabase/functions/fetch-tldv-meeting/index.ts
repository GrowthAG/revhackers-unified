
declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Hardcoded CORS headers for debugging
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TLDV_API_BASE = "https://pasta.tldv.io/v1alpha1";

const extractClientData = (meeting: any, transcriptText: string = "") => {
    const res = { clientEmail: "", clientContactName: "", clientName: "" };
    const title = meeting.name || meeting.title || "";
    const people = meeting.participants || meeting.attendees || [];

    // 1. Participant Details
    let clientFound = false;
    const INTERNAL_NAMES = ['Giulliano Alves', 'Giulliano', 'RevHackers', 'Bot', 'Notetaker', 'tl;dv', 'Host'];

    console.log('[TLDV] Participants raw:', JSON.stringify(people));

    if (Array.isArray(people) && people.length > 0) {
        const client = people.find((p: any) => {
            const e = (p.email || p.emailAddress || "").toLowerCase();
            const n = (p.name || "").toLowerCase();
            // FILTER RULES:
            // 1. Must have email
            // 2. Must not be internal domains (revhackers, tldv)
            // 3. Must not be known internal names (Giulliano, Bot, Host)
            return e &&
                !e.includes('revhackers.com') &&
                !e.includes('tldv.io') &&
                !INTERNAL_NAMES.some(i => n.includes(i.toLowerCase()));
        });
        if (client) {
            res.clientEmail = client.email || client.emailAddress || "";
            res.clientContactName = client.name || (res.clientEmail.split('@')[0].split(/[._]/)[0].replace(/\b\w/g, (c: string) => c.toUpperCase())) || "";

            if (res.clientEmail && !res.clientEmail.match(/gmail|outlook|hotmail|yahoo|icloud/i)) {
                try {
                    const dom = res.clientEmail.split('@')[1].split('.')[0];
                    res.clientName = dom.charAt(0).toUpperCase() + dom.slice(1);
                } catch (e) { }
            }
            clientFound = true;
        }
    }

    // 1.5 Transcript Scan Fallback
    if (!clientFound && transcriptText) {
        const speakerRegex = /^([^:]+):/gm;
        const potentialNames = new Set<string>();
        let match;
        // Check first 15k chars
        while ((match = speakerRegex.exec(transcriptText.substring(0, 15000))) !== null) {
            const name = match[1].trim();
            if (name.length > 1 && !name.includes('http') && !name.includes('Speaker')) {
                const isInternal = INTERNAL_NAMES.some(internal => name.toLowerCase().includes(internal.toLowerCase()));
                if (!isInternal) {
                    potentialNames.add(name);
                }
            }
        }

        if (potentialNames.size > 0) {
            res.clientContactName = Array.from(potentialNames)[0];
            // If contact found but no company, try to infer
            if (!res.clientName && res.clientContactName) {
                // Don't prefix with 'Empresa de' - leave blank to use title fallback
            }
        }
    }

    // 2. Title Logic
    if (title) {
        let extracted = "";
        if (title.includes('with')) extracted = title.split('with').pop()!.trim();
        else if (title.includes(' x ')) {
            const parts = title.split(' x ');
            extracted = parts[0].toLowerCase().includes('revhackers') ? parts[1].trim() : parts[0].trim();
        }
        else if (title.includes('>')) extracted = title.split('>').pop()!.trim();
        else if (title.includes(' - ')) extracted = title.split(' - ').pop()!.trim();

        if (extracted && extracted.length > 2) res.clientName = extracted;
        else if (!res.clientName) res.clientName = title.replace(/Reunião de |Reunion of |Kickoff |Meeting |tl;dv /gi, '').trim();
    }

    return res;
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const { meetingUrl, apiKey, action, meetingId: providedId } = await req.json();

        // DEBUG: Force working key
        const TLDV_API_KEY = "14539301-bff7-4b91-9689-3af63ae7d5cc";

        console.log(`Executing fetch-tldv-meeting with action: ${action || 'default'}`);

        // LIST
        if (action === 'list') {
            console.log("Fetching meeting list from tl;dv...");
            const res = await fetch(`${TLDV_API_BASE}/meetings?limit=20&orderBy=createdAt&orderDirection=desc`, {
                headers: { 'x-api-key': TLDV_API_KEY }
            });

            if (!res.ok) {
                console.error(`tl;dv API error: ${res.status} ${res.statusText}`);
                const errText = await res.text();
                throw new Error(`tl;dv API Error: ${errText}`);
            }

            const data = await res.json();
            console.log("Response structure keys:", Object.keys(data));
            const meetings = (data.results || data.data || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                createdAt: m.happenedAt || m.createdAt || new Date().toISOString(),
                duration: m.duration,
                url: m.recordingUrl,
                ...extractClientData(m)
            }));

            return new Response(JSON.stringify({ success: true, data: meetings }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // SINGLE FETCH
        let meetingId = providedId;
        if (!meetingId && meetingUrl) {
            const matches = meetingUrl.match(/meetings?\/([a-zA-Z0-9-]+)/);
            if (matches) meetingId = matches[1];
        }

        if (meetingId) {
            const [mRes, tRes] = await Promise.all([
                fetch(`${TLDV_API_BASE}/meetings/${meetingId}`, { headers: { 'x-api-key': TLDV_API_KEY } }),
                fetch(`${TLDV_API_BASE}/meetings/${meetingId}/transcript`, { headers: { 'x-api-key': TLDV_API_KEY } })
            ]);

            if (mRes.ok) {
                const meeting = await mRes.json();

                // Fix: Construct video URL if missing (it usually is in single fetch)
                if (!meeting.recordingUrl && meeting.id) {
                    meeting.recordingUrl = `https://tldv.io/app/meetings/${meeting.id}`;
                }

                // Fix: Ensure date is consistent
                if (!meeting.createdAt && meeting.happenedAt) {
                    meeting.createdAt = meeting.happenedAt;
                }

                let transcriptText = "";
                let debugInfo = "";

                if (tRes.ok) {
                    try {
                        const tData = await tRes.json();
                        const isArray = Array.isArray(tData);
                        debugInfo = `Status: ${tRes.status}, IsArray: ${isArray}, Keys: ${Object.keys(tData)}`;

                        const transcriptArray = isArray ? tData : (tData.results || tData.data || []);

                        if (Array.isArray(transcriptArray)) {
                            transcriptText = transcriptArray.map((t: any) => `${t.speaker || 'Speaker'}: ${t.text}`).join('\n');
                            debugInfo += `, Items: ${transcriptArray.length}`;
                        } else {
                            debugInfo += ", FAILED TO FIND ARRAY";
                        }
                    } catch (e: any) {
                        debugInfo += `, JSON Parse Error: ${e.message}`;
                    }
                } else {
                    debugInfo = `Fetch Failed: ${tRes.status} ${tRes.statusText}`;
                    try { debugInfo += ` Body: ${await tRes.text()}`; } catch (e) { }
                }

                if (!transcriptText) {
                    transcriptText = `[[Transcrição indisponível. Detalhes: ${debugInfo}]]`;
                }

                console.log(`Single fetch success. Video: ${meeting.recordingUrl}, Transcript len: ${transcriptText.length}`);

                return new Response(JSON.stringify({
                    success: true,
                    data: { ...meeting, ...extractClientData(meeting, transcriptText), transcript: transcriptText }
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
        }

        return new Response(JSON.stringify({ success: false, error: 'Meeting not found' }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (e: any) {
        console.error("Function error:", e.message);
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});
