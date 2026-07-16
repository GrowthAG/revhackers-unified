import React from 'react';

interface DamageCounterProps {
  progress: number;
}

export const DamageCounter: React.FC<DamageCounterProps> = ({ progress }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div className="fixed right-5 top-5 font-mono text-[10px] tracking-[1px] z-[1000] mix-blend-difference text-neon-green">
      SCROLL: <span className="font-bold">{percentage}%</span>
    </div>
  );
};