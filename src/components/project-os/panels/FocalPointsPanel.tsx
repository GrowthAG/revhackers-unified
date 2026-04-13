import React from 'react';
import { Users, Cpu } from 'lucide-react';
import type { ReiProject } from '@/api/reiProjects';

export interface FocalPointsPanelProps {
    project: ReiProject;
}

export function FocalPointsPanel({ project }: FocalPointsPanelProps) {
    if (!project.focal_points || project.focal_points.length === 0) return null;

    return (
        <div className="border border-zinc-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
                <Users className="w-4 h-4 text-zinc-500" />
                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                    Pontos Focais (Contatos)
                </span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.focal_points.map((fp, i) => (
                    <div key={i} className="flex flex-col space-y-1 p-3 border border-zinc-100 bg-zinc-50 relative group">
                        {fp.is_main && (
                            <span className="absolute top-3 right-3 flex items-center justify-center w-4 h-4 bg-zinc-100" title="Contato Principal">
                                <Cpu className="w-2.5 h-2.5 text-zinc-500" />
                            </span>
                        )}
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-900 pr-5">{fp.name}</span>
                        <span className="text-xxs font-bold text-zinc-500 uppercase tracking-widest">{fp.role || 'Sem Cargo'}</span>
                        <a href={`mailto:${fp.email}`} className="text-tiny font-medium text-zinc-600 hover:text-zinc-900 hover:underline pt-1">
                            {fp.email}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
