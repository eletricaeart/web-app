// components/painel/recibos/ReciboVerPainel.tsx
'use client';

import React, { useRef } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import EACard from '@/components/ui/EACard';
import View from '@/components/layout/View';
import FAB from '@/components/ui/FAB';
import { ShareNetwork, Printer } from '@phosphor-icons/react';

export default function ReciboVerPainel() {
  const router = usePainelRouter();
  const id = router.params.id;

  const { data: recibos } = useEASyncSupabase<any>('recibos');

  // Busca o recibo e garante fallbacks para os nomes das colunas
  const receipt = recibos.find((r: any) => String(r.id) === String(id));
  const receiptRef = useRef(null);

  if (!receipt) return <div className="p-10 text-center">Carregando...</div>;

  // Normalização de dados para o layout
  const clientName =
    receipt.client_name_manual || receipt.clientName || 'Cliente';
  const receiptNumber =
    receipt.receipt_number || receipt.receiptNumber || '000';
  const amount = Number(receipt.amount || 0);
  const paymentMethod =
    receipt.payment_method || receipt.paymentMethod || 'não informado';
  const description = receipt.description || 'Sem descrição';

  // Tratamento de data (Supabase DATE vs Legacy String)
  const rawDate = receipt.issue_date || receipt.issueDate;
  const formattedDate = rawDate
    ? rawDate.includes('-')
      ? rawDate.split('-').reverse().join('/')
      : rawDate
    : '---';

  return (
    <>
      <AppBar title={`Recibo`} backAction={() => router.back()} />
      <View
        tag="receipt-document"
        ref={receiptRef}
        className="flex flex-col bg-white m-4 p-6 rounded-lg shadow-lg max-w-[800px] mx-auto border border-slate-100"
      >
        <EACard />
        <View tag="doc-id">
          <span>
            <b>Data de Emissão:</b>
            <View tag="issue-date">{formattedDate}</View>
          </span>
          <span>
            <b>Código do recibo:</b> <View tag="t">{receiptNumber}</View>
          </span>
        </View>

        <div className="flex justify-between border-y py-4 my-6 border-slate-100">
          <div className="text-xl font-black text-indigo-700 uppercase italic">
            Recibo de Pagamento
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">
              Número
            </div>
            <div className="font-mono text-lg">#{receiptNumber}</div>
          </div>
        </div>

        <div className="space-y-6 text-slate-700">
          <p className="text-lg leading-relaxed">
            Recebemos de <b className="text-slate-900">{clientName}</b> a
            importância de:
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl text-center border-2 border-dashed border-slate-200">
            <span className="text-4xl font-black text-indigo-700">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(amount)}
            </span>
            <div className="text-xs uppercase font-bold text-slate-400 mt-2">
              Via {paymentMethod}
            </div>
          </div>

          <div className="py-4 border-b">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
              Referente a
            </span>
            <p className="text-md">{description}</p>
          </div>

          <div className="flex justify-between items-end pt-10">
            <div className="text-sm">
              <p>
                Emissão: <b>{formattedDate}</b>
              </p>
            </div>
            <div className="w-64 border-t-2 border-slate-900 pt-2 text-center">
              <p className="font-bold text-xs">ELÉTRICA & ART</p>
              <p className="text-[10px] text-slate-500">
                Rafael - Responsável Técnico
              </p>
            </div>
          </div>
        </div>
      </View>

      <FAB
        actions={[
          {
            label: 'Compartilhar',
            icon: <ShareNetwork />,
            action: () => {
              /* lógica share */
            },
          },
          {
            label: 'Imprimir PDF',
            icon: <Printer />,
            action: () => window.print(),
          },
        ]}
        hasBottomNav={false}
      />
    </>
  );
}
