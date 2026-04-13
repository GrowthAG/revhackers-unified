// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fathom-signature',
};

/**
 * fathom-webhook
 *
 * Recebe webhook do Fathom quando uma reuniao termina.
 * Processa automaticamente sem necessidade de sync manual.
 *
 * Fluxo:
 *   Fathom envia evento → salva gravacao no DB → dispara analyze-meeting-transcript
 *
 * Configurar no Fathom: Settings > Integrations > Webhooks
 * URL: https://eqspbruarsdybpfeijnf.supabase.co/functions/v1/fathom-webhook
 * Secret: configurar FATHOM_WEBHOOK_SECRET nos secrets do Supabase
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validacao do webhook secret (OBRIGATORIO)
    const webhookSecret = Deno.env.get('FATHOM_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[fathom-webhook] FATHOM_WEBHOOK_SECRET nao configurado. Rejeitando request.');
      return new Response(JSON.stringify({ error: 'Webhook secret nao configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const signature = req.headers.get('x-fathom-signature') || req.headers.get('x-webhook-secret') || '';
    if (signature !== webhookSecret) {
      return new Response(JSON.stringify({ error: 'Assinatura invalida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('[fathom-webhook] Evento recebido:', JSON.stringify(body).substring(0, 300));

    // Fathom pode enviar diferentes formatos dependendo da versao da API
    // Suporta: event_type "meeting.completed", "call.ended" ou payload direto
    const eventType = body.event_type || body.type || 'meeting.completed';
    const meeting = body.meeting || body.data || body;

    if (!eventType.includes('meeting') && !eventType.includes('call')) {
      console.log('[fathom-webhook] Evento ignorado:', eventType);
      return new Response(JSON.stringify({ success: true, message: 'Evento ignorado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrai campos do payload do Fathom
    const fathomId = meeting.id || meeting.meeting_id || meeting.uuid || '';
    const title = meeting.title || meeting.name || meeting.subject || 'Reuniao sem titulo';
    const recordingUrl = meeting.recording_url || meeting.video_url || meeting.playback_url || meeting.url || '';
    const happenedAt = meeting.started_at || meeting.created_at || meeting.date || new Date().toISOString();

    // Transcript - Fathom pode retornar texto ou URL
    let transcript = '';
    if (typeof meeting.transcript === 'string' && meeting.transcript.length > 10) {
      transcript = meeting.transcript;
    } else if (meeting.transcript_text) {
      transcript = meeting.transcript_text;
    }

    // Summary do Fathom
    const fathomSummary = meeting.summary || meeting.ai_summary || '';

    // Action items do Fathom - vao direto para orqflow_tasks se houver project_id
    const actionItems: string[] = [];
    if (Array.isArray(meeting.action_items)) {
      meeting.action_items.forEach((item: any) => {
        if (typeof item === 'string') actionItems.push(item);
        else if (item.text || item.title || item.content) actionItems.push(item.text || item.title || item.content);
      });
    }

    // Verifica se ja existe (por fathom_meeting_id para evitar duplicatas)
    if (fathomId) {
      const { data: existing } = await supabase
        .from('meeting_recordings')
        .select('id')
        .eq('fathom_meeting_id', fathomId)
        .maybeSingle();

      if (existing) {
        console.log('[fathom-webhook] Reuniao ja existe:', fathomId);
        return new Response(JSON.stringify({ success: true, message: 'Ja importado', id: existing.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Tenta associar ao projeto pelo email dos participantes
    let projectId: string | null = null;
    const attendees = meeting.attendees || meeting.guests || meeting.participants || [];
    const attendeeEmails: string[] = attendees
      .map((a: any) => (typeof a === 'string' ? a : a.email || a.contact_email || ''))
      .filter(Boolean);

    if (attendeeEmails.length > 0) {
      for (const email of attendeeEmails) {
        const { data: proj } = await supabase
          .from('rei_projects')
          .select('id')
          .eq('client_email', email)
          .in('pipeline_stage', ['onboarding', 'active'])
          .maybeSingle();
        if (proj) {
          projectId = proj.id;
          break;
        }
      }
    }

    // Insere a gravacao
    const { data: inserted, error: insertErr } = await supabase
      .from('meeting_recordings')
      .insert({
        title,
        video_url: recordingUrl,
        transcript: transcript || null,
        ai_summary: fathomSummary || null,
        happened_at: happenedAt,
        transcript_status: transcript ? 'completed' : 'pending',
        fathom_meeting_id: fathomId || null,
        rei_project_id: projectId,
      })
      .select()
      .single();

    if (insertErr) throw new Error(`Erro ao salvar gravacao: ${insertErr.message}`);

    console.log('[fathom-webhook] Gravacao salva:', inserted.id);

    // Dispara analise se tiver transcript
    if (transcript && transcript.length > 50) {
      supabase.functions.invoke('analyze-meeting-transcript', {
        body: { recordingId: inserted.id }
      }).catch(err => console.error('[fathom-webhook] Erro ao chamar analise:', err));
    }

    // Cria tasks no orqflow se houver action items e projeto associado
    if (actionItems.length > 0 && projectId) {
      const tasks = actionItems.map(item => ({
        project_id: projectId,
        title: item,
        status: 'todo',
        priority: 'medium',
        description: `Combinado na reuniao: ${title}`,
      }));

      await supabase.from('orqflow_tasks').insert(tasks).catch(err =>
        console.error('[fathom-webhook] Erro ao criar tasks:', err)
      );

      console.log(`[fathom-webhook] ${tasks.length} tasks criadas para projeto ${projectId}`);
    }

    return new Response(JSON.stringify({
      success: true,
      recording_id: inserted.id,
      project_matched: !!projectId,
      transcript_queued: transcript.length > 50,
      tasks_created: actionItems.length > 0 && !!projectId ? actionItems.length : 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[fathom-webhook] Erro:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
