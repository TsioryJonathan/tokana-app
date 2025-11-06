# Format JSON attendu pour configurer les géométries de zones

## Endpoints disponibles

1. **PUT `/api/admin/zones/:id/geometry`** - Par ID de zone
2. **PUT `/api/admin/zones/key/:key/geometry`** - Par clé de zone (`ville`, `peripherie`, `super-peripherie`)

## Format du body JSON

Le body doit contenir un objet avec une propriété `geometry` :

```json
{
  "geometry": {
    "type": "Polygon" | "MultiPolygon",
    "coordinates": [...]
  }
}
```

## Exemples

### Exemple 1 : Polygon simple (zone VILLE)

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [47.4800, -18.9500],
        [47.5500, -18.9500],
        [47.5500, -18.8500],
        [47.4800, -18.8500],
        [47.4800, -18.9500]
      ]
    ]
  }
}
```

### Exemple 2 : Polygon avec plus de points (plus précis)

```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [47.4700, -18.9600],
        [47.4850, -18.9650],
        [47.4950, -18.9700],
        [47.5100, -18.9750],
        [47.5250, -18.9750],
        [47.5400, -18.9700],
        [47.5550, -18.9650],
        [47.5650, -18.9600],
        [47.5700, -18.9500],
        [47.5700, -18.9400],
        [47.5650, -18.9300],
        [47.5550, -18.9200],
        [47.5400, -18.9150],
        [47.5250, -18.9100],
        [47.5100, -18.9100],
        [47.4950, -18.9150],
        [47.4850, -18.9200],
        [47.4750, -18.9300],
        [47.4700, -18.9400],
        [47.4700, -18.9500],
        [47.4700, -18.9600]
      ]
    ]
  }
}
```

### Exemple 3 : MultiPolygon (pour zones non contiguës)

```json
{
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [47.4800, -18.9500],
          [47.5500, -18.9500],
          [47.5500, -18.8500],
          [47.4800, -18.8500],
          [47.4800, -18.9500]
        ]
      ],
      [
        [
          [47.4000, -18.9800],
          [47.4200, -18.9800],
          [47.4200, -18.9600],
          [47.4000, -18.9600],
          [47.4000, -18.9800]
        ]
      ]
    ]
  }
}
```

## Règles de validation

1. **Type requis** : `"Polygon"` ou `"MultiPolygon"` uniquement
2. **Coordonnées** : Tableau de coordonnées [longitude, latitude]
3. **Polygon fermé** : Le premier point doit être identique au dernier point
4. **Ordre des coordonnées** : `[longitude, latitude]` (pas `[lat, lng]`)

## Exemple de requête cURL

```bash
# Par clé de zone (recommandé)
curl -X PUT http://localhost:3000/api/admin/zones/key/ville/geometry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [47.4800, -18.9500],
          [47.5500, -18.9500],
          [47.5500, -18.8500],
          [47.4800, -18.8500],
          [47.4800, -18.9500]
        ]
      ]
    }
  }'

# Par ID de zone
curl -X PUT http://localhost:3000/api/admin/zones/1/geometry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [47.4800, -18.9500],
          [47.5500, -18.9500],
          [47.5500, -18.8500],
          [47.4800, -18.8500],
          [47.4800, -18.9500]
        ]
      ]
    }
  }'
```

## Réponse en cas de succès

```json
{
  "msg": "Geometry enregistrée",
  "id": 1,
  "key": "ville"
}
```

## Réponse en cas d'erreur

```json
{
  "msg": "GeoJSON invalide (Polygon ou MultiPolygon requis)"
}
```

## Notes importantes

- ⚠️ Les coordonnées doivent être au format `[longitude, latitude]` (pas `[latitude, longitude]`)
- ⚠️ Le polygone doit être fermé (premier point = dernier point)
- ⚠️ Pour Antananarivo, la longitude est autour de `47.5` et la latitude autour de `-18.9`
- ✅ Utilisez `MultiPolygon` si votre zone n'est pas contiguë (plusieurs polygones séparés)

