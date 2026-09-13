const ring = (count: number) => Array.from({ length: count }, (_, i) => (i * 360) / count);

const Mandala = ({ size = 220 }: { size?: number }) => {
  const outerDots = ring(24);
  const petals1 = ring(16);
  const leaves = ring(12);
  const petals2 = ring(8);
  const innerDots = ring(10);

  return (
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      {/* Outer guide rings */}
      <circle cx="110" cy="110" r="106" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="110" cy="110" r="96" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" />

      {/* Ring of small dots just inside the border */}
      {outerDots.map((angle) => (
        <circle
          key={`od-${angle}`}
          cx="110"
          cy="12"
          r="2.4"
          fill="currentColor"
          transform={`rotate(${angle} 110 110)`}
        />
      ))}

      {/* Ring of slim petals */}
      {petals1.map((angle) => (
        <g key={`p1-${angle}`} transform={`rotate(${angle} 110 110)`}>
          <path
            d="M110 24 C 118 34, 118 46, 110 54 C 102 46, 102 34, 110 24 Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      ))}

      <circle cx="110" cy="110" r="78" stroke="currentColor" strokeWidth="1.25" />

      {/* Ring of pointed leaves (main mandala layer) */}
      {leaves.map((angle) => (
        <g key={`lv-${angle}`} transform={`rotate(${angle} 110 110)`}>
          <path
            d="M110 32 C 128 48, 130 66, 110 82 C 90 66, 92 48, 110 32 Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M110 40 L110 74" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        </g>
      ))}

      <circle cx="110" cy="110" r="54" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="110" cy="110" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="1 4" />

      {/* Ring of rounded petals */}
      {petals2.map((angle) => (
        <g key={`p2-${angle}`} transform={`rotate(${angle} 110 110)`}>
          <path
            d="M110 62 C 122 68, 126 80, 110 92 C 94 80, 98 68, 110 62 Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </g>
      ))}

      {/* Inner dot ring */}
      {innerDots.map((angle) => (
        <circle
          key={`id-${angle}`}
          cx="110"
          cy="76"
          r="2"
          fill="currentColor"
          transform={`rotate(${angle} 110 110)`}
        />
      ))}

      {/* Center flower */}
      <circle cx="110" cy="110" r="20" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="110" cy="110" r="7" stroke="currentColor" strokeWidth="2" />
      {ring(8).map((angle) => (
        <path
          key={`cf-${angle}`}
          d="M110 92 C 116 98, 116 104, 110 110 C 104 104, 104 98, 110 92 Z"
          stroke="currentColor"
          strokeWidth="1.25"
          transform={`rotate(${angle} 110 110)`}
        />
      ))}
    </svg>
  );
};

const Diya = ({ size = 130 }: { size?: number }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 120 132" fill="none">
    {/* Flame */}
    <path
      d="M60 14 C 74 32, 76 48, 60 62 C 44 48, 46 32, 60 14 Z"
      stroke="currentColor"
      strokeWidth="2.25"
    />
    {/* Bowl */}
    <path
      d="M18 66 C 18 94, 46 110, 60 110 C 74 110, 102 94, 102 66"
      stroke="currentColor"
      strokeWidth="2.25"
    />
    <ellipse cx="60" cy="66" rx="42" ry="11" stroke="currentColor" strokeWidth="2.25" />
    {/* Decorative dots along the rim */}
    {[-34, -17, 0, 17, 34].map((dx) => (
      <circle key={dx} cx={60 + dx} cy="66" r="2.5" fill="currentColor" />
    ))}
    {/* Base */}
    <path d="M38 110 L34 124 L86 124 L82 110" stroke="currentColor" strokeWidth="2.25" />
  </svg>
);

const DandiyaSticks = ({ size = 150 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" fill="none">
    <g transform="rotate(25 80 80)">
      <rect x="75" y="8" width="10" height="144" rx="5" stroke="currentColor" strokeWidth="2.25" />
      {[24, 42, 118, 136].map((y) => (
        <rect key={y} x="72" y={y} width="16" height="7" rx="2.5" fill="currentColor" opacity="0.85" />
      ))}
    </g>
    <g transform="rotate(-25 80 80)">
      <rect x="75" y="8" width="10" height="144" rx="5" stroke="currentColor" strokeWidth="2.25" />
      {[24, 42, 118, 136].map((y) => (
        <rect key={y} x="72" y={y} width="16" height="7" rx="2.5" fill="currentColor" opacity="0.85" />
      ))}
    </g>
  </svg>
);

const Paisley = ({ size = 110 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M50 12 C 78 12, 90 34, 78 56 C 70 70, 52 68, 48 54 C 45 43, 55 36, 63 42 C 68 46, 66 54, 60 55"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
    />
    <circle cx="50" cy="80" r="3" fill="currentColor" />
    <circle cx="64" cy="72" r="2" fill="currentColor" />
    <circle cx="36" cy="72" r="2" fill="currentColor" />
  </svg>
);

const HeartMotif = ({ size = 70 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 54" fill="none">
    <path
      d="M30 50 C 8 34, 2 20, 10 10 C 17 2, 28 6, 30 16 C 32 6, 43 2, 50 10 C 58 20, 52 34, 30 50 Z"
      stroke="currentColor"
      strokeWidth="2.25"
    />
  </svg>
);

// Stylized twirling dancer holding raised dandiya sticks, flowing skirt suggested by curves
const DandiyaDancer = ({ size = 160, flip = false }: { size?: number; flip?: boolean }) => (
  <svg
    width={size}
    height={size * 1.5}
    viewBox="0 0 140 210"
    fill="none"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    {/* Head */}
    <circle cx="70" cy="26" r="13" stroke="currentColor" strokeWidth="2.25" />
    {/* Neck + torso */}
    <path d="M70 39 L70 84" stroke="currentColor" strokeWidth="2.25" />
    {/* Raised arm with stick (right) */}
    <path d="M70 52 C 90 46, 104 30, 112 12" stroke="currentColor" strokeWidth="2.25" />
    <path d="M100 20 L124 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Raised arm with stick (left) */}
    <path d="M70 52 C 50 46, 36 30, 28 12" stroke="currentColor" strokeWidth="2.25" />
    <path d="M40 20 L16 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Flowing skirt (ghagra) twirl */}
    <path
      d="M70 84 C 30 92, 8 130, 18 172 C 34 158, 52 150, 70 150 C 88 150, 106 158, 122 172 C 132 130, 110 92, 70 84 Z"
      stroke="currentColor"
      strokeWidth="2.25"
    />
    <path d="M70 84 C 60 110, 60 140, 70 150" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    <path d="M70 84 C 80 110, 80 140, 70 150" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    {/* Skirt hem dots */}
    {[26, 46, 70, 94, 114].map((cx) => (
      <circle key={cx} cx={cx} cy="171" r="2.5" fill="currentColor" />
    ))}
    {/* Legs peeking out */}
    <path d="M62 150 L58 190" stroke="currentColor" strokeWidth="2.25" />
    <path d="M78 150 L82 190" stroke="currentColor" strokeWidth="2.25" />
  </svg>
);

const FestiveBackgroundArt = () => {
  return (
    <div className="festive-bg-art" aria-hidden="true">
      <div className="festive-motif festive-motif-tl">
        <Mandala size={380} />
      </div>
      <div className="festive-motif festive-motif-br">
        <Mandala size={400} />
      </div>
      <div className="festive-motif festive-motif-tr">
        <DandiyaSticks size={160} />
      </div>
      <div className="festive-motif festive-motif-bl">
        <Diya size={130} />
      </div>
      <div className="festive-motif festive-motif-top-center">
        <Paisley size={110} />
      </div>
      <div className="festive-motif festive-motif-bottom-center">
        <HeartMotif size={80} />
      </div>
      <div className="festive-motif festive-motif-mid-left">
        <DandiyaDancer size={170} />
      </div>
      <div className="festive-motif festive-motif-mid-right">
        <DandiyaDancer size={170} flip />
      </div>
      <div className="festive-motif festive-motif-center-mandala">
        <Mandala size={200} />
      </div>
      <div className="festive-motif festive-motif-upper-mid-left">
        <Paisley size={80} />
      </div>
      <div className="festive-motif festive-motif-lower-mid-right">
        <Paisley size={80} />
      </div>
      <div className="festive-motif festive-motif-side-upper-left">
        <HeartMotif size={50} />
      </div>
      <div className="festive-motif festive-motif-side-lower-left">
        <Paisley size={60} />
      </div>
      <div className="festive-motif festive-motif-side-upper-right">
        <Paisley size={60} />
      </div>
      <div className="festive-motif festive-motif-side-lower-right">
        <HeartMotif size={50} />
      </div>
    </div>
  );
};

export default FestiveBackgroundArt;
