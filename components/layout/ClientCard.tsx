// components/layout/ClientCard.tsx
"use client";

import React from "react";
import View from "./View";
import "./ClientCard.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, GenderFemale } from "@phosphor-icons/react";

interface ClientData {
  id?: string | number;
  name: string;
  gender?: "masc" | "fem" | string;
  cidade?: string;
  doc?: boolean | string;
  photo?: string;
  bairro?: string;
}

interface ClientCardProps {
  client: ClientData;
  onClick?: () => void;
  options?: React.ReactNode;
}

export default function ClientCard({
  client,
  onClick,
  options,
}: ClientCardProps) {
  const defaultAvatars = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  return (
    <View
      tag="client-card"
      className="rounded-[1rem] shadow-sm flex items-center p-3 gap-3"
    >
      <View
        tag="client-avatar"
        onClick={onClick}
        className="cursor-pointer flex-shrink-0"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={
              client.photo ||
              defaultAvatars[
                (client.gender || "masc") as keyof typeof defaultAvatars
              ]
            }
            alt={client.name}
            className="object-cover"
          />
          <AvatarFallback>
            {client.gender === "fem" ? (
              <GenderFemale size={24} />
            ) : (
              <User size={24} />
            )}
          </AvatarFallback>
        </Avatar>
      </View>

      <View
        tag="client-info"
        onClick={onClick}
        className="cursor-pointer flex-1 min-w-0"
      >
        {/* 'truncate' impede que o nome quebre o card */}
        <h4 className="text-[#333] capitalize font-bold truncate">
          {(client.name || "Sem Nome").toLowerCase()}
        </h4>
        {/* 'line-clamp-1' garante apenas uma linha para o endereço */}
        <p className="text-xs text-slate-500 truncate">
          {client.cidade || "Cidade não informada"}
          {client.bairro ? ` - ${client.bairro}` : ""}
        </p>
      </View>

      <View tag="client-badge" className="flex-shrink-0">
        {options}
      </View>
    </View>
  );
}
