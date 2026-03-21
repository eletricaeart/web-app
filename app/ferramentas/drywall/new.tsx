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
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wall,
  HardHat,
  SquareHalf,
  Package,
  Calculator,
  Plus,
  Trash,
  house,
  ChartBar,
} from "@phosphor-icons/react";
import { calculateWallMaterials } from "@/utils/calculators/drywallWall";
import { calculateCeilingMaterials } from "@/utils/calculators/drywallCeiling";
import "./drywall.css";

/** --- types --- */
interface ServiceInstance {
  id: string;
  type: "wall" | "ceiling";
  tag: string; // Ex: "Parede Leste"
  measures: { width: number; height: number }[]; // Array para suportar somas irregulares
  totalArea: number;
}

interface Room {
  id: string;
  name: string; // Ex: "Cozinha"
  services: ServiceInstance[];
}

/**
 * --- default DrywallCalculator ---
 *  */
export default function DrywallCalculator() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estados do Formulário dentro do Drawer
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentServiceTag, setCurrentServiceTag] = useState("");
  const [currentType, setCurrentType] = useState<"wall" | "ceiling">("wall");
  const [tempMeasures, setTempMeasures] = useState<{ w: number; h: number }[]>([
    { w: 0, h: 0 },
  ]);

  const addMeasureField = () =>
    setTempMeasures([...tempMeasures, { w: 0, h: 0 }]);

  const handleSaveService = () => {
    const totalArea = tempMeasures.reduce((acc, m) => acc + m.w * m.h, 0);

    const newService: ServiceInstance = {
      id: Math.random().toString(36),
      type: currentType,
      tag: currentServiceTag || (currentType === "wall" ? "Parede" : "Forro"),
      measures: [...tempMeasures],
      totalArea,
    };

    // Verifica se o ambiente já existe, se não, cria
    setRooms((prev) => {
      const roomIndex = prev.findIndex(
        (r) => r.name.toLowerCase() === currentRoomName.toLowerCase(),
      );
      if (roomIndex > -1) {
        const newRooms = [...prev];
        newRooms[roomIndex].services.push(newService);
        return newRooms;
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: currentRoomName || "Geral",
          services: [newService],
        },
      ];
    });

    setIsDrawerOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentServiceTag("");
    setTempMeasures([{ w: 0, h: 0 }]);
  };

  // CÁLCULO CONSOLIDADO (A Tabela Final)
  const consolidatedMaterials = useMemo(() => {
    let totalWallArea = 0;
    let totalCeilingArea = 0;
    let wallWidthSum = 0; // Para guias/montantes
    let wallHeightAvg = 0;
    let ceilingWidthSum = 0;
    let ceilingLengthSum = 0;

    rooms.forEach((room) => {
      room.services.forEach((s) => {
        if (s.type === "wall") {
          totalWallArea += s.totalArea;
          s.measures.forEach((m) => {
            wallWidthSum += m.w;
            wallHeightAvg = m.h; // Simplificação para o cálculo de montantes
          });
        } else {
          totalCeilingArea += s.totalArea;
          s.measures.forEach((m) => {
            ceilingWidthSum += m.w;
            ceilingLengthSum += m.h;
          });
        }
      });
    });

    if (totalWallArea === 0 && totalCeilingArea === 0) return [];

    const wallMats =
      totalWallArea > 0
        ? calculateWallMaterials({
            wallLength: wallWidthSum,
            wallHeight: wallHeightAvg,
          })
        : [];
    const ceilingMats =
      totalCeilingArea > 0
        ? calculateCeilingMaterials({
            width: ceilingWidthSum,
            length: ceilingLengthSum,
          })
        : [];

    // Aqui você pode fazer um merge dos arrays somando as quantidades de itens repetidos
    return [...wallMats, ...ceilingMats];
  }, [rooms]);

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-32">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase italic">
            NK Toolbox
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Gestor de Materiais
          </p>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button className="bg-indigo-600 rounded-2xl h-12 px-6 shadow-lg shadow-indigo-200">
              <Plus weight="bold" className="mr-2" /> NOVO SERVIÇO
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-slate-50 h-[90vh] p-6">
            <div className="mx-auto w-full max-w-md space-y-6">
              <DrawerHeader className="px-0">
                <DrawerTitle className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
                  <Calculator weight="duotone" className="text-indigo-600" />{" "}
                  Detalhar Serviço
                </DrawerTitle>
              </DrawerHeader>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Ambiente
                  </span>
                  <Input
                    placeholder="Ex: Cozinha, Quarto 01..."
                    value={currentRoomName}
                    onChange={(e) => setCurrentRoomName(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={currentType === "wall" ? "default" : "outline"}
                    onClick={() => setCurrentType("wall")}
                    className="rounded-xl h-14 uppercase font-bold text-[10px]"
                  >
                    <Wall className="mr-2" size={20} /> Parede
                  </Button>
                  <Button
                    variant={currentType === "ceiling" ? "default" : "outline"}
                    onClick={() => setCurrentType("ceiling")}
                    className="rounded-xl h-14 uppercase font-bold text-[10px]"
                  >
                    <HardHat className="mr-2" size={20} /> Forro
                  </Button>
                </div>

                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Identificação (Opcional)
                  </span>
                  <Input
                    placeholder="Ex: Parede Leste, Fechamento viga..."
                    value={currentServiceTag}
                    onChange={(e) => setCurrentServiceTag(e.target.value)}
                  />
                </label>

                <div className="space-y-2 max-h-[30vh] overflow-y-auto p-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
                    Medidas (Soma Automática)
                  </span>
                  {tempMeasures.map((m, index) => (
                    <div
                      key={index}
                      className="flex gap-2 animate-in fade-in slide-in-from-left-2"
                    >
                      <Input
                        type="number"
                        placeholder="L"
                        onChange={(e) => {
                          const newM = [...tempMeasures];
                          newM[index].w = parseFloat(e.target.value) || 0;
                          setTempMeasures(newM);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="H"
                        onChange={(e) => {
                          const newM = [...tempMeasures];
                          newM[index].h = parseFloat(e.target.value) || 0;
                          setTempMeasures(newM);
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={addMeasureField}
                    className="w-full text-indigo-600 font-bold text-[10px] uppercase"
                  >
                    + Adicionar Medida (Irregular)
                  </Button>
                </div>

                <Button
                  onClick={handleSaveService}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-2xl"
                >
                  Salvar no Projeto
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </header>

      {/* LISTAGEM POR AMBIENTES */}
      <div className="space-y-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-sm font-black text-indigo-900 uppercase mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" /> {room.name}
            </h2>
            <div className="space-y-3">
              {room.services.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
                      {s.type === "wall" ? "Parede" : "Forro"}
                    </div>
                    <div className="font-bold text-slate-700">{s.tag}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600">
                      {s.totalArea.toFixed(2)} m²
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">
                      {s.measures.length} medida(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* TABELA CONSOLIDADA FINAL */}
      {consolidatedMaterials.length > 0 && (
        <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <ChartBar size={32} weight="duotone" className="text-emerald-400" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              Lista Total de Materiais
            </h2>
          </div>

          <div className="space-y-4">
            {consolidatedMaterials.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0"
              >
                <span className="text-slate-400 text-sm font-medium">
                  {item.item}
                </span>
                <span className="font-black text-emerald-400">
                  {item.qtd} <small className="text-[10px]">{item.unit}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
