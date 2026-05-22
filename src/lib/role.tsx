import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Role } from './types';

const STORAGE_KEY = 'avance.role';

interface RoleContextValue {
  role: Role | null;
  setRole: (role: Role | null) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'funcionario' || stored === 'ti' ? stored : null;
  });

  useEffect(() => {
    if (role) window.localStorage.setItem(STORAGE_KEY, role);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleState }}>
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
  const { role } = useRole();
  const location = useLocation();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (!allowed.includes(role)) {
    return <Navigate to={role === 'ti' ? '/admin/dashboard' : '/abrir-chamado'} replace />;
  }
  return <>{children}</>;
}
