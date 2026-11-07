import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'green',
  trend,
  onClick,
}) => {
  const variantStyles = {
    green: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-sm shadow-emerald-600/30',
      valueColor: 'text-slate-900',
      subtleGradient: 'hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/40',
    },
    amber: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm shadow-amber-600/30',
      valueColor: 'text-slate-900',
      subtleGradient: 'hover:bg-gradient-to-br hover:from-white hover:to-amber-50/40',
    },
    red: {
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm shadow-rose-600/30',
      valueColor: 'text-rose-900',
      subtleGradient: 'hover:bg-gradient-to-br hover:from-white hover:to-rose-50/40',
    },
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-sm shadow-blue-600/30',
      valueColor: 'text-slate-900',
      subtleGradient: 'hover:bg-gradient-to-br hover:from-white hover:to-blue-50/40',
    },
    slate: {
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm shadow-slate-600/30',
      valueColor: 'text-slate-900',
      subtleGradient: 'hover:bg-gradient-to-br hover:from-white hover:to-slate-50/40',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${style.border} p-5 shadow-xs transition-all duration-200 shadow-card-hover relative overflow-hidden group ${
        onClick ? 'cursor-pointer ring-1 ring-transparent hover:ring-emerald-200' : ''
      } ${style.subtleGradient}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className={`text-2xl font-black tracking-tight ${style.valueColor}`}>
              {value}
            </h3>
          </div>
        </div>

        <div className={`p-3 rounded-2xl ${style.iconBg} transition-transform group-hover:scale-105 duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100/80">
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 truncate">
            {subtitle}
          </p>
        )}

        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ml-auto ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
};
