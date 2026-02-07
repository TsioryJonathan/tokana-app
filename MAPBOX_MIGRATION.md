# Migration de Google Maps vers Mapbox

## 📋 Changements effectués

### 1. Composants mis à jour:
- **`AddressMapPicker.tsx`** → **`AddressMapPicker.mapbox.tsx`**
  - Remplacement de `react-native-maps` par `@rnmapbox/maps`
  - Ajout de la recherche d'adresse avec Mapbox Geocoding
  - Interface améliorée avec résultats de recherche
  - Support du drag & drop du marqueur

- **`gps-tracking.tsx`** → **`gps-tracking.mapbox.tsx`**
  - Carte de suivi GPS des livreurs
  - Points d'annotation avec callouts
  - Trajectoires optionnelles
  - Centrage automatique sur livreur sélectionné

### 2. Configuration:
- **`app.json`**: Suppression de la configuration Google Maps Android
- **Dépendances**: `react-native-maps` → `@rnmapbox/maps`

### 3. Avantages Mapbox:
- ✅ **Gratuit** jusqu'à 50k requêtes/mois
- ✅ **Géocoding intégré** (adresse → coordonnées)
- ✅ **Style personnalisable**
- ✅ **Performances optimisées**
- ✅ **Support Madagascar** (`country: 'MG'`)

## 🚀 Installation requise

### 1. Installer les nouvelles dépendances:
```bash
cd client
npm uninstall react-native-maps
npm install @rnmapbox/maps
```

### 2. Configuration iOS (si nécessaire):
```bash
cd ios
pod install
```

### 3. Token Mapbox:
Ajouter dans `.env`:
```
EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Permissions iOS/Android:
**iOS** (`Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Nous avons besoin de votre position pour le suivi GPS</string>
<key>MGLMapboxAccessToken</key>
<string>$(EXPO_PUBLIC_MAPBOX_TOKEN)</string>
```

**Android** (`AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<meta-data
  android:name="com.mapbox.token"
  android:value="${EXPO_PUBLIC_MAPBOX_TOKEN}" />
```

## 🔄 Prochaines étapes

1. **Renommer les fichiers:**
   ```bash
   mv client/components/AddressMapPicker.mapbox.tsx client/components/AddressMapPicker.tsx
   mv client/app/(admin)/gps-tracking.mapbox.tsx client/app/(admin)/gps-tracking.tsx
   ```

2. **Mettre à jour les imports** dans toute l'application

3. **Tester** les fonctionnalités:
   - Sélection d'adresse
   - Suivi GPS
   - Géocoding

4. **Configurer le token** Mapbox

## 📊 Comparaison des coûts

| Service | Gratuit | Payant |
|---------|---------|---------|
| **Google Maps** | $200/mois | $0.007/requête |
| **Mapbox** | 50k requêtes/mois | $0.50/1000 requêtes |

**Économie estimée:** ~$200/mois pour une application moyenne

## 🐛 Problèmes connus

1. **Android build:** Nécessite configuration supplémentaire
2. **iOS simulator:** Peut nécessiter configuration manuelle
3. **Permissions:** Doivent être demandées au runtime

## 🤝 Support

Pour toute question sur la migration:
- Documentation Mapbox: https://docs.mapbox.com/
- Issues GitHub: Ouvrir une issue dans le repo
- Contact: [Votre contact]

---

**Migration complétée par:** OpenClaw Assistant  
**Date:** 2026-02-07  
**Statut:** ✅ Prêt pour review