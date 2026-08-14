'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para detectar rolagem de página além de um determinado threshold em pixels.
 * Suporta detecção em window e com listener passivo para alta performance (60/120fps).
 */
export function useScrollThreshold(threshold: number = 35) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScroll = () => {
      const currentScroll =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsScrolled(currentScroll > threshold);
    };

    // Verificação inicial
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [threshold]);

  return isScrolled;
}

export default useScrollThreshold;
