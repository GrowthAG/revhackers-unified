// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fathom-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const webhookSecret = Deno.env.get('FATHOM_WEBHOOK_SECRET');
    if (webhookSecret) {
      const signature = req.headers.get('x-fathom-signature') || req.headers.get('x-webhook-secret') || '';
      if (signature !== webhookSecret) return new Response(JSON.stringify({ error: 'Assinatura invalida' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const eventType = body.event_type || body.type || 'meeting.completed';
    const meeting = body.meeting || body.data || body;

    if (!eventType.includes('meeting') && !eventType.includes('call')) {
      return new Response(JSON.stringify({ success: true, message: 'Evento ignorado' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const fathomId = meeting.id || meeting.meeting_id || meeting.uuid || '';
    const title = meeting.title || meeting.name || meeting.subject || 'Reuniao sem titulo';
    const recordingUrl = meeting.recording_url || meeting.video_url || meeting.playback_url || meeting.url || '';
    const happenedAt = meeting.started_at || meeting.created_at || meeting.date || new Date().toISOString();

    let transcript = '';
    if (typeof meeting.transcript === 'string' && meeting.transcript.length > 10) transcript = meeting.transcript;
    else if (meeting.transcript_text) transcript = meeting.transcript_text;

    const fathomSummary = meeting.summary || meeting.ai_summary || '';

    const actionItems = [];
    if (Array.isArray(meeting.action_items)) {
      meeting.action_items.forEach((item) => {
        if (typeof item === 'string') actionItems.push(item);
        else if (item.text || item.title || item.content) actionItems.push(item.text || item.title || item.content);
      });
    }

    if (fathomId) {
      const { data: existing } = await supabase.from('meeting_recordings').select('id').eq('fathom_meeting_id', fathomId).maybeSingle();
      if (existing) return new Response(JSON.stringify({ success: true, message: 'Ja importado', id: existing.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let projectId = null;
    const attendees = meeting.attendees || meeting.guests || meeting.participants || [];
    const attendeeEmails = attendees.map((a) => (typeof a === 'string' ? a : a.email || a.contact_email || '')).filter(Boolean);

    for (const email of attendeeEmails) {
      const { data: proj } = await supabase.from('rei_projects').select('id').eq('client_email', email).in('pipeline_stage', ['onboarding', 'active']).maybeSingle();
      if (proj) { projectId = proj.id; break; }
    }

    const { data: inserted, error: insertErr } = await supabase.from('meeting_recordings').insert({
      title, video_url: recordingUrl, transcript: transcript || null, ai_summary: fathomSummary || null,
      happened_at: happenedAt, transcript_status: transcript ? 'completed' : 'pending',
      fathom_meeting_id: fathomId || null, rei_project_id: projectId,
    }).select().single();

    if (insertErr) throw new Error(`Erro ao salvar: ${insertErr.message}`);

    if (transcript && transcript.length > 50) {
      supabase.functions.invoke('analyze-meeting-transcript', { body: { recordingId: inserted.id } }).catch(console.error);
    }

    if (actionItems.length > 0 && projectId) {
      const tasks = actionItems.map((item) => ({ project_id: projectId, title: item, status: 'todo', priority: 'medium', description: `Combinado na reuniao: ${title}` }));
      supabase.from('orqflow_tasks').insert(tasks).catch(console.error);
    }

    return new Response(JSON.stringify({ success: true, recording_id: inserted.id, project_matched: !!projectId, transcript_queued: transcript.length > 50, tasks_created: actionItems.length > 0 && !!projectId ? actionItems.length : 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[fathom-webhook]', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});