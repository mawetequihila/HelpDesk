/**
 * Sistema de controlo por voz com wake word "helpdesk".
 *
 * Fluxo:
 *   1. Utilizador activa (1ª vez precisa de gesture para permissão do mic)
 *   2. Reconhecimento contínuo em PT-PT a ouvir por "helpdesk"
 *   3. Quando ouve "helpdesk" → entra em command mode (10s) + beep
 *   4. Comando executado (navigate, signOut, etc.) + toast
 *   5. Volta ao modo idle (à espera da wake word)
 *
 * Suporta também push-to-talk: chamar triggerCommandMode() salta a wake
 * word e entra directamente em command mode (usado pelo botão + tecla).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useRole } from './role';

// ---------- Tipos ----------

type VoiceMode = 'idle' | 'awaiting-command';

interface VoiceState {
  supported: boolean;
  enabled: boolean;
  listening: boolean;
  mode: VoiceMode;
  lastTranscript: string;
  error: string | null;
}

interface VoiceContextValue extends VoiceState {
  toggle: () => Promise<void>;
  triggerCommandMode: () => void;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

// ---------- Speech Recognition shim ----------

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  type W = typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const w = window as W;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ---------- Beep (Web Audio) ----------

let audioCtx: AudioContext | null = null;
function beep(freq: number, dur: number) {
  try {
    type W = typeof window & { webkitAudioContext?: typeof AudioContext };
    if (!audioCtx) {
      const Ctor = window.AudioContext ?? (window as W).webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  } catch {
    // ignore
  }
}

// ---------- Normalização ----------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const WAKE_WORDS = ['helpdesk', 'help desk', 'help-desk', 'elpdesk', 'hellp desk'];

function containsWakeWord(s: string): boolean {
  const n = normalize(s);
  return WAKE_WORDS.some((w) => n.includes(w));
}

function stripWakeWord(s: string): string {
  let n = normalize(s);
  for (const w of WAKE_WORDS) {
    n = n.replace(new RegExp(w, 'g'), ' ');
  }
  return n.replace(/\s+/g, ' ').trim();
}

// ---------- Provider ----------

const COMMAND_WINDOW_MS = 10_000;

interface VoiceProviderProps {
  children: ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
  const navigate = useNavigate();
  const { role, signOut } = useRole();
  const roleRef = useRef(role);
  roleRef.current = role;

  const [supported] = useState(() => getSpeechRecognition() !== null);
  const [enabled, setEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [mode, setMode] = useState<VoiceMode>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const enabledRef = useRef(false);
  const modeRef = useRef<VoiceMode>('idle');
  const commandTimerRef = useRef<number | null>(null);

  enabledRef.current = enabled;
  modeRef.current = mode;

  // -------- Command dispatcher --------

  const executeCommand = useCallback(
    (raw: string) => {
      const cmd = stripWakeWord(raw);
      if (!cmd) {
        toast.info('Diz o comando depois de "helpdesk".', {
          description: 'Ex.: "helpdesk abrir chamado", "helpdesk meus chamados", "helpdesk sair".',
        });
        return;
      }

      // Navegação funcionário
      if (/(abrir|novo|criar).*chamad/.test(cmd)) {
        if (roleRef.current === 'ti') {
          toast.info('Comando para funcionários — usa "painel" se és TI.');
          return;
        }
        navigate('/abrir-chamado');
        toast.success('A abrir formulário de chamado.');
        return;
      }
      if (/meus.*chamad|ver.*chamad|listar/.test(cmd)) {
        if (roleRef.current === 'ti') {
          navigate('/admin/dashboard');
        } else {
          navigate('/meus-chamados');
        }
        toast.success('A listar chamados.');
        return;
      }

      // Navegação TI
      if (/painel|dashboard|administrac|admin/.test(cmd)) {
        if (roleRef.current !== 'ti') {
          toast.error('Painel TI só para a equipa.');
          return;
        }
        navigate('/admin/dashboard');
        toast.success('A abrir painel TI.');
        return;
      }

      // Logout
      if (/sair|logout|terminar.*sessao|sign out/.test(cmd)) {
        signOut().then(() => navigate('/', { replace: true }));
        toast.info('A terminar sessão.');
        return;
      }

      // Voltar
      if (/voltar|anterior|back/.test(cmd)) {
        window.history.back();
        toast.info('A voltar.');
        return;
      }

      // Ajuda
      if (/ajuda|comand|help|o que/.test(cmd)) {
        toast.info('Comandos de voz disponíveis', {
          description:
            roleRef.current === 'ti'
              ? '"painel", "ver chamados", "voltar", "sair"'
              : '"abrir chamado", "meus chamados", "voltar", "sair"',
          duration: 8000,
        });
        return;
      }

      toast.error(`Não reconheci: "${cmd}"`, {
        description: 'Diz "helpdesk ajuda" para ver os comandos.',
      });
    },
    [navigate, signOut],
  );

  // -------- Recogniton lifecycle --------

  const clearCommandTimer = useCallback(() => {
    if (commandTimerRef.current !== null) {
      window.clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
  }, []);

  const enterCommandMode = useCallback(() => {
    setMode('awaiting-command');
    beep(880, 0.15);
    clearCommandTimer();
    commandTimerRef.current = window.setTimeout(() => {
      setMode('idle');
      toast.info('Tempo esgotado. Diz "helpdesk" outra vez.');
    }, COMMAND_WINDOW_MS);
  }, [clearCommandTimer]);

  const handleResult = useCallback(
    (transcript: string) => {
      setLastTranscript(transcript);

      // Se já estamos à espera de comando, qualquer fala é tratada como comando
      if (modeRef.current === 'awaiting-command') {
        clearCommandTimer();
        setMode('idle');
        executeCommand(transcript);
        return;
      }

      // Modo idle: só reagimos se ouvimos a wake word
      if (containsWakeWord(transcript)) {
        const tail = stripWakeWord(transcript);
        // Se a wake word + comando vieram juntos: executa já
        if (tail) {
          executeCommand(transcript);
          return;
        }
        enterCommandMode();
      }
    },
    [clearCommandTimer, enterCommandMode, executeCommand],
  );

  const stopRecognition = useCallback(() => {
    const r = recogRef.current;
    if (!r) return;
    try {
      r.abort();
    } catch {
      // ignore
    }
    recogRef.current = null;
    setListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    if (!supported) return;
    if (recogRef.current) return;
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    const recog = new Ctor();
    recog.lang = 'pt-PT';
    recog.continuous = true;
    recog.interimResults = false;

    recog.onstart = () => {
      setListening(true);
      setError(null);
    };
    recog.onend = () => {
      setListening(false);
      recogRef.current = null;
      // Auto-reinicia se ainda estamos enabled (continuous nem sempre persiste)
      if (enabledRef.current) {
        window.setTimeout(() => {
          if (enabledRef.current && !recogRef.current) {
            startRecognition();
          }
        }, 300);
      }
    };
    recog.onerror = (ev) => {
      const err = ev.error;
      console.warn('[voice] recognition error:', err);
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        setError('Permissão de microfone negada.');
        setEnabled(false);
        enabledRef.current = false;
        toast.error('Permissão de microfone negada.', {
          description: 'Activa o microfone nas definições do browser para usar voz.',
        });
      } else if (err === 'no-speech' || err === 'audio-capture' || err === 'aborted') {
        // recoverable — onend reinicia
      } else {
        setError(err);
      }
    };
    recog.onresult = (ev) => {
      const result = ev.results[ev.results.length - 1];
      if (!result || !result[0]) return;
      const transcript = result[0].transcript;
      if (transcript) handleResult(transcript);
    };

    try {
      recog.start();
      recogRef.current = recog;
    } catch (e) {
      console.warn('[voice] start failed:', e);
      recogRef.current = null;
    }
  }, [supported, handleResult]);

  // -------- API pública --------

  const toggle = useCallback(async () => {
    if (!supported) {
      toast.error('O teu browser não suporta voz.', {
        description: 'Usa Chrome ou Edge para activar comandos de voz.',
      });
      return;
    }
    if (enabledRef.current) {
      enabledRef.current = false;
      setEnabled(false);
      clearCommandTimer();
      setMode('idle');
      stopRecognition();
      toast.info('Comandos de voz desactivados.');
      return;
    }
    // Pede permissão de mic primeiro (resolve antes do start)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        // libertamos imediatamente — só queríamos a permissão
        stream.getTracks().forEach((t) => t.stop());
      });
    } catch {
      toast.error('Permissão de microfone negada.');
      return;
    }
    enabledRef.current = true;
    setEnabled(true);
    setError(null);
    startRecognition();
    toast.success('Comandos de voz activados.', {
      description: 'Diz "helpdesk" e depois o comando. Ex.: "helpdesk abrir chamado".',
      duration: 6000,
    });
  }, [supported, clearCommandTimer, stopRecognition, startRecognition]);

  const triggerCommandMode = useCallback(() => {
    if (!supported) {
      toast.error('O teu browser não suporta voz.');
      return;
    }
    if (!enabledRef.current) {
      void toggle();
      return;
    }
    if (modeRef.current === 'awaiting-command') {
      return; // já à espera
    }
    enterCommandMode();
  }, [supported, toggle, enterCommandMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCommandTimer();
      stopRecognition();
    };
  }, [clearCommandTimer, stopRecognition]);

  const value = useMemo<VoiceContextValue>(
    () => ({
      supported,
      enabled,
      listening,
      mode,
      lastTranscript,
      error,
      toggle,
      triggerCommandMode,
    }),
    [supported, enabled, listening, mode, lastTranscript, error, toggle, triggerCommandMode],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used inside <VoiceProvider>');
  return ctx;
}
