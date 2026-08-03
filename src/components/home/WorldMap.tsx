import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FeatureCollection, Geometry } from 'geojson';
import { ALL_LIGHTS, MAP_CONNECTIONS, MAP_HUBS } from '../../data/mapHubs';
import { useInView } from '../../hooks/useInView';
import { createPath, createProjection, loadWorldGeo, MAP_H, MAP_W, projectPoint } from '../../lib/worldGeo';

const hubById = Object.fromEntries(MAP_HUBS.map((h) => [h.id, h]));

type FlowDot = { id: string; from: string; to: string; t: number; speed: number };

function pickFlow(i: number): FlowDot {
  const pair = MAP_CONNECTIONS[i % MAP_CONNECTIONS.length];
  return {
    id: `${pair[0]}-${pair[1]}-${i}-${Math.random()}`,
    from: pair[0],
    to: pair[1],
    t: Math.random(),
    speed: 0.15 + Math.random() * 0.12,
  };
}

const REGION_SPARKS = [
  { lon: -95, lat: 38, pts: [0, 4, 2, 6, 3, 8, 5, 7, 8, 9, 10, 11] },
  { lon: -55, lat: -15, pts: [0, 3, 1, 5, 2, 4, 4, 6, 6, 5] },
  { lon: 10, lat: 50, pts: [0, 5, 2, 4, 4, 6, 6, 5, 8, 8, 10, 7] },
  { lon: 105, lat: 35, pts: [0, 6, 2, 5, 4, 7, 6, 6, 8, 9, 10, 10] },
  { lon: 115, lat: -25, pts: [0, 4, 3, 3, 5, 5, 7, 4] },
];

