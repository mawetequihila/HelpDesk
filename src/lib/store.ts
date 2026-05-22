/**
 * In-memory store with pub/sub. Drop-in replacement for Supabase realtime
 * while the backend is not provisioned. When Supabase comes online, this
 * file is deleted and api.ts switches to supabase.from(...) + channels.
 *
 * The cachedList field keeps snapshot references stable between mutations
 * so React's useSyncExternalStore does not re-render needlessly.
 */
import { mockActiveTickets, mockUserTickets } from '../data/mock';
import type { Ticket } from './types';

export const MOCK_FUNCIONARIO_EMAIL = 'mawete.quihila@ggpen.gov.ao';
export const MOCK_FUNCIONARIO_NOME = 'Mawete Quihila';

export interface StoredNote {
  id: number;
  data: string;
  texto: string;
  autor: string;
}

export interface StoredRating {
  estrelas: number;
  comentario?: string;
  data: string;
}

export interface StoredTicket extends Ticket {
  notas: StoredNote[];
  avaliacao?: StoredRating;
}

type Listener = () => void;

class TicketStore {
  private tickets = new Map<number, StoredTicket>();
  private cachedList: StoredTicket[] = [];
  private listeners = new Set<Listener>();
  private nextId: number;
  private nextNoteId = 1;

  constructor() {
    // Seed: TI active view (canonical) + funcionario's own tickets (renumbered + reassigned)
    mockActiveTickets.forEach((t) => {
      this.tickets.set(t.id, { ...t, notas: [], avaliacao: undefined });
    });
    mockUserTickets.forEach((t) => {
      const id = t.id + 100;
      this.tickets.set(id, {
        ...t,
        id,
        nome: MOCK_FUNCIONARIO_NOME,
        email: MOCK_FUNCIONARIO_EMAIL,
        notas: [],
        avaliacao: undefined,
      });
    });
    this.nextId = Math.max(0, ...this.tickets.keys()) + 1;
    this.rebuildCache();
  }

  list(): StoredTicket[] {
    return this.cachedList;
  }

  get(id: number): StoredTicket | undefined {
    return this.tickets.get(id);
  }

  reserveTicketId(): number {
    return this.nextId++;
  }

  reserveNoteId(): number {
    return this.nextNoteId++;
  }

  upsert(t: StoredTicket): void {
    this.tickets.set(t.id, t);
    this.rebuildCache();
    this.notify();
  }

  patch(id: number, patcher: (current: StoredTicket) => StoredTicket): StoredTicket | undefined {
    const current = this.tickets.get(id);
    if (!current) return undefined;
    const next = patcher(current);
    if (next === current) return current;
    this.tickets.set(id, next);
    this.rebuildCache();
    this.notify();
    return next;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private rebuildCache(): void {
    this.cachedList = Array.from(this.tickets.values()).sort((a, b) => b.id - a.id);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const ticketStore = new TicketStore();

export const nowStamp = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const todayDateStamp = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
