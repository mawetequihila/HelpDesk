/**
 * Input com autocomplete sobre a lista de funcionários do GGPEN.
 *
 * - Mostra sugestões depois de 1+ caracter
 * - Match case/acento-insensitive em nome e email
 * - Keyboard: ↑/↓ navega, Enter selecciona, Escape fecha
 * - onSelectEmployee é chamado quando o utilizador escolhe uma sugestão
 *   (form usa isto para auto-preencher o email também)
 * - onChange continua a ser chamado a cada keystroke (caso o nome não
 *   esteja na lista, o utilizador pode escrever livremente)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from './ui/input';
import { searchEmployees, type Employee } from '../../data/employees';

interface Props {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  onSelectEmployee: (emp: Employee) => void;
  placeholder?: string;
  required?: boolean;
}

export function EmployeeAutocomplete({
  id,
  value,
  onChange,
  onSelectEmployee,
  placeholder,
  required,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => searchEmployees(value, 8), [value]);

  // Fecha quando clica fora
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = (emp: Employee) => {
    onSelectEmployee(emp);
    setIsOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || matches.length === 0) {
      if (e.key === 'ArrowDown' && value.length > 0) {
        setIsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      handleSelect(matches[highlight]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlight(-1);
    }
  };

  const showDropdown = isOpen && matches.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => {
          if (value.length > 0 && matches.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className="bg-slate-50 border-slate-200 h-11"
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={id ? `${id}-listbox` : undefined}
      />
      {showDropdown && (
        <div
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-y-auto"
        >
          {matches.map((emp, i) => {
            const initials =
              emp.nome
                .split(/[\s.]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? '')
                .join('') || '?';
            return (
              <button
                key={emp.email}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onClick={() => handleSelect(emp)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  i === highlight ? 'bg-brand-soft/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center text-[11px] font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">{emp.nome}</div>
                  <div className="text-xs text-slate-500 truncate">{emp.email}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
