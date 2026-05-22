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

export interface KbCase {
  id: number;
  data: string;
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
