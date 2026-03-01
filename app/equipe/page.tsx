// app/equipe/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEASync } from "@/hooks/useEASync";
import AppBar from "@/components/layout/AppBar";
import View from "@/components/layout/View";
import ClientCard from "@/components/layout/ClientCard";
import FAB from "@/components/ui/FAB";
import { UserPlus } from "@phosphor-icons/react";

// Interface para definir a estrutura do membro da equipe
interface Usuario {
  id: string | number;
  name: string;
  role: string;
  photo?: string;
  gender?: string;
  [key: string]: any;
}

export default function EquipeLista() {
  const router = useRouter();

  // Tipagem do hook para a entidade "usuarios"
  const { data: users } = useEASync<Usuario>("usuarios");

  return (
    <>
      <AppBar title="Minha Equipe" backAction={() => router.push("/")} />

      <View tag="page" className="p-4">
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <ClientCard
              key={u.id}
              client={{
                ...u,
                cidade: u.role, // No lugar da cidade, mostramos o cargo no card
              }}
              onClick={() => router.push(`/equipe/editar?id=${u.id}`)}
            />
          ))}
        </div>
      </View>

      <FAB
        actions={[
          {
            icon: <UserPlus size={28} weight="duotone" />,
            label: "Novo Membro",
            action: () => router.push("/equipe/editar"),
          },
        ]}
      />
    </>
  );
}
