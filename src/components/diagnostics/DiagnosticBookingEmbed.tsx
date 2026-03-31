import React, { useEffect } from 'react';

interface DiagnosticBookingEmbedProps {
  diagnosticType?: string;
  calendarId?: string;
}

const CALENDAR_ID = 'MmyRuRPox3ZComQA3jJ1'; // Calendario unico de diagnostico

const DiagnosticBookingEmbed: React.FC<DiagnosticBookingEmbedProps> = ({ diagnosticType, calendarId }) => {
  const activeCalendar = calendarId || CALENDAR_ID;
  useEffect(() => {
    // Load the GHL embed script
    const script = document.createElement('script');
    script.src = 'https://pages.revhackers.com.br/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Append to body instead of document head because the GHL script expects it
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts to prevent duplicates
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="w-full flex-col items-center justify-center p-4 bg-zinc-950/30 border border-zinc-800 shadow-sm mt-12 overflow-hidden">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Agende Lendo Seu Relatório</h3>
        <p className="text-zinc-400">
          Nossos especialistas farão o deep dive gratuito no seu funil.
        </p>
      </div>
      <iframe
        src={`https://pages.revhackers.com.br/widget/booking/${activeCalendar}?utm_source=revhackers_hub&utm_medium=diagnostic&utm_campaign=${diagnosticType || 'general'}`}
        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '650px' }}
        scrolling="no"
        id={`${activeCalendar}_embed`}
        title="Agendar Diagnostico"
      />
    </div>
  );
};

export default DiagnosticBookingEmbed;
