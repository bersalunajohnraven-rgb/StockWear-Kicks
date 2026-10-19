import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) => {
  const colorGradients = {
    indigo: 'from-indigo-900/40 via-indigo-950/20 to-slate-900/80 border-indigo-700/30 text-indigo-400',
    emerald: 'from-emerald-900/40 via-emerald-950/20 to-slate-900/80 border-emerald-700/30 text-emerald-400',
    amber: 'from-amber-900/40 via-amber-950/20 to-slate-900/80 border-amber-700/30 text-amber-400',
    rose: 'from-rose-900/40 via-rose-950/20 to-slate-900/80 border-rose-700/30 text-rose-400',
    cyan: 'from-cyan-900/40 via-cyan-950/20 to-slate-900/80 border-cyan-700/30 text-cyan-400'
  };

  const iconBg = {
    indigo: 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30',
    emerald: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-600/20 text-rose-400 border border-rose-500/30',
    cyan: 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 bg-gradient-to-br ${colorGradients[color]} shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${iconBg[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs font-medium text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
