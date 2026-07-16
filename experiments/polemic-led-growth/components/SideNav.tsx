import React from 'react';

interface SideNavProps {
  activeSection: string;
}

const navItems = [
  { id: 'intro', label: 'INÍCIO' },
  { id: 'what', label: 'O QUE É' },
  { id: 'diagnostico', label: 'DIAGNÓSTICO' },
  { id: 'erros', label: '3 ERROS' },
  { id: 'anatomy', label: 'ANATOMIA' },
  { id: 'mandamentos', label: '7 REGRAS' },
  { id: 'metodo', label: 'MÉTODO' },
  { id: 'content-matrix', label: 'MATRIZ 4D' },
  { id: 'hooks', label: 'HOOKS' },
  { id: 'stack', label: 'STACK' },
  { id: 'cases', label: 'CASES' },
  { id: 'engrenagens', label: '5 ENGRENAGENS' },
  { id: 'final-cta', label: 'CTA' },
];

export const SideNav: React.FC<SideNavProps> = ({ activeSection }) => {
  return (
    <nav className="hidden lg:block fixed left-5 top-1/2 -translate-y-1/2 z-[1000]">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`block writing-vertical-rl text-[9px] tracking-[2px] my-[12px] no-underline font-mono transition-all duration-200 transform hover:scale-110 ${
            activeSection === item.id
              ? 'text-neon-green opacity-100 scale-110 font-bold'
              : 'text-deep-black opacity-25 hover:opacity-100'
          }`}
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};