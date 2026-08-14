// components/painel/layout/PainelBottomNavbar.tsx
'use client';

import React, { useState } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { House, Users, FileText, Toolbox, Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import './painelBottomNavbar.css';

interface NavItem {
  label: string;
  section: string;
  icon: Icon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', section: 'home', icon: House },
  { label: 'Clientes', section: 'clientes', icon: Users },
  { label: 'Documentos', section: 'documentos', icon: FileText },
  { label: 'Ferramentas', section: 'ferramentas', icon: Toolbox },
];

export default function PainelBottomNavbar() {
  const router = usePainelRouter();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  const activeIndex = NAV_ITEMS.findIndex((item) => {
    const s = router.section;
    if (item.section === 'documentos') {
      return (
        s === 'documentos' ||
        s.startsWith('orcamentos') ||
        s.startsWith('notas') ||
        s.startsWith('recibos')
      );
    }
    return s === item.section || s.startsWith(`${item.section}.`);
  });

  const handleTap = (section: string, index: number) => {
    setPressedIndex(index);
    router.push(section);
    window.setTimeout(() => setPressedIndex(null), 260);
  };

  return (
    <nav className="painel-navdock">
      <div
        className="painel-navdock-track"
        style={{ '--nav-count': NAV_ITEMS.length } as React.CSSProperties}
      >
        {activeIndex !== -1 && (
          <span
            className="painel-navdock-indicator"
            style={
              {
                '--nav-index': activeIndex,
              } as React.CSSProperties
            }
          />
        )}

        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          const NavIcon = item.icon;

          return (
            <div
              key={item.section}
              onClick={() => handleTap(item.section, index)}
              className={cn(
                'painel-navdock-item',
                isActive && 'is-active',
                pressedIndex === index && 'is-pressed',
              )}
            >
              <span className="painel-navdock-icon">
                <NavIcon size={22} weight={isActive ? 'fill' : 'regular'} />
              </span>
              <span className="painel-navdock-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
