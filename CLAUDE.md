# CLAUDE.md - Guide de développement tokana-app

## 📋 Description

**tokana-app** est une application de livraison pour Madagascar, construite avec React Native (Expo). Elle gère 3 rôles : client, livreur (courier), et admin.

### Stack technique
- **Framework** : React Native + Expo (SDK 52+)
- **Routing** : Expo Router (file-based)
- **Styling** : NativeWind (TailwindCSS)
- **State** : React hooks + Context
- **API** : Client auto-généré via openapi-typescript-codegen
- **Maps** : @rnmapbox/maps (migration depuis Google Maps terminée)
- **Storage** : expo-secure-store (tokens), AsyncStorage (cache)
- **Forms** : React Hook Form + Zod
- **Charts** : Victory Native

---

## 🏗️ Architecture

```
tokana-app/
├── client/                    # App React Native
│   ├── app/                   # Routes (Expo Router file-based)
│   │   ├── _layout.tsx        # Root layout + auth guard
│   │   ├── (auth)/            # Login, register, verify
│   │   ├── (client)/          # Écrans client (commandes, suivi, profil)
│   │   ├── (admin)/           # Dashboard admin (stats, GPS, dispatches)
│   │   └── (courier)/         # Écrans livreur (livraisons, historique)
│   │
│   ├── components/            # Composants réutilisables
│   │   ├── ui/                # Primitives UI (Button, Input, Toast, etc.)
│   │   ├── Auth/              # Composants d'authentification
│   │   ├── CreateOrder/       # Steps de création de commande
│   │   ├── AddressMapPicker.tsx   # Sélecteur d'adresse MapBox
│   │   └── AddressAutocomplete.tsx # Autocomplétion MapBox
│   │
│   ├── lib/                   # Logique métier
│   │   ├── api/               # Client API auto-généré (NE PAS MODIFIER)
│   │   │   ├── core/          # HTTP client, error handling
│   │   │   ├── models/        # Types TypeScript
│   │   │   ├── services/      # Services par endpoint
│   │   │   ├── client.ts      # Factory avec refresh token + 401 handling
│   │   │   └── TokanaApiClient.ts # Client principal
│   │   ├── auth/session.ts    # Gestion tokens (SecureStore)
│   │   ├── hooks/             # Hooks partagés
│   │   ├── mapbox/            # Geocoding MapBox
│   │   └── mappers/           # Transformations de données
│   │
│   ├── hooks/                 # Hooks globaux
│   │   └── useProfile.ts     # Hook profil utilisateur
│   │
│   ├── utils/                 # Utilitaires
│   │   ├── logger.ts          # Logger dev-only
│   │   ├── phone.ts           # Validation téléphone Madagascar
│   │   └── price.helper.ts    # Formatage prix Ariary
│   │
│   ├── theme/colors.ts        # Palette de couleurs
│   └── types/                 # Types globaux
```

### Principes architecturaux
- **File-based routing** : Chaque fichier dans `app/` = une route
- **Role-based layouts** : `(admin)`, `(client)`, `(courier)` avec guards
- **API auto-générée** : Ne jamais modifier `lib/api/` manuellement
- **Auth flow** : JWT + refresh token avec retry automatique sur 401
- **MapBox** : Token via `EXPO_PUBLIC_MAPBOX_TOKEN` dans `.env`

---

## 📐 Conventions de code

### TypeScript
- `strict: true` activé
- Utiliser les types de `lib/api/models/` (User, Order, etc.)
- Éviter `as any` — utiliser les types générés
- Typer les props des composants

### Composants
- Composants fonctionnels uniquement
- `useMemo` / `useCallback` pour les fonctions coûteuses
- Cleanup dans les `useEffect` (return function)
- Pattern `let mounted = true` pour les async effects

### Nommage
- Fichiers composants : PascalCase (`AddressMapPicker.tsx`)
- Fichiers hooks : camelCase (`useProfile.ts`)
- Fichiers utilitaires : camelCase (`phone.ts`)
- Routes : kebab-case ou `[param]` pour les dynamiques

### Styles
- NativeWind (TailwindCSS) via `className`
- Couleurs dans `theme/colors.ts`
- Fonts : Quicksand (Regular, Bold, Light, Medium, SemiBold)

---

## 🔧 Commandes utiles

```bash
# Développement
cd client
npx expo start              # Démarrer le dev server
npx expo start --android    # Lancer sur Android
npx expo start --web        # Lancer en web

# Build
eas build --platform android
eas build --platform ios

# API client (après modification du backend OpenAPI)
npx openapi-typescript-codegen --input <swagger-url> --output lib/api

# Lint
npx eslint .
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
EXPO_PUBLIC_MAPBOX_TOKEN=pk.YOUR_MAPBOX_PUBLIC_TOKEN
```

### API Backend
- **Production** : https://tokana-app.onrender.com
- **Local** : http://localhost:5000
- Configuré dans `lib/api/client.ts` avec fallback automatique

---

## 🗺️ Migration MapBox (TERMINÉE ✅)

Migration complète de Google Maps vers MapBox :
- `react-native-maps` → `@rnmapbox/maps`
- Geocoding via API MapBox REST (`lib/mapbox/geocoding.ts`)
- Hook `useMapboxGeocoding` pour l'autocomplétion
- Composants : `AddressMapPicker`, `AddressAutocomplete`
- GPS tracking admin : `gps-tracking.tsx`
- Aucune trace de Google Maps restante

---

## ⚠️ Points d'attention

### Ne pas modifier
- `lib/api/` — Auto-généré par openapi-typescript-codegen
- `lib/api/core/` — Infrastructure HTTP client

### Auth flow
- `_layout.tsx` : Auth guard avec redirection par rôle (admin/client/livreur)
- `lib/api/client.ts` : Intercepteur 401 avec refresh token automatique
- `lib/auth/session.ts` : SecureStore avec fallback localStorage (web) et in-memory

### Téléphones Madagascar
- Format accepté : `+261XXXXXXXXX`, `0XXXXXXXXX`
- Préfixes mobiles : 030, 032, 033, 034, 038
- Fixe : 020
- Validation dans `utils/phone.ts`

### Performance
- 97 useEffect avec cleanup approprié
- 95 useMemo/useCallback pour la mémorisation
- GPS courier : envoi toutes les 60s avec cleanup d'interval
- Hermes engine activé pour Android
- ProGuard activé pour les builds release

### Sécurité
- Tokens dans expo-secure-store (pas AsyncStorage)
- Pas de secrets dans le code source
- `.env` dans `.gitignore`

---

## 🔄 Workflow de développement

1. Créer une branche feature : `git checkout -b feat/ma-feature`
2. Développer et tester localement
3. Commit avec messages conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`
4. Push et créer une PR
5. Review et merge

### Branche actuelle
- `feat/mapbox-migration` — Migration MapBox + cleanup audit
