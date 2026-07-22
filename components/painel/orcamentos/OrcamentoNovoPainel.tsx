// components/painel/orcamentos/OrcamentoNovoPainel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import AppBar from '@/components/layout/AppBar';
import ClientForm from '@/components/forms/ClientForm';
import ClauseManager from '@/components/forms/ClauseManager';
import InvestmentDrawer from './InvestmentDrawer';
import View from '@/components/layout/View';
import { CircleNotch, Calculator } from '@phosphor-icons/react';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import * as Default_Divider from '@/components/Divider';
import {
  InvestmentCategory,
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
import { CalendarIcon } from 'lucide-react';

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

  const [budget, setBudget] = useState<any>({
    id: null,
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
  });

  const legacyClauseTotal = useMemo(() => {
    let total = 0;
    budget.services.forEach((clause: any) => {
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
    return (
      legacyClauseTotal +
      investmentTotal +
      Number(budget.financial.labor) +
      Number(budget.financial.materials) -
      Number(budget.financial.discount)
    );
  }, [legacyClauseTotal, investmentTotal, budget.financial]);

  useEffect(() => {
    setBudget((prev: any) => ({
      ...prev,
      financial: { ...prev.financial, total: calculatedTotal },
    }));
  }, [calculatedTotal]);

  // --- SINCRONIZAÇÃO AUTOMÁTICA das seções Investimento/Resumo Financeiro,
  // sempre que os dados do painel de Investimento (ou financeiro geral) mudam.
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
            items: buildInvestmentClause(prev.investmentCategories).items,
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
            }).items,
          };
        }
        return c;
      }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget.investmentCategories, legacyClauseTotal, calculatedTotal]);

  useEffect(() => {
    if (editId && allBudgets.length > 0) {
      const budgetToEdit = allBudgets.find(
        (o: any) => String(o.id) === String(editId),
      );
      if (budgetToEdit) mapIncomingData(budgetToEdit);
    }
  }, [editId, allBudgets]);

  const mapIncomingData = (data: any) => {
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
      financial: data.financial_json || data.financial,
      accessPassword: data.access_password || data.accessPassword,
    });
  };

  const handleInsertInvestmentClause = () => {
    if (budget.investmentCategories.length === 0) {
      return toast.error(
        'Defina ao menos uma categoria no painel de Investimento primeiro.',
      );
    }
    const clause = buildInvestmentClause(budget.investmentCategories);
    setBudget((prev: any) => ({
      ...prev,
      services: [...prev.services, clause],
    }));
  };

  const handleInsertSummaryClause = () => {
    if (budget.investmentCategories.length === 0) {
      return toast.error(
        'Defina ao menos uma categoria no painel de Investimento primeiro.',
      );
    }
    const clause = buildSummaryClause(budget.investmentCategories, {
      legacyTotal: legacyClauseTotal,
      labor: Number(budget.financial.labor) || 0,
      materials: Number(budget.financial.materials) || 0,
      discount: Number(budget.financial.discount) || 0,
      grandTotal: calculatedTotal,
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
      financial_json: {
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
          <h3 className="page-subtitle">Dados do orçamento</h3>
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
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(getSelectedDate(), 'dd/MM/yyyy')}
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
          <h3 className="page-subtitle">Cláusulas e Itens</h3>
          <ClauseManager
            clauses={budget.services}
            onClausesChange={(newClauses) =>
              setBudget({ ...budget, services: newClauses })
            }
            canInsertInvestmentSections={budget.investmentCategories.length > 0}
            onInsertInvestmentClause={handleInsertInvestmentClause}
            onInsertSummaryClause={handleInsertSummaryClause}
          />

          <Default_Divider.default spacing="2rem" color="transparent" />
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <header className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <Calculator size={20} /> Resumo Financeiro
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Mão de Obra Adicional
                </span>
                <Input
                  type="number"
                  value={budget.financial.labor || ''}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      financial: {
                        ...budget.financial,
                        labor: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0,00"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Materiais
                </span>
                <Input
                  type="number"
                  value={budget.financial.materials || ''}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      financial: {
                        ...budget.financial,
                        materials: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0,00"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">
                  Desconto Geral
                </span>
                <Input
                  type="number"
                  value={budget.financial.discount || ''}
                  onChange={(e) =>
                    setBudget({
                      ...budget,
                      financial: {
                        ...budget.financial,
                        discount: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0,00"
                  className="text-red-500 font-bold"
                />
              </label>
            </div>
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="text-slate-500 font-medium">VALOR TOTAL:</span>
              <span className="text-3xl font-black text-indigo-700">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
          </View>
        </View>

        <footer className="footer bottom-[92px] flex flex-col pt-4 pb-[130px_!important] mx-2 mb-2 bg-[#7faacd] rounded-2xl shadow-lg">
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
        legacyClauseTotal={legacyClauseTotal}
      />
    </>
  );
}
