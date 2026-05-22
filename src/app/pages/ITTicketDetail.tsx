import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, User, Building, Mail, Phone, Clock, Send, CheckCircle2,
  ArrowUpRight, AlertTriangle, MessageSquare, StickyNote, Wrench,
  Package, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { useTicketById } from '../../lib/hooks';
import {
  addInternalNote,
  assumeTicket,
  changeStatus,
  closeTicket,
  escalateTicket,
  sendMessage,
} from '../../lib/api';
import { getPriorityStyle, getStatusStyle } from '../../lib/tickets';
import type { Status } from '../../lib/types';

const STATUS_OPTIONS: Status[] = ['Aberto', 'Em andamento', 'Aguardando', 'Resolvido'];

interface ResolutionForm {
  descricaoSolucao: string;
  materiaisUsados: string;
  causaRaiz: string;
  acaoPreventiva: string;
  tempoGasto: string;
}

export default function ITTicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const idNum = ticketId ? Number(ticketId) : NaN;
  const ticket = useTicketById(Number.isFinite(idNum) ? idNum : null);

  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [resolution, setResolution] = useState<ResolutionForm>({
    descricaoSolucao: '',
    materiaisUsados: '',
    causaRaiz: '',
    acaoPreventiva: '',
    tempoGasto: '',
  });

  if (!ticket) {
    return (
      <div className="pb-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Chamado não encontrado</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          O chamado #{ticketId} não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao painel
        </Button>
      </div>
    );
  }

  const status = ticket.status;
  const tecnicoAssigned = ticket.tecnico && ticket.tecnico !== '-';
  const messages = ticket.historico.filter((h) => h.tipo === 'message');
  const createdAt = ticket.historico[0]?.data ?? ticket.data;

  const wrap = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operação falhou.');
    } finally {
      setBusy(false);
    }
  };

  const handleAssumir = () => {
    if (tecnicoAssigned) {
      toast.info(`Já está atribuído a ${ticket.tecnico}.`);
      return;
    }
    wrap(async () => {
      await assumeTicket(ticket.id);
      toast.success('Chamado assumido.');
    });
  };

  const handleChangeStatus = (next: Status) => {
    if (next === status) return;
    wrap(async () => {
      await changeStatus(ticket.id, next);
      toast.success(`Estado alterado para "${next}".`);
    });
  };

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    wrap(async () => {
      await sendMessage(ticket.id, trimmed);
      setMessage('');
      toast.success('Mensagem enviada.');
    });
  };

  const handleSaveNote = () => {
    const trimmed = internalNote.trim();
    if (!trimmed) return;
    wrap(async () => {
      await addInternalNote(ticket.id, trimmed);
      setInternalNote('');
      toast.success('Nota interna guardada.');
    });
  };

  const handleEscalate = () => {
    const trimmed = escalateReason.trim();
    if (!trimmed) return;
    wrap(async () => {
      await escalateTicket(ticket.id, trimmed);
      setEscalateReason('');
      setShowEscalateModal(false);
      toast.success('Chamado escalado para o nível superior.');
    });
  };

  const handleEncerrar = () => {
    wrap(async () => {
      await closeTicket(ticket.id, {
        solucao: resolution.descricaoSolucao,
        materiaisUsados: resolution.materiaisUsados || undefined,
        causaRaiz: resolution.causaRaiz || undefined,
        acaoPreventiva: resolution.acaoPreventiva || undefined,
        tempoGasto: resolution.tempoGasto || undefined,
      });
      setShowCloseModal(false);
      toast.success('Chamado encerrado com sucesso!', {
        description: 'O relatório de resolução foi salvo no histórico.',
      });
      setTimeout(() => navigate('/admin/dashboard'), 600);
    });
  };

  return (
    <div className="pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">Chamado #{ticket.id}</h2>
            <Badge className={`${getPriorityStyle(ticket.prioridade).badge} border-0`}>{ticket.prioridade}</Badge>
            <Badge className={`${getStatusStyle(status).badge} border-0`}>{status}</Badge>
          </div>
          <p className="text-slate-500 text-sm">
            Aberto em {createdAt} · {ticket.categoria}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Info */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-brand" /> Informações do Funcionário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Nome', value: ticket.nome },
                  { icon: Building, label: 'Departamento', value: `${ticket.departamento || '—'} · ${ticket.andar}` },
                  { icon: Mail, label: 'Email', value: ticket.email ?? '—' },
                  { icon: Phone, label: 'Telefone', value: ticket.telefone ?? '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{item.label}</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem Summary */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-brand" /> Resumo do Problema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Área', value: ticket.categoria },
                  { label: 'Prioridade', value: ticket.prioridade },
                  { label: 'Impacto', value: ticket.impacto ?? '—' },
                  { label: 'Desde quando', value: ticket.desde ?? '—' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-brand-soft/60 rounded-xl border border-brand/15">
                    <p className="text-[11px] text-brand-dark uppercase tracking-wider font-medium mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
              {ticket.observacoes && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1">Observações do funcionário</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{ticket.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card className="border-slate-200/60 shadow-sm">
            <Tabs defaultValue="historico" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="bg-slate-100 w-full justify-start">
                  <TabsTrigger value="historico" className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Histórico</TabsTrigger>
                  <TabsTrigger value="mensagens" className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Mensagens</TabsTrigger>
                  <TabsTrigger value="notas" className="flex items-center gap-1.5"><StickyNote className="w-3.5 h-3.5" /> Notas Internas</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="historico" className="mt-0 space-y-4">
                  <div className="space-y-4 pl-2">
                    {ticket.historico.map((item, index) => (
                      <div key={index} className="relative pl-6">
                        {index < ticket.historico.length - 1 && (
                          <div className="absolute left-[3px] top-5 bottom-[-16px] w-0.5 bg-slate-200" />
                        )}
                        <div className={`absolute left-[-2px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          item.tipo === 'system' ? 'bg-slate-400' : item.tipo === 'message' ? 'bg-brand' : 'bg-emerald-500'
                        }`} />
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" /> {item.data}
                          </div>
                          <p className="font-medium text-slate-800 text-sm">{item.evento}</p>
                          <p className="text-xs text-slate-500">{item.autor}</p>
                          {item.mensagem && (
                            <div className="mt-2 bg-brand-soft/60 border border-brand/15 p-3 rounded-lg text-sm text-slate-700">{item.mensagem}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="mensagens" className="mt-0 space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 min-h-[150px] border border-slate-100 space-y-2">
                    {messages.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6">Nenhuma mensagem ainda</p>
                    ) : (
                      messages.map((m, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">{m.autor}</span>
                            <span className="text-[10px] text-slate-400">{m.data}</span>
                          </div>
                          <p className="text-sm text-slate-700">{m.mensagem}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite a sua mensagem..."
                      className="bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim() || busy} className="bg-brand-dark hover:bg-brand-darker shrink-0">
                      <Send className="w-4 h-4 mr-2" /> Enviar
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="notas" className="mt-0 space-y-3">
                  {ticket.notas.length > 0 && (
                    <div className="space-y-2">
                      {ticket.notas.map((n) => (
                        <div key={n.id} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-amber-700 font-semibold">{n.autor}</span>
                            <span className="text-[10px] text-amber-600">{n.data}</span>
                          </div>
                          <p className="text-sm text-slate-700">{n.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    rows={4}
                    className="bg-slate-50 border-slate-200"
                    placeholder="Notas internas (visível apenas para a equipa de TI)..."
                  />
                  <Button variant="outline" size="sm" onClick={handleSaveNote} disabled={!internalNote.trim() || busy}>
                    <StickyNote className="w-4 h-4 mr-2" /> Salvar Nota
                  </Button>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {ticket.prioridade === 'Crítica' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold text-rose-900 text-sm">Chamado Crítico</p>
                <p className="text-xs text-rose-700 mt-0.5">Requer atenção imediata. SLA reduzido.</p>
              </div>
            </div>
          )}

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Acções</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                onClick={handleAssumir}
                disabled={tecnicoAssigned || busy}
                className="w-full bg-brand-dark hover:bg-brand-darker disabled:opacity-60"
              >
                <User className="w-4 h-4 mr-2" /> {tecnicoAssigned ? `Atribuído a ${ticket.tecnico}` : 'Assumir Chamado'}
              </Button>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Alterar Estado</Label>
                <Select value={status} onValueChange={(v) => handleChangeStatus(v as Status)} disabled={busy}>
                  <SelectTrigger className="w-full border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full border-slate-200"
                onClick={() => setShowEscalateModal(true)}
                disabled={busy}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" /> Escalar Chamado
              </Button>
              <Separator className="my-1" />
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowCloseModal(true)}
                disabled={status === 'Resolvido' || status === 'Encerrado' || busy}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Encerrar Chamado
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Informações</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: 'Criado em', value: createdAt },
                { label: 'Última atualização', value: ticket.ultimaAtualizacao },
                { label: 'Técnico', value: tecnicoAssigned ? ticket.tecnico : 'Não atribuído', color: tecnicoAssigned ? 'text-slate-900' : 'text-slate-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-medium ${item.color ?? 'text-slate-900'}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Escalate Dialog */}
      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-amber-500" /> Escalar Chamado #{ticket.id}</DialogTitle>
            <DialogDescription>Indique o motivo para envio ao nível superior.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            rows={4}
            placeholder="Ex.: Requer especialista em redes para troubleshoot do switch core..."
            className="bg-slate-50"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)} disabled={busy}>Cancelar</Button>
            <Button onClick={handleEscalate} disabled={!escalateReason.trim() || busy}>Escalar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Ticket Dialog */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wrench className="w-5 h-5 text-emerald-600" /> Encerrar Chamado #{ticket.id}</DialogTitle>
            <DialogDescription>Documente a solução aplicada para futuras referências.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400" /> Solução Aplicada *</Label>
              <Textarea value={resolution.descricaoSolucao} onChange={(e) => setResolution({ ...resolution, descricaoSolucao: e.target.value })} rows={4} placeholder="Descreva detalhadamente o que foi feito para resolver o problema..." className="bg-slate-50" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /> Materiais / Peças Utilizados</Label>
              <Textarea value={resolution.materiaisUsados} onChange={(e) => setResolution({ ...resolution, materiaisUsados: e.target.value })} rows={2} placeholder="Ex.: Fonte de alimentação ATX 500W, Cabo HDMI, Toner HP 26A..." className="bg-slate-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Causa Raiz</Label>
                <Input value={resolution.causaRaiz} onChange={(e) => setResolution({ ...resolution, causaRaiz: e.target.value })} placeholder="Ex.: Fonte queimada" className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Tempo Gasto</Label>
                <Input value={resolution.tempoGasto} onChange={(e) => setResolution({ ...resolution, tempoGasto: e.target.value })} placeholder="Ex.: 45 minutos" className="bg-slate-50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Acção Preventiva Sugerida</Label>
              <Textarea value={resolution.acaoPreventiva} onChange={(e) => setResolution({ ...resolution, acaoPreventiva: e.target.value })} rows={2} placeholder="Sugestões para evitar que o problema se repita..." className="bg-slate-50" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseModal(false)} disabled={busy}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleEncerrar} disabled={!resolution.descricaoSolucao.trim() || busy}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar Encerramento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
