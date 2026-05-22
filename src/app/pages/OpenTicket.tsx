import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Network,
  Printer,
  Key,
  Phone,
  HelpCircle,
  Building,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { createTicket } from '../../lib/api';
import type { Building as BuildingType, Category, Impact, Priority } from '../../lib/types';

interface OptionCardProps {
  groupId: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

function OptionCard({ groupId, selected, onClick, children, className = '' }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected
          ? 'border-brand-dark bg-brand-soft/60 shadow-md shadow-brand/10'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      } ${className}`}
    >
      {selected && (
        <motion.div
          layoutId={`selected-indicator-${groupId}`}
          className="absolute -right-2 -top-2 bg-brand-dark rounded-full p-0.5 shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </motion.div>
      )}
      {children}
    </button>
  );
}

interface FormState {
  nome: string;
  email: string;
  departamento: string;
  outroDepartamento: string;
  andar: BuildingType | '';
  urgencia: Priority | '';
  area: Category | '';
  outraArea: string;
  desde: string;
  outroDesdequando: string;
  impacto: Impact | '';
  observacoes: string;
}

const departamentos = ['DADG', 'DASG', 'DCIMTS', 'DDAE', 'DEM', 'DGIE', 'DOE(MCC)', 'Outro'];

const areas: { id: Category; icon: LucideIcon }[] = [
  { id: 'Computador', icon: Monitor },
  { id: 'Rede', icon: Network },
  { id: 'Impressora', icon: Printer },
  { id: 'Acesso/Senha', icon: Key },
  { id: 'Telefone', icon: Phone },
  { id: 'Outro', icon: HelpCircle },
];

const urgencias: { nivel: Priority; descricao: string; color: string }[] = [
  { nivel: 'Baixa', descricao: 'Não impede o trabalho', color: 'bg-emerald-100' },
  { nivel: 'Média', descricao: 'Dificulta mas continuo', color: 'bg-amber-100' },
  { nivel: 'Alta', descricao: 'Estou com dificuldade', color: 'bg-orange-100' },
  { nivel: 'Crítica', descricao: 'Não consigo trabalhar', color: 'bg-rose-100' },
];

const impactos: { id: Impact; desc: string; dot: string }[] = [
  { id: 'Só eu', desc: 'Afecta apenas o meu posto', dot: 'bg-emerald-400' },
  { id: 'Minha equipa', desc: 'Afecta outros colegas', dot: 'bg-amber-400' },
  { id: 'Todo o departamento', desc: 'Departamento inteiro parado', dot: 'bg-rose-400' },
];

const desdeOptions = ['Agora mesmo', 'Ontem', 'Esta semana', 'Outro'];

export default function OpenTicket() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    nome: '',
    email: '',
    departamento: '',
    outroDepartamento: '',
    andar: '',
    urgencia: '',
    area: '',
    outraArea: '',
    desde: '',
    outroDesdequando: '',
    impacto: '',
    observacoes: '',
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const isValid =
    formData.nome.trim() &&
    formData.email.trim() &&
    formData.departamento &&
    (formData.departamento !== 'Outro' || formData.outroDepartamento.trim()) &&
    formData.andar &&
    formData.urgencia &&
    formData.area &&
    (formData.area !== 'Outro' || formData.outraArea.trim()) &&
    formData.desde &&
    formData.impacto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const ticket = await createTicket({
        nome: formData.nome,
        email: formData.email,
        departamento: formData.departamento,
        outroDepartamento: formData.outroDepartamento,
        andar: formData.andar as BuildingType,
        urgencia: formData.urgencia as Priority,
        area: formData.area as Category,
        outraArea: formData.outraArea,
        desde: formData.desde,
        outroDesdequando: formData.outroDesdequando,
        impacto: formData.impacto as Impact,
        observacoes: formData.observacoes,
      });
      navigate(`/confirmacao/${ticket.id}`);
    } catch (err) {
      toast.error('Não foi possível abrir o chamado.', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Abrir Chamado</h2>
        <p className="text-slate-500">Reporte um problema para a equipa de TI rapidamente.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* User Info */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-dark" />
              Informações do Colaborador
            </CardTitle>
            <CardDescription>Ajude-nos a identificá-lo e à sua localização.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  required
                  placeholder="O seu nome completo"
                  value={formData.nome}
                  onChange={(e) => update('nome', e.target.value)}
                  className="bg-slate-50 border-slate-200 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="seu.email@empresa.com"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="bg-slate-50 border-slate-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Departamento</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {departamentos.map((dept) => (
                  <OptionCard
                    key={dept}
                    groupId="departamento"
                    selected={formData.departamento === dept}
                    onClick={() => update('departamento', dept)}
                    className="p-3 text-center font-medium text-sm"
                  >
                    {dept}
                  </OptionCard>
                ))}
              </div>
              <AnimatePresence>
                {formData.departamento === 'Outro' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                  >
                    <Input
                      required
                      placeholder="Qual é o seu departamento?"
                      value={formData.outroDepartamento}
                      onChange={(e) => update('outroDepartamento', e.target.value)}
                      className="bg-slate-50 border-slate-200 h-11"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Label>Localização</Label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <OptionCard
                  groupId="andar"
                  selected={formData.andar === 'MCC'}
                  onClick={() => update('andar', 'MCC')}
                  className="text-center py-6"
                >
                  <span className="text-lg font-semibold">MCC</span>
                </OptionCard>
                <OptionCard
                  groupId="andar"
                  selected={formData.andar === 'SEDE'}
                  onClick={() => update('andar', 'SEDE')}
                  className="text-center py-6"
                >
                  <span className="text-lg font-semibold">SEDE</span>
                </OptionCard>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgency */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Nível de Urgência
            </CardTitle>
            <CardDescription>Qual o impacto deste problema no seu trabalho agora?</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgencias.map((urg) => (
                <OptionCard
                  key={urg.nivel}
                  groupId="urgencia"
                  selected={formData.urgencia === urg.nivel}
                  onClick={() => update('urgencia', urg.nivel)}
                  className="flex items-center gap-4"
                >
                  <div className={`w-3 h-12 rounded-full ${urg.color}`} />
                  <div>
                    <div className="font-semibold text-slate-900">{urg.nivel}</div>
                    <div className="text-sm text-slate-500">{urg.descricao}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Problem Area */}
        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5 text-brand" />
              Área do Problema
            </CardTitle>
            <CardDescription>Seleccione a categoria que melhor descreve o problema.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {areas.map((area) => (
                <OptionCard
                  key={area.id}
                  groupId="area"
                  selected={formData.area === area.id}
                  onClick={() => update('area', area.id)}
                  className="flex flex-col items-center justify-center py-6 gap-3"
                >
                  <div className={`p-3 rounded-xl ${formData.area === area.id ? 'bg-brand/15 text-brand-dark' : 'bg-slate-100 text-slate-600'}`}>
                    <area.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{area.id}</span>
                </OptionCard>
              ))}
            </div>

            <AnimatePresence>
              {formData.area === 'Outro' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    required
                    placeholder="Descreva brevemente a área do problema"
                    value={formData.outraArea}
                    onChange={(e) => update('outraArea', e.target.value)}
                    className="bg-slate-50 border-slate-200 h-11"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Since When + Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-3">
                <Label>Desde quando?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {desdeOptions.map((opt) => (
                    <OptionCard
                      key={opt}
                      groupId="desde"
                      selected={formData.desde === opt}
                      onClick={() => update('desde', opt)}
                      className="text-center py-3 text-sm font-medium"
                    >
                      {opt}
                    </OptionCard>
                  ))}
                </div>
                <AnimatePresence>
                  {formData.desde === 'Outro' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Input
                        placeholder="Ex.: Há 3 dias, na semana passada..."
                        value={formData.outroDesdequando}
                        onChange={(e) => update('outroDesdequando', e.target.value)}
                        className="bg-slate-50 border-slate-200 h-11"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3">
                <Label>Impacto do Problema</Label>
                <div className="space-y-2">
                  {impactos.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      groupId="impacto"
                      selected={formData.impacto === opt.id}
                      onClick={() => update('impacto', opt.id)}
                      className="flex items-center gap-3 py-3 px-4 w-full"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{opt.id}</p>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Label htmlFor="observacoes">Descrição Detalhada <span className="text-slate-400 font-normal ml-1">(Opcional)</span></Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => update('observacoes', e.target.value)}
                rows={5}
                className="bg-slate-50 border-slate-200 resize-none"
                placeholder="Conte-nos com mais detalhes o que está a acontecer..."
              />
            </div>

            <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group block">
              <input type="file" multiple className="sr-only" />
              <div className="bg-brand-soft w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand/15 transition-colors">
                <UploadCloud className="w-6 h-6 text-brand-dark" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Clique para anexar ou arraste arquivos <span className="text-slate-400 font-normal ml-1">(Opcional)</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Screenshots ou documentos (máx. 10MB)
              </p>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || submitting}
            className="w-full md:w-auto h-12 px-8 text-base shadow-lg shadow-brand-dark/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'A abrir...' : 'Abrir Chamado'}
          </Button>
        </div>
      </form>
    </div>
  );
}
