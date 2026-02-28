import React, { useState } from "react";
import View from "../layout/View";
import "./FAB.css";

/**
 * Componente FloatingActions (antigo FAB.js)
 * @param {Array} actions - Lista de objetos { icon, label, action }
 * @param {Boolean} hasBottomNav - Define se o FAB deve considerar o espaço da barra inferior
 */
export default function FAB({ actions = [], hasBottomNav = true }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFab = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Overlay de Desfoque */}
      {isOpen && <div className="blurOverlay" onClick={toggleFab} />}

      <View
        tag="fab"
        className={`fabContainer ${!hasBottomNav ? "no-nav" : ""}`}
      >
        {/* Botão Principal */}
        <button
          className={`fab ${isOpen ? "fabActive" : ""}`}
          onClick={toggleFab}
        >
          {isOpen ? "+" : actions.length > 1 ? "+" : actions[0]?.icon}
        </button>

        {/* Lista de Opções */}
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
                <button className="miniFab">{opt.icon}</button>
              </div>
            ))}
          </div>
        )}
      </View>
    </>
  );
}
