import React, { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

// Definimos as nossas props customizadas
interface ViewCustomProps {
  tag?: string | ElementType;
  bg?: string;
  flex?: boolean;
  grid?: boolean;
  w?: string | number;
  h?: string | number;
  m?: string | number;
  pd?: string | number;
  children?: ReactNode;
}

// Usamos um Generic <T> para herdar as props da tag HTML escolhida (ex: div, section)
type ViewProps<T extends ElementType> = ViewCustomProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ViewCustomProps>;

export default function View<T extends ElementType = "div">({
  tag,
  bg,
  flex,
  grid,
  w,
  h,
  m,
  pd,
  children,
  style: styleProp,
  ...props
}: ViewProps<T>) {
  // Garantimos que a Tag comece com letra maiúscula para o JSX entender como componente
  const Tag = (tag || "div") as ElementType; // Definimos explicitamente que Tag é um ElementType para o JSX ficar feliz

  const style: React.CSSProperties = {
    ...(bg && { background: bg }),
    ...(flex && { display: "flex" }),
    ...(grid && { display: "grid" }),
    ...(w && { width: w }),
    ...(h && { height: h }),
    ...(m && { margin: m }),
    ...(pd && { padding: pd }),
    ...styleProp,
  };

  return (
    <Tag style={style} {...props}>
      {children}
    </Tag>
  );
}
