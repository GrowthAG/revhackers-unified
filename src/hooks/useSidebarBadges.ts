import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SidebarBadges {
  pipeline: number;
  projects: number;
}

export function useSidebarBadges(): SidebarBadges {
  const [badges, setBadges] = useState<SidebarBadges>({ pipeline: 0, projects: 0 });

  useEffect(() => {
    let stale = false;

    const fetchCounts = async () => {
      try {
        const [pipelineRes, projectsRes] = await Promise.all([
          supabase
            .from('rei_projects')
            .select('id', { count: 'exact', head: true })
            .not('pipeline_stage', 'in', '(won,lost)')
            .not('status', 'eq', 'archived'),
          supabase
            .from('rei_projects')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active')
            .not('pipeline_stage', 'in', '(won,lost,lead_inbound)'),
        ]);

        if (!stale) {
          setBadges({
            pipeline: pipelineRes.count || 0,
            projects: projectsRes.count || 0,
          });
        }
      } catch (err) {
        console.error('[useSidebarBadges] fetch error:', err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => { stale = true; clearInterval(interval); };
  }, []);

  return badges;
}
