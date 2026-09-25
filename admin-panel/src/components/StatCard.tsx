import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  isPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  isPositive = true,
}) => {
  return (
    <GlassCard className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">{title}</span>
        <div className="p-2.5 rounded-lg bg-surfaceBorder/60 text-neonCyan border border-surfaceBorder">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold font-heading text-white">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        </div>
      </div>
    </GlassCard>
  );
};
