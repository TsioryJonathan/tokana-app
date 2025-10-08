import { Platform } from 'react-native';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{ id: string; text: string }>;
};

export async function geocodeSearch(query: string, opts?: {
  limit?: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  country?: string; // e.g. 'MG'
}) {
  if (!MAPBOX_TOKEN) throw new Error('Missing EXPO_PUBLIC_MAPBOX_TOKEN');
  const q = encodeURIComponent(query.trim());
  const limit = opts?.limit ?? 5;
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    autocomplete: 'true',
    language: 'fr',
    types: 'address,place,poi,locality,neighborhood',
    limit: String(limit),
    country: opts?.country ?? 'MG',
  });
  if (opts?.bbox) params.set('bbox', opts.bbox.join(','));
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mapbox geocoding error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { features: MapboxFeature[] };
  return json.features || [];
}
