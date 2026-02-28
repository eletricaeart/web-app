import React from "react";
import styles from "./Text.module.css";

/**
 * Interface que define as propriedades do componente Text.
 */
interface TextProps {
  /** Conteúdo do texto a ser exibido */
  children: React.ReactNode;
  /** Cor do contorno/sombra (stroke) */
  shadow?: string;
  /** Largura do contorno (Ex: "10px", "2px") - Default: "10px" */
  shadowStroke?: string;
  /** Cor do preenchimento da sombra atrás do texto - Default: "#212329" */
  shadowTextColor?: string;
  /** Cor principal do texto (frente) - Default: "#ffab00" */
  color?: string;
  /** Tamanho da fonte (Ex: "1.5rem", "20px") */
  size?: string;
  /** Família da fonte (Ex: "'Roboto', sans-serif") */
  font?: string;
  /** Margem externa (Ex: "10px 0", "1rem") */
  margin?: string;
}

/**
 * Componente Text com suporte a efeito de contorno (Stroke) via CSS Variables.
 *
 * @param {TextProps} props - Propriedades do componente.
 *
 * @description
 * Este componente utiliza o atributo `data-text` e variáveis CSS para criar um efeito de contorno
 * robusto que é fiel ao antigo web-component `<ea-text>`. É otimizado para o Next.js
 * utilizando CSS Modules para evitar conflitos de escopo.
 */
export default function Text({
  children,
  shadow,
  shadowStroke = "10px",
  shadowTextColor = "#212329",
  color = "#ffab00",
  size,
  font,
  margin,
}: TextProps) {
  /**
   * Extensão do tipo CSSProperties para aceitar variáveis CSS personalizadas
   * sem erros de tipagem do TypeScript.
   */
  const inlineStyles = {
    "--shadow-color": shadow,
    "--shadow-stroke": shadowStroke,
    "--shadow-text-color": shadowTextColor,
    "--text-color": color,
    fontSize: size,
    fontFamily: font,
    margin: margin,
  } as React.CSSProperties & { [key: string]: string | undefined };

  return (
    <div className={styles.container}>
      <span
        className={styles.textShadow}
        data-text={children}
        style={inlineStyles}
      >
        {children}
      </span>
    </div>
  );
}
