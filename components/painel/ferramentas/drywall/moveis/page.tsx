// app/painel/ferramentas/drywall/moveis/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import View from '@/components/layout/View';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Plus,
  Trash,
  PencilSimple,
  ShareNetwork,
  Package,
  Cabinet,
} from '@phosphor-icons/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  calculateFurnitureMaterials,
  FurnitureDimensions,
} from '@/utils/calculators/drywallFurniture';
import { FurnitureBlueprint } from '@/components/painel/ferramentas/FurnitureBlueprint';
import FAB from '@/components/ui/FAB';
import Pressable from '@/components/Pressable';
import './Drywall.css'; // reutiliza o CSS

interface FurnitureProject {
  id: string;
  name: string;
  items: (FurnitureDimensions & { id: string; tag: string })[];
}

export default function DrywallFurniturePainel() {
  const router = usePainelRouter();
  const [projects, setProjects] = useLocalStorage<FurnitureProject[]>(
    'drywall-furniture-projects',
    [],
  );
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState('');
  const [tempItems, setTempItems] = useState<
    (FurnitureDimensions & { id: string; tag: string })[]
  >([]);

  // Estado do formulário de item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemTag, setItemTag] = useState('');
  const [itemWidth, setItemWidth] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  const [itemDepth, setItemDepth] = useState(0);
  const [itemShelves, setItemShelves] = useState(0);
  const [itemDividers, setItemDividers] = useState(0);
  const [itemHasBase, setItemHasBase] = useState(true);
  const [itemHasDoors, setItemHasDoors] = useState(false);
  const [itemDoorsQty, setItemDoorsQty] = useState(2);
  const [itemUseWood, setItemUseWood] = useState(false);
  const [itemBoardType, setItemBoardType] = useState<'ST' | 'RU' | 'RF'>('ST');
  const [itemProfileSize, setItemProfileSize] = useState<48 | 70 | 90>(70);

  // Para exibir blueprint do item em edição
  const [previewItem, setPreviewItem] = useState<FurnitureDimensions | null>(
    null,
  );

  const handleAddItem = () => {
    if (itemWidth <= 0 || itemHeight <= 0 || itemDepth <= 0) {
      toast.warning('Preencha largura, altura e profundidade.');
      return;
    }
    const newItem: FurnitureDimensions & { id: string; tag: string } = {
      id: editingItemId || Math.random().toString(36),
      tag: itemTag || 'Móvel',
      width: itemWidth,
      height: itemHeight,
      depth: itemDepth,
      shelves: itemShelves,
      dividers: itemDividers,
      hasBase: itemHasBase,
      hasDoors: itemHasDoors,
      doorsQuantity: itemDoorsQty,
      useWoodReinforcement: itemUseWood,
      boardType: itemBoardType,
      profileSize: itemProfileSize,
    };

    if (editingItemId) {
      setTempItems((prev) =>
        prev.map((i) => (i.id === editingItemId ? newItem : i)),
      );
      setEditingItemId(null);
      toast.success('Item atualizado!');
    } else {
      setTempItems([...tempItems, newItem]);
      toast.success('Item adicionado!');
    }
    resetItemForm();
  };

  const resetItemForm = () => {
    setItemTag('');
    setItemWidth(0);
    setItemHeight(0);
    setItemDepth(0);
    setItemShelves(0);
    setItemDividers(0);
    setItemHasBase(true);
    setItemHasDoors(false);
    setItemDoorsQty(2);
    setItemUseWood(false);
    setItemBoardType('ST');
    setItemProfileSize(70);
    setEditingItemId(null);
    setPreviewItem(null);
  };

  const handleEditItem = (item: (typeof tempItems)[0]) => {
    setEditingItemId(item.id);
    setItemTag(item.tag);
    setItemWidth(item.width);
    setItemHeight(item.height);
    setItemDepth(item.depth);
    setItemShelves(item.shelves);
    setItemDividers(item.dividers);
    setItemHasBase(item.hasBase);
    setItemHasDoors(item.hasDoors);
    setItemDoorsQty(item.doorsQuantity);
    setItemUseWood(item.useWoodReinforcement);
    setItemBoardType(item.boardType || 'ST');
    setItemProfileSize(item.profileSize || 70);
    setPreviewItem(item);
  };

  const handleFinalSave = () => {
    if (!currentProjectName.trim())
      return toast.error('Nome do projeto é obrigatório.');
    if (tempItems.length === 0)
      return toast.error('Adicione pelo menos um móvel.');

    const project: FurnitureProject = {
      id: editingProjectId || Date.now().toString(),
      name: currentProjectName,
      items: tempItems,
    };

    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProjectId ? project : p)),
      );
    } else {
      setProjects([...projects, project]);
    }

    setIsDrawerOpen(false);
    setCurrentProjectName('');
    setTempItems([]);
    setEditingProjectId(null);
    toast.success(editingProjectId ? 'Projeto atualizado!' : 'Projeto salvo!');
  };

  // Cálculo dos materiais de um projeto
  const computeProjectMaterials = (items: typeof tempItems) => {
    const totals: Record<string, { item: string; qtd: number; unit: string }> =
      {};
    items.forEach((item) => {
      const mats = calculateFurnitureMaterials({
        width: item.width,
        height: item.height,
        depth: item.depth,
        shelves: item.shelves,
        dividers: item.dividers,
        hasBase: item.hasBase,
        hasDoors: item.hasDoors,
        doorsQuantity: item.doorsQuantity,
        useWoodReinforcement: item.useWoodReinforcement,
        boardType: item.boardType || 'ST',
        profileSize: item.profileSize || 70,
      });
      mats.forEach((m) => {
        if (m.item.includes('Área Total')) return;
        if (totals[m.item]) {
          totals[m.item].qtd += m.qtd;
        } else {
          totals[m.item] = { item: m.item, qtd: m.qtd, unit: m.unit };
        }
      });
    });
    return Object.values(totals).map((m) => ({
      ...m,
      qtd: Number.isInteger(m.qtd) ? m.qtd : Number(m.qtd.toFixed(2)),
    }));
  };

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );

  const fabConfig = [
    {
      icon: <Plus size={28} weight="duotone" />,
      label: 'Novo Projeto',
      action: () => setIsDrawerOpen(true),
    },
  ];

  return (
    <>
      <PainelAppBar
        title="Móveis em Drywall"
        backAction={() => router.push('drywall')}
      />

      <View
        tag="page"
        className={`p-4 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-40 ${isDrawerOpen ? 'hidden' : 'block'}`}
      >
        <header className="mb-6 text-center">
          <Cabinet
            size={48}
            weight="duotone"
            className="mx-auto text-amber-600 mb-2"
          />
          <h2 className="text-xl font-black text-slate-800 uppercase">
            Projetos de Móveis
          </h2>
          <p className="text-slate-500 text-sm italic">
            Cálculo de chapas, perfis, ferragens e blueprint
          </p>
        </header>

        {projects.map((project) => (
          <View
            key={project.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 relative"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-indigo-900">{project.name}</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-indigo-600 bg-indigo-50 rounded-lg"
                  onClick={() => {
                    setEditingProjectId(project.id);
                    setCurrentProjectName(project.name);
                    setTempItems(project.items);
                    setIsDrawerOpen(true);
                  }}
                >
                  <PencilSimple size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 bg-red-50 rounded-lg"
                  onClick={() => {
                    setProjects((prev) =>
                      prev.filter((p) => p.id !== project.id),
                    );
                    toast.success('Projeto removido');
                  }}
                >
                  <Trash size={18} />
                </Button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {project.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-slate-700">{item.tag}</div>
                    <div className="text-xs text-slate-400">
                      {item.width}x{item.height}x{item.depth}m
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-600">
                    {item.shelves} prat. | {item.dividers} div.
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="w-full text-left text-[11px] font-bold text-indigo-500 uppercase py-2 flex items-center justify-between"
              onClick={() =>
                setExpandedProjectId(
                  expandedProjectId === project.id ? null : project.id,
                )
              }
            >
              Materiais e Blueprint
              <span>{expandedProjectId === project.id ? '▲' : '▼'}</span>
            </button>

            {expandedProjectId === project.id && (
              <div className="mt-3 space-y-4">
                <div className="bg-indigo-50/50 rounded-xl p-3 space-y-2">
                  {computeProjectMaterials(project.items).map((m, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{m.item}</span>
                      <span className="font-bold">
                        {m.qtd} {m.unit}
                      </span>
                    </div>
                  ))}
                </div>
                {project.items.map((item) => (
                  <FurnitureBlueprint key={item.id} dimensions={item} />
                ))}
              </div>
            )}
          </View>
        ))}
      </View>

      {/* Drawer para criar/editar projeto */}
      {isDrawerOpen && (
        <View className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                resetItemForm();
              }}
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={24} />
            </button>
            <h2 className="font-black text-indigo-900 uppercase">
              {editingProjectId ? 'Editar' : 'Novo'} Projeto
            </h2>
            <div className="w-10 h-10" />
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            <div className="max-w-md mx-auto space-y-6 pb-32">
              <label className="block">
                <span className="text-[12px] font-bold text-slate-400 uppercase">
                  Nome do Projeto
                </span>
                <Input
                  placeholder="Ex: Armário Sala"
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                />
              </label>

              {tempItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">
                    Itens do Projeto
                  </span>
                  {tempItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold">{item.tag}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          {item.width}x{item.height}x{item.depth}m
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditItem(item)}
                        >
                          <PencilSimple size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() =>
                            setTempItems((prev) =>
                              prev.filter((i) => i.id !== item.id),
                            )
                          }
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário de item */}
              <div className="bg-white p-4 rounded-xl border space-y-4">
                <h4 className="font-bold text-sm">
                  {editingItemId ? 'Editar' : 'Adicionar'} Móvel
                </h4>
                <Input
                  placeholder="Identificação"
                  value={itemTag}
                  onChange={(e) => setItemTag(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <label>
                    <span className="text-[10px]">Largura (m)</span>
                    <Input
                      type="number"
                      value={itemWidth || ''}
                      onChange={(e) =>
                        setItemWidth(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label>
                    <span className="text-[10px]">Altura (m)</span>
                    <Input
                      type="number"
                      value={itemHeight || ''}
                      onChange={(e) =>
                        setItemHeight(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label>
                    <span className="text-[10px]">Prof. (m)</span>
                    <Input
                      type="number"
                      value={itemDepth || ''}
                      onChange={(e) =>
                        setItemDepth(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-1 text-xs">
                    <span>Prateleiras</span>
                    <Input
                      type="number"
                      className="w-14"
                      value={itemShelves}
                      onChange={(e) =>
                        setItemShelves(parseInt(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <span>Divisórias</span>
                    <Input
                      type="number"
                      className="w-14"
                      value={itemDividers}
                      onChange={(e) =>
                        setItemDividers(parseInt(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={itemHasBase}
                      onChange={(e) => setItemHasBase(e.target.checked)}
                    />{' '}
                    Base
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={itemHasDoors}
                      onChange={(e) => setItemHasDoors(e.target.checked)}
                    />{' '}
                    Portas
                  </label>
                  {itemHasDoors && (
                    <label className="flex items-center gap-1 text-xs">
                      <span>Qtde</span>
                      <Input
                        type="number"
                        className="w-14"
                        value={itemDoorsQty}
                        onChange={(e) =>
                          setItemDoorsQty(parseInt(e.target.value) || 2)
                        }
                      />
                    </label>
                  )}
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={itemUseWood}
                      onChange={(e) => setItemUseWood(e.target.checked)}
                    />{' '}
                    Reforço madeira
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    Placa:
                  </span>
                  {(['ST', 'RU', 'RF'] as const).map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={itemBoardType === t ? 'default' : 'outline'}
                      onClick={() => setItemBoardType(t)}
                      className="text-xs h-7"
                    >
                      {t}
                    </Button>
                  ))}
                  <span className="text-[10px] font-bold text-slate-400 ml-2">
                    Perfil:
                  </span>
                  {([48, 70, 90] as const).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={itemProfileSize === p ? 'default' : 'outline'}
                      onClick={() => setItemProfileSize(p)}
                      className="text-xs h-7"
                    >
                      {p}mm
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddItem}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    {editingItemId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  {editingItemId && (
                    <Button
                      variant="ghost"
                      onClick={resetItemForm}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

                {/* Prévia do blueprint (enquanto edita) */}
                {itemWidth > 0 && itemHeight > 0 && itemDepth > 0 && (
                  <div className="mt-2">
                    <FurnitureBlueprint
                      dimensions={{
                        width: itemWidth,
                        height: itemHeight,
                        depth: itemDepth,
                        shelves: itemShelves,
                        dividers: itemDividers,
                        hasBase: itemHasBase,
                        hasDoors: itemHasDoors,
                        doorsQuantity: itemDoorsQty,
                        useWoodReinforcement: itemUseWood,
                        name: 'Prévia',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t">
            <Pressable
              onClick={handleFinalSave}
              className="w-full h-14 bg-green-600 text-white font-black uppercase rounded-xl flex items-center justify-center gap-2"
            >
              <Check size={20} /> Salvar Projeto
            </Pressable>
          </div>
        </View>
      )}

      <FAB actions={fabConfig} hasBottomNav={true} />
    </>
  );
}
