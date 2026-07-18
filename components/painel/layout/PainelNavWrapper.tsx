// components/painel/layout/PainelNavWrapper.tsx
// PainelNavWrapper.tsx
'use client';

import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import PainelBottomNavbar from './PainelBottomNavbar';

export default function PainelNavWrapper() {
  const router = usePainelRouter();

  // DEFINA AQUI: As únicas seções que mostram a barra (Listagens)
  const showOnSections = [
    'home',
    'orcamentos',
    'clientes',
    'notas',
    'recibos',
    'equipe',
    'perfil',
  ];

  // Verifica se a seção atual está na lista acima
  const shouldShow = showOnSections.includes(router.section);

  if (!shouldShow) return null;

  return <PainelBottomNavbar />;
}
