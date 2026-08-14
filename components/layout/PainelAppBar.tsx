// components/painel/layout/PainelAppBar.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  CaretLeft,
  User,
  Gear,
  Users,
  SignOut,
  Wrench,
  Lightning,
} from '@phosphor-icons/react';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useScrollThreshold } from '@/hooks/useScrollThreshold';

interface PainelAppBarProps {
  greeting?: string;
  firstName?: string;
  randomPhrase?: string;
  title?: string;
  badge?: React.ReactNode;
  backAction?: string | (() => void) | null;
  onAvatarClick?: () => void;
  actions?: React.ReactNode;
  transparent?: boolean;
}

export function PainelAppBar({
  greeting,
  firstName,
  randomPhrase,
  title,
  badge,
  backAction,
  actions,
  transparent = false,
}: PainelAppBarProps) {
  const router = usePainelRouter();
  const { profile, signOut } = usePainelAuth();
  const isScrolled = useScrollThreshold(30);

  const handleBackClick = () => {
    if (localStorage.getItem('ea_draft_budget')) {
      localStorage.removeItem('ea_draft_budget');
    }

    if (typeof backAction === 'function') {
      backAction();
    } else if (typeof backAction === 'string') {
      router.push(backAction);
    } else {
      router.back();
    }
  };

  const companyTitle = (
    <div className="flex items-center gap-2">
      <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
        Elétrica <span className="text-amber-500 font-bold">&</span> Art
      </span>
      <span className="hidden sm:inline-block text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
        Gestão Pro
      </span>
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : isScrolled
            ? 'bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
            : 'bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
      } px-4 sm:px-6 py-2.5 sm:py-3`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 min-h-[44px]">
        {/* Lado Esquerdo: Botão Voltar + Logo/Saudação/Título com animação de Scroll */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {backAction && (
            <button
              type="button"
              onClick={handleBackClick}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-label="Voltar"
              title="Voltar"
            >
              <CaretLeft size={22} weight="bold" className="text-slate-700" />
            </button>
          )}

          <div
            className="min-w-0 flex-1 cursor-pointer select-none relative overflow-hidden h-[44px] flex items-center"
            onClick={() => router.push('home')}
          >
            {greeting ? (
              <>
                {/* 1. Mensagem de saudação do usuário (visível no topo, sobe e some no scroll) */}
                <div
                  className={`absolute inset-0 flex flex-col justify-center transition-all duration-300 ease-out origin-left ${
                    isScrolled
                      ? 'opacity-0 -translate-y-3 scale-[0.92] pointer-events-none'
                      : 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  }`}
                >
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                    {greeting}
                    {firstName ? `, ${firstName}` : ''}
                  </h1>
                  {randomPhrase && (
                    <p className="text-slate-500 text-xs truncate max-w-xl font-medium">
                      {randomPhrase}
                    </p>
                  )}
                </div>

                {/* 2. Título da página "Elétrica & Art" que surge na AppBar ao rolar a página */}
                <div
                  className={`absolute inset-0 flex items-center transition-all duration-300 ease-out origin-left ${
                    isScrolled
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                      : 'opacity-0 translate-y-3 scale-[0.92] pointer-events-none'
                  }`}
                >
                  {companyTitle}
                </div>
              </>
            ) : title ? (
              <>
                {/* 1. Título Padrão da Empresa (quando no topo) */}
                <div
                  className={`absolute inset-0 flex items-center transition-all duration-300 ease-out origin-left ${
                    isScrolled
                      ? 'opacity-0 -translate-y-3 scale-[0.92] pointer-events-none'
                      : 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  }`}
                >
                  {companyTitle}
                </div>

                {/* 2. Título específico da tela (Clientes, Orçamentos, etc.) que surge na AppBar no scroll */}
                <div
                  className={`absolute inset-0 flex items-center gap-2 transition-all duration-300 ease-out origin-left ${
                    isScrolled
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                      : 'opacity-0 translate-y-3 scale-[0.92] pointer-events-none'
                  }`}
                >
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 truncate">
                    {title}
                  </span>
                  {badge && (
                    <div className="shrink-0 scale-90 origin-left">{badge}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">{companyTitle}</div>
            )}
          </div>
        </div>

        {/* Lado Direito: Ações customizadas + Avatar com Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative rounded-full p-0.5 border-2 border-white shadow-sm hover:shadow-md hover:ring-2 hover:ring-indigo-500/30 transition-all shrink-0 cursor-pointer focus:outline-none ring-2 ring-indigo-900/10"
                aria-label="Menu da Conta"
              >
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                  <AvatarImage
                    src={profile?.photo_url || ''}
                    alt={profile?.name || 'Perfil'}
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback className="bg-indigo-950 text-white font-bold text-xs sm:text-sm rounded-full">
                    {profile?.name ? (
                      profile.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    ) : (
                      <Lightning
                        size={18}
                        weight="fill"
                        className="text-amber-400"
                      />
                    )}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="z-[9999] w-56 p-1.5 rounded-2xl shadow-xl border border-slate-200 bg-white"
            >
              {profile?.name && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {profile.email || 'Conta Profissional'}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                </>
              )}

              <DropdownMenuItem
                onClick={() => router.push('perfil')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <User size={18} className="text-slate-500" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('equipe')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Users size={18} className="text-slate-500" />
                <span>Minha Equipe</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('servicos')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Wrench size={18} className="text-slate-500" />
                <span>Serviços & Insumos</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('configuracoes')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Gear size={18} className="text-slate-500" />
                <span>Configurações</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 my-1" />

              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 cursor-pointer transition-colors"
              >
                <SignOut size={18} className="text-red-500" />
                <span>Sair da Conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
export default PainelAppBar;
