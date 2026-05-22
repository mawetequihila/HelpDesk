import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell, Clock, AlertTriangle, CheckCircle2,
  AlertCircle, Hourglass, List, LayoutDashboard, Search,
  BarChart3, PieChart, Monitor, CalendarRange,
  Wrench, Lightbulb,
  type LucideIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  AreaChart, Area, PieChart as RechartsPie, Pie, Cell,
  CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { recurrentProblems } from '../../data/mock';
import { useTickets, useNewTicketNotifications } from '../../lib/hooks';
import { getPriorityStyle, getStatusStyle } from '../../lib/tickets';
import type { RecurrentProblem, Status, Category } from '../../lib/types';
import type { StoredTicket } from '../../lib/api';

interface Metric {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
}

const CATEGORY_COLOR: Record<Category, string> = {
  Computador: '#0D3B66',
  Rede: '#0077B6',
  Impressora: '#f59e0b',
  'Acesso/Senha': '#10b981',
  Telefone: '#ef4444',
  Outro: '#94a3b8',
};

function isWithinLastDays(iso: string, days: number): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return '—';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} dias`;
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff',
  boxShadow: '0 10px 30px rgba(15,23,42,0.1)', padding: '10px 14px', fontSize: 13,
};

export default function ITDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [selectedProblemInfo, setSelectedProblemInfo] = useState<RecurrentProblem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast + som sempre que entra um chamado novo em qualquer cliente
  useNewTicketNotifications(true);

  const filteredTickets = useTickets({
    statusIn: ['Aberto', 'Em andamento', 'Aguardando'],
    search: searchQuery,
  });
  const allActiveForAlerts = useTickets({
    statusIn: ['Aberto', 'Em andamento', 'Aguardando'],
  });
  // Todos os tickets (sem filtro de estado) — usado para métricas reais
  const allTickets = useTickets({});

  const kanbanColumns: Record<Status, StoredTicket[]> = {
    Aberto: filteredTickets.filter((t) => t.status === 'Aberto'),
    'Em andamento': filteredTickets.filter((t) => t.status === 'Em andamento'),
    Aguardando: filteredTickets.filter((t) => t.status === 'Aguardando'),
    Resolvido: filteredTickets.filter((t) => t.status === 'Resolvido'),
    Encerrado: [],
  };

  const criticalTickets = allActiveForAlerts.filter(
    (t) => t.prioridade === 'Crítica' && t.status === 'Aberto',
  );

  // -------------------- Métricas reais (calculadas a partir dos tickets) --------------------
  const metrics: Metric[] = useMemo(() => {
    const abertos = allTickets.filter((t) => t.status === 'Aberto').length;
    const emAndamento = allTickets.filter((t) => t.status === 'Em andamento').length;
    const resolvidosHoje = allTickets.filter(
      (t) => (t.status === 'Resolvido' || t.status === 'Encerrado') && t.resolvidoEmISO && isToday(t.resolvidoEmISO),
    ).length;
    const criticos = allTickets.filter(
      (t) => t.prioridade === 'Crítica' && t.status !== 'Encerrado' && t.status !== 'Resolvido',
    ).length;
    return [
      { label: 'Abertos', value: abertos, hint: 'Sem técnico ainda', icon: AlertTriangle, iconBg: 'bg-brand-soft', iconText: 'text-brand-dark' },
      { label: 'Em andamento', value: emAndamento, hint: 'Em análise activa', icon: Hourglass, iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
      { label: 'Resolvidos hoje', value: resolvidosHoje, hint: 'Fechados nas últimas 24h', icon: CheckCircle2, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
      { label: 'Críticos', value: criticos, hint: 'Prioridade máxima', icon: AlertCircle, iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
    ];
  }, [allTickets]);

  // -------------------- Distribuição por categoria (tickets recentes — 30 dias) --------------------
  const categoryData = useMemo(() => {
    const last30 = allTickets.filter((t) => isWithinLastDays(t.createdAtISO, 30));
    const totals = last30.reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] ?? 0) + 1;
      return acc;
    }, {});
    const total = last30.length || 1;
    const cats: Category[] = ['Computador', 'Rede', 'Impressora', 'Acesso/Senha', 'Telefone', 'Outro'];
    return cats
      .map((name) => ({
        name,
        count: totals[name] ?? 0,
        value: Math.round(((totals[name] ?? 0) / total) * 100),
        color: CATEGORY_COLOR[name],
      }))
      .filter((c) => c.count > 0);
  }, [allTickets]);

  // -------------------- Tendência semanal (últimos 7 dias) --------------------
  const weeklyData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result: Array<{ name: string; abertos: number; resolvidos: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const abertos = allTickets.filter((t) => {
        const ms = new Date(t.createdAtISO).getTime();
        return ms >= start && ms < end;
      }).length;
      const resolvidos = allTickets.filter((t) => {
        if (!t.resolvidoEmISO) return false;
        const ms = new Date(t.resolvidoEmISO).getTime();
        return ms >= start && ms < end;
      }).length;
      result.push({ name: dayNames[d.getDay()], abertos, resolvidos });
    }
    return result;
  }, [allTickets]);

  // -------------------- Relatório 30 dias --------------------
  const report30d = useMemo(() => {
    const last30 = allTickets.filter((t) => isWithinLastDays(t.createdAtISO, 30));
    const resolvidos30d = last30.filter((t) => t.resolvidoEmISO);
    // Tempo médio de resolução em horas
    const resolutionHours = resolvidos30d
      .map((t) => {
        const created = new Date(t.createdAtISO).getTime();
        const resolved = new Date(t.resolvidoEmISO!).getTime();
        return (resolved - created) / 3_600_000;
      })
      .filter((h) => h > 0);
    const avgHours =
      resolutionHours.length === 0
        ? 0
        : resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length;
    const taxaResolucao = last30.length === 0 ? 0 : Math.round((resolvidos30d.length / last30.length) * 100);
    const topCategoria =
      categoryData.length > 0 ? [...categoryData].sort((a, b) => b.count - a.count)[0] : null;
    return {
      total: last30.length,
      resolvidos: resolvidos30d.length,
      emAberto: last30.length - resolvidos30d.length,
      avgHours,
      taxaResolucao,
      topCategoria,
    };
  }, [allTickets, categoryData]);

  return (
    <div className="pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Painel Administrativo</h2>
          <p className="text-slate-500">Acompanhe os problemas actuais e métricas do Help Desk.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-white border-slate-200"
              placeholder="Buscar chamados..."
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Notificações" className="relative bg-white">
                <Bell className="w-4 h-4 text-slate-600" />
                {criticalTickets.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-semibold text-slate-900">Notificações</span>
                {criticalTickets.length > 0 && (
                  <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
                    {criticalTickets.length} crítico{criticalTickets.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {criticalTickets.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8 px-4">Sem notificações no momento.</p>
                ) : (
                  criticalTickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/admin/chamado/${t.id}`)}
                      className="w-full text-left flex gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0 h-fit">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Chamado crítico #{t.id}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.nome} ({t.departamento}) — {t.categoria}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{t.ultimaAtualizacao}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalTickets.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-rose-900">
                Atenção! {criticalTickets.length} chamado{criticalTickets.length === 1 ? '' : 's'} crítico{criticalTickets.length === 1 ? '' : 's'} em aberto
              </p>
              <p className="text-sm text-rose-700 mt-0.5">A equipa requer suporte imediato. Verifique a lista abaixo.</p>
            </div>
          </div>
          <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => navigate(`/admin/chamado/${criticalTickets[0].id}`)}>
            Atender Agora
          </Button>
        </div>
      )}

      {/* Tickets Table/Kanban */}
      <Card className="border-slate-200/60 shadow-sm border-t-4 border-t-brand">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-brand" /> Chamados Activos
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                Ao vivo
              </span>
            </CardTitle>
            <CardDescription>Veja imediatamente quem precisa de ajuda. Atualiza em tempo real.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <Button variant="ghost" size="sm" onClick={() => setViewMode('lista')} className={`${viewMode === 'lista' ? 'bg-white shadow-sm' : 'text-slate-500'} h-8 px-3`}>
                <List className="w-4 h-4 mr-2" /> Lista
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('kanban')} className={`${viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-slate-500'} h-8 px-3`}>
                <LayoutDashboard className="w-4 h-4 mr-2" /> Kanban
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">Sem chamados para os critérios actuais.</p>
          ) : viewMode === 'lista' ? (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Requisitante</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead className="text-right">Técnico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => navigate(`/admin/chamado/${t.id}`)}>
                      <TableCell className="font-medium text-slate-900">#{t.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{t.nome}</span>
                          <span className="text-xs text-slate-500">{t.departamento}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className={`${getPriorityStyle(t.prioridade).badge} border-0`}>{t.prioridade}</Badge></TableCell>
                      <TableCell><Badge className={`${getStatusStyle(t.status).badge} border-0`}>{t.status}</Badge></TableCell>
                      <TableCell><div className="flex items-center text-slate-500 text-sm"><Clock className="w-3.5 h-3.5 mr-1" />{t.tempo}</div></TableCell>
                      <TableCell className="text-right">{t.tecnico !== '-' ? <span className="text-sm font-medium text-slate-700">{t.tecnico}</span> : <span className="text-sm text-slate-400">Não atribuído</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {(['Aberto', 'Em andamento', 'Aguardando', 'Resolvido'] as Status[]).map((col) => {
                const colTickets = kanbanColumns[col];
                const label = col === 'Aberto' ? 'Novo' : col;
                return (
                  <div key={col} className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/60 min-h-[300px]">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="font-semibold text-slate-700 text-sm">{label}</span>
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200">{colTickets.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {colTickets.map((t) => (
                        <Card key={t.id} className="cursor-pointer hover:border-brand/40 hover:shadow-md transition-all shadow-sm" onClick={() => navigate(`/admin/chamado/${t.id}`)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-400">#{t.id}</span>
                              <Badge className={`${getPriorityStyle(t.prioridade).badge} text-[10px] px-1.5 py-0 border-0`}>{t.prioridade}</Badge>
                            </div>
                            <p className="font-medium text-sm text-slate-900 mb-3">{t.nome}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md"><Clock className="w-3 h-3 mr-1" />{t.tempo}</div>
                              {t.tecnicoAssigned && (
                                <span className="text-[10px] font-medium text-brand-dark bg-brand-soft px-2 py-0.5 rounded-full">
                                  {t.tecnico}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 mt-8 mb-2">
        <div className="h-px bg-slate-200 flex-1" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Métricas e Relatórios</h3>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${m.iconBg} ${m.iconText} inline-flex mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">{m.value}</h3>
                <p className="text-sm font-medium text-slate-700 mt-1">{m.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 30-Day Report */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-brand" /> Relatório dos Últimos 30 Dias
          </CardTitle>
          <CardDescription>Visão consolidada dos chamados nos últimos 30 dias.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-brand-soft/40 border border-brand/15">
              <p className="text-[11px] text-brand-dark uppercase tracking-wider font-semibold mb-1">Total aberto</p>
              <p className="text-2xl font-bold text-slate-900">{report30d.total}</p>
              <p className="text-xs text-slate-500 mt-1">Chamados criados</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <p className="text-[11px] text-emerald-700 uppercase tracking-wider font-semibold mb-1">Resolvidos</p>
              <p className="text-2xl font-bold text-slate-900">{report30d.resolvidos}</p>
              <p className="text-xs text-slate-500 mt-1">Taxa: {report30d.taxaResolucao}%</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <p className="text-[11px] text-amber-700 uppercase tracking-wider font-semibold mb-1">Tempo médio</p>
              <p className="text-2xl font-bold text-slate-900">{formatHours(report30d.avgHours)}</p>
              <p className="text-xs text-slate-500 mt-1">Para resolução</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Categoria top</p>
              <p className="text-lg font-bold text-slate-900 truncate">
                {report30d.topCategoria?.name ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {report30d.topCategoria ? `${report30d.topCategoria.count} chamados` : 'Sem dados'}
              </p>
            </div>
          </div>
          {report30d.total === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              Ainda não há chamados nos últimos 30 dias.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-400" /> Tendência Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gradAbertos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0D3B66" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0D3B66" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradResolvidos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="abertos" name="Abertos" stroke="#0D3B66" fill="url(#gradAbertos)" strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: '#0D3B66', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="resolvidos" name="Resolvidos" stroke="#10b981" fill="url(#gradResolvidos)" strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><PieChart className="w-5 h-5 text-slate-400" /> Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-slate-600">{c.name}</span>
                  </div>
                  <span className="font-medium text-slate-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recurrent Problems Report */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Monitor className="w-5 h-5 text-slate-400" /> Histórico — Problemas Mais Recorrentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recurrentProblems.map((p, i) => {
              const Icon = p.icon;
              const maxOcorrencias = recurrentProblems[0].ocorrencias;
              const pct = Math.round((p.ocorrencias / maxOcorrencias) * 100);
              return (
                <div key={p.problema} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 text-slate-400 font-medium text-xs shrink-0">
                    #{i + 1}
                  </div>
                  <div className="p-2 rounded bg-slate-100 text-slate-500 shrink-0"><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-700 text-sm">{p.problema}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={pct} className="h-1.5 flex-1 bg-slate-100" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <span className="text-base font-semibold text-slate-700 w-8">{p.ocorrencias}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProblemInfo(p)}
                      className="bg-white hover:bg-brand-soft hover:text-brand-dark border-slate-200"
                    >
                      <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
                      Ver Soluções
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Solutions Knowledge Base Dialog */}
      <Dialog open={!!selectedProblemInfo} onOpenChange={(open) => !open && setSelectedProblemInfo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedProblemInfo && (
            <>
              <DialogHeader className="p-6 border-b border-slate-100 flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-brand-soft rounded-xl text-brand-dark shrink-0">
                  <selectedProblemInfo.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-bold text-slate-900">{selectedProblemInfo.problema}</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 mt-1">
                    Base de Conhecimento • {selectedProblemInfo.ocorrencias} ocorrências recentes
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">
                  Cada entrada abaixo representa um chamado diferente deste tipo que foi resolvido.
                  A solução pode variar caso a caso.
                </p>

                {selectedProblemInfo.casos.map((caso, idx) => (
                  <div key={caso.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800 text-sm">Chamado #{caso.id}</span>
                        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">Resolvido em {caso.data}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand to-brand-dark flex items-center justify-center text-white text-[9px] font-bold">
                          {caso.tecnico.substring(0, 2)}
                        </div>
                        {caso.tecnico}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Solução Aplicada</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{caso.solucao}</p>
                      </div>
                      {caso.materiais !== 'Nenhum' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                          <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span><strong className="text-amber-700">Materiais:</strong> {caso.materiais}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
