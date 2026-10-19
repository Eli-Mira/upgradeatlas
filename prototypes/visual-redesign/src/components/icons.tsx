type IconProps = { size?: number; className?: string };

const base = (size: number, className: string) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true,
});

export function Menu({ size = 18, className = 'lucide lucide-menu' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function Search({ size = 17, className = 'lucide lucide-search' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function RotateCcw({ size = 14, className = 'lucide lucide-rotate-ccw' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14, className = 'lucide lucide-arrow-up-right' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function ArrowRight({ size = 14, className = 'lucide lucide-arrow-right' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function ArrowDown({ size = 14, className = 'lucide lucide-arrow-down' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function Check({ size = 14, className = 'lucide lucide-check' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Plus({ size = 14, className = 'lucide lucide-plus' }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
