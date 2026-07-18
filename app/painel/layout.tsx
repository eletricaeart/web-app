// app/painel/layout.tsx
import type { Metadata } from 'next';
import PainelServiceWorker from '@/components/painel/pwa/PainelServiceWorker';

export const metadata: Metadata = {
  title: 'Elétrica & Art — Painel',
  manifest: '/manifest-painel.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EA Painel',
  },
  icons: {
    icon: '/pix/painel-icons/icon-192.png',
    apple: '/pix/painel-icons/apple-touch-icon-painel.png',
  },
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PainelServiceWorker />
      {children}
    </>
  );
}
