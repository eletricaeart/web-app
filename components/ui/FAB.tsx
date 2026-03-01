// components/ui/FAB.tsx
"use client";

import React, { useState } from "react";
import View from "../layout/View";
import "./FAB.css";

/**
 * Interface que define a estrutura de uma ação individual do FAB.
 */
export interface FABAction {
  // Exportada para ser usada em outros arquivos (como page.tsx)
  /** Ícone a ser exibido (String, Emoji ou Elemento React) */
  icon: React.ReactNode;
  /** Texto descritivo exibido ao lado do mini-botão */
  label: string;
  /** Função de callback disparada ao clicar na ação */
  action: () => void;
}

/**
 * Interface que define as propriedades do componente FAB.
 */
interface FABProps {
  /** Lista de objetos de ação para preencher o menu suspenso */
  actions?: FABAction[];
  /** Se verdadeiro, adiciona espaçamento para não sobrepor a navegação inferior */
  hasBottomNav?: boolean;
}

/**
 * Componente Floating Action Button (FAB) adaptado para Next.js.
 */
export default function FAB({ actions = [], hasBottomNav = true }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  /** Alterna o estado de abertura do menu */
  const toggleFab = () => {
    // Se houver apenas uma ação, executa direto sem abrir o menu
    if (actions.length === 1 && !isOpen) {
      actions[0].action();
      return;
    }
    setIsOpen(!isOpen);
  };

  // Se não houver ações, não renderiza nada para evitar botão vazio
  if (actions.length === 0) return null;

  return (
    <>
      {/* Overlay de Desfoque: Fecha o menu ao clicar fora */}
      {isOpen && (
        <div
          className="blurOverlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <View
        tag="fab"
        className={`fabContainer ${!hasBottomNav ? "no-nav" : ""}`}
      >
        {/* Botão Principal: Lógica de ícone fiel ao original */}
        <button
          className={`fab ${isOpen ? "fabActive" : ""}`}
          onClick={toggleFab}
          type="button"
          aria-expanded={isOpen}
        >
          {/* Prioridade: "+" se aberto, "+" se lista > 1, ícone da ação se lista === 1 */}
          {isOpen ? "+" : actions.length > 1 ? "+" : actions[0]?.icon}
        </button>

        {/* Lista de Opções: Renderiza apenas se houver múltiplas ações e estiver aberto */}
        {isOpen && actions.length > 1 && (
          <div className="fabOptions">
            {actions.map((opt, index) => (
              <div
                key={`${opt.label}-${index}`} // Key mais estável que apenas index
                className="optionItem"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation(); // Evita conflito com o overlay
                  opt.action();
                  setIsOpen(false);
                }}
              >
                <span className="label">{opt.label}</span>
                <button className="miniFab" type="button" tabIndex={-1}>
                  {opt.icon}
                </button>
              </div>
            ))}
          </div>
        )}
      </View>
    </>
  );
}
