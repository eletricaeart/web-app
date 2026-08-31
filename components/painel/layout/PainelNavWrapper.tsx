// components/painel/layout/PainelNavWrapper.tsx
// PainelNavWrapper.tsx
'use client';

import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import PainelBottomNavbar from './PainelBottomNavbar';

export default function PainelNavWrapper() {
  const router = usePainelRouter();

  // DEFINA AQUI: As únicas seções que mostram a barra (Listagens e Hubs principais)
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
    'admins',
    'configuracoes',
    'servicos',
  ];

  // Verifica se a seção atual é exatamente uma das seções principais de listagem/hub (não exibe em .ver, .novo, etc.)
  const shouldShow = showOnSections.includes(router.section);

  if (!shouldShow) return null;

  return <PainelBottomNavbar />;
}
