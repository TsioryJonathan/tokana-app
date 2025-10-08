import { booleanPointInPolygon, point, multiPolygon, polygon } from '@turf/turf';
import Zone from '../models/Zone.js';

let cache = {
  loadedAt: 0,
  zones: [], // { key, feature }
};

export async function loadZonesGeometry() {
  const rows = await Zone.findAll({ attributes: ['key', 'geometry'] });
  cache.zones = rows
    .filter((z) => z.geometry)
    .map((z) => {
      const g = z.geometry;
      const feature = g?.type === 'MultiPolygon'
        ? multiPolygon(g.coordinates)
        : g?.type === 'Polygon'
          ? polygon(g.coordinates)
          : null;
      return feature ? { key: z.key, feature } : null;
    })
    .filter(Boolean);
  cache.loadedAt = Date.now();
}

export async function ensureZonesLoaded() {
  if (!cache.zones?.length) {
    await loadZonesGeometry();
  }
}

export async function inferZoneLevel(lat, lng) {
  await ensureZonesLoaded();
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const pt = point([lng, lat]);
  for (const z of cache.zones) {
    try {
      if (booleanPointInPolygon(pt, z.feature)) return z.key;
    } catch {}
  }
  return null;
}

export function clearZonesCache() {
  cache = { loadedAt: 0, zones: [] };
}
