// app/perfil/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import Divider from "@/components/Divider";
import Image from "next/image";
import {
  WhatsappLogo,
  EnvelopeSimple,
  Briefcase,
  IdentificationCard,
  CheckCircle,
  SignOut,
  Pen,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function PerfilUsuario() {
  const router = useRouter();
  const { data: users } = useEASync("usuarios");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (users.length > 0) {
      // LOGICA DE OURO:
      // Aqui, 'emailLogado' deve vir do seu hook de Auth ou localStorage
      const emailLogado = localStorage.getItem("user_email");

      const identity = users.find((u: any) => u.email === emailLogado);

      // Se achar o usuário logado, mostra ele.
      // Se não (para teste), mostra o primeiro da lista.
      setUser(identity || users[0]);
    }
  }, [users]);

  if (!user) return <View tag="page">Carregando perfil...</View>;

  return (
    <>
      <AppBar
        title="Meu Perfil"
        backAction={() => router.push("/")}
        options={
          <View
            tag="appbar-btn"
            onClick={() => router.push(`/equipe/editar?id=${user.id}`)}
          >
            <Pen size={24} color="white" weight="bold" />
          </View>
        }
      />

      <View tag="page" className="bg-slate-50 min-h-screen">
        {/* HEADER COM UPLOAD DE FOTO */}
        <div className="bg-indigo-950 pt-6 pb-12 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden relative">
            <Image
              src={user.photo || "/pix/avatar/default_avatar_masc.webp"}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-white text-2xl font-bold mt-4 uppercase">
            {user.name}
          </h2>
          <span className="text-indigo-300 text-sm font-medium">
            {user.role}
          </span>
        </div>

        <View tag="page-content" className="px-6 -mt-8">
          {/* CARD DE INFORMAÇÕES PROFISSIONAIS */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Briefcase size={18} weight="duotone" />
              Carreira & Especialidade
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Especialidade Principal
                </p>
                <p className="text-slate-800 font-semibold">
                  {user.specialty || "Eletricista Geral"}
                </p>
              </div>

              <Divider color="#f1f5f9" />

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">
                  Sobre / Bio Profissional
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mt-1">
                  {user.about || "Nenhuma descrição informada."}
                </p>
              </div>
            </div>
          </View>

          {/* CARD DE CONTATO */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <IdentificationCard size={18} weight="duotone" />
              Dados de Contato
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-xl">
                  <WhatsappLogo
                    size={20}
                    className="text-green-600"
                    weight="duotone"
                  />
                </div>
                <span className="text-slate-700 font-medium">
                  {user.whatsapp || "Não informado"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <EnvelopeSimple
                    size={20}
                    className="text-blue-600"
                    weight="duotone"
                  />
                </div>
                <span className="text-slate-700 font-medium">{user.email}</span>
              </div>
            </div>
          </View>

          {/* STATUS DO MEMBRO */}
          <div className="flex justify-center gap-6 py-4">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle
                size={24}
                weight="duotone"
                className="text-emerald-500"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Status Ativo
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock size={24} weight="duotone" className="text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Membro desde 2024
              </span>
            </div>
          </div>

          {/* Botão Sair - Movido para cá */}
          <div className="mt-8">
            <Button
              variant="ghost"
              className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 gap-3 h-14 rounded-2xl border border-red-100"
              onClick={() => {
                /* Lógica de Logout */
              }}
            >
              <SignOut size={24} weight="bold" />
              <span className="font-bold uppercase tracking-wider text-xs">
                Sair da Conta
              </span>
            </Button>
          </div>
        </View>
      </View>
    </>
  );
}
