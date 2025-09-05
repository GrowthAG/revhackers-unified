import { ReactNode } from 'react';
import { useInViewAnimation } from '@/hooks/useInViewAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in-viewport' | 'slide-up-viewport' | 'scale-in-viewport';
  delay?: 'stagger-1' | 'stagger-2' | 'stagger-3' | 'stagger-4';
}

export const AnimatedSection = ({ 
  children, 
  className, 
  animation = 'slide-up-viewport',
  delay 
}: AnimatedSectionProps) => {
  const { ref, isInView } = useInViewAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        animation,
        delay,
        isInView && 'animate',
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;