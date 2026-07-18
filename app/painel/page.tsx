// app/painel/page.tsx
'use client';

import React from 'react';
import { PainelRouterProvider } from './_router/PainelRouterContext';
import { PainelRouterView } from './_router/routes';
import PainelNavWrapper from '@/components/painel/layout/PainelNavWrapper';
import { PainelAuthProvider } from '@/components/painel/auth/PainelAuthContext';

export default function PainelPage() {
  return (
    <PainelAuthProvider>
      <PainelRouterProvider>
        <PainelRouterView />
        <PainelNavWrapper />
      </PainelRouterProvider>
    </PainelAuthProvider>
  );
}
