/**
 * AVance HelpDesk · API layer (Supabase).
 *
 * Cada função devolve o shape `StoredTicket` que as páginas esperam.
 * O mapeamento de linhas Supabase → StoredTicket vive em `mapTicketRow`.
 */
import { supabase } from './supabase';
import type {
  Building,
  Category,
  HistoryEntry,
  Impact,
  Priority,
  Status,
} from './types';

// =====================================================================
// Helpers
// =====================================================================

function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} excedeu ${ms / 1000}s. Verifica a tua ligação.`)),
        ms,
      ),
    ),
  ]);
}

const TICKET_SELECT = `
  id, status, prioridade, categoria, outra_categoria, andar, impacto, desde,
  observacoes, solucao, materiais_usados, causa_raiz, acao_preventiva,
  tempo_gasto, resolvido_em, encerrado_em, created_at, updated_at,
  requisitante:requisitante_id ( id, nome, email, telefone, departamento ),
  tecnico:tecnico_id ( id, nome ),
  historico ( id, created_at, evento, autor_nome, mensagem, tipo ),
  notas_internas ( id, autor_nome, texto, created_at ),
  avaliacoes ( estrelas, comentario, created_at )
`;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `Há ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Há ${hr} ${hr === 1 ? 'hora' : 'horas'}`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `Há ${day} ${day === 1 ? 'dia' : 'dias'}`;
  return formatDate(iso);
}

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

export interface StoredTicket {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  departamento: string;
  andar: Building;
  categoria: Category;
  prioridade: Priority;
  status: Status;
  impacto?: Impact;
  desde?: string;
  observacoes?: string;
  descricao?: string;
  data: string;
  /** ISO timestamp for time-based filtering (last 30 days, etc.) */
  createdAtISO: string;
  /** ISO timestamp of resolution, if applicable */
  resolvidoEmISO?: string;
  tecnico: string;
  /** True when a técnico has been assigned, regardless of whether name is shown */
  tecnicoAssigned: boolean;
  ultimaAtualizacao: string;
  tempo?: string;
  historico: HistoryEntry[];
  notas: StoredNote[];
  avaliacao?: StoredRating;
}

interface TicketRow {
  id: number;
  status: Status;
  prioridade: Priority;
  categoria: Category;
  outra_categoria: string | null;
  andar: Building;
  impacto: Impact;
  desde: string;
  observacoes: string | null;
  solucao: string | null;
  materiais_usados: string | null;
  causa_raiz: string | null;
  acao_preventiva: string | null;
  tempo_gasto: string | null;
  resolvido_em: string | null;
  encerrado_em: string | null;
  created_at: string;
  updated_at: string;
  requisitante: { id: string; nome: string; email: string; telefone: string | null; departamento: string | null } | null;
  tecnico: { id: string; nome: string } | null;
  historico: {
    id: number;
    created_at: string;
    evento: string;
    autor_nome: string;
    mensagem: string | null;
    tipo: 'system' | 'action' | 'message';
  }[];
  notas_internas: {
    id: number;
    autor_nome: string;
    texto: string;
    created_at: string;
  }[];
  avaliacoes: {
    estrelas: number;
    comentario: string | null;
    created_at: string;
  }[];
}

function mapTicketRow(row: TicketRow): StoredTicket {
  const rawHistorico = row.historico ?? [];
  const rawNotas = row.notas_internas ?? [];
  const rawAval = row.avaliacoes ?? [];

  const historico: HistoryEntry[] = [...rawHistorico]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((h) => ({
      data: formatDateTime(h.created_at),
      evento: h.evento,
      autor: h.autor_nome,
      mensagem: h.mensagem ?? undefined,
      tipo: h.tipo,
    }));

  const notas: StoredNote[] = [...rawNotas]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((n) => ({
      id: n.id,
      data: formatDateTime(n.created_at),
      texto: n.texto,
      autor: n.autor_nome,
    }));

  const aval = rawAval[0];
  const avaliacao: StoredRating | undefined = aval
    ? {
        estrelas: aval.estrelas,
        comentario: aval.comentario ?? undefined,
        data: formatDateTime(aval.created_at),
      }
    : undefined;

  return {
    id: row.id,
    nome: row.requisitante?.nome ?? '—',
    email: row.requisitante?.email,
    telefone: row.requisitante?.telefone ?? undefined,
    departamento: row.requisitante?.departamento ?? '—',
    andar: row.andar,
    categoria: row.categoria,
    prioridade: row.prioridade,
    status: row.status,
    impacto: row.impacto,
    desde: row.desde,
    observacoes: row.observacoes ?? undefined,
    descricao: row.observacoes ?? undefined,
    data: formatDate(row.created_at),
    createdAtISO: row.created_at,
    resolvidoEmISO: row.resolvido_em ?? undefined,
    tecnico: row.tecnico?.nome ?? '-',
    tecnicoAssigned: Boolean(row.tecnico?.id),
    ultimaAtualizacao: formatRelative(row.updated_at),
    historico,
    notas,
    avaliacao,
  };
}

async function getCurrentProfile(): Promise<{ id: string; nome: string; role: string } | null> {
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 8_000, 'getUser');
  if (!user) return null;
  const { data: profile, error } = await withTimeout(
    supabase.from('profiles').select('id, nome, role').eq('id', user.id).maybeSingle(),
    8_000,
    'getProfile',
  );
  if (error) {
    console.error('[api] getCurrentProfile error:', error);
    return null;
  }
  if (!profile) {
    console.warn('[api] getCurrentProfile: sem linha em public.profiles para user', user.id);
    return null;
  }
  return profile;
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
  let query = supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .order('created_at', { ascending: false });

  if (params.statusIn && params.statusIn.length > 0) {
    query = query.in('status', params.statusIn);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  let tickets = (data as unknown as TicketRow[]).map(mapTicketRow);

  if (params.ownedByEmail) {
    tickets = tickets.filter((t) => t.email === params.ownedByEmail);
  }

  if (params.search?.trim()) {
    const q = params.search.toLowerCase();
    tickets = tickets.filter((t) => {
      const haystack = [
        String(t.id), t.nome, t.email ?? '', t.categoria, t.status,
        t.prioridade, t.tecnico, t.descricao ?? '', t.departamento,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  return tickets;
}

export async function getTicket(id: number): Promise<StoredTicket | undefined> {
  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return mapTicketRow(data as unknown as TicketRow);
}

// =====================================================================
// Mutations · funcionário
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
  console.log('[api] createTicket: fetching current profile…');
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão. Volta a fazer login.');
  console.log('[api] createTicket: profile', profile);

  const departamento =
    input.departamento === 'Outro' && input.outroDepartamento
      ? input.outroDepartamento
      : input.departamento;
  const desde =
    input.desde === 'Outro' && input.outroDesdequando ? input.outroDesdequando : input.desde;
  const outraCategoria =
    input.area === 'Outro' && input.outraArea ? input.outraArea : null;

  // Enriquece o perfil com os dados do form (nome/departamento podem ainda estar vazios)
  const { error: profileUpdateError } = await withTimeout(
    supabase
      .from('profiles')
      .update({ nome: input.nome, departamento, andar: input.andar })
      .eq('id', profile.id),
    10_000,
    'Atualizar perfil',
  );
  if (profileUpdateError) {
    console.warn('[api] profile update warning:', profileUpdateError);
  }

  console.log('[api] createTicket: inserting ticket…');
  const { data, error } = await withTimeout(
    supabase
      .from('tickets')
      .insert({
        requisitante_id: profile.id,
        categoria: input.area,
        outra_categoria: outraCategoria,
        prioridade: input.urgencia,
        impacto: input.impacto,
        andar: input.andar,
        desde,
        observacoes: input.observacoes || null,
      })
      .select(TICKET_SELECT)
      .single(),
    15_000,
    'Inserir ticket',
  );
  if (error) {
    console.error('[api] createTicket insert error:', error);
    throw error;
  }
  console.log('[api] createTicket ok', { id: (data as { id?: number })?.id });

  return mapTicketRow(data as unknown as TicketRow);
}

export async function confirmResolution(id: number): Promise<void> {
  const profile = await getCurrentProfile();
  const { error } = await supabase
    .from('tickets')
    .update({ status: 'Encerrado', encerrado_em: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  if (profile) {
    await supabase.from('historico').insert({
      ticket_id: id,
      autor_id: profile.id,
      autor_nome: profile.nome,
      tipo: 'action',
      evento: 'Resolução confirmada pelo funcionário',
    });
  }
}

export async function reopenTicket(id: number, motivo: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');
  const { error } = await supabase
    .from('tickets')
    .update({ status: 'Em andamento', resolvido_em: null })
    .eq('id', id);
  if (error) throw error;
  await supabase.from('historico').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    tipo: 'message',
    evento: 'Chamado reaberto pelo funcionário',
    mensagem: motivo,
  });
}

export async function rateTicket(
  id: number,
  estrelas: number,
  comentario?: string,
): Promise<void> {
  const { error } = await supabase
    .from('avaliacoes')
    .insert({ ticket_id: id, estrelas, comentario: comentario ?? null });
  if (error) throw error;
}

// =====================================================================
// Mutations · TI
// =====================================================================

export async function assumeTicket(id: number): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');

  const { data: current } = await supabase
    .from('tickets')
    .select('tecnico_id, status')
    .eq('id', id)
    .single();
  if (current?.tecnico_id) {
    throw new Error('Chamado já atribuído.');
  }

  const nextStatus = current?.status === 'Aberto' ? 'Em andamento' : current?.status;
  const { error } = await supabase
    .from('tickets')
    .update({ tecnico_id: profile.id, status: nextStatus })
    .eq('id', id);
  if (error) throw error;

  await supabase.from('historico').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    tipo: 'action',
    evento: 'Equipa de TI assumiu o chamado',
  });
}

export async function changeStatus(id: number, next: Status): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');
  const { error } = await supabase
    .from('tickets')
    .update({ status: next })
    .eq('id', id);
  if (error) throw error;
  await supabase.from('historico').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    tipo: 'action',
    evento: `Estado alterado para "${next}"`,
  });
}

export async function sendMessage(id: number, mensagem: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');
  const evento = profile.role === 'ti' ? 'Mensagem ao funcionário' : 'Mensagem ao técnico';
  const { error } = await supabase.from('historico').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    tipo: 'message',
    evento,
    mensagem,
  });
  if (error) throw error;
  await supabase.from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', id);
}

export async function addInternalNote(id: number, texto: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');
  const { error } = await supabase.from('notas_internas').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    texto,
  });
  if (error) throw error;
}

export async function escalateTicket(id: number, motivo: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');
  const { error } = await supabase.from('historico').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    tipo: 'action',
    evento: `Chamado escalado: ${motivo}`,
  });
  if (error) throw error;
}

export interface ResolutionInput {
  solucao: string;
  materiaisUsados?: string;
  causaRaiz?: string;
  acaoPreventiva?: string;
  tempoGasto?: string;
}

export async function closeTicket(id: number, resolution: ResolutionInput): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Sem sessão.');
  const { error } = await supabase
    .from('tickets')
    .update({
      status: 'Resolvido',
      solucao: resolution.solucao,
      materiais_usados: resolution.materiaisUsados ?? null,
      causa_raiz: resolution.causaRaiz ?? null,
      acao_preventiva: resolution.acaoPreventiva ?? null,
      tempo_gasto: resolution.tempoGasto ?? null,
      resolvido_em: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
  await supabase.from('historico').insert({
    ticket_id: id,
    autor_id: profile.id,
    autor_nome: profile.nome,
    tipo: 'message',
    evento: 'Chamado resolvido',
    mensagem: resolution.solucao,
  });
}
