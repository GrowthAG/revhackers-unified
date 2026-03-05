
import Section from '@/components/ui/Section';

const partners = [
  { name: "TLDV", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Ctext x='10' y='30' font-family='system-ui,-apple-system,sans-serif' font-size='28' font-weight='800' fill='%23333'%3Etl%3Ctspan fill='%236C5CE7'%3Edv%3C/tspan%3E%3C/text%3E%3C/svg%3E", scale: 1.5 },
  { name: "Heineken", logo: "/uploads/aada4820-3f12-4185-9af6-811f30795a93.png", scale: 1.1 },
  { name: "Lindoya", logo: "/uploads/lindoya-logo.png" },
  { name: "FMU", logo: "/uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png" },
  { name: "Anhembi Morumbi", logo: "/uploads/f5e74a47-fc77-4b34-970e-e839080310fd.png" },
  { name: "Cruzeiro do Sul", logo: "/uploads/cruzeiro-sul-logo-v3.png", scale: 1.8 },
  { name: "Agence", logo: "/uploads/6c09375e-5298-4672-9226-27eb60a6b038.png" },
  { name: "BLDN", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg", scale: 1.1 },
  { name: "Idee Seguros", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c73dcdda192452a508485.png" },
  { name: "Wysion", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694f321cb62dd3a75de235ca.jpg" },
  { name: "Bolt", logo: "/uploads/bolt-logo-new.png" },
  { name: "Emagrecentro", logo: "/uploads/emagrecentro-logo-new.png", scale: 1.5, customOpacity: 1 },
  { name: "BT", logo: "/uploads/bt-logo-new.png" },
  { name: "Tegra", logo: "/uploads/tegra-logo-new.png", scale: 1.4 },
  { name: "Tikpag", logo: "/uploads/tikpag-logo-final.png", scale: 1.4 },
  { name: "Placlux", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png" },
  { name: "Funnels", logo: "/uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png" },
  { name: "ENICS", logo: "/uploads/a05718ad-1822-4102-909a-7e86af151e98.png" }
];

const PartnersSection = () => {
  return (
    <Section variant="light" className="bg-white border-b border-zinc-100 py-16 md:py-24">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold">
            LÍDERES DE MERCADO QUE CONFIAM NO NOSSO ECOSSISTEMA
          </span>
        </div>

        {/* Grid Layout with Sophisticated Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-[1400px] mx-auto px-4">
          {partners.map((partner: any, index) => (
            <div
              key={index}
              className="h-24 w-full flex items-center justify-center bg-zinc-50/50 rounded-2xl p-4 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-500 group border border-zinc-100/50 cursor-pointer overflow-hidden"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                style={{
                  transform: partner.scale ? `scale(${partner.scale})` : 'scale(1)',
                  opacity: partner.customOpacity || undefined
                }}
                className={`h-12 md:h-16 w-auto object-contain transition-all duration-500 
                grayscale ${partner.customOpacity ? '' : 'opacity-40'} group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110`}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PartnersSection;
