// components/painel/documentos/DocumentosPainel.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import Page from '@/components/layout/Page';
import PageHeader from '@/components/layout/PageHeader';
import { FileText, Notebook, Receipt, FolderOpen } from '@phosphor-icons/react';

export default function DocumentosPainel() {
  const router = usePainelRouter();

  const documents = [
    {
      id: 'orcamentos',
      label: 'Orçamentos',
      description: 'Crie e gerencie orçamentos para seus clientes.',
      icon: <FileText size={24} weight="duotone" className="text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100',
    },
    {
      id: 'notas',
      label: 'Notas de Serviço',
      description: 'Acompanhe as notas de serviço e relatórios diários.',
      icon: (
        <Notebook size={24} weight="duotone" className="text-emerald-600" />
      ),
      color: 'bg-emerald-50 border-emerald-100',
    },
    {
      id: 'recibos',
      label: 'Recibos',
      description: 'Emita recibos de pagamento com facilidade.',
      icon: <Receipt size={24} weight="duotone" className="text-amber-600" />,
      color: 'bg-amber-50 border-amber-100',
    },
  ];

  return (
    <>
      <PainelAppBar title="Documentos" />

      <Page
        tag="documentos-page"
        hasBottomNavBar={true}
        bg="#f8fafc"
        pd="0 0 100px 0"
      >
        <header className="pt-4 px-4 sm:px-6 max-w-3xl mx-auto w-full">
          <PageHeader
            title="Central de Documentos"
            subtitle="Acesse rapidamente orçamentos, notas e recibos"
            badge={
              <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <FolderOpen
                  size={15}
                  weight="duotone"
                  className="text-slate-600"
                />
                Arquivos
              </span>
            }
          />
        </header>

        <main className="px-4 sm:px-6 max-w-3xl mx-auto w-full mt-6 flex flex-col gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(doc.id)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className={`p-3 rounded-xl border ${doc.color}`}>
                {doc.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{doc.label}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {doc.description}
                </p>
              </div>
            </div>
          ))}
        </main>
      </Page>
    </>
  );
}
