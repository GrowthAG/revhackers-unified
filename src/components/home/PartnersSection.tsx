
import Section from '@/components/ui/Section';

const partners = [
  { name: "Heineken", logo: "/uploads/aada4820-3f12-4185-9af6-811f30795a93.png", isBigger: true },
  { name: "Lindoya", logo: "/uploads/lindoya-logo.png", isBigger: true },
  { name: "FMU", logo: "/uploads/e0d3d03b-c1d5-4a6e-9a61-3a1c2a707b5f.png", isBigger: true },
  { name: "Anhembi Morumbi", logo: "/uploads/f5e74a47-fc77-4b34-970e-e839080310fd.png", isBigger: true },
  { name: "Cruzeiro do Sul", logo: "/uploads/cruzeiro-sul-logo-v3.png", isBigger: true, isExtraWide: true },
  { name: "Agence", logo: "/uploads/6c09375e-5298-4672-9226-27eb60a6b038.png", isBigger: true },
  { name: "BLDN", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg", isBigger: true },
  { name: "Idee Seguros", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c73dcdda192452a508485.png", isBigger: true },
  { name: "Wysion", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694f321cb62dd3a75de235ca.jpg", isBigger: true },
  { name: "Bolt", logo: "/uploads/bolt-logo-new.png", isBigger: true },
  { name: "Emagrecentro", logo: "/uploads/emagrecentro-logo-new.png", isBigger: true, isExtraWide: true },
  { name: "BT", logo: "/uploads/bt-logo-new.png", isBigger: true },
  { name: "Tegra", logo: "/uploads/tegra-logo-new.png", isBigger: true },
  { name: "Tikpag", logo: "/uploads/tikpag-logo-final.png", isBigger: true },
  { name: "Placlux", logo: "https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png", isBigger: true },
  { name: "Funnels", logo: "/uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png", isBigger: true },
  { name: "ENICS", logo: "/uploads/a05718ad-1822-4102-909a-7e86af151e98.png", isBigger: true },
  { name: "TOEFL Junior Brasil", logo: "/uploads/46993eff-c4c5-41af-b7ee-c93ef0366f59.png", isBigger: true }
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
                className={`w-full object-contain transition-all duration-500 
                ${partner.isBigger ? (partner.isExtraWide ? 'max-h-24 scale-[1.6]' : 'max-h-20 scale-110') : 'max-h-16'}
                filter grayscale opacity-70 group-hover:filter-none group-hover:opacity-100 group-hover:scale-105`}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PartnersSection;
