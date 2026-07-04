import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LiquidIconButtonProps {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'danger' | 'success' | 'indigo' | 'secondary';
  id?: string;
  theme?: 'light' | 'dark';
}

export default function LiquidIconButton({
  onClick,
  children,
  title,
  variant = 'secondary',
  id,
  theme = 'dark',
}: LiquidIconButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isLight = theme === 'light';

  // Define themed liquid droplet backgrounds
  const themeStyles = {
    primary: 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-blue-500/25',
    danger: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-rose-50 shadow-rose-500/25',
    success: 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-emerald-950 shadow-emerald-500/25',
    indigo: 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-indigo-50 shadow-indigo-500/25',
    secondary: isLight
      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm'
      : 'bg-slate-900/40 hover:bg-slate-800/50 text-slate-300 border border-white/5',
  };

  return (
    <div className="relative group cursor-pointer select-none" id={id}>
      <motion.button
        type="button"
        onClick={onClick}
        title={title}
        className={`relative z-10 p-3 h-11 w-11 rounded-full flex items-center justify-center transition-shadow duration-300 shadow-md ${themeStyles[variant]}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          scale: 1.15,
          y: -2,
        }}
        whileTap={{
          scale: 0.9,
          borderRadius: '35% 65% 55% 45% / 45% 55% 35% 65%', // Distorts organically like liquid on click
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 15,
        }}
      >
        {/* Render actual Icon */}
        <span className="relative z-20 flex items-center justify-center">
          {children}
        </span>

        {/* Liquid under-droplet that leaks, swells, and ripples */}
        {variant !== 'secondary' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-inherit -z-10 blur-sm opacity-60"
            animate={
              isHovered
                ? {
                    scale: [1, 1.4, 1.2],
                    borderRadius: [
                      '50%',
                      '40% 60% 70% 30% / 40% 40% 60% 50%',
                      '50% 50% 50% 50%',
                    ],
                  }
                : { scale: 1, borderRadius: '50%' }
            }
            transition={{
              duration: 0.6,
              repeat: isHovered ? Infinity : 0,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Gooey morphing secondary backdrop for standard items */}
        {variant === 'secondary' && (
          <motion.div
            className="absolute inset-0 bg-sky-500/10 rounded-full -z-10 opacity-0 group-hover:opacity-100"
            animate={
              isHovered
                ? {
                    borderRadius: [
                      '50%',
                      '35% 65% 60% 40% / 40% 50% 50% 60%',
                      '60% 40% 50% 50% / 50% 60% 45% 55%',
                      '50%',
                    ],
                    scale: 1.2,
                  }
                : { scale: 1 }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </motion.button>

      {/* Floating tooltip with smooth fade/slide */}
      {title && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-xs font-medium text-slate-100 bg-slate-900 border border-slate-700/80 rounded-md shadow-xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
          {title}
        </span>
      )}
    </div>
  );
}
