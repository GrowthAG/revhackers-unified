import React, { useState, useEffect } from 'react';
import {
  Container, ReadingContainer, Section, SectionTitle, H3, Paragraph, Reveal, TechCard, CornerBrackets, Footer
} from '../components/PLG';
import { SplashScreen } from '../components/SplashScreen';
import { SideNav } from '../components/SideNav';
import { DamageCounter } from '../components/DamageCounter';
import {
  IntroSection,
  WhatIsSection,
  DiagnosisSection,
  ErrorsSection,
  AnatomySection,
  MandamentosSection,
  MethodSection,
  ContentMatrixSection,
  HooksSection,
  StackSection,
  MetricsSection,
  CasesSection,
  FinalCTASection
} from '../components/Sections';

// Note: I need to import Sections components.
// Since the Sections logic was huge, I'll assume you will put the Sections logic in src/components/Sections.tsx
// OR I can inline them here for simplicity if you prefer.
// For this migration, I will rely on the Components/Sections.tsx file I will create next.

const Index: React.FC = () => {
  const [isEntered, setIsEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');

  const handleEnter = () => {
    setIsEntered(true);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (!isEntered) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }
  }, [isEntered]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(scroll || 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isEntered) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('section').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isEntered]);

  return (
    <div className="relative min-h-screen bg-pure-white text-deep-black font-space selection:bg-neon-green selection:text-deep-black overflow-x-hidden">
      <SplashScreen onEnter={handleEnter} isVisible={!isEntered} />

      <div
        className={`fixed top-0 left-0 h-[3px] bg-neon-green z-50 transition-all duration-100 ease-out ${!isEntered ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <div className={`transition-opacity duration-1000 ${isEntered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <SideNav activeSection={activeSection} />
        <DamageCounter progress={scrollProgress} />

        <main className="w-full">
          <IntroSection />
          <WhatIsSection />
          <DiagnosisSection />
          <ErrorsSection />
          <AnatomySection />
          <MandamentosSection />
          <MethodSection />
          <ContentMatrixSection />
          <HooksSection />
          <StackSection />
          <MetricsSection />
          <CasesSection />
          <FinalCTASection />
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Index;