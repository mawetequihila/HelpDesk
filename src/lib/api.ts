/**
 * AVance HelpDesk · API abstraction layer.
 *
 * Today: mock-backed using ticketStore. Latency is simulated so the UX
 * matches real network behaviour. When Supabase comes online, this file
 * is the only one that swaps to supabase.from(...) calls — the rest of
 * the app (pages, hooks) does not change.
 *
 * Naming mirrors the future Supabase calls so the diff is minimal.
 */
import {
  ticketStore,
  nowStamp,
  todayDateStamp,
  MOCK_FUNCIONARIO_EMAIL,
  MOCK_FUNCIONARIO_NOME,
  type StoredTicket,
} from './store';
import type {
  Building,
  Category,
  Impact,
  Priority,
  Role,
  Status,
} from './types';

// =====================================================================
// Session
// =====================================================================

const ROLE_STORAGE_KEY = 'avance.role';
const SIMULATED_LATENCY_MS = 120;

const delay = (ms: number = SIMULATED_LATENCY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface SessionUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
}

const MOCK_FUNCIONARIO: SessionUser = {
  id: 'mock-funcionario-1',
  nome: MOCK_FUNCIONARIO_NOME,
  email: MOCK_FUNCIONARIO_EMAIL,
  role: 'funcionario',
};

const MOCK_TI: SessionUser = {
  id: 'mock-ti-1',
  nome: 'João Silva',
  email: 'joao.silva@ggpen.gov.ao',
  role: 'ti',
};

export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const role = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (role === 'ti') return MOCK_TI;
  if (role === 'funcionario') return MOCK_FUNCIONARIO;
  return null;
}

// =====================================================================
// Queries
// =====================================================================

export interface ListTicketsParams {
  ownedByEmail?: string;
  statusIn?: Status[];
  search?: string;
}

export async function listTickets(params: ListTicketsParams = {}): Promise<StoredTicket[]> {
  await delay();
  let tickets = ticketStore.list();
  if (params.ownedByEmail) {
    tickets = tickets.filter((t) => t.email === params.ownedByEmail);
  }
  if (params.statusIn && params.statusIn.length > 0) {
    const set = new Set(params.statusIn);
    tickets = tickets.filter((t) => set.has(t.status));
  }
  if (params.search?.trim()) {
    const q = params.search.toLowerCase();
    tickets = tickets.filter((t) => {
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
  return tickets;
}

export async function getTicket(id: number): Promise<StoredTicket | undefined> {
  await delay(60);
  return ticketStore.get(id);
}

// =====================================================================
// Mutations · funcionario
// =====================================================================

export interface CreateTicketInput {
  nome: string;
  email: string;
  departamento: string;
  outroDepartamento?: string;
  andar: Building;
  urgencia: Priority;
  area: Category;
  outraArea?: string;
  desde: string;
  outroDesdequando?: string;
  impacto: Impact;
  observacoes?: string;
}

export async function createTicket(input: CreateTicketInput): Promise<StoredTicket> {
  await delay();
  const id = ticketStore.reserveTicketId();
  const departamento =
    input.departamento === 'Outro' && input.outroDepartamento
      ? input.outroDepartamento
      : input.departamento;
  const desde =
    input.desde === 'Outro' && input.outroDesdequando ? input.outroDesdequando : input.desde;

  const ticket: StoredTicket = {
    id,
    nome: input.nome,
    email: input.email,
    departamento,
    andar: input.andar,
    categoria: input.area,
    prioridade: input.urgencia,
    status: 'Aberto',
    impacto: input.impacto,
    desde,
    observacoes: input.observacoes,
    descricao: input.observacoes,
    data: todayDateStamp(),
    tecnico: '-',
    ultimaAtualizacao: 'agora mesmo',
    historico: [
      {
        data: nowStamp(),
        evento: 'Chamado criado',
        autor: 'Sistema',
        tipo: 'system',
      },
    ],
    notas: [],
  };
  ticketStore.upsert(ticket);
  return ticket;
}

export async function confirmResolution(id: number): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  return ticketStore.patch(id, (t) => ({
    ...t,
    status: 'Encerrado',
    ultimaAtualizacao: 'agora mesmo',
    historico: [
      ...t.historico,
      {
        data: nowStamp(),
        evento: 'Resolução confirmada pelo funcionário',
        autor: user?.nome ?? 'Funcionário',
        tipo: 'action',
      },
    ],
  }));
}

export async function reopenTicket(
  id: number,
  motivo: string,
): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  return ticketStore.patch(id, (t) => ({
    ...t,
    status: 'Em andamento',
    ultimaAtualizacao: 'agora mesmo',
    historico: [
      ...t.historico,
      {
        data: nowStamp(),
        evento: 'Chamado reaberto pelo funcionário',
        autor: user?.nome ?? 'Funcionário',
        mensagem: motivo,
        tipo: 'message',
      },
    ],
  }));
}

export async function rateTicket(
  id: number,
  estrelas: number,
  comentario?: string,
): Promise<StoredTicket | undefined> {
  await delay();
  return ticketStore.patch(id, (t) => ({
    ...t,
    avaliacao: { estrelas, comentario, data: nowStamp() },
  }));
}

// =====================================================================
// Mutations · TI
// =====================================================================

export async function assumeTicket(id: number): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  if (!user) throw new Error('Sem sessão');
  return ticketStore.patch(id, (t) => {
    if (t.tecnico && t.tecnico !== '-') return t;
    return {
      ...t,
      tecnico: user.nome,
      status: t.status === 'Aberto' ? 'Em andamento' : t.status,
      ultimaAtualizacao: 'agora mesmo',
      historico: [
        ...t.historico,
        {
          data: nowStamp(),
          evento: `Técnico ${user.nome} assumiu o chamado`,
          autor: user.nome,
          tipo: 'action',
        },
      ],
    };
  });
}

