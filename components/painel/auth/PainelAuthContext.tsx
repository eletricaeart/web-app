// components/painel/auth/PainelAuthContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { createClient } from '@/lib/supabase/client';

interface PainelProfile {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  specialty?: string;
  whatsapp?: string;
  about?: string;
  photo_url?: string;
  gender?: string;
  [key: string]: any;
}

interface AdminPermissions {
  isAdmin: boolean;
  role?: string;
  can_manage_admins?: boolean;
  can_manage_finance?: boolean;
  can_manage_content?: boolean;
}

interface PainelAuthState {
  userId: string | null;
  email: string | null;
  profile: PainelProfile | null;
  admin: AdminPermissions | null;
}

interface PainelAuthContextValue extends PainelAuthState {
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const CACHE_KEY = 'ea_painel_session';
const EMPTY_STATE: PainelAuthState = {
  userId: null,
  email: null,
  profile: null,
  admin: null,
};

const PainelAuthContext = createContext<PainelAuthContextValue | null>(null);

function readCache(): PainelAuthState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(state: PainelAuthState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  }
}

export function PainelAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const cached = readCache();

  const [state, setState] = useState<PainelAuthState>(cached || EMPTY_STATE);
  const [loading, setLoading] = useState(!cached);

  const load = useCallback(async () => {
    // Sessão local: supabase-js mantém o token em memória/localStorage próprio
    // e só bate na rede quando realmente precisa revalidar.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setState(EMPTY_STATE);
      writeCache(EMPTY_STATE);
      setLoading(false);
      return;
    }

    const userId = session.user.id;
    const email = session.user.email ?? null;

    // Perfil (tabela profiles) + permissões de admin, buscados em paralelo
    const [{ data: profile }, adminRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      fetch('/api/admin/me')
        .then((r) => r.json())
        .catch(() => ({ isAdmin: false })),
    ]);

    const nextState: PainelAuthState = {
      userId,
      email,
      profile: profile || null,
      admin: adminRes,
    };

    setState(nextState);
    writeCache(nextState);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    // Mantém em sincronia caso a sessão mude (ex: logout em outra aba)
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setState(EMPTY_STATE);
        localStorage.removeItem(CACHE_KEY);
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        load();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [load]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(CACHE_KEY);
    window.location.href = '/login';
  }, []);

  return (
    <PainelAuthContext.Provider
      value={{ ...state, loading, refresh: load, signOut }}
    >
      {children}
    </PainelAuthContext.Provider>
  );
}

export function usePainelAuth() {
  const ctx = useContext(PainelAuthContext);
  if (!ctx) {
    throw new Error(
      'usePainelAuth precisa ser usado dentro de <PainelAuthProvider>',
    );
  }
  return ctx;
}
