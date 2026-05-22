import { Key, Monitor, Network, Phone, Printer } from 'lucide-react';
import type { RecurrentProblem } from '../lib/types';

/**
 * Base de conhecimento estática (problemas recorrentes + soluções aplicadas).
 * Será substituída por uma view/RPC no Supabase numa fase futura.
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
        solucao: 'Fonte de alimentação ATX queimada. Substituída por Fonte 500W nova.',
        materiais: 'Fonte ATX 500W',
      },
      {
        id: 14488,
        data: '10/05/2026',
        solucao: 'Módulo de memória RAM estava mal encaixado. Reencaixe e limpeza dos contactos.',
        materiais: 'Álcool Isopropílico',
      },
      {
        id: 14462,
        data: '03/05/2026',
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
        solucao: 'Patch cord danificado entre mesa e parede. Substituído por cabo Cat6 novo.',
        materiais: 'Cabo Cat6 2m',
      },
      {
        id: 14503,
        data: '14/05/2026',
        solucao: 'Switch do andar em sobrecarga térmica. Reinicializado e ventilação limpa.',
        materiais: 'Nenhum',
      },
      {
        id: 14471,
        data: '05/05/2026',
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
        solucao: 'Conta bloqueada por 5 tentativas erradas. Desbloqueio no Active Directory.',
        materiais: 'Nenhum',
      },
      {
        id: 14499,
        data: '13/05/2026',
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
        solucao: 'Cartucho de toner esgotado. Substituído por Toner HP 26A novo.',
        materiais: 'Toner HP 26A',
      },
      {
        id: 14480,
        data: '08/05/2026',
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
        solucao: 'Aparelho IP perdeu registo no PABX após queda de energia. Reboot e reconfigurado.',
        materiais: 'Nenhum',
      },
    ],
  },
];
