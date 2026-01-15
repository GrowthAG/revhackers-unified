import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProjectTask } from '@/types/sprint-system';
import {
    CheckCircle2,
    MessageSquare,
    MoreVertical,
    User,
    Calendar
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskCardProps {
    task: ProjectTask;
    onStatusChange: (taskId: string, newStatus: any) => void;
    onClick?: () => void;
}

const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return { text: 'Hoje', className: 'text-black bg-zinc-100 border-zinc-200' };
    if (isTomorrow(date)) return { text: 'Amanhã', className: 'text-zinc-500 bg-zinc-50 border-zinc-100' };
    if (isPast(date)) return { text: format(date, 'dd/MM'), className: 'text-black bg-zinc-200 border-zinc-300' };
    return { text: format(date, 'dd/MM'), className: 'text-zinc-500 bg-zinc-50 border-zinc-100' };
};

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    const dueInfo = task.due_date ? formatDueDate(task.due_date) : null;
    const checklistCount = task.checklist?.length || 0;
    const completedCount = task.checklist?.filter(c => c.completed).length || 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                bg-white border border-zinc-200 
                hover:border-zinc-400 group relative overflow-hidden 
                flex flex-col min-h-[80px] rounded last:mb-0
                ${isDragging ? 'shadow-2xl ring-1 ring-zinc-400 z-[100]' : 'shadow-sm'}
            `}
            onClick={(e) => {
                if (!isDragging && onClick) onClick();
            }}
        >
            {/* ClickUp Depth Indicator Bar */}
            <div className={`absolute left-0 top-0 w-1 h-full bg-zinc-100 group-hover:bg-black transition-all duration-300`} />

            <div className="p-3 pl-4 flex flex-col h-full justify-between gap-3">
                {/* Body - Clean Diagramming */}
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[12px] font-bold text-zinc-900 leading-snug line-clamp-2 uppercase tracking-tight">
                            {task.title}
                        </h4>
                        <button className="shrink-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100 rounded">
                            <MoreVertical size={12} className="text-zinc-400" />
                        </button>
                    </div>

                    {/* Metadata Sub-row (Tags or Due Date) */}
                    <div className="flex items-center gap-2 flex-wrap min-h-[14px]">
                        {dueInfo && (
                            <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${dueInfo.className}`}>
                                <Calendar size={10} />
                                {dueInfo.text}
                            </div>
                        )}
                        {task.tags?.map(tag => (
                            <span key={tag} className="text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 bg-zinc-50 text-zinc-400 border border-zinc-100 rounded-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Meta - ClickUp Alignment */}
                <div className="flex items-center justify-between pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                        {/* Assignee Circle */}
                        <div className="flex shrink-0">
                            {task.assignee ? (
                                <div className="h-5 w-5 rounded-full border border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                                    {task.assignee.avatar_url ? (
                                        <img src={task.assignee.avatar_url} className="w-full h-full object-cover grayscale" alt="" />
                                    ) : (
                                        <span className="text-[8px] font-black text-black">{task.assignee.full_name?.charAt(0)}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="h-5 w-5 rounded-full border border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center">
                                    <User size={10} className="text-zinc-300" />
                                </div>
                            )}
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex items-center gap-2.5">
                            {checklistCount > 0 && (
                                <div className={`flex items-center gap-1 text-[9px] font-black tracking-tighter ${completedCount === checklistCount ? 'text-black' : 'text-zinc-400'}`}>
                                    <CheckCircle2 size={11} />
                                    {completedCount}/{checklistCount}
                                </div>
                            )}

                            {/* @ts-ignore */}
                            {task.comments_count > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-black text-zinc-400">
                                    <MessageSquare size={11} />
                                    {/* @ts-ignore */}
                                    {task.comments_count}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Position ID */}
                    <span className="text-[8px] text-zinc-300 font-black uppercase tracking-widest">#{task.position % 1000}</span>
                </div>
            </div>
        </div>
    );
};
