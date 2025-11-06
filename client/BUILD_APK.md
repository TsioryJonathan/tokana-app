# Build APK léger avec EAS

## Configuration optimisée

Le projet est configuré pour générer un APK léger avec les optimisations suivantes :

### Optimisations activées

1. **Hermes Engine** : Moteur JavaScript optimisé pour React Native
2. **ProGuard** : Minification et obfuscation du code Java/Kotlin
3. **Resource Shrinking** : Suppression des ressources non utilisées
4. **Metro Minifier** : Minification agressive du JavaScript
5. **Console.log removal** : Suppression des console.log en production
6. **Asset optimization** : Exclusion des fichiers inutiles via `.easignore`

### Commandes de build

#### Build APK de production (recommandé)
```bash
cd client
eas build --platform android --profile production-apk
```

#### Build APK de preview
```bash
cd client
eas build --platform android --profile preview
```

### Vérification avant le build

1. Assurez-vous d'être connecté à EAS :
```bash
eas login
```

2. Vérifiez votre configuration :
```bash
eas whoami
```

3. Vérifiez que le projet est bien configuré :
```bash
eas project:info
```

### Taille attendue

Avec ces optimisations, l'APK devrait faire environ **15-25 MB** (selon les assets).

### Réduction supplémentaire (optionnel)

Si vous voulez réduire encore plus la taille :

1. **Optimiser les images** : Compresser les images dans `assets/images/`
2. **Supprimer les dépendances inutiles** : Vérifier `package.json`
3. **Utiliser des formats d'image modernes** : WebP au lieu de PNG

### Téléchargement

Une fois le build terminé, vous pouvez télécharger l'APK depuis :
- Le dashboard EAS : https://expo.dev/accounts/[votre-compte]/projects/tokana-app/builds
- Ou via la commande : `eas build:list`

