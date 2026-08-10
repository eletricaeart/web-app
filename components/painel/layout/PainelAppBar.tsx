// components/painel/layout/PainelAppBar.tsx
'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Lightning } from '@phosphor-icons/react';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';

interface PainelAppBarProps {
  greeting: string;
  firstName: string;
  randomPhrase?: string;
  onAvatarClick?: () => void;
}

export function PainelAppBar({
  greeting,
  firstName,
  randomPhrase,
  onAvatarClick,
}: PainelAppBarProps) {
  const { profile, signOut } = usePainelAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
            {greeting}, {firstName}
          </h1>
          {randomPhrase && (
            <p className="text-slate-500 text-xs truncate max-w-xl font-medium">
              {randomPhrase}
            </p>
          )}
        </div>

        <Avatar
          className="h-10 w-10 sm:h-11 sm:w-11 cursor-pointer border-2 border-white shadow-sm hover:shadow-md transition-all shrink-0 rounded-full ring-2 ring-indigo-900/10"
          onClick={onAvatarClick}
        >
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
                size={20}
                weight="duotone"
                className="text-amber-400"
              />
            )}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
