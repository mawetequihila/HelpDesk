-- =====================================================================
-- AVance HelpDesk · Schema inicial
-- Postgres 15+ (Supabase)
-- =====================================================================

-- ---------- Enums ----------
create type ticket_status as enum ('Aberto', 'Em andamento', 'Aguardando', 'Resolvido', 'Encerrado');
create type ticket_prioridade as enum ('Baixa', 'Média', 'Alta', 'Crítica');
create type ticket_categoria as enum ('Computador', 'Rede', 'Impressora', 'Acesso/Senha', 'Telefone', 'Outro');
create type ticket_impacto as enum ('Só eu', 'Minha equipa', 'Todo o departamento');
create type ticket_andar as enum ('MCC', 'SEDE');
create type historico_tipo as enum ('system', 'action', 'message');
create type user_role as enum ('funcionario', 'ti');

-- ---------- Profiles (extends auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text,
  departamento text,
  andar ticket_andar,
  role user_role not null default 'funcionario',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- ---------- Tickets ----------
create table public.tickets (
  id bigserial primary key,
  requisitante_id uuid not null references public.profiles(id) on delete restrict,
  tecnico_id uuid references public.profiles(id) on delete set null,
  categoria ticket_categoria not null,
  outra_categoria text,
  prioridade ticket_prioridade not null,
  status ticket_status not null default 'Aberto',
  impacto ticket_impacto not null,
  andar ticket_andar not null,
  desde text not null,
  observacoes text,
  -- Resolução (preenchido ao encerrar)
  solucao text,
  materiais_usados text,
  causa_raiz text,
  acao_preventiva text,
  tempo_gasto text,
  resolvido_em timestamptz,
  encerrado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tickets_status_idx on public.tickets(status);
create index tickets_prioridade_idx on public.tickets(prioridade);
create index tickets_requisitante_idx on public.tickets(requisitante_id);
create index tickets_tecnico_idx on public.tickets(tecnico_id);
create index tickets_created_at_idx on public.tickets(created_at desc);

-- ---------- Histórico (eventos do ticket) ----------
create table public.historico (
  id bigserial primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  autor_nome text not null,
  tipo historico_tipo not null,
  evento text not null,
  mensagem text,
  created_at timestamptz not null default now()
);

create index historico_ticket_idx on public.historico(ticket_id, created_at);

-- ---------- Notas internas (só visíveis para TI) ----------
create table public.notas_internas (
  id bigserial primary key,
  ticket_id bigint not null references public.tickets(id) on delete cascade,
  autor_id uuid references public.profiles(id) on delete set null,
  autor_nome text not null,
  texto text not null,
  created_at timestamptz not null default now()
);

create index notas_ticket_idx on public.notas_internas(ticket_id, created_at);

-- ---------- Avaliações ----------
create table public.avaliacoes (
  id bigserial primary key,
  ticket_id bigint not null unique references public.tickets(id) on delete cascade,
  estrelas smallint not null check (estrelas between 1 and 5),
  comentario text,
  created_at timestamptz not null default now()
);

-- ---------- Trigger: updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- ---------- Trigger: criar perfil ao registar utilizador ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    'funcionario'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Trigger: registar 'Chamado criado' no histórico ----------
create or replace function public.log_ticket_created()
returns trigger language plpgsql as $$
declare
  v_nome text;
begin
  select nome into v_nome from public.profiles where id = new.requisitante_id;
  insert into public.historico (ticket_id, autor_id, autor_nome, tipo, evento)
  values (new.id, new.requisitante_id, coalesce(v_nome, 'Sistema'), 'system', 'Chamado criado');
  return new;
end $$;

create trigger tickets_log_created
  after insert on public.tickets
  for each row execute function public.log_ticket_created();

-- =====================================================================
-- Row-Level Security
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.historico enable row level security;
alter table public.notas_internas enable row level security;
alter table public.avaliacoes enable row level security;

-- Helper: utilizador actual é TI?
create or replace function public.is_ti()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ti'
  );
$$;

-- ----- profiles -----
create policy "profiles_self_or_ti_read"
  on public.profiles for select
  using (auth.uid() = id or public.is_ti());

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);

-- ----- tickets -----
create policy "tickets_owner_or_ti_read"
  on public.tickets for select
  using (auth.uid() = requisitante_id or public.is_ti());

create policy "tickets_owner_insert"
  on public.tickets for insert
  with check (auth.uid() = requisitante_id);

create policy "tickets_ti_update"
  on public.tickets for update
  using (public.is_ti());

create policy "tickets_owner_confirm_resolution"
  on public.tickets for update
  using (auth.uid() = requisitante_id and status = 'Resolvido')
  with check (status in ('Encerrado', 'Em andamento'));

-- ----- historico -----
create policy "historico_read_via_ticket"
  on public.historico for select
  using (
    exists (
      select 1 from public.tickets t
      where t.id = historico.ticket_id
        and (t.requisitante_id = auth.uid() or public.is_ti())
    )
  );

create policy "historico_insert_via_ticket"
  on public.historico for insert
  with check (
    autor_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = historico.ticket_id
        and (t.requisitante_id = auth.uid() or public.is_ti())
    )
  );

-- ----- notas_internas (só TI) -----
create policy "notas_ti_read"
  on public.notas_internas for select
  using (public.is_ti());

create policy "notas_ti_insert"
  on public.notas_internas for insert
  with check (public.is_ti() and autor_id = auth.uid());

-- ----- avaliacoes -----
create policy "avaliacoes_read_via_ticket"
  on public.avaliacoes for select
  using (
    exists (
      select 1 from public.tickets t
      where t.id = avaliacoes.ticket_id
        and (t.requisitante_id = auth.uid() or public.is_ti())
    )
  );

create policy "avaliacoes_owner_insert"
  on public.avaliacoes for insert
  with check (
    exists (
      select 1 from public.tickets t
      where t.id = avaliacoes.ticket_id
        and t.requisitante_id = auth.uid()
    )
  );

-- =====================================================================
-- Realtime
-- =====================================================================

alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.historico;
alter publication supabase_realtime add table public.notas_internas;
alter publication supabase_realtime add table public.avaliacoes;
