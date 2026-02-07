#!/bin/bash

# Script de migration Google Maps → Mapbox
# Usage: ./migrate-to-mapbox.sh

set -e

echo "🚀 Migration vers Mapbox..."

# 1. Installer Mapbox
echo "📦 Installation de @rnmapbox/maps..."
cd client
npm uninstall react-native-maps
npm install @rnmapbox/maps

# 2. Renommer les fichiers
echo "🔄 Renommage des fichiers..."
cd ..

if [ -f "client/components/AddressMapPicker.mapbox.tsx" ]; then
    mv "client/components/AddressMapPicker.mapbox.tsx" "client/components/AddressMapPicker.tsx"
    echo "✅ AddressMapPicker migré"
fi

if [ -f "client/app/(admin)/gps-tracking.mapbox.tsx" ]; then
    mv "client/app/(admin)/gps-tracking.mapbox.tsx" "client/app/(admin)/gps-tracking.tsx"
    echo "✅ GPS Tracking migré"
fi

# 3. Vérifier les autres fichiers Google Maps
echo "🔍 Recherche d'autres fichiers Google Maps..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -exec grep -l "PROVIDER_GOOGLE\|googleMaps\|@react-google-maps" {} \; 2>/dev/null | \
    while read file; do
        echo "⚠️  Fichier à vérifier: $file"
    done

# 4. Mettre à jour package.json
echo "📝 Mise à jour des dépendances..."
cd client
if grep -q "react-native-maps" package.json; then
    echo "❌ react-native-maps toujours présent dans package.json"
    echo "   Exécutez: npm uninstall react-native-maps"
fi

# 5. Instructions finales
echo ""
echo "🎉 Migration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Ajouter le token Mapbox dans .env:"
echo "   EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo ""
echo "2. Configurer les permissions:"
echo "   - iOS: Ajouter NSLocationWhenInUseUsageDescription dans Info.plist"
echo "   - Android: Ajouter ACCESS_FINE_LOCATION dans AndroidManifest.xml"
echo ""
echo "3. Tester les fonctionnalités:"
echo "   - Sélection d'adresse"
echo "   - Suivi GPS"
echo "   - Géocoding"
echo ""
echo "4. Build & déploiement:"
echo "   - iOS: pod install"
echo "   - Android: ./gradlew assembleRelease"
echo ""
echo "📚 Documentation: https://docs.mapbox.com/"
echo "🐛 Issues: Ouvrez une issue sur GitHub"