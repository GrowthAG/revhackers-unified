import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, X, Link2, Loader2, Calendar, BrainCircuit, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrphanedRecording {
  id: string;
  title: string | null;
  happened_at: string | null;
  ai_summary: string | null;
  transcript_status: string | null;
}

interface ProjectOption {
  id: string;
  label: string;
}

export const OrphanedRecordingsAlert: React.FC = () => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<OrphanedRecording[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<Record<string, string>>({});
  const [linking, setLinking] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<false | { count: number }>(() => {
    try {
      const stored = localStorage.getItem('revhackers_orphaned_alert_dismissed');
      if (!stored) return false;
      const { dismissed_at, count } = JSON.parse(stored);
      const hoursSince = (Date.now() - new Date(dismissed_at).getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 24) return false;
      return { count };
    } catch { return false; }
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrphaned();
    fetchProjects();
  }, []);

  const fetchOrphaned = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_recordings')
        .select('id, title, happened_at, ai_summary, transcript_status')
        .is('rei_project_id', null)
        .neq('transcript_status', 'ignored')
        .order('happened_at', { ascending: false });

      if (error) throw error;
      let recs = (data as unknown as OrphanedRecording[]) || [];

      // ✨ Google Calendar Matcher: match "Meet: xxx" titles with scheduled_meetings
      try {
        const { data: schedData } = await supabase
          .from('scheduled_meetings')
          .select('title, start_time')
          .order('start_time', { ascending: false })
          .limit(100);

        if (schedData && schedData.length > 0) {
          recs = recs.map(rec => {
            if (rec.title?.startsWith('Meet:') && rec.happened_at) {
              const recTime = new Date(rec.happened_at).getTime();
              // Acha a reunião do calendário mais próxima (dentro de 45 min de tolerância)
              const matched = schedData.find(s => {
                if (!s.start_time) return false;
                const sTime = new Date(s.start_time).getTime();
                return Math.abs(recTime - sTime) < 45 * 60 * 1000;
              });
              if (matched && matched.title) {
                return { ...rec, title: matched.title };
              }
            }
            return rec;
          });
        }
      } catch (calErr) {
        console.warn('[OrphanedRecordings] calendar match failed:', calErr);
      }

      setRecordings(recs);
    } catch (err) {
      console.error('[OrphanedRecordings] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, trade_name, type, status, pipeline_stage')
        .not('status', 'eq', 'archived')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const PRE_SALE  = ['lead_inbound','lead_qualified','diagnostic_done','proposal_draft','proposal_sent','proposal_viewed','negotiation'];
      
      const filteredData = (data || []).filter((p: any) => 
          !PRE_SALE.includes(p.pipeline_stage || '') && p.pipeline_stage !== 'lost' && p.status !== 'lead'
      );

      const options: ProjectOption[] = filteredData.map((p: any) => ({
        id: p.id,
        label: `${p.trade_name || p.client_company || p.client_name} (Projeto ${p.type})`,
      }));
      setProjects(options);
    } catch (err) {
      console.error('[OrphanedRecordings] projects fetch error:', err);
    }
  };

  const handleLink = async (recordingId: string) => {
    const projectId = selectedProject[recordingId];
    if (!projectId) {
      toast({ title: 'Selecione um projeto', description: 'Escolha o projeto antes de vincular.', variant: 'destructive' });
      return;
    }

    setLinking(recordingId);
    try {
      const { error } = await supabase
        .from('meeting_recordings')
        .update({ rei_project_id: projectId } as any)
        .eq('id', recordingId);

      if (error) throw error;

      // Get recording to check if it's a kickoff type
      const rec = recordings.find(r => r.id === recordingId);
      const title = (rec?.title || '').toLowerCase();
      const isKickoff = title.includes('kickoff') || title.includes('proposta') || title.includes('onboarding');

      if (isKickoff) {
        // Fire-and-forget enrichment
        supabase.functions.invoke('auto-enrich-project', {
          body: { projectId },
        }).catch(err => console.warn('[OrphanedRecordings] enrichment failed (non-critical):', err?.message));
      }

      toast({ title: 'Gravacao vinculada', description: 'Reuniao associada ao projeto com sucesso.' });
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
    } catch (err: any) {
      toast({ title: 'Erro ao vincular', description: err?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLinking(null);
    }
  };

  const handleDelete = async (recordingId: string) => {
    if (!window.confirm("Deseja listar essa gravação como lixo/ignorá-la? Ela será ocultada dessa lista permanentemente.")) return;
    
    setLinking(recordingId); // re-use linking state for loading spinner on the item
    try {
      // Ignora no banco em vez de deletar para evitar que o sync traga de volta
      const { error } = await supabase
        .from('meeting_recordings')
        .update({ transcript_status: 'ignored' } as any)
        .eq('id', recordingId);

      if (error) throw error;
      toast({ title: 'Gravação ignorada', description: 'Ela não aparecerá mais nesta lista.' });
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLinking(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('revhackers_orphaned_alert_dismissed', JSON.stringify({
      dismissed_at: new Date().toISOString(),
      count: recordings.length,
    }));
    setDismissed({ count: recordings.length });
  };

  if (loading || recordings.length === 0) return null;
  // If dismissed and count hasn't changed, stay hidden
  if (dismissed && typeof dismissed === 'object' && dismissed.count === recordings.length) return null;

  return (
    <>
      <div className="bg-white border border-zinc-200 flex items-start md:items-center justify-between p-4 flex-col md:flex-row gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div className="bg-zinc-900 text-white p-2 shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div className="pt-0.5">
            <h3 className="text-xs font-black uppercase text-zinc-900 tracking-widest mb-1 flex items-center gap-2">
              Gravações Órfãs Encontradas
              <span className="bg-zinc-100 text-zinc-500 text-3xs px-1.5 py-0.5">{recordings.length} detectadas</span>
            </h3>
            <p className="text-tiny font-medium text-zinc-500">Existem reuniões recentes gravadas que ainda não foram vinculadas a nenhum projeto ou lead.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <Button onClick={handleDismiss} variant="ghost" className="text-xs font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 px-3 h-8 rounded-sm uppercase tracking-widest">
            Ignorar
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-black hover:bg-zinc-800 text-white text-xs font-bold tracking-widest uppercase h-8 px-4 rounded-sm flex-1 md:flex-none">
            Revisar
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border border-zinc-200 shadow-2xl rounded-sm block">
          
          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
            <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
              <Link2 className="w-5 h-5 text-zinc-400" /> 
              Central de Associações
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 font-medium mt-1">
              Ligue essas gravações de reunião avulsas diretamente à timeline dos Cockpits para iniciar os Handovers ou resumir deals.
            </DialogDescription>
          </div>
          
          <div className="max-h-[65vh] overflow-y-auto w-full p-6 space-y-6 bg-[#FAFAFA]">
            {recordings.map((rec) => (
              <div key={rec.id} className="border border-zinc-200 bg-white shadow-sm hover:border-zinc-400 transition-all duration-300 flex flex-col group">
                
                {/* Info Top */}
                <div className="p-5 md:p-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <h4 className="text-base font-bold text-zinc-900 flex items-center gap-3">
                        <Video className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="truncate">{rec.title || 'Reunião sem título'}</span>
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {rec.happened_at && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            {format(new Date(rec.happened_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                          </span>
                        )}
                        {rec.transcript_status && (
                          <span className="text-2xs font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 px-2 py-1">
                            {rec.transcript_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {rec.ai_summary && (
                    <div className="mt-5 bg-zinc-50/80 border border-zinc-100 p-4 flex gap-3 items-start">
                      <BrainCircuit className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-zinc-500 leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all">
                        {rec.ai_summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="bg-zinc-50 border-t border-zinc-100 p-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:max-w-md">
                    <select
                      value={selectedProject[rec.id] || ''}
                      onChange={(e) => setSelectedProject(prev => ({ ...prev, [rec.id]: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 text-xs font-bold text-zinc-900 px-4 py-2.5 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer truncate shadow-sm"
                    >
                      <option value="">Buscar e vincular a um Projeto...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <Button
                      onClick={() => handleDelete(rec.id)}
                      title="Ignorar permanentemente"
                      variant="ghost"
                      disabled={linking === rec.id}
                      className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-red-600 hover:bg-red-50 px-4 h-10 transition-colors w-full sm:w-auto"
                    >
                      Ignorar
                    </Button>
                    <Button
                      onClick={() => handleLink(rec.id)}
                      disabled={!selectedProject[rec.id] || linking === rec.id}
                      className="bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest px-6 h-10 transition-all disabled:opacity-30 disabled:hover:bg-black w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {linking === rec.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                      Vincular Gravacao
                    </Button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
