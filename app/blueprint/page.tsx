// app/blueprint/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Material {
  item: string;
  qtd: number;
  unit: string;
}

interface Room {
  id: string;
  name: string;
  materials: Material[];
}

interface BlueprintData {
  rooms: Room[];
  consolidated: Material[];
}

export default function BlueprintPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BlueprintData | null>(null);

  useEffect(() => {
    const encoded = searchParams.get('data');
    if (encoded) {
      try {
        const decoded = JSON.parse(decodeURIComponent(encoded));
        setData(decoded);
      } catch (e) {
        console.error('Erro ao decodificar dados', e);
      }
    }
  }, [searchParams]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500 text-lg">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="blueprint-container min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800 uppercase tracking-widest">
            ELÉTRICA & ART
          </h1>
          <h2 className="text-xl font-semibold text-slate-700">
            Estimativa de Materiais — Drywall
          </h2>
        </div>

        {data.rooms.map((room) => (
          <div key={room.id} className="mb-6 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-indigo-700 uppercase mb-2">
              {room.name}
            </h3>
            <ul className="space-y-1">
              {room.materials.map((mat, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-700">{mat.item}</span>
                  <span className="font-mono font-semibold">
                    {mat.qtd} {mat.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-8 pt-4 border-t-2 border-indigo-300">
          <h3 className="text-lg font-bold text-indigo-700 uppercase mb-2">
            Total Geral
          </h3>
          <ul className="space-y-1">
            {data.consolidated.map((mat, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-slate-700">{mat.item}</span>
                <span className="font-mono font-semibold">
                  {mat.qtd} {mat.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          Gerado em {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
