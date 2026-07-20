// components/layout/BudgetCard.tsx
'use client';

import React from 'react';
import View from './View';
import './ClientCard.css';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import { CloudCheck, ArrowsClockwise } from '@phosphor-icons/react';
import { getCleanDate } from '@/utils/helpers';
import { getDisplayStatus, ORCAMENTO_STATUS_STYLES } from '@/lib/orcamentoMeta';

interface BudgetCardProps {
  orc: {
    id: string | number;
    clientName?: string;
    documentTitle?: string;
    issueDate?: string;
    expiration?: string;
    status?: string;
    total?: number;
    cliente?: { name?: string };
    docTitle?: { text?: string; emissao?: string };
  };
  clientData?: {
    photo?: string;
    gender?: string;
  };
  onClick?: () => void;
  options?: React.ReactNode;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function BudgetCard({
  orc,
  clientData,
  onClick,
  options,
}: BudgetCardProps) {
  const isTemp = String(orc.id).startsWith('TEMP_');

  const clienteNome = orc?.clientName || 'Cliente não identificado';
  const tituloOrcamento = orc?.documentTitle || 'Sem título';
  const dataEmissao = orc?.issueDate || new Date().toISOString();
  const displayStatus = getDisplayStatus(orc);

  return (
    <View tag="client-card" className="rounded-[1rem] shadow-sm">
      <View tag="client-avatar" onClick={onClick} className="cursor-pointer">
        <ClientGhostAvatar
          name={clienteNome}
          gender={clientData?.gender}
          photoUrl={clientData?.photo}
          size={48}
          showGenderBadge={false}
        />
      </View>
      <View
        tag="client-info"
        onClick={onClick}
        className="cursor-pointer truncate flex-1 min-w-0"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-[#333] capitalize font-bold leading-tight truncate">
            {clienteNome.toLowerCase()}
          </h4>
          <small className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
            {isTemp ? (
              <ArrowsClockwise
                size={14}
                className="animate-spin text-amber-500"
              />
            ) : (
              <CloudCheck
                size={14}
                weight="duotone"
                className="text-emerald-500"
              />
            )}
            {getCleanDate(dataEmissao)}
          </small>
        </div>
        <p className="text-xs text-indigo-600 font-medium truncate mt-1">
          {tituloOrcamento}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ORCAMENTO_STATUS_STYLES[displayStatus.color]}`}
          >
            {displayStatus.label}
          </span>
          {typeof orc.total === 'number' && orc.total > 0 && (
            <span className="text-[11px] font-black text-slate-700">
              {formatCurrency(orc.total)}
            </span>
          )}
        </div>
      </View>
      <View tag="client-badge" className="bg-transparent">
        {options}
      </View>
    </View>
  );
}
