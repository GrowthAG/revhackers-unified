// =============================================================================
// clickup-sync
//
// Recebe webhooks do ClickUp e sincroniza status de tarefas/sprints
// de volta ao Hub (Supabase).
//
// Eventos tratados:
//   taskStatusUpdated  → atualiza progresso da sprint no Hub
//   taskCreated        → registra referencia se tem hub_project_id
//   taskDeleted        → marca como deletada (nao remove do Hub)
//   folderDeleted      → marca projeto como clickup_orphaned
//
// Seguranca:
//   Valida header X-Signature (HMAC-SHA256 do body com CLICKUP_WEBHOOK_SECRET).
//   Ignora eventos sem hub_project_id nos custom fields (nao sao nossos).
//
// Registro do webhook (rodar uma vez via script):
//   POST https://api.clickup.com/api/v2/team/{workspace_id}/webhook
//   { "endpoint": "<url>", "events": ["taskCreated","taskStatusUpdated",
//     "taskDeleted","folderDeleted","taskUpdated"] }
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// @ts-ignore Deno runtime
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore Deno runtime
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
// @ts-ignore Deno runtime
const WEBHOOK_SECRET       = Deno.env.get('CLICKUP_WEBHOOK_SECRET') ?? '';

// ---------------------------------------------------------------------------
// Verificacao de assinatura HMAC-SHA256
// ---------------------------------------------------------------------------

async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    if (Deno.env.get('CLICKUP_ALLOW_UNSIGNED') === 'true') {
      console.warn('[clickup-sync] CLICKUP_WEBHOOK_SECRET nulo mas CLICKUP_ALLOW_UNSIGNED=true — skip verificacao (DEV ONLY)');
      return true;
    }
    console.error('[clickup-sync] CLICKUP_WEBHOOK_SECRET nulo e CLICKUP_ALLOW_UNSIGNED=false - bloqueando requisicao!');
    return false;
  }
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    const expected = Array.from(new Uint8Array(mac))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return expected === signature;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Extrai hub_project_id dos custom fields de uma task do ClickUp
// ---------------------------------------------------------------------------

