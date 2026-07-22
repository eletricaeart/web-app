// components/painel/clientes/ClientePerfilPainel.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import AppBar from '@/components/layout/AppBar';
import View from '@/components/layout/View';
import ClientGhostAvatar from './ClientGhostAvatar';
import {
  Pen,
  Trash,
  FilePlus,
  WhatsappLogo,
  EnvelopeSimple,
  MapPin,
  DotsThreeOutlineVertical,
  Notebook,
  IdentificationCard,
  FileText,
  Note,
  Phone,
  Wallet,
  Receipt,
  ChartLineUp,
  Clock,
  CalendarPlus,
} from '@phosphor-icons/react';
import { Mask } from '@/utils/mask';
import { getNameGradient } from '@/lib/avatarColor';
import { toast } from 'sonner';

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import '../clientes/clientesIDStyle.css';
import Link from 'next/link';
import DeleteClientModal from './DeleteClientModal';
import { useDeleteEntity } from '@/hooks/useDeleteEntity';

interface Cliente {
  id: string;
  name: string;
  photo_url?: string;
  photo?: string;
  gender?: string;
  city?: string;
  whatsapp?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  zip?: string;
  cidade?: string;
  rua?: string;
  num?: string;
  bairro?: string;
  created_at?: string;
}

interface Orcamento {
  id: string;
  client_id?: string;
  client_name_manual?: string;
  document_title?: string;
  issue_date?: string;
  clientName?: string;
  documentTitle?: string;
  docTitle?: { text: string; emissao: string | Date };
  issueDate?: string;
  financial_json?: { total?: number };
  financial?: { total?: number };
}

interface Nota {
  id: string;
  client_id: string;
  date: string;
  title: string;
}

type Tab_ = 'infos' | 'budgets' | 'notes';

