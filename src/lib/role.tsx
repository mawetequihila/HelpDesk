import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { supabase } from './supabase';
import type { Role } from './types';

export interface SessionUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
}

interface RoleContextValue {
  role: Role | null;
  user: SessionUser | null;
  loading: boolean;
  signInAs: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  /** @deprecated Compatibility shim — prefer signInAs / signOut. */
  setRole: (role: Role | null) => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const DEMO_EMAILS: Record<Role, string> = {
  funcionario: 'funcionario@helpdesk.demo',
  ti: 'ti@helpdesk.demo',
};

function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} excedeu ${ms / 1000}s. Verifica a tua ligação ou tenta de novo.`)),
        ms,
      ),
    ),
  ]);
}

async function fetchProfile(userId: string): Promise<SessionUser | null> {
  const { data, error } = await withTimeout(
    supabase.from('profiles').select('id, nome, email, role').eq('id', userId).maybeSingle(),
    10_000,
    'Carregar perfil',
  );
  if (error) {
    console.error('[role] fetchProfile error:', error);
    return null;
  }
  if (!data) {
    console.warn('[role] fetchProfile: sem linha em public.profiles para', userId);
    return null;
  }
  return data as SessionUser;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    }).catch((err) => {
      console.error('[role] getSession error:', err);
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(profile);
      } else {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInAs = async (role: Role) => {
    const password = import.meta.env.VITE_DEMO_PASSWORD;
    if (!password) {
      throw new Error('VITE_DEMO_PASSWORD não está definido nas env vars do Cloudflare.');
    }
    const email = DEMO_EMAILS[role];
    console.log('[role] signInAs', { email });

    // Limpa qualquer sessão stale antes de tentar novo sign-in.
    // Sem isto, o Supabase JS pode ficar bloqueado a tentar refresh de um token inválido.
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — apenas limpeza preventiva
    }

    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      15_000,
      'Login',
    );
    if (error) {
      console.error('[role] signIn error:', error);
      throw error;
    }
    if (!data.user) {
      throw new Error('Login devolveu resposta vazia. Tenta de novo.');
    }
    console.log('[role] signIn ok, fetching profile…');

    // Busca o perfil ANTES de devolver, para que navigate(href) encontre user.role definido.
    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      throw new Error(
        'Login fez-se, mas o perfil não foi encontrado. Provavelmente faltou correr o trigger handle_new_user ou criar a linha em public.profiles para esta conta.',
      );
    }
    setUser(profile);
    console.log('[role] profile set:', profile);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const setRole = async (next: Role | null) => {
    if (next === null) {
      await signOut();
    } else {
      await signInAs(next);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role: user?.role ?? null,
        user,
        loading,
        signInAs,
        signOut,
        setRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
}

interface RequireRoleProps {
  allow: Role | Role[];
  children: ReactNode;
}

export function RequireRole({ allow, children }: RequireRoleProps) {
  const { role, loading } = useRole();
  const location = useLocation();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" aria-label="A carregar" />
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (!allowed.includes(role)) {
    return <Navigate to={role === 'ti' ? '/admin/dashboard' : '/abrir-chamado'} replace />;
  }
  return <>{children}</>;
}
