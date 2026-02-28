"use client";

import React, { useState } from "react";
import View from "../layout/View";
import "./FAB.css";

/**
 * Interface que define a estrutura de uma ação individual do FAB.
 */
interface FABAction {
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
 *
 * @param {FABAction[]} props.actions - Lista de objetos { icon, label, action }.
 * @param {boolean} props.hasBottomNav - Define se o FAB deve considerar o espaço da barra inferior (Default: true).
 *
 * @description
 * Este componente gerencia um menu flutuante expansível.
 * Se houver apenas uma ação, o ícone principal assume o ícone dessa ação.
 * Se houver múltiplas, ele exibe um alternador (+) que abre as opções com animação em cascata.
 * Inclui um overlay de desfoque (blur) quando aberto.
 */
export default function FAB({ actions = [], hasBottomNav = true }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  /** Alterna o estado de abertura do menu */
  const toggleFab = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Overlay de Desfoque: Fecha o menu ao clicar fora */}
      {isOpen && (
        <div className="blurOverlay" onClick={toggleFab} aria-hidden="true" />
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
        >
          {isOpen ? "+" : actions.length > 1 ? "+" : actions[0]?.icon}
        </button>

        {/* Lista de Opções: Renderiza apenas se houver múltiplas ações e estiver aberto */}
        {isOpen && actions.length > 1 && (
          <div className="fabOptions">
            {actions.map((opt, index) => (
              <div
                key={index}
                className="optionItem"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  opt.action();
                  setIsOpen(false);
                }}
              >
                <span className="label">{opt.label}</span>
                <button className="miniFab" type="button">
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
