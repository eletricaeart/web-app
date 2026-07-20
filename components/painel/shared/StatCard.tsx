// components/painel/shared/StatCard.tsx
import React from 'react';
import View from '@/components/layout/View';

type StatAccent = 'emerald' | 'indigo' | 'amber' | 'sky';

const accentMap: Record<StatAccent, string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
};

export default function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: StatAccent;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <View className={`w-fit p-2 rounded-xl mb-2 ${accentMap[accent]}`}>
        {icon}
      </View>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-black text-slate-800 mt-0.5 truncate">
        {value}
      </p>
    </View>
  );
}
