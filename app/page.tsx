// app/page.tsx
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PublicHomeClient from '@/components/public/home/PublicHomeClient';
import PublicLandingClient from '@/components/public/landing/PublicLandingClient';

export const metadata: Metadata = {
  title:
    'Elétrica & Art — Elétrica, Pintura e Drywall em Praia Grande, Santos e São Vicente',
  description:
    'Rafael, especialista em instalações elétricas, iluminação decorativa, pintura estilizada e drywall. Atendimento em Praia Grande, Santos e São Vicente - SP.',
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Visitante não-logado vê a landing estilo HUD.
  // Usuário já autenticado vê a home institucional que já construímos.
  if (user) {
    return <PublicHomeClient />;
  }

  return <PublicLandingClient />;
}
