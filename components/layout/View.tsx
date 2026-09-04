// components/layout/View.tsx
import React, { ElementType, forwardRef, ReactNode } from 'react';

// Definimos as nossas props customizadas
export interface ViewProps {
  tag?: string | ElementType;
  bg?: string;
  flex?: boolean;
  grid?: boolean;
  w?: string | number;
  h?: string | number;
  m?: string | number;
  pd?: string | number;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

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
    disabled,
    children,
    className,
    style: styleProp,
    ...props
  }: ViewProps & React.HTMLAttributes<HTMLDivElement>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  // Mantemos a lógica original de Tag dinâmica do sistema Elétrica & Art
  const Tag = (tag || 'div') as any;
  const tagString =
    typeof tag === 'string' ? tag.toLowerCase().trim() : undefined;

  const style: React.CSSProperties = {
    ...(bg && { background: bg }),
    ...(flex && { display: 'flex' }),
    ...(grid && { display: 'grid' }),
    ...(w && { width: w }),
    ...(h && { height: h }),
    ...(m && { margin: m }),
    ...(pd && { padding: pd }),
    ...(disabled && { opacity: 1 }),
    ...styleProp,
  };

  return (
    <Tag
      ref={ref}
      style={style}
      className={className}
      data-tag={tagString}
      tag={tagString}
      {...props}
    >
      {children}
    </Tag>
  );
}

const View = forwardRef(ViewComponent);
View.displayName = 'View';

export default View;
