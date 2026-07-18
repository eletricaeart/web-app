// app/perfil/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import Divider from '@/components/Divider';
import Image from 'next/image';
import {
  WhatsappLogo,
  EnvelopeSimple,
  Briefcase,
  IdentificationCard,
  CheckCircle,
  SignOut,
  Pen,
  Clock,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function PerfilUsuario() {
  const router = useRouter();
  const supabase = createClient();

  const { data: profiles, loading: loadingProfiles } =
    useEASyncSupabase<any>('profiles');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadIdentity() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // DIAGNÓSTICO NO CONSOLE DO NAVEGADOR
        console.log('Sessão Auth ID:', authUser.id);
        console.log('Dados vindos do hook profiles:', profiles);

        const dbProfile = profiles.find(
          (p: any) => String(p.id) === String(authUser.id),
        );

        if (dbProfile) {
          console.log('✅ Perfil encontrado no banco:', dbProfile);
          setUser(dbProfile);
        } else if (!loadingProfiles) {
          console.log('❌ Perfil NÃO encontrado na lista do banco.');
          setUser({
            id: authUser.id,
            name: authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email,
            role: 'Membro (Fallback)',
          });
        }
      }
    }
    loadIdentity();
  }, [profiles, loadingProfiles]);

  // Estrutura Visual Mantida Fielmente
  if (!user)
    return (
      <View tag="page" className="p-10 text-center">
        Buscando identidade...
      </View>
    );

  return (
    <>
      <AppBar
        title="Meu Perfil"
        backAction={() => router.push('/')}
        options={
          <View
            tag="appbar-btn"
            onClick={() => router.push(`/equipe/editar?id=${user?.id}`)}
          >
            <Pen size={24} color="white" weight="bold" />
          </View>
        }
      />

      <View tag="page" className="bg-slate-50 min-h-screen">
        <div className="bg-indigo-950 pt-6 pb-12 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden relative">
            <Image
              src={user?.photo_url || '/pix/avatar/default_avatar_masc.webp'}
              alt={user?.name || 'Usuário'}
              fill
              className="object-cover"
            />
          </div>
          {/* AQUI APARECERÁ O NOME DA TABELA PROFILES */}
          <h2 className="text-white text-2xl font-bold mt-4 uppercase">
            {user?.name || 'CEO'}
          </h2>
          <span className="text-indigo-300 text-sm font-medium">
            {user?.role}
          </span>
        </div>

        <View tag="page-content" className="px-6 -mt-8">
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Briefcase size={18} weight="duotone" /> Carreira
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Especialidade
                </p>
                <p className="text-slate-800 font-semibold">
                  {user?.specialty || 'Não informado'}
                </p>
              </div>
              <Divider color="#f1f5f9" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Bio
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-1">
                  {user?.about || 'Nenhuma descrição.'}
                </p>
              </div>
            </div>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <IdentificationCard size={18} weight="duotone" /> Contato
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-xl">
                  <WhatsappLogo size={20} className="text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">
                  {user?.whatsapp || 'Não informado'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <EnvelopeSimple size={20} className="text-blue-600" />
                </div>
                <span className="text-slate-700 font-medium">
                  {user?.email}
                </span>
              </div>
            </div>
          </View>

          <div className="mt-8">
            <Button
              variant="ghost"
              className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 h-14 rounded-2xl border border-red-100"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
            >
              <SignOut size={24} weight="bold" />
              <span className="font-bold uppercase tracking-wider text-xs">
                Sair da Conta
              </span>
            </Button>
          </div>
        </View>
      </View>
    </>
  );
}
