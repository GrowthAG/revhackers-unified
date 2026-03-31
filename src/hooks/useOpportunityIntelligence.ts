import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface OpportunityContext {
  opportunity_id: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  client_site: string | null;
  client_logo: string | null;
  trade_name: string | null;
  type: string | null;
  pipeline_stage: string | null;
  enrichment_data: any | null;
  opportunity_data: any | null;
  market_data: any | null;
  site_analysis: any | null;
  meeting: {
    id: string;
    title: string | null;
    transcript: string | null;
    ai_insights: any | null;
    ai_summary: string | null;
    happened_at: string | null;
    video_url: string | null;
  } | null;
  diagnostico: {
    id: string;
    tipo: string | null;
    score: number | null;
    respostas: any | null;
  } | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useOpportunityIntelligence(opportunityId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<OpportunityContext | null>(null);

  useEffect(() => {
    if (!opportunityId) {
      setContext(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch opportunity
        const { data: opp, error: oppErr } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', opportunityId)
          .single();

        if (oppErr || !opp) {
          throw new Error(oppErr?.message || 'Oportunidade nao encontrada');
        }

        if (cancelled) return;

        // 2. Fetch meeting recording (if linked by ID or by legacy rei_project_id)
        let meeting: OpportunityContext['meeting'] = null;
        if ((opp as any).meeting_recording_id) {
          const { data: rec } = await supabase
            .from('meeting_recordings')
            .select('id, title, transcript, ai_insights, ai_summary, happened_at, video_url')
            .eq('id', (opp as any).meeting_recording_id)
            .single();

          if (rec && !cancelled) {
            meeting = {
              id: (rec as any).id,
              title: (rec as any).title,
              transcript: (rec as any).transcript,
              ai_insights: (rec as any).ai_insights,
              ai_summary: (rec as any).ai_summary,
              happened_at: (rec as any).happened_at,
              video_url: (rec as any).video_url,
            };
          }
        } else {
          // Fallback to legacy linkage where rei_project_id might hold the opportunity id
          const { data: recs } = await supabase
            .from('meeting_recordings')
            .select('id, title, transcript, ai_insights, ai_summary, happened_at, video_url')
            .eq('rei_project_id', (opp as any).id)
            .order('happened_at', { ascending: false })
            .limit(1);
            
          if (recs && recs.length > 0 && !cancelled) {
            const rec = recs[0];
            meeting = {
              id: (rec as any).id,
              title: (rec as any).title,
              transcript: (rec as any).transcript,
              ai_insights: (rec as any).ai_insights,
              ai_summary: (rec as any).ai_summary,
              happened_at: (rec as any).happened_at,
              video_url: (rec as any).video_url,
            };
          }
        }

        // 3. Fetch diagnostico (if linked)
        let diagnostico: OpportunityContext['diagnostico'] = null;
        if ((opp as any).diagnostico_id) {
          const { data: diag } = await supabase
            .from('diagnosticos')
            .select('id, tipo, score, respostas')
            .eq('id', (opp as any).diagnostico_id)
            .single();

          if (diag && !cancelled) {
            diagnostico = {
              id: (diag as any).id,
              tipo: (diag as any).tipo,
              score: (diag as any).score,
              respostas: (diag as any).respostas,
            };
          }
        }

        if (cancelled) return;

        // 4. Assemble context
        setContext({
          opportunity_id: (opp as any).id,
          client_name: (opp as any).client_name,
          client_email: (opp as any).client_email,
          client_company: (opp as any).client_company,
          client_site: (opp as any).client_site,
          client_logo: (opp as any).client_logo,
          trade_name: (opp as any).trade_name,
          type: (opp as any).type,
          pipeline_stage: (opp as any).pipeline_stage,
          enrichment_data: (opp as any).enrichment_data,
          opportunity_data: (opp as any).opportunity_data,
          market_data: (opp as any).market_data,
          site_analysis: (opp as any).site_analysis,
          meeting,
          diagnostico,
        });
      } catch (err: any) {
        if (!cancelled) {
          console.error('[useOpportunityIntelligence] Error:', err.message);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [opportunityId]);

  return { loading, error, context };
}

// ============================================================================
// STANDALONE LOADER (for non-hook contexts)
// ============================================================================

export async function loadOpportunityIntelligence(
  opportunityId: string,
): Promise<OpportunityContext | null> {
  // 1. Opportunity
  const { data: opp, error: oppErr } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (oppErr || !opp) return null;

  // 2. Meeting
  let meeting: OpportunityContext['meeting'] = null;
  if ((opp as any).meeting_recording_id) {
    const { data: rec } = await supabase
      .from('meeting_recordings')
      .select('id, title, transcript, ai_insights, ai_summary, happened_at, video_url')
      .eq('id', (opp as any).meeting_recording_id)
      .single();

    if (rec) {
      meeting = {
        id: (rec as any).id,
        title: (rec as any).title,
        transcript: (rec as any).transcript,
        ai_insights: (rec as any).ai_insights,
        ai_summary: (rec as any).ai_summary,
        happened_at: (rec as any).happened_at,
        video_url: (rec as any).video_url,
      };
    }
  } else {
      const { data: recs } = await supabase
        .from('meeting_recordings')
        .select('id, title, transcript, ai_insights, ai_summary, happened_at, video_url')
        .eq('rei_project_id', (opp as any).id)
        .order('happened_at', { ascending: false })
        .limit(1);

      if (recs && recs.length > 0) {
        const rec = recs[0];
        meeting = {
          id: (rec as any).id,
          title: (rec as any).title,
          transcript: (rec as any).transcript,
          ai_insights: (rec as any).ai_insights,
          ai_summary: (rec as any).ai_summary,
          happened_at: (rec as any).happened_at,
          video_url: (rec as any).video_url,
        };
      }
  }

  // 3. Diagnostico
  let diagnostico: OpportunityContext['diagnostico'] = null;
  if ((opp as any).diagnostico_id) {
    const { data: diag } = await supabase
      .from('diagnosticos')
      .select('id, tipo, score, respostas')
      .eq('id', (opp as any).diagnostico_id)
      .single();

    if (diag) {
      diagnostico = {
        id: (diag as any).id,
        tipo: (diag as any).tipo,
        score: (diag as any).score,
        respostas: (diag as any).respostas,
      };
    }
  }

  return {
    opportunity_id: (opp as any).id,
    client_name: (opp as any).client_name,
    client_email: (opp as any).client_email,
    client_company: (opp as any).client_company,
    client_site: (opp as any).client_site,
    client_logo: (opp as any).client_logo,
    trade_name: (opp as any).trade_name,
    type: (opp as any).type,
    pipeline_stage: (opp as any).pipeline_stage,
    enrichment_data: (opp as any).enrichment_data,
    opportunity_data: (opp as any).opportunity_data,
    market_data: (opp as any).market_data,
    site_analysis: (opp as any).site_analysis,
    meeting,
    diagnostico,
  };
}