const CLOUD = {
  name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatShortDate(value: Date | null) {
  if (!value) return '—';
  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ClientePerfilPainel() {
  const router = usePainelRouter();
  const clientId = router.params.id;

  const { data: clients, save: saveClient } =
    useEASyncSupabase<Cliente>('clientes');
  const { data: orcamentos } = useEASyncSupabase<Orcamento>('orcamentos');
  const { data: notes } = useEASyncSupabase<Nota>('notas');

  const [client, setClient] = useState<Cliente | null>(null);
  const [activeTab, setActiveTab] = useState<Tab_>('infos');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveClient, () => router.replace('clientes'));

  useEffect(() => {
    if (clientId && clients.length > 0) {
      const found = clients.find((c) => String(c.id) === String(clientId));
      if (found) setClient(found);
    }
  }, [clientId, clients]);

  const historicoOrcamentos = useMemo(() => {
    if (!client) return [];
    return orcamentos.filter((o) => {
      const matchesId = o.client_id === client.id;
      const currentName = (client.name || '').toLowerCase();
      const matchesName =
        (o.client_name_manual || o.clientName || '').toLowerCase() ===
        currentName;
      return matchesId || matchesName;
    });
  }, [orcamentos, client]);

  const historicoNotas = useMemo(() => {
    if (!client) return [];
    return notes.filter((n) => String(n.client_id) === String(client.id));
  }, [notes, client]);

  const stats = useMemo(() => {
    const totalOrcamentos = historicoOrcamentos.length;
    const totalInvestido = historicoOrcamentos.reduce(
      (acc, o) =>
        acc + Number(o.financial_json?.total ?? o.financial?.total ?? 0),
      0,
    );
    const ticketMedio =
      totalOrcamentos > 0 ? totalInvestido / totalOrcamentos : 0;

    const allDates = [
      ...historicoOrcamentos.map((o) => o.issue_date || o.issueDate),
      ...historicoNotas.map((n) => n.date),
    ]
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime())
      .filter((t) => !isNaN(t));

    const ultimaInteracao = allDates.length
      ? new Date(Math.max(...allDates))
      : null;

    const clienteDesde = client?.created_at
      ? new Date(client.created_at)
      : null;

    return {
      totalOrcamentos,
      totalInvestido,
      ticketMedio,
      ultimaInteracao,
      clienteDesde,
    };
  }, [historicoOrcamentos, historicoNotas, client]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;

    if (!CLOUD.name || !CLOUD.preset) {
      toast.error('Upload de imagem não configurado.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 4MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUD.preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD.name}/image/upload`,
        { method: 'POST', body: formData },
      );
      const data = await res.json();

      if (data.secure_url) {
        await saveClient(
          { id: client.id, photo_url: data.secure_url },
          'update',
        );
        setClient({ ...client, photo_url: data.secure_url });
        toast.success('Foto atualizada!');
      }
    } catch {
      toast.error('Erro ao subir imagem');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!client)
    return (
      <View tag="page" className="p-10 text-center">
        Carregando perfil...
      </View>
    );

  const clientAvatar = client.photo_url || client.photo;
  const coverGradient = getNameGradient(client.name);

  return (
    <>
      <AppBar
        title=" "
        backAction={() => router.push('clientes')}
        transparent={true}
        options={
          <Popover>
            <PopoverTrigger asChild>
              <button
                style={{ background: 'none', border: 'none', color: 'white' }}
              >
                <DotsThreeOutlineVertical size={26} weight="bold" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-52 p-0 bg-white shadow-xl border-none z-[10000] overflow-hidden"
              align="end"
            >
              <View className="flex flex-col">
                {[
                  {
                    label: ' Editar Perfil',
                    icon: <Pen size={20} color="#29f" weight="duotone" />,
                    option: () =>
                      router.push('clientes.novo', { id: client.id }),
                  },
                  {
                    label: 'Novo Orçamento',
                    icon: <FilePlus size={20} color="#29f" weight="duotone" />,
                    option: () =>
                      router.push('orcamentos.novo', { clienteId: client.id }),
                  },
                  {
                    label: 'Nova Nota Técnica',
                    icon: <Notebook size={20} color="#29f" weight="duotone" />,
                    option: () =>
                      router.push('notas.novo', { clienteId: client.id }),
                  },
                  {
                    label: 'Excluir Cliente',
                    icon: <Trash size={20} color="#932" weight="duotone" />,
                    className:
                      'menu-item-pop w-full p-2 flex items-center cursor-pointer text-red-500 border-t border-slate-300 bg-red-100',
                    option: () => handleDeleteRequest(client.id, client.name),
                  },
                ].map((O, i) => (
                  <View
                    key={i}
                    tag="appbar-btn"
                    className={
                      O.className ||
                      'menu-item-pop w-full p-2 flex items-center cursor-pointer'
                    }
                    onClick={O.option}
                  >
                    <span className="w-full flex p-2 items-center gap-4">
                      {O.icon} {O.label}
                    </span>
                  </View>
                ))}
              </View>
            </PopoverContent>
          </Popover>
        }
      />

      <View
        tag="client-page"
        className="client-perfil-page absolute top-0 w-full bg-slate-50 min-h-[95dvh] pb-40"
      >
        {/* --- CAPA (gradiente único por cliente) --- */}
        <View
          tag="avatar-section"
          className="relative min-h-[190px] text-white"
          style={{ background: coverGradient }}
        >
          <View
            tag="client-links"
            className="absolute bottom-4 left-0 z-20 w-full pt-0 pb-[2rem] px-6"
          >
            <View
              tag="contact-shortcuts"
              className="flex items-center justify-end w-full gap-3"
            >
              <Link
                href={`https://wa.me/${client.whatsapp}`}
                target="_blank"
                className="bg-white/95 p-3 rounded-full shadow-lg backdrop-blur"
              >
                <WhatsappLogo
                  size={20}
                  weight="duotone"
                  className="text-green-500"
                />
              </Link>
              <Link
                href={`tel:${client.whatsapp}`}
                className="bg-white/95 p-3 rounded-full shadow-lg backdrop-blur"
              >
                <Phone size={20} weight="duotone" className="text-gray-800" />
              </Link>
              <Link
                href={`mailto:${client.email}`}
                className="bg-white/95 p-3 rounded-full shadow-lg backdrop-blur"
              >
                <EnvelopeSimple
                  size={20}
                  weight="duotone"
                  className="text-blue-500"
                />
              </Link>
            </View>
          </View>
        </View>

        {/* --- AVATAR SOBREPOSTO + NOME --- */}
        <View
          tag="avatar-section-bottom"
          className="flex relative w-full h-24 mt-[-2rem] bg-slate-50 rounded-[2rem_2rem_0_0]"
        >
          <View className="flex w-full px-4 absolute top-[-40%] gap-4 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <View className="z-30">
              <ClientGhostAvatar
                name={client.name}
                gender={client.gender}
                photoUrl={clientAvatar}
                size={96}
                onUploadClick={() => fileInputRef.current?.click()}
                uploading={uploadingPhoto}
              />
            </View>
            <View className="flex flex-col w-full h-24 justify-end flex-1 pb-0 min-w-0">
              <h3 className="text-2xl text-slate-900 capitalize font-bold line-clamp-1 truncate">
                {client.name}
              </h3>
              <p className="opacity-80 text-sm text-slate-400 capitalize font-bold line-clamp-1 truncate">
                {client.city || client.cidade || 'Cidade não informada'}
              </p>
            </View>
          </View>
        </View>

        {/* --- ESTATÍSTICAS PREMIUM --- */}
        <View className="px-4 mt-3 mb-2">
          <View className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Wallet size={18} weight="duotone" />}
              label="Total investido"
              value={formatCurrency(stats.totalInvestido)}
              accent="emerald"
            />
            <StatCard
              icon={<Receipt size={18} weight="duotone" />}
              label="Orçamentos"
              value={String(stats.totalOrcamentos)}
              accent="indigo"
            />
            <StatCard
              icon={<ChartLineUp size={18} weight="duotone" />}
              label="Ticket médio"
              value={formatCurrency(stats.ticketMedio)}
              accent="amber"
            />
            <StatCard
              icon={<Clock size={18} weight="duotone" />}
              label="Última interação"
              value={formatShortDate(stats.ultimaInteracao)}
              accent="sky"
            />
          </View>

          {stats.clienteDesde && (
            <View className="flex items-center gap-2 mt-3 text-xs text-slate-400 font-medium px-1">
              <CalendarPlus size={14} weight="bold" />
              Cliente desde {formatShortDate(stats.clienteDesde)}
            </View>
          )}
        </View>

        {/* --- ABAS --- */}
        <View className="grid grid-cols-3 text-sm bg-[#e5e5e5] rounded-[1rem_1rem_0_0] px-3 pt-3 pb-[1rem] mt-4">
          {(['infos', 'budgets', 'notes'] as Tab_[]).map((t) => (
            <View
              key={t}
              className="grid place-items-center p-2 rounded-[.7rem_.7rem_0_0] transition-colors"
              style={{
                background: activeTab === t ? '#fff' : '#f5f5f5',
                color: activeTab === t ? '#666' : '#999',
                fontWeight: activeTab === t ? 'bold' : '600',
              }}
              onClick={() => setActiveTab(t)}
            >
              {t === 'infos'
                ? 'Informações'
                : t === 'budgets'
                  ? 'Orçamentos'
                  : 'Notas'}
            </View>
          ))}
        </View>

        <View className="flex flex-col gap-4 mt-[-1rem] rounded-[1rem_1rem_0_0] overflow-hidden">
          {activeTab === 'infos' && (
            <InfoSection
              title="Dados do contato"
              icon={<IdentificationCard size={18} weight="duotone" />}
            >
              <InfoItem
                icon={
                  <WhatsappLogo
                    size={25}
                    weight="duotone"
                    className="text-green-500"
                  />
                }
                txt={Mask.phone(client.whatsapp || '')}
                fallTxt="Não informado"
              />
              <InfoItem
                icon={
                  <EnvelopeSimple
                    size={25}
                    weight="duotone"
                    className="text-blue-500"
                  />
                }
                txt={client.email}
              />
              <InfoItem
                icon={
                  <MapPin size={25} weight="duotone" className="text-red-500" />
                }
                txt={`${client.street || client.rua || ''}, ${client.number || client.num || ''} - ${client.neighborhood || client.bairro || ''}`}
              />
            </InfoSection>
          )}

          {activeTab === 'budgets' && (
            <InfoSection
              title="Orçamentos"
              icon={<FileText size={18} weight="duotone" />}
            >
              {historicoOrcamentos.length > 0 ? (
                historicoOrcamentos.map((orc) => {
                  const total = Number(
                    orc.financial_json?.total ?? orc.financial?.total ?? 0,
                  );
                  return (
                    <View
                      key={orc.id}
                      className="py-3 border-b last:border-0 cursor-pointer flex items-center justify-between"
                      onClick={() =>
                        router.push('orcamentos.ver', { id: orc.id })
                      }
                    >
                      <View>
                        <p className="text-xs text-gray-400">
                          {orc.issue_date ||
                            orc.issueDate ||
                            (orc as any).docTitle?.emissao ||
                            'Data não informada'}
                        </p>
                        <p className="text-gray-600 font-medium">
                          {orc.document_title ||
                            orc.documentTitle ||
                            orc.docTitle?.text}
                        </p>
                      </View>
                      {total > 0 && (
                        <span className="text-sm font-bold text-emerald-600">
                          {formatCurrency(total)}
                        </span>
                      )}
                    </View>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm">
                  Nenhum orçamento encontrado.
                </p>
              )}
            </InfoSection>
          )}

          {activeTab === 'notes' && (
            <InfoSection
              title="Notas técnicas"
              icon={<Note size={18} weight="duotone" />}
            >
              {historicoNotas.length > 0 ? (
                historicoNotas.map((n) => (
                  <View
                    key={n.id}
                    className="py-3 border-b last:border-0 cursor-pointer"
                    onClick={() => router.push('notas.ver', { id: n.id })}
                  >
                    <p className="text-xs text-gray-400">
                      {new Date(n.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-gray-600 font-medium">{n.title}</p>
                  </View>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Nenhuma nota vinculada.</p>
              )}
            </InfoSection>
          )}
        </View>
      </View>

      <DeleteClientModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        client={itemToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}

/* --- Componentes auxiliares --- */

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'emerald' | 'indigo' | 'amber' | 'sky';
}) {
  const accentMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <View className={`w-fit p-2 rounded-xl mb-2 ${accentMap[accent]}`}>
        {icon}
      </View>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-black text-slate-800 mt-0.5 truncate">
        {value}
      </p>
    </View>
  );
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="flex flex-col px-6 py-4 bg-white shadow-sm">
      <span className="flex items-center gap-2 pb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
        {icon} {title}
      </span>
      <View className="flex flex-col w-full">{children}</View>
    </View>
  );
}

function InfoItem({
  icon,
  txt,
  fallTxt,
}: {
  icon: React.ReactNode;
  txt?: string;
  fallTxt?: string;
}) {
  if (!txt && !fallTxt) return null;
  return (
    <View className="flex items-center gap-3 py-2">
      <View className="bg-green-50 p-2 rounded-xl">{icon}</View>
      <View className="text-gray-600">{txt || fallTxt}</View>
    </View>
  );
}
