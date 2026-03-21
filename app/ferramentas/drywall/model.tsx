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
  const [type, setType] = useState("wall"); // wall | ceiling
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0); // Para parede será altura, para forro comprimento
  const [laborPrice, setLaborPrice] = useState<number>(50);

  // Coeficientes técnicos extraídos dos seus arquivos JS
  const results = useMemo(() => {
    if (width <= 0 || height <= 0) return null;

    const area = width * height;
    const safetyMargin = 1.05;

    if (type === "wall") {
      return calculateWallMaterials({ wallLength: width, wallHeight: height });
    } else {
      return calculateCeilingMaterials({ width: width, length: height });
    }
  }, [type, width, height]);

  const totalLabor = width * height * laborPrice;

  return (
    <>
      <AppBar title="Calculadora Drywall" />
      <View tag="page" className="p-4 bg-slate-50 min-h-screen">
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

        <Tabs
          defaultValue="wall"
          onValueChange={setType}
          className="w-full mb-6"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 bg-slate-200 p-1">
            <TabsTrigger
              value="wall"
              className="rounded-xl flex gap-2 font-bold uppercase text-[10px]"
            >
              <Wall size={18} /> Parede / Divisória
            </TabsTrigger>
            <TabsTrigger
              value="ceiling"
              className="rounded-xl flex gap-2 font-bold uppercase text-[10px]"
            >
              <HardHat size={18} /> Forro Aramado
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <View className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <View className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                Largura (m)
              </span>
              <Input
                type="number"
                placeholder="0.00"
                onChange={(e) => setWidth(Number(e.target.value))}
                className="h-14 rounded-2xl bg-slate-50 border-none text-lg font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                {type === "wall" ? "Altura (m)" : "Comprimento (m)"}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                onChange={(e) => setHeight(Number(e.target.value))}
                className="h-14 rounded-2xl bg-slate-50 border-none text-lg font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </View>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase ml-2">
              Mão de Obra (R$/m²)
            </span>
            <Input
              type="number"
              value={laborPrice}
              onChange={(e) => setLaborPrice(Number(e.target.value))}
              className="h-14 rounded-2xl bg-indigo-50 border-none text-lg font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </View>

        {results && (
          <View className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
              <Package size={18} weight="bold" /> Lista Estimada de Materiais
            </h3>
            <div className="space-y-2">
              {results.map((res, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <span className="text-slate-700 font-medium text-sm">
                    {res.item}
                  </span>
                  <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                    {res.qtd}{" "}
                    <small className="text-[10px] uppercase">{res.unit}</small>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Total Mão de Obra
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalLabor)}
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">
                    Área Total
                  </span>
                  <div className="text-2xl font-black italic">
                    {(width * height).toFixed(2)} m²
                  </div>
                </div>
                <View className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 h-12 flex gap-2 font-bold uppercase text-[10px]">
                  <Calculator size={18} weight="bold" /> Adicionar ao Orçamento
                </View>
              </div>
            </div>
          </View>
        )}
      </View>
    </>
  );
}
