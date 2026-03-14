// components/layout/BudgetCard.tsx
"use client";

import React from "react";
import View from "./View";
import "./ClientCard.css"; // Reutilizamos o CSS para manter a consistência
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  GenderFemale,
  CloudCheck,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { getCleanDate } from "@/utils/helpers";

interface BudgetCardProps {
  orc: {
    id: string | number;
    cliente?: { name?: string }; // Tornamos opcionais
    docTitle?: { text?: string; emissao?: string }; // Tornamos opcionais
  };
  clientData?: {
    photo?: string;
    gender?: string;
  };
  onClick?: () => void;
  options?: React.ReactNode;
}

export default function BudgetCard({
  orc,
  clientData,
  onClick,
  options,
}: BudgetCardProps) {
  const isTemp = String(orc.id).startsWith("TEMP_");

  const defaultAvatars = {
    masc: "/pix/avatar/default_avatar_masc.webp",
    fem: "/pix/avatar/default_avatar_fem.webp",
  };

  // Extraímos os valores com fallbacks seguros para evitar o erro de toLowerCase()
  const clienteNome = orc?.clientName || "Cliente não identificado";
  // console.warn("\n\n\norc", orc);
  const tituloOrcamento = orc?.documentTitle || "Sem título";
  const dataEmissao = orc?.issueDate || new Date().toISOString();

  return (
    <View tag="client-card" className="rounded-[1rem] shadow-sm">
      {" "}
      {/* Mantemos a tag para herdar o CSS de layout */}
      <View tag="client-avatar" onClick={onClick} className="cursor-pointer">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={
              clientData?.photo ||
              defaultAvatars[
                (clientData?.gender || "masc") as keyof typeof defaultAvatars
              ] ||
              defaultAvatars.masc
            }
            alt={clienteNome}
            className="object-cover"
          />
          <AvatarFallback>
            {clientData?.gender === "fem" ? (
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
        className="cursor-pointer truncate"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-[#333] capitalize font-bold leading-tight truncate">
            {clienteNome.toLowerCase()}
          </h4>
          <small className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
            {isTemp ? (
              <ArrowsClockwise
                size={14}
                className="animate-spin text-amber-500"
              />
            ) : (
              <CloudCheck
                size={14}
                weight="duotone"
                className="text-emerald-500"
              />
            )}
            {getCleanDate(dataEmissao)}
          </small>
        </div>
        <p className="text-xs text-indigo-600 font-medium truncate mt-1">
          {tituloOrcamento}
        </p>
      </View>
      <View tag="client-badge" className="bg-transparent">
        {options}
      </View>
    </View>
  );
}
