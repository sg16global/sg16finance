import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';

export const MAP_W = 960;
export const MAP_H = 480;

export async function loadWorldGeo(): Promise<FeatureCollection<Geometry>> {
  const res = await fetch('/geo/countries-110m.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('geo load failed');
  const topology = (await res.json()) as Topology;
  return feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;
}

export function createProjection(geo: FeatureCollection<Geometry>) {
  return geoNaturalEarth1().fitSize([MAP_W, MAP_H], geo);
}

export function createPath(projection: ReturnType<typeof geoNaturalEarth1>) {
  return geoPath().projection(projection);
}

export function projectPoint(
  projection: ReturnType<typeof geoNaturalEarth1>,
  lon: number,
  lat: number,
): [number, number] | null {
  const p = projection([lon, lat]);
  return p ? [p[0], p[1]] : null;
}
