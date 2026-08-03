export type MapHub = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  value: string;
  pulse?: boolean;
};

export type LightRegion = {
  lat: number;
  lon: number;
  count: number;
  spread: number;
  seed: number;
};

export const MAP_HUBS: MapHub[] = [
  { id: 'nyc', label: 'New York', lat: 40.71, lon: -74.01, value: '80,269', pulse: true },
  { id: 'chi', label: 'Chicago', lat: 41.88, lon: -87.63, value: '72,345.6', pulse: true },
  { id: 'lon', label: 'London', lat: 51.51, lon: -0.13, value: '66,610', pulse: true },
  { id: 'fra', label: 'Frankfurt', lat: 50.11, lon: 8.68, value: '42,180' },
  { id: 'dxb', label: 'Dubai', lat: 25.2, lon: 55.27, value: '18,420' },
  { id: 'mum', label: 'Mumbai', lat: 19.08, lon: 72.88, value: '10,456.7' },
  { id: 'hkg', label: 'Hong Kong', lat: 22.32, lon: 114.17, value: '54,220', pulse: true },
  { id: 'tyo', label: 'Tokyo', lat: 35.68, lon: 139.65, value: '62,330', pulse: true },
  { id: 'sgp', label: 'Singapore', lat: 1.35, lon: 103.82, value: '31,905' },
  { id: 'syd', label: 'Sydney', lat: -33.87, lon: 151.21, value: '12,640' },
  { id: 'sao', label: 'São Paulo', lat: -23.55, lon: -46.63, value: '8,942' },
];

export const MAP_CONNECTIONS: [string, string][] = [
  ['nyc', 'lon'],
  ['chi', 'lon'],
  ['lon', 'fra'],
  ['lon', 'dxb'],
  ['dxb', 'mum'],
  ['mum', 'hkg'],
  ['hkg', 'tyo'],
  ['hkg', 'sgp'],
  ['nyc', 'hkg'],
  ['nyc', 'sao'],
];

/** Dense city-light clusters — real-world regions */
export const LIGHT_REGIONS: LightRegion[] = [
  { lat: 39.5, lon: -98, count: 140, spread: 11, seed: 42 },
  { lat: 40.7, lon: -74, count: 70, spread: 3.5, seed: 17 },
  { lat: 34, lon: -118, count: 55, spread: 3, seed: 88 },
  { lat: 51.5, lon: 0, count: 65, spread: 4, seed: 31 },
  { lat: 48.8, lon: 2.3, count: 45, spread: 3.5, seed: 77 },
  { lat: 50.1, lon: 8.7, count: 35, spread: 2.5, seed: 55 },
  { lat: 25.2, lon: 55.3, count: 30, spread: 3, seed: 99 },
  { lat: 19, lon: 73, count: 50, spread: 4, seed: 12 },
  { lat: 31.2, lon: 121.5, count: 80, spread: 5, seed: 66 },
  { lat: 35.7, lon: 139.7, count: 75, spread: 4, seed: 23 },
  { lat: 1.3, lon: 103.8, count: 35, spread: 2.5, seed: 44 },
  { lat: -23.5, lon: -46.6, count: 40, spread: 4, seed: 91 },
  { lat: -33.9, lon: 151.2, count: 25, spread: 3, seed: 38 },
];

export function scatterLights(
  lat: number,
  lon: number,
  count: number,
  spread: number,
  seed: number,
): { lat: number; lon: number; o: number; r: number }[] {
  const dots: { lat: number; lon: number; o: number; r: number }[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 7) % 2147483647;
    const a = (s / 2147483647) * Math.PI * 2;
    s = (s * 16807 + 7) % 2147483647;
    const d = ((s / 2147483647) * spread) / 111;
    s = (s * 16807 + 7) % 2147483647;
    const o = 0.35 + ((s % 100) / 150);
    dots.push({
      lat: lat + Math.sin(a) * d * 0.85,
      lon: lon + Math.cos(a) * d,
      o,
      r: o > 0.55 ? 1.1 : 0.7,
    });
  }
  return dots;
}

export const ALL_LIGHTS = LIGHT_REGIONS.flatMap((r) => scatterLights(r.lat, r.lon, r.count, r.spread, r.seed));
