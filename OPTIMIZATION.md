# 🚀 Optimisation de l'Application Tokana

Guide pour réduire la taille du bundle et améliorer les performances.

---

## 📦 Étape 1 : Nettoyer les Dépendances

### Dépendances à supprimer (non utilisées)

```bash
cd client

# Supprimer les packages inutilisés
npm uninstall \
  expo-blur \
  expo-haptics \
  expo-symbols \
  lottie-react-native \
  react-native-vector-icons \
  react-native-webview \
  react-native-worklets \
  victory-native \
  expo-document-picker

# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### ✅ Dépendances essentielles conservées

**Core**
- `expo` - Framework principal
- `expo-router` - Navigation
- `react-native` - Framework mobile

**Fonctionnalités clés**
- `expo-location` - GPS tracking livreurs
- `react-native-maps` - Carte GPS admin
- `react-native-toast-message` - Notifications

**UI/UX**
- `nativewind` - Styling (TailwindCSS)
- `lucide-react-native` - Icônes légères (vs @expo/vector-icons)
- `expo-linear-gradient` - Gradients

**Auth & Storage**
- `expo-secure-store` - Stockage sécurisé tokens
- `@react-native-async-storage/async-storage` - Cache

**Formulaires**
- `react-hook-form` - Gestion formulaires
- `zod` - Validation

---

## 🗑️ Étape 2 : Supprimer les Fichiers Inutiles

### Fichiers à supprimer

```bash
cd client

# Supprimer les exemples et démos
rm -rf scripts/reset-project.js
rm -rf assets/images/adaptive-icon.png
rm -rf assets/images/icon.png
rm -rf assets/images/splash.png

# Supprimer les fichiers de test
find . -name "*.test.ts" -delete
find . -name "*.test.tsx" -delete
find . -name "*.spec.ts" -delete

# Supprimer les README inutiles
find ./app -name "README.md" -delete
```

### Fichiers à garder
- `app/` - Code source
- `lib/` - Hooks et utilitaires
- `components/` - Composants réutilisables
- `assets/fonts/` - Polices Quicksand

---

## ⚙️ Étape 3 : Configuration Metro (Bundle Optimizer)

Créer `client/metro.config.js` :

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimisations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
    compress: {
      drop_console: true, // Supprimer console.log en production
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
  },
};

// Tree shaking
config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
};

module.exports = config;
```

---

## 📝 Étape 4 : Optimiser app.json

Modifier `client/app.json` :

```json
{
  "expo": {
    "assetBundlePatterns": [
      "assets/fonts/*"
    ],
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true
    },
    "ios": {
      "bitcode": false
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

---

## 🖼️ Étape 5 : Optimiser les Images

### Supprimer les images inutilisées

```bash
cd client/assets/images

# Garder uniquement les images utilisées
# Supprimer tout le reste
rm -rf *.png *.jpg *.jpeg
```

### Utiliser des formats optimisés
- **WebP** au lieu de PNG/JPG (70% plus léger)
- **SVG** pour les icônes (vectoriel)
- Compresser avec TinyPNG ou ImageOptim

---

## 🧹 Étape 6 : Nettoyer le Code

### Supprimer les console.log

Créer `client/scripts/remove-console.js` :

```javascript
const fs = require('fs');
const path = require('path');

function removeConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeConsoleLogs(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/console\.(log|info|debug|warn)\([^)]*\);?/g, '');
      fs.writeFileSync(filePath, content);
    }
  });
}

removeConsoleLogs('./app');
removeConsoleLogs('./lib');
console.log('✅ Console.log supprimés');
```

Exécuter :
```bash
node scripts/remove-console.js
```

### Supprimer les imports inutilisés

```bash
# Installer depcheck
npm install -g depcheck

# Analyser
depcheck

# Supprimer les imports non utilisés
npx eslint --fix .
```

---

## 📊 Étape 7 : Analyser la Taille du Bundle

### Installer l'analyseur

```bash
npm install --save-dev @expo/webpack-config
```

### Analyser

```bash
# Build de production
eas build --platform android --profile production

# Analyser la taille
npx expo export --platform android
```

### Objectifs de taille
- **APK Android** : < 30 MB
- **IPA iOS** : < 40 MB
- **Bundle JS** : < 5 MB

---

## 🚀 Étape 8 : Configuration EAS Build

Créer `client/eas.json` :

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "env": {
          "NODE_ENV": "production"
        }
      },
      "ios": {
        "buildConfiguration": "Release",
        "env": {
          "NODE_ENV": "production"
        }
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    }
  }
}
```

---

## ✅ Checklist d'Optimisation

### Avant le build
- [ ] Supprimer dépendances inutilisées
- [ ] Supprimer fichiers de test/demo
- [ ] Optimiser images (WebP, compression)
- [ ] Supprimer console.log
- [ ] Configurer Metro minifier
- [ ] Activer ProGuard (Android)
- [ ] Désactiver bitcode (iOS)

### Configuration
- [ ] `metro.config.js` avec minification
- [ ] `app.json` avec assetBundlePatterns
- [ ] `eas.json` avec profils optimisés
- [ ] `.gitignore` à jour

### Code
- [ ] Imports optimisés (tree-shaking)
- [ ] Pas de console.log en production
- [ ] Lazy loading des écrans
- [ ] Memoization des composants lourds

---

## 📈 Résultats Attendus

### Avant optimisation
- APK : ~50 MB
- Bundle JS : ~8 MB
- Temps de chargement : 3-5s

### Après optimisation
- APK : **~25 MB** (-50%)
- Bundle JS : **~4 MB** (-50%)
- Temps de chargement : **1-2s** (-60%)

---

## 🔧 Scripts NPM Utiles

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "clean": "rm -rf node_modules .expo .expo-shared dist",
    "clean:install": "npm run clean && npm install",
    "analyze": "npx expo export --platform android && du -sh dist",
    "optimize": "node scripts/remove-console.js && npx eslint --fix .",
    "build:prod": "npm run optimize && eas build --platform all --profile production"
  }
}
```

---

## 🎯 Optimisations Avancées

### 1. Code Splitting

```typescript
// Lazy load des écrans lourds
import { lazy, Suspense } from 'react';

const GpsTracking = lazy(() => import('./(admin)/gps-tracking'));

<Suspense fallback={<Loading />}>
  <GpsTracking />
</Suspense>
```

### 2. Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Composants
const ClientItem = memo(({ client }) => {
  return <View>...</View>;
});

// Calculs lourds
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Callbacks
const handlePress = useCallback(() => {
  doSomething();
}, []);
```

### 3. Image Optimization

```typescript
import { Image } from 'expo-image';

// Utiliser expo-image au lieu de Image RN
<Image
  source={{ uri: url }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### 4. Virtualized Lists

```typescript
import { FlashList } from '@shopify/flash-list';

// Au lieu de ScrollView pour grandes listes
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  estimatedItemSize={100}
/>
```

---

## 📞 Support

Pour toute question sur l'optimisation :
- Documentation Expo : https://docs.expo.dev/guides/performance/
- React Native Performance : https://reactnative.dev/docs/performance

---

**Dernière mise à jour :** Décembre 2025
