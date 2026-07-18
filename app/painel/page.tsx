// app/painel/page.tsx
'use client';

import React from 'react';
import { PainelRouterProvider } from './_router/PainelRouterContext';
import { PainelRouterView } from './_router/routes';
import PainelNavWrapper from '@/components/painel/layout/PainelNavWrapper';

export default function PainelPage() {
  return (
    <PainelRouterProvider>
      <PainelRouterView />
      <PainelNavWrapper />
    </PainelRouterProvider>
  );
}
