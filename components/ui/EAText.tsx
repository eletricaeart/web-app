// components/ui/EAText.tsx
import React from "react";
import styles from "./EAText.module.css";

/**
 * Interface de Tipagem para o componente EAText
 */
interface EATextProps {
  children: React.ReactNode;
  shadow?: string;
  shadowStroke?: string;
  shadowTextColor?: string;
  color?: string;
  size?: string;
  font?: string;
  margin?: string;
}

/**
 * Componente EAText (antigo <ea-text>)
 */
export default function EAText({
  children,
  shadow,
  shadowStroke = "10px",
  shadowTextColor = "#212329",
  color = "#ffab00",
  size,
  font,
  margin,
}: EATextProps) {
  // Tipagem estendida para aceitar Variáveis CSS customizadas
  const inlineStyles = {
    "--shadow-color": shadow || "transparent",
    "--shadow-stroke": shadowStroke,
    "--shadow-text-color": shadowTextColor,
    "--text-color": color,
    fontSize: size,
    fontFamily: font,
    margin: margin,
  } as React.CSSProperties;

  return (
    <div className={styles.container}>
      <span
        className={styles.textShadow}
        data-text={children?.toString()}
        style={inlineStyles}
      >
        {children}
      </span>
    </div>
  );
}
