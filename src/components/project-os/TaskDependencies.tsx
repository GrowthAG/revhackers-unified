import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { GitBranch, X } from 'lucide-react';
import { OrqTask } from '@/store/useOrqflow';

interface Dependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  type: string;
}

interface TaskDependenciesProps {
  taskId: string;
  projectId: string;
  allTasks: Record<string, OrqTask>;
}

export const TaskDependencies: React.FC<TaskDependenciesProps> = ({ taskId, projectId, allTasks }) => {
  const [blockedByDeps, setBlockedByDeps] = useState<Dependency[]>([]);
  const [blockingDeps, setBlockingDeps] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDependencies();
  }, [taskId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDependencies = async () => {
    setLoading(true);
    try {
      // Tasks this task is blocked by (this task depends on them)
      const { data: blockedBy, error: err1 } = await supabase
        .from('orqflow_task_dependencies' as any)
        .select('*')
        .eq('task_id', taskId);

      if (err1) throw err1;

      // Tasks this task blocks (they depend on this task)
      const { data: blocking, error: err2 } = await supabase
        .from('orqflow_task_dependencies' as any)
        .select('*')
        .eq('depends_on_task_id', taskId);

      if (err2) throw err2;

      setBlockedByDeps((blockedBy as Dependency[]) || []);
      setBlockingDeps((blocking as Dependency[]) || []);
    } catch (e: any) {
      toast({ title: 'Erro ao carregar dependencias', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addDep = async (selectedId: string) => {
    // Prevent self-dependency
    if (selectedId === taskId) return;

    // Prevent duplicate
    const alreadyLinked = blockedByDeps.some(d => d.depends_on_task_id === selectedId);
    if (alreadyLinked) {
      toast({ title: 'Dependencia ja existe', description: 'Essa tarefa ja esta vinculada.', variant: 'default' });
      return;
    }

    // Prevent circular dependency: selectedId already depends on taskId (A->B->A)
    const wouldCycle = blockingDeps.some(d => d.task_id === selectedId);
    if (wouldCycle) {
      toast({ title: 'Dependencia circular', description: 'Essa tarefa ja depende desta - adicionar criaria um ciclo.', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orqflow_task_dependencies' as any)
        .insert({
          task_id: taskId,
          depends_on_task_id: selectedId,
          type: 'blocking',
        })
        .select()
        .single();

      if (error) throw error;

      setBlockedByDeps(prev => [...prev, data as Dependency]);
      setSearchText('');
      setShowSearch(false);
      toast({ title: 'Dependencia adicionada', description: 'Relacao entre tarefas criada.' });
    } catch (e: any) {
      toast({ title: 'Erro ao adicionar dependencia', description: e.message, variant: 'destructive' });
    }
  };

  const removeDep = async (depId: string) => {
    try {
      const { error } = await supabase
        .from('orqflow_task_dependencies' as any)
        .delete()
        .eq('id', depId);

      if (error) throw error;

      setBlockedByDeps(prev => prev.filter(d => d.id !== depId));
      setBlockingDeps(prev => prev.filter(d => d.id !== depId));
      toast({ title: 'Dependencia removida' });
    } catch (e: any) {
      toast({ title: 'Erro ao remover dependencia', description: e.message, variant: 'destructive' });
    }
  };

  // All tasks in the project excluding the current one and tasks already linked as blockedBy
  const linkedIds = new Set([
    taskId,
    ...blockedByDeps.map(d => d.depends_on_task_id),
    ...blockingDeps.map(d => d.task_id),
  ]);

  const filteredTasks = Object.values(allTasks).filter(t => {
    if (linkedIds.has(t.id)) return false;
    if (t.project_id !== projectId) return false;
    if (!searchText.trim()) return false;
    return t.title.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">Dependencias</h3>
      </div>

      {/* Blocked by section */}
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Bloqueado por</p>
        {blockedByDeps.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">Nenhuma dependencia</p>
        ) : (
          <div className="space-y-1">
            {blockedByDeps.map(dep => {
              const t = allTasks[dep.depends_on_task_id];
              if (!t) return null;
              return (
                <div
                  key={dep.id}
                  className="flex items-center justify-between px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        t.status === 'done' ? 'bg-[#00CC6A]' : 'bg-zinc-400'
                      }`}
                    />
                    <span className="text-sm text-zinc-700 font-medium truncate">{t.title}</span>
                  </div>
                  <button
                    onClick={() => removeDep(dep.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 rounded transition-all shrink-0 ml-2"
                    title="Remover dependencia"
                  >
                    <X className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blocks section */}
      {blockingDeps.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Bloqueia</p>
          <div className="space-y-1">
            {blockingDeps.map(dep => {
              const t = allTasks[dep.task_id];
              if (!t) return null;
              return (
                <div
                  key={dep.id}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.status === 'done' ? 'bg-[#00CC6A]' : 'bg-zinc-300'
                    }`}
                  />
                  <span className="text-sm text-zinc-600 truncate">{t.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add dependency search */}
      <div className="relative" ref={searchContainerRef}>
        <input
          type="text"
          placeholder="+ Adicionar dependencia..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onFocus={() => setShowSearch(true)}
          className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-zinc-400 placeholder:text-zinc-400 bg-white"
        />
        {showSearch && searchText && filteredTasks.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-sm z-40 overflow-hidden max-h-48 overflow-y-auto">
            {filteredTasks.map(t => (
              <button
                key={t.id}
                onClick={() => addDep(t.id)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-3 text-sm border-b border-zinc-50 last:border-0"
              >
                <span
                  className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    t.status === 'done'
                      ? 'bg-zinc-100 text-zinc-500'
                      : 'bg-zinc-900 text-white'
                  }`}
                >
                  {t.status}
                </span>
                <span className="text-zinc-800 truncate">{t.title}</span>
              </button>
            ))}
          </div>
        )}
        {showSearch && searchText && filteredTasks.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-sm z-40 px-4 py-3">
            <p className="text-sm text-zinc-400">Nenhuma tarefa encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};
