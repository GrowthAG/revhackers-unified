
import { ReactNode } from 'react';
import PremiumHeader from './PremiumHeader';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <PremiumHeader />
      <main className="flex-grow pt-20 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
