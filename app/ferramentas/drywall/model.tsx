// app/ferramentas/drywall/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Wall,
  HardHat,
  Calculator,
  Plus,
  Trash,
  Package,
  Door,
  Browser,
  Check,
  SquareHalf,
} from "@phosphor-icons/react";
import { calculateWallMaterials } from "@/utils/calculators/drywallWall";
import { calculateCeilingMaterials } from "@/utils/calculators/drywallCeiling";
import FAB from "@/components/ui/FAB";
import Pressable from "@/components/Pressable";
import "./drywall.css";

/** --- interfaces --- */
interface Opening {
  id: string;
  type: "door" | "window";
  w: number;
  h: number;
}

interface ServiceInstance {
  id: string;
  type: "wall" | "ceiling";
  tag: string;
  useInsulation?: boolean; // Apenas para paredes
  measures: { w: number; h: number; openings: Opening[] }[];
  totalArea: number;
}

interface Room {
  id: string;
  name: string;
  services: ServiceInstance[];
}

/**
 * --- default DrywallCalculator ---
 *  */
export default function DrywallCalculator() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estados do Formulário (Ambiente)
  const [currentRoomName, setCurrentRoomName] = useState("");

  // Lista temporária de serviços que estão sendo montados no Drawer
  const [tempServices, setTempServices] = useState<ServiceInstance[]>([]);

  // Estado para o serviço que está sendo editado/criado no momento DENTRO do Drawer
  const [activeType, setActiveType] = useState<"wall" | "ceiling">("wall");
  const [activeTag, setActiveTag] = useState("");
  const [activeInsulation, setActiveInsulation] = useState(false);
  const [activeMeasures, setActiveMeasures] = useState<
    { w: number; h: number; openings: Opening[] }[]
  >([{ w: 0, h: 0, openings: [] }]);

  // FAB Configs
  const fabConfig = [
    {
      icon: <Plus size={28} weight="duotone" />,
      label: "Novo Serviço",
      action: () => setIsDrawerOpen(true),
    },
  ];

  /** --- Funções de Manipulação do Drawer --- */

  const addMeasureField = () =>
    setActiveMeasures([...activeMeasures, { w: 0, h: 0, openings: [] }]);

  const addOpening = (measureIndex: number, type: "door" | "window") => {
    const newMeasures = [...activeMeasures];
    newMeasures[measureIndex].openings.push({
      id: Math.random().toString(),
      type,
      w: 0,
      h: 0,
    });
    setActiveMeasures(newMeasures);
  };

  const updateOpening = (
    mIdx: number,
    oIdx: number,
    field: "w" | "h",
    val: number,
  ) => {
    const newMeasures = [...activeMeasures];
    newMeasures[mIdx].openings[oIdx][field] = val;
    setActiveMeasures(newMeasures);
  };

  const addServiceToTempList = () => {
    // Validação: validação básica das medidas
    if (!activeMeasures.every((m) => m.w > 0 && m.h > 0)) {
      toast.warning("Preencha as medidas principais do serviço.");
      return;
    }

    const totalArea = activeMeasures.reduce((acc, m) => {
      const grossArea = m.w * m.h;
      const openingsArea = m.openings.reduce((oAcc, o) => oAcc + o.w * o.h, 0);
      return acc + (grossArea - openingsArea);
    }, 0);

    const newService: ServiceInstance = {
      id: Math.random().toString(36),
      type: activeType,
      tag: activeTag || (activeType === "wall" ? "Parede" : "Forro"),
      useInsulation: activeInsulation,
      measures: [...activeMeasures],
      totalArea,
    };

    setTempServices([...tempServices, newService]);
    // Reseta campos do serviço mas mantém o ambiente
    setActiveTag("");
    setActiveMeasures([{ w: 0, h: 0, openings: [] }]);
    setActiveInsulation(false);
    toast.success("Serviço adicionado à lista!");
  };

  const handleFinalSave = () => {
    // Validação: Verifica se o nome do ambiente está vazio
    if (!currentRoomName.trim())
      return toast.error("Informe o nome do ambiente.");

    if (tempServices.length === 0)
      return toast.error("Adicione pelo menos um serviço.");

    setRooms((prev) => {
      const roomIndex = prev.findIndex(
        (r) => r.name.toLowerCase() === currentRoomName.toLowerCase(),
      );
      if (roomIndex > -1) {
        const updatedRooms = [...prev];
        updatedRooms[roomIndex].services.push(...tempServices);
        return updatedRooms;
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: currentRoomName,
          services: tempServices,
        },
      ];
    });

    setIsDrawerOpen(false);
    setTempServices([]);
    setCurrentRoomName("");
    toast.success("Ambiente salvo no projeto!");
  };

  // CÁLCULO CONSOLIDADO
  const consolidatedMaterials = useMemo(() => {
    let totals: any[] = [];
    // Nota: Para simplificar aqui, estamos somando as áreas totais.
    // Em uma versão avançada, o calculateWallMaterials deve ser chamado para cada serviço.
    rooms.forEach((r) => {
      r.services.forEach((s) => {
        const res =
          s.type === "wall"
            ? calculateWallMaterials({
                wallLength: s.totalArea / 2.8,
                wallHeight: 2.8,
              }) // Cálculo aproximado pela área
            : calculateCeilingMaterials({
                width: Math.sqrt(s.totalArea),
                length: Math.sqrt(s.totalArea),
              });

        // Lógica de merge de arrays (soma de itens iguais) omitida para brevidade,
        // mas aqui você faria o reduce para unificar "Placas", "Parafusos", etc.
        totals = [...totals, ...res];
      });
    });
    return totals;
  }, [rooms]);

  return (
    <>
      <AppBar title="Calculadora Drywall" />
      <View
        tag="page"
        className="p-4 bg-slate-50 min-h-[calc(100dvh_-_72px)] pb-40"
      >
        {/* --- Header e Listagem (Mantidos) --- */}
        <header className="mb-6 text-center">
          <SquareHalf
            size={48}
            weight="duotone"
            className="mx-auto text-indigo-600 mb-2"
          />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Estimativa de Materiais
          </h2>
          <p className="text-slate-500 text-sm italic">
            Cálculos baseados em padrões técnicos ABNT
          </p>
        </header>

        {/* --- Drawer --- */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} className="">
          <DrawerContent className="bg-white h-[95vh] p-4 overflow-y-scroll data-[vaul-drawer]:rounded-[2rem_2rem_0_0_!important]">
            <div className="mx-auto w-full max-w-md space-y-6 pb-10">
              <DrawerHeader className="px-0 border-b pb-4">
                <DrawerTitle className="flex flex-col gap-4 text-xl font-black text-indigo-900 uppercase items-center justify-between">
                  <span>Adicionar Ambiente</span>
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[12px]">
                    {tempServices.length} serviços na lista
                  </div>
                </DrawerTitle>
              </DrawerHeader>

              {/* 1. NOME DO AMBIENTE */}
              <label className="block">
                <span className="text-[12px] font-bold text-slate-400 uppercase ml-1">
                  Nome do Cômodo
                </span>
                <Input
                  placeholder="Ex: Sala de Estar"
                  value={currentRoomName}
                  onChange={(e) => setCurrentRoomName(e.target.value)}
                />
              </label>

              {/* 2. LISTA TEMPORÁRIA (Preview do que está sendo montado) */}
              {tempServices.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {tempServices.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 bg-slate-900 text-white p-2 rounded-xl text-[12px] flex items-center gap-2"
                    >
                      {s.type === "wall" ? (
                        <Wall size={14} />
                      ) : (
                        <HardHat size={14} />
                      )}
                      {s.tag} | {s.totalArea.toFixed(2)}m²
                      <Trash
                        size={14}
                        className="text-red-400"
                        onClick={() =>
                          setTempServices(
                            tempServices.filter((_, i) => i !== idx),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 3. CONFIGURAÇÃO DO SERVIÇO ATUAL */}
              <div className="flex flex-col gap-4 bg-slate-50 px-4 pt-4 rounded-2xl border border-slate-200 ">
                <View
                  tag="tab-grid"
                  className="flex bg-white rounded-xl p-1 border"
                >
                  <Button
                    variant={activeType === "wall" ? "default" : "outline"}
                    onClick={() => setActiveType("wall")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0.9rem_0_0_0.9rem] text-[12px] font-bold uppercase transition-all ${activeType === "wall" ? "bg-[#00559c] text-white shadow-md" : "text-slate-400"}`}
                  >
                    <Wall size={18} /> Parede
                  </Button>
                  <Button
                    variant={activeType === "ceiling" ? "default" : "outline"}
                    onClick={() => setActiveType("ceiling")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[0_0.9rem_0.9rem_0] text-[12px] font-bold uppercase transition-all ${activeType === "ceiling" ? "bg-[#00559c] text-white shadow-md" : "text-slate-400"}`}
                  >
                    <HardHat size={18} /> Forro
                  </Button>
                </View>

                <Input
                  placeholder="Identificação (Ex: Parede Leste)"
                  value={activeTag}
                  onChange={(e) => setActiveTag(e.target.value)}
                  className="bg-white border-slate-200"
                />

                {/* Opção de Lã para Parede */}
                {activeType === "wall" && (
                  <div className="flex items-center justify-between p-3 rounded-xl">
                    <Label
                      htmlFor="incluir-la-mode"
                      className="flex items-center justify-between w-full text-[12px] font-bold text-mauve-700 capitalize cursor-pointer"
                    >
                      Incluir Lã de Vidro/Pet
                      <Switch
                        id="incluir-la-mode"
                        checked={activeInsulation}
                        onCheckedChange={(checked) =>
                          setActiveInsulation(checked)
                        }
                        className="data-[state=checked]:bg-[#00559C] data-[state=unchecked]:bg-slate-300"
                      />
                    </Label>
                  </div>
                )}

                {/* Medidas Dinâmicas */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
                    Medidas (Soma Automática)
                  </span>
                  {activeMeasures.map((m, mIdx) => (
                    <View
                      tag="measure-card"
                      key={mIdx}
                      className="flex flex-col space-y-2 p-3 bg-white rounded-xl border border-slate-100 relative shadow-sm"
                    >
                      {/* --- componente inptus de medidas principais --- */}
                      <View
                        tag="main-measure-inputs"
                        className="grid grid-cols-2 gap-2"
                      >
                        <label>
                          <span className="text-xs font-bold text-slate-400 capitalize">
                            {activeType === "wall"
                              ? "Largura (m)"
                              : "Largura (m)"}
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={m.w || ""}
                            onChange={(e) => {
                              const nm = [...activeMeasures];
                              nm[mIdx].w = parseFloat(e.target.value) || 0;
                              setActiveMeasures(nm);
                            }}
                          />
                        </label>
                        <label>
                          <span className="text-xs font-bold text-slate-400 capitalize">
                            {activeType === "wall"
                              ? "Altura (m)"
                              : "Comprimento (m)"}
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={m.h || ""}
                            onChange={(e) => {
                              const nm = [...activeMeasures];
                              nm[mIdx].h = parseFloat(e.target.value) || 0;
                              setActiveMeasures(nm);
                            }}
                          />
                        </label>
                      </View>
                      {/* --- end componente inptus de medidas principais --- */}

                      {/* Vãos (Portas/Janelas) apenas para parede e no primeiro card de medida */}
                      {activeType === "wall" && mIdx === 0 && (
                        <View
                          tag="add-portas-e-janelas"
                          className="space-y-2 mt-2 pt-2 border-t border-dashed"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-orange-500 capitalize">
                              Descontar Vãos
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => addOpening(mIdx, "door")}
                                className="p-1 bg-orange-50 text-orange-600 rounded flex items-center gap-1 text-[12px] font-bold"
                              >
                                <Door size={16} /> + Porta
                              </button>
                              <button
                                onClick={() => addOpening(mIdx, "window")}
                                className="p-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1 text-[12px] font-bold"
                              >
                                <Browser size={16} /> + Janela
                              </button>
                            </div>
                          </div>
                          {m.openings.map((o, oIdx) => (
                            <div
                              key={o.id}
                              className="flex gap-2 items-center animate-in slide-in-from-right-2"
                            >
                              <span className="text-[12px] uppercase font-bold text-slate-400">
                                {o.type === "door" ? "P" : "J"}
                              </span>
                              <Input
                                className="h-7 text-[12px]"
                                type="number"
                                placeholder="largura"
                                onChange={(e) =>
                                  updateOpening(
                                    mIdx,
                                    oIdx,
                                    "w",
                                    parseFloat(e.target.value),
                                  )
                                }
                              />
                              <Input
                                className="h-7 text-[12px]"
                                type="number"
                                placeholder="altura"
                                onChange={(e) =>
                                  updateOpening(
                                    mIdx,
                                    oIdx,
                                    "h",
                                    parseFloat(e.target.value),
                                  )
                                }
                              />
                              <View
                                tag="oi"
                                className="grid items-center justify-center bg-red-100 rounded-full p-1"
                              >
                                <Trash
                                  size={14}
                                  weight="duotone"
                                  className="text-red-600"
                                  onClick={() => {
                                    const nm = [...activeMeasures];
                                    nm[mIdx].openings.splice(oIdx, 1);
                                    setActiveMeasures(nm);
                                  }}
                                />
                              </View>
                            </div>
                          ))}
                        </View>
                      )}
                      {/* --- end Vãos (Portas/Janelas) --- */}

                      {/* Botão para remover medida irregular (caso não seja a primeira) */}
                      {mIdx > 0 && (
                        <button
                          onClick={() =>
                            setActiveMeasures(
                              activeMeasures.filter((_, i) => i !== mIdx),
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-200 text-white rounded-full p-1 shadow-lg"
                        >
                          <Trash
                            size={14}
                            weight="bold"
                            className="text-red-500"
                          />
                        </button>
                      )}
                      {/* --- end botão para remover medida irregular --- */}
                    </View>
                  ))}

                  {/* botão para adicionar medidas extras para medição irregular*/}
                  <Button
                    variant="ghost"
                    onClick={addMeasureField}
                    className="w-full text-indigo-600 font-bold text-[12px] uppercase"
                  >
                    {/* <Plus className="mr-2" />  */}
                    Adicionar Medida (Irregular)
                  </Button>

                  {/* IMPLEMENTAÇÃO TAREFA 2: Visor de Área ao Vivo */}
                  <div className="bg-indigo-600 p-3 rounded-xl text-white flex justify-between items-center shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase opacity-80">
                        Área Calculada
                      </span>
                      <span className="text-xs italic opacity-70">
                        (Bruta - Vãos)
                      </span>
                    </div>
                    <div className="text-xl font-black">
                      {activeMeasures
                        .reduce((acc, m) => {
                          const gross = m.w * m.h;
                          const openings = m.openings.reduce(
                            (oAcc, o) => oAcc + o.w * o.h,
                            0,
                          );
                          return acc + (gross - openings);
                        }, 0)
                        .toFixed(2)}{" "}
                      m²
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={addServiceToTempList}
                  className="w-full text-indigo-800 font-bold text-[12px] uppercase h-12 border-2 border-dashed border-indigo-100 rounded-xl"
                >
                  {/* <Plus className="mr-2" />  */}
                  Salvar O serviço na lista
                </Button>

                <Button
                  variant="ghost"
                  onClick={addServiceToTempList}
                  className="w-full text-indigo-800 font-bold text-[12px] uppercase h-12 border-2 border-dashed border-indigo-100 rounded-xl mb-4"
                >
                  {/* <Plus className="mr-2" />  */}
                  Adicionar Outro serviço
                </Button>
              </div>
            </div>

            {/* BOTÃO FINAL DE SALVAMENTO */}
            <div className="flex flex-col py-4 bg-white">
              <Pressable
                onClick={handleFinalSave}
                className="w-full h-14 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Check weight="bold" size={20} /> Salvar Os Serviços
              </Pressable>
            </div>
          </DrawerContent>
        </Drawer>

        {/* LISTAGEM POR AMBIENTES */}
        <View tag="listagem-de-ambientes" className="space-y-6 mb-12">
          {rooms.map((room) => (
            <View
              key={room.id}
              className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500" />
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-sm font-black text-indigo-900 uppercase tracking-tighter">
                  {room.name}
                </h2>
                <div className="flex gap-2">
                  <Trash
                    size={18}
                    className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {room.services.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <div className="text-xs font-black capitalize text-indigo-400 mb-1 flex items-center gap-1">
                        {s.type === "wall" ? (
                          <Wall size={12} />
                        ) : (
                          <HardHat size={12} />
                        )}{" "}
                        {s.type === "wall" ? "Parede" : "Forro"}
                        {s.useInsulation && (
                          <span className="bg-emerald-100 text-emerald-700 px-1 rounded">
                            C/ LÃ
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-700 text-sm">
                        {s.tag}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">
                        {s.totalArea.toFixed(2)} m²
                      </div>
                      <div className="text-[12px] text-slate-400 font-bold uppercase">
                        {s.measures.length} seções
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </View>
          ))}
        </View>

        {/* TABELA CONSOLIDADA FINAL */}
        {consolidatedMaterials.length > 0 && (
          <View className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                <Package size={18} weight="bold" /> Lista Total de Materiais
              </h2>
            </div>

            <div className="space-y-4">
              {consolidatedMaterials.map((item, idx) => (
                <View
                  tag="material-item"
                  key={idx}
                  className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 border-b-emerald-100"
                >
                  <span className="text-slate-700 text-sm font-medium">
                    {item.item}
                  </span>
                  <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                    {item.qtd}{" "}
                    <small className="text-[12px]">{item.unit}</small>
                  </span>
                </View>
              ))}
            </div>
          </View>
        )}
      </View>

      <FAB actions={fabConfig} hasBottomNav={false} />
    </>
  );
}
