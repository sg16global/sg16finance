import { useId } from 'react';
import { formatPrice } from '../../lib/format';

type Props = {
  data: number[];
  height?: number;
  formatValue?: (value: number) => string;
  /** Tighter padding for phones in portrait or landscape */
  compact?: boolean;
};

function defaultFormat(value: number): string {
  if (value >= 1000) return formatPrice(value);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function FinancialChart({
  data,
  height = 220,
  formatValue = defaultFormat,
  compact = false,
}: Props) {
  const fillId = useId();

  if (data.length < 2) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-[#7D8594]">Chart unavailable</div>
    );
  }

  const pad = compact
    ? { top: 10, right: 8, bottom: 22, left: 46 }
    : { top: 16, right: 16, bottom: 32, left: 68 };
  const labelSize = compact ? 8 : 10;
  const width = 640;
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const coords = data.map((value, i) => {
    const x = pad.left + (i / (data.length - 1)) * chartW;
    const y = pad.top + chartH - ((value - min) / range) * chartH;
    return { x, y, value };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${pad.top + chartH} L ${coords[0].x.toFixed(2)} ${pad.top + chartH} Z`;

  const gridSteps = [0, 0.5, 1];
  const yLabels = gridSteps.map((step) => ({
    y: pad.top + chartH - step * chartH,
    value: min + range * step,
  }));

  const firstUp = data[data.length - 1] >= data[0];
  const lineColor = firstUp ? '#FF9A3C' : '#FF5B5B';
  const fillTop = firstUp ? '#C76A16' : '#FF5B5B';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Price chart last 30 days"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} stopOpacity="0.18" />
          <stop offset="100%" stopColor={fillTop} stopOpacity="0" />
        </linearGradient>
      </defs>

      {yLabels.map(({ y, value }) => (
        <g key={value}>
          <line
            x1={pad.left}
            y1={y}
            x2={pad.left + chartW}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 6"
          />
          <text
            x={pad.left - 8}
            y={y + 4}
            textAnchor="end"
            fill="#7D8594"
            fontSize={labelSize}
            fontFamily="IBM Plex Mono, monospace"
          >
            {formatValue(value)}
          </text>
        </g>
      ))}

      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="rgba(255,255,255,0.12)" />

      <text x={pad.left} y={height - 8} fill="#7D8594" fontSize={labelSize} fontFamily="Inter, sans-serif">
        30 days ago
      </text>
      <text
        x={pad.left + chartW}
        y={height - 8}
        fill="#7D8594"
        fontSize={labelSize}
        textAnchor="end"
        fontFamily="Inter, sans-serif"
      >
        Today
      </text>

      <path d={areaPath} fill={`url(#${fillId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={compact ? 1.5 : 2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {coords.map((p, i) =>
        i % 4 === 0 || i === coords.length - 1 ? (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={lineColor} opacity={i === coords.length - 1 ? 1 : 0.35} />
        ) : null,
      )}
    </svg>
  );
}
