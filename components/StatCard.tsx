
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, colorClass, trend, onClick }) => {
  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col items-start ${onClick ? 'hover:border-indigo-500 hover:shadow-md active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div className={`p-2.5 rounded-md ${colorClass}`}>
          <Icon className="text-white" size={20} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-sm ${trend.isPositive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{label}</h3>
      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
    </button>
  );
};

export default StatCard;
