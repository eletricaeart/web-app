// components/painel/orcamentos/OrcamentoNovoPainel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import AppBar from '@/components/layout/AppBar';
import ClientForm from '@/components/forms/ClientForm';
import ClauseManager from '@/components/forms/ClauseManager';
import InvestmentDrawer, { PEEK_HEIGHT } from './InvestmentDrawer';
import View from '@/components/layout/View';
import {
  CircleNotch,
  Calculator,
  CalendarBlank,
  Sparkle,
} from '@phosphor-icons/react';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import * as Default_Divider from '@/components/Divider';
import FinancialInvestmentV2Editor from './FinancialInvestmentV2Editor';
import AiBudgetImportModal from './AiBudgetImportModal';
import {
  InvestmentCategory,
  BudgetFinancialsV2,
  getInvestmentTotal,
  formatCurrency,
  buildInvestmentClause,
  buildSummaryClause,
} from '@/lib/types/investment';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ptBR } from 'date-fns/locale';

import './orcamentosNovo.css';
import Pressable from '@/components/Pressable';
import { generateAccessPassword } from '@/utils/helpers';
import { toast } from 'sonner';

export default function OrcamentoNovoPainel() {
  const router = usePainelRouter();
  const editId = router.params.id;
  const isEditing = !!router.params.natabiruta;

  const { data: allBudgets, save: saveBudget } =
    useEASyncSupabase<any>('orcamentos');
  const { data: clientsCache } = useEASyncSupabase<any>('clientes');

  const [loading, setLoading] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const [budget, setBudget] = useState<any>({
    id: null,
    schema_version: 'v3',
    documentTitle: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiration: '15 dias',
    subtitle: 'PROPOSTA DE ORÇAMENTO',
    client: {
      name: '',
      zip: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
    },
    services: [
      {
        id: Date.now(),
        titulo: '',
        items: [
          {
            id: Date.now() + 1,
            subtitulo: '',
            content: '',
          },
        ],
      },
    ],
    investmentCategories: [] as InvestmentCategory[],
    financial: { labor: 0, materials: 0, discount: 0, total: 0 },
    financial_v3: null,
    financialV2: {
      schemaVersion: 2,
      categories: [],
      totalLabor: 0,
      totalMaterials: 0,
      grandTotal: 0,
    } as BudgetFinancialsV2,
  });

  const legacyClauseTotal = useMemo(() => {
    let total = 0;
    budget.services.forEach((clause: any) => {
      if (
        clause.sourceType === 'investment' ||
        clause.sourceType === 'summary' ||
        clause.titulo === 'Investimento' ||
        clause.titulo === 'Resumo Financeiro' ||
        clause.title === 'Investimento' ||
        clause.title === 'Resumo Financeiro'
      ) {
        return;
      }
      (clause.items || []).forEach((item: any) => {
        total += Number(item.price) || 0;
      });
    });
    return total;
  }, [budget.services]);

  const investmentTotal = useMemo(
    () => getInvestmentTotal(budget.investmentCategories),
    [budget.investmentCategories],
  );

  const calculatedTotal = useMemo(() => {
    if (
      budget.financialV2?.schemaVersion === 2 &&
      budget.financialV2?.categories?.length > 0
    ) {
      return (budget.financialV2.grandTotal || 0) + legacyClauseTotal;
    }
    return (
      legacyClauseTotal +
      investmentTotal +
      Number(budget.financial.labor) +
      Number(budget.financial.materials) -
      Number(budget.financial.discount)
    );
  }, [
    legacyClauseTotal,
    investmentTotal,
    budget.financial,
    budget.financialV2,
  ]);

  useEffect(() => {
    setBudget((prev: any) => ({
      ...prev,
      financial: { ...prev.financial, total: calculatedTotal },
    }));
  }, [calculatedTotal]);

  // --- SINCRONIZAÇÃO AUTOMÁTICA das seções Investimento/Resumo Financeiro
  useEffect(() => {
    const hasGenerated = budget.services.some(
      (c: any) => c.sourceType === 'investment' || c.sourceType === 'summary',
    );
    if (!hasGenerated) return;

    setBudget((prev: any) => ({
      ...prev,
      services: prev.services.map((c: any) => {
        if (c.sourceType === 'investment') {
          return {
            ...c,
            items: buildInvestmentClause(
              prev.investmentCategories,
              prev.financialV2,
            ).items,
          };
        }
        if (c.sourceType === 'summary') {
          return {
            ...c,
            items: buildSummaryClause(prev.investmentCategories, {
              legacyTotal: legacyClauseTotal,
              labor: Number(prev.financial.labor) || 0,
              materials: Number(prev.financial.materials) || 0,
              discount: Number(prev.financial.discount) || 0,
              grandTotal: calculatedTotal,
              v2Data: prev.financialV2,
            }).items,
          };
        }
        return c;
      }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    budget.investmentCategories,
    budget.financialV2,
    legacyClauseTotal,
    calculatedTotal,
  ]);

  // --- DETECÇÃO E PRÉ-SELEÇÃO DE CLIENTE (Via Params ou LocalStorage) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('ea_open_ai_import') === 'true') {
        sessionStorage.removeItem('ea_open_ai_import');
        setIsAiModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    // 1. Cliente passado explicitamente via rota (ex: ao criar orçamento a partir do perfil do cliente)
    const paramClientId = router.params.clienteId || router.params.clientId;
    if (paramClientId && clientsCache?.length > 0 && !budget.client.name) {
      const found = clientsCache.find(
        (c: any) => String(c.id) === String(paramClientId),
      );
      if (found) {
        setBudget((prev: any) => ({
          ...prev,
          client: {
            id: found.id || '',
            name: found.name || found['Nome Completo'] || '',
            zip: found.zip || found.cep || '',
            street: found.street || found.rua || '',
            number: found.number || found.num || '',
            neighborhood: found.neighborhood || found.bairro || '',
            city: found.city || found.cidade || '',
            complement: found.complement || found.complemento || '',
            document: found.document || found['CPF / CNPJ'] || '',
            whatsapp: found.whatsapp || '',
            email: found.email || '',
            category: found.category || '',
            photo_url: found.photo_url || found.photo || '',
          },
        }));
      }
    }

    // 2. Cliente salvo em trânsito no LocalStorage (se veio de clientes.novo)
    if (typeof window !== 'undefined' && !budget.client.name) {
      try {
        const stored = localStorage.getItem('ea_selected_client_for_budget');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) {
            setBudget((prev: any) => ({
              ...prev,
              client: {
                id: parsed.id || '',
                name: parsed.name || parsed['Nome Completo'] || '',
                zip: parsed.zip || parsed.cep || '',
                street: parsed.street || parsed.rua || '',
                number: parsed.number || parsed.num || '',
                neighborhood: parsed.neighborhood || parsed.bairro || '',
                city: parsed.city || parsed.cidade || '',
                complement: parsed.complement || parsed.complemento || '',
                document: parsed.document || parsed['CPF / CNPJ'] || '',
                whatsapp: parsed.whatsapp || '',
                email: parsed.email || '',
                category: parsed.category || '',
                photo_url: parsed.photo_url || parsed.photo || '',
              },
            }));
            localStorage.removeItem('ea_selected_client_for_budget');
          }
        }
      } catch (err) {
        console.warn('Erro ao restaurar cliente em trânsito:', err);
      }
    }
  }, [router.params, clientsCache, budget.client.name]);

  useEffect(() => {
    if (editId && allBudgets.length > 0) {
      const budgetToEdit = allBudgets.find(
        (o: any) => String(o.id) === String(editId),
      );
      if (budgetToEdit) mapIncomingData(budgetToEdit);
    }
  }, [editId, allBudgets]);

  const mapIncomingData = (data: any) => {
    const finJson = data.financial_json || data.financial || {};
    const isV2 = finJson.schemaVersion === 2;

    setBudget({
      id: data.id,
      documentTitle: data.document_title || data.documentTitle,
      issueDate: data.issue_date || data.issueDate,
      expiration: data.expiration,
      subtitle: data.subtitle,
      client: {
        id: data.client_id,
        name: data.client_name_manual || data.clientName,
        zip: data.zip || data.client?.zip || '',
        street: data.street || data.client?.street || '',
        number: data.number || data.client?.number || '',
        neighborhood: data.neighborhood || data.client?.neighborhood || '',
        city: data.city || data.client?.city || '',
        complement: data.complement || data.client?.complement || '',
      },
      services: data.services_json || data.services,
      investmentCategories: data.investment_categories || [],
      financial: isV2
        ? {
            labor: finJson.totalLabor,
            materials: finJson.totalMaterials,
            discount: 0,
            total: finJson.grandTotal,
          }
        : finJson,
      financialV2: isV2
        ? finJson
        : {
            schemaVersion: 2,
            categories: [],
            totalLabor: Number(finJson.labor || 0),
            totalMaterials: Number(finJson.materials || 0),
            grandTotal: Number(finJson.total || 0),
          },
      accessPassword: data.access_password || data.accessPassword,
    });
  };

  const handleInsertInvestmentClause = () => {
    const v2Cats = budget.financialV2?.categories || [];
    if (budget.investmentCategories.length === 0 && v2Cats.length === 0) {
      return toast.error(
        'Defina ao menos um serviço no painel de Investimento/Financeiro primeiro.',
      );
    }
    const clause = buildInvestmentClause(
      budget.investmentCategories,
      budget.financialV2,
    );
    setBudget((prev: any) => ({
      ...prev,
      services: [...prev.services, clause],
    }));
  };

  const handleInsertSummaryClause = () => {
    const v2Cats = budget.financialV2?.categories || [];
    if (budget.investmentCategories.length === 0 && v2Cats.length === 0) {
      return toast.error(
        'Defina ao menos um serviço no painel de Investimento/Financeiro primeiro.',
      );
    }
    const clause = buildSummaryClause(budget.investmentCategories, {
      legacyTotal: legacyClauseTotal,
      labor: Number(budget.financial.labor) || 0,
      materials: Number(budget.financial.materials) || 0,
      discount: Number(budget.financial.discount) || 0,
      grandTotal: calculatedTotal,
      v2Data: budget.financialV2,
    });
    setBudget((prev: any) => ({
      ...prev,
      services: [...prev.services, clause],
    }));
  };

  const handleSave = async () => {
    const isUUID = (val: any) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        val,
      );

    if (!budget.documentTitle || !budget.client.name) {
      return toast.error('Título e Cliente são obrigatórios.');
    }

    setLoading(true);
    const accessPassword = budget.accessPassword || generateAccessPassword();

    const payload: any = {
      document_title: budget.documentTitle,
      client_name_manual: budget.client.name,
      client_id: isUUID(budget.client.id) ? budget.client.id : null,

      zip: budget.client.zip || null,
      street: budget.client.street || null,
      number: budget.client.number || null,
      neighborhood: budget.client.neighborhood || null,
      city: budget.client.city || null,
      complement: budget.client.complement || null,

      issue_date: budget.issueDate,
      expiration: budget.expiration,
      subtitle: budget.subtitle,

      services_json: budget.services,
      investment_categories: budget.investmentCategories,
      schema_version: 'v3',
      financial_v3: budget.financial_v3 || {
        total: calculatedTotal,
        categories:
          budget.financialV2?.categories?.map((c: any) => ({
            name: c.categoryLabel || c.name,
            value: c.totalValue,
          })) || [],
        paymentConditions: budget.financialV2?.paymentConditions || '',
        deadline: budget.financialV2?.deadline || '',
        warranty: budget.financialV2?.warranty || '',
      },
      financial_json:
        budget.financialV2?.categories?.length > 0
          ? {
              schemaVersion: 3,
              categories: budget.financialV2.categories,
              totalLabor: budget.financialV2.totalLabor || 0,
              totalMaterials: budget.financialV2.totalMaterials || 0,
              grandTotal: calculatedTotal,
              paymentConditions: budget.financialV2.paymentConditions || '',
              deadline: budget.financialV2.deadline || '',
              warranty: budget.financialV2.warranty || '',
            }
          : {
              labor: Number(budget.financial.labor) || 0,
              materials: Number(budget.financial.materials) || 0,
              discount: Number(budget.financial.discount) || 0,
              total: Number(calculatedTotal) || 0,
            },
      access_password: accessPassword,
    };

    if (editId && isUUID(editId)) {
      payload.id = editId;
    }

    const action = editId ? 'update' : 'create';

    try {
      const result = await saveBudget(payload, action);

      if (result) {
        toast.success(
          editId ? 'Orçamento atualizado!' : 'Orçamento salvo com sucesso!',
        );
        router.push('orcamentos');
      }
    } catch (err: any) {
      console.error('❌ Erro fatal ao salvar orçamento:', err);
      toast.error('Erro ao sincronizar com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAiBudget = (extracted: any) => {
    setBudget((prev: any) => ({
      ...prev,
      schema_version: 'v3',
      documentTitle: extracted.documentTitle || prev.documentTitle,
      subtitle: extracted.subtitle || prev.subtitle,
      issueDate: extracted.issueDate || prev.issueDate,
      expiration: extracted.expiration || prev.expiration,
      client: {
        ...prev.client,
        ...extracted.client,
      },
      services:
        extracted.services?.length > 0 ? extracted.services : prev.services,
      financial_v3: extracted.financial_v3 || prev.financial_v3,
      financialV2: extracted.financialV2 || prev.financialV2,
      financial: extracted.financial || prev.financial,
    }));
  };

  const getSelectedDate = () => {
    const date = parseISO(budget.issueDate);
    return isValid(date) ? date : new Date();
  };

  return (
    <>
      <AppBar
        title={isEditing ? `Edição` : `Novo Orçamento`}
        backAction={() => router.back()}
      />

      <View tag="page">
        <View tag="page-content">
          {/* Cabeçalho com botão de Importar com IA */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="page-subtitle mb-0">Dados do orçamento</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="h-9 px-3.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/80 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Importar Proposta com IA (Gemini)"
            >
              <Sparkle
                size={16}
                weight="fill"
                className="text-amber-500 shrink-0"
              />
              <span>Importar com IA</span>
            </Button>
          </div>

          <View className="formGroup">
            <label className="label">
              <View tag="t">Título</View>
              <input
                type="text"
                className="input"
                placeholder="Ex: Instalação Residencial"
                value={budget.documentTitle}
                onChange={(e) =>
                  setBudget({ ...budget, documentTitle: e.target.value })
                }
              />
            </label>
          </View>

          <View tag="budget-infos" className="pd">
            <View tag="grid-duo">
              <label className="date-picker flex-5 flex flex-col gap-1">
                <View tag="t">Data de Emissão</View>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-[45px] justify-start border-[#ccc]"
                    >
                      <CalendarBlank size={18} className="mr-2" />
                      {format(getSelectedDate(), 'dd-MM-yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={getSelectedDate()}
                      onSelect={(date) =>
                        date &&
                        setBudget({
                          ...budget,
                          issueDate: format(date, 'yyyy-MM-dd'),
                        })
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </label>

              <label className="flex-5 flex flex-col gap-1">
                <View tag="t">Validade</View>
                <Select
                  value={budget.expiration}
                  onValueChange={(v) => setBudget({ ...budget, expiration: v })}
                >
                  <SelectTrigger className="w-full h-[45px] border-[#ccc]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['7 dias', '15 dias', '30 dias', '60 dias', '90 dias'].map(
                      (v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </label>
            </View>
          </View>

          <Default_Divider.default spacing="2rem" color="transparent" />
          <h3 className="page-subtitle">Dados do cliente</h3>
          <ClientForm
            clientData={budget.client}
            clientsCache={clientsCache}
            onClientChange={(updated) =>
              setBudget({ ...budget, client: updated })
            }
            onNewClientClick={() => router.push('clientes.novo')}
            isOnNewBudget={true}
          />

          <Default_Divider.default spacing="2rem" color="transparent" />
          <h3 className="page-subtitle">Cláusulas e Itens do Documento</h3>
          <ClauseManager
            clauses={budget.services}
            onClausesChange={(newClauses) =>
              setBudget({ ...budget, services: newClauses })
            }
            canInsertInvestmentSections={
              budget.investmentCategories.length > 0 ||
              (budget.financialV2?.categories?.length || 0) > 0
            }
            onInsertInvestmentClause={handleInsertInvestmentClause}
            onInsertSummaryClause={handleInsertSummaryClause}
          />

          <Default_Divider.default spacing="2rem" color="transparent" />
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <header className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <Calculator size={20} /> Resumo Financeiro
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budget.financialV2?.schemaVersion === 2 &&
              (budget.financialV2?.categories?.length || 0) > 0 ? (
                budget.financialV2.categories.map((cat: any) => (
                  <label key={cat.id} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {cat.categoryLabel || `Serviços de ${cat.category}`}
                    </span>
                    <Input
                      type="text"
                      readOnly
                      disabled
                      value={formatCurrency(cat.totalValue || 0)}
                      className="bg-slate-50 font-bold text-slate-800 cursor-not-allowed border-slate-200"
                    />
                  </label>
                ))
              ) : (
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Total dos Serviços
                  </span>
                  <Input
                    type="text"
                    readOnly
                    disabled
                    value={formatCurrency(calculatedTotal)}
                    className="bg-slate-50 font-bold text-slate-800 cursor-not-allowed border-slate-200"
                  />
                </label>
              )}
            </div>
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="text-slate-500 font-medium">VALOR TOTAL:</span>
              <span className="text-3xl font-black text-indigo-700">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
          </View>
        </View>

        <footer
          className="footer left-0 right-0 z-[55] flex flex-col pt-4 pb-[130px_!important] mx-2 bg-[#7faacd] dark:bg-slate-700 rounded-2xl shadow-lg"
          style={{ bottom: PEEK_HEIGHT + 8 }}
        >
          {' '}
          <Pressable
            onClick={handleSave}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {' '}
            {loading ? (
              <CircleNotch size={20} className="animate-spin" />
            ) : (
              <span>
                {budget.id ? 'ATUALIZAR ORÇAMENTO' : 'SALVAR ORÇAMENTO'}
              </span>
            )}
          </Pressable>
        </footer>
      </View>

      <InvestmentDrawer
        categories={budget.investmentCategories}
        onChange={(categories) =>
          setBudget({ ...budget, investmentCategories: categories })
        }
        financialV2={budget.financialV2}
        onChangeV2={(updatedV2) =>
          setBudget({ ...budget, financialV2: updatedV2 })
        }
        legacyClauseTotal={legacyClauseTotal}
      />

      <AiBudgetImportModal
        isOpen={isAiModalOpen}
        onOpenChange={setIsAiModalOpen}
        onApplyExtractedBudget={handleApplyAiBudget}
        clientsCache={clientsCache}
      />
    </>
  );
}
