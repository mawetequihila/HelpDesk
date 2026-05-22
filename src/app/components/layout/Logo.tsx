interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  align?: 'start' | 'center';
  className?: string;
}

const sizeMap = {
  sm: { img: 'h-11', tagline: 'text-[10px] tracking-[0.18em]' },
  md: { img: 'h-16', tagline: 'text-[11px] tracking-[0.2em]' },
  lg: { img: 'h-24 md:h-28', tagline: 'text-xs tracking-[0.22em]' },
};

export function Logo({ size = 'md', showTagline = true, align = 'start', className = '' }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center' : 'items-start'} ${className}`}>
      <img
        src="/ggpen-logo.png"
        alt="GGPEN — Gabinete de Gestão do Programa Espacial Nacional"
        className={`${s.img} w-auto select-none`}
        draggable={false}
      />
      {showTagline && (
        <span className={`${s.tagline} mt-1.5 font-semibold uppercase text-slate-500`}>HelpDesk</span>
      )}
    </div>
  );
}
