import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'gold' | 'green' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'cyan', size = 'sm' }) => {
  const styles = {
    cyan: 'bg-cyan-500/10 text-neonCyan border-cyan-500/30',
    gold: 'bg-yellow-500/10 text-neonGold border-yellow-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    gray: 'bg-gray-800 text-gray-300 border-gray-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border tracking-wide uppercase ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};
