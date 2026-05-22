/**
 * React hooks for ticket data with Supabase Realtime.
 *
 * Cada hook subscreve aos canais `postgres_changes` das tabelas relevantes.
 * Quando uma linha muda em qualquer cliente, todos os browsers ligados
 * refazem o fetch automaticamente.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import * as api from './api';
import type { StoredTicket } from './api';
import { useRole, type SessionUser } from './role';

const REALTIME_TABLES = ['tickets', 'historico', 'notas_internas', 'avaliacoes'] as const;

/**
 * Subscreve às mudanças e chama o callback quando algo acontece.
 * Devolve a função de unsubscribe.
 */
function subscribeRealtime(channelName: string, onChange: () => void): () => void {
  let channel = supabase.channel(channelName);
  for (const table of REALTIME_TABLES) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => onChange(),
    );
  }
  channel.subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function useTickets(params: api.ListTicketsParams = {}): StoredTicket[] {
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const paramsKey = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    let mounted = true;

    const refetch = async () => {
      try {
        const data = await api.listTickets(paramsRef.current);
        if (mounted) setTickets(data);
      } catch (err) {
        console.error('useTickets refetch failed', err);
      }
    };

    refetch();
    const unsubscribe = subscribeRealtime(`tickets-list-${Math.random().toString(36).slice(2, 8)}`, refetch);

    return () => {
      mounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return tickets;
}

export function useTicketById(id: number | undefined | null): StoredTicket | undefined {
  const [ticket, setTicket] = useState<StoredTicket | undefined>(undefined);

  useEffect(() => {
    if (id == null) {
      setTicket(undefined);
      return;
    }

    let mounted = true;

    const refetch = async () => {
      try {
        const data = await api.getTicket(id);
        if (mounted) setTicket(data);
      } catch (err) {
        console.error('useTicketById refetch failed', err);
      }
    };

    refetch();
    const unsubscribe = subscribeRealtime(`ticket-${id}`, refetch);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [id]);

  return ticket;
}

export function useSessionUser(): SessionUser | null {
  const { user } = useRole();
  return useMemo(() => user, [user]);
}
