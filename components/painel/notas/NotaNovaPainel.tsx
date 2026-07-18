// components/painel/notas/NotaNovaPainel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import { FloppyDisk, CircleNotch, Star } from '@phosphor-icons/react';
import { toast } from 'sonner';
import ClientForm from '@/components/forms/ClientForm';

import '../../../app/clientes/Clientes.css';

// Interfaces Atualizadas
interface Cliente {
  id: string;
  name: string;
  zip?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
}

interface NotaFormData {
  id: string;
  title: string;
  content: string;
  date: string;
  client_id: string; // Atualizado para snake_case
  clientName: string;
  is_important: boolean; // Atualizado para snake_case
}

export default function NotaNovaPainel() {
  const router = usePainelRouter();
  const clientIdParam = router.params.clienteId;

  const { data: clients } = useEASyncSupabase<Cliente>('clientes');
  const { save: saveNota } = useEASyncSupabase('notas');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NotaFormData>({
    id: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    clientName: '',
    is_important: false,
  });

  // Preenchimento automático se vier clientId via URL
  useEffect(() => {
    if (clientIdParam && clients.length > 0) {
      const target = clients.find(
        (c) => String(c.id) === String(clientIdParam),
      );
      if (target) {
        setFormData((prev) => ({
          ...prev,
          client_id: target.id,
          clientName: target.name,
        }));
      }
    }
  }, [clientIdParam, clients]);

  const handleSave = async () => {
    // Validação mantida
    if (!formData.title || !formData.client_id) {
      return toast.error('Preencha o título e selecione um cliente');
    }

    setLoading(true);

    // Mapeamento para o Supabase (owner_id é inserido pelo hook automaticamente)
    const payload = {
      title: formData.title,
      content: formData.content,
      date: formData.date,
      client_id: formData.client_id,
      is_important: formData.is_important,
    };

    const res = await saveNota(payload, 'create');

    if (res) {
      toast.success('Nota técnica salva!');
      router.replace('notas');
    }
    setLoading(false);
  };

  return (
    <>
      <AppBar title="Nova Nota Técnica" backAction={() => router.back()} />

      <View tag="page" className="add-client-page">
        <View tag="page-content" className="p-4">
          {/* SELETOR DE CLIENTE */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">VINCULAR CLIENTE</View>
            <View tag="card-ea-body">
              <ClientForm
                clientData={{
                  name: formData.clientName,
                  zip: '',
                  street: '',
                  number: '',
                  neighborhood: '',
                  city: '',
                  complement: '',
                  obs: '',
                }}
                clientsCache={clients}
                onClientChange={(client: any) => {
                  // Busca o ID no cache do Supabase
                  const fullClient = clients.find(
                    (c) => c.name === client.name,
                  );
                  setFormData((prev) => ({
                    ...prev,
                    client_id: fullClient?.id || prev.client_id,
                    clientName: client.name || '',
                  }));
                }}
                onNewClientClick={() => router.push('clientes.novo')}
              />
            </View>
          </View>

          {/* DADOS DA NOTA */}
          <View tag="card-ea-client">
            <View tag="card-ea-header">RELATO TÉCNICO</View>
            <View tag="card-ea-body" className="flex flex-col gap-4">
              <label>
                Título da Nota
                <input
                  className="input"
                  placeholder="Ex: Manutenção Quadro Geral"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </label>

              <label>
                Data da Visita
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </label>

              <label>
                Descrição Detalhada
                <textarea
                  className="input h-32 p-2"
                  placeholder="Descreva os serviços executados..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </label>
            </View>
          </View>

          {/* CONFIGURAÇÕES ADICIONAIS */}
          <View tag="card-ea-client">
            <View tag="card-ea-body">
              <label className="flex items-center justify-between cursor-pointer p-2">
                <div className="flex items-center gap-3">
                  <Star
                    size={24}
                    weight={formData.is_important ? 'fill' : 'regular'}
                    className={
                      formData.is_important
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }
                  />
                  <span className="font-bold text-slate-700">
                    Marcar como Importante
                  </span>
                </div>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md accent-indigo-600"
                  checked={formData.is_important}
                  onChange={(e) =>
                    setFormData({ ...formData, is_important: e.target.checked })
                  }
                />
              </label>
            </View>
          </View>
        </View>

        <footer className="footer-btn p-6">
          <button
            className="btn-save w-full flex justify-center items-center gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <FloppyDisk size={24} />
            )}
            {loading ? 'SALVANDO...' : 'FINALIZAR NOTA'}
          </button>
        </footer>
      </View>
    </>
  );
}
