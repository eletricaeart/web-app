// app/recibos/novo/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { eaSyncClient } from '@/lib/EASyncClient';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import ClientForm from '@/components/forms/ClientForm';
import { Input } from '@/components/ui/input';
import Pressable from '@/components/Pressable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReceiptClient {
  name: string;
  zip?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
  obs?: string;
}

interface ReceiptData {
  id: string | null;
  receiptNumber: string;
  amount: string;
  paymentMethod: string;
  description: string;
  issueDate: string;
  client: ReceiptClient; // Use a interface aqui
}

export default function NewReceipt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [loading, setLoading] = useState(false);

  const [receipt, setReceipt] = useState<ReceiptData>({
    id: null,
    receiptNumber: `${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    amount: '',
    paymentMethod: 'pix',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    client: { name: '' },
  });

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...receipt, clientName: receipt.client.name };
    const result = await eaSyncClient.save(
      'recibos',
      payload,
      receipt.id ? 'update' : 'create',
    );
    if (result) router.push('/recibos');
    setLoading(false);
  };

  return (
    <>
      <AppBar title={editId ? 'Editar Recibo' : 'Novo Recibo'} />
      <View tag="page" className="p-4">
        <h3 className="page-subtitle">Dados do Cliente</h3>
        <ClientForm
          clientData={receipt.client}
          onClientChange={(c: ReceiptClient) =>
            setReceipt({ ...receipt, client: c })
          }
          onNewClientClick={() => router.push('/clientes/novo')}
        />

        <h3 className="page-subtitle mt-6">Detalhes do Pagamento</h3>
        <div className="grid grid-cols-1 gap-4 bg-white p-4 rounded-2xl shadow-sm">
          <label className="text-xs font-bold text-slate-400 uppercase">
            Valor Recebido (R$)
          </label>
          <Input
            type="number"
            placeholder="0,00"
            value={receipt.amount}
            onChange={(e) => setReceipt({ ...receipt, amount: e.target.value })}
          />

          <label className="text-xs font-bold text-slate-400 uppercase">
            Forma de Pagamento
          </label>
          <Select
            onValueChange={(v) => setReceipt({ ...receipt, paymentMethod: v })}
            defaultValue={receipt.paymentMethod}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão de Crédito/Débito</SelectItem>
              <SelectItem value="transferencia">
                Transferência Bancária
              </SelectItem>
            </SelectContent>
          </Select>
          <label className="text-xs font-bold text-slate-400 uppercase">
            Referente a:
          </label>
          <textarea
            className="w-full p-3 border rounded-xl min-h-[100px] text-sm"
            placeholder="Ex: Pagamento parcial da instalação elétrica residencial..."
            value={receipt.description}
            onChange={(e) =>
              setReceipt({ ...receipt, description: e.target.value })
            }
          />
        </div>

        <footer className="mt-10">
          <Pressable onClick={handleSave} disabled={loading}>
            {loading ? 'SALVANDO...' : 'GERAR RECIBO'}
          </Pressable>
        </footer>
      </View>
    </>
  );
}
