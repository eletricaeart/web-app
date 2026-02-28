import React from "react";
import { useRouter } from "next/navigation";
import "./AppBar.css";
import EAText from "../EAText";
import View from "./View";
import { Button } from "../ui/button";
import { CaretLeft, DotsThreeOutlineVertical } from "@phosphor-icons/react";

/* shadcn components */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AppBar({
  actions = [],
  title = null,
  backAction = null,
}) {
  const router = useRouter();

  const handleActionClick = (action) => {
    // O Popover fecha automaticamente ao clicar em um botão interno se não impedirmos o bubbling
    if (typeof action === "function") {
      action();
    } else {
      router.push(action);
    }
  };

  const handleBackClick = () => {
    if (localStorage.getItem("edit_budget_data")) {
      localStorage.removeItem("edit_budget_data");
    }

    if (typeof backAction === "function") {
      backAction();
    } else if (typeof backAction === "string") {
      router.push(backAction);
    }
  };

  return (
    <View tag="appbar" className="app-bar">
      <View tag="navigation-slot">
        {backAction && (
          <View
            tag="back-button"
            style={{ display: "grid", placeItems: "center" }}
            className="text-white hover:bg-[#ffffff22] rounded-full h-12 w-12"
            onClick={handleBackClick}
          >
            <CaretLeft size={25} weight="bold" />
          </View>
        )}
      </View>

      <View
        tag="main-slot"
        className="logo-container"
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
        {actions && actions.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <View
                tag="vmenu"
                className="text-indigo-200 hover:bg-[#ffffff11] rounded-full"
              >
                <DotsThreeOutlineVertical size={24} weight="bold" />
              </View>
            </PopoverTrigger>

            <PopoverContent
              className="w-56 p-1 bg-white border-[#eee] shadow-xl z-[10000]"
              align="end"
            >
              <div className="flex flex-col gap-1">
                {actions.map((act, index) => (
                  <button
                    key={index}
                    className="vmenu-item w-full flex items-center gap-3 px-4 py-3 text-sm text-[#333] hover:bg-[#f5f5f5] transition-colors rounded-md border-none bg-transparent text-left font-medium"
                    onClick={() => handleActionClick(act.action)}
                  >
                    <span className="text-lg">{act.icon}</span> {act.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </View>
    </View>
  );
}
