"use client";

import { useAuth } from "@/hooks/useAuth"; // Vamos criar esse pequeno hook abaixo
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FilePlus,
  Users,
  Notebook,
  SignOut,
  Lightning,
  CaretRight,
} from "@phosphor-icons/react";
import Link from "next/link";

export default function HomePage() {
  // Nota: No Next.js, você pode buscar o usuário via Server Component,
  // mas para a UI da Home, vamos usar um hook simples.

  return (
    <main className="min-h-svh bg-slate-50 p-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Olá, Rafael
          </h1>
          <p className="text-slate-500 text-sm">Painel Elétrica & Art</p>
        </div>
        <div className="w-12 h-12 bg-indigo-950 rounded-2xl flex items-center justify-center shadow-lg">
          <Lightning size={24} weight="duotone" className="text-white" />
        </div>
      </header>

      {/* Grid de Atalhos */}
      <div className="grid grid-cols-1 gap-4">
        <QuickAction
          href="/orcamentos/novo"
          icon={<FilePlus size={32} weight="duotone" />}
          title="Novo Orçamento"
          description="Criar proposta rápida"
          color="bg-indigo-600"
        />

        <div className="grid grid-cols-2 gap-4">
          <MenuCard
            href="/clientes"
            icon={<Users size={28} weight="duotone" />}
            title="Clientes"
            count="12"
          />
          <MenuCard
            href="/notas"
            icon={<Notebook size={28} weight="duotone" />}
            title="Notas"
            count="5"
          />
          {/* CARD DA EQUIPE (USUÁRIOS) */}
          <MenuCard
            href="/equipe"
            icon={<Lightning size={28} weight="duotone" />}
            title="Equipe"
            count="2"
            color="bg-amber-50"
            textColor="text-amber-600"
          />
        </div>
      </div>

      {/* Botão de Sair elegante */}
      <div className="mt-8">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-3 h-14 rounded-2xl"
          onClick={() => {
            /* Criaremos a lógica de logout */
          }}
        >
          <SignOut size={24} />
          <span className="font-bold">Sair do Sistema</span>
        </Button>
      </div>
    </main>
  );
}

// Componentes Auxiliares (Poderiam estar em arquivos separados)
function QuickAction({ href, icon, title, description, color }: any) {
  return (
    <Link href={href}>
      <Card
        className={`${color} border-none text-white shadow-xl active:scale-[0.98] transition-all`}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-white/70 text-sm">{description}</p>
            </div>
          </div>
          <CaretRight size={20} weight="bold" className="opacity-50" />
        </CardContent>
      </Card>
    </Link>
  );
}

function MenuCard({ href, icon, title, count }: any) {
  return (
    <Link href={href}>
      <Card className="border-none shadow-sm hover:shadow-md active:scale-[0.95] transition-all rounded-3xl">
        <CardContent className="p-6 flex flex-col gap-3">
          <div className="text-indigo-600 bg-indigo-50 w-fit p-3 rounded-2xl">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400 font-medium">
              {count} registros
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
