import React, { useMemo, useState } from 'react';
import { useOrqflowStore, OrqTask } from '@/store/useOrqflow';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TaskModal } from '../TaskModal';

export const GanttView = ({ projectId, sprintId }: { projectId: string, sprintId: string | null }) => {
  const { tasks, isLoading } = useOrqflowStore();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const tasksArray = Object.values(tasks) as OrqTask[];

  // Filter sprint logic mirroring Kanban
  const filteredTasks = useMemo(() => {
    if (sprintId === 'all') return tasksArray;
    return tasksArray.filter(t => t.sprint_id === sprintId);
  }, [tasksArray, sprintId]);

  // Sort by due_date
  const timelineTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  }, [filteredTasks]);

  // Dynamic window based on tasks - includes both start_date and due_date
  const daysArray = useMemo(() => {
    let rawStart = new Date();
    let rawEnd = addDays(new Date(), 30);

    const tasksWithDates = filteredTasks.filter(t => t.due_date || t.start_date);

    if (tasksWithDates.length > 0) {
      const allDates = tasksWithDates.flatMap(t => {
        const dates: number[] = [];
        if (t.due_date) dates.push(new Date(t.due_date).getTime());
        if (t.start_date) dates.push(new Date(t.start_date).getTime());
        return dates;
      });

      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...allDates));

      // Pad by 7 days before the earliest (also ensure today is always visible)
      // and 14 days after the latest
      rawStart = subDays(new Date(Math.min(minDate.getTime(), new Date().getTime())), 7);
      rawEnd = addDays(maxDate, 14);
    } else {
      // Default fallback if no tasks have dates
      rawStart = subDays(new Date(), 7);
      rawEnd = addDays(new Date(), 23);
    }

    const days: Date[] = [];
    let current = rawStart;
    while (current <= rawEnd) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  }, [filteredTasks]);

  const today = new Date();

  // Index of today in daysArray - used for the vertical today line
  const todayIndex = daysArray.findIndex(d => isSameDay(d, today));

  if (isLoading) return <div className="p-8 text-zinc-500">Renderizando Timeline...</div>;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900/50">
         <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-revhackers" /> Timeline do Projeto
         </h3>
         <div className="text-[10px] font-bold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 tracking-widest uppercase">
           Timeline Dinamica ({daysArray.length} Dias)
         </div>
      </div>

      <div className="flex-1 overflow-auto relative custom-scrollbar">
         <div className="min-w-max pb-12 relative">

           {/* Today vertical line - spans all task rows */}
           {todayIndex >= 0 && (
             <div
               className="absolute top-0 bottom-0 w-px bg-revhackers/40 z-20 pointer-events-none"
               style={{ left: `${256 + todayIndex * 48}px` }}
             />
           )}

           {/* Header dos Dias */}
           <div className="flex sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 pl-64 shadow-sm">
             {daysArray.map((day, idx) => (
                <div key={idx} className={`w-12 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800/50 py-3 flex flex-col items-center justify-center ${isSameDay(day, today) ? 'bg-revhackers/5 dark:bg-revhackers/10' : ''}`}>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                   <span className={`text-sm font-bold ${isSameDay(day, today) ? 'text-revhackers' : 'text-zinc-800 dark:text-zinc-300'}`}>{format(day, 'dd')}</span>
                </div>
             ))}
           </div>

           {/* Corpo do Gantt - Tarefas */}
           <div>
             {timelineTasks.map((task) => {
                const dueDate = task.due_date ? new Date(task.due_date) : today;
                const isOverdue = dueDate < today && task.status !== 'done' && task.status !== 'archived';

                return (
                  <div key={task.id} className="flex hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                    {/* Nome da Tarefa Travado a esquerda */}
                    <div
                      onClick={() => setActiveTaskId(task.id)}
                      className="w-64 flex-shrink-0 sticky left-0 z-20 bg-white dark:bg-zinc-950 border-r border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between cursor-pointer group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors"
                    >
                      <div className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {task.status === 'done' ? <span className="line-through text-zinc-400 dark:text-zinc-500">{task.title}</span> : task.title}
                      </div>
                      {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 ml-2" title="Previsao Atrasada" />}
                    </div>

                    {/* Timeline Grid with bar overlay */}
                    <div className="flex relative">
                      {/* Background grid cells - keep borders and today highlight */}
                      {daysArray.map((day, idx) => (
                        <div
                          key={idx}
                          className={`w-12 h-12 flex-shrink-0 border-r border-b border-zinc-100 dark:border-zinc-800/30 ${isSameDay(day, today) ? 'bg-revhackers/5' : ''}`}
                        />
                      ))}

                      {/* BAR OVERLAY: only shown when task has BOTH start_date and due_date */}
                      {(() => {
                        if (!task.start_date || !task.due_date) return null;
                        const startDate = parseISO(task.start_date);
                        const endDate = parseISO(task.due_date);
                        const startIdx = daysArray.findIndex(d => isSameDay(d, startDate) || d >= startDate);
                        const endIdx = daysArray.findIndex(d => isSameDay(d, endDate));
                        if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;
                        const barWidth = (endIdx - startIdx + 1) * 48; // 48px per day (w-12)
                        const barLeft = startIdx * 48;
                        const isDone = task.status === 'done' || task.status === 'archived';
                        const isOver = endDate < today && !isDone;
                        return (
                          <div
                            key="bar"
                            className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md pointer-events-none z-10 ${
                              isDone
                                ? 'bg-zinc-200 dark:bg-zinc-700'
                                : isOver
                                ? 'bg-red-400/70'
                                : 'bg-revhackers/80'
                            }`}
                            style={{ left: `${barLeft}px`, width: `${Math.max(barWidth, 24)}px` }}
                          >
                            {/* Due date dot at the end */}
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80" />
                          </div>
                        );
                      })()}

                      {/* DOT FALLBACK: only shown when task has due_date but NO start_date */}
                      {!task.start_date && task.due_date && (() => {
                        return daysArray.map((day, idx) => {
                          const isDueDay = isSameDay(day, new Date(task.due_date as string));
                          if (!isDueDay) return null;
                          return (
                            <div
                              key={`dot-${idx}`}
                              style={{ position: 'absolute', left: `${idx * 48}px`, top: 0, width: '48px', height: '48px' }}
                              className="flex items-center justify-center z-10"
                            >
                              <div
                                onClick={() => setActiveTaskId(task.id)}
                                className={`w-10 h-6 rounded shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${task.status === 'done' ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700' : 'bg-revhackers border border-indigo-600 shadow-revhackers/20'}`}
                                title={`Entrega: ${task.title}`}
                              >
                                {task.status === 'done'
                                  ? <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                  : <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />
                                }
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                );
             })}
           </div>

           {timelineTasks.length === 0 && (
             <div className="text-center py-24 text-zinc-500 dark:text-zinc-600 font-medium">
               A Timeline esta vazia. Adicione tarefas com prazos para materializar o grafico.
             </div>
           )}

         </div>
      </div>

      {activeTaskId && <TaskModal taskId={activeTaskId} onClose={() => setActiveTaskId(null)} />}
    </div>
  );
};
