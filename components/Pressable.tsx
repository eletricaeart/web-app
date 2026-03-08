"use client";

import React, { useState } from "react";
import View from "./layout/View";
import "./Pressable.css";

/**
 * Interface para as propriedades do componente Pressable.
 */
interface PressableProps {
  /** Texto exibido em estado normal */
  label: string;
  /** Texto opcional exibido quando o botão está sendo pressionado */
  pressed?: string;
  /** Cor de fundo (formato Tailwind ex: 'bg-blue-500' ou cor hex) */
  bg?: string;
  /** Arredondamento das bordas (formato Tailwind ex: 'rounded-lg') */
  radius?: string;
  /** Função disparada ao clicar/pressionar */
  onClick?: () => void;
  /** Classes adicionais do Tailwind */
  className?: string;
  /** Tag personalizada para o componente View interno */
  tag?: string;
  children?: React.ReactNode;
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
  pressed,
  bg = "bg-transparent",
  rounded = "rounded-md",
  m = "0",
  onClick,
  className = "",
  tag = "pressable",
  children,
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
        ${"pressable"} 
      `}
      style={
        {
          // Permite cores hexadecimais se não forem classes Tailwind
          background: !bg.startsWith("bg-") ? bg : undefined,
          padding: m,
        } as React.CSSProperties
      }
    >
      <View
        tag="pressable-btn"
        // type="button"
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        // className="pressable-btn w-full h-full bg-transparent border-none cursor-pointer flex items-center justify-center p-4 font-medium"
        className={`
        ${"pressable-btn"}
        ${bg} 
        ${rounded} 
        ${className}
      `}
        style={
          {
            // Permite cores hexadecimais se não forem classes Tailwind
            bg: !bg.startsWith("bg-") ? bg : undefined,
            rounded: !rounded.startsWith("rounded") ? rounded : undefined,
          } as React.CSSProperties
        }
      >
        {children ? children : isPressed && pressed ? pressed : label}
      </View>
    </View>
  );
}
