import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { HoverScale } from '@/components/shared/PremiumMicroInteractions';

interface PremiumCardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'depth' | 'float';
  className?: string;
  delay?: number;
  hover?: boolean;
}

const PremiumCard = ({ 
  children, 
  variant = 'default', 
  className = '', 
  delay = 0,
  hover = true 
}: PremiumCardProps) => {
  const variants = {
    default: 'card-premium',
    glass: 'card-glass',
    depth: 'card-depth',
    float: 'card-float'
  };

  const CardWrapper = hover ? HoverScale : motion.div;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      <CardWrapper
        className={`${variants[variant]} ${className}`}
        {...(hover ? {} : { whileHover: { y: -4 } })}
      >
        {children}
      </CardWrapper>
    </motion.div>
  );
};

export default PremiumCard;