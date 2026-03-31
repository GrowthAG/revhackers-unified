import React, { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckSquare, Clock, User, MessageSquare } from 'lucide-react';
import { useOrqflowStore, OrqTask } from '@/store/useOrqflow';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<OrqTask>();

export const ListView = ({ projectId, sprintId, onTaskClick }: { projectId: string, sprintId: string | null, onTaskClick: (id: string) => void }) => {
  const { tasks, isLoading } = useOrqflowStore();
  const tasksArray = Object.values(tasks) as OrqTask[];
  const [isCreatingTask, setIsCreatingTask] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  
  const filteredTasks = useMemo(() => {
    if (sprintId === 'all') return tasksArray;
    return tasksArray.filter(t => t.sprint_id === sprintId);
  }, [tasksArray, sprintId]);

  const statusMap: Record<string, string> = {
    'backlog': 'Backlog',
    'todo': 'A Fazer',
    'doing': 'Em Progresso',
    'review': 'Revisão',
    'done': 'Concluído',
    'archived': 'Arquivado'
  };

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Tarefa',
      cell: info => (
        <div className="flex items-center gap-3 font-medium text-zinc-200">
          <span className="text-zinc-600 group-hover:text-revhackers/70 transition-colors">
            <CheckSquare className="w-4 h-4" />
          </span>
          {info.getValue()}
        </div>
      ),
      size: 400,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700/50">
          {statusMap[info.getValue()] || info.getValue()}
        </span>
      ),
      size: 150,
    }),
    columnHelper.accessor('priority', {
      header: 'Prioridade',
      cell: info => {
        const val = info.getValue() || 'medium';
        const colorClass = 
          val === 'urgent' ? 'bg-red-900/40 text-red-400 border-red-500/20' :
          val === 'high' ? 'bg-zinc-700 text-zinc-300 border-zinc-500/20' :
          val === 'medium' ? 'bg-zinc-800 text-zinc-300 border-zinc-600/20' :
          'bg-zinc-800 text-zinc-400 border-zinc-700/50';
          
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase border ${colorClass}`}>
            {val}
          </span>
        );
      },
      size: 120,
    }),
    columnHelper.accessor('due_date', {
      header: 'Prazo',
      cell: info => (
        <div className="flex items-center gap-1.5 hover:text-zinc-200 text-sm text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          {info.getValue() ? format(new Date(info.getValue() as string), "dd MMM", { locale: ptBR }) : '--/--'}
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor('assignee_id', {
      header: 'Resp.',
      cell: info => (
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
          {info.getValue() ? (
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-xxs text-zinc-700 dark:text-zinc-300 flex items-center justify-center">RH</div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-zinc-400 dark:border-zinc-600 flex items-center justify-center text-zinc-500 dark:text-zinc-600">
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      ),
      size: 80,
    }),
    columnHelper.accessor('estimated_hours', {
      header: 'Esforço',
      cell: info => (
        <div className="text-xs text-zinc-500 font-semibold">
           {info.getValue() ? `${info.getValue()}h` : '-'}
        </div>
      ),
      size: 100,
    }),
  ], []);

  const table = useReactTable({
    data: filteredTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  if (isLoading) return <div className="p-8 text-zinc-500">Virtualizando tabela...</div>;

  return (
    <div className="h-full w-full bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col overflow-hidden">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-full shadow-sm">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm text-zinc-900 dark:text-zinc-300">
            <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-950/50 text-xs uppercase font-bold text-zinc-600 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 relative group select-none"
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 bg-zinc-200 dark:bg-zinc-700/0 hover:bg-revhackers cursor-col-resize touch-none ${header.column.getIsResizing() ? 'bg-revhackers' : ''}`}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  onClick={() => onTaskClick(row.original.id)} 
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-3" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              
              {filteredTasks.length === 0 && !isCreatingTask && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-600">
                    Nenhuma tarefa encontrada na sprint selecionada.
                  </td>
                </tr>
              )}
              
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group border-t border-zinc-200 dark:border-zinc-800/50">
                <td colSpan={columns.length} className="px-6 py-2">
                  {isCreatingTask ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newTaskTitle.trim()) {
                          useOrqflowStore.getState().createTask(projectId, sprintId === 'all' ? null : sprintId, newTaskTitle, 'todo');
                          setNewTaskTitle('');
                          setIsCreatingTask(false);
                        } else {
                          setIsCreatingTask(false);
                        }
                      }}
                      className="flex items-center gap-3 w-full"
                    >
                      <input 
                        type="text"
                        autoFocus
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onBlur={() => {
                          if (!newTaskTitle.trim()) setIsCreatingTask(false);
                        }}
                        placeholder="Nome da Nova Tarefa e pressione Enter..."
                        className="w-full bg-transparent text-sm font-medium outline-none text-zinc-900 dark:text-zinc-200 placeholder-zinc-400"
                      />
                    </form>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreatingTask(true);
                        setNewTaskTitle('');
                      }}
                      className="flex items-center gap-2 w-full text-left font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 py-1"
                    >
                      <span className="text-xl leading-none font-bold relative -top-[1px]">+</span> 
                      <span>Nova Tarefa</span>
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
