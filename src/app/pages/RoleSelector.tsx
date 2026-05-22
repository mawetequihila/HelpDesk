import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { User, LayoutDashboard, ArrowRight, Headphones, Shield } from 'lucide-react';
import { useRole } from '../../lib/role';
import type { Role } from '../../lib/types';
import { Logo } from '../components/layout/Logo';

const roles = [
  {
    id: 'funcionario' as Role,
    href: '/abrir-chamado',
    icon: User,
    accentIcon: Headphones,
    title: 'Sou Funcionário',
    description: 'Abrir um novo chamado ou acompanhar as minhas solicitações de suporte.',
    color: 'blue',
    gradient: 'from-brand to-brand-dark',
    border: 'border-brand/20 hover:border-brand/60',
    bg: 'hover:bg-brand-soft/40',
    iconBg: 'bg-brand/15',
    iconColor: 'text-brand-dark',
    badgeBg: 'bg-brand/15',
    badgeText: 'text-brand-dark',
    badge: 'Colaborador',
  },
  {
    id: 'ti' as Role,
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    accentIcon: Shield,
    title: 'Sou da Equipa de TI',
    description: 'Gerir e resolver os chamados activos, acompanhar métricas e relatórios.',
    color: 'indigo',
    gradient: 'from-brand to-brand-dark',
    border: 'border-brand/20 hover:border-brand/60',
    bg: 'hover:bg-brand-soft/60',
    iconBg: 'bg-brand/15',
    iconColor: 'text-brand',
    badgeBg: 'bg-brand/15',
    badgeText: 'text-brand-dark',
    badge: 'Administrador',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function RoleSelector() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleSelect = (role: Role, href: string) => {
    setRole(role);
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-soft/30 to-brand-soft/60 flex flex-col items-center justify-center p-6">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-soft/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-soft/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo & Title */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
            className="mb-6"
          >
            <Logo size="lg" align="center" showTagline />
          </motion.div>
          <p className="text-slate-500 text-lg mt-2">
            Seleccione o seu perfil para continuar
          </p>
        </motion.div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            const AccentIcon = role.accentIcon;
            return (
              <motion.button
                key={role.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(role.id, role.href)}
                className={`
                  relative group text-left p-7 rounded-2xl border-2 bg-white 
                  transition-all duration-300 shadow-sm hover:shadow-xl 
                  ${role.border} ${role.bg}
                `}
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`} />

                {/* Badge */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-5 ${role.badgeBg} ${role.badgeText}`}>
                  <AccentIcon className="w-3 h-3" />
                  {role.badge}
                </span>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${role.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className={`w-6 h-6 ${role.iconColor}`} />
                </div>

                {/* Content */}
                <h2 className="text-xl font-bold text-slate-900 mb-2">{role.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{role.description}</p>

                {/* CTA */}
                <div className={`flex items-center gap-2 text-sm font-semibold ${role.iconColor} group-hover:gap-3 transition-all`}>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center text-xs text-slate-400 mt-10">
          Gabinete de Gestão do Programa Espacial Nacional · Sistema Interno de Gestão de Suporte
        </motion.p>
      </motion.div>
    </div>
  );
}
