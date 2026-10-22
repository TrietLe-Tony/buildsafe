import type { StageId } from '../types';

const SKIES = [
  ['#BFD5E6', '#EDE6D8'],
  ['#E9C9A8', '#F1E6D6'],
  ['#C9D3DB', '#E8E4DC'],
];

const CAPTIONS: Record<StageId, string[]> = {
  deposit: ['Signed contract', 'Site survey', 'Soil report'],
  base: ['Slab, north side', 'Termite barrier', 'Footings set out'],
  frame: ['Frame, street view', 'Roof trusses', 'Bracing detail'],
  lockup: ['Lock-up, street view', 'Roof and gutters', 'Front door fitted'],
  fixing: ['Kitchen cabinets', 'Plaster and cornice', 'Bathroom waterproofing'],
  completion: ['Finished front', 'Living room', 'Handover keys'],
};

export const photoCaption = (stage: StageId, i: number) => CAPTIONS[stage][i % 3];

/** Placeholder "site photo": a small SVG scene per stage, three variants each. No external images. */
export function SitePhoto({ stage, variant, className }: { stage: StageId; variant: number; className?: string }) {
  const [skyTop, skyBottom] = SKIES[variant % 3];
  const gid = `sky-${stage}-${variant}`;
  const shift = (variant % 3) * 10 - 10;
  return (
    <svg viewBox="0 0 120 80" className={className} role="img" aria-label={photoCaption(stage, variant)}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill={`url(#${gid})`} />
      <rect y="58" width="120" height="22" fill="#B9A585" />
      <rect y="58" width="120" height="3" fill="#A48F6E" />
      <g transform={`translate(${shift} 0)`}>{scene(stage, variant)}</g>
    </svg>
  );
}

function scene(stage: StageId, v: number) {
  switch (stage) {
    case 'deposit':
      return (
        <g>
          <rect x="38" y="16" width="44" height="54" rx="2" fill="#FBFAF7" stroke="#14213D" strokeOpacity=".3" />
          {[26, 33, 40, 47].map((y) => (
            <rect key={y} x="45" y={y} width={y === 47 ? 18 : 30} height="3" fill="#14213D" opacity=".25" />
          ))}
          <path d="M46 60c4-5 7 3 11-2s6 1 10-1" stroke="#14213D" strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'base':
      return (
        <g>
          <path d="M14 60 L30 50 H104 L92 60 Z" fill="#9EA3A6" />
          <path d="M14 60 H92 V64 H14 Z" fill="#7F8487" />
          {v === 1 && <path d="M30 50 H104" stroke="#2F7D5B" strokeWidth="2" />}
          {v === 2 && [36, 52, 68, 84].map((x) => <rect key={x} x={x} y="56" width="3" height="10" fill="#6B5A43" />)}
          <path d="M40 54 h40" stroke="#B5B9BC" strokeDasharray="3 3" />
        </g>
      );
    case 'frame':
      return (
        <g stroke="#C08A4E" strokeWidth="2.2" fill="none">
          <path d="M24 58 V36 M42 58 V36 M60 58 V36 M78 58 V36 M96 58 V36 M24 36 H96 M24 47 H96" />
          <path d="M20 37 L60 16 L100 37 M40 26.5 V36 M60 16 V36 M80 26.5 V36" />
        </g>
      );
    case 'lockup':
      return (
        <g>
          <rect x="24" y="34" width="72" height="26" fill="#B5654A" />
          <path d="M18 36 L60 14 L102 36 Z" fill="#3E4A5C" />
          <rect x="54" y="42" width="12" height="18" fill="#14213D" />
          <rect x="32" y="40" width="14" height="10" fill="#DCE6EC" />
          <rect x="74" y="40" width="14" height="10" fill="#DCE6EC" />
        </g>
      );
    case 'fixing':
      return (
        <g>
          <rect x="0" y="0" width="120" height="60" fill="#E9E4DA" />
          <rect x="10" y="30" width="62" height="28" fill="#F7F4EE" stroke="#C9C1B2" />
          <path d="M10 40 H72 M30 30 V58 M51 30 V58" stroke="#C9C1B2" />
          <rect x="10" y="8" width="62" height="16" fill="#F7F4EE" stroke="#C9C1B2" />
          <rect x="82" y="10" width="26" height="48" fill="#D7CFC1" stroke="#B9AF9E" />
          <circle cx="104" cy="35" r="1.5" fill="#14213D" />
        </g>
      );
    case 'completion':
      return (
        <g>
          <rect x="24" y="34" width="72" height="26" fill="#EDE8DF" />
          <path d="M18 36 L60 14 L102 36 Z" fill="#3E4A5C" />
          <rect x="54" y="42" width="12" height="18" fill="#F26B1D" />
          <rect x="32" y="40" width="14" height="10" fill="#F6E8B8" />
          <rect x="74" y="40" width="14" height="10" fill="#F6E8B8" />
          <circle cx="110" cy="44" r="9" fill="#5C8F6E" />
          <rect x="109" y="50" width="2" height="10" fill="#6B5A43" />
          <path d="M56 60 L50 80 H70 L64 60Z" fill="#CFC6B6" />
        </g>
      );
  }
}
