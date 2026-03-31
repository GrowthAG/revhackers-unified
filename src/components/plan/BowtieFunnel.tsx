import React from 'react';

interface BowtieFunnelProps {
    eyebrow?: string;
    title?: string;
    leftLabel?: string;
    leftTitle?: string;
    centerTitle?: string;
    rightLabel?: string;
    rightTitle?: string;
    bottomLeftTitle?: string;
    bottomLeftDesc?: string;
    bottomRightTitle?: string;
    bottomRightDesc?: string;
}

export default function BowtieFunnel({
    eyebrow = 'Engenharia de Receita',
    title = 'O Funil Gravata Borboleta',
    leftLabel = 'Aquisição',
    leftTitle = 'Marketing & Vendas',
    centerTitle = 'Fechamento',
    rightLabel = 'Expansão',
    rightTitle = 'Sucesso do Cliente',
    bottomLeftTitle = 'Foco no CAC',
    bottomLeftDesc = 'Trazer os clientes certos pelo menor custo possível. Geração e Qualificação de Demanda.',
    bottomRightTitle = 'Foco no LTV',
    bottomRightDesc = 'Garantir Sucesso, Retenção e Expansão. Crescimento via receita recorrente.',
}: BowtieFunnelProps) {
    return (
        <div className="w-full bg-white p-8 border border-zinc-200 overflow-hidden mt-8 mb-12">
            <div className="text-center mb-10">
                <p className="text-xxs font-black uppercase tracking-widest text-zinc-400 mb-2">{eyebrow}</p>
                <h3 className="text-2xl font-black text-black">{title}</h3>
            </div>

            <div className="relative max-w-5xl mx-auto flex items-stretch justify-center min-h-[250px] md:h-[300px]">
                {/* Lado Esquerdo */}
                <div className="flex-1 flex flex-col justify-between items-end relative" style={{ clipPath: 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)', backgroundColor: '#f4f4f5' }}>
                    <div className="absolute inset-0 flex flex-col justify-center items-center pr-12">
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{leftLabel}</span>
                        <span className="text-sm font-bold text-black">{leftTitle}</span>
                    </div>
                </div>

                {/* Centro: O Nó */}
                <div className="w-16 h-36 md:h-44 self-center bg-black z-10 flex items-center justify-center shadow-sm rounded-sm">
                    <span className="text-white text-xs uppercase font-black tracking-widest -rotate-90 whitespace-nowrap">{centerTitle}</span>
                </div>

                {/* Lado Direito */}
                <div className="flex-1 flex flex-col justify-between items-start relative" style={{ clipPath: 'polygon(0 25%, 100% 0, 100% 100%, 0 75%)', backgroundColor: '#00FF85' }}>
                    <div className="absolute inset-0 flex flex-col justify-center items-center pl-12">
                        <span className="text-xs font-black uppercase tracking-widest text-black/60 mb-1">{rightLabel}</span>
                        <span className="text-sm font-bold text-black text-center">{rightTitle}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 text-center">
                <div>
                    <h4 className="font-bold text-black text-sm mb-2">{bottomLeftTitle}</h4>
                    <p className="text-xs text-zinc-500">{bottomLeftDesc}</p>
                </div>
                <div>
                    <h4 className="font-bold text-black text-sm mb-2">{bottomRightTitle}</h4>
                    <p className="text-xs text-zinc-500">{bottomRightDesc}</p>
                </div>
            </div>
        </div>
    );
}
