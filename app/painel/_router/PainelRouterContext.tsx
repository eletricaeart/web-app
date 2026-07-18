// app/painel/_router/PainelRouterContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

/**
 * --- [ Painel Router ] ---
 *
 * Roteador client-side "fake" para o painel administrativo.
 * Objetivo: trocar de "seção" (o que antes era uma rota do App Router,
 * tipo /clientes, /clientes/novo, /clientes/[id]) sem passar pelo
 * Next.js Router — ou seja, sem re-render de layout, sem RSC payload,
 * sem loading de Suspense a cada clique.
 *
 * Continua sincronizando com window.history para:
 *  - o botão "voltar" do navegador/gesto do celular funcionar
 *  - o F5 (reload) não jogar o usuário pra uma tela em branco
 */

export type PainelParams = Record<string, string>;

interface PainelRouterState {
  section: string;
  params: PainelParams;
}

interface PainelRouterContextValue extends PainelRouterState {
  /** Navega para uma nova seção, empilhando no histórico (equivalente a router.push) */
  push: (section: string, params?: PainelParams) => void;
  /** Troca a seção atual sem empilhar no histórico (equivalente a router.replace) */
  replace: (section: string, params?: PainelParams) => void;
  /** Equivalente a router.back() */
  back: () => void;
}

const DEFAULT_SECTION = 'home';

const PainelRouterContext = createContext<PainelRouterContextValue | null>(
  null,
);

/** Monta a query string a partir da seção + params, pra refletir na URL visível */
function buildSearch(section: string, params: PainelParams): string {
  const qs = new URLSearchParams({ s: section, ...params });
  return `?${qs.toString()}`;
}

/** Lê a seção + params atuais a partir da URL (usado no load inicial e no F5) */
function readFromLocation(): PainelRouterState {
  if (typeof window === 'undefined') {
    return { section: DEFAULT_SECTION, params: {} };
  }
  const qs = new URLSearchParams(window.location.search);
  const section = qs.get('s') || DEFAULT_SECTION;
  const params: PainelParams = {};
  qs.forEach((value, key) => {
    if (key !== 's') params[key] = value;
  });
  return { section, params };
}

export function PainelRouterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PainelRouterState>(() =>
    readFromLocation(),
  );

  // Sincroniza com o botão voltar/avançar do navegador
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state && e.state.section) {
        setState({ section: e.state.section, params: e.state.params || {} });
      } else {
        setState(readFromLocation());
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const push = useCallback((section: string, params: PainelParams = {}) => {
    const url = `${window.location.pathname}${buildSearch(section, params)}`;
    window.history.pushState({ section, params }, '', url);
    setState({ section, params });
  }, []);

  const replace = useCallback((section: string, params: PainelParams = {}) => {
    const url = `${window.location.pathname}${buildSearch(section, params)}`;
    window.history.replaceState({ section, params }, '', url);
    setState({ section, params });
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <PainelRouterContext.Provider value={{ ...state, push, replace, back }}>
      {children}
    </PainelRouterContext.Provider>
  );
}

/** Hook de uso dentro dos componentes de seção do painel */
export function usePainelRouter() {
  const ctx = useContext(PainelRouterContext);
  if (!ctx) {
    throw new Error(
      'usePainelRouter precisa ser usado dentro de <PainelRouterProvider>',
    );
  }
  return ctx;
}
