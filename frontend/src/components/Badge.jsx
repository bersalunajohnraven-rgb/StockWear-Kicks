import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/60',
    success: 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border border-amber-800/60 animate-pulse',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-800/80',
    info: 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};
