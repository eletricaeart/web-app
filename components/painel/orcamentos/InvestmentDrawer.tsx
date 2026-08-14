// components/painel/orcamentos/InvestmentDrawer.tsx
'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  MagnifyingGlass,
  Hammer,
  BookmarkSimple,
  Sparkle,
  Copy,
  CheckCircle,
  Sliders,
  CheckFat,
  ArrowSquareOut,
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
import {
  InvestmentCategory,
  BudgetFinancialsV2,
  BudgetOption,
  CategoryBreakdown,
  DetailedServiceItem,
  SERVICE_CATEGORIES,
  ServiceCategoryType,
  getInvestmentTotal,
  formatCurrency,
} from '@/lib/types/investment';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { ServicoInsumo } from '@/components/painel/servicos/ServicosPainel';
import { toast } from 'sonner';

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
  const hasOptions = Boolean(financialV2?.hasOptions);

  // Active option ID ('opcao_a' | 'opcao_b')
  const activeOptionId = financialV2?.activeOptionId || 'opcao_a';
  const selectedOptionId = financialV2?.selectedOptionId;

  // Catálogo de Serviços & Insumos
  const { data: catalogItems, save: saveCatalogItem } =
    useEASyncSupabase<ServicoInsumo>('servicos_insumos');

  // Recupera as opções existentes ou inicializa
  const currentOptions: BudgetOption[] = useMemo(() => {
    if (
      !hasOptions ||
      !financialV2?.options ||
      financialV2.options.length === 0
    ) {
      return [];
    }
    return financialV2.options;
  }, [hasOptions, financialV2?.options]);

  // Opção ativa atual
  const activeOption: BudgetOption | undefined = useMemo(() => {
    if (!hasOptions) return undefined;
    return (
      currentOptions.find((o) => o.id === activeOptionId) || currentOptions[0]
    );
  }, [hasOptions, currentOptions, activeOptionId]);

  // Categorias em exibição (se for dupla opção, usa a da aba ativa; senão usa as categorias gerais)
  const activeCategories: CategoryBreakdown[] = useMemo(() => {
    if (hasOptions && activeOption) {
      return activeOption.categories || [];
    }
    return financialV2?.categories || [];
  }, [hasOptions, activeOption, financialV2?.categories]);

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

  // Estado do Modal "Novo Serviço / Insumo"
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form unificado de adição/edição
  const [itemType, setItemType] = useState<'servico' | 'insumo'>('servico');
  const [serviceCategory, setServiceCategory] =
    useState<ServiceCategoryType>('eletrica');
  const [serviceName, setServiceName] = useState('');
  const [serviceUnit, setServiceUnit] = useState('un.');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState<number | string>(1);
  const [serviceUnitValue, setServiceUnitValue] = useState<number | string>('');
  const [saveToCatalog, setSaveToCatalog] = useState(false);

  // Busca rápida no Catálogo
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);

  // Título editável da opção
  const [isEditingOptionTitle, setIsEditingOptionTitle] = useState(false);
  const [tempOptionTitle, setTempOptionTitle] = useState('');

  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return catalogItems.slice(0, 8);
    const term = catalogSearch.toLowerCase().trim();
    return catalogItems.filter(
      (it) =>
        (it.nome || '').toLowerCase().includes(term) ||
        (it.descricao || '').toLowerCase().includes(term) ||
        (it.unidade || '').toLowerCase().includes(term),
    );
  }, [catalogItems, catalogSearch]);

  // --- ATIVAR / DESATIVAR DUPLA OPÇÃO ---
  const handleEnableDualOptions = () => {
    if (!onChangeV2) return;

    const baseCats = financialV2?.categories || [];
    let baseLabor = 0;
    let baseMaterials = 0;
    let baseGrand = 0;
    baseCats.forEach((c) => {
      baseLabor += Number(c.laborValue || 0);
      baseMaterials += Number(c.materialsValue || 0);
      baseGrand += Number(c.totalValue || 0);
    });

    const optA: BudgetOption = {
      id: 'opcao_a',
      title: 'Opção 1 - Padrão (Sem Material)',
      categories: JSON.parse(JSON.stringify(baseCats)),
      totalLabor: baseLabor,
      totalMaterials: baseMaterials,
      grandTotal: baseGrand,
    };

    const optB: BudgetOption = {
      id: 'opcao_b',
      title: 'Opção 2 - Completa (Chave na Mão)',
      categories: JSON.parse(JSON.stringify(baseCats)),
      totalLabor: baseLabor,
      totalMaterials: baseMaterials,
      grandTotal: baseGrand,
    };

    onChangeV2({
      schemaVersion: 2,
      hasOptions: true,
      activeOptionId: 'opcao_a',
      selectedOptionId: undefined,
      options: [optA, optB],
      categories: optA.categories,
      totalLabor: optA.totalLabor,
      totalMaterials: optA.totalMaterials,
      grandTotal: optA.grandTotal,
      generalNotes: financialV2?.generalNotes,
      paymentConditions: financialV2?.paymentConditions,
      validityDays: financialV2?.validityDays,
    });

    toast.success('Dupla Opção ativada! Configure a Opção 1 e a Opção 2.');
  };

  const handleDisableDualOptions = () => {
    if (!onChangeV2) return;

    // Manter as categorias da opção que estiver ativa ou aprovada
    const targetCats = activeCategories;
    let labor = 0;
    let materials = 0;
    let grand = 0;
    targetCats.forEach((c) => {
      labor += Number(c.laborValue || 0);
      materials += Number(c.materialsValue || 0);
      grand += Number(c.totalValue || 0);
    });

    onChangeV2({
      schemaVersion: 2,
      hasOptions: false,
      activeOptionId: undefined,
      selectedOptionId: undefined,
      options: undefined,
      categories: targetCats,
      totalLabor: labor,
      totalMaterials: materials,
      grandTotal: grand,
      generalNotes: financialV2?.generalNotes,
      paymentConditions: financialV2?.paymentConditions,
      validityDays: financialV2?.validityDays,
    });

    toast.info('Modo de opção única restaurado.');
  };

  // Mudar aba de opção ativa
  const handleSwitchOptionTab = (optId: string) => {
    if (!onChangeV2 || !financialV2) return;
    const targetOpt = (financialV2.options || []).find((o) => o.id === optId);

    onChangeV2({
      ...financialV2,
      activeOptionId: optId,
      // Se não há opção escolhida pelo cliente, refletir a aba ativa no grandTotal
      categories: targetOpt ? targetOpt.categories : financialV2.categories,
      totalLabor: targetOpt ? targetOpt.totalLabor : financialV2.totalLabor,
      totalMaterials: targetOpt
        ? targetOpt.totalMaterials
        : financialV2.totalMaterials,
      grandTotal: targetOpt ? targetOpt.grandTotal : financialV2.grandTotal,
    });
  };

  // Salvar título customizado da opção
  const handleSaveOptionTitle = (optId: string, newTitle: string) => {
    if (!onChangeV2 || !financialV2 || !financialV2.options) return;
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const updatedOptions = financialV2.options.map((o) =>
      o.id === optId ? { ...o, title: trimmed } : o,
    );

    onChangeV2({
      ...financialV2,
      options: updatedOptions,
    });
    setIsEditingOptionTitle(false);
    toast.success('Título da opção atualizado.');
  };

  // Copiar itens entre opções
  const handleCopyOptionItems = (fromId: string, toId: string) => {
    if (!onChangeV2 || !financialV2 || !financialV2.options) return;
    const sourceOpt = financialV2.options.find((o) => o.id === fromId);
    if (!sourceOpt) return;

    const updatedOptions = financialV2.options.map((o) => {
      if (o.id !== toId) return o;
      return {
        ...o,
        categories: JSON.parse(JSON.stringify(sourceOpt.categories || [])),
        totalLabor: sourceOpt.totalLabor,
        totalMaterials: sourceOpt.totalMaterials,
        grandTotal: sourceOpt.grandTotal,
      };
    });

    const active =
      updatedOptions.find((o) => o.id === activeOptionId) || updatedOptions[0];

    onChangeV2({
      ...financialV2,
      options: updatedOptions,
      categories: active.categories,
      totalLabor: active.totalLabor,
      totalMaterials: active.totalMaterials,
      grandTotal: active.grandTotal,
    });

    toast.success(
      `Itens copiados para a ${toId === 'opcao_a' ? 'Opção 1' : 'Opção 2'}!`,
    );
  };

  // Marcar opção como aprovada pelo cliente
  const handleSetSelectedOption = (optId: string | undefined) => {
    if (!onChangeV2 || !financialV2) return;
    const chosen = (financialV2.options || []).find((o) => o.id === optId);

    onChangeV2({
      ...financialV2,
      selectedOptionId: optId,
      ...(chosen
        ? {
            categories: chosen.categories,
            totalLabor: chosen.totalLabor,
            totalMaterials: chosen.totalMaterials,
            grandTotal: chosen.grandTotal,
          }
        : {}),
    });

    if (optId) {
      toast.success('Opção marcada como aprovada pelo cliente!');
    } else {
      toast.info('Status de aprovação desmarcado (proposta em aberto).');
    }
  };

  // Helper para salvar novas categorias (seja no modo de opções ou modo padrão)
  const commitCategoriesUpdate = (updatedCategories: CategoryBreakdown[]) => {
    if (!onChangeV2 || !financialV2) return;

    let totalLabor = 0;
    let totalMaterials = 0;
    let grandTotal = 0;

    updatedCategories.forEach((cat) => {
      totalLabor += Number(cat.laborValue || 0);
      totalMaterials += Number(cat.materialsValue || 0);
      grandTotal += Number(cat.totalValue || 0);
    });

    if (hasOptions && financialV2.options) {
      const updatedOptions = financialV2.options.map((opt) => {
        if (opt.id !== activeOptionId) return opt;
        return {
          ...opt,
          categories: updatedCategories,
          totalLabor,
          totalMaterials,
          grandTotal,
        };
      });

      // Se a opção editada for a aprovada ou se nenhuma estiver aprovada
      const isApprovedOrActive =
        financialV2.selectedOptionId === activeOptionId ||
        !financialV2.selectedOptionId;

      onChangeV2({
        ...financialV2,
        options: updatedOptions,
        ...(isApprovedOrActive
          ? {
              categories: updatedCategories,
              totalLabor,
              totalMaterials,
              grandTotal,
            }
          : {}),
      });
    } else {
      onChangeV2({
        schemaVersion: 2,
        hasOptions: false,
        categories: updatedCategories,
        totalLabor,
        totalMaterials,
        grandTotal,
        generalNotes: financialV2.generalNotes,
        paymentConditions: financialV2.paymentConditions,
        validityDays: financialV2.validityDays,
      });
    }
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
    setItemType('servico');
    setServiceName('');
    setServiceUnit('un.');
    setServiceDescription('');
    setServiceQuantity(1);
    setServiceUnitValue('');
    setSaveToCatalog(false);
    setCatalogSearch('');
    setIsCatalogPickerOpen(false);
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
    setItemType(item.tipo || 'servico');
    setServiceCategory(catType);
    setServiceName(item.name);
    setServiceUnit(item.unidade || 'un.');
    setServiceDescription(item.description || '');
    setServiceQuantity(item.quantity);
    setServiceUnitValue(item.unitValue);
    setSaveToCatalog(false);
    setIsCatalogPickerOpen(false);
    setIsServiceModalOpen(true);
  };

  // Selecionar item do catálogo existente
  const handleSelectFromCatalog = (item: ServicoInsumo) => {
    setItemType(item.tipo || 'servico');
    setServiceName(item.nome || '');
    setServiceUnit(item.unidade || 'un.');
    setServiceDescription(item.descricao || '');
    if (item.custo && item.custo > 0) {
      setServiceUnitValue(item.custo);
    }
    setIsCatalogPickerOpen(false);
    toast.info(`Item "${item.nome}" carregado do catálogo.`);
  };

  // Salvar serviço (Novo ou Edição) no V2
  const handleSaveDetailedService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceName.trim()) {
      toast.error('O nome do item é obrigatório.');
      return;
    }
    const qty = Math.max(0.01, Number(serviceQuantity) || 1);
    const unitVal = Math.max(0, Number(serviceUnitValue) || 0);
    const totalItemVal = qty * unitVal;

    // Se usuário marcou para salvar no catálogo geral
    if (saveToCatalog && !editingItemId) {
      try {
        await saveCatalogItem(
          {
            tipo: itemType,
            nome: serviceName.trim(),
            unidade: serviceUnit.trim() || 'un.',
            custo: unitVal,
            descricao: serviceDescription.trim(),
          },
          'create',
        );
        toast.success('Item salvo no Catálogo de Serviços & Insumos!');
      } catch (err) {
        console.error('Erro ao salvar no catálogo:', err);
      }
    }

    let updatedCategories = [...activeCategories];

    if (editingItemId) {
      // Atualizar item existente
      updatedCategories = updatedCategories.map((cat) => {
        const hasItem = (cat.items || []).some((i) => i.id === editingItemId);
        if (!hasItem) return cat;

        const newItems = (cat.items || []).map((i) => {
          if (i.id !== editingItemId) return i;
          return {
            ...i,
            tipo: itemType,
            name: serviceName.trim(),
            unidade: serviceUnit.trim() || 'un.',
            description: serviceDescription.trim(),
            quantity: qty,
            unitValue: unitVal,
            laborValue: itemType === 'servico' ? totalItemVal : 0,
            totalValue: totalItemVal,
          };
        });

        // Recalcular totais da categoria
        const catLabor = newItems
          .filter((it) => it.tipo !== 'insumo')
          .reduce((acc, item) => acc + (item.totalValue || 0), 0);

        const catMaterials = newItems
          .filter((it) => it.tipo === 'insumo')
          .reduce((acc, item) => acc + (item.totalValue || 0), 0);

        return {
          ...cat,
          items: newItems,
          laborValue: catLabor,
          materialsValue: catMaterials,
          totalValue: catLabor + catMaterials,
        };
      });
    } else {
      // Adicionar novo item
      const newItem: DetailedServiceItem = {
        id: crypto.randomUUID(),
        tipo: itemType,
        name: serviceName.trim(),
        unidade: serviceUnit.trim() || 'un.',
        description: serviceDescription.trim(),
        quantity: qty,
        unitValue: unitVal,
        laborValue: itemType === 'servico' ? totalItemVal : 0,
        totalValue: totalItemVal,
      };

      const existingCatIndex = updatedCategories.findIndex(
        (c) => c.category === serviceCategory,
      );

      if (existingCatIndex >= 0) {
        const cat = updatedCategories[existingCatIndex];
        const newItems = [...(cat.items || []), newItem];

        const catLabor = newItems
          .filter((it) => it.tipo !== 'insumo')
          .reduce((acc, item) => acc + (item.totalValue || 0), 0);

        const catMaterials = newItems
          .filter((it) => it.tipo === 'insumo')
          .reduce((acc, item) => acc + (item.totalValue || 0), 0);

        updatedCategories[existingCatIndex] = {
          ...cat,
          items: newItems,
          laborValue: catLabor,
          materialsValue: catMaterials,
          totalValue: catLabor + catMaterials,
        };
      } else {
        // Criar nova categoria para o tipo de serviço
        const catObj = SERVICE_CATEGORIES.find((s) => s.id === serviceCategory);
        const catLabor = itemType === 'servico' ? totalItemVal : 0;
        const catMaterials = itemType === 'insumo' ? totalItemVal : 0;

        const newCat: CategoryBreakdown = {
          id: crypto.randomUUID(),
          category: serviceCategory,
          categoryLabel: catObj ? `Serviços de ${catObj.label}` : 'Serviços',
          description: '',
          laborValue: catLabor,
          materialsValue: catMaterials,
          totalValue: totalItemVal,
          items: [newItem],
        };
        updatedCategories.push(newCat);
      }
    }

    commitCategoriesUpdate(updatedCategories);
    resetServiceForm();
  };

  // Excluir serviço individual
  const handleDeleteServiceItem = (itemId: string) => {
    if (!financialV2 || !onChangeV2) return;

    const updatedCategories = activeCategories
      .map((cat) => {
        const newItems = (cat.items || []).filter((i) => i.id !== itemId);
        const catLabor = newItems
          .filter((it) => it.tipo !== 'insumo')
          .reduce((acc, item) => acc + (item.totalValue || 0), 0);

        const catMaterials = newItems
          .filter((it) => it.tipo === 'insumo')
          .reduce((acc, item) => acc + (item.totalValue || 0), 0);

        return {
          ...cat,
          items: newItems,
          laborValue: catLabor,
          materialsValue: catMaterials,
          totalValue: catLabor + catMaterials,
        };
      })
      .filter(
        (cat) => (cat.items && cat.items.length > 0) || cat.totalValue > 0,
      );

    commitCategoriesUpdate(updatedCategories);
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
          height: expanded ? '84vh' : `${PEEK_HEIGHT}px`,
          maxHeight: '84vh',
        }}
      >
        {/* --- HEADER FIXO NO TOPO DO DRAWER --- */}
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
                    {hasOptions
                      ? 'Dupla Opção'
                      : isV2
                        ? 'Serviços & Insumos'
                        : 'Legado'}
                  </span>
                  {selectedOptionId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle size={12} weight="fill" /> Aprovada
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {hasOptions && activeOption
                    ? `${activeOption.title}: ${formatCurrency(activeOption.grandTotal)}`
                    : `Total: ${formatCurrency(total)}`}
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

        {/* --- PÁGINA SCROLLÁVEL NA VERTICAL --- */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
          style={{
            opacity: expanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        >
          {isV2 ? (
            <>
              {/* --- BANNER / CONTROLE DE DUPLA OPÇÃO --- */}
              {!hasOptions ? (
                <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-slate-50 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                      <Sparkle size={20} weight="fill" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                        Dupla Opção de Orçamento (Proposta A & B)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Apresente duas opções comerciais (ex: Básica vs Completa
                        ou Com/Sem Insumos) no mesmo documento.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleEnableDualOptions}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
                  >
                    <Sparkle size={14} className="mr-1.5" weight="bold" />{' '}
                    Ativar Dupla Opção
                  </Button>
                </div>
              ) : (
                /* DECK DE DUPLA OPÇÃO ATIVADA */
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm p-4 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <Sliders size={18} weight="duotone" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          Dupla Opção Comercial Ativada
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Alterne entre as abas para definir os itens de cada
                          proposta
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDisableDualOptions}
                      className="text-xs text-slate-400 hover:text-red-500 self-end sm:self-auto h-7 px-2"
                    >
                      Desativar Dupla Opção
                    </Button>
                  </div>

                  {/* ABAS SELETORAS DAS OPÇÕES */}
                  <div className="grid grid-cols-2 gap-2">
                    {currentOptions.map((opt) => {
                      const isActive = opt.id === activeOptionId;
                      const isChosen = opt.id === selectedOptionId;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSwitchOptionTab(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all relative ${
                            isActive
                              ? 'bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isChosen && (
                            <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckFat size={10} weight="fill" /> Aprovada
                            </span>
                          )}
                          <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate pr-14">
                            {opt.title}
                          </p>
                          <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                            {formatCurrency(opt.grandTotal)}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {(opt.categories || []).reduce(
                              (sum, c) => sum + (c.items?.length || 0),
                              0,
                            )}{' '}
                            itens inclusos
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* AÇÕES DA OPÇÃO ATIVA (EDITAR TÍTULO, COPIAR ITENS, MARCAR APROVADA) */}
                  {activeOption && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-2.5">
                      {/* Edição do Título */}
                      <div className="flex-1 min-w-[200px]">
                        {isEditingOptionTitle ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={tempOptionTitle}
                              onChange={(e) =>
                                setTempOptionTitle(e.target.value)
                              }
                              placeholder="Nome desta opção..."
                              className="h-8 text-xs bg-white"
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleSaveOptionTitle(
                                  activeOption.id,
                                  tempOptionTitle,
                                )
                              }
                              className="h-8 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingOptionTitle(false)}
                              className="h-8 px-2 text-xs"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {activeOption.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setTempOptionTitle(activeOption.title);
                                setIsEditingOptionTitle(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                              title="Editar nome da opção"
                            >
                              <PencilSimple size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-2">
                        {/* Copiar Itens */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const otherId =
                              activeOption.id === 'opcao_a'
                                ? 'opcao_b'
                                : 'opcao_a';
                            handleCopyOptionItems(otherId, activeOption.id);
                          }}
                          className="h-7 text-[11px] font-semibold gap-1 bg-white dark:bg-slate-800"
                        >
                          <Copy size={13} />
                          Copiar da{' '}
                          {activeOption.id === 'opcao_a'
                            ? 'Opção 2'
                            : 'Opção 1'}
                        </Button>

                        {/* Status de Aprovação do Cliente */}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            handleSetSelectedOption(
                              selectedOptionId === activeOption.id
                                ? undefined
                                : activeOption.id,
                            )
                          }
                          className={`h-7 text-[11px] font-bold gap-1 rounded-lg ${
                            selectedOptionId === activeOption.id
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                        >
                          <CheckFat size={12} weight="fill" />
                          {selectedOptionId === activeOption.id
                            ? 'Aprovada pelo Cliente'
                            : 'Marcar Aprovada'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- LISTAGEM DOS SERVIÇOS ADICIONADOS AGRUPADOS POR TIPO --- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={16} className="text-indigo-600" />
                    {hasOptions && activeOption
                      ? `Itens da ${activeOption.title}`
                      : 'Serviços & Insumos Adicionados'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {activeCategories.reduce(
                      (acc, c) => acc + (c.items?.length || 0),
                      0,
                    )}{' '}
                    item(ns)
                  </span>
                </div>

                {(!activeCategories ||
                  activeCategories.length === 0 ||
                  activeCategories.every(
                    (c) => !c.items || c.items.length === 0,
                  )) && (
                  <div className="p-8 text-center bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Package
                      size={40}
                      className="mx-auto text-indigo-400 mb-2"
                      weight="duotone"
                    />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Nenhum serviço ou insumo adicionado{' '}
                      {hasOptions && activeOption
                        ? `nesta ${activeOption.title}`
                        : ''}
                      .
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Clique no botão{' '}
                      <strong className="text-indigo-600">
                        + Adicionar Item
                      </strong>{' '}
                      abaixo para compor esta proposta.
                    </p>
                  </div>
                )}

                {activeCategories.map((cat) => {
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
                        {items.map((item) => {
                          const isInsumo = item.tipo === 'insumo';
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 gap-3"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                      isInsumo
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                                    }`}
                                  >
                                    {isInsumo ? 'INSUMO' : 'SERVIÇO'}
                                  </span>
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {item.name}
                                  </p>
                                </div>

                                {item.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                                    {item.description}
                                  </p>
                                )}

                                <p className="text-[11px] text-slate-400 mt-1">
                                  Qtd:{' '}
                                  <strong>
                                    {item.quantity} {item.unidade || 'un.'}
                                  </strong>{' '}
                                  • Valor Un.:{' '}
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
                                        handleOpenEditService(
                                          cat.category,
                                          item,
                                        )
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
                          );
                        })}
                      </div>

                      {/* Informações de materiais adicionais */}
                      {cat.materialsValue > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                          <span>Total em Insumos / Materiais:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(cat.materialsValue)}
                          </span>
                        </div>
                      )}
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

        {/* --- FOOTER FIXO COM BOTÃO PARA ADICIONAR SERVIÇOS & INSUMOS --- */}
        {expanded && isV2 && (
          <div className="shrink-0 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center items-center rounded-b-[2.5rem]">
            <Button
              type="button"
              onClick={handleOpenAddService}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold px-6 py-3 rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Plus size={20} weight="bold" />
              <span>
                Adicionar{' '}
                {hasOptions && activeOption
                  ? `na ${activeOption.title}`
                  : 'Serviço / Insumo'}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* --- OVERLAY / MODAL DE ADIÇÃO E EDIÇÃO UNIFICADO (MESMO MODELO DE SERVICOS & INSUMOS) --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-5 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Coins size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {editingItemId
                      ? 'Editar Item'
                      : hasOptions && activeOption
                        ? `Novo Item (${activeOption.title})`
                        : 'Novo Serviço / Insumo'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Componha a mão de obra ou materiais deste investimento
                  </p>
                </div>
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

            {/* SELEÇÃO RÁPIDA DO CATÁLOGO DE SERVIÇOS & INSUMOS */}
            {!editingItemId && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookmarkSimple
                      size={15}
                      weight="bold"
                      className="text-indigo-600"
                    />
                    Puxar do Catálogo Geral
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {catalogItems.length} cadastrados
                  </span>
                </div>

                <div className="relative">
                  <MagnifyingGlass
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setIsCatalogPickerOpen(true);
                    }}
                    onFocus={() => setIsCatalogPickerOpen(true)}
                    placeholder="Buscar serviço ou insumo existente..."
                    className="pl-8 text-xs bg-white dark:bg-slate-900 h-8 rounded-xl"
                  />
                </div>

                {isCatalogPickerOpen && filteredCatalog.length > 0 && (
                  <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredCatalog.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectFromCatalog(item)}
                        className="w-full text-left p-2 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm mr-1.5 ${
                              item.tipo === 'insumo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {item.tipo === 'insumo' ? 'INSUMO' : 'SERVIÇO'}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.nome}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({item.unidade || 'un.'})
                          </span>
                        </div>
                        <span className="font-bold text-indigo-600 shrink-0">
                          {item.custo ? formatCurrency(item.custo) : 'R$ 0,00'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Formulário Principal */}
            <form onSubmit={handleSaveDetailedService} className="space-y-4">
              {/* Seletor de Tipo (Mão de Obra vs Insumo) */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">
                  Tipo do Item *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setItemType('servico')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      itemType === 'servico'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench size={16} weight="bold" />
                    <span>Serviço (Mão de Obra)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType('insumo')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      itemType === 'insumo'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Package size={16} weight="bold" />
                    <span>Insumo (Material)</span>
                  </button>
                </div>
              </div>

              {/* Categoria do Serviço */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Categoria de Atuação *
                </label>
                <Select
                  value={serviceCategory}
                  onValueChange={(val: ServiceCategoryType) =>
                    setServiceCategory(val)
                  }
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="z-[90]">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="text-xs font-medium"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome do Item */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Nome / Título do{' '}
                  {itemType === 'insumo' ? 'Insumo' : 'Serviço'} *
                </label>
                <Input
                  required
                  placeholder={
                    itemType === 'insumo'
                      ? 'Ex: Cabo Flexível 2,5mm 100m, Disjuntor 20A...'
                      : 'Ex: Instalação de Tomada Dupla, Pintura Acrílica...'
                  }
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Grid: Quantidade, Unidade, Valor Unitário */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    value={serviceQuantity}
                    onChange={(e) => setServiceQuantity(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    Unidade
                  </label>
                  <Input
                    placeholder="un., m², m, hora"
                    value={serviceUnit}
                    onChange={(e) => setServiceUnit(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                    Valor Unit. (R$) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={serviceUnitValue}
                    onChange={(e) => setServiceUnitValue(e.target.value)}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-right font-bold text-indigo-600"
                  />
                </div>
              </div>

              {/* Subtotal Calculado */}
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Subtotal deste item:
                </span>
                <span className="font-extrabold text-sm text-indigo-700 dark:text-indigo-300">
                  {formatCurrency(
                    (Number(serviceQuantity) || 1) *
                      (Number(serviceUnitValue) || 0),
                  )}
                </span>
              </div>

              {/* Descrição Detalhada / Escopo */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Descrição Técnica / Escopo (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes adicionais, especificações da marca ou modo de execução..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Checkbox: Salvar no Catálogo Geral */}
              {!editingItemId && (
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveToCatalog}
                    onChange={(e) => setSaveToCatalog(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    Salvar este item também no Catálogo Geral de Serviços &
                    Insumos
                  </span>
                </label>
              )}

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetServiceForm}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold px-5"
                >
                  {editingItemId
                    ? 'Salvar Alterações'
                    : 'Adicionar ao Orçamento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
