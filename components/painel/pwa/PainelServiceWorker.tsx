// components/painel/pwa/PainelServiceWorker.tsx
'use client';

import { useEffect } from 'react';

export default function PainelServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register('/sw-painel.js', { scope: '/painel/' })
      .catch((err) => {
        console.error('Falha ao registrar Service Worker do painel:', err);
      });
  }, []);

  return null;
}
