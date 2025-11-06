import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtenir le répertoire du fichier actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le .env depuis le répertoire server (2 niveaux au-dessus du script)
dotenv.config({ path: join(__dirname, '../../.env') });

import Zone from '../models/Zone.js';
import { sequelize } from '../config/sequelize.js';

async function checkZonesGeometry() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\n');

    const zones = await Zone.findAll({
      attributes: ['id', 'key', 'label', 'geometry'],
      order: [['key', 'ASC']],
    });

    console.log('📊 État des zones GeoJSON:\n');
    
    if (zones.length === 0) {
      console.log('⚠️  Aucune zone trouvée dans la base de données');
      return;
    }

    let allConfigured = true;
    for (const zone of zones) {
      const hasGeometry = zone.geometry !== null && 
                         zone.geometry !== undefined &&
                         (zone.geometry.type === 'Polygon' || zone.geometry.type === 'MultiPolygon');
      
      const status = hasGeometry ? '✅' : '❌';
      const geometryInfo = hasGeometry 
        ? `${zone.geometry.type} (${zone.geometry.coordinates?.[0]?.length || 0} points)`
        : 'Non configuré';
      
      console.log(`${status} ${zone.key.toUpperCase()}: ${zone.label}`);
      console.log(`   Géométrie: ${geometryInfo}`);
      
      if (!hasGeometry) {
        allConfigured = false;
      }
    }

    console.log('\n' + '='.repeat(50));
    if (allConfigured) {
      console.log('✅ Toutes les zones ont des géométries GeoJSON configurées');
      console.log('✅ La détection automatique de zone fonctionnera correctement');
    } else {
      console.log('⚠️  Certaines zones n\'ont pas de géométrie GeoJSON');
      console.log('⚠️  La détection automatique utilisera le fallback (sélection manuelle)');
      console.log('\n💡 Pour configurer les géométries, utilisez:');
      console.log('   PUT /api/admin/zones/key/{key}/geometry');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkZonesGeometry();

