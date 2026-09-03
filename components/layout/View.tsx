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

const VALID_HTML_TAGS = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'search',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
]);

function getSafeTag(tag?: string | ElementType): {
  SafeTag: ElementType;
  dataTag?: string;
} {
  if (!tag) return { SafeTag: 'div' };
  if (typeof tag !== 'string') return { SafeTag: tag };

  const normalized = tag.toLowerCase().trim();

  // Elementos customizados com hífen (ex: 'page-header', 'card-client') são válidos no HTML5
  if (normalized.includes('-')) {
    return { SafeTag: normalized as ElementType, dataTag: normalized };
  }

  // Tags HTML nativas padrão (ex: 'div', 'section', 'span', 'p')
  if (VALID_HTML_TAGS.has(normalized)) {
    return { SafeTag: normalized as ElementType };
  }

  // Tags não padronizadas sem hífen (ex: 'page', 't', 'ui', 'card', 'content', etc.)
  // Renderizamos como elemento nativo seguro com data-tag para evitar o erro do React
  const SafeTag = normalized === 't' ? 'span' : 'div';
  return { SafeTag, dataTag: normalized };
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
  const { SafeTag, dataTag } = getSafeTag(tag);

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

  const safeClassName = [className, dataTag ? `tag-${dataTag}` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <SafeTag
      ref={ref}
      style={style}
      className={safeClassName || undefined}
      data-tag={dataTag}
      // @ts-ignore
      tag={dataTag}
      {...props}
    >
      {children}
    </SafeTag>
  );
}

const View = forwardRef(ViewComponent);
View.displayName = 'View';

export default View;
