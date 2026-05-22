import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Clock,
  User,
  ChevronRight,
  X,
  ArrowLeft,
  CheckCircle2,
  Inbox,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useTickets, useTicketById, useSessionUser } from '../../lib/hooks';
import { getPriorityStyle, getStatusStyle } from '../../lib/tickets';

export default function TicketTracking() {
  const navigate = useNavigate();
  const user = useSessionUser();
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = useTickets({
    ownedByEmail: user?.email,
    search: searchQuery,
  });
  const selectedTicketData = useTicketById(selectedTicket);

  return (
    <div className="pb-12 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Meus Chamados</h2>
          <p className="text-slate-500">Acompanhe o estado das suas solicitações activas e finalizadas.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, categoria, técnico..."
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-6 relative min-h-[600px]">
        {/* Ticket List */}
        <div className={`flex-1 space-y-4 transition-all duration-300 ${selectedTicket ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700">Sem resultados</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery ? 'Tente outro termo de busca.' : 'Ainda não há chamados para acompanhar.'}
              </p>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="mt-3">
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const statusStyle = getStatusStyle(ticket.status);
              const priorityStyle = getPriorityStyle(ticket.prioridade);
              const StatusIcon = statusStyle.icon;
              const isSelected = selectedTicket === ticket.id;

              return (
                <Card
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`cursor-pointer transition-all duration-200 border-2 overflow-hidden ${
                    isSelected
                      ? 'border-brand shadow-md shadow-brand/10 bg-brand-soft/40'
                      : 'border-slate-200 hover:border-brand/40 hover:shadow-sm bg-white'
                  }`}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <span className="text-lg font-bold text-slate-900">#{ticket.id}</span>
                        <Badge className={`${statusStyle.badge} border-0 flex items-center gap-1.5 px-2.5 py-0.5`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {ticket.status}
                        </Badge>
                        <Badge variant="outline" className={`${priorityStyle.text} ${priorityStyle.bg} border-0 font-medium`}>
                          {ticket.prioridade}
                        </Badge>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-brand' : ''}`} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Categoria</p>
                        <p className="text-sm font-semibold text-slate-800">{ticket.categoria}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Data</p>
                        <p className="text-sm font-semibold text-slate-800">{ticket.data}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Técnico</p>
                        <p className="text-sm font-semibold text-slate-800">{ticket.tecnico}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Atualização</p>
                        <p className="text-sm font-semibold text-slate-800 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {ticket.ultimaAtualizacao}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Selected Ticket Details Panel */}
        <AnimatePresence mode="wait">
          {selectedTicket && selectedTicketData && (
            <motion.div
              key="detail-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="lg:w-1/2 flex-shrink-0 w-full lg:sticky lg:top-0 h-fit"
            >
              <Card className="border-slate-200/60 shadow-lg overflow-hidden bg-white">
                <div className="bg-slate-50 border-b border-slate-100 p-4 md:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="lg:hidden h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200 shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-1.5 md:gap-2">
                      Detalhes <span className="hidden sm:inline">do Chamado</span> <span className="text-brand-dark">#{selectedTicket}</span>
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="hidden lg:flex h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Info Blocks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Estado Actual</p>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusStyle(selectedTicketData.status).badge} border-0`}>
                          {selectedTicketData.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Prioridade</p>
                      <span className={`font-semibold ${getPriorityStyle(selectedTicketData.prioridade).text}`}>
                        {selectedTicketData.prioridade}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      Descrição do Problema
                    </h4>
                    <p className="text-slate-700 bg-white border border-slate-200 p-4 rounded-xl leading-relaxed">
                      {selectedTicketData.descricao}
                    </p>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* History Timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Linha do Tempo
                    </h4>
                    <div className="space-y-6 pl-2">
                      {selectedTicketData.historico.map((item, index) => (
                        <div key={index} className="relative pl-6">
                          {index < selectedTicketData.historico.length - 1 && (
                            <div className="absolute left-[3px] top-5 bottom-[-24px] w-0.5 bg-slate-200" />
                          )}
                          <div className="absolute left-[-2px] top-1 w-3 h-3 rounded-full border-2 border-white bg-brand-soft0 shadow-sm shadow-brand/20" />

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {item.data}
                            </div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {item.evento}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mt-0.5">
                              <User className="w-3 h-3 text-slate-400" />
                              {item.autor}
                            </div>

                            {item.mensagem && (
                              <div className="mt-3 bg-brand-soft/60 border border-brand/15 p-3 rounded-lg text-sm text-slate-700 relative">
                                <div className="absolute -top-1.5 left-4 w-3 h-3 bg-brand-soft/60 border-l border-t border-brand/15 transform rotate-45" />
                                {item.mensagem}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedTicketData.status === 'Resolvido' && (
                    <div className="pt-4">
                      <Button
                        onClick={() => navigate(`/confirmar-resolucao/${selectedTicketData.id}`)}
                        className="w-full bg-brand-dark hover:bg-brand-darker text-white h-12 text-base shadow-lg shadow-brand-dark/25"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Confirmar Resolução do Problema
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
