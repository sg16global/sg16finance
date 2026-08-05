import { useId } from 'react';

type Props = {
  data: number[];
  height?: number;
  variant?: 'line' | 'candle';
  glow?: boolean;
  strokeWidth?: number;
};

export default function MiniChart({
  data,
  height = 64,
  variant = 'line',
  glow = false,
  strokeWidth = 1.2,
}: Props) {
  const gradientId = useId();
  const glowId = useId();
  const w = 100;

  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  if (variant === 'candle') {
    const barW = w / data.length - 1;
    return (
      <svg viewBox={`0 0 ${w} ${height}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden>
        {data.map((v, i) => {
          const open = data[i - 1] ?? v;
          const up = v >= open;
          const bodyTop = height - ((Math.max(v, open) - min) / range) * (height - 8) - 4;
          const bodyH = (Math.abs(v - open) / range) * (height - 8) || 2;
          const x = i * (barW + 1) + 1;
          return (
            <rect
              key={i}
              x={x}
              y={bodyTop}
              width={barW}
              height={bodyH}
              fill={up ? '#C76A16' : '#FF5B5B'}
              opacity={0.85}
              rx="0.5"
            />
          );
        })}
      </svg>
    );
  }

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C76A16" stopOpacity={glow ? 0.25 : 0.15} />
          <stop offset="100%" stopColor="#C76A16" stopOpacity="0" />
        </linearGradient>
        {glow && (
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <polygon points={`0,${height} ${points} ${w},${height}`} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke="#C76A16"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
