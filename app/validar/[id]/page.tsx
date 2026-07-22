// app/validar/[id]/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
// 1. Trocamos para o hook do Supabase
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { processTextToHtml } from '@/utils/TextPreProcessor';
import View from '@/components/layout/View';
import EACard from '@/components/ui/EACard';
import Text from '@/components/ui/Text';
import {
  LockKey,
  ShieldCheck,
  WarningCircle,
  ArrowRight,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// import '../../orcamentos/[id]/Budget.css';
import '@/components/painel/orcamentos/IDBudget.css';

export default function PublicBudgetValidator() {
  const params = useParams();
  const budgetId = params?.id as string;

  // 2. Usando o hook do Supabase
  const { data: orcamentos } = useEASyncSupabase<any>('orcamentos');

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Busca o orçamento
  const budget = useMemo(() => {
    return orcamentos?.find(
      (o: any) => String(o.id).trim() === String(budgetId).trim(),
    );
  }, [orcamentos, budgetId]);

  const handleValidate = () => {
    // PROTEÇÃO: Se o orçamento ainda não carregou, não faz nada
    if (!budget) return;

    setLoading(true);
    setError(false);

    // 3. Normalização das senhas para comparação (Remove hifens e sobe para UpperCase)
    const inputPass = password.replace(/-/g, '').toUpperCase();
    const storedPassword =
      budget.access_password || budget.accessPassword || '';
    const dbPass = storedPassword.replace(/-/g, '').toUpperCase();

    setTimeout(() => {
      if (dbPass === inputPass && dbPass !== '') {
        setIsAuthenticated(true);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 800);
  };

  // 4. Suporte ao "Enter"
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.length >= 4) {
      handleValidate();
    }
  };

  if (!isAuthenticated) {
    return (
      <View className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-indigo-200 shadow-2xl">
              <LockKey size={42} weight="duotone" className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Acesso Restrito
            </h1>
            <p className="text-slate-500 text-sm">
              Informe a senha presente no documento PDF para visualizar o
              original.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-left ml-2">
                Senha do Documento
              </label>
              <Input
                type="text"
                placeholder="Ex: HB24-35JD"
                maxLength={14} // 5. Aumentado para suportar o novo padrão XXXX-XXXX-XXXX
                value={password}
                onKeyDown={handleKeyDown} // 6. Suporte ao Enter
                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                className="h-14 text-center text-xl font-black tracking-[2px] uppercase border-2 focus:border-indigo-500 rounded-2xl"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl animate-shake">
                <WarningCircle size={20} weight="fill" />
                <span className="text-xs font-bold uppercase">
                  Senha inválida
                </span>
              </div>
            )}

            <Button
              onClick={handleValidate}
              disabled={loading || password.length < 4 || !budget}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
            >
              {loading
                ? 'Validando...'
                : !budget
                  ? 'Carregando...'
                  : 'Verificar Documento'}
            </Button>
          </div>

          <p className="text-[10px] text-slate-400 font-medium">
            ID: {budgetId} <br />
            Protegido por Elétrica & Art
          </p>
        </div>
      </View>
    );
  }

  // --- SE ESTIVER AUTENTICADO: MOSTRA O CONTEÚDO ---
  return (
    <View tag="pageContainer" className="bg-[#f5f5f5] min-h-screen">
      <div className="bg-emerald-500 text-white text-[10px] font-black uppercase p-2 text-center flex items-center justify-center gap-2 sticky top-0 z-[100]">
        <ShieldCheck size={16} weight="bold" /> Documento Original Autenticado
        por Elétrica & Art
      </div>

      <View
        tag="budget-page"
        className="p-4 max-w-[800px] mx-auto bg-[#f5f5f5]"
      >
        <View tag="page-header">
          <EACard />
          <View tag="doc-id">
            <span>
              <b>Data de Emissão:</b>
              <View tag="issue-date">
                {budget.issue_date ||
                  budget.issueDate ||
                  budget.docTitle?.emissao ||
                  '---'}
              </View>
            </span>
            <span>
              <b>Validade da Proposta:</b>{' '}
              <View tag="t">
                {budget.expiration || budget.docTitle?.validade || '---'}
              </View>
            </span>
          </View>
        </View>

        <View tag="doc-title" className="my-8">
          <View tag="doc-title_layout">
            <View tag="doc-title_type">
              <Text size="1.2rem" color="#fff" shadow="#00559c">
                {budget.subtitle || budget.docTitle?.subtitle || 'PROPOSTA'}
              </Text>
            </View>
            <View tag="doc-title_title">
              {budget.document_title ||
                budget.documentTitle ||
                budget.docTitle?.text}
            </View>
          </View>
        </View>

        {/* SEÇÃO DO CLIENTE */}
        <View tag="cliente-section" className="mb-8">
          <View tag="ui">
            <header>
              <View tag="ui">
                <View tag="t">DADOS DO DOCUMENTO</View>
              </View>
            </header>
            <View tag="content">
              <View tag="card">
                <View tag="ui">
                  <View tag="t">
                    <b>Cliente:</b>{' '}
                    {budget.client_name_manual ||
                      budget.clientName ||
                      budget.cliente?.name}
                  </View>
                  <View tag="t">
                    <b>Endereço:</b>{' '}
                    {[
                      budget.street || budget.cliente?.rua,
                      budget.number || budget.cliente?.num
                        ? `nº ${budget.number || budget.cliente?.num}`
                        : null,
                      budget.neighborhood || budget.cliente?.bairro,
                      budget.city || budget.cliente?.cidade,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Não informado'}
                  </View>
                  <View tag="t">
                    <b>ID de Autenticidade:</b> {budgetId}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View tag="budget-body">
          {JSON.parse(
            typeof (budget.services_json || budget.services) === 'string'
              ? budget.services_json || budget.services
              : JSON.stringify(
                  budget.services_json ||
                    budget.services ||
                    budget.servicos ||
                    [],
                ),
          ).map((servico: any, index: number) => (
            <View key={index} tag="clause" className="mb-6">
              <View tag="ui">
                <View tag="clause-header">
                  <View tag="ui">
                    <View tag="t">
                      {index + 1}. {servico.titulo || servico.title}
                    </View>
                  </View>
                </View>
                <View tag="clause-content">
                  {(servico.itens || servico.items || []).map(
                    (item: any, idx: number) => (
                      <View key={idx} tag="subclause">
                        <View tag="ui">
                          <View tag="subclause-header">
                            <View tag="t6" style={{ fontWeight: 'bold' }}>
                              {item.subtitulo || item.subtitle}
                            </View>
                          </View>
                          <View
                            tag="subclause-body"
                            className="markdown-rendered-content"
                            dangerouslySetInnerHTML={{
                              __html: processTextToHtml(
                                item.content ||
                                  item.detalhes?.[0]?.conteudo ||
                                  '',
                              ),
                            }}
                          />
                        </View>
                      </View>
                    ),
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <div className="mt-20 text-center border-t border-slate-200 pt-10 pb-20">
          <div className="text-xs text-slate-400 mb-2">
            Este documento é uma cópia digital do original emitido em{' '}
            {budget.issue_date || budget.issueDate}.
          </div>
          <div className="font-black text-indigo-900 uppercase tracking-tighter">
            Rafael - Elétrica & Art
          </div>
        </div>
      </View>
    </View>
  );
}
