// components/painel/ferramentas/EletricaPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import {
  Lightning,
  HardHat,
  SquaresFour,
  CaretRight,
  Sparkle,
} from '@phosphor-icons/react';
import EletricaCalculadora from './calculadoras/EletricaCalculadora';

export default function EletricaPainel() {
  const router = usePainelRouter();

  return (
    <>
      <PainelAppBar
        title="Ferramentas para Eletricista"
        backAction={() => router.push('ferramentas')}
      />

      <Page
        tag="eletrica-page"
        hasBottomNavBar={true}
        bg="#f8fafc"
        pd="0 0 100px 0"
      >
        <header className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Dimensionamento Elétrico (NBR 5410)"
            subtitle="Cálculos normatizados de condutores, disjuntores, queda de tensão e eletrodutos"
            badge={
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Lightning
                  size={15}
                  weight="duotone"
                  className="text-amber-600"
                />
                NBR 5410
              </span>
            }
          />
        </header>

        <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-6 flex flex-col gap-6">
          {/* --- NOVO CARD: Perfilados e Spots --- */}
          <div
            onClick={() => router.push('ferramentas.eletrica.profile-spots')}
            className="cursor-pointer bg-gradient-to-br from-amber-500 to-amber-600 p-5 sm:p-6 rounded-3xl shadow-lg shadow-amber-500/20 active:scale-[0.98] hover:scale-[1.01] transition-all border border-white/20 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-sm pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                  <SquaresFour
                    size={32}
                    weight="duotone"
                    className="text-white"
                  />
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm">
                  Novo
                </span>
              </div>

              <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                Projetos de Iluminação
              </h3>
              <p className="text-white/90 text-xs font-semibold mt-1">
                Perfilados LED e Spots
              </p>
              <p className="text-white/80 text-xs mt-3 leading-relaxed">
                Projete ambientes com perfil LED e spots, visualize blueprint,
                calcule potência, corrente e lista de materiais automaticamente.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-white font-bold text-xs">
              <span>Acessar ferramenta completa</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <CaretRight size={16} weight="bold" />
              </div>
            </div>
          </div>

          {/* --- Calculadora Rápida existente --- */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightning
                size={20}
                weight="duotone"
                className="text-amber-600"
              />
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                Calculadora Rápida
              </h4>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
                Dimensionamento básico
              </span>
            </div>
            <EletricaCalculadora />
          </div>
        </main>
      </Page>
    </>
  );
}
