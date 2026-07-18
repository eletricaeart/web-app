// lib/supabase/admin.ts
// ATENÇÃO: este cliente ignora TODAS as regras de RLS.
// Nunca importe este arquivo em um componente 'use client' ou exponha
// SUPABASE_SERVICE_ROLE_KEY com o prefixo NEXT_PUBLIC_.
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
