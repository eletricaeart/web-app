"use client";

import { useData } from "@/hooks/useData";
import {
  Users,
  Plus,
  CaretLeft,
  MagnifyingGlass,
  Phone,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function ClientesPage() {
  const router = useRouter();
  const { items: clientes, isLoading } = useData<any>("clientes");
  const [search, setSearch] = useState("");

  // Filtro de busca simples
  const filteredClientes = clientes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp?.includes(search),
  );

  return (
    <main className="min-h-svh bg-slate-50 p-6 pb-24">
      {/* AppBar Customizada */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-600"
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Meus Clientes</h1>
        <Link href="/clientes/novo">
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
          placeholder="Buscar por nome ou celular..."
          className="pl-10 h-12 bg-white border-none shadow-sm rounded-2xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeleton loader para uma UX suave
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))
        ) : filteredClientes.length > 0 ? (
          filteredClientes.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Users size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function ClienteCard({ cliente }: { cliente: any }) {
  return (
    <Link href={`/clientes/${cliente.id}`}>
      <Card className="border-none shadow-sm active:scale-[0.98] transition-all rounded-3xl overflow-hidden">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg">
              {cliente.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">
                {cliente.name}
              </h3>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                <Phone size={14} />
                <span>{cliente.whatsapp || "Sem contato"}</span>
              </div>
            </div>
          </div>
          <DotsThreeVertical size={20} className="text-slate-300" />
        </CardContent>
      </Card>
    </Link>
  );
}
