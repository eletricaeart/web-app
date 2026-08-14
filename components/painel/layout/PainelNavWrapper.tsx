// components/painel/layout/PainelNavWrapper.tsx
// PainelNavWrapper.tsx
'use client';

import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import PainelBottomNavbar from './PainelBottomNavbar';

export default function PainelNavWrapper() {
  const router = usePainelRouter();

  // DEFINA AQUI: As únicas seções que mostram a barra (Listagens e Hubs)
  const showOnSections = [
    'home',
    'clientes',
    'documentos',
    'ferramentas',
    'orcamentos',
    'notas',
    'recibos',
    'equipe',
    'perfil',
  ];

  // Verifica se a seção atual está na lista acima ou é sub-rota de uma delas
  const shouldShow = showOnSections.some(
    (s) => router.section === s || router.section.startsWith(`${s}.`),
  );

  if (!shouldShow) return null;

  return <PainelBottomNavbar />;
}
