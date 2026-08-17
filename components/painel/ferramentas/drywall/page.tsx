// app/painel/ferramentas/drywall/page.tsx
'use client';

import React from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import View from '@/components/layout/View';
import { Button } from '@/components/ui/button';
import {
  Wall,
  HardHat,
  SquareHalf,
  Cabinet,
  Ruler,
  ArrowRight,
} from '@phosphor-icons/react';

export default function DrywallToolsPage() {
  const router = usePainelRouter();

  const tools = [
    {
      id: 'paredes-forros',
      title: 'Paredes, Forros e Sancas',
      description:
        'Calcule materiais para paredes, forros e sancas com desconto de vãos.',
      icon: <Wall size={28} weight="duotone" />,
      route: 'drywall/paredes',
      color: 'bg-indigo-50 border-indigo-200',
    },
    {
      id: 'moveis',
      title: 'Móveis / Armários em Drywall',
      description:
        'Projete móveis planejados com cálculo de chapas, perfis, ferragens e blueprint.',
      icon: <Cabinet size={28} weight="duotone" />,
      route: 'drywall/moveis',
      color: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'revestimento',
      title: 'Revestimento de Paredes (Lining)',
      description:
        'Em breve: placas coladas sobre alvenaria, sem estrutura metálica.',
      icon: <Ruler size={28} weight="duotone" />,
      route: null,
      color: 'bg-gray-50 border-gray-200 opacity-60',
      soon: true,
    },
    {
      id: 'shaft',
      title: 'Dutos / Shafts',
      description: 'Em breve: fechamento de eixos técnicos e colunas.',
      icon: <SquareHalf size={28} weight="duotone" />,
      route: null,
      color: 'bg-gray-50 border-gray-200 opacity-60',
      soon: true,
    },
  ];

  return (
    <>
      <PainelAppBar
        title="Ferramentas Drywall"
        backAction={() => router.push('ferramentas')}
      />
      <View
        tag="page"
        className="p-4 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-24"
      >
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          Escolha sua ferramenta
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Selecione uma das calculadoras especializadas para seu projeto em
          drywall.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`relative rounded-2xl p-5 border-2 ${tool.color} shadow-sm transition-all hover:shadow-md ${
                tool.soon
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:scale-[1.02]'
              }`}
              onClick={() => {
                if (!tool.soon && tool.route) router.push(tool.route);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{tool.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {tool.description}
                  </p>
                  {tool.soon && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-white bg-slate-400 px-2 py-0.5 rounded-full uppercase">
                      Em breve
                    </span>
                  )}
                  {!tool.soon && tool.route && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 font-bold text-xs"
                      >
                        Acessar <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </View>
    </>
  );
}
