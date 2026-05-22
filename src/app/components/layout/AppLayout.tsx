import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { PlusCircle, List, LayoutDashboard, Menu, UserCircle, Settings, LogOut, ChevronUp, Moon, Sun, Monitor as MonitorIcon } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useRole } from '../../../lib/role';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const funcionarioNav = [
    { name: 'Abrir Chamado', href: '/abrir-chamado', icon: PlusCircle },
    { name: 'Meus Chamados', href: '/meus-chamados', icon: List },
  ];
  const tiNav = [
    { name: 'Painel de TI', href: '/admin/dashboard', icon: LayoutDashboard },
  ];
  const navigation = role === 'ti' ? tiNav : funcionarioNav;

  const handleLogout = () => {
    setRole(null);
    navigate('/', { replace: true });
  };

  const SidebarContent = () => (
    <>
      <div className="mb-10 px-2 mt-4 md:mt-0">
        <Logo size="md" />
      </div>

      <nav className="space-y-1.5 flex-1">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-soft text-brand-dark shadow-sm shadow-brand-dark/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? 'text-brand-dark' : 'text-slate-400'
                }`}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Snippet with Dropdown */}
      <div className="pt-6 border-t border-slate-100 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-dark to-brand flex items-center justify-center text-white font-medium text-sm shadow-md shadow-brand/20">
                MQ
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Mawete Quihila</p>
                <p className="text-xs text-slate-500 truncate">mawete@empresa.com</p>
              </div>
              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="w-4 h-4 mr-2 text-slate-500" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2 text-slate-500" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                {mounted && theme === 'dark' ? (
                  <Moon className="w-4 h-4 mr-2 text-slate-500" />
                ) : mounted && theme === 'system' ? (
                  <MonitorIcon className="w-4 h-4 mr-2 text-slate-500" />
                ) : (
                  <Sun className="w-4 h-4 mr-2 text-slate-500" />
                )}
                Tema
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
                  <Sun className="w-4 h-4 mr-2" /> Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                  <Moon className="w-4 h-4 mr-2" /> Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
                  <MonitorIcon className="w-4 h-4 mr-2" /> Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 focus:text-rose-600">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-brand-page-bg flex flex-col md:flex-row">
      
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200/60 shrink-0 sticky top-0 z-20">
        <Logo size="sm" showTagline={false} />
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6 flex flex-col">
            <SheetHeader className="hidden">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/60 p-6 flex-col hidden md:flex shrink-0 shadow-sm z-10 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-5xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
