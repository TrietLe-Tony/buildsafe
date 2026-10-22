import type { StageId } from '../types';

type P = { size?: number; className?: string };

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const IconCheck = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.6}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);

export const IconX = ({ size, className }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.6}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
);

export const IconLock = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    <path d="M12 14.5v2.5" />
  </svg>
);

export const IconUnlock = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 7.6-1.8" />
  </svg>
);

export const IconShield = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" />
  </svg>
);

export const IconCamera = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z" />
    <circle cx="12" cy="13.2" r="3.2" />
  </svg>
);

export const IconClock = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconReset = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4.5 4.5v3.8h3.8" />
  </svg>
);

export const IconBank = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3.5 9.5L12 4l8.5 5.5z" />
    <path d="M5.5 10v7M9.8 10v7M14.2 10v7M18.5 10v7M3.5 19.5h17" />
  </svg>
);

export const IconInfo = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.2" />
  </svg>
);

export const IconScale = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 4v16M7 20h10M5 7h14" />
    <path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z" />
  </svg>
);

export const IconNodes = ({ size, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="5" cy="17" r="2" />
    <circle cx="19" cy="17" r="2" />
    <circle cx="12" cy="12.5" r="2" />
    <path d="M12 7v3.5M10.4 13.6l-3.8 2.3M13.6 13.6l3.8 2.3" />
  </svg>
);

export const Logo = ({ size = 28 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--orange)" />
    <path d="M8 15.5L16 9l8 6.5V24H8z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="13" y="16.5" width="6" height="5" rx="1" fill="#fff" />
    <path d="M14.3 16.5v-1.3a1.7 1.7 0 0 1 3.4 0v1.3" fill="none" stroke="#fff" strokeWidth="1.6" />
  </svg>
);

/** Line icons per stage: the building going up. */
export function StageIcon({ id, size = 26 }: { id: StageId; size?: number }) {
  const s = base(size);
  switch (id) {
    case 'deposit':
      return (
        <svg {...s}>
          <path d="M6.5 3.5h8l3 3v14h-11z" />
          <path d="M14.5 3.5v3h3M9 11h6M9 14.5h6M9 18h3.5" />
        </svg>
      );
    case 'base':
      return (
        <svg {...s}>
          <path d="M2.5 15.5h19v4h-19z" />
          <path d="M6 15.5l2-2M10.5 15.5l2-2M15 15.5l2-2M19.5 15.5l2-2M4.5 13.5h17" />
        </svg>
      );
    case 'frame':
      return (
        <svg {...s}>
          <path d="M3 11l9-7 9 7M5 9.5V20M19 9.5V20M9 6.6V20M15 6.6V20M3 20h18M5 14.5h14" />
        </svg>
      );
    case 'lockup':
      return (
        <svg {...s}>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5.5h4V20" />
          <path d="M3 20h18" />
        </svg>
      );
    case 'fixing':
      return (
        <svg {...s}>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 9.5V20h14V9.5" />
          <rect x="7.5" y="11.5" width="4" height="3.5" />
          <path d="M13.5 20v-6h3.5v6M3 20h18" />
        </svg>
      );
    case 'completion':
      return (
        <svg {...s}>
          <path d="M2.5 11l7.5-6 7.5 6" />
          <path d="M4.5 9.5V20h11V9.5" />
          <path d="M8.5 20v-5h3v5" />
          <circle cx="19.5" cy="12" r="2.6" />
          <path d="M19.5 14.6V20M2 20h20" />
        </svg>
      );
  }
}
