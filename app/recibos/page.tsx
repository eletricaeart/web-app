// app/recibos/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEASync } from '@/hooks/useEASync';
import FAB from '@/components/ui/FAB';
import AppBar from '@/components/layout/AppBar';
import Page from '@/components/layout/Page';
import EntityToolbar from '@/components/EntityToolbar';
import {
  FilePlus,
  ArrowsCounterClockwise,
  Receipt,
} from '@phosphor-icons/react';
import BudgetCard from '@/components/layout/BudgetCard'; // Reutilizando a estrutura visual

export default function ReceiptsList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: recibos, pull: syncRecibos } = useEASync<any>('recibos');

  const fabConfig = [
    {
      icon: <FilePlus size={28} weight="duotone" />,
      label: 'Novo Recibo',
      action: () => router.push('/recibos/novo'),
    },
    {
      icon: <ArrowsCounterClockwise size={28} weight="duotone" />,
      label: 'Sincronizar',
      action: () => syncRecibos(),
    },
  ];

  const filteredRecibos =
    recibos
      ?.filter(
        (r: any) =>
          r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.receiptNumber?.includes(searchTerm),
      )
      .reverse() || [];

  return (
    <>
      <AppBar title="Recibos" />
      <Page tag="receipts" bg="#f5f5f5">
        <header className="pt-4">
          <EntityToolbar
            placeholder="Buscar recibo ou cliente..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </header>
        <main className="flex flex-col px-4 py-4 gap-2 pb-32">
          {filteredRecibos.length > 0 ? (
            filteredRecibos.map((r: any) => (
              <BudgetCard
                key={r.id}
                orc={{
                  id: r.id,
                  clientName: r.clientName,
                  documentTitle: `Recibo #${r.receiptNumber}`,
                  issueDate: r.issueDate,
                }}
                onClick={() => router.push(`/recibos/${r.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-20 opacity-40">
              <Receipt size={64} weight="thin" className="mx-auto mb-2" />
              <p>Nenhum recibo emitido.</p>
            </div>
          )}
        </main>
      </Page>
      <FAB actions={fabConfig} hasBottomNav={true} />
    </>
  );
}
