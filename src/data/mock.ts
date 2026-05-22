import { Key, Monitor, Network, Phone, Printer } from 'lucide-react';
import type { RecurrentProblem } from '../lib/types';

/**
 * Dados agregados estáticos usados pelos charts do dashboard.
 * Estes não vêm da base de dados ainda — virão de views/RPCs no Supabase
 * numa próxima fase (calculados a partir de tickets resolvidos).
 */

export const recurrentProblems: RecurrentProblem[] = [
  {
    problema: 'Computador não liga',
    categoria: 'Computador',
    ocorrencias: 18,
    icon: Monitor,
    casos: [
      {
        id: 14501,
        data: '15/05/2026',
        tecnico: 'João Silva',
        solucao: 'Fonte de alimentação ATX queimada. Substituída por Fonte 500W nova.',
        materiais: 'Fonte ATX 500W',
      },
      {
        id: 14488,
        data: '10/05/2026',
        tecnico: 'Maria Santos',
        solucao: 'Módulo de memória RAM estava mal encaixado. Reencaixe e limpeza dos contactos.',
        materiais: 'Álcool Isopropílico',
      },
      {
        id: 14462,
        data: '03/05/2026',
        tecnico: 'João Silva',
        solucao: 'Cabo de energia com defeito. Substituído por cabo novo.',
        materiais: 'Cabo de Força 10A',
      },
    ],
  },
  {
    problema: 'Internet lenta / a oscilar',
    categoria: 'Rede',
    ocorrencias: 14,
    icon: Network,
    casos: [
      {
        id: 14519,
        data: '17/05/2026',
        tecnico: 'Pedro Costa',
        solucao: 'Patch cord danificado entre mesa e parede. Substituído por cabo Cat6 novo.',
        materiais: 'Cabo Cat6 2m',
      },
      {
        id: 14503,
        data: '14/05/2026',
        tecnico: 'João Silva',
        solucao: 'Switch do andar em sobrecarga térmica. Reinicializado e ventilação limpa.',
        materiais: 'Nenhum',
      },
      {
        id: 14471,
        data: '05/05/2026',
        tecnico: 'Maria Santos',
        solucao: 'Driver da placa de rede desatualizado. Atualizado via gerenciador de dispositivos.',
        materiais: 'Nenhum',
      },
    ],
  },
  {
    problema: 'Reset de senha expirada',
    categoria: 'Acesso/Senha',
    ocorrencias: 12,
    icon: Key,
    casos: [
      {
        id: 14518,
        data: '17/05/2026',
        tecnico: 'Pedro Costa',
        solucao: 'Conta bloqueada por 5 tentativas erradas. Desbloqueio no Active Directory.',
        materiais: 'Nenhum',
      },
      {
        id: 14499,
        data: '13/05/2026',
        tecnico: 'João Silva',
        solucao: 'Senha expirada (90 dias). Reset manual e orientação sobre self-service.',
        materiais: 'Nenhum',
      },
    ],
  },
  {
    problema: 'Impressora sem toner/papel',
    categoria: 'Impressora',
    ocorrencias: 9,
    icon: Printer,
    casos: [
      {
        id: 14510,
        data: '16/05/2026',
        tecnico: 'Maria Santos',
        solucao: 'Cartucho de toner esgotado. Substituído por Toner HP 26A novo.',
        materiais: 'Toner HP 26A',
      },
      {
        id: 14480,
        data: '08/05/2026',
        tecnico: 'Maria Santos',
        solucao: 'Papel A4 esgotado e rolo tracionador sujo. Abastecido e rolo limpo.',
        materiais: 'Papel A4 (5 resmas)',
      },
    ],
  },
  {
    problema: 'Ramal sem tom de discagem',
    categoria: 'Telefone',
    ocorrencias: 5,
    icon: Phone,
    casos: [
      {
        id: 14492,
        data: '11/05/2026',
        tecnico: 'Pedro Costa',
        solucao: 'Aparelho IP perdeu registo no PABX após queda de energia. Reboot e reconfigurado.',
        materiais: 'Nenhum',
      },
    ],
  },
];

export const weeklyData = [
  { name: 'Seg', abertos: 12, resolvidos: 8, pendentes: 4 },
  { name: 'Ter', abertos: 19, resolvidos: 14, pendentes: 5 },
  { name: 'Qua', abertos: 15, resolvidos: 18, pendentes: 3 },
  { name: 'Qui', abertos: 22, resolvidos: 16, pendentes: 6 },
  { name: 'Sex', abertos: 18, resolvidos: 20, pendentes: 2 },
];

export const categoryData = [
  { name: 'Computador', value: 35, color: '#0D3B66' },
  { name: 'Rede', value: 25, color: '#0077B6' },
  { name: 'Impressora', value: 18, color: '#f59e0b' },
  { name: 'Acesso/Senha', value: 15, color: '#10b981' },
  { name: 'Telefone', value: 7, color: '#ef4444' },
];
