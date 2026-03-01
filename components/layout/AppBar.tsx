"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "./AppBar.css";
import EAText from "../EAText";
import View from "./View";
import { CaretLeft, DotsThreeOutlineVertical } from "@phosphor-icons/react";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  icon?: React.ReactNode;
  label: string;
  action: string | (() => void);
}

interface AppBarProps {
  options?: Option[] | React.ReactNode;
  title?: string | null;
  backAction?: string | (() => void) | null;
}

export default function AppBar({
  options = [],
  title = null,
  backAction = null,
}: AppBarProps) {
  const router = useRouter();

  const handleActionClick = (action: string | (() => void)) => {
    if (typeof action === "function") {
      action();
    } else {
      router.push(action);
    }
  };

  const handleBackClick = () => {
    // Limpeza de rascunhos se houver
    if (localStorage.getItem("ea_draft_budget")) {
      localStorage.removeItem("ea_draft_budget");
    }

    if (typeof backAction === "function") {
      backAction();
    } else if (typeof backAction === "string") {
      router.push(backAction);
    } else {
      router.back();
    }
  };

  return (
    <View tag="appbar" className="app-bar">
      <View tag="navigation-slot">
        {backAction && (
          <View
            tag="back-button"
            style={{ display: "grid", placeItems: "center" }}
            className="text-white hover:bg-[#ffffff22] rounded-full h-12 w-12 cursor-pointer"
            onClick={handleBackClick}
          >
            <CaretLeft size={25} weight="bold" />
          </View>
        )}
      </View>

      <View
        tag="main-slot"
        className="logo-container cursor-pointer"
        onClick={() => router.push("/")}
      >
        {title ? (
          <EAText
            font="GodOfThunder"
            size="1.4rem"
            shadowStroke="5px"
            color="#ffffff"
            shadow="var(--sv-sodalita, #00559c)"
          >
            {title}
          </EAText>
        ) : (
          <>
            <EAText
              font="GodOfThunder"
              size="1.4rem"
              shadowStroke="5px"
              color="#ffffff"
              shadow="var(--sv-sodalita, #00559c)"
            >
              Eletrica
            </EAText>
            <EAText
              font="GodOfThunder"
              size=".8rem"
              shadowStroke="5px"
              color="#ffab00"
              shadow="var(--sv-sodalita, #00559c)"
            >
              &
            </EAText>
            <EAText
              font="GodOfThunder"
              size="1.4rem"
              shadowStroke="5px"
              color="#ffffff"
              shadow="var(--sv-sodalita, #00559c)"
            >
              Art
            </EAText>
          </>
        )}
      </View>

      <View tag="actions-slot">
        {/* Se options for um Array, renderiza o Popover padrão */}
        {Array.isArray(options) && options.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <View
                tag="vmenu"
                className="text-white hover:bg-[#ffffff11] rounded-full p-2 cursor-pointer"
              >
                <DotsThreeOutlineVertical size={24} weight="bold" />
              </View>
            </PopoverTrigger>

            <PopoverContent
              className="w-56 p-1 bg-white border-[#eee] shadow-xl z-[10000]"
              align="end"
            >
              <div className="flex flex-col gap-1">
                {options.map((opt, index) => (
                  <button
                    key={index}
                    className="vmenu-item w-full flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#f5f5f5] transition-colors rounded-md border-none bg-transparent text-left font-medium cursor-pointer"
                    onClick={() => handleActionClick(opt.action)}
                  >
                    {opt.icon && <span className="text-lg">{opt.icon}</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Se for um componente customizado (como passamos no Perfil), renderiza direto */}
        {!Array.isArray(options) && options}
      </View>
    </View>
  );
}
