"use client";

import { useData } from "@/hooks/useData";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  CaretLeft,
  MagnifyingGlass,
  Clock,
  User,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function OrcamentosPage() {
  const router = useRouter();
  const { items: orcamentos, isLoading } = useData<any>("orcamentos");
  const [search, setSearch] = useState("");

  const filtered = orcamentos.filter(
    (o) =>
      o.cliente.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-svh bg-slate-50 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-600"
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Orçamentos</h1>
        <Link href="/orcamentos/novo">
          <Button
            size="icon"
            className="rounded-full bg-indigo-950 w-10 h-10 shadow-lg"
          >
            <Plus size={20} weight="bold" />
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <Input
          placeholder="Buscar por cliente ou código..."
          className="pl-10 h-12 bg-white border-none shadow-sm rounded-2xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((orc) => <OrcamentoCard key={orc.id} orc={orc} />)
        ) : (
          <div className="text-center py-12 text-slate-400">
            <FileText size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nenhum orçamento emitido.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function OrcamentoCard({ orc }: { orc: any }) {
  return (
    <Link href={`/orcamentos/visualizar/${orc.id}`}>
      <Card className="border-none shadow-sm active:scale-[0.98] transition-all rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider">
              {orc.id}
            </div>
            <DotsThreeVertical size={20} className="text-slate-300" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <User size={16} weight="bold" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate">
                {orc.cliente.name}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock size={14} />
                <span>Emitido em {orc.docTitle.emissao}</span>
              </div>
              <div className="text-indigo-600 font-bold text-xs uppercase">
                Ver Detalhes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
