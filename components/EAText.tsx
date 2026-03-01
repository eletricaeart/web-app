// components/ui/EAText.tsx
import React from "react";
import "./EAText.css";
import View from "./layout/View";

/**
 * Interface de Tipagem para o componente EAText
 */
interface EATextProps {
  children: React.ReactNode;
  font?: string;
  size?: string;
  color?: string;
  shadow?: string;
  shadowStroke?: string;
  shadowTextColor?: string;
  center?: boolean;
}

export default function EAText({
  children,
  font,
  size = "2.5rem",
  color = "#ffab00",
  shadow = "#fff",
  shadowStroke = "10px",
  shadowTextColor = "#212329",
  center = false,
}: EATextProps) {
  // Extensão de CSSProperties para suportar variáveis CSS (--var)
  const styleVariables = {
    "--text-color": color,
    "--shadow-color": shadow,
    "--shadow-stroke": shadowStroke,
    "--shadow-text-color": shadowTextColor,
    fontSize: size,
    fontFamily: font,
    textAlign: center ? "center" : "left",
    justifyContent: center ? "center" : "flex-start",
  } as React.CSSProperties;

  // Garante que o atributo data-text receba apenas string ou número
  const textContent =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : "";

  return (
    <View className="ea-text-container" style={styleVariables}>
      <span className="ea-text-main" data-text={textContent}>
        {children}
      </span>
    </View>
  );
}
