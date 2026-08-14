// components/painel/ferramentas/EletricaPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import { Lightning, HardHat } from '@phosphor-icons/react';
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

        <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full mt-4">
          <EletricaCalculadora />
        </main>
      </Page>
    </>
  );
}
