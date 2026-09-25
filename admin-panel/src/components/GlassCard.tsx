import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`bg-surface/80 backdrop-blur-md border border-surfaceBorder rounded-xl p-5 shadow-2xl transition-all duration-300 ${
        glow ? 'border-neonCyan/40 shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 'hover:border-surfaceBorder/80'
      } ${className}`}
    >
      {children}
    </div>
  );
};
