/**
 * Botão flutuante de controlo por voz.
 *
 * - Click no botão: liga/desliga reconhecimento contínuo.
 * - Quando ligado, ouve continuamente pela wake word "helpdesk".
 * - Atalho: segurar a barra de Espaço durante 300ms+ entra em command
 *   mode (push-to-talk) sem precisar de dizer "helpdesk" primeiro.
 *   Soltar Espaço termina o turno. (Tecla ignorada se foco estiver
 *   num input/textarea/contenteditable.)
 */
import { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoice } from '../../lib/voice';

const HOLD_MS = 300;

function isTextInputTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el.isContentEditable;
}

export function VoiceControl() {
  const { supported, enabled, listening, mode, toggle, triggerCommandMode } = useVoice();

  // Push-to-talk: segurar Space dispara command mode (se já está enabled).
  useEffect(() => {
    let holdTimer: number | null = null;
    let didTrigger = false;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (e.repeat) return;
      if (isTextInputTarget(e.target)) return;
      if (!supported) return;
      // Evita scroll
      e.preventDefault();
      if (holdTimer !== null) return;
      didTrigger = false;
      holdTimer = window.setTimeout(() => {
        didTrigger = true;
        triggerCommandMode();
      }, HOLD_MS);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
        if (!didTrigger) {
          // Tap curto — ignora (não interferir com scroll/links)
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (holdTimer !== null) window.clearTimeout(holdTimer);
    };
  }, [supported, triggerCommandMode]);

  if (!supported) return null;

  const isCommand = mode === 'awaiting-command';
  const isRunning = enabled && listening;

  // Cor e label conforme estado
  const stateClasses = isCommand
    ? 'bg-rose-600 ring-rose-300 shadow-rose-500/50'
    : isRunning
    ? 'bg-emerald-600 ring-emerald-300 shadow-emerald-500/40'
    : enabled
    ? 'bg-amber-500 ring-amber-300 shadow-amber-500/40'
    : 'bg-brand-dark ring-brand/30 shadow-brand/30';

  const tooltip = isCommand
    ? 'A ouvir comando... (fala agora)'
    : isRunning
    ? 'Ouvindo "helpdesk". Clica para desligar. Mantém Espaço para falar já.'
    : enabled
    ? 'A iniciar...'
    : 'Activar comandos de voz (segura Espaço para falar)';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {(isRunning || isCommand) && (
        <div className="pointer-events-auto bg-white shadow-lg rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 flex items-center gap-2 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <span className={`w-2 h-2 rounded-full ${isCommand ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
          {isCommand ? 'Fala agora...' : 'Diz "helpdesk"'}
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? 'Desactivar comandos de voz' : 'Activar comandos de voz'}
        title={tooltip}
        className={`pointer-events-auto w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-200 ring-4 ring-offset-2 ring-offset-transparent hover:scale-105 active:scale-95 ${stateClasses} ${isCommand ? 'animate-pulse' : ''}`}
      >
        {isCommand ? (
          <Mic className="w-6 h-6" />
        ) : isRunning ? (
          <Mic className="w-6 h-6" />
        ) : enabled ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
