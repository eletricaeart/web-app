// components/layout/ClientCard.tsx
'use client';

import React from 'react';
import View from './View';
import './ClientCard.css';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import { Crown } from '@phosphor-icons/react';
import { getCategoryLabel } from '@/lib/clientMeta';

interface ClientData {
  id?: string | number;
  name: string;
  gender?: 'masc' | 'fem' | string;
  cidade?: string;
  doc?: boolean | string;
  photo?: string;
  bairro?: string;
}

interface ClientCardProps {
  client: ClientData;
  onClick?: () => void;
  options?: React.ReactNode;
  isTopClient?: boolean;
  category?: string;
}

export default function ClientCard({
  client,
  onClick,
  options,
  isTopClient = false,
  category,
}: ClientCardProps) {
  return (
    <View
      tag="client-card"
      className={`rounded-[1rem] shadow-sm flex items-center p-3 gap-3 relative ${
        isTopClient ? 'ring-2 ring-amber-400' : ''
      }`}
    >
      {isTopClient && (
        <span className="absolute -top-2 -left-2 bg-amber-400 text-white p-1 rounded-full shadow-md">
          <Crown size={14} weight="fill" />
        </span>
      )}

      <View
        tag="client-avatar"
        onClick={onClick}
        className="cursor-pointer flex-shrink-0"
      >
        <ClientGhostAvatar
          name={client.name}
          gender={client.gender}
          photoUrl={client.photo}
          size={48}
        />
      </View>

      <View
        tag="client-info"
        onClick={onClick}
        className="cursor-pointer flex-1 min-w-0"
      >
        <h4 className="text-[#333] capitalize font-bold truncate">
          {(client.name || 'Sem Nome').toLowerCase()}
        </h4>
        <p className="text-xs text-slate-500 truncate">
          {client.cidade || 'Cidade não informada'}
          {client.bairro ? ` - ${client.bairro}` : ''}
        </p>
        {category && (
          <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {getCategoryLabel(category)}
          </span>
        )}
      </View>

      <View tag="client-badge" className="flex-shrink-0">
        {options}
      </View>
    </View>
  );
}