export default function WorldMap() {
  const { setRef, inView } = useInView('200px');
  const [geo, setGeo] = useState<FeatureCollection<Geometry> | null>(null);
  const [flows, setFlows] = useState<FlowDot[]>(() => Array.from({ length: 8 }, (_, i) => pickFlow(i)));

  useEffect(() => {
    if (!inView) return;
    loadWorldGeo().then(setGeo).catch(() => undefined);
  }, [inView]);

  const projection = useMemo(() => (geo ? createProjection(geo) : null), [geo]);
  const path = useMemo(() => (projection ? createPath(projection) : null), [projection]);

  const lights = useMemo(() => {
    if (!projection) return [];
    return ALL_LIGHTS.map((l, i) => {
      const p = projectPoint(projection, l.lon, l.lat);
      return p ? { x: p[0], y: p[1], o: l.o, r: l.r, i } : null;
    }).filter(Boolean) as { x: number; y: number; o: number; r: number; i: number }[];
  }, [projection]);

  const hubs = useMemo(() => {
    if (!projection) return [];
    return MAP_HUBS.map((h) => {
      const p = projectPoint(projection, h.lon, h.lat);
      return p ? { ...h, x: p[0], y: p[1] } : null;
    }).filter(Boolean) as (typeof MAP_HUBS[0] & { x: number; y: number })[];
  }, [projection]);

  const connections = useMemo(() => {
    if (!projection) return [];
    return MAP_CONNECTIONS.map(([a, b]) => {
      const from = hubById[a];
      const to = hubById[b];
      if (!from || !to) return null;
      const p1 = projectPoint(projection, from.lon, from.lat);
      const p2 = projectPoint(projection, to.lon, to.lat);
      return p1 && p2 ? { a, b, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] } : null;
    }).filter(Boolean) as { a: string; b: string; x1: number; y1: number; x2: number; y2: number }[];
  }, [projection]);

  const sparks = useMemo(() => {
    if (!projection) return [];
    return REGION_SPARKS.map((s) => {
      const base = projectPoint(projection, s.lon, s.lat);
      if (!base) return null;
      const [bx, by] = base;
      let ptsStr = '';
      for (let i = 0; i < s.pts.length; i += 2) {
        ptsStr += `${bx + s.pts[i] * 2.5},${by - s.pts[i + 1] * 2} `;
      }
      return ptsStr.trim();
    }).filter(Boolean) as string[];
  }, [projection]);

  /* Running flow dots along connection lines */
  useEffect(() => {
    if (!hubs.length) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setFlows((prev) =>
        prev.map((f, i) => {
          const t = f.t + f.speed * dt;
          if (t >= 1) return pickFlow(i + Math.floor(now / 1000));
          return { ...f, t };
        }),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hubs.length]);

  return (
    <div
      ref={setRef}
      className="map-panel relative mx-auto w-full max-w-[920px] overflow-hidden rounded-[14px] border border-[#C76A16]/20"
    >
      <p className="absolute left-4 top-3 z-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C76A16] md:left-5 md:top-4">
        International stock intelligence
      </p>

      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="map-svg block w-full"
        aria-label="Global market activity map"
      >
        <defs>
          <linearGradient id="mapFade" x1="0" y1="0.55" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="hubNeon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFBE6A" stopOpacity="1" />
            <stop offset="45%" stopColor="#C76A16" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C76A16" stopOpacity="0" />
          </radialGradient>
          <filter id="neonGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="landGlow">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={MAP_W} height={MAP_H} fill="#000000" />

        {/* Ambient regional lighting — inside map */}
        {hubs.map((hub) => (
          <ellipse
            key={`glow-${hub.id}`}
            cx={hub.x}
            cy={hub.y}
            rx={hub.pulse ? 55 : 38}
            ry={hub.pulse ? 35 : 24}
            fill="url(#hubNeon)"
            opacity={0.12}
          />
        ))}

        {/* Real world countries — lit edges */}
        {path &&
          geo?.features.map((f, i) => (
            <path
              key={i}
              d={path(f) || ''}
              fill="#0a0a0d"
              stroke="rgba(199,106,22,0.22)"
              strokeWidth={0.5}
              filter="url(#landGlow)"
            />
          ))}

        {!geo && (
          <text x={MAP_W / 2} y={MAP_H / 2} textAnchor="middle" fill="#7D8594" fontSize={14} fontFamily="Inter, sans-serif">
            Loading world map…
          </text>
        )}

        {/* City lights — bloom layer + core */}
        <g className="city-light-group" opacity={0.5} filter="url(#neonGlow)">
          {lights.map((l) => (
            <circle key={`b-${l.i}`} cx={l.x} cy={l.y} r={l.r * 2.2} fill="#FF9A3C" opacity={l.o * 0.4} />
          ))}
        </g>
        <g className="city-light-group" opacity={0.95}>
          {lights.map((l) => (
            <circle key={l.i} cx={l.x} cy={l.y} r={l.r * 1.15} fill="#FFBE6A" opacity={Math.min(l.o + 0.25, 1)} />
          ))}
        </g>

        {/* Connection routes */}
        {connections.map((c) => (
          <g key={`${c.a}-${c.b}`}>
            <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#C76A16" strokeOpacity={0.06} strokeWidth={2} />
            <line
              x1={c.x1}
              y1={c.y1}
              x2={c.x2}
              y2={c.y2}
              stroke="#FF9A3C"
              strokeOpacity={0.28}
              strokeWidth={0.6}
              strokeDasharray="4 6"
              className="connection-line"
            />
          </g>
        ))}

        {/* Running flow particles */}
        {flows.map((f) => {
          const from = hubs.find((h) => h.id === f.from);
          const to = hubs.find((h) => h.id === f.to);
          if (!from || !to) return null;
          const x = from.x + (to.x - from.x) * f.t;
          const y = from.y + (to.y - from.y) * f.t;
          return <circle key={f.id} cx={x} cy={y} r={2} fill="#FFBE6A" opacity={0.9} filter="url(#neonGlow)" />;
        })}

        {/* Regional sparklines */}
        {sparks.map((pts, i) => (
          <polyline
            key={i}
            points={pts}
            fill="none"
            stroke="#FF9A3C"
            strokeWidth={1.2}
            strokeOpacity={0.65}
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />
        ))}

        {/* Hub nodes + values */}
        {hubs.map((hub) => (
          <g key={hub.id}>
            <circle cx={hub.x} cy={hub.y} r={14} fill="url(#hubNeon)" opacity={0.45} />
            <circle cx={hub.x} cy={hub.y} r={5} fill="#C76A16" filter="url(#neonGlow)" className={hub.pulse ? 'hub-pulse' : ''} />
            <circle cx={hub.x} cy={hub.y} r={2} fill="#FFBE6A" />
            <text
              x={hub.x}
              y={hub.y - 12}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11}
              fontFamily="IBM Plex Mono, monospace"
              fontWeight={500}
            >
              {hub.value}
            </text>
          </g>
        ))}

        <rect width={MAP_W} height={MAP_H} fill="url(#mapFade)" pointerEvents="none" />
      </svg>

      <div className="absolute bottom-14 left-3 z-10 max-w-[240px] md:bottom-16 md:left-4 md:max-w-sm">
        <div className="glass-shield">
          <span className="shield-accent-bar" aria-hidden />
          <div className="glass-shield-inner p-3 md:p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C76A16]">Caption analytics insights</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#7D8594]">
              Live institutional flow routes across global hubs. Orange lights reflect market activity intensity.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center md:bottom-4">
        <Link
          to="/markets"
          className="rounded-xl border border-[#C76A16]/60 bg-black/80 px-5 py-2 text-xs font-medium text-[#FF9A3C] backdrop-blur-sm transition duration-200 hover:border-[#FF9A3C] hover:bg-[#C76A16]/15 accent-glow"
        >
          View Full Dashboard
        </Link>
      </div>
    </div>
  );
}
