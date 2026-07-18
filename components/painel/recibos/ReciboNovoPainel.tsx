// components/painel/recibos/ReciboNovoPainel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
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
import { toast } from 'sonner';

interface ReceiptClient {
  id?: string; // Adicionado para vínculo no Supabase
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
  client: ReceiptClient;
}

export default function ReciboNovoPainel() {
  const router = usePainelRouter();
  const editId = router.params.id;

  const { data: allReceipts, save: saveReceipt } =
    useEASyncSupabase<any>('recibos');
  const { data: clientsCache } = useEASyncSupabase<any>('clientes');

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

  // Lógica para carregar dados em caso de edição
  useEffect(() => {
    if (editId && allReceipts.length > 0) {
      const found = allReceipts.find(
        (r: any) => String(r.id) === String(editId),
      );
      if (found) {
        setReceipt({
          id: found.id,
          receiptNumber: found.receipt_number || found.receiptNumber,
          amount: String(found.amount),
          paymentMethod: found.payment_method || found.paymentMethod,
          description: found.description,
          issueDate: found.issue_date || found.issueDate,
          client: {
            id: found.client_id,
            name: found.client_name_manual || found.clientName || '',
          },
        });
      }
    }
  }, [editId, allReceipts]);

  const handleSave = async () => {
    const isUUID = (val: any) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        val,
      );

    const rawAmount = String(receipt.amount).replace(',', '.');
    const amountVal = parseFloat(rawAmount);

    if (!receipt.client.name)
      return toast.error('O nome do cliente é obrigatório');
    if (isNaN(amountVal)) return toast.error('O valor do recibo é inválido');

    setLoading(true);

    const payload: any = {
      client_name_manual: receipt.client.name,
      receipt_number: String(receipt.receiptNumber),
      amount: amountVal,
      payment_method: receipt.paymentMethod,
      description: receipt.description || null,
      issue_date: receipt.issueDate || new Date().toISOString().split('T')[0],
    };

    payload.client_id = isUUID(receipt.client.id) ? receipt.client.id : null;

    if (editId && isUUID(editId)) {
      payload.id = editId;
    }

    const action = editId ? 'update' : 'create';

    try {
      // Chamamos o save. Se ele não disparar um erro (throw), consideramos sucesso.
      const res = await saveReceipt(payload, action);

      if (res) {
        // SUCESSO: O Hook já mostrou o Toast. Nós apenas limpamos e saímos.
        router.replace('recibos');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      // Opcional: toast.error("Falha ao salvar");
    } finally {
      // IMPORTANTE: Se deu certo, o redirecionamento tira o usuário daqui.
      // Se deu erro, o loading para e ele pode tentar de novo.
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar
        title={editId ? 'Editar Recibo' : 'Novo Recibo'}
        backAction={() => router.back()}
      />
      <View tag="page" className="p-4">
        <h3 className="page-subtitle">Dados do Cliente</h3>
        <ClientForm
          clientData={receipt.client}
          clientsCache={clientsCache} // Passando o cache para o autocomplete
          onClientChange={(c: ReceiptClient) =>
            setReceipt({ ...receipt, client: c })
          }
          onNewClientClick={() => router.push('clientes.novo')}
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
            value={receipt.paymentMethod}
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
            {loading
              ? 'SALVANDO...'
              : editId
                ? 'ATUALIZAR RECIBO'
                : 'GERAR RECIBO'}
          </Pressable>
        </footer>
      </View>
    </>
  );
}
