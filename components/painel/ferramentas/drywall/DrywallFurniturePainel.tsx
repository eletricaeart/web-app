// components/painel/ferramentas/drywall/DrywallFurniturePainel.tsx
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
  Tray,
  ShareNetwork,
  Package,
} from '@phosphor-icons/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  calculateFurnitureMaterials,
  FurnitureDimensions,
} from '@/utils/calculators/drywallFurniture';
import { FurnitureBlueprint } from '@/components/painel/ferramentas/FurnitureBlueprint';
import FAB from '@/components/ui/FAB';
import Pressable from '@/components/Pressable';
import '../Drywall.css'; // CSS compartilhado

// --- Tipos ---
interface FurnitureItem extends FurnitureDimensions {
  id: string;
  tag: string;
  boardType?: 'ST' | 'RU' | 'RF';
  profileSize?: 48 | 70 | 90;
}

interface FurnitureProject {
  id: string;
  name: string;
  items: FurnitureItem[];
}

export default function DrywallFurniturePainel() {
  const router = usePainelRouter();

  // Persistência
  const [projects, setProjects] = useLocalStorage<FurnitureProject[]>(
    'drywall-furniture-projects',
    [],
  );

  // Estados de edição
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState('');
  const [tempItems, setTempItems] = useState<FurnitureItem[]>([]);

  // Estados do formulário de item
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

  // Estado expandido para visualizar materiais/blueprint
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );

  // --- Funções do formulário de item ---
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
  };

  const handleAddItem = () => {
    if (itemWidth <= 0 || itemHeight <= 0 || itemDepth <= 0) {
      toast.warning('Preencha largura, altura e profundidade.');
      return;
    }

    const newItem: FurnitureItem = {
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

  const handleEditItem = (item: FurnitureItem) => {
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
  };

  // --- Salvar projeto ---
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

  // --- Cálculo de materiais do projeto ---
  const computeProjectMaterials = (items: FurnitureItem[]) => {
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

  // --- Compartilhamento (WhatsApp) ---
  const handleShareProject = (project: FurnitureProject) => {
    const materials = computeProjectMaterials(project.items);
    let text = `*ELÉTRICA & ART*\n*Projeto de Móveis em Drywall*\n\n`;
    text += `*${project.name.toUpperCase()}*\n\n`;
    project.items.forEach((item) => {
      text += `• ${item.tag}: ${item.width}x${item.height}x${item.depth}m`;
      if (item.shelves) text += ` | ${item.shelves} prat.`;
      if (item.dividers) text += ` | ${item.dividers} div.`;
      if (item.hasDoors) text += ` | ${item.doorsQuantity} portas`;
      text += '\n';
    });
    text += `\n*LISTA DE MATERIAIS*\n`;
    materials.forEach((m) => {
      text += `• ${m.item}: ${m.qtd} ${m.unit}\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- FAB ---
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
        backAction={() => router.push('ferramentas.drywall')}
      />

      {/* Página principal */}
      <View
        tag="page"
        className={`p-4 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-40 ${
          isDrawerOpen ? 'hidden' : 'block'
        }`}
      >
        <header className="mb-6 text-center">
          <Tray
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

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <Tray
              size={48}
              weight="duotone"
              className="mx-auto text-slate-300 mb-3"
            />
            <p className="text-slate-500 font-bold">Nenhum projeto ainda</p>
            <p className="text-sm text-slate-400">
              Clique no botão + para criar seu primeiro móvel
            </p>
          </div>
        ) : (
          projects.map((project) => (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 bg-green-50 rounded-lg"
                    onClick={() => handleShareProject(project)}
                  >
                    <ShareNetwork size={18} />
                  </Button>
                </div>
              </div>

              {/* Lista de itens do projeto */}
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
                        {item.shelves > 0 && ` | ${item.shelves} prat.`}
                        {item.dividers > 0 && ` | ${item.dividers} div.`}
                        {item.hasDoors && ` | ${item.doorsQuantity} portas`}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-amber-600">
                      {item.boardType} | {item.profileSize}mm
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão expandir */}
              <button
                type="button"
                className="w-full text-left text-[11px] font-bold text-indigo-500 uppercase py-2 flex items-center justify-between mt-2"
                onClick={() =>
                  setExpandedProjectId(
                    expandedProjectId === project.id ? null : project.id,
                  )
                }
              >
                <span>Materiais e Blueprint</span>
                <span>{expandedProjectId === project.id ? '▲' : '▼'}</span>
              </button>

              {expandedProjectId === project.id && (
                <div className="mt-3 space-y-4">
                  {/* Materiais */}
                  <div className="bg-indigo-50/50 rounded-xl p-3 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-2">
                      <Package size={14} /> Lista de Materiais
                    </h4>
                    {computeProjectMaterials(project.items).map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b border-indigo-100/50 pb-1 last:border-0"
                      >
                        <span className="text-slate-600">{m.item}</span>
                        <span className="font-bold text-indigo-700">
                          {m.qtd} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Blueprints de cada item */}
                  {project.items.map((item) => (
                    <div key={item.id}>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-1">
                        {item.tag}
                      </h5>
                      <FurnitureBlueprint dimensions={item} />
                    </div>
                  ))}
                </div>
              )}
            </View>
          ))
        )}
      </View>

      {/* Drawer de criação/edição de projeto */}
      {isDrawerOpen && (
        <View className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setTempItems([]);
                setEditingProjectId(null);
                resetItemForm();
              }}
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={24} weight="bold" className="text-slate-600" />
            </button>
            <h2 className="font-black text-indigo-900 uppercase">
              {editingProjectId ? 'Editar' : 'Novo'} Projeto
            </h2>
            <div className="w-10 h-10" />
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            <div className="max-w-md mx-auto space-y-6 pb-32">
              {/* Nome do projeto */}
              <label className="block">
                <span className="text-[12px] font-bold text-slate-400 uppercase">
                  Nome do Projeto
                </span>
                <Input
                  placeholder="Ex: Armário Sala"
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                  className="bg-white"
                />
              </label>

              {/* Itens temporários */}
              {tempItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">
                    Itens do Projeto
                  </span>
                  {tempItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <span className="font-bold text-sm">{item.tag}</span>
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
              <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-700">
                  {editingItemId ? 'Editar' : 'Adicionar'} Móvel
                </h4>

                <Input
                  placeholder="Identificação (ex: Prateleira 1)"
                  value={itemTag}
                  onChange={(e) => setItemTag(e.target.value)}
                />

                <div className="grid grid-cols-3 gap-2">
                  <label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Largura (m)
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={itemWidth || ''}
                      onChange={(e) =>
                        setItemWidth(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Altura (m)
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={itemHeight || ''}
                      onChange={(e) =>
                        setItemHeight(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Prof. (m)
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
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

                <div className="flex flex-wrap gap-2 items-center">
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

          {/* Botão salvar projeto */}
          <div className="p-4 bg-white border-t">
            <Pressable
              onClick={handleFinalSave}
              className="w-full h-14 bg-green-600 text-white font-black uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg"
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
