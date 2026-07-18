// components/painel/perfil/PerfilPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import Divider from '@/components/Divider';
import Image from 'next/image';
import {
  WhatsappLogo,
  EnvelopeSimple,
  Briefcase,
  IdentificationCard,
  SignOut,
  GearSix,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export default function PerfilPainel() {
  const router = usePainelRouter();
  const { profile, loading, signOut } = usePainelAuth();

  if (loading || !profile)
    return (
      <View tag="page" className="p-10 text-center">
        Buscando identidade...
      </View>
    );

  return (
    <>
      <AppBar
        title="Meu Perfil"
        backAction={() => router.push('home')}
        options={
          <View tag="appbar-btn" onClick={() => router.push('configuracoes')}>
            <GearSix size={24} color="white" weight="bold" />
          </View>
        }
      />

      <View tag="page" className="bg-slate-50 min-h-screen">
        <div className="bg-indigo-950 pt-6 pb-12 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden relative">
            <Image
              src={profile.photo_url || '/pix/avatar/default_avatar_masc.webp'}
              alt={profile.name || 'Usuário'}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-white text-2xl font-bold mt-4 uppercase">
            {profile.name || 'CEO'}
          </h2>
          <span className="text-indigo-300 text-sm font-medium">
            {profile.role}
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
                  {profile.specialty || 'Não informado'}
                </p>
              </div>
              <Divider color="#f1f5f9" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Bio
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-1">
                  {profile.about || 'Nenhuma descrição.'}
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
                  {profile.whatsapp || 'Não informado'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <EnvelopeSimple size={20} className="text-blue-600" />
                </div>
                <span className="text-slate-700 font-medium">
                  {profile.email}
                </span>
              </div>
            </div>
          </View>

          <div className="mt-8">
            <Button
              variant="ghost"
              className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 h-14 rounded-2xl border border-red-100"
              onClick={signOut}
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
