// components/painel/orcamentos/InvestmentCategoryEditor.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash, ListPlus } from '@phosphor-icons/react';
import {
  InvestmentCategory,
  InvestmentItem,
  getCategoryGrossValue,
  getCategoryNetValue,
  formatCurrency,
} from '@/lib/types/investment';

interface InvestmentCategoryEditorProps {
  categories: InvestmentCategory[];
  onChange: (categories: InvestmentCategory[]) => void;
}

function newCategory(): InvestmentCategory {
  return {
    id: crypto.randomUUID(),
    name: '',
    title: '',
    description: '',
    mode: 'fixed',
    fixedValue: 0,
    items: [],
    discount: 0,
    paymentSplit: { enabled: false, entryPercent: 50 },
  };
}

function newItem(): InvestmentItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitValue: 0,
  };
}

export default function InvestmentCategoryEditor({
  categories,
  onChange,
}: InvestmentCategoryEditorProps) {
  const updateCategory = (id: string, patch: Partial<InvestmentCategory>) => {
    onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCategory = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
  };

  const addCategory = () => {
    onChange([...categories, newCategory()]);
  };

  const addItemToCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    updateCategory(categoryId, { items: [...category.items, newItem()] });
  };

  const updateItem = (
    categoryId: string,
    itemId: string,
    patch: Partial<InvestmentItem>,
  ) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    updateCategory(categoryId, {
      items: category.items.map((it) =>
        it.id === itemId ? { ...it, ...patch } : it,
      ),
    });
  };

  const removeItem = (categoryId: string, itemId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    updateCategory(categoryId, {
      items: category.items.filter((it) => it.id !== itemId),
    });
  };

  const grandTotal = categories.reduce(
    (acc, c) => acc + getCategoryNetValue(c),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) => {
        const gross = getCategoryGrossValue(category);
        const net = getCategoryNetValue(category);

        return (
          <div
            key={category.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Input
                value={category.name}
                onChange={(e) =>
                  updateCategory(category.id, { name: e.target.value })
                }
                placeholder="Nome da categoria (ex: Elétrica)"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                className="text-red-400 p-2 shrink-0"
              >
                <Trash size={18} weight="bold" />
              </button>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Título na seção Investimento (opcional)
              </span>
              <Input
                value={category.title}
                onChange={(e) =>
                  updateCategory(category.id, { title: e.target.value })
                }
                placeholder={`Padrão: "${category.name || 'Categoria'} (Mão de Obra)"`}
              />
            </label>

            {/* --- Alternância Fechado / Por Itens --- */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => updateCategory(category.id, { mode: 'fixed' })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                  category.mode === 'fixed'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-slate-400'
                }`}
              >
                Valor Fechado
              </button>
              <button
                type="button"
                onClick={() => updateCategory(category.id, { mode: 'items' })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                  category.mode === 'items'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-slate-400'
                }`}
              >
                Por Itens
              </button>
            </div>

            {category.mode === 'fixed' ? (
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Valor (Mão de obra)
                </span>
                <Input
                  type="number"
                  value={category.fixedValue || ''}
                  onChange={(e) =>
                    updateCategory(category.id, {
                      fixedValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0,00"
                />
              </label>
            ) : (
              <div className="flex flex-col gap-2">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_60px_80px_32px] gap-2 items-center"
                  >
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(category.id, item.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrição do item"
                      className="h-9 text-xs"
                    />
                    <Input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) =>
                        updateItem(category.id, item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Qtd"
                      className="h-9 text-xs"
                    />
                    <Input
                      type="number"
                      value={item.unitValue || ''}
                      onChange={(e) =>
                        updateItem(category.id, item.id, {
                          unitValue: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Valor un."
                      className="h-9 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(category.id, item.id)}
                      className="text-red-400"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addItemToCategory(category.id)}
                  className="text-indigo-600 text-xs font-bold justify-start"
                >
                  <ListPlus size={16} className="mr-1" /> Adicionar Item
                </Button>

                <div className="text-right text-xs text-slate-400">
                  Subtotal:{' '}
                  <b className="text-slate-700">{formatCurrency(gross)}</b>
                </div>
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Descrição adicional (opcional)
              </span>
              <textarea
                value={category.description}
                onChange={(e) =>
                  updateCategory(category.id, { description: e.target.value })
                }
                placeholder="Texto extra que aparece na seção Investimento, abaixo do valor..."
                className="w-full text-sm p-2 rounded-lg border border-slate-200 min-h-[70px]"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-red-400 uppercase">
                Desconto nesta categoria (opcional)
              </span>
              <Input
                type="number"
                value={category.discount || ''}
                onChange={(e) =>
                  updateCategory(category.id, {
                    discount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0,00"
                className="text-red-500"
              />
            </label>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Valor desta categoria
              </span>
              <span className="text-lg font-black text-indigo-700">
                {formatCurrency(net)}
              </span>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={addCategory}
        className="border-dashed border-2 text-indigo-600 font-bold"
      >
        <Plus size={18} className="mr-2" /> Adicionar Categoria de Investimento
      </Button>

      {categories.length > 0 && (
        <div className="flex justify-between items-center bg-indigo-50 rounded-2xl p-4">
          <span className="text-sm font-bold text-indigo-700 uppercase">
            Total do Investimento
          </span>
          <span className="text-xl font-black text-indigo-700">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      )}
    </div>
  );
}
