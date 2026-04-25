
import Section from '@/components/ui/Section';

const partners = [
  { name: "Heineken", logo: "/uploads/aada4820-3f12-4185-9af6-811f30795a93.png", scale: 1.1 },
  { name: "Lindoya", logo: "/uploads/lindoya-logo.png" },
  { name: "FMU", logo: "/uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png" },
  { name: "Anhembi Morumbi", logo: "/uploads/f5e74a47-fc77-4b34-970e-e839080310fd.png" },
  { name: "Cruzeiro do Sul", logo: "/uploads/cruzeiro-sul-logo-v3.png", scale: 1.8 },
  { name: "Agence", logo: "/uploads/6c09375e-5298-4672-9226-27eb60a6b038.png" },
  { name: "BLDN", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg", scale: 1.1 },
  { name: "Idee Seguros", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c73dcdda192452a508485.png" },
  { name: "Emagrecentro", logo: "/uploads/emagrecentro-logo-new.png", scale: 1.5, customOpacity: 1 },
  { name: "BT", logo: "/uploads/bt-logo-new.png" },
  { name: "Tegra", logo: "/uploads/tegra-logo-new.png", scale: 1.4 },
  { name: "Tikpag", logo: "/uploads/tikpag-logo-final.png", scale: 1.4 },
  { name: "Placlux", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png" },
  { name: "Funnels", logo: "/uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png" },
  { name: "ENICS", logo: "/uploads/a05718ad-1822-4102-909a-7e86af151e98.png" }
];

const PartnersSection = () => {
  const renderLogos = () => (
    <>
      {partners.map((partner: any, index) => (
        <div
          key={index}
          className="flex-shrink-0 flex items-center justify-center w-40 h-20 transition-opacity duration-300"
        >
          <img
            src={partner.logo}
            alt={partner.name}
            style={{
              transform: partner.scale ? `scale(${partner.scale})` : 'scale(1)',
            }}
            className="max-h-12 w-auto object-contain grayscale opacity-60 hover:opacity-100 mix-blend-multiply transition-all duration-300"
          />
        </div>
      ))}
    </>
  );

  return (
    <Section variant="light" className="bg-white pt-16 md:pt-24 pb-0 overflow-hidden">
      <div className="text-center mb-12">
        <span className="font-mono text-xs text-zinc-900 uppercase tracking-[0.3em] font-black">
          Líderes de Mercado Que Confiam No Ecossistema
        </span>
      </div>

      <div className="relative border-y-2 border-black bg-zinc-50 py-10 flex overflow-hidden">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee-infinite {
            animation: marquee 40s linear infinite;
          }
        `}</style>

        {/* Track 1 */}
        <div className="flex min-w-fit animate-marquee-infinite items-center gap-24 px-12">
          {renderLogos()}
        </div>
        {/* Track 2 - Clone para Infinite Loop */}
        <div className="flex min-w-fit animate-marquee-infinite items-center gap-24 px-12" aria-hidden="true">
          {renderLogos()}
        </div>
        {/* Track 3 - Garantia de preenchimento em telas ultrawide */}
        <div className="flex min-w-fit animate-marquee-infinite items-center gap-24 px-12 hidden 2xl:flex" aria-hidden="true">
          {renderLogos()}
        </div>
      </div>
    </Section>
  );
};

export default PartnersSection;
