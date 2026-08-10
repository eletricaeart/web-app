// components/painel/orcamentos/FinancialInvestmentV2Editor.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash,
  PlusCircle,
  CaretDown,
  CaretUp,
  Coins,
  Wrench,
  Package,
  FileText,
  CheckCircle,
} from '@phosphor-icons/react';
import {
  BudgetFinancialsV2,
  CategoryBreakdown,
  SubClauseItem,
  SERVICE_CATEGORIES,
  ServiceCategoryType,
} from '@/lib/types/investment';

interface FinancialInvestmentV2EditorProps {
  data: BudgetFinancialsV2;
  onChange: (updated: BudgetFinancialsV2) => void;
}

export function createEmptyCategory(): CategoryBreakdown {
  return {
    id: crypto.randomUUID(),
    category: 'eletrica',
    categoryLabel: 'Serviços de Elétrica',
    description: '',
    laborValue: 0,
    materialsValue: 0,
    totalValue: 0,
    executionTeam: 'propria',
    subClauses: [],
  };
}

export function createEmptySubClause(): SubClauseItem {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    value: 0,
  };
}

export default function FinancialInvestmentV2Editor({
  data,
  onChange,
}: FinancialInvestmentV2EditorProps) {
  const categories = data.categories || [];

  const updateData = (newCategories: CategoryBreakdown[]) => {
    let totalLabor = 0;
    let totalMaterials = 0;
    let grandTotal = 0;

    const updatedCategories = newCategories.map((cat) => {
      const labor = Number(cat.laborValue || 0);
      const materials = Number(cat.materialsValue || 0);
      const total = labor + materials;

      totalLabor += labor;
      totalMaterials += materials;
      grandTotal += total;

      return {
        ...cat,
        totalValue: total,
      };
    });

    onChange({
      ...data,
      schemaVersion: 2,
      categories: updatedCategories,
      totalLabor,
      totalMaterials,
      grandTotal,
    });
  };

  const handleAddCategory = () => {
    updateData([...categories, createEmptyCategory()]);
  };

  const handleRemoveCategory = (id: string) => {
    updateData(categories.filter((c) => c.id !== id));
  };

  const handleCategoryChange = (
    id: string,
    field: keyof CategoryBreakdown,
    value: any,
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id !== id) return cat;

      if (field === 'category') {
        const selectedCat = SERVICE_CATEGORIES.find((s) => s.id === value);
        return {
          ...cat,
          category: value as ServiceCategoryType,
          categoryLabel: selectedCat
            ? `Serviços de ${selectedCat.label}`
            : cat.categoryLabel,
        };
      }

      return { ...cat, [field]: value };
    });

    updateData(updated);
  };

  const handleAddSubClause = (categoryId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      const sub = cat.subClauses || [];
      return {
        ...cat,
        subClauses: [...sub, createEmptySubClause()],
      };
    });
    updateData(updated);
  };

  const handleRemoveSubClause = (categoryId: string, subClauseId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subClauses: (cat.subClauses || []).filter((s) => s.id !== subClauseId),
      };
    });
    updateData(updated);
  };

  const handleSubClauseChange = (
    categoryId: string,
    subClauseId: string,
    field: keyof SubClauseItem,
    value: any,
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id !== categoryId) return cat;
      const sub = (cat.subClauses || []).map((s) => {
        if (s.id !== subClauseId) return s;
        return { ...s, [field]: value };
      });
      return { ...cat, subClauses: sub };
    });
    updateData(updated);
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Resumo de Totais de Investimento */}
      <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
            <Coins size={22} weight="duotone" />
            <span className="text-xs uppercase font-extrabold tracking-widest">
              Resumo do Investimento (Modelo V2)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-xs text-slate-300 font-medium block mb-1">
                Mão de Obra Total
              </span>
              <span className="text-lg font-bold text-white">
                {formatBRL(data.totalLabor || 0)}
              </span>
            </div>

            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-xs text-slate-300 font-medium block mb-1">
                Materiais Total
              </span>
              <span className="text-lg font-bold text-white">
                {formatBRL(data.totalMaterials || 0)}
              </span>
            </div>

            <div className="bg-indigo-500/30 p-3 rounded-xl border border-indigo-400/30">
              <span className="text-xs text-indigo-200 font-medium block mb-1">
                Investimento Total
              </span>
              <span className="text-xl font-black text-amber-300">
                {formatBRL(data.grandTotal || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorias de Serviços */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Categorias & Escopo de Serviços
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCategory}
            className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl"
          >
            <Plus size={18} weight="bold" />
            <span>Adicionar Serviço</span>
          </Button>
        </div>

        {categories.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Wrench
              size={36}
              className="mx-auto text-slate-400 mb-2"
              weight="duotone"
            />
            <p className="text-sm text-slate-600 font-semibold">
              Nenhum serviço adicionado ainda.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Clique acima para separar por Elétrica, Pintura, Drywall, etc.
            </p>
          </div>
        )}

        {categories.map((cat, index) => (
          <Card
            key={cat.id}
            className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white"
          >
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Header do Serviço */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">
                      Tipo de Serviço
                    </label>
                    <Select
                      value={cat.category}
                      onValueChange={(val) =>
                        handleCategoryChange(cat.id, 'category', val)
                      }
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">
                      Título Exibido no Documento
                    </label>
                    <Input
                      value={cat.categoryLabel}
                      onChange={(e) =>
                        handleCategoryChange(
                          cat.id,
                          'categoryLabel',
                          e.target.value,
                        )
                      }
                      placeholder="Ex: Serviços de Elétrica da Cozinha"
                      className="bg-slate-50 border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl shrink-0 mt-5"
                >
                  <Trash size={20} />
                </Button>
              </div>

              {/* Descrição / Texto do Escopo */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-600" />
                  Descrição / Detalhamento do Escopo (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={cat.description || ''}
                  onChange={(e) =>
                    handleCategoryChange(cat.id, 'description', e.target.value)
                  }
                  placeholder="Descreva o que está incluso nesta etapa do trabalho..."
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Valores Mão de Obra e Materiais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block flex items-center gap-1">
                    <Wrench size={14} className="text-amber-600" /> Mão de Obra
                    (R$)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cat.laborValue || ''}
                    onChange={(e) =>
                      handleCategoryChange(
                        cat.id,
                        'laborValue',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="0.00"
                    className="bg-white border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block flex items-center gap-1">
                    <Package size={14} className="text-blue-600" /> Materiais
                    (R$)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cat.materialsValue || ''}
                    onChange={(e) =>
                      handleCategoryChange(
                        cat.id,
                        'materialsValue',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="0.00"
                    className="bg-white border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    Subtotal do Serviço
                  </label>
                  <div className="h-10 flex items-center px-3 font-bold text-slate-900 bg-white border border-slate-200 rounded-xl">
                    {formatBRL(
                      (Number(cat.laborValue) || 0) +
                        (Number(cat.materialsValue) || 0),
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-cláusulas / Sub-itens */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={14} className="text-emerald-600" />
                    Sub-itens / Cláusulas Específicas
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddSubClause(cat.id)}
                    className="text-xs text-indigo-600 hover:bg-indigo-50 h-7 px-2 rounded-lg gap-1"
                  >
                    <Plus size={14} /> Adicionar Sub-item
                  </Button>
                </div>

                {(cat.subClauses || []).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm"
                  >
                    <Input
                      value={sub.title}
                      onChange={(e) =>
                        handleSubClauseChange(
                          cat.id,
                          sub.id,
                          'title',
                          e.target.value,
                        )
                      }
                      placeholder="Título da cláusula/sub-item (ex: Instalação de Quadros)"
                      className="bg-white border-slate-200 rounded-lg text-xs font-semibold flex-1"
                    />
                    <Input
                      value={sub.description || ''}
                      onChange={(e) =>
                        handleSubClauseChange(
                          cat.id,
                          sub.id,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder="Descrição opcional..."
                      className="bg-white border-slate-200 rounded-lg text-xs flex-[2]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSubClause(cat.id, sub.id)}
                      className="text-slate-400 hover:text-red-600 h-8 w-8 rounded-lg shrink-0"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
