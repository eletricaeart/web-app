// components/painel/equipe/EquipePainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import ClientCard from '@/components/layout/ClientCard';
import FAB from '@/components/ui/FAB';
import { UserPlus } from '@phosphor-icons/react';

interface Usuario {
  id: string;
  name: string;
  role: string;
  photo_url?: string;
  gender?: string;
}

export default function EquipePainel() {
  const router = usePainelRouter();

  // Busca da tabela 'profiles'
  const { data: users, loading } = useEASyncSupabase<Usuario>('profiles');

  return (
    <>
      <AppBar title="Minha Equipe" backAction={() => router.push('home')} />

      <View tag="page" className="p-4">
        <div className="flex flex-col gap-2">
          {/* Mostra um aviso se estiver carregando ou vazio */}
          {loading && (
            <p className="text-center opacity-50">Carregando equipe...</p>
          )}
          {!loading && users.length === 0 && (
            <p className="text-center opacity-50">Nenhum membro encontrado.</p>
          )}

          {users.map((u) => (
            <ClientCard
              key={u.id}
              client={{
                ...u,
                name: u.name || 'Sem Nome', // Garante que o nome apareça
                photo: u.photo_url,
                cidade: u.role,
              }}
              onClick={() => router.push('equipe.editar', { id: String(u.id) })}
            />
          ))}
        </div>
      </View>

      <FAB
        actions={[
          {
            icon: <UserPlus size={28} weight="duotone" />,
            label: 'Novo Membro',
            action: () => router.push('equipe.editar'),
          },
        ]}
      />
    </>
  );
}
