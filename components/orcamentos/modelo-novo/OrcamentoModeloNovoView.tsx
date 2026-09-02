// components/orcamentos/modelo-novo/OrcamentoModeloNovoView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import EACardNovo from './EACardNovo';
import Text from '@/components/ui/Text';
import View from '@/components/layout/View';
import { processTextToHtml } from '@/utils/TextPreProcessor';
import { formatCurrency } from '@/lib/types/investment';
import { getCleanDate } from '@/utils/helpers';
import './OrcamentoModeloNovo.css';
import './OrcamentoPreviaPdf.css';

export interface OrcamentoModeloNovoProps {
  data: any;
  displayData: {
    clientName: string;
    documentTitle: string;
    issueDate: string;
    expiration: string;
    subtitle: string;
    services: any[];
    address: {
      street?: string;
      number?: string;
      neighborhood?: string;
      city?: string;
      complement?: string;
    };
    [key: string]: any;
  };
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isPrintMode?: boolean;
}

export default function OrcamentoModeloNovoView({
  data,
  displayData,
  containerRef,
  isPrintMode = false,
}: OrcamentoModeloNovoProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const budgetId = String(data?.id || '');
  const password = data?.access_password || data?.accessPassword;
  const viewUrl = `${baseUrl}/validar/${budgetId}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  const fullAddress =
    [
      displayData.address?.street,
      displayData.address?.number ? `nº ${displayData.address.number}` : null,
      displayData.address?.complement,
      displayData.address?.neighborhood,
      displayData.address?.city,
    ]
      .filter((val) => val && String(val).trim() !== '')
      .join(', ') || 'Endereço não informado';

  const renderMarkdown = (itens: any[], clauseNumber: number) => {
    let subCounter = 0;
    return itens.map((item, idx) => {
      const markdownText = item.detalhes
        ? item.detalhes
            .map((d: any) => {
              if (d.tipo === 'brk') return '---';
              if (d.tipo === 'tagc') return `> ${d.conteudo}`;
              if (d.tipo === 't6') return `# ${d.conteudo}`;
              if (d.tipo === 'ul' && Array.isArray(d.conteudo))
                return d.conteudo.map((li: string) => `- ${li}`).join('\n');
              if (d.tipo === 'ol' && Array.isArray(d.conteudo))
                return d.conteudo
                  .map((li: string, i: number) => `${i + 1}. ${li}`)
                  .join('\n');
              if (d.tipo === 'html') return d.conteudo;
              return d.conteudo;
            })
            .join('\n')
        : (item as any).content || '';

      const servicesTotal =
        item.services?.reduce((acc: number, s: any) => acc + s.totalValue, 0) ??
        0;
      const itemPrice = item.price || servicesTotal;

      let displaySubtitulo = item.subtitulo;
      if ((item as any).numbered) {
        subCounter += 1;
        displaySubtitulo = `${clauseNumber}.${subCounter} ${item.subtitulo}`;
      }

      return (
        <View key={idx} tag="subclause">
          <View tag="ui">
            <View tag="subclause-header">
              <View tag="t6">{displaySubtitulo}</View>
              {itemPrice > 0 && (
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#444',
                  }}
                >
                  {formatCurrency(itemPrice)}
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
                lineHeight: '1.55',
                fontSize: '0.95rem',
              }}
            />

            {item.services && item.services.length > 0 && (
              <View
                style={{ marginTop: '8px', fontSize: '0.85rem', color: '#444' }}
              >
                {item.services.map((s: any, i: number) => (
                  <div key={i}>
                    • {s.description} ({s.quantity}x) —{' '}
                    {formatCurrency(s.totalValue)}
                  </div>
                ))}
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`ea-modelo-novo-root ${isPrintMode ? 'is-print-mode is-print-preview' : ''}`}
      id="orcamento-modelo-novo-container"
    >
      {/* 1. Cabeçalho com EACardNovo e Doc ID */}
      <View tag="page-header">
        <EACardNovo />
        <View tag="doc-id">
          <span>
            <b>Data de Emissão:</b>
            <View tag="issue-date">{getCleanDate(displayData.issueDate)}</View>
          </span>
          <span>
            <b>Validade da Proposta:</b>{' '}
            <View tag="t">{displayData.expiration}</View>
          </span>
        </View>
      </View>

      {/* 2. Título da Proposta */}
      <View tag="doc-title">
        <View tag="doc-title_layout">
          <View tag="doc-title_type">
            <Text
              size="1.2rem"
              color="var(--ea-sv-sombra-azul, #00559c)"
              shadow="var(--ea-sv-sodalita, #00559c)"
              font='font-family: "inter", "Roboto", sans-serif'
            >
              {displayData.subtitle}
            </Text>
          </View>
          <View tag="doc-title_title">{displayData.documentTitle}</View>
        </View>
      </View>

      {/* 3. Seção do Cliente */}
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

      {/* 4. Corpo com Cláusulas e Escopos */}
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
                {renderMarkdown(
                  servico.itens || servico.items || [],
                  index + 1,
                )}
              </View>
            </View>
          </View>
        ))}

        {/* 5. Rodapé com Compromisso e Assinaturas */}
        <View tag="footer-content">
          <View className="avoid-page-break" tag="footer-content_top">
            <View tag="content">
              <View tag="t6">Compromisso Elétrica&Art:</View>
              <p>
                Unir técnica, estética, precisão e responsabilidade para
                entregar um resultado impecável, durável e superior.
              </p>
              <View tag="tagb">
                <p>
                  Agradecemos a oportunidade de apresentar esta proposta e
                  estamos à disposição para quaisquer esclarecimentos
                  adicionais.
                </p>
              </View>
            </View>
          </View>

          <View tag="footer-content_bottom" className="avoid-page-break">
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

            {/* QR Code de Autenticação */}
            {password && (
              <div className="flex flex-1 items-center justify-center pt-8 avoid-page-break">
                <View
                  tag="holder"
                  className="flex items-center justify-center gap-8 bg-slate-50 border border-slate-300 rounded-[12px] p-4"
                >
                  <View
                    tag="qrcode"
                    className="flex flex-col items-center justify-center bg-white text-[#00559c] p-2 rounded-sm"
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
                  <p className="text-[12px] text-slate-600">
                    Para visualizar este documento original em nosso sistema,
                    aponte a câmera do seu celular para o QR Code ao lado ou
                    acesse{' '}
                    <b>
                      {`https://${baseUrl.replace(/^https?:\/\//, '')}/validar/${budgetId}`}
                    </b>{' '}
                    e informe a senha:{' '}
                    <span className="font-[800] text-[16px] text-slate-900">
                      {password || '----'}
                    </span>
                  </p>
                </View>
              </div>
            )}
          </View>
        </View>
      </View>
    </div>
  );
}
