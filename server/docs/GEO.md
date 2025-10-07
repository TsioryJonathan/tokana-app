# Zones GeoJSON & Inference

Tokana infers the delivery `zoneLevel` from dropoff coordinates using GeoJSON polygons.

- Store polygons in `Zone.geometry` for keys: `ville`, `peripherie`, `super-peripherie`.
- Inference uses Turf (`booleanPointInPolygon`) in `server/utils/geo.js`.

## Admin endpoints

- GET `/api/admin/zones/{id}/geometry` — retrieve geometry for a zone.
- PUT `/api/admin/zones/{id}/geometry` — set geometry by id.
- PUT `/api/admin/zones/key/{key}/geometry` — set geometry by zone key.

Request body for PUT:

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [ [47.50, -18.95], [47.60, -18.95], [47.60, -18.85], [47.50, -18.85], [47.50, -18.95] ]
    ]
  }
}
```

## API behavior with coords

- Pricing: `POST /api/pricing/quote` accepts `lat/lng` or `zoneLevel`. Response includes `inferredZone` when coords provided.
- Slots (standard): `GET /api/slots/standard` accepts `lat/lng` or `zoneLevel`; response includes `inferredZone`.
- Orders: `POST /api/orders` accepts `lat/lng`; server infers `zoneLevel` and stores `dropoffLat`/`dropoffLng`.

## Notes

- If coords are absent, `zoneLevel` (or legacy `dropoffLocalityId`) is still accepted for backward compatibility.
