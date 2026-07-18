import React from "react";
import View from "./layout/View";

/**
 * Props para o componente Divider
 * @property {string} width - Largura da linha (ex: "90%", "100px")
 * @property {string} thickness - Espessura da linha (substituindo height para maior clareza)
 * @property {string} spacing - Espaçamento vertical/padding (ex: "20px")
 * @property {string} color - Cor da linha
 * @property {'dashed' | 'solid' | 'dotted'} type - Estilo da borda
 */
interface DividerProps {
  width?: string;
  thickness?: string;
  spacing?: string;
  color?: string;
  type?: "dashed" | "solid" | "dotted";
}

export default function Divider({
  width = "90%",
  thickness = "1px",
  spacing = "1px",
  color = "#ccc",
  type = "dashed",
}: DividerProps) {
  // Memoização do objeto de estilo para performance em grandes listas no Next.js
  const styles = {
    container: {
      width: "100%",
      height: spacing,
      display: "grid",
      placeItems: "center",
    } as React.CSSProperties,

    bar: {
      width: width,
      height: "0px", // Altura zero pois usamos borderBottom para a linha
      borderBottom: `${thickness} ${type} ${color}`,
    } as React.CSSProperties,
  };

  return (
    <View tag="divider" style={styles.container}>
      <View tag="divider-bar" style={styles.bar} />
    </View>
  );
}
