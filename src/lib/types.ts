import type { LucideIcon } from 'lucide-react';

export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type Status = 'Aberto' | 'Em andamento' | 'Aguardando' | 'Resolvido' | 'Encerrado';

export type Category = 'Computador' | 'Rede' | 'Impressora' | 'Acesso/Senha' | 'Telefone' | 'Outro';

export type Building = 'MCC' | 'SEDE';

export type Impact = 'Só eu' | 'Minha equipa' | 'Todo o departamento';

export type Role = 'funcionario' | 'ti';

export interface HistoryEntry {
  data: string;
  evento: string;
  autor: string;
  mensagem?: string;
  tipo?: 'system' | 'action' | 'message';
}

export interface Ticket {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  departamento: string;
  andar: Building;
  categoria: Category;
  detalhes?: string;
  prioridade: Priority;
  status: Status;
  impacto?: Impact;
  desde?: string;
  observacoes?: string;
  data: string;
  tecnico: string;
  ultimaAtualizacao: string;
  tempo?: string;
  descricao?: string;
  historico: HistoryEntry[];
}

export interface KbCase {
  id: number;
  data: string;
  tecnico: string;
  solucao: string;
  materiais: string;
}

export interface RecurrentProblem {
  problema: string;
  categoria: Category;
  ocorrencias: number;
  icon: LucideIcon;
  casos: KbCase[];
}
