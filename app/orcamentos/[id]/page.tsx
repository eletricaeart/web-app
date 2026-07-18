// app/orcamentos/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import EACard from '@/components/ui/EACard';
import AppBar from '@/components/layout/AppBar';
import FAB from '@/components/ui/FAB';
import Text from '@/components/ui/Text';
import { processTextToHtml } from '@/utils/TextPreProcessor';
import View from '@/components/layout/View';
import BudgetSkeleton from '../components/BudgetSkeleton';
import BudgetShareMenu from '@/components/orcamentos/BudgetShareMenu';
import { Pen, ShareNetwork, Trash } from '@phosphor-icons/react';
import { CID, getCleanDate } from '@/utils/helpers';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase'; // Alterado para Supabase
import { useDeleteEntity } from '@/hooks/useDeleteEntity';
import DeleteBudgetModal from '../components/DeleteBudgetModal';
import { Popover, PopoverContent } from '@/components/ui/popover';
import './Budget.css';

// --- Interfaces (Mantidas do Original) ---

interface DetailContent {
  tipo: 'brk' | 'tagc' | 't6' | 'ul' | 'html' | string;
  conteudo: any;
}

interface ItemBudget {
  subtitulo: string;
  detalhes: DetailContent[];
  price?: number;
  services?: any[];
}

interface ServiceBudget {
  titulo: string;
  itens: ItemBudget[];
}

interface BudgetData {
  id: string | number;
  accessPassword?: string;
  clientName?: string;
  documentTitle?: string;
  issueDate?: string;
  expiration?: string;
  subtitle?: string;
  services?: ServiceBudget[];
  financial?: {
    labor: number;
    materials: number;
    discount: number;
    total: number;
  };
  clientAddress?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
  };
  cliente?: {
    name: string;
    rua?: string;
    num?: string;
    bairro?: string;
    cidade?: string;
  };
  docTitle?: {
    emissao: string;
    validade: string;
    subtitle: string;
    text: string;
  };
  servicos?: ServiceBudget[];
  // Novos campos Supabase
  services_json?: any;
  financial_json?: any;
  client_id?: string;
  client_name_manual?: string;
  document_title?: string;
  issue_date?: string;
  access_password?: string;
}

