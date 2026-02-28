// import React from "react";
import styles from "./Text.module.css";

/**
 * Componente Text (antigo <ea-text>)
 * @param {string} children - Conteúdo do texto
 * @param {string} shadow - Cor do contorno (stroke)
 * @param {string} shadowStroke - Largura do contorno
 * @param {string} shadowTextColor - Cor do preenchimento da sombra (atrás)
 * @param {string} color - Cor principal do texto
 * @param {string} size - Tamanho da fonte (ex: 1.5rem)
 * @param {string} font - Família da fonte
 * @param {string} margin - Margem externa
 */
const Text = ({
  children,
  shadow,
  shadowStroke = "10px",
  shadowTextColor = "#212329",
  color = "#ffab00",
  size,
  font,
  margin,
}) => {
  const inlineStyles = {
    "--shadow-color": shadow,
    "--shadow-stroke": shadowStroke,
    "--shadow-text-color": shadowTextColor,
    "--text-color": color,
    fontSize: size,
    fontFamily: font,
    margin: margin,
  };

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
};

export default Text;
