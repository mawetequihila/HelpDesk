import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';
import type { Priority, Status } from './types';

export const PRIORITY_STYLES: Record<Priority, { badge: string; text: string; bg: string; dot: string }> = {
  Baixa: {
    badge: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-400',
  },
  Média: {
    badge: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
  },
  Alta: {
    badge: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    dot: 'bg-orange-400',
  },
  Crítica: {
    badge: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    dot: 'bg-rose-400',
  },
};

export const STATUS_STYLES: Record<Status, { badge: string; icon: LucideIcon }> = {
  Aberto: { badge: 'bg-brand/15 text-brand-dark hover:bg-brand/15', icon: AlertTriangle },
  'Em andamento': { badge: 'bg-amber-100 text-amber-700 hover:bg-amber-100', icon: Hourglass },
  Aguardando: { badge: 'bg-orange-100 text-orange-700 hover:bg-orange-100', icon: AlertCircle },
  Resolvido: { badge: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100', icon: CheckCircle2 },
  Encerrado: { badge: 'bg-slate-100 text-slate-700 hover:bg-slate-100', icon: CheckCircle2 },
};

export function getPriorityStyle(priority: Priority) {
  return PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Baixa;
}

export function getStatusStyle(status: Status) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.Aberto;
}
