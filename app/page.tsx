// app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useEASync } from "@/hooks/useEASync";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FilePlus,
  Users,
  Notebook,
  SignOut,
  Lightning,
  CaretRight,
  UserCircle,
  ChatCircleDots,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import BottomNavbar from "@/components/layout/BottomNavbar";
import View from "@/components/layout/View";
import Page from "@/components/layout/Page";

// Interface para tipar o usuário na Home
interface UsuarioHome {
  id?: string | number;
  name: string;
  role: string;
  photo?: string;
}

export default function HomePage() {
  // Chamadas ao hook para obter os dados reais de cada entidade
  const { data: users } = useEASync<UsuarioHome>("usuarios");
  const { data: clients } = useEASync<any>("clientes");
  const { data: notes } = useEASync<any>("notas");

  // Fallback seguro para evitar erro de undefined no split do nome
  const currentUser = users[0] || {
    name: "Usuário Sistema",
    role: "Colaborador",
  };

  /**
   * --- saudações para o User
   *  */
  const getGreeting = () => {
    const hour = new Date().getHours();

    // Listas de frases por período
    const morning = [
      "Bom dia",
      "Acordou cedo, hein?",
      "Ótimo dia para você",
      "Energia total agora",
    ];
    const afternoon = [
      "Boa tarde",
      "Como vai a tarde?",
      "Produtividade lá em cima",
      "Bora finalizar o dia",
    ];
    const evening = [
      "Boa noite",
      "Bom descanso",
      "Trabalhando até tarde?",
      "Finalizando o expediente",
    ];
    const generic = ["Olá", "E aí", "Tudo certo", "Que bom te ver"];

    // Seleciona a lista baseada na hora
    let selectedList = generic;
    if (hour >= 5 && hour < 12) selectedList = [...morning, ...generic];
    else if (hour >= 12 && hour < 18) selectedList = [...afternoon, ...generic];
    else selectedList = [...evening, ...generic];

    // Pega uma frase aleatória da lista escolhida
    return selectedList[Math.floor(Math.random() * selectedList.length)];
  };

  // gera a saudação
  const greeting = React.useMemo(() => getGreeting(), []);
  const firstName = (currentUser.name || "Usuário").split(" ")[0];

  /**
   * --- frases para o topo
   *  */
  // Estado para a frase de efeito
  const [randomPhrase, setRandomPhrase] = useState("Painel Elétrica & Art");

  // Lista de frases de efeito
  const phrases = useMemo(
    () => [
      "O que vamos fazer hoje na Elétrica & Art?",
      "Pronto para mais um dia de sucesso?",
      "Gestão inteligente, resultados brilhantes.",
      "Sua produtividade começa por aqui.",
      "Transformando energia em eficiência.",
      "Acompanhe seus orçamentos em tempo real.",
      "Organização é a chave para o crescimento.",
      "Vamos colocar os projetos em dia?",
    ],
    [],
  );

  // Seleciona uma frase aleatória ao montar o componente
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setRandomPhrase(phrases[randomIndex]);
  }, [phrases]);
  /* --- end --- */

  return (
    <>
      <Page hasBottomNavBar={true} className="">
        <main className="p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {greeting}, {firstName}
              </h1>
              <p className="text-slate-500 text-sm">{randomPhrase}</p>
            </div>
            <Link href="/perfil">
              {/* <div className="w-12 h-12 bg-indigo-950 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-white relative"> */}
              <div className="w-12 h-12 bg-indigo-950 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white relative">
                {currentUser.photo ? (
                  <Image
                    src={currentUser.photo}
                    alt="Perfil"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Lightning
                    size={24}
                    weight="duotone"
                    className="text-white"
                  />
                )}
              </div>
            </Link>
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
                count={`${clients.length} cadastrados`}
              />
              <MenuCard
                href="/notas"
                icon={<Notebook size={28} weight="duotone" />}
                title="Notas"
                count={`${notes.length} registros`}
              />
              {/* CARD DA EQUIPE (USUÁRIOS) */}
              <MenuCard
                href="/equipe"
                icon={<Lightning size={28} weight="duotone" />}
                title="Equipe"
                count={`${users.length} membros`}
              />
              {/* CARD DE PERFIL (Para o Rafael se ver) */}
              <MenuCard
                href="/perfil"
                icon={<UserCircle size={28} weight="duotone" />}
                title="Meu Perfil"
                count="Editar"
              />
              {/* TERRENO PREPARADO: Card de Chat (Futuro) */}
              <MenuCard
                href="/chat"
                icon={
                  <ChatCircleDots
                    size={28}
                    weight="duotone"
                    className="text-emerald-500"
                  />
                }
                title="Mensagens"
                count="Em breve"
              />
            </div>
          </div>
        </main>

        {/* Botão de Sair elegante */}
        <footer className="flex flex-col w-full px-4 py-8">
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
        </footer>
      </Page>
      <BottomNavbar />
    </>
  );
}

// --- Interfaces para os Componentes Auxiliares ---

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function QuickAction({
  href,
  icon,
  title,
  description,
  color,
}: QuickActionProps) {
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

interface MenuCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  count: string;
}

function MenuCard({ href, icon, title, count }: MenuCardProps) {
  return (
    <Link href={href}>
      <Card className="border-none shadow-sm hover:shadow-md active:scale-[0.95] transition-all rounded-3xl h-full">
        <CardContent className="p-6 flex flex-col gap-3">
          <div className="text-indigo-600 bg-indigo-50 w-fit p-3 rounded-2xl">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400 font-medium">{count}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
