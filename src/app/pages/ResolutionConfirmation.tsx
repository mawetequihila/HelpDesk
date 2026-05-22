import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, MessageSquare, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { confirmResolution, reopenTicket } from '../../lib/api';

export default function ResolutionConfirmation() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [resolved, setResolved] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (resolved === null || submitting) return;
    const idNum = Number(ticketId);
    if (!Number.isFinite(idNum)) return;
    setSubmitting(true);
    try {
      if (resolved) {
        await confirmResolution(idNum);
        navigate(`/avaliar/${ticketId}`);
      } else {
        await reopenTicket(idNum, feedback.trim());
        toast.success('Chamado reaberto. A equipa de TI foi notificada.');
        navigate('/meus-chamados');
      }
    } catch (err) {
      toast.error('Não foi possível concluir.', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <Card className="border-slate-200/60 shadow-xl overflow-hidden">
          {/* Dynamic top bar */}
          <motion.div
            className="h-1.5 w-full"
            animate={{
              background: resolved === true
                ? 'linear-gradient(to right, #10b981, #34d399)'
                : resolved === false
                ? 'linear-gradient(to right, #f43f5e, #fb7185)'
                : 'linear-gradient(to right, #3b82f6, #6366f1)',
            }}
            transition={{ duration: 0.4 }}
            style={{ background: 'linear-gradient(to right, #3b82f6, #6366f1)' }}
          />

          <CardContent className="pt-10 pb-8 px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{
                  backgroundColor: resolved === true ? '#d1fae5' : resolved === false ? '#ffe4e6' : '#eff6ff',
                }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-soft"
              >
                <MessageSquare className="w-8 h-8 text-brand-dark" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">O problema foi resolvido?</h2>
              <p className="text-slate-500 text-sm">
                Chamado <span className="font-semibold text-slate-700">#{ticketId}</span> · A equipe de TI marcou como resolvido
              </p>
            </div>

            {/* Choice buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* YES */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setResolved(true)}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                  resolved === true
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                }`}
              >
                <motion.div
                  animate={{ scale: resolved === true ? 1.1 : 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle2 className={`w-10 h-10 transition-colors duration-200 ${
                    resolved === true ? 'text-emerald-600' : 'text-slate-300'
                  }`} />
                </motion.div>
                <div>
                  <p className={`text-base font-semibold transition-colors ${resolved === true ? 'text-emerald-700' : 'text-slate-700'}`}>
                    Sim, resolvido!
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Fechar o chamado</p>
                </div>
              </motion.button>

              {/* NO */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setResolved(false)}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                  resolved === false
                    ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-500/10'
                    : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/30'
                }`}
              >
                <motion.div
                  animate={{ scale: resolved === false ? 1.1 : 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <XCircle className={`w-10 h-10 transition-colors duration-200 ${
                    resolved === false ? 'text-rose-600' : 'text-slate-300'
                  }`} />
                </motion.div>
                <div>
                  <p className={`text-base font-semibold transition-colors ${resolved === false ? 'text-rose-700' : 'text-slate-700'}`}>
                    Não, persiste
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Reabrir o chamado</p>
                </div>
              </motion.button>
            </div>

            {/* Negative feedback area */}
            <AnimatePresence>
              {resolved === false && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700">
                      O seu chamado será reaberto e a equipe de TI será notificada para uma nova análise.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>O que ainda está acontecendo?</Label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="bg-slate-50 border-slate-200 resize-none"
                      placeholder="Descreva o problema que persiste para ajudar a equipe..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Positive message */}
            <AnimatePresence>
              {resolved === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-700">
                      Que ótimo! Vamos agora recolher a sua avaliação sobre o atendimento recebido.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <AnimatePresence>
              {resolved !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || (resolved === false && !feedback.trim())}
                    className={`w-full h-12 text-base shadow-lg transition-all disabled:opacity-60 ${
                      resolved
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    }`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {resolved ? 'Continuar para avaliação' : 'Enviar e Reabrir Chamado'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
