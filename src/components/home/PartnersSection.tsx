
import Section from '@/components/ui/Section';

const partners = [
  { name: "BLDN", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg", keepOriginal: true },
  { name: "Idee Seguros", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c73dcdda192452a508485.png", keepOriginal: true },
  { name: "Anhembi Morumbi", logo: "/lovable-uploads/f5e74a47-fc77-4b34-970e-e839080310fd.png" },
  { name: "Cruzeiro do Sul", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c613573a5e0f8b70a8a2f.png", keepOriginal: true },
  { name: "FMU", logo: "/lovable-uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png", keepOriginal: true },
  { name: "Tikpag", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c745adda192dc1f508a8f.webp", keepOriginal: true },


  { name: "Emagrecentro", logo: "/lovable-uploads/116d453a-7ffe-43a3-bcc4-aeac34c74bd4.png" },
  { name: "Tegra", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6949edabadf7e46c01d06087.webp" },
  { name: "TOEFL Junior Brasil", logo: "/lovable-uploads/46993eff-c4c5-41af-b7ee-c93ef0366f59.png" },
  { name: "Placlux", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png", keepOriginal: true },
  { name: "Heineken", logo: "/lovable-uploads/aada4820-3f12-4185-9af6-811f30795a93.png" },

  { name: "ENICS", logo: "/lovable-uploads/a05718ad-1822-4102-909a-7e86af151e98.png" },
  { name: "Funnels", logo: "/lovable-uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png" }
];

const PartnersSection = () => {
  return (
    <Section variant="light" className="bg-white border-b border-gray-100 py-12">
      <div className="container-custom">
        <div className="text-center mb-8">
          <span className="font-mono-tech text-xs text-gray-400 uppercase tracking-widest">
            LÍDERES DE MERCADO QUE CONFIAM
          </span>
        </div>

        {/* Grid Layout with Background Cards */}
        <div className="flex items-center justify-center gap-6 flex-wrap max-w-6xl mx-auto">
          {partners.map((partner: any, index) => (
            <div
              key={index}
              className="h-32 w-52 flex items-center justify-center bg-gray-50 rounded-lg p-8 hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 group border border-gray-100 cursor-pointer"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={`max-h-16 w-full object-contain transition-all duration-300 group-hover:opacity-100 
                ${partner.keepOriginal ? 'filter-none opacity-100' :
                    partner.keepBlack ? 'filter brightness-0 opacity-80' :
                      partner.hasBg ? 'mix-blend-multiply filter grayscale opacity-80 group-hover:filter-none' :
                        'filter brightness-0 opacity-80 group-hover:filter-none'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PartnersSection;
