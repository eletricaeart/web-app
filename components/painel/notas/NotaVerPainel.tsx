// components/painel/notas/NotaVerPainel.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import FAB from '@/components/ui/FAB';
import ClientGhostAvatar from '@/components/painel/clientes/ClientGhostAvatar';
import { getNotaStatus, NOTA_STATUS_STYLES } from '@/lib/notaMeta';
import { Pen, Star, CalendarBlank, MapPin } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface NotaTecnica {
  id: string;
  title: string;
  content?: string;
  date?: string;
  client_id?: string;
  client_name_manual?: string;
  is_important?: boolean;
  status?: string;
  photos?: string[];
}

interface Cliente {
  id: string;
  name: string;
  gender?: string;
  photo?: string;
  city?: string;
  neighborhood?: string;
}

export default function NotaVerPainel() {
  const router = usePainelRouter();
  const id = router.params.id;

  const { data: notes, save: saveNota } =
    useEASyncSupabase<NotaTecnica>('notas');
  const { data: clients } = useEASyncSupabase<Cliente>('clientes');

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const nota = notes.find((n) => String(n.id) === String(id));
  const client = useMemo(
    () => clients.find((c) => c.id === nota?.client_id),
    [clients, nota],
  );

  if (!nota) {
    return (
      <>
        <AppBar backAction={() => router.push('notas')} />
        <View tag="page" className="p-10 text-center text-slate-400">
          Nota não encontrada.
        </View>
      </>
    );
  }

  const status = getNotaStatus(nota.status);
  const formattedDate = nota.date
    ? new Date(nota.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const cycleStatus = async () => {
    const order = ['pending', 'follow_up', 'resolved'];
    const currentIndex = order.indexOf(nota.status || 'pending');
    const next = order[(currentIndex + 1) % order.length];

    await saveNota({ id: nota.id, status: next }, 'update');
    toast.success(`Status atualizado: ${getNotaStatus(next).label}`);
  };

  return (
    <>
      <AppBar
        title="Nota Técnica"
        backAction={() => router.push('notas')}
        options={
          <View
            tag="appbar-btn"
            onClick={() => toast.info('Edição completa da nota em breve.')}
          >
            <Pen size={22} color="white" weight="bold" />
          </View>
        }
      />

      <View tag="page" className="bg-slate-50 min-h-screen pb-32">
        <View className="p-4">
          {/* --- CABEÇALHO: CLIENTE + STATUS --- */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <ClientGhostAvatar
                name={client?.name || nota.client_name_manual || 'Cliente'}
                gender={client?.gender}
                photoUrl={client?.photo}
                size={52}
                showGenderBadge={false}
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 truncate">
                  {client?.name || nota.client_name_manual || 'Cliente'}
                </h2>
                {(client?.city || client?.neighborhood) && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                    <MapPin size={12} weight="fill" />
                    {client.neighborhood} {client.city}
                  </p>
                )}
              </div>
              {nota.is_important && (
                <Star
                  size={20}
                  weight="fill"
                  className="text-amber-500 shrink-0"
                />
              )}
            </div>

            <button
              type="button"
              onClick={cycleStatus}
              className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border inline-flex items-center gap-1 active:scale-95 transition-transform ${NOTA_STATUS_STYLES[status.color]}`}
            >
              {status.label}
            </button>
          </View>

          {/* --- TIMELINE DA VISITA --- */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
            <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <CalendarBlank size={16} weight="duotone" />
              {formattedDate}
            </div>
            <h1 className="text-lg font-black text-slate-900 mb-3">
              {nota.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {nota.content || 'Sem descrição detalhada.'}
            </p>
          </View>

          {/* --- FOTOS --- */}
          {nota.photos && nota.photos.length > 0 && (
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-3">
                Registro Fotográfico
              </div>
              <div className="grid grid-cols-3 gap-2">
                {nota.photos.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setLightboxUrl(url)}
                    className="relative aspect-square rounded-xl overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt="Foto do serviço"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </View>
          )}
        </View>
      </View>

      {/* --- LIGHTBOX SIMPLES --- */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-6"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative w-full max-w-lg aspect-square">
            <Image
              src={lightboxUrl}
              alt="Foto ampliada"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <FAB
        actions={[
          {
            icon: <Pen size={24} weight="duotone" />,
            label: 'Editar Nota',
            action: () => toast.info('Edição completa da nota em breve.'),
          },
        ]}
        hasBottomNav={false}
      />
    </>
  );
}
