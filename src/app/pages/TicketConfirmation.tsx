import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, Home, Clock, Wrench, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useTicketById } from '../../lib/hooks';
import type { Status } from '../../lib/types';

type StepState = 'done' | 'current' | 'upcoming';

interface Step {
  label: string;
  icon: typeof CheckCircle;
}

const STEPS: Step[] = [
  { label: 'Chamado Aberto', icon: CheckCircle },
  { label: 'Em Atendimento', icon: Wrench },
  { label: 'Resolvido', icon: Star },
];

function stepStatesFor(status: Status | undefined): { states: StepState[]; progressPct: number } {
  switch (status) {
    case 'Em andamento':
    case 'Aguardando':
      return { states: ['done', 'current', 'upcoming'], progressPct: 50 };
    case 'Resolvido':
      return { states: ['done', 'done', 'current'], progressPct: 84 };
    case 'Encerrado':
      return { states: ['done', 'done', 'done'], progressPct: 100 };
    case 'Aberto':
    default:
      return { states: ['done', 'upcoming', 'upcoming'], progressPct: 16 };
  }
}

export default function TicketConfirmation() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const idNum = ticketId ? Number(ticketId) : undefined;
  const ticket = useTicketById(idNum);

  const { states, progressPct } = useMemo(() => stepStatesFor(ticket?.status), [ticket?.status]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/60 shadow-xl text-center overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1.5 w-full" />

          <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="relative mb-6"
            >
              <div className="bg-emerald-100 p-5 rounded-full">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md"
              >
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Chamado Aberto!</h2>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                A sua solicitação foi registada e encaminhada.<br />A equipa de TI foi notificada.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl w-full py-5 mb-6"
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Número do Chamado</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">#{ticketId}</p>
              {ticket && (
                <p className="mt-2 text-xs text-slate-500">
                  Estado actual: <strong className="text-slate-700">{ticket.status}</strong>
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full mb-8"
            >
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
                <motion.div
                  className="absolute top-4 left-0 h-0.5 bg-emerald-400 -z-0"
                  initial={false}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />

                {STEPS.map((step, i) => {
                  const state = states[i];
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        state === 'done'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : state === 'current'
                          ? 'bg-white border-brand/60 text-brand'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] font-medium text-center max-w-[70px] leading-tight ${
                        state === 'done' ? 'text-emerald-600' : state === 'current' ? 'text-brand' : 'text-slate-400'
                      }`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 text-sm text-slate-500 bg-brand-soft border border-brand/15 rounded-xl px-4 py-3 w-full mb-8"
            >
              <Clock className="w-4 h-4 text-brand shrink-0" />
              <span>Tempo estimado de resposta: <strong className="text-brand-dark">até 2 horas</strong></span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="space-y-3 w-full"
            >
              {ticket?.status === 'Resolvido' && (
                <Button
                  onClick={() => navigate(`/confirmar-resolucao/${ticketId}`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-md shadow-emerald-600/25"
                >
                  Confirmar Resolução
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button
                onClick={() => navigate('/meus-chamados')}
                className="w-full bg-brand-dark hover:bg-brand-darker text-white h-12 shadow-md shadow-brand-dark/25"
              >
                Acompanhar Chamado
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/abrir-chamado')}
                className="w-full border-slate-200 text-slate-600 h-12"
              >
                <Home className="w-4 h-4 mr-2" />
                Abrir Outro Chamado
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
