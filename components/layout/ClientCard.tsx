// components/layout/ClientCard.tsx
"use client";

import React from "react";
import View from "./View";
import "./ClientCard.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, GenderFemale } from "@phosphor-icons/react";

/**
 * Interface que define os dados esperados de um cliente.
 */
interface ClientData {
  id?: string | number;
  name: string;
  /** Gênero do cliente para seleção do avatar ('masc' ou 'fem') */
  gender?: "masc" | "fem" | string; // Tornado opcional para evitar erro se não existir no objeto
  cidade?: string;
  doc?: boolean | string;
  photo?: string;
  bairro?: string;
}

/**
 * Interface para as propriedades do componente ClientCard.
 */
interface ClientCardProps {
  /** Objeto com os dados do cliente */
  client: ClientData;
  /** Função disparada ao clicar no avatar ou nas informações do cliente */
  onClick?: () => void;
  /** Elemento ou componente adicional (botões, menus, ícones) exibido no badge */
  options?: React.ReactNode;
}

/**
 * Componente de Card para Listagem de Clientes.
 *
 * @param {ClientCardProps} props - Propriedades do card.
 *
 * @description
 * Exibe um resumo do cliente com avatar dinâmico baseado no gênero,
 * nome capitalizado e cidade. Possui uma área de 'options' (badge) customizável.
 * Otimizado para renderização em listas no Next.js.
 */
export default function ClientCard({
  client,
  onClick,
  options,
}: ClientCardProps) {
  // Avatares padrão
  const defaultAvatars = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  return (
    <View tag="client-card">
      <View tag="client-avatar" onClick={onClick} className="cursor-pointer">
        <Avatar className="w-12 h-12">
          {/* Prioridade 1: Foto do Cloudinary */}
          {/* Prioridade 2: Avatar padrão por gênero */}
          <AvatarImage
            src={
              client.photo ||
              defaultAvatars[
                (client.gender || "masc") as keyof typeof defaultAvatars
              ] ||
              defaultAvatars.masc
            }
            alt={client.name || "Cliente"}
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

      <View tag="client-info" onClick={onClick} className="cursor-pointer">
        <h4 className="text-[#333] capitalize font-bold">
          {(client.name || "Sem Nome").toLowerCase()}
        </h4>
        <p className="text-xs text-slate-500">
          {client.cidade || "Cidade não informada"}
          {client.bairro ? ` - ${client.bairro}` : ""}
        </p>
      </View>

      {/* Área de ações ou status (Badge) */}
      <View tag="client-badge">{options}</View>
    </View>
  );
}
