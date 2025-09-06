import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumFloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const PremiumFloatingCard = ({ 
  children, 
  delay = 0, 
  className = '' 
}: PremiumFloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`
        bg-white/90 backdrop-blur-xl border border-white/20 
        rounded-2xl p-6 shadow-premium hover:shadow-3d
        transition-all duration-500 ease-out
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default PremiumFloatingCard;