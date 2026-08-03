type Props = {
  data: number[];
  height?: number;
  variant?: 'line' | 'candle';
};

export default function MiniChart({ data, height = 64, variant = 'line' }: Props) {
  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  if (variant === 'candle') {
    const barW = w / data.length - 1;
    return (
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" aria-hidden>
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
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C76A16" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C76A16" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${w},${height}`} fill="url(#chartFill)" />
      <polyline points={points} fill="none" stroke="#C76A16" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
