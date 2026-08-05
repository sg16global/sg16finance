import { useId } from 'react';

type Props = {
  data: number[];
  height?: number;
  compact?: boolean;
};

/** Compact sparkline — same style as the big chart, fits inside category cards */
export default function SparklineChart({ data, height = 52, compact = false }: Props) {
  const fillId = useId();

  if (data.length < 2) return null;

  const pad = compact
    ? { top: 4, right: 6, bottom: 2, left: 30 }
    : { top: 6, right: 8, bottom: 4, left: 42 };
  const width = 200;
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const coords = data.map((value, i) => {
    const x = pad.left + (i / (data.length - 1)) * chartW;
    const y = pad.top + chartH - ((value - min) / range) * chartH;
    return { x, y };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${pad.top + chartH} L ${coords[0].x.toFixed(1)} ${pad.top + chartH} Z`;

  const up = data[data.length - 1] >= data[0];
  const lineColor = up ? '#2ECC71' : '#FF5B5B';
  const fillColor = up ? '#2ECC71' : '#FF5B5B';

  const fmt = (v: number) => {
    if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
    if (v >= 1000) return v.toFixed(0);
    if (v >= 1) return v.toFixed(2);
    return v.toFixed(3);
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <line
        x1={pad.left}
        y1={pad.top + chartH * 0.5}
        x2={pad.left + chartW}
        y2={pad.top + chartH * 0.5}
        stroke="rgba(255,255,255,0.06)"
        strokeDasharray="3 4"
      />

      <text x={pad.left - 4} y={pad.top + 3} textAnchor="end" fill="#7D8594" fontSize={compact ? 6 : 7} fontFamily="IBM Plex Mono, monospace">
        {fmt(max)}
      </text>
      <text x={pad.left - 4} y={pad.top + chartH} textAnchor="end" fill="#7D8594" fontSize={compact ? 6 : 7} fontFamily="IBM Plex Mono, monospace">
        {fmt(min)}
      </text>

      <path d={areaPath} fill={`url(#${fillId})`} />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2" fill={lineColor} />
    </svg>
  );
}
