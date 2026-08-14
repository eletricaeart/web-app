// components/painel/ferramentas/FerramentasPainel.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import {
  Lightning,
  PaintBrush,
  Wall,
  Calculator,
  HardHat,
  ArrowsClockwise,
  Sparkle,
  CheckCircle,
} from '@phosphor-icons/react';
import EletricaCalculadora from './calculadoras/EletricaCalculadora';
import PinturaCalculadora from './calculadoras/PinturaCalculadora';
import DrywallCalculadora from './calculadoras/DrywallCalculadora';

type ToolCategory = 'eletrica' | 'pintura' | 'drywall';

export default function FerramentasPainel() {
  const router = usePainelRouter();
  const [activeCategory, setActiveCategory] =
    useState<ToolCategory>('eletrica');

  const categories = [
    {
      id: 'eletrica',
      label: 'Elétrica Pro (NBR 5410)',
      icon: <Lightning size={20} weight="duotone" className="text-amber-500" />,
      badge: 'NBR 5410',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description:
        'Dimensionamento de cabos, disjuntores, queda de tensão e ocupação de eletrodutos.',
    },
    {
      id: 'pintura',
      label: 'Pintura & Acabamentos',
      icon: (
        <PaintBrush size={20} weight="duotone" className="text-violet-500" />
      ),
      badge: 'Rendimento Real',
      badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
      description:
        'Cálculo de latas, galões, selador, massa corrida e desconto de portas/janelas.',
    },
    {
      id: 'drywall',
      label: 'Drywall & Gesso',
      icon: <Wall size={20} weight="duotone" className="text-emerald-500" />,
      badge: 'NBR 15758',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description:
        'Quantitativo de placas ST/RU, montantes, guias, parafusos e forros F530.',
    },
  ];

  return (
    <>
      <PainelAppBar
        title="Ferramentas Técnicas"
        backAction={() => router.push('home')}
      />

      <Page
        tag="ferramentas-page"
        hasBottomNavBar={true}
        bg="#f8fafc"
        pd="0 0 100px 0"
      >
        <header className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Calculadoras Profissionais"
            subtitle="Cálculos precisos e seguros para eletricistas, pintores e montadores de drywall"
            badge={
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <HardHat
                  size={15}
                  weight="duotone"
                  className="text-amber-600"
                />
                Engenharia de Campo
              </span>
            }
          />

          {/* Seletor Principal de Especialidade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as ToolCategory)}
                  className={`relative text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                    isActive
                      ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/5'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeToolIndicator"
                      className="absolute top-0 left-0 right-0 h-1 bg-slate-900"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      {cat.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.badgeColor}`}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {cat.label}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        {/* Área da Calculadora Selecionada */}
        <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-2">
          <AnimatePresence mode="wait">
            {activeCategory === 'eletrica' && (
              <motion.div
                key="eletrica"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <EletricaCalculadora />
              </motion.div>
            )}

            {activeCategory === 'pintura' && (
              <motion.div
                key="pintura"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <PinturaCalculadora />
              </motion.div>
            )}

            {activeCategory === 'drywall' && (
              <motion.div
                key="drywall"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <DrywallCalculadora />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </Page>
    </>
  );
}
