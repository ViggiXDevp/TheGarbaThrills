import type { ReactElement } from 'react';

export const STICKER_IDS = [
  'heart',
  'dandiya',
  'diya',
  'mandala',
  'dancing-couple',
  'sparkle',
  'flower',
  'music-note',
  'fire',
  'clap',
  'laugh',
  'thumbs-up',
  'blush',
  'star-eyes',
] as const;

export type StickerId = (typeof STICKER_IDS)[number];

const badgeGradients: Record<string, [string, string]> = {
  heart: ['#e6499f', '#8f0f3d'],
  dandiya: ['#d4a017', '#b8134f'],
  diya: ['#f0c869', '#d4a017'],
  mandala: ['#d4a017', '#5c1533'],
  'dancing-couple': ['#b8134f', '#5c1533'],
  sparkle: ['#f0c869', '#e6499f'],
  flower: ['#e6499f', '#d4a017'],
  'music-note': ['#5c1533', '#b8134f'],
  fire: ['#f0a04b', '#b8134f'],
  clap: ['#d4a017', '#8f0f3d'],
  laugh: ['#f0c869', '#b8134f'],
  'thumbs-up': ['#e6499f', '#d4a017'],
  blush: ['#f4a6c6', '#b8134f'],
  'star-eyes': ['#d4a017', '#e6499f'],
};

const icons: Record<StickerId, ReactElement> = {
  heart: (
    <path
      d="M32 50 C 12 36, 6 22, 14 13 C 20 6, 30 9, 32 18 C 34 9, 44 6, 50 13 C 58 22, 52 36, 32 50 Z"
      fill="#fff"
    />
  ),
  dandiya: (
    <g stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
      <line x1="16" y1="16" x2="48" y2="48" />
      <line x1="48" y1="16" x2="16" y2="48" />
      <circle cx="16" cy="16" r="3" fill="#fff" />
      <circle cx="48" cy="16" r="3" fill="#fff" />
    </g>
  ),
  diya: (
    <g fill="none" stroke="#fff" strokeWidth="3">
      <path d="M32 8 C 40 18, 41 26, 32 33 C 23 26, 24 18, 32 8 Z" />
      <path d="M12 36 C 12 48, 24 55, 32 55 C 40 55, 52 48, 52 36" />
      <ellipse cx="32" cy="36" rx="20" ry="6" />
    </g>
  ),
  mandala: (
    <g fill="none" stroke="#fff" strokeWidth="2.5">
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="12" />
      <circle cx="32" cy="32" r="4" fill="#fff" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1="32"
          y1="10"
          x2="32"
          y2="20"
          transform={`rotate(${a} 32 32)`}
        />
      ))}
    </g>
  ),
  'dancing-couple': (
    <g fill="#fff">
      <circle cx="22" cy="14" r="5" />
      <path d="M22 20 C 12 24, 10 36, 14 46 L 18 46 L 20 30 L 22 46 L 26 46 C 30 36, 32 24, 22 20 Z" />
      <circle cx="42" cy="14" r="5" />
      <path d="M42 20 C 52 24, 54 36, 50 46 L 46 46 L 44 30 L 42 46 L 38 46 C 34 36, 32 24, 42 20 Z" />
    </g>
  ),
  sparkle: (
    <g fill="#fff">
      <path d="M32 8 L36 26 L54 30 L36 34 L32 52 L28 34 L10 30 L28 26 Z" />
      <circle cx="14" cy="14" r="2.5" />
      <circle cx="50" cy="48" r="2.5" />
    </g>
  ),
  flower: (
    <g fill="#fff">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="32" cy="20" rx="6" ry="11" transform={`rotate(${a} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="5" fill="#5c1533" />
    </g>
  ),
  'music-note': (
    <g fill="#fff">
      <circle cx="20" cy="46" r="7" />
      <circle cx="42" cy="42" r="7" />
      <path d="M27 46 L27 14 L49 10 L49 38" stroke="#fff" strokeWidth="3.5" fill="none" />
    </g>
  ),
  fire: (
    <path
      d="M32 6 C 40 18, 46 24, 40 36 C 44 34, 46 30, 46 30 C 50 40, 44 56, 32 58 C 20 56, 14 40, 18 30 C 18 30, 20 34, 24 36 C 18 24, 24 18, 32 6 Z"
      fill="#fff"
    />
  ),
  clap: (
    <g fill="#fff">
      <path d="M20 20 L30 40 L24 44 L14 24 Z" />
      <path d="M44 20 L34 40 L40 44 L50 24 Z" />
      <circle cx="16" cy="16" r="2" />
      <circle cx="48" cy="16" r="2" />
      <circle cx="32" cy="10" r="2" />
    </g>
  ),
  laugh: (
    <g>
      <circle cx="32" cy="32" r="22" fill="#fff" />
      <path d="M20 30 Q22 24 26 30" stroke="#5c1533" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M38 30 Q40 24 44 30" stroke="#5c1533" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M18 36 Q32 52 46 36 Q32 48 18 36 Z" fill="#5c1533" />
    </g>
  ),
  'thumbs-up': (
    <path
      d="M18 30 L18 50 L26 50 L26 30 Z M26 30 L32 12 C 35 12, 37 15, 36 19 L34 28 L46 28 C 49 28, 51 31, 49 34 L44 48 C 43 50, 41 50, 39 50 L26 50"
      fill="#fff"
    />
  ),
  blush: (
    <g>
      <circle cx="32" cy="32" r="22" fill="#fff" />
      <circle cx="22" cy="30" r="2.5" fill="#5c1533" />
      <circle cx="42" cy="30" r="2.5" fill="#5c1533" />
      <circle cx="18" cy="38" r="4" fill="#e6499f" opacity="0.6" />
      <circle cx="46" cy="38" r="4" fill="#e6499f" opacity="0.6" />
      <path d="M24 40 Q32 46 40 40" stroke="#5c1533" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  'star-eyes': (
    <g>
      <circle cx="32" cy="32" r="22" fill="#fff" />
      {[[22, 30], [42, 30]].map(([cx, cy]) => (
        <path
          key={cx}
          d={`M${cx} ${cy - 6} L${cx + 2} ${cy - 2} L${cx + 6} ${cy - 2} L${cx + 3} ${cy + 1} L${cx + 4} ${cy + 5} L${cx} ${cy + 3} L${cx - 4} ${cy + 5} L${cx - 3} ${cy + 1} L${cx - 6} ${cy - 2} L${cx - 2} ${cy - 2} Z`}
          fill="#5c1533"
        />
      ))}
      <path d="M24 40 Q32 46 40 40" stroke="#5c1533" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  ),
};

const Sticker = ({ id, size = 56 }: { id: StickerId; size?: number }) => {
  const [from, to] = badgeGradients[id];
  const gradId = `grad-${id}`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${gradId})`} />
      {icons[id]}
    </svg>
  );
};

export default Sticker;
