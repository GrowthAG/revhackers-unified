import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { SideNav } from './components/SideNav';
import { DamageCounter } from './components/DamageCounter';
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
  FinalCTASection,
  Footer
} from './components/Sections';

const App: React.FC = () => {
  const [isEntered, setIsEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');

  // Handle Entrance
  const handleEnter = () => {
    setIsEntered(true);
    window.scrollTo(0, 0);
  };

  // Lock scroll when on splash screen
  useEffect(() => {
    if (!isEntered) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }
  }, [isEntered]);

  // Scroll Listener
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

  // Intersection Observer
  useEffect(() => {
    if (!isEntered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [isEntered]);

  return (
    <div className="relative min-h-screen bg-pure-white text-deep-black font-space selection:bg-neon-green selection:text-deep-black overflow-x-hidden">
      <SplashScreen onEnter={handleEnter} isVisible={!isEntered} />

      {/* Top Progress Bar */}
      <div
        className={`fixed top-0 left-0 h-[3px] bg-neon-green z-50 transition-all duration-100 ease-out ${!isEntered ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Content */}
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

export default App;