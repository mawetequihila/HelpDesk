/**
 * React hooks for ticket data with Supabase Realtime.
 *
 * Cada hook subscreve aos canais `postgres_changes` das tabelas relevantes.
 * Quando uma linha muda em qualquer cliente, todos os browsers ligados
 * refazem o fetch automaticamente.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
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

export interface UseTicketByIdResult {
  ticket: StoredTicket | undefined;
  loading: boolean;
}

export function useTicketById(id: number | undefined | null): UseTicketByIdResult {
  const [ticket, setTicket] = useState<StoredTicket | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(id != null);

  useEffect(() => {
    if (id == null) {
      setTicket(undefined);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const refetch = async () => {
      try {
        const data = await api.getTicket(id);
        if (mounted) setTicket(data);
      } catch (err) {
        console.error('useTicketById refetch failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    refetch();
    const unsubscribe = subscribeRealtime(`ticket-${id}`, refetch);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [id]);

  return { ticket, loading };
}

export function useSessionUser(): SessionUser | null {
  const { user } = useRole();
  return useMemo(() => user, [user]);
}

// =====================================================================
// Sound utility (Web Audio — sem ficheiros)
// =====================================================================

let audioCtx: AudioContext | null = null;

function playNotificationSound() {
  try {
    type WindowWithWebkitAudio = typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    if (!audioCtx) {
      const w = window as WindowWithWebkitAudio;
      const Ctor: typeof AudioContext | undefined = window.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    const ctx = audioCtx;
    const now = ctx.currentTime;
    // Two-tone "bing-bong" usando dois osciladores em sequência
    const tones: Array<{ freq: number; start: number; dur: number }> = [
      { freq: 880, start: 0, dur: 0.18 },
      { freq: 660, start: 0.18, dur: 0.22 },
    ];
    for (const tone of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = tone.freq;
      gain.gain.setValueAtTime(0, now + tone.start);
      gain.gain.linearRampToValueAtTime(0.18, now + tone.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.dur + 0.05);
    }
  } catch {
    // sem som — silently ignored (browsers podem bloquear sem interacção do user)
  }
}

// =====================================================================
// Notificações realtime
// =====================================================================

/**
 * Painel TI — toast + som sempre que um chamado novo é inserido.
 * Ignora o "snapshot" inicial: só dispara em INSERTs que acontecem DEPOIS
 * da subscrição ficar activa.
 */
export function useNewTicketNotifications(enabled: boolean) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel(`new-tickets-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        (payload) => {
          const row = payload.new as { id?: number; prioridade?: string } | null;
          const id = row?.id;
          const prioridade = row?.prioridade ?? '';
          playNotificationSound();
          toast.info(`Novo chamado #${id ?? '?'} recebido`, {
            description: prioridade ? `Prioridade: ${prioridade}` : 'Clique para abrir.',
            action: id
              ? {
                  label: 'Abrir',
                  onClick: () => navigate(`/admin/chamado/${id}`),
                }
              : undefined,
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, navigate]);
}

/**
 * Painel Funcionário — toast quando um dos chamados do utilizador passa de
 * "sem técnico" para "técnico atribuído" (campo `tecnico_id` muda de null
 * para um valor).
 * O nome do técnico nunca é exposto — apenas "Equipa de TI".
 */
export function useTicketAssumedNotifications(enabled: boolean, userId: string | undefined) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!enabled || !userId) return;
    const channel = supabase
      .channel(`ticket-assumed-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        (payload) => {
          const oldRow = payload.old as { tecnico_id?: string | null; requisitante_id?: string | null } | null;
          const newRow = payload.new as { id?: number; tecnico_id?: string | null; requisitante_id?: string | null } | null;
          if (!newRow) return;
          // Só interessam tickets do utilizador
          if (newRow.requisitante_id !== userId) return;
          // Só interessa a transição null → valor
          const wasUnassigned = !oldRow?.tecnico_id;
          const isNowAssigned = Boolean(newRow.tecnico_id);
          if (!wasUnassigned || !isNowAssigned) return;
          const id = newRow.id;
          toast.success('A Equipa de TI assumiu o seu chamado', {
            description: id ? `Chamado #${id} agora em análise.` : undefined,
            action: id
              ? {
                  label: 'Ver',
                  onClick: () => navigate('/meus-chamados'),
                }
              : undefined,
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, userId, navigate]);
}
