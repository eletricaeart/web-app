"use client";

import React, { useState } from "react";
import View from "./layout/View";
import styles from "./Pressable.module.css";

/**
 * Interface para as propriedades do componente Pressable.
 */
interface PressableProps {
  /** Texto exibido em estado normal */
  label: string;
  /** Texto opcional exibido quando o botão está sendo pressionado */
  pressedLabel?: string;
  /** Cor de fundo (formato Tailwind ex: 'bg-blue-500' ou cor hex) */
  backgroundColor?: string;
  /** Arredondamento das bordas (formato Tailwind ex: 'rounded-lg') */
  borderRadius?: string;
  /** Função disparada ao clicar/pressionar */
  onClick?: () => void;
  /** Classes adicionais do Tailwind */
  className?: string;
  /** Tag personalizada para o componente View interno */
  tag?: string;
}

/**
 * Componente Pressable inspirado no React Native para Next.js.
 *
 * @param {PressableProps} props - Propriedades de interação e estilo.
 *
 * @description
 * Um componente de botão altamente flexível que suporta feedback visual de "pressionado",
 * troca de texto dinâmica durante o clique e renderização de tag customizada.
 * Utiliza Tailwind para estrutura e CSS Modules para estados de animação.
 */
export default function Pressable({
  label,
  pressedLabel,
  backgroundColor = "bg-primary",
  borderRadius = "rounded-md",
  onClick,
  className = "",
  tag = "pressable-btn",
}: PressableProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Manipuladores de eventos para simular o comportamento "Pressed" do Mobile
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <View
      tag={tag}
      className={`
        ${styles.pressable} 
        ${backgroundColor} 
        ${borderRadius} 
        ${className}
      `}
      style={
        {
          // Permite cores hexadecimais se não forem classes Tailwind
          backgroundColor: !backgroundColor.startsWith("bg-")
            ? backgroundColor
            : undefined,
          borderRadius: !borderRadius.startsWith("rounded")
            ? borderRadius
            : undefined,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className="w-full h-full bg-transparent border-none cursor-pointer flex items-center justify-center p-4 font-medium"
      >
        {isPressed && pressedLabel ? pressedLabel : label}
      </button>
    </View>
  );
}