export async function changeStatus(
  id: number,
  next: Status,
): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  return ticketStore.patch(id, (t) => {
    if (t.status === next) return t;
    return {
      ...t,
      status: next,
      ultimaAtualizacao: 'agora mesmo',
      historico: [
        ...t.historico,
        {
          data: nowStamp(),
          evento: `Estado alterado para "${next}"`,
          autor: user?.nome ?? 'Sistema',
          tipo: 'action',
        },
      ],
    };
  });
}

export async function sendMessage(
  id: number,
  mensagem: string,
): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  if (!user) throw new Error('Sem sessão');
  return ticketStore.patch(id, (t) => ({
    ...t,
    ultimaAtualizacao: 'agora mesmo',
    historico: [
      ...t.historico,
      {
        data: nowStamp(),
        evento: user.role === 'ti' ? 'Mensagem ao funcionário' : 'Mensagem ao técnico',
        autor: user.nome,
        mensagem,
        tipo: 'message',
      },
    ],
  }));
}

export async function addInternalNote(
  id: number,
  texto: string,
): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  if (!user) throw new Error('Sem sessão');
  return ticketStore.patch(id, (t) => ({
    ...t,
    notas: [
      ...t.notas,
      {
        id: ticketStore.reserveNoteId(),
        data: nowStamp(),
        texto,
        autor: user.nome,
      },
    ],
  }));
}

export async function escalateTicket(
  id: number,
  motivo: string,
): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  return ticketStore.patch(id, (t) => ({
    ...t,
    ultimaAtualizacao: 'agora mesmo',
    historico: [
      ...t.historico,
      {
        data: nowStamp(),
        evento: `Chamado escalado: ${motivo}`,
        autor: user?.nome ?? 'Sistema',
        tipo: 'action',
      },
    ],
  }));
}

export interface ResolutionInput {
  solucao: string;
  materiaisUsados?: string;
  causaRaiz?: string;
  acaoPreventiva?: string;
  tempoGasto?: string;
}

export async function closeTicket(
  id: number,
  resolution: ResolutionInput,
): Promise<StoredTicket | undefined> {
  await delay();
  const user = getCurrentUser();
  return ticketStore.patch(id, (t) => ({
    ...t,
    status: 'Resolvido',
    ultimaAtualizacao: 'agora mesmo',
    historico: [
      ...t.historico,
      {
        data: nowStamp(),
        evento: 'Chamado resolvido',
        autor: user?.nome ?? 'Sistema',
        mensagem: resolution.solucao,
        tipo: 'message',
      },
    ],
  }));
}
