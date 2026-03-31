import React from 'react';

interface SectionHeaderProps {
    eyebrow: string;
    titleLine1: string;
    titleLine2?: string;
    description?: string;
    light?: boolean;
}

export default function SectionHeader({
    eyebrow,
    titleLine1,
    titleLine2,
    description,
    light = false
}: SectionHeaderProps) {
    const isRevHackersLogo = titleLine2 === 'RevHackers™' || titleLine2 === 'RevHackers';

    return (
        <div className="shrink-0 flex flex-col items-center justify-center text-center">
            <span className={`text-xxs md:text-tiny uppercase tracking-[0.25em] font-black mb-3 ${light ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {eyebrow}
            </span>

            <h2 className={`text-3xl md:text-[2.75rem] font-black tracking-tight leading-[1.05] ${light ? 'text-white' : 'text-zinc-900'}`}>
                {titleLine1}
                {isRevHackersLogo ? (
                    <img src="https://assets.cdn.filesafe.space/oFTw9DcsKRUj6xCiq4mb/media/67f6fe8fd496febea9a9ad8e.png" alt="RevHackers" className="h-[60px] md:h-[72px] lg:h-[80px] shrink-0 object-contain inline-block ml-3" />
                ) : (
                    titleLine2 && <span className={light ? 'text-zinc-500' : 'text-zinc-300'}> {titleLine2}</span>
                )}
            </h2>

            {description && (
                <p className={`text-sm font-medium leading-relaxed max-w-2xl text-center mx-auto mt-3 ${light ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {description}
                </p>
            )}
        </div>
    );
}
