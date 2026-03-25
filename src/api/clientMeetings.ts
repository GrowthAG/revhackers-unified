import { supabase } from "@/integrations/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────────
export interface MeetingAttendee {
    email: string;
    name: string;
    status: string;
}

export interface Meeting {
    google_event_id: string;
    title: string;
    meeting_type: 'proposta' | 'kickoff' | 'planejamento' | 'review' | 'suporte' | 'outro';
    meeting_date: string;
    duration_minutes: number;
    meet_link: string;
    video_url: string;
    video_embed_url: string;
    drive_file_id: string;
    thumbnail_url: string;
    recording_shared: boolean;
    attendees: MeetingAttendee[];
    client_name: string;
    client_email: string;
    client_contact_name: string;
}

// ── Fetch meetings from Google APIs via Edge Function ─────────────────────────
export async function fetchGoogleMeetings(clientEmail?: string): Promise<Meeting[]> {
    const { data, error } = await supabase.functions.invoke('google-meetings', {
        body: {
            action: 'list',
            client_email: clientEmail || undefined,
        },
    });

    if (error) {
        console.error('Error fetching Google meetings:', error);
        return [];
    }

    if (!data?.success) {
        console.error('Google meetings API error:', data?.error);
        return [];
    }

    return data.data || [];
}

// ── Fetch recording for a specific touchpoint from DB ─────────────────────────
// Used to embed call videos in proposals, kickoff docs, strategic plans, etc.
export async function fetchMeetingRecording(
    clientEmail: string,
    meetingType: Meeting['meeting_type']
): Promise<{ video_embed_url: string; video_url: string; title: string; meeting_date: string } | null> {
    const { data, error } = await supabase
        .from('client_meetings')
        .select('video_url, drive_file_id, title, meeting_date, has_recording')
        .eq('client_email', clientEmail)
        .eq('meeting_type', meetingType)
        .eq('has_recording', true)
        .order('meeting_date', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return {
        video_embed_url: data.drive_file_id ? `https://drive.google.com/file/d/${data.drive_file_id}/preview` : '',
        video_url: data.video_url || '',
        title: data.title || '',
        meeting_date: data.meeting_date || '',
    };
}

// ── Get embed URL from a Drive file ID ────────────────────────────────────────
export function getMeetingEmbedUrl(driveFileId: string): string {
    if (!driveFileId) return '';
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
}

// ── Meeting type labels and colors ────────────────────────────────────────────
export const MEETING_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
    proposta: { label: 'Proposta', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', emoji: '🟡' },
    kickoff: { label: 'Kickoff', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', emoji: '🟢' },
    planejamento: { label: 'Planejamento', color: 'text-zinc-700', bg: 'bg-zinc-50 border-zinc-200', emoji: '🔵' },
    review: { label: 'Review', color: 'text-zinc-700', bg: 'bg-zinc-50 border-zinc-300', emoji: '⬜' },
    suporte: { label: 'Suporte', color: 'text-zinc-600', bg: 'bg-zinc-50 border-zinc-200', emoji: '🟠' },
    outro: { label: 'Reunião', color: 'text-zinc-600', bg: 'bg-zinc-50 border-zinc-200', emoji: '⚪' },
};

// ── Duration formatter ────────────────────────────────────────────────────────
export function formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
}

