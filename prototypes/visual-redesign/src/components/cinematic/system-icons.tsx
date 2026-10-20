import type { ReactElement } from 'react';

type IconProps = { size?: number };

const base = (size: number) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

function ProcessorIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </svg>
  );
}

function DisplayIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
    </svg>
  );
}

function MemoryIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="2.5" y="7" width="19" height="10" rx="1.5" />
      <path d="M6 11v3M10 11v3M14 11v3M18 11v3" />
    </svg>
  );
}

function StorageIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </svg>
  );
}

function CoolingIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8c0-4 1.6-6.3 3.4-6.3M12 14.2c0 4-1.6 6.3-3.4 6.3M14.2 12c4 0 6.3 1.6 6.3 3.4M9.8 12c-4 0-6.3-1.6-6.3-3.4" />
    </svg>
  );
}

function WirelessIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10 10 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0" />
      <circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AudioIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" />
      <path d="M16 9a4.5 4.5 0 0 1 0 6M18.8 6.4a8 8 0 0 1 0 11.2" />
    </svg>
  );
}

function SecurityIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3l7.5 3v6c0 4.6-3.1 8.4-7.5 9.8C7.6 20.4 4.5 16.6 4.5 12V6z" />
      <path d="M9.2 12.2l2 2 3.6-3.8" />
    </svg>
  );
}

/**
 * The eight system glyphs. They are internal: the map is the only public
 * surface, so the explorer can look a glyph up by system key.
 */
export const systemIcons: Record<string, (props: IconProps) => ReactElement> = {
  processor: ProcessorIcon,
  display: DisplayIcon,
  memory: MemoryIcon,
  storage: StorageIcon,
  cooling: CoolingIcon,
  wireless: WirelessIcon,
  audio: AudioIcon,
  security: SecurityIcon,
};
