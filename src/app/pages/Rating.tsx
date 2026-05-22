import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { rateTicket } from '../../lib/api';

const ratingConfig = [
  { label: 'Muito insatisfeito', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', fill: 'fill-rose-400 text-rose-400' },
  { label: 'Insatisfeito',       color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', fill: 'fill-orange-400 text-orange-400' },
  { label: 'Neutro',             color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', fill: 'fill-amber-400 text-amber-400' },
  { label: 'Satisfeito',         color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200', fill: 'fill-teal-400 text-teal-400' },
  { label: 'Muito satisfeito',   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', fill: 'fill-emerald-500 text-emerald-500' },
];

export default function Rating() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeRating = hoveredRating || rating;
  const config = activeRating > 0 ? ratingConfig[activeRating - 1] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || submitting) return;
    const idNum = Number(ticketId);
    if (!Number.isFinite(idNum)) return;
    setSubmitting(true);
    try {
      await rateTicket(idNum, rating, comment.trim() || undefined);
      setSubmitted(true);
      setTimeout(() => navigate('/meus-chamados'), 2000);
    } catch (err) {
      toast.error('Não foi possível enviar a avaliação.', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          >
            <ThumbsUp className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900">Obrigado pelo feedback!</h2>
          <p className="text-slate-500">Sua avaliação nos ajuda a melhorar cada vez mais.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <Card className="border-slate-200/60 shadow-xl overflow-hidden">
          <motion.div
            className="h-1.5 w-full"
            animate={{ background: config ? `linear-gradient(to right, ${config.color.replace('text-','')}, ${config.color.replace('text-','')})` : 'linear-gradient(to right, #f59e0b, #f97316)' }}
            style={{ background: 'linear-gradient(to right, #f59e0b, #f97316)' }}
          />
          <CardContent className="pt-10 pb-8 px-8">
            <div className="text-center mb-8">
              <motion.div
                animate={{ backgroundColor: config ? config.bg.replace('bg-', '') : '#fffbeb' }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50"
              >
                <Star className="w-8 h-8 text-amber-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Como foi o atendimento?</h2>
              <p className="text-slate-500 text-sm">Chamado <span className="font-semibold text-slate-700">#{ticketId}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Stars */}
              <div className="flex justify-center gap-1 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= activeRating;
                  const starConfig = ratingConfig[star - 1];
                  return (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 rounded-full transition-all"
                    >
                      <Star
                        className={`w-12 h-12 transition-all duration-200 ${
                          isActive ? starConfig.fill : 'text-slate-200'
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>

              {/* Rating label */}
              <AnimatePresence mode="wait">
                {activeRating > 0 && config && (
                  <motion.div
                    key={activeRating}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`text-center py-2.5 px-4 rounded-xl border ${config.bg} ${config.border}`}
                  >
                    <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label>Deixe um comentário <span className="text-slate-400 font-normal">(opcional)</span></Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="bg-slate-50 border-slate-200 resize-none"
                  placeholder="Conte-nos sobre sua experiência..."
                />
              </div>

              <Button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full h-12 text-base bg-brand-dark hover:bg-brand-darker shadow-lg shadow-brand-dark/25 transition-all disabled:opacity-60"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'A enviar...' : 'Enviar Avaliação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
