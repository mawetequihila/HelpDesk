# Supabase — AVance HelpDesk

Documentação para avaliação da Compliance + passos de setup quando a luz verde chegar.

## Para a Compliance

### Tipo de dados armazenados
- **Identificação do colaborador**: nome, email corporativo, departamento, andar (MCC/SEDE), telefone.
- **Conteúdo dos chamados**: descrição do problema, observações, anexos (apenas em fase 2 — não no MVP).
- **Histórico de interacções**: mensagens entre funcionário e técnico, notas internas da TI, mudanças de estado.
- **Avaliações**: estrelas e comentário do funcionário ao fechar o chamado.
- **Sem dados sensíveis** definidos pelo RGPD-AO (sem dados de saúde, biométricos, financeiros, judiciais).

### Encriptação
- **Em repouso**: AES-256 transparente ao nível do storage (Supabase usa volumes EBS encriptados na AWS).
- **Em trânsito**: TLS 1.3 obrigatório. Sem ligações em claro.
- **Connection strings** rotacionadas via Supabase Dashboard.

### Regiões disponíveis (free tier + paid)
| Região | Localização | Latência est. de Luanda |
|---|---|---|
| `eu-west-1` | Irlanda | ~140 ms |
| `eu-central-1` | Frankfurt | ~160 ms |
| `us-east-1` | Virgínia (EUA) | ~180 ms |
| `af-south-1` | Cidade do Cabo (AWS, **paid plan**) | ~80 ms |

Recomendação: começar em `eu-west-1` (Irlanda) por latência razoável e jurisdição UE/RGPD. Quando justificar custo, migrar para `af-south-1` para máxima proximidade.

### Self-hosting (alternativa)
Supabase é **open-source** (PostgreSQL + GoTrue + Realtime + PostgREST). Caso a Compliance exija dados em território angolano:
- Instalável on-premises via Docker Compose ou Kubernetes.
- Toda a stack é executada no GGPEN sem dependência externa.
- O código frontend não muda — só o `VITE_SUPABASE_URL` aponta para o servidor interno.

### Retenção e backup
- Backups automáticos diários, retenção de 7 dias no free tier (30 dias em Pro).
- Point-in-time recovery disponível em Pro (recuperação a qualquer minuto até 7 dias atrás).
- Os dados podem ser exportados em qualquer momento (pg_dump).

### Acesso e auditoria
- **Row-Level Security (RLS)** activado em todas as tabelas (ver [0001_init.sql](migrations/0001_init.sql)).
- Funcionário só vê os seus próprios chamados; só TI vê notas internas.
- Cada mudança fica registada em `historico` com `autor_id` + timestamp — log de auditoria nativo.

### Custo estimado
- **Free tier**: 500 MB DB, 1 GB storage, 50.000 utilizadores activos por mês, 2 GB de tráfego realtime. Para um helpdesk interno de ~200 colaboradores e ~30 chamados/dia, está confortavelmente dentro do free tier durante o primeiro ano.
- **Pro**: $25/mês quando ultrapassar limites. Inclui backups de 30 dias, suporte por email, sem pausa de inactividade.

---

## Setup quando a luz verde chegar

### 1. Criar projecto Supabase
1. Ir a [supabase.com](https://supabase.com) → New Project.
2. Nome: `avance-helpdesk` (ou `ggpen-helpdesk`).
3. Região: `eu-west-1` (ou conforme decisão Compliance).
4. Database password: gerar e guardar em cofre.

### 2. Correr a migração
Via Supabase Studio (SQL Editor) ou via CLI:
```bash
# Opção CLI (recomendado para repetibilidade)
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### 3. Configurar Auth
Em **Authentication → Providers**:
- **Email**: activado, com confirmação de email.
- (Opcional fase 2) **Azure (AAD)**: para SSO com M365 do GGPEN. Necessita registar app no Azure Portal e copiar Client ID/Secret.

### 4. Promover utilizadores TI
Após registo, alterar `role` no Studio:
```sql
update public.profiles set role = 'ti' where email = 'tecnico@ggpen.gov.ao';
```

### 5. Configurar `.env.local` no frontend
Copiar `.env.example` para `.env.local`:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 6. Trocar implementação do `src/lib/api.ts`
Hoje devolve mocks com latência simulada. Trocar pelos `supabase.from(...).select()` reais — ~50 linhas. Os pages não mudam.

### 7. Trocar `src/lib/role.tsx` por Supabase Auth
Eliminar o `RoleSelector` mock; usar página de login Supabase. O role passa a vir do `profiles.role`.

### 8. Testar realtime
Abrir dashboard num browser, abrir chamado noutro — o cartão aparece sem refresh.

---

## Estrutura

- [migrations/0001_init.sql](migrations/0001_init.sql) — schema inicial (tabelas, enums, triggers, RLS, realtime).
- Futuras migrations: `0002_*.sql`, `0003_*.sql`, etc, em ordem cronológica.
