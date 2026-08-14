// components/painel/ferramentas/PinturaPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import { PaintBrush } from '@phosphor-icons/react';
import PinturaCalculadora from './calculadoras/PinturaCalculadora';

export default function PinturaPainel() {
  const router = usePainelRouter();

  return (
    <>
      <PainelAppBar
        title="Ferramentas para Pintor"
        backAction={() => router.push('ferramentas')}
      />

      <Page
        tag="pintura-page"
        hasBottomNavBar={true}
        bg="#f8fafc"
        pd="0 0 100px 0"
      >
        <header className="pt-4 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <PageHeader
            title="Calculadora de Pintura & Acabamentos"
            subtitle="Estimativa real de cobertura de tintas, latas, galões, selador e massa corrida"
            badge={
              <span className="text-xs font-bold text-violet-800 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <PaintBrush
                  size={15}
                  weight="duotone"
                  className="text-violet-600"
                />
                Rendimento Real
              </span>
            }
          />
        </header>

        <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-4">
          <PinturaCalculadora />
        </main>
      </Page>
    </>
  );
}
