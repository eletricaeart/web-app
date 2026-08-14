// components/painel/ferramentas/FerramentasPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import {
  Lightning,
  PaintBrush,
  Wall,
  HardHat,
  CaretRight,
  Sparkle,
  Wrench,
  Drop,
  Fan,
} from '@phosphor-icons/react';

export default function FerramentasPainel() {
  const router = usePainelRouter();

  const toolCategories = [
    {
      id: 'eletrica',
      route: 'ferramentas.eletrica',
      title: 'Elétrica NBR 5410',
      subtitle: 'Condutores, Cargas & Queda de Tensão',
      description:
        'Dimensionamento de circuitos monofásicos e trifásicos, disjuntores DIN, queda de tensão por distância e taxa de ocupação de eletrodutos.',
      gradient: 'from-amber-500 to-amber-600',
      border: 'border-amber-400/30',
      shadow: 'shadow-amber-500/20',
      icon: <Lightning size={32} weight="duotone" className="text-white" />,
      badge: 'NBR 5410',
      badgeColor: 'bg-amber-400/20 text-white border-amber-300/30',
    },
    {
      id: 'pintura',
      route: 'ferramentas.pintura',
      title: 'Pintura & Acabamentos',
      subtitle: 'Rendimento Real, Latas & Galões',
      description:
        'Cálculo de cobertura por demão para paredes e tetos, descontos de portas/janelas, estimativa de massa corrida e selador.',
      gradient: 'from-violet-600 to-indigo-700',
      border: 'border-violet-400/30',
      shadow: 'shadow-violet-600/20',
      icon: <PaintBrush size={32} weight="duotone" className="text-white" />,
      badge: 'Rendimento Real',
      badgeColor: 'bg-violet-400/20 text-white border-violet-300/30',
    },
    {
      id: 'drywall',
      route: 'ferramentas.drywall',
      title: 'Drywall & Forro',
      subtitle: 'Ambientes, Paredes, Forros & Calculadora Rápida',
      description:
        'Estimativa completa por ambientes (ABNT NBR 15758), quantitativo de perfis, montantes, guias, placas ST/RU/RF, parafusos e cálculo instantâneo.',
      gradient: 'from-emerald-600 to-teal-700',
      border: 'border-emerald-400/30',
      shadow: 'shadow-emerald-600/20',
      icon: <Wall size={32} weight="duotone" className="text-white" />,
      badge: 'ABNT NBR 15758',
      badgeColor: 'bg-emerald-400/20 text-white border-emerald-300/30',
    },
  ];

  const upcomingCategories = [
    {
      title: 'Hidráulica & Sanitária',
      subtitle: 'Vazão, caixas d’água e dimensionamento de tubulações',
      icon: <Drop size={20} weight="duotone" className="text-sky-500" />,
    },
    {
      title: 'Climatização & HVAC',
      subtitle: 'Cálculo térmico de BTUs por m² e insolação solar',
      icon: <Fan size={20} weight="duotone" className="text-cyan-500" />,
    },
  ];

  return (
    <>
      <PainelAppBar title="Ferramentas Técnicas" />

      <Page
        tag="ferramentas-page"
        hasBottomNavBar={true}
        bg="#f8fafc"
        pd="0 0 100px 0"
      >
        <header className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Hub de Ferramentas Técnicas"
            subtitle="Selecione a especialidade do profissional para abrir os cálculos dedicados"
            badge={
              <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <HardHat
                  size={15}
                  weight="duotone"
                  className="text-amber-600"
                />
                Engenharia de Campo
              </span>
            }
          />
        </header>

        <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-6 flex flex-col gap-6">
          {/* Cards das categorias principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {toolCategories.map((tool) => (
              <div
                key={tool.id}
                onClick={() => router.push(tool.route)}
                className={`cursor-pointer bg-gradient-to-br ${tool.gradient} p-5 sm:p-6 rounded-3xl shadow-lg ${tool.shadow} active:scale-[0.98] hover:scale-[1.01] transition-all border border-white/20 relative overflow-hidden group flex flex-col justify-between`}
              >
                {/* Elemento de fundo decorativo */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-sm pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                      {tool.icon}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border backdrop-blur-sm ${tool.badgeColor}`}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                    {tool.title}
                  </h3>
                  <p className="text-white/90 text-xs font-semibold mt-1">
                    {tool.subtitle}
                  </p>
                  <p className="text-white/80 text-xs mt-3 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-white font-bold text-xs">
                  <span>Acessar ferramentas</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <CaretRight size={16} weight="bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seção de futuras ferramentas */}
          <div className="mt-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={20} weight="duotone" className="text-indigo-600" />
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                Próximas Ferramentas em Desenvolvimento
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Nossa central técnica é modular e continuará recebendo
              calculadoras para todas as áreas de prestação de serviços.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingCategories.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 opacity-80"
                >
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-xs">
                        {item.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                        Em breve
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </Page>
    </>
  );
}
