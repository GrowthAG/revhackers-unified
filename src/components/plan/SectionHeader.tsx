import React from 'react';

interface SectionHeaderProps {
    eyebrow: string;
    titleLine1: string;
    titleLine2?: string;
    description?: string;
    light?: boolean; // For Cover or NextSteps if we want to use it
}

export default function SectionHeader({
    eyebrow,
    titleLine1,
    titleLine2,
    description,
    light = false
}: SectionHeaderProps) {
    return (
        <div className="shrink-0 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-px ${light ? 'bg-zinc-400' : 'bg-zinc-900'}`} />
                <span className={`text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-black ${light ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {eyebrow}
                </span>
                <div className={`w-6 h-px ${light ? 'bg-zinc-400' : 'bg-zinc-900'}`} />
            </div>

            <h2 className={`text-3xl md:text-[2.75rem] font-black tracking-tight leading-[1.05] mb-2 flex items-center justify-center gap-3 ${light ? 'text-white' : 'text-black'}`}>
                {titleLine1}
                {titleLine2 && (titleLine2 === 'RevHackers™' || titleLine2 === 'RevHackers') ? (
                    <img src="https://assets.cdn.filesafe.space/oFTw9DcsKRUj6xCiq4mb/media/67f6fe8fd496febea9a9ad8e.png" alt="RevHackers" className="h-7 md:h-9 object-contain" />
                ) : (
                    titleLine2 && <span className={light ? 'text-zinc-400' : 'text-zinc-400'}>{titleLine2}</span>
                )}
            </h2>

            {description && (
                <p className={`text-[12px] md:text-sm font-medium leading-relaxed max-w-2xl text-center mx-auto ${light ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {description}
                </p>
            )}
        </div>
    );
}