function extractHubProjectId(customFields: any[]): string | null {
  if (!Array.isArray(customFields)) return null;
  const field = customFields.find(
    (f: any) => f.name === 'hub_project_id' && f.value
  );
  return field?.value ?? null;
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const bodyText = await req.text();

  // Valida assinatura
  const signature = req.headers.get('X-Signature') ?? '';
  const valid = await verifySignature(bodyText, signature);
  if (!valid) {
    console.warn('[clickup-sync] assinatura invalida — requisicao rejeitada');
    return new Response(JSON.stringify({ error: 'Assinatura invalida' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return new Response(JSON.stringify({ error: 'Payload invalido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const event: string  = payload.event ?? '';
  const taskData: any  = payload.task_id ? payload : payload.history_items?.[0] ?? payload;
  const taskId: string = payload.task_id ?? taskData?.id ?? '';

  console.log(`[clickup-sync] evento=${event}, task_id=${taskId}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // --- DEDUPLICACAO POR CONFLITO ESTRITO (Idempotency Lock - MODULO 3) ---
  // Jamais usar webhook_id como identificador de evento: webhook_id identifica a CONFIGURACAO (e eh o mesmo para milhares de callbacks)
  // Usamos primariamente o ID da mutacao (history item) imutavel.
  let eventId = payload.history_items?.[0]?.id;

  if (!eventId) {
    // Falha em fallback: Hasheamos o bodyText inteiro. Assinatura infalivel para um mesmo payload (GHL retry behavior).
    const msgUint8 = new TextEncoder().encode(bodyText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    eventId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const hubProjectId = extractHubProjectId(taskData?.custom_fields ?? []);

  const { data: syncEntry } = await supabase.from('clickup_sync_events').insert({
      event_id: eventId,
      event_type: event,
      task_id: taskId,
      hub_project_id: hubProjectId,
      payload: payload
  }).select('id').maybeSingle();

  if (!syncEntry) {
      console.log(`[clickup-sync] Evento ignorado via IDEMPOTENCIA (duplicate). eventId: ${eventId}`);
      return new Response(JSON.stringify({ ok: true, ignored: 'duplicate' }), {
          headers: { 'Content-Type': 'application/json' },
      });
  }

  // ─── taskCreated ────────────────────────────────────────────────────────
  if (event === 'taskCreated') {
    if (!hubProjectId) {
      // Nao e nossa task — ignora silenciosamente
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[clickup-sync] taskCreated hub_project=${hubProjectId} task=${taskId}`);
    // O registro deduplicador ja foi inserido em clickup_sync_events acima gravando id do projeto e a existencia da materlizacao da task
    return new Response(JSON.stringify({ ok: true, event, processed: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── taskStatusUpdated ──────────────────────────────────────────────────
  if (event === 'taskStatusUpdated') {
    // [GHL Pipeline Round-Trip]: Ignorando propositalmente notificacoes granulares
    // de tasks individuais para evitar estouro de quotas e rate limits na Edge Function.
    // O controle macro agora eh feito pelo trigger listUpdated (Sprints).
    return new Response(JSON.stringify({ ok: true, ignored: 'taskStatusUpdated bypassed para economizar cota' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── listUpdated ────────────────────────────────────────────────────────
  if (event === 'listUpdated') {
    const listId: string = payload.list_id ?? payload.id ?? '';
    const newStatus: string = payload.history_items?.[0]?.after?.status ?? '';

    if (!listId || !newStatus) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Busca sprint correspondente pelo list_id dentro de clickup_integrations
    const { data: integrations } = await supabase
      .from('clickup_integrations')
      .select('id, rei_project_id, sprint_lists')
      .not('sprint_lists', 'is', null);

    let matchedProjectId: string | null = null;
    let matchedSprintIndex: number | null = null;

    for (const integ of integrations ?? []) {
      const lists: any[] = integ.sprint_lists ?? [];
      const found = lists.find((l: any) => l.list_id === listId);
      if (found) {
        matchedProjectId  = integ.rei_project_id;
        matchedSprintIndex = found.sprint_index;
        break;
      }
    }

    if (!matchedProjectId) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(
      `[clickup-sync] listUpdated projeto=${matchedProjectId} ` +
      `sprint=${matchedSprintIndex} novo_status=${newStatus}`
    );

    // [GHL Pipeline Round-Trip]: Sincroniza estado macro de volta pro CRM
    const { data: project } = await supabase
      .from('rei_projects')
      .select('ghl_opportunity_id, organizations ( slug, settings )')
      .eq('id', matchedProjectId)
      .maybeSingle();

    if (project?.ghl_opportunity_id && (project as any).organizations?.settings) {
      const org = (project as any).organizations;
      const settings = org.settings;
      const slug = org.slug;

      const csPipelineStages = settings.ghl_pipelines?.cs_journey_stages;

      if (csPipelineStages) {
        let targetStageId = null;
        const normalizedStatus = newStatus.toLowerCase();

        if (['atrasado', 'risk', 'blocked', 'overdue', 'impedimento', 'risco'].some(s => normalizedStatus.includes(s))) {
          targetStageId = csPipelineStages.risk;
        } else if (['done', 'concluído', 'complete', 'completed'].some(s => normalizedStatus.includes(s))) {
          targetStageId = csPipelineStages.active;
        } else if (['in progress', 'doing', 'em andamento'].some(s => normalizedStatus.includes(s))) {
          targetStageId = csPipelineStages.active;
        }

        if (targetStageId) {
          let ghlToken = '';
          if (slug === 'growth-funnels') ghlToken = Deno.env.get('GHL_PIT_FUNNELS') || '';
          if (slug === 'revhackers') ghlToken = Deno.env.get('GHL_PIT_REVHACKERS') || '';

          if (ghlToken) {
            console.log(`[clickup-sync] Deslizando pipeline no GHL (Opp: ${project.ghl_opportunity_id}) para Stage: ${targetStageId}`);
            try {
              const ghlRes = await fetch(`https://services.leadconnectorhq.com/opportunities/${project.ghl_opportunity_id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${ghlToken}`,
                  'Version': '2021-07-28',
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ pipelineStageId: targetStageId })
              });
              if (!ghlRes.ok) {
                console.error(`[clickup-sync] Falha ao deslizar pipeline GHL: ${await ghlRes.text()}`);
              }
            } catch(e) {
              console.error(`[clickup-sync] Excecao deslizando pipeline GHL:`, e);
            }
          }
        }
      }
    }

    // Salva log de atividade (extensivel para metricas de progresso)
    await supabase
      .from('clickup_provisioning_log')
      .insert({
        rei_project_id: matchedProjectId,
        from_state: 'list_status_sync',
        to_state: 'list_status_sync',
        payload: {
          event,
          list_id: listId,
          sprint_index: matchedSprintIndex,
          new_status: newStatus,
        },
      });

    // Atualiza flag de observabilidade de consistencia bidirecional
    await supabase.from('rei_projects')
      .update({ last_clickup_sync_at: new Date().toISOString() })
      .eq('id', matchedProjectId);

    return new Response(JSON.stringify({ ok: true, event, synced: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── taskDeleted ────────────────────────────────────────────────────────
  if (event === 'taskDeleted') {
    console.log(`[clickup-sync] taskDeleted task=${taskId} — registrado, sem acao no Hub`);
    // Optamos por nao deletar dados no Hub quando uma task e deletada no ClickUp.
    // O Hub e a fonte de verdade. A delecao no ClickUp e operacional.
    return new Response(JSON.stringify({ ok: true, event }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── folderDeleted ──────────────────────────────────────────────────────
  if (event === 'folderDeleted') {
    const folderId: string = payload.folder_id ?? '';

    if (!folderId) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Encontra projeto pelo folder_id deletado
    const { data: integ } = await supabase
      .from('clickup_integrations')
      .select('id, rei_project_id')
      .eq('clickup_folder_id', folderId)
      .maybeSingle();

    if (!integ) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.warn(
      `[clickup-sync] folderDeleted! folder=${folderId} projeto=${integ.rei_project_id} — marcando orphaned`
    );

    // Marca integracao como falha para alertar o admin
    await supabase
      .from('clickup_integrations')
      .update({
        workspace_status: 'failed',
        sprints_status: 'failed',
        last_error: `Folder deletado no ClickUp em ${new Date().toISOString()}. Reprovisionar manualmente.`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integ.id);

    // Log auditavel
    await supabase
      .from('clickup_provisioning_log')
      .insert({
        rei_project_id: integ.rei_project_id,
        from_state: 'done',
        to_state: 'failed',
        payload: { event, folder_id: folderId },
        error: 'Folder deletado manualmente no ClickUp. Hub marcado como orphaned.',
      });

    return new Response(JSON.stringify({ ok: true, event, orphaned: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Evento nao tratado ─────────────────────────────────────────────────
  console.log(`[clickup-sync] evento nao tratado: ${event}`);
  return new Response(JSON.stringify({ ok: true, event, ignored: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
