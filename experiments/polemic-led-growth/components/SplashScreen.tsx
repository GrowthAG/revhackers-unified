
import React from 'react';

interface SplashScreenProps {
  onEnter: () => void;
  isVisible: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, isVisible }) => {
  return (
    <div
      className={`fixed inset-0 bg-deep-black text-pure-white flex flex-col items-center justify-center z-[9999] transition-opacity duration-500 ease-in-out font-mono ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[640px] p-6 relative z-10 text-center">

        {/* Header - Logo Branco */}
        <div className="flex justify-center border-b border-white/20 pb-8 mb-12">
            <img
                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/68ea81e059ec0a12e82c943c.png"
                alt="Logo Branco"
                className="h-24 w-auto"
            />
        </div>

        {/* Title */}
        <div className="mb-16">
            <h1 className="text-[clamp(40px,8vw,80px)] font-bold tracking-[-0.05em] leading-[0.9] text-white mb-2 font-space">
            POLEMIC<br />
            <span className="text-neon-green">LED GROWTH</span>
            </h1>
            <p className="text-[10px] tracking-[0.4em] text-white/50 uppercase mt-4">
            Documento de Estratégia B2B
            </p>
        </div>

        {/* Technical Warning */}
        <div className="relative border-l-2 border-neon-green bg-white/5 p-6 mb-12 max-w-[480px] mx-auto backdrop-blur-sm text-left">
          <div className="absolute top-0 right-0 p-2 opacity-50">
             <div className="w-2 h-2 bg-neon-green animate-pulse"></div>
          </div>
          <p className="text-[11px] leading-[1.8] text-white/80 font-mono">
            <strong className="text-neon-green block mb-2 tracking-widest">[ PROTOCOLO DE LEITURA ]</strong>
            Este material questiona dogmas de branding pessoal. Se você busca conforto ou fórmulas mágicas de engajamento, feche a página. Aqui discutimos dinheiro, influência e estratégia.
          </p>
        </div>

        {/* Action Area */}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={onEnter}
            className="group relative w-full max-w-[280px] h-[50px] bg-neon-green text-deep-black text-[11px] font-bold tracking-[2px] uppercase hover:bg-white transition-all duration-300 flex items-center justify-center overflow-hidden"
          >
            <span className="relative z-10 group-hover:tracking-[4px] transition-all duration-300">Acessar Sistema</span>
          </button>
        </div>
      </div>
    </div>
  );
};
