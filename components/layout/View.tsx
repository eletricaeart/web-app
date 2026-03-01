import React, { ElementType, forwardRef, ReactNode } from "react";

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
// type ViewProps<T extends ElementType> = ViewCustomProps &
//   Omit<ComponentPropsWithoutRef<T>, keyof ViewCustomProps>;

/*const View = forwardRef<HTMLDivElement, ViewCustomProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ tag, bg, flex, grid, w, h, m, pd, children, style: styleProp, ...props }, ref) => {*/

function ViewComponent(
  {
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
  }: ViewCustomProps & React.HTMLAttributes<HTMLDivElement>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  // Mantemos a sua lógica de Tag dinâmica
  const Tag = (tag || "div") as any;

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
    <Tag ref={ref} style={style} {...props}>
      {children}
    </Tag>
  );
}

const View = forwardRef(ViewComponent);
// Importante para o Next.js não reclamar no build
View.displayName = "View";

export default View;
