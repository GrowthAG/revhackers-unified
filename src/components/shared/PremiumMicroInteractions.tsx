import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale = ({ 
  children, 
  scale = 1.05, 
  className = '' 
}: HoverScaleProps) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 15 }}
    className={className}
  >
    {children}
  </motion.div>
);

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export const Magnetic = ({ 
  children, 
  strength = 20, 
  className = '' 
}: MagneticProps) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    e.currentTarget.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translate(0px, 0px)';
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface RevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Reveal = ({ 
  children, 
  direction = 'up', 
  delay = 0,
  className = '' 
}: RevealProps) => {
  const directionVariants = {
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
    left: { x: 50, opacity: 0 },
    right: { x: -50, opacity: 0 }
  };

  return (
    <motion.div
      initial={directionVariants[direction]}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax = ({ 
  children, 
  speed = -50, 
  className = '' 
}: ParallaxProps) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: speed }}
      viewport={{ once: false }}
      transition={{ duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};