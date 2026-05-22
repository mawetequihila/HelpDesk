/**
 * React hooks for ticket data with realtime subscription.
 *
 * In mock mode: subscribes to ticketStore's pub/sub — any mutation via api.*
 * triggers re-renders on all components reading from these hooks.
 *
 * When Supabase comes online: same hooks subscribe to postgres_changes
 * channels via supabase.channel(...). The component API does not change.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { ticketStore, type StoredTicket } from './store';
import { getCurrentUser, type ListTicketsParams, type SessionUser } from './api';
import { useRole } from './role';
import type { Status } from './types';

function subscribeStore(callback: () => void): () => void {
  return ticketStore.subscribe(callback);
}

function getAllTickets(): StoredTicket[] {
  return ticketStore.list();
}

function filterTickets(tickets: StoredTicket[], params: ListTicketsParams): StoredTicket[] {
  let out = tickets;
  if (params.ownedByEmail) {
    out = out.filter((t) => t.email === params.ownedByEmail);
  }
  if (params.statusIn && params.statusIn.length > 0) {
    const set = new Set<Status>(params.statusIn);
    out = out.filter((t) => set.has(t.status));
  }
  if (params.search?.trim()) {
    const q = params.search.toLowerCase();
    out = out.filter((t) => {
      const haystack = [
        String(t.id),
        t.nome,
        t.email ?? '',
        t.categoria,
        t.status,
        t.prioridade,
        t.tecnico,
        t.descricao ?? '',
        t.departamento,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
  return out;
}

export function useTickets(params: ListTicketsParams = {}): StoredTicket[] {
  const all = useSyncExternalStore(subscribeStore, getAllTickets, getAllTickets);
  const paramsKey = JSON.stringify(params);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => filterTickets(all, params), [all, paramsKey]);
}

export function useTicketById(id: number | undefined | null): StoredTicket | undefined {
  return useSyncExternalStore(
    subscribeStore,
    () => (id == null ? undefined : ticketStore.get(id)),
    () => undefined,
  );
}

export function useSessionUser(): SessionUser | null {
  const { role } = useRole();
  return role ? getCurrentUser() : null;
}
