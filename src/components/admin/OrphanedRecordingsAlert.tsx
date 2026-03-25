import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, X, Link2, Loader2, Calendar, BrainCircuit, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

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
        .order('happened_at', { ascending: false });

      if (error) throw error;
      setRecordings((data as unknown as OrphanedRecording[]) || []);
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
        .select('id, client_name, client_company, trade_name, type')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const options: ProjectOption[] = (data || []).map((p: any) => ({
        id: p.id,
        label: `${p.trade_name || p.client_company || p.client_name} (${p.type || 'sem tipo'})`,
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

  if (loading || dismissed || recordings.length === 0) return null;

  return (
    <div className="border border-zinc-200 rounded-2xl shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-zinc-900" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-900">
              Gravacoes Orfas
            </h3>
            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
              {recordings.length} {recordings.length === 1 ? 'reuniao sem projeto' : 'reunioes sem projeto'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-900"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recordings List */}
      <div className="divide-y divide-zinc-100">
        {recordings.map((rec) => (
          <div key={rec.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">
                {rec.title || 'Reuniao sem titulo'}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                {rec.happened_at && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(rec.happened_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </span>
                )}
                {rec.transcript_status && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                    {rec.transcript_status}
                  </span>
                )}
              </div>
              {rec.ai_summary && (
                <p className="text-[13px] font-medium text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                  <BrainCircuit className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />
                  {rec.ai_summary.slice(0, 160)}{rec.ai_summary.length > 160 ? '...' : ''}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={selectedProject[rec.id] || ''}
                  onChange={(e) => setSelectedProject(prev => ({ ...prev, [rec.id]: e.target.value }))}
                  className="appearance-none bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-300 min-w-[200px] truncate"
                >
                  <option value="">Selecionar projeto...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <Button
                onClick={() => handleLink(rec.id)}
                disabled={!selectedProject[rec.id] || linking === rec.id}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 h-auto disabled:opacity-40"
              >
                {linking === rec.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 mr-1.5" /> Vincular
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
