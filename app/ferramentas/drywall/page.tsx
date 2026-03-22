// app/ferramentas/drywall/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
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
  X,
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
  useInsulation?: boolean;
  measures: { w: number; h: number; openings: Opening[] }[];
  totalArea: number;
}

interface Room {
  id: string;
  name: string;
  services: ServiceInstance[];
}

export default function DrywallCalculator() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estados do Formulário (Ambiente)
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [tempServices, setTempServices] = useState<ServiceInstance[]>([]);

  // Estado para o serviço atual
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

  /** --- Funções de Manipulação --- */
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
    setActiveTag("");
    setActiveMeasures([{ w: 0, h: 0, openings: [] }]);
    setActiveInsulation(false);
    toast.success("Serviço adicionado à lista!");
  };

  const handleFinalSave = () => {
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

  const consolidatedMaterials = useMemo(() => {
    let totals: any[] = [];
    rooms.forEach((r) => {
      r.services.forEach((s) => {
        const res =
          s.type === "wall"
            ? calculateWallMaterials({
                wallLength: s.totalArea / 2.8,
                wallHeight: 2.8,
              })
            : calculateCeilingMaterials({
                width: Math.sqrt(s.totalArea),
                length: Math.sqrt(s.totalArea),
              });
        totals = [...totals, ...res];
      });
    });
    return totals;
  }, [rooms]);

  const currentLiveArea = useMemo(() => {
    return activeMeasures.reduce((acc, m) => {
      const grossArea = m.w * m.h;
      const openingsArea = m.openings.reduce((oAcc, o) => oAcc + o.w * o.h, 0);
      return acc + (grossArea - openingsArea);
    }, 0);
  }, [activeMeasures]);

  return (
    <>
      <AppBar title="Calculadora Drywall" />

      {/* VIEW PRINCIPAL DA LISTAGEM */}
      <View
        tag="page"
        className={`p-4 bg-slate-50 min-h-[calc(100dvh_-_72px)] pb-40 ${isDrawerOpen ? "hidden" : "block"}`}
      >
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

        <View tag="listagem-de-ambientes" className="space-y-6 mb-12">
          {rooms.map((room) => (
            <View
              key={room.id}
              className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500" />
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-sm font-black text-indigo-900 uppercase tracking-tighter">
                  {room.name}
                </h2>
                <Trash
                  size={18}
                  className="text-slate-300 hover:text-red-500 cursor-pointer"
                />
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
                          <span className="bg-emerald-100 text-emerald-700 px-1 rounded ml-1">
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
                  key={idx}
                  className="flex justify-between items-center border-b border-b-emerald-100 pb-3 last:border-0"
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

      {/* VIEW SPA DO FORMULÁRIO (Substitui o Drawer) */}
      {isDrawerOpen && (
        <View className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={24} weight="bold" className="text-slate-600" />
            </button>
            <h2 className="font-black text-indigo-900 uppercase">
              Novo Ambiente
            </h2>
            <div className="w-10 h-10" /> {/* Spacer */}
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="mx-auto w-full max-w-md space-y-6 pb-20">
              <div className="flex justify-center">
                <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[12px] font-bold">
                  {tempServices.length} serviços na lista
                </div>
              </div>

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

              {tempServices.length > 0 && (
                <View
                  tag="temp-services"
                  className="flex gap-2 overflow-x-auto py-2"
                >
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
                        className="text-red-400 cursor-pointer"
                        onClick={() =>
                          setTempServices(
                            tempServices.filter((_, i) => i !== idx),
                          )
                        }
                      />
                    </div>
                  ))}
                </View>
              )}

              <View
                tag="service-card"
                className="flex flex-col gap-4 bg-slate-50 px-4 pt-4 pb-4 rounded-2xl border border-slate-200 "
              >
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

                {activeType === "wall" && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100">
                    <Label
                      htmlFor="incluir-la-mode"
                      className="flex items-center justify-between w-full text-[12px] font-bold text-mauve-700 capitalize cursor-pointer"
                    >
                      Incluir Lã de Vidro/Pet
                      <Switch
                        id="incluir-la-mode"
                        checked={activeInsulation}
                        onCheckedChange={setActiveInsulation}
                        className="data-[state=checked]:bg-[#00559C] data-[state=unchecked]:bg-slate-300"
                      />
                    </Label>
                  </div>
                )}

                <View tag="medidas-dinamicas" className="space-y-4">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
                    Medidas (Soma Automática)
                  </span>
                  <View
                    tag="measures"
                    className="flex flex-col space-y-2 p-3 bg-white rounded-xl border border-slate-100 relative shadow-sm"
                  >
                    {activeMeasures.map((m, mIdx) => (
                      <View tag="measure-card" key={mIdx} className="space-y-3">
                        <View
                          tag="main-measure-inputs"
                          className="grid grid-cols-2 gap-2"
                        >
                          <label>
                            <span className="text-xs font-bold text-slate-400 capitalize">
                              Largura (m)
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
                        {mIdx < activeMeasures.length - 1 && (
                          <div className="border-b border-slate-50 my-2" />
                        )}
                      </View>
                    ))}

                    <Button
                      variant="ghost"
                      onClick={addMeasureField}
                      className="w-full text-indigo-600 font-bold text-[12px] uppercase border-2 border-dashed border-indigo-100 rounded-xl mt-2"
                    >
                      Adicionar Medida (Irregular)
                    </Button>
                  </View>

                  {/* AJUSTE: Componente de Vãos fora do loop e após o botão de irregular */}
                  {activeType === "wall" && (
                    <View
                      tag="add-portas-e-janelas"
                      className="space-y-2 mt-2 px-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-orange-500 capitalize">
                          Descontar Vãos da Parede
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addOpening(0, "door")}
                            className="p-1 bg-orange-50 text-orange-600 rounded flex items-center gap-1 text-[10px] font-bold"
                          >
                            <Door size={16} /> + Porta
                          </button>
                          <button
                            type="button"
                            onClick={() => addOpening(0, "window")}
                            className="p-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1 text-[10px] font-bold"
                          >
                            <Browser size={16} /> + Janela
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {activeMeasures[0].openings?.map((o, oIdx) => (
                          <div
                            key={o.id}
                            className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm animate-in slide-in-from-right-2"
                          >
                            <span className="text-[10px] uppercase font-bold text-slate-400 w-4">
                              {o.type === "door" ? "P" : "J"}
                            </span>
                            <Input
                              className="h-8 text-[12px]"
                              type="number"
                              placeholder="L"
                              value={o.w || ""}
                              onChange={(e) =>
                                updateOpening(
                                  0,
                                  oIdx,
                                  "w",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                            <Input
                              className="h-8 text-[12px]"
                              type="number"
                              placeholder="A"
                              value={o.h || ""}
                              onChange={(e) =>
                                updateOpening(
                                  0,
                                  oIdx,
                                  "h",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                            <View
                              className="grid items-center justify-center bg-red-100 rounded-full p-1 cursor-pointer"
                              onClick={() => {
                                const nm = [...activeMeasures];
                                nm[0].openings.splice(oIdx, 1);
                                setActiveMeasures(nm);
                              }}
                            >
                              <Trash
                                size={14}
                                weight="duotone"
                                className="text-red-600"
                              />
                            </View>
                          </div>
                        ))}
                      </div>
                    </View>
                  )}
                </View>

                <View
                  tag="visor-area"
                  className="bg-indigo-600 p-3 rounded-xl text-white flex justify-between items-center shadow-inner"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase opacity-80">
                      Área Calculada
                    </span>
                    <span className="text-xs italic opacity-70">
                      (Bruta - Vãos)
                    </span>
                  </div>
                  <div className="text-xl font-black">
                    {currentLiveArea.toFixed(2)} m²
                  </div>
                </View>

                <Button
                  variant="ghost"
                  onClick={addServiceToTempList}
                  className="w-full text-indigo-800 font-bold text-[12px] uppercase h-12 border-2 border-dashed border-indigo-100 rounded-xl"
                >
                  Salvar Serviço na Lista
                </Button>
              </View>
            </div>
          </div>

          <div className="p-4 bg-white border-t">
            <Pressable
              onClick={handleFinalSave}
              className="w-full h-14 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Check weight="bold" size={20} /> Salvar Todos os Serviços
            </Pressable>
          </div>
        </View>
      )}

      {/* FAB SÓ APARECE SE A VIEW SPA ESTIVER FECHADA */}
      {!isDrawerOpen && <FAB actions={fabConfig} hasBottomNav={false} />}
    </>
  );
}
