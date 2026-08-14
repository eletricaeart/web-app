// components/painel/configuracoes/ConfiguracoesPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import { useTheme } from '@/providers/ThemeProvider';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import PageHeader from '@/components/layout/PageHeader';
import View from '@/components/layout/View';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  UserCircle,
  Moon,
  ShieldCheck,
  SignOut,
  CaretRight,
} from '@phosphor-icons/react';

export default function ConfiguracoesPainel() {
  const router = usePainelRouter();
  const { profile, admin, signOut } = usePainelAuth();
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <>
      <PainelAppBar
        title="Configurações"
        backAction={() => router.push('home')}
      />

      <View
        tag="page"
        className="p-4 sm:p-6 bg-slate-50 min-h-screen max-w-3xl mx-auto w-full"
      >
        <PageHeader
          title="Configurações"
          subtitle="Preferências do sistema, dados da conta e segurança"
        />

        <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <SettingsRow
            icon={
              <UserCircle
                size={22}
                weight="duotone"
                className="text-indigo-600"
              />
            }
            label="Meus Dados"
            description={profile?.name || 'Editar nome, foto e contato'}
            onClick={() =>
              router.push('equipe.editar', { id: profile?.id || '' })
            }
          />
          <Divider />
          <View className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Moon size={22} weight="duotone" className="text-indigo-600" />
              <div>
                <p className="font-bold text-slate-800 text-sm">Modo Escuro</p>
                <p className="text-xs text-slate-400">
                  {isDark ? 'Ativado' : 'Desativado'}
                </p>
              </div>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            />
          </View>
        </View>

        {admin?.can_manage_admins && (
          <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <SettingsRow
              icon={
                <ShieldCheck
                  size={22}
                  weight="duotone"
                  className="text-indigo-600"
                />
              }
              label="Administradores"
              description="Criar, editar e banir administradores"
              onClick={() => router.push('admins')}
            />
          </View>
        )}

        <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <View
            className="flex items-center gap-3 px-5 py-4 cursor-pointer text-red-500"
            onClick={signOut}
          >
            <SignOut size={22} weight="duotone" />
            <span className="font-bold text-sm">Sair da Conta</span>
          </View>
        </View>
      </View>
    </>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <View
      className="flex items-center justify-between px-5 py-4 cursor-pointer active:bg-slate-50"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-bold text-slate-800 text-sm">{label}</p>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>
      <CaretRight size={16} className="text-slate-300" />
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-slate-100 mx-5" />;
}
