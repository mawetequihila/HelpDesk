import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { AppLayout } from './components/layout/AppLayout';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { RequireRole, RoleProvider } from '../lib/role';

const OpenTicket = lazy(() => import('./pages/OpenTicket'));
const TicketConfirmation = lazy(() => import('./pages/TicketConfirmation'));
const TicketTracking = lazy(() => import('./pages/TicketTracking'));
const ResolutionConfirmation = lazy(() => import('./pages/ResolutionConfirmation'));
const Rating = lazy(() => import('./pages/Rating'));
const ITDashboard = lazy(() => import('./pages/ITDashboard'));
const ITTicketDetail = lazy(() => import('./pages/ITTicketDetail'));
const RoleSelector = lazy(() => import('./pages/RoleSelector'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" aria-label="A carregar" />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const routes = (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/" element={<RoleSelector />} />
      <Route
        path="/abrir-chamado"
        element={
          <RequireRole allow="funcionario">
            <OpenTicket />
          </RequireRole>
        }
      />
      <Route
        path="/confirmacao/:ticketId"
        element={
          <RequireRole allow="funcionario">
            <TicketConfirmation />
          </RequireRole>
        }
      />
      <Route
        path="/meus-chamados"
        element={
          <RequireRole allow="funcionario">
            <TicketTracking />
          </RequireRole>
        }
      />
      <Route
        path="/confirmar-resolucao/:ticketId"
        element={
          <RequireRole allow="funcionario">
            <ResolutionConfirmation />
          </RequireRole>
        }
      />
      <Route
        path="/avaliar/:ticketId"
        element={
          <RequireRole allow="funcionario">
            <Rating />
          </RequireRole>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RequireRole allow="ti">
            <ITDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin/chamado/:ticketId"
        element={
          <RequireRole allow="ti">
            <ITTicketDetail />
          </RequireRole>
        }
      />
    </Routes>
    </Suspense>
  );

  return isLanding ? routes : <AppLayout>{routes}</AppLayout>;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={300}>
        <RoleProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RoleProvider>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </ThemeProvider>
  );
}
