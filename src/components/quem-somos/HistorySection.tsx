
import React from 'react';

const HistorySection = () => {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Compact Header - Definitive Surgical Scale */}
        <div className="max-w-6xl mx-auto mb-20 md:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline">
            <div className="space-y-6 lg:col-span-8">
              <div className="flex items-center gap-3">
                <span className="text-revgreen text-xs">•</span>
                <span className="font-mono text-xxs text-zinc-400 uppercase tracking-[0.4em] font-black">
                  REVHACKERS // INTELLIGENCE UNIT
                </span>
              </div>
              <h2 className="text-6xl md:text-[6rem] font-black tracking-tighter text-black leading-[0.85] mb-6">
                ARQUITETURA <br />
                DE RECEITA<span className="text-revgreen">.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 lg:pt-8 animate-fade-in [animation-delay:200ms]">
              <p className="text-xl md:text-2xl text-zinc-900 font-bold tracking-tighter leading-[1.1]">
                Substituímos o "achismo" por uma estrutura de vendas previsível e automatizada.
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Flow - Definitive Lab Style */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
            {/* Era 01 */}
            <div className="bg-white p-12 space-y-8 animate-fade-in [animation-delay:400ms] group hover:bg-zinc-50 transition-colors duration-500">
              <div className="flex justify-between items-start">
                <span className="text-2xs font-mono text-zinc-300 font-black uppercase tracking-widest">
                  [ RH_LOG.01 // ORIGEM ]
                </span>
                <div className="w-1 h-1 bg-zinc-200 group-hover:bg-black transition-colors" />
              </div>
              <p className="text-zinc-500 text-base leading-relaxed font-medium">
                Nascemos como <span className="text-black font-bold">GrowthAG</span>. Percebemos cedo que "vibe code" e vaidade não sustentam operações sérias. Onde o mercado via criatividade, instalamos processos.
              </p>
            </div>

            {/* Era 02 */}
            <div className="bg-white p-12 space-y-8 animate-fade-in [animation-delay:600ms] group hover:bg-zinc-50 transition-colors duration-500">
              <div className="flex justify-between items-start">
                <span className="text-2xs font-mono text-zinc-300 font-black uppercase tracking-widest">
                  [ RH_LOG.02 // LAB ]
                </span>
                <div className="w-1 h-1 bg-zinc-200 group-hover:bg-revgreen transition-colors" />
              </div>
              <p className="text-zinc-500 text-base leading-relaxed font-medium">
                Evoluímos para a <span className="text-black font-bold">RevHackers</span>. Deixamos de ser agência para ser laboratório. Hoje, instalamos a arquitetura de receita que suporta o próximo nível de escala B2B.
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Metadata Footer */}
        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-zinc-50 flex justify-between items-center opacity-30">
          <span className="text-3xs font-mono text-black font-black uppercase tracking-[0.5em]">
            SYST_SECURE // ARCH_STABLE
          </span>
          <div className="flex gap-8">
            <span className="text-3xs font-mono font-bold uppercase tracking-widest">LATENCY: NULL</span>
            <span className="text-3xs font-mono font-bold uppercase tracking-widest">SYNC: 2026.RH</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
