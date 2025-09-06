import { motion } from 'framer-motion';

const ExecutiveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Premium gradient base */}
      <div className="absolute inset-0 bg-gradient-executive" />
      
      {/* Sophisticated floating elements */}
      <motion.div
        className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/5 w-64 h-64 rounded-full bg-slate-400/15 blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Executive grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />
      
      {/* Subtle noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Premium glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-900/20" />
    </div>
  );
};

export default ExecutiveBackground;