// components/layout/Section.tsx
import React from 'react';

export interface SectionProps {
  children: React.ReactNode;
  label?: string;
  quickAction?: React.ReactNode;
}

export default function Section({
  children,
  label,
  quickAction,
}: SectionProps) {
  return (
    <section className="mt-10 sm:mt-14">
      {label && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </h2>
          {/* Ação Rápida */}
          {quickAction && <>{quickAction}</>}
        </div>
      )}
      {children}
    </section>
  );
}
