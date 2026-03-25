import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Clock, MoreVertical, CheckCircle2 } from 'lucide-react';
import { useOrqflowStore, TaskStatus } from '@/store/useOrqflow';
import { format } from 'date-fns';

export const KanbanView = ({ projectId, sprintId, onTaskClick }: { projectId: string, sprintId: string | null, onTaskClick: (id: string) => void }) => {
  const { tasks, kanbanColumns, fetchTasks, moveTask, createTask, isLoading } = useOrqflowStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreatingInColumn, setIsCreatingInColumn] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-500/10';
      case 'high': return 'text-zinc-700 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-700/10';
      case 'medium': return 'text-amber-700 bg-amber-100 dark:text-yellow-500 dark:bg-yellow-500/10';
      default: return 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800';
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Call Zustand Optimistic Update mapped directly to the DB
    moveTask(draggableId, destination.droppableId as TaskStatus, destination.index);
  };

  const handleCreateTask = async (columnId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsCreatingInColumn(null);
      return;
    }

    // Sanitize constraint: If user is in global view ('all'), sprint_id must be null (backlog product line)
    const dbSprintId = sprintId === 'all' ? null : sprintId;

    await createTask(projectId, dbSprintId, newTaskTitle, columnId as TaskStatus);
    setNewTaskTitle('');
    setIsCreatingInColumn(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-revhackers"></div>
      </div>
    );
  }

  const columnOrder = ['backlog', 'todo', 'doing', 'review', 'done', 'archived'];
  const columnTitles: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    todo: 'A Fazer',
    doing: 'Em Progresso',
    review: 'Revisão',
    done: 'Concluído',
    archived: 'Arquivado',
  };
  const columnColors: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-100/50 dark:bg-zinc-800',
    todo: 'bg-zinc-200/50 dark:bg-zinc-700',
    doing: 'bg-zinc-100/50 border-zinc-300 dark:bg-zinc-800/40 dark:border-zinc-600/50',
    review: 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-500/50',
    done: 'bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-500/50',
    archived: 'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-950',
  };

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-row gap-6 h-full items-start pb-4">
          
          {columnOrder.map((columnId) => {
            const column = {
              id: columnId as TaskStatus,
              title: columnTitles[columnId as TaskStatus],
              color: columnColors[columnId as TaskStatus],
            };
            const taskIdsInColumn = kanbanColumns[column.id] || [];
            
            return (
              <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col h-full max-h-[calc(100vh-220px)] bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800/60 overflow-hidden hide-scrollbar">
                
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">{column.title}</h3>
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{taskIdsInColumn.length}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingInColumn(column.id);
                      setNewTaskTitle('');
                    }}
                    className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  >
                     <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto hide-scrollbar min-h-24 pb-8 space-y-3 p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-100 dark:bg-zinc-800/30' : ''}`}
                    >
                      {isCreatingInColumn === column.id && (
                        <form onSubmit={(e) => handleCreateTask(column.id, e)} className="p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Título da nova tarefa..."
                            className="w-full p-2 text-sm bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-revhackers text-zinc-900 dark:text-white placeholder-zinc-400"
                            autoFocus
                          />
                          <div className="flex justify-end mt-2">
                            <button type="submit" className="px-3 py-1 text-sm font-medium text-white bg-zinc-900 dark:bg-revhackers rounded-md hover:bg-black dark:hover:bg-revhackers/90">
                              Adicionar
                            </button>
                          </div>
                        </form>
                      )}
                      {taskIdsInColumn.map((taskId, index) => {
                        const task = tasks[taskId];
                        if (!task) return null;

                        return (
                          <Draggable key={taskId} draggableId={taskId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onTaskClick(task.id)}
                                className={`group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging ? 'shadow-sm ring-2 ring-zinc-900/10 dark:ring-revhackers/50 rotate-2 z-50' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${getPriorityColor(task.priority)}`}>
                                    {task.priority || 'NORMAL'}
                                  </span>
                                  <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-4 leading-relaxed line-clamp-2">
                                  {task.title}
                                </h4>
                                
                                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-2">
                                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
                                    {column.id === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Clock className="w-3.5 h-3.5" />}
                                    <span>{task.due_date ? format(new Date(task.due_date), 'dd MMM') : 'Sem prazo'}</span>
                                  </div>
                                  
                                  {/* Avatar placeholder */}
                                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                    RH
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

              </div>
            );
          })}

        </div>
      </DragDropContext>
    </div>
  );
};
