import React from 'react';

interface BadgeProps {
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  children,
  className = '',
  size = 'md',
}) => {
  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs',
    red: 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-2xs',
    blue: 'bg-sky-50 text-sky-800 border-sky-200/80 shadow-2xs',
    gray: 'bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs',
  };

  const dotStyles = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    blue: 'bg-sky-500',
    gray: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] font-bold px-2 py-0.5',
    md: 'text-[11px] font-extrabold px-2.5 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`}></span>
      <span>{children}</span>
    </span>
  );
};
