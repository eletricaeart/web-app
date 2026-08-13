// components/painel/orcamentos/InvestmentDrawer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Wallet,
  CaretUp,
  Plus,
  Trash,
  PencilSimple,
  DotsThreeVertical,
  X,
  Wrench,
  Package,
  Coins,
  Check,
} from '@phosphor-icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InvestmentCategoryEditor from './InvestmentCategoryEditor';
import FinancialInvestmentV2Editor from './FinancialInvestmentV2Editor';
import {
  InvestmentCategory,
  BudgetFinancialsV2,
  CategoryBreakdown,
  DetailedServiceItem,
  SERVICE_CATEGORIES,
  ServiceCategoryType,
  getInvestmentTotal,
  formatCurrency,
} from '@/lib/types/investment';

interface InvestmentDrawerProps {
  categories: InvestmentCategory[];
  onChange: (categories: InvestmentCategory[]) => void;
  financialV2?: BudgetFinancialsV2;
  onChangeV2?: (updatedV2: BudgetFinancialsV2) => void;
  legacyClauseTotal?: number;
}

export const PEEK_HEIGHT = 84; // px — altura da barra sempre visível

export default function InvestmentDrawer({
  categories,
  onChange,
  financialV2,
  onChangeV2,
  legacyClauseTotal = 0,
}: InvestmentDrawerProps) {
  const isV2 = financialV2?.schemaVersion === 2;

  // Calculo do total do Investimento
  const total = isV2
    ? (financialV2?.grandTotal || 0) + legacyClauseTotal
    : getInvestmentTotal(categories) + legacyClauseTotal;

  const [expanded, setExpanded] = useState(false);

  // Bloqueia rolagem vertical da página quando o painel estiver aberto
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expanded]);

  // Estado do Drawer interno / Modal "Novo Serviço"
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form de adição/edição de Serviço Detalhado
  const [serviceCategory, setServiceCategory] =
    useState<ServiceCategoryType>('eletrica');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState<number | string>(1);
  const [serviceUnitValue, setServiceUnitValue] = useState<number | string>('');

  const [showMaterialInput, setShowMaterialInput] = useState<
    Record<string, boolean>
  >({});

  const handleMaterialInputChange = (catId: string, rawInput: string) => {
    const digits = rawInput.replace(/\D/g, '');
    const numericVal = digits ? parseInt(digits, 10) / 100 : 0;
    handleUpdateCategoryMaterials(catId, numericVal);
  };

  const handleUpdateCategoryMaterials = (
    catId: string,
    materialsValue: number,
  ) => {
    if (!financialV2 || !onChangeV2) return;
    const updatedCategories = financialV2.categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        materialsValue,
        totalValue: (cat.laborValue || 0) + materialsValue,
      };
    });

    let totalLabor = 0;
    let totalMaterials = 0;
    let grandTotal = 0;

    updatedCategories.forEach((cat) => {
      totalLabor += Number(cat.laborValue || 0);
      totalMaterials += Number(cat.materialsValue || 0);
      grandTotal += Number(cat.totalValue || 0);
    });

    onChangeV2({
      schemaVersion: 2,
      categories: updatedCategories,
      totalLabor,
      totalMaterials,
      grandTotal,
    });
  };

  const dragState = useRef<{ startY: number; dragging: boolean } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragState.current = { startY: e.clientY, dragging: false };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const delta = dragState.current.startY - e.clientY;

    if (Math.abs(delta) > 8) {
      dragState.current.dragging = true;
    }

    if (delta > 40 && !expanded) {
      setExpanded(true);
      dragState.current = null;
    } else if (delta < -40 && expanded) {
      setExpanded(false);
      dragState.current = null;
    }
  };

  const handlePointerUp = () => {
    if (dragState.current && !dragState.current.dragging) {
      setExpanded((prev) => !prev);
    }
    dragState.current = null;
  };

  // Resetar modal de criação de serviço
  const resetServiceForm = () => {
    setEditingItemId(null);
    setServiceName('');
    setServiceDescription('');
    setServiceQuantity(1);
    setServiceUnitValue('');
    setIsServiceModalOpen(false);
  };

  // Abrir modal para criar
  const handleOpenAddService = () => {
    resetServiceForm();
    setIsServiceModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEditService = (
    catType: ServiceCategoryType,
    item: DetailedServiceItem,
  ) => {
    setEditingItemId(item.id);
    setServiceCategory(catType);
    setServiceName(item.name);
    setServiceDescription(item.description || '');
    setServiceQuantity(item.quantity);
    setServiceUnitValue(item.unitValue);
    setIsServiceModalOpen(true);
  };

  // Salvar serviço (Novo ou Edição) no V2
  const handleSaveDetailedService = (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceName.trim()) return;
    const qty = Math.max(1, Number(serviceQuantity) || 1);
    const unitVal = Math.max(0, Number(serviceUnitValue) || 0);
    const totalItemVal = qty * unitVal;

    const currentV2Categories = financialV2?.categories || [];
    let updatedCategories = [...currentV2Categories];

    if (editingItemId) {
      // Atualizar item existente
      updatedCategories = updatedCategories.map((cat) => {
        const hasItem = (cat.items || []).some((i) => i.id === editingItemId);
        if (!hasItem) return cat;

        const newItems = (cat.items || []).map((i) => {
          if (i.id !== editingItemId) return i;
          return {
            ...i,
            name: serviceName,
            description: serviceDescription,
            quantity: qty,
            unitValue: unitVal,
            laborValue: totalItemVal,
            totalValue: totalItemVal,
          };
        });

        // Recalcular totais da categoria
        const catLabor = newItems.reduce(
          (acc, item) => acc + (item.totalValue || 0),
          0,
        );

        return {
          ...cat,
          items: newItems,
          laborValue: catLabor,
          totalValue: catLabor + (cat.materialsValue || 0),
        };
      });
    } else {
      // Adicionar novo item
      const newItem: DetailedServiceItem = {
        id: crypto.randomUUID(),
        name: serviceName,
        description: serviceDescription,
        quantity: qty,
        unitValue: unitVal,
        laborValue: totalItemVal,
        totalValue: totalItemVal,
      };

      const existingCatIndex = updatedCategories.findIndex(
        (c) => c.category === serviceCategory,
      );

      if (existingCatIndex >= 0) {
        const cat = updatedCategories[existingCatIndex];
        const newItems = [...(cat.items || []), newItem];
        const catLabor = newItems.reduce(
          (acc, item) => acc + (item.totalValue || 0),
          0,
        );

        updatedCategories[existingCatIndex] = {
          ...cat,
          items: newItems,
          laborValue: catLabor,
          totalValue: catLabor + (cat.materialsValue || 0),
        };
      } else {
        // Criar nova categoria para o tipo de serviço
        const catObj = SERVICE_CATEGORIES.find((s) => s.id === serviceCategory);
        const newCat: CategoryBreakdown = {
          id: crypto.randomUUID(),
          category: serviceCategory,
          categoryLabel: catObj ? `Serviços de ${catObj.label}` : 'Serviços',
          description: '',
          laborValue: totalItemVal,
          materialsValue: 0,
          totalValue: totalItemVal,
          items: [newItem],
        };
        updatedCategories.push(newCat);
      }
    }

    // Recalcular Totais Gerais
    let totalLabor = 0;
    let totalMaterials = 0;
    let grandTotal = 0;

    updatedCategories.forEach((cat) => {
      totalLabor += Number(cat.laborValue || 0);
      totalMaterials += Number(cat.materialsValue || 0);
      grandTotal += Number(cat.totalValue || 0);
    });

    if (onChangeV2) {
      onChangeV2({
        schemaVersion: 2,
        categories: updatedCategories,
        totalLabor,
        totalMaterials,
        grandTotal,
      });
    }

    resetServiceForm();
  };

  // Excluir serviço individual
  const handleDeleteServiceItem = (itemId: string) => {
    if (!financialV2 || !onChangeV2) return;

    const updatedCategories = financialV2.categories
      .map((cat) => {
        const newItems = (cat.items || []).filter((i) => i.id !== itemId);
        const catLabor = newItems.reduce(
          (acc, item) => acc + (item.totalValue || 0),
          0,
        );

        return {
          ...cat,
          items: newItems,
          laborValue: catLabor,
          totalValue: catLabor + (cat.materialsValue || 0),
        };
      })
      .filter(
        (cat) => (cat.items && cat.items.length > 0) || cat.totalValue > 0,
      );

    let totalLabor = 0;
    let totalMaterials = 0;
    let grandTotal = 0;

    updatedCategories.forEach((cat) => {
      totalLabor += Number(cat.laborValue || 0);
      totalMaterials += Number(cat.materialsValue || 0);
      grandTotal += Number(cat.totalValue || 0);
    });

    onChangeV2({
      schemaVersion: 2,
      categories: updatedCategories,
      totalLabor,
      totalMaterials,
      grandTotal,
    });
  };

  return (
    <>
      {/* Backdrop overlay para bloquear interações com a página e minimizar o painel ao clicar fora */}
      {expanded && (
        <div
          className="fixed inset-0 z-[55] bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-[60] bg-[#f8fafc] dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.22)] border-t border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-out"
        style={{
          height: expanded ? '80vh' : `${PEEK_HEIGHT}px`,
          maxHeight: '80vh',
        }}
      >
        {/* --- HEADER FIXO NO TOPO DO DRAWER (3.2) --- */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="shrink-0 px-6 pt-3 pb-3 bg-white dark:bg-slate-800 rounded-t-[2.5rem] border-b border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center cursor-grab active:cursor-grabbing touch-none select-none shadow-sm"
          style={{ height: PEEK_HEIGHT }}
        >
          <span className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mb-2" />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white p-2.5 rounded-2xl shadow-sm">
                <Wallet size={20} weight="duotone" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    Painel de Investimento
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {isV2 ? 'Modelo V2' : 'Legado'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Total: {formatCurrency(total)}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <CaretUp
                size={20}
                weight="bold"
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* --- PÁGINA SCROLLÁVEL NA VERTICAL (3.3) --- */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          style={{
            opacity: expanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        >
          {isV2 ? (
            <>
              {/* --- LISTAGEM DOS SERVIÇOS ADICIONADOS AGRUPADOS POR TIPO (3.4) --- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={16} className="text-indigo-600" />
                    Serviços & Itens Adicionados
                  </h3>
                  <span className="text-xs text-slate-400">
                    {(financialV2?.categories || []).reduce(
                      (acc, c) => acc + (c.items?.length || 0),
                      0,
                    )}{' '}
                    item(ns)
                  </span>
                </div>

                {(!financialV2?.categories ||
                  financialV2.categories.length === 0 ||
                  financialV2.categories.every(
                    (c) => !c.items || c.items.length === 0,
                  )) && (
                  <div className="p-8 text-center bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Package
                      size={40}
                      className="mx-auto text-indigo-400 mb-2"
                      weight="duotone"
                    />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Nenhum serviço individual adicionado.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Utilize o botão{' '}
                      <strong className="text-indigo-600">
                        + Novo Serviço
                      </strong>{' '}
                      abaixo para incluir os itens do orçamento.
                    </p>
                  </div>
                )}

                {(financialV2?.categories || []).map((cat) => {
                  const items = cat.items || [];
                  if (items.length === 0 && cat.totalValue === 0) return null;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
                        <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {cat.categoryLabel || `Serviços de ${cat.category}`}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Subtotal: {formatCurrency(cat.totalValue)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400 mt-1">
                                Qtd: <strong>{item.quantity}</strong> • Valor
                                Un.:{' '}
                                <strong>
                                  {formatCurrency(item.unitValue)}
                                </strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(item.totalValue)}
                              </span>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  >
                                    <DotsThreeVertical
                                      size={18}
                                      weight="bold"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-36 z-[80]"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenEditService(cat.category, item)
                                    }
                                    className="gap-2 text-xs font-medium cursor-pointer"
                                  >
                                    <PencilSimple size={14} /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteServiceItem(item.id)
                                    }
                                    className="gap-2 text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer"
                                  >
                                    <Trash size={14} /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        {!showMaterialInput[cat.id] &&
                        cat.materialsValue === 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowMaterialInput({
                                ...showMaterialInput,
                                [cat.id]: true,
                              })
                            }
                            className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                          >
                            + Adicionar Materiais
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2">
                              Materiais:
                            </span>
                            <Input
                              type="text"
                              value={
                                cat.materialsValue > 0
                                  ? formatCurrency(cat.materialsValue)
                                  : ''
                              }
                              onChange={(e) =>
                                handleMaterialInputChange(
                                  cat.id,
                                  e.target.value,
                                )
                              }
                              placeholder="R$ 0,00"
                              className="h-8 text-sm flex-1 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100"
                            />
                            {cat.materialsValue === 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setShowMaterialInput({
                                    ...showMaterialInput,
                                    [cat.id]: false,
                                  })
                                }
                                className="h-8 w-8 text-slate-400 hover:text-slate-600"
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* --- MODELO LEGADO (V1) --- */
            <div className="space-y-4">
              <div className="text-center pt-1 pb-2">
                <Wallet
                  size={26}
                  weight="duotone"
                  className="mx-auto text-amber-500 mb-1"
                />
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                  Categorias de Investimento (Legado)
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Defina o valor de cada categoria fixa ou lista de itens para
                este modelo legado.
              </p>

              <InvestmentCategoryEditor
                categories={categories}
                onChange={onChange}
              />
            </div>
          )}
        </div>

        {/* --- FOOTER FIXO COM BOTÃO FAB PARA ADICIONAR SERVIÇOS (3.4) --- */}
        {expanded && isV2 && (
          <div className="shrink-0 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center items-center rounded-b-[2.5rem]">
            <Button
              type="button"
              onClick={handleOpenAddService}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold px-6 py-3 rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Plus size={20} weight="bold" />
              <span>Adicionar Serviço</span>
            </Button>
          </div>
        )}
      </div>

      {/* --- OVERLAY / DRAWER DE ADIÇÃO E EDIÇÃO DE SERVIÇO (3.4) --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Coins size={22} weight="duotone" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {editingItemId ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetServiceForm}
                className="rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSaveDetailedService} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Tipo de Serviço
                </label>
                <Select
                  value={serviceCategory}
                  onValueChange={(val) =>
                    setServiceCategory(val as ServiceCategoryType)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="z-[80]">
                    {SERVICE_CATEGORIES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Nome do Serviço *
                </label>
                <Input
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Instalação de Pontos Elétricos"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Detalhamento do escopo ou especificações técnicas..."
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    Qtd
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={serviceQuantity}
                    onChange={(e) => setServiceQuantity(e.target.value)}
                    placeholder="1"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    Val. Unit. *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={serviceUnitValue}
                    onChange={(e) => setServiceUnitValue(e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Total do Serviço
                </span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(
                    Math.max(1, Number(serviceQuantity) || 1) *
                      Math.max(0, Number(serviceUnitValue) || 0),
                  )}
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetServiceForm}
                  className="rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold"
                >
                  <Check size={18} className="mr-1" />
                  {editingItemId ? 'Salvar Alterações' : 'Adicionar na Lista'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
