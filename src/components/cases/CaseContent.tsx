import { CaseStudy } from '@/data/cases/index';
import CaseMetrics from './CaseMetrics';
import CaseTechStack from './CaseTechStack';
import CaseTestimonial from './CaseTestimonial';
import ContactForm from '@/components/shared/ContactForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CaseContentProps {
  caseData: CaseStudy;
}

const CaseContent = ({ caseData }: CaseContentProps) => {

  // Technical Decomposition Engine - Parses text blocks into technical specs
  const renderTechnicalNarrative = (text: string, isDark: boolean = false) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, i) => {
      // Split by (1), (2), etc.
      const parts = para.split(/\((\d+)\)/);

      if (parts.length > 1) {
        const elements = [];
        // Intro sentence
        if (parts[0].trim()) {
          elements.push(
            <p key="intro" className={`mb-12 text-lg md:text-xl leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
              {parts[0].trim()}
            </p>
          );
        }

        // Technical Items
        const items = [];
        for (let j = 1; j < parts.length; j += 2) {
          const number = parts[j];
          const content = parts[j + 1];
          if (content) {
            items.push(
              <div key={j} className="flex gap-6 mb-8 last:mb-0 group/item">
                <div className="shrink-0 pt-1.5">
                  <span className={`font-mono text-[10px] tabular-nums px-2 py-1 border ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-100 text-zinc-400'} rounded-sm`}>
                    {number.padStart(2, '0')}
                  </span>
                </div>
                <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>
                  {content.trim().replace(/^[:.\-\s]+/, '')}
                </p>
              </div>
            );
          }
        }
        elements.push(<div key="items" className="space-y-4">{items}</div>);
        return <div key={i} className="mb-12 last:mb-0">{elements}</div>;
      }

      return (
        <p key={i} className={`mb-12 last:mb-0 text-lg md:text-xl leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
          {para}
        </p>
      );
    });
  };

  return (
    <section className="bg-[#fcfcfc] overflow-hidden selection:bg-black selection:text-white relative bg-grain">
      {/* Structural Blueprint Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
      </div>

      <div className="container-custom py-32 md:py-48 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* PHASE_01: DIAGNOSIS & SPECIFICATION */}
          <div className="mb-48 relative">
            {/* Masterpiece Header - Industrial Ledger Style */}
            <div className="absolute -top-16 left-0 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <div className="bg-black text-[8px] font-mono text-white px-3 py-1 font-bold">PROJECT_PHASE_01</div>
                <div className="h-[1px] w-48 bg-zinc-900/10"></div>
                <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest">AIRCRAFT_GRADE_PRECISION</span>
              </div>
              <h4 className="font-mono text-[30px] md:text-[40px] text-zinc-100 font-bold -mt-4 opacity-50 pointer-events-none select-none">SYSTEM_DIAGNOSIS</h4>
            </div>

            {/* Split Technical Grid - Masterpiece Edition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-[1.5px] border-zinc-900 overflow-hidden bg-white shadow-[30px_30px_0px_rgba(0,0,0,0.02)]">

              {/* CHALLENGE SIDE */}
              <div className="lg:col-span-5 p-12 md:p-16 lg:p-24 border-b lg:border-b-0 lg:border-r border-zinc-900 relative">
                {/* Marginalia - Technical Annotations */}
                <div className="absolute top-10 left-10 flex flex-col gap-1 opacity-20 group">
                  <div className="w-4 h-[1px] bg-black"></div>
                  <div className="w-8 h-[1px] bg-black"></div>
                  <span className="font-mono text-[7px] rotate-90 origin-left mt-10 translate-x-2 text-black font-bold tracking-widest uppercase">AUDIT_LOG // 01A</span>
                </div>

                <div className="sticky top-32">
                  <div className="inline-block border border-zinc-200 px-3 py-1 mb-12">
                    <h3 className="font-mono text-[8px] text-zinc-500 uppercase tracking-[0.4em]">Problem_Layer // {caseData.category}</h3>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-16 uppercase italic leading-[0.85] underline decoration-zinc-100 underline-offset-[12px]">O Desafio</h2>
                  <div className="antialiased text-lg leading-relaxed text-zinc-800">
                    {renderTechnicalNarrative(caseData.challenge)}
                  </div>

                  {/* Digital Stamp */}
                  <div className="mt-20 flex items-center gap-4 opacity-30">
                    <div className="w-12 h-12 border-2 border-zinc-300 rounded-full flex items-center justify-center font-mono text-[8px] font-bold">APPROVED</div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[7px] uppercase font-bold">Technical Audit</span>
                      <span className="font-mono text-[7px] uppercase">RH_QUAL_V2.05</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STRATEGY SIDE */}
              <div className="lg:col-span-7 bg-black text-white p-12 md:p-16 lg:p-24 relative overflow-hidden">
                {/* Blueprint Texture on Black */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>

                <div className="absolute top-10 right-10 font-mono text-[8px] text-zinc-700 pointer-events-none uppercase tracking-[0.5em] font-bold">EXECUTION_PROTOCOL // MASTERPIECE</div>

                <div className="inline-block border border-zinc-800 px-3 py-1 mb-12 relative z-10">
                  <h3 className="font-mono text-[8px] text-zinc-500 uppercase tracking-[0.4em]">Strategic_Blueprint // RH_CORE</h3>
                </div>

                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-16 uppercase italic leading-[0.85] underline decoration-zinc-900 underline-offset-[12px] relative z-10">A Estratégia</h2>

                <div className="antialiased relative z-10 text-lg md:text-xl leading-relaxed text-zinc-300">
                  {renderTechnicalNarrative(caseData.solution, true)}
                </div>

                {/* Precision Crosshairs in Black area */}
                <div className="absolute top-32 right-10 w-20 h-20 opacity-10 pointer-events-none">
                  <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-white"></div>
                  <div className="absolute left-1/2 top-0 w-[0.5px] h-full bg-white"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white rounded-full"></div>
                </div>

                <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2 border-zinc-900"></div>
                <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2 border-zinc-900"></div>
              </div>

            </div>
          </div>

          {/* PHASE_02: QUANTITATIVE IMPACT */}
          <div className="mb-64 relative">
            <div className="flex flex-col gap-4 mb-24 px-1">
              <div className="flex items-center gap-6">
                <div className="bg-zinc-900 px-6 py-2">
                  <span className="font-mono text-[11px] text-white tracking-[0.4em] font-bold italic">PHASE_02 // PERFORMANCE_LEDGER</span>
                </div>
                <div className="h-[2px] flex-1 bg-zinc-900/10"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-[0.5em]">Validated_Growth_Metrics // 1024_SAMPLING</span>
                <span className="font-mono text-[9px] text-zinc-300">TRUST_LEVEL_V1.0</span>
              </div>
            </div>

            <div className="bg-white border-[1.5px] border-zinc-900 p-4 relative shadow-[30px_30px_0px_rgba(0,0,0,0.01)]">
              {/* Technical Corners */}
              <div className="absolute -top-[1.5px] -left-[1.5px] w-6 h-6 border-t-4 border-l-4 border-black"></div>
              <div className="absolute -bottom-[1.5px] -right-[1.5px] w-6 h-6 border-b-4 border-r-4 border-black"></div>
              <CaseMetrics caseData={caseData} />
            </div>
          </div>

          {/* CONTEXTUAL_LAYERS: Masterpiece Spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 md:gap-48 mb-40 items-start">

            {/* The Quote Column - Manuscript Style */}
            {caseData.quote && (
              <div className="relative pt-20 border-t-[1.5px] border-zinc-900">
                <div className="absolute -top-4 left-0 bg-black px-4 py-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-white italic">Client_Testimony</span>
                </div>
                <div className="antialiased">
                  <CaseTestimonial caseData={caseData} />
                </div>
                {/* Signature Marker */}
                <div className="mt-16 flex items-center justify-end">
                  <div className="h-[1px] w-24 bg-zinc-200"></div>
                  <span className="font-mono text-[8px] text-zinc-300 ml-4 italic uppercase">Verified_Record</span>
                </div>
              </div>
            )}

            {/* The Technical Stack & System Engagement */}
            <div className="space-y-32">
              {caseData.techStack && caseData.techStack.length > 0 && (
                <div className="bg-white border-[1.5px] border-zinc-900 p-16 relative overflow-hidden group shadow-[20px_20px_0px_rgba(0,0,0,0.01)]">
                  <div className="absolute top-4 left-4 font-mono text-[7px] text-zinc-300 uppercase tracking-widest">Stack_Validation</div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 translate-x-16 -translate-y-16 rotate-45 transition-transform group-hover:bg-zinc-100 border-l border-b border-zinc-200"></div>
                  <CaseTechStack category={caseData.category} customTools={caseData.techStack} />
                </div>
              )}

              <div className="pt-32 border-t-2 border-dashed border-zinc-200 relative">
                <div className="absolute -top-1 right-0 w-8 h-[2px] bg-black"></div>
                <h3 className="font-mono text-[11px] text-zinc-400 uppercase tracking-[0.6em] mb-12 font-bold italic">Corporate_Blueprint_2026</h3>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-black mb-12 italic uppercase leading-[0.85]">Inicie<br />sua Escala</h2>
                <p className="text-zinc-500 mb-16 text-2xl leading-[1.3] max-w-lg font-light">Framework de crescimento validado por auditorias de alta performance e pronto para implantação imediata.</p>

                {/* The Ultimate CTA Button */}
                <div className="max-w-xl">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-20 px-16 bg-black text-white hover:bg-revgreen hover:text-black rounded-none text-sm font-bold uppercase tracking-[0.4em] flex items-center gap-6 transition-all duration-500 group border-[1.5px] border-black">
                        PROJETAR CRESCIMENTO
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white border-zinc-900 border-2 p-12 rounded-none shadow-[40px_40px_0px_rgba(0,0,0,0.05)] bg-grain">
                      <DialogHeader className="mb-12 p-0">
                        <DialogTitle className="text-5xl font-black tracking-tighter uppercase italic leading-none">Agendar Inspeção Técnica</DialogTitle>
                        <p className="font-mono text-[11px] text-zinc-400 tracking-[0.3em] mt-6 border-b border-zinc-100 pb-4">SPECIFICATION_REQUEST // PHASE_01_INIT</p>
                      </DialogHeader>
                      <ContactForm />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CaseContent;