export default function Budget() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  // Sincronização com Supabase
  const { data: orcamentos, save: saveOrcamento } =
    useEASyncSupabase<BudgetData>('orcamentos');
  const { data: clientes } = useEASyncSupabase<any>('clientes');

  const budgetRef = useRef<HTMLDivElement | null>(null);

  const {
    isDelOpen,
    setIsDelOpen,
    itemToDelete,
    handleDeleteRequest,
    confirmDelete,
  } = useDeleteEntity(saveOrcamento, () => router.replace('/orcamentos'));

  const searchParams = useSearchParams();
  const isPrintMode = searchParams.get('print') === 'true';

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Normalização de dados (Mantendo a estrutura do displayData fiel ao original)
  const displayData = useMemo(() => {
    if (!data) return null;

    // Busca o cliente pelo ID (Supabase) ou nome (Legacy)
    const clienteBase = clientes?.find(
      (c: any) =>
        c.id === data.client_id ||
        c.name?.trim().toLowerCase() ===
          (data.client_name_manual || data.clientName || data.cliente?.name)
            ?.trim()
            .toLowerCase(),
    );

    const ref = clienteBase || data;

    return {
      clientName:
        data.client_name_manual ||
        data.clientName ||
        data.cliente?.name ||
        (data as any)['Nome Cliente'] ||
        'Cliente',
      documentTitle:
        data.document_title ||
        data.documentTitle ||
        data.docTitle?.text ||
        (data as any)['Título Doc'] ||
        'Orçamento',
      issueDate:
        data.issue_date ||
        data.issueDate ||
        data.docTitle?.emissao ||
        (data as any)['Emissão'] ||
        '',
      expiration:
        data.expiration ||
        data.docTitle?.validade ||
        (data as any)['Validade'] ||
        '15 dias',
      subtitle:
        data.subtitle ||
        data.docTitle?.subtitle ||
        (data as any)['Subtítulo'] ||
        'PROPOSTA DE ORÇAMENTO',
      financial: data.financial_json ||
        data.financial || {
          labor: 0,
          materials: 0,
          discount: 0,
          total: 0,
        },
      services: (() => {
        const raw =
          data.services_json ||
          data.services ||
          data.servicos ||
          (data as any)['Serviços JSON'];
        if (!raw) return [];
        if (typeof raw === 'string') {
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        }
        return Array.isArray(raw) ? raw : [];
      })(),
      address: {
        street:
          ref.street ||
          ref.clientAddress?.street ||
          ref.cliente?.rua ||
          (data as any).street ||
          '',
        number:
          ref.number ||
          ref.clientAddress?.number ||
          ref.cliente?.num ||
          (data as any).number ||
          '',
        neighborhood:
          ref.neighborhood ||
          ref.clientAddress?.neighborhood ||
          ref.cliente?.bairro ||
          (data as any).neighborhood ||
          '',
        city:
          ref.city ||
          ref.clientAddress?.city ||
          ref.cliente?.cidade ||
          (data as any).city ||
          '',
        complement:
          ref.complement || ref.complemento || (data as any).complement || '',
      },
    };
  }, [data, clientes]);

  const handleEdit = () => {
    if (data) router.push(`/orcamentos/novo?natabiruta=${CID()}&id=${data.id}`);
  };

  const fabActions = [
    {
      icon: <Pen size={28} weight="duotone" />,
      label: 'Editar',
      action: handleEdit,
    },
    {
      icon: <ShareNetwork size={28} weight="duotone" />,
      label: 'Compartilhar',
      action: () => setIsShareOpen(true),
    },
    {
      icon: <Trash size={28} weight="duotone" />,
      label: 'Excluir',
      action: () => {
        if (data && displayData)
          handleDeleteRequest(data.id, displayData.documentTitle);
      },
    },
  ];

  useEffect(() => {
    if (!id || !orcamentos.length) return;
    const normalizedId = Array.isArray(id) ? id[0] : id;
    const timer = setTimeout(() => {
      const found = orcamentos.find(
        (o) => String(o.id).trim() === String(normalizedId).trim(),
      );
      if (found) setData(found);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [orcamentos, id]);

  const renderMarkdown = (itens: ItemBudget[]) => {
    return itens.map((item, idx) => {
      const markdownText = item.detalhes
        ? item.detalhes
            .map((d) => {
              if (d.tipo === 'brk') return '---';
              if (d.tipo === 'tagc') return `> ${d.conteudo}`;
              if (d.tipo === 't6') return `# ${d.conteudo}`;
              if (d.tipo === 'ul' && Array.isArray(d.conteudo))
                return d.conteudo.map((li: string) => `- ${li}`).join('\n');
              if (d.tipo === 'html') return d.conteudo;
              return d.conteudo;
            })
            .join('\n')
        : (item as any).content || '';

      const servicesTotal =
        item.services?.reduce((acc, s) => acc + s.totalValue, 0) ?? 0;
      const itemPrice = item.price || servicesTotal;

      return (
        <View key={idx} tag="subclause">
          <View tag="ui">
            <View tag="subclause-header">
              <View tag="t6">{item.subtitulo}</View>

              {itemPrice > 0 && (
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#444',
                  }}
                >
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(itemPrice)}
                </span>
              )}
            </View>

            <View
              tag="subclause-body"
              className="markdown-rendered-content"
              dangerouslySetInnerHTML={{
                __html: processTextToHtml(markdownText),
              }}
              style={{
                textAlign: 'justify',
                lineHeight: '1.5',
                fontSize: '0.95rem',
              }}
            />

            {item.services && item.services.length > 0 && (
              <View
                style={{ marginTop: '8px', fontSize: '0.85rem', color: '#444' }}
              >
                {item.services.map((s, i) => (
                  <div key={i}>
                    • {s.description} ({s.quantity}x) —{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(s.totalValue)}
                  </div>
                ))}
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <>
        <AppBar
          backAction={() => router.back()}
          options={
            <Popover>
              <PopoverContent className="w-52 p-0 bg-white shadow-xl border-none">
                <View className="flex flex-col">
                  <button
                    className="p-3 flex items-center gap-2 text-sm hover:bg-slate-50"
                    onClick={handleEdit}
                  >
                    <Pen size={18} weight="duotone" /> Editar Orçamento
                  </button>
                  <button
                    className="p-3 flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 border-t"
                    onClick={() =>
                      handleDeleteRequest(data!.id, displayData!.documentTitle)
                    }
                  >
                    <Trash size={18} weight="duotone" /> Excluir Orçamento
                  </button>
                </View>
              </PopoverContent>
            </Popover>
          }
        />
        <BudgetSkeleton />
      </>
    );
  }

  if (!data || !displayData) {
    return (
      <>
        <AppBar backAction={() => router.back()} />
        <div className="p-10 text-center">Orçamento não encontrado.</div>
      </>
    );
  }

  const fullAddress =
    [
      displayData.address.street,
      displayData.address.number ? `nº ${displayData.address.number}` : null,
      displayData.address.complement,
      displayData.address.neighborhood,
      displayData.address.city,
    ]
      .filter((val) => val && String(val).trim() !== '')
      .join(', ') || 'Endereço não informado';

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print { ul, li { list-style-type: disc !important; display: list-item !important; } }
        [tag="subclause-body"] ul { list-style-type: none !important; margin-top: 8px !important; margin-bottom: 8px !important; }
        [tag="subclause-body"] li { display: block !important; position: relative !important; padding-left: 1.5rem !important; margin-bottom: 4px !important; }
        [tag="subclause-body"] li::before { content: "•" !important; position: absolute !important; left: 0.5rem !important; color: #00559c !important; font-weight: bold !important; }
        tagc, .tagc, blockquote { display: block; padding: 10px 14px; background: #e8f1ff; color: #0075bd; border-radius: 12px; margin: 8px 0; border-left: 4px solid #27f; }
        @media print { ul { list-style-type: none !important; } li { list-style-type: disc !important; display: list-item !important; } }
      `,
        }}
      />
      {!isPrintMode && <AppBar backAction={() => router.back()} />}

      <BudgetShareMenu
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        budgetRef={budgetRef}
        data={data}
        clientName={displayData.clientName}
        budgetTitle={displayData.documentTitle}
      />

      <View tag="pageContainer">
        <View tag="budget-page" ref={budgetRef}>
          <View tag="page-header">
            <EACard />
            <View tag="doc-id">
              <span>
                <b>Data de Emissão:</b>
                <View tag="issue-date">
                  {getCleanDate(displayData.issueDate)}
                </View>
              </span>
              <span>
                <b>Validade da Proposta:</b>{' '}
                <View tag="t">{displayData.expiration}</View>
              </span>
            </View>
          </View>

          <View tag="doc-title">
            <View tag="doc-title_layout">
              <View tag="doc-title_type">
                <Text
                  size="1.2rem"
                  color="var(--sv-sombra-azuljnk, #fff)"
                  shadow="var(--sv-sodalita, #00559c)"
                  font='font-family: "inter", "Roboto", sans-serif'
                >
                  {displayData.subtitle}
                </Text>
              </View>
              <View tag="doc-title_title">{displayData.documentTitle}</View>
            </View>
          </View>

          <View tag="cliente-section">
            <View tag="ui">
              <header>
                <View tag="ui">
                  <View tag="t">CLIENTE</View>
                </View>
              </header>
              <View tag="content">
                <View tag="card">
                  <View tag="ui">
                    <View tag="t">
                      <b>Nome:</b> {displayData.clientName}
                    </View>
                    <View tag="t">
                      <b>Endereço:</b> {fullAddress}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View tag="budget-body">
            {displayData.services.map((servico: any, index: number) => (
              <View key={index} tag="clause">
                <View tag="ui">
                  <View tag="clause-header">
                    <View tag="ui">
                      <View tag="t">
                        {index + 1}. {servico.titulo}
                      </View>
                    </View>
                  </View>
                  <View tag="clause-content">
                    {renderMarkdown(servico.itens || servico.items || [])}
                  </View>
                </View>
              </View>
            ))}

            <FooterContent
              budgetId={String(data.id)}
              password={data.access_password || data.accessPassword}
            />
          </View>
        </View>
      </View>

      {!isPrintMode && <FAB actions={fabActions} hasBottomNav={false} />}

      <DeleteBudgetModal
        isOpen={isDelOpen}
        onOpenChange={setIsDelOpen}
        budget={
          itemToDelete
            ? {
                id: itemToDelete.id,
                documentTitle: itemToDelete.name,
                clientName: displayData?.clientName || 'Cliente',
              }
            : null
        }
        onConfirm={confirmDelete}
      />
    </>
  );
}

function FooterContent({
  budgetId,
  password,
}: {
  budgetId: string;
  password?: string;
}) {
  const [baseUrl, setBaseUrl] = useState('');
  const viewUrl = `${baseUrl}/validar/${budgetId}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  return (
    <View tag="footer-content">
      <View className="avoid" tag="footer-content_top">
        <View tag="content">
          <View tag="t6">Compromisso Elétrica&Art:</View>
          <p>
            Unir técnica, estética, precisão e responsabilidade para entregar um
            resultado impecável, durável e superior.
          </p>
          <View tag="tagb">
            <p>
              Agradecemos a oportunidade de apresentar esta proposta e estamos à
              disposição para quaisquer esclarecimentos adicionais.
            </p>
          </View>
        </View>
        <View tag="footer-content_bottom">
          <View tag="ui">
            <header>
              <View tag="ui">
                <View tag="t">Assinatura e Aprovação</View>
              </View>
            </header>
            <View tag="content">
              <View tag="signatures">
                <View tag="signature">
                  <View tag="content">
                    <View tag="sig-name">Rafael - Elétrica&Art</View>
                  </View>
                </View>
                <View tag="signature">
                  <View tag="content">
                    <View tag="sig-name">Assinatura do Cliente</View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {password && (
            <div
              className={`flex flex-1 items-center justify-center pt-[4rem]`}
            >
              <View
                tag="holder"
                className="flex items-center justify-center gap-8 bg-olive-300 border-[1px] border-slate-300 rounded-[12px] p-4"
              >
                <View
                  tag="qrcode"
                  className={`flex flex-col items-center justify-center bg-white text-[#00559c] p-2 rounded-sm`}
                >
                  {baseUrl ? (
                    <QRCodeSVG
                      value={viewUrl}
                      size={100}
                      level={'H'}
                      includeMargin={false}
                      imageSettings={{
                        src: '/pix/file.svg',
                        height: 40,
                        width: 40,
                        excavate: false,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        background: '#f5f5f5',
                      }}
                    />
                  )}
                </View>
                <p className="text-[12px] text-olive-600">
                  Para visualizar este documento original em nosso sistema,
                  aponte a câmera do seu celular para o QR Code ao lado ou
                  acesse{' '}
                  <b>
                    {`https://${baseUrl.replace(/^https?:\/\//, '')}/validar/${budgetId}`}
                  </b>{' '}
                  e informe a senha:{' '}
                  <span className="font-[800] text-[16px]">
                    {password || '----'}
                  </span>
                </p>
              </View>
            </div>
          )}
        </View>
      </View>
    </View>
  );
}
