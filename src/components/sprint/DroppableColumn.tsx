import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ProjectTask, TaskStatus } from '@/types/sprint-system';
import { TaskCard } from './TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';

interface DroppableColumnProps {
    id: TaskStatus;
    label: string;
    tasks: ProjectTask[];
    isActiveDrag: boolean;
    color: string;
    bgColor: string;
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onTaskClick: (task: ProjectTask) => void;
    onAddClick: () => void;
}

export const DroppableColumn = ({
    id,
    label,
    tasks,
    isActiveDrag,
    color,
    bgColor,
    onStatusChange,
    onTaskClick,
    onAddClick
}: DroppableColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[340px] flex flex-col bg-white border-r border-zinc-200 last:border-r-0 max-h-full transition-all`}
        >
            {/* Column Header - ClickUp Style Compact */}
            <div className="px-5 py-3 flex justify-between items-center bg-white border-b border-zinc-100 mb-4 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-black uppercase tracking-[0.15em]">
                        {label}
                    </span>
                    <span className="text-zinc-400 text-[9px] font-black bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onAddClick}
                        className="p-1 text-zinc-300 hover:text-black hover:bg-zinc-50 rounded transition-all"
                    >
                        <Plus size={14} />
                    </button>
                    <button className="p-1 text-zinc-300 hover:text-black hover:bg-zinc-50 rounded transition-all">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 px-3 overflow-y-auto">
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2 min-h-[100px] pb-4">
                        {tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={onStatusChange}
                                onClick={() => onTaskClick(task)}
                            />
                        ))}

                        {/* Inline Add Button - Refined ClickUp Style */}
                        <button
                            onClick={onAddClick}
                            className="w-full py-2 px-3 flex items-center gap-2 text-[9px] font-black text-zinc-300 hover:text-black hover:bg-zinc-50 rounded transition-all border border-transparent group"
                        >
                            <Plus size={12} className="group-hover:scale-110 transition-transform" />
                            ADICIONAR TAREFA
                        </button>
                    </div>
                </SortableContext>
            </div>
        </div>
    );
};
