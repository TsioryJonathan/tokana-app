const fs = require('fs');
const path = require('path');

let filesProcessed = 0;
let consolesRemoved = 0;

function removeConsoleLogs(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Ignorer node_modules et .expo
        if (!file.startsWith('.') && file !== 'node_modules') {
          removeConsoleLogs(filePath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;
        
        // Supprimer console.log, console.info, console.debug, console.warn
        // Regex améliorée pour gérer les console.log multi-lignes
        content = content.replace(/console\.(log|info|debug|warn)\s*\([^)]*\)\s*;?\s*\n?/g, '');
        
        // Nettoyer les lignes vides multiples laissées par la suppression
        content = content.replace(/\n{3,}/g, '\n\n');
        
        if (content.length !== originalLength) {
          fs.writeFileSync(filePath, content);
          filesProcessed++;
          consolesRemoved += (originalLength - content.length) / 50; // Estimation
          console.log(`✅ Nettoyé: ${filePath}`);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Erreur dans ${dir}:`, error.message);
  }
}

console.log('🧹 Nettoyage des console.log en cours...\n');

// Nettoyer les dossiers principaux
removeConsoleLogs(path.join(__dirname, '../app'));
removeConsoleLogs(path.join(__dirname, '../lib'));
removeConsoleLogs(path.join(__dirname, '../components'));

console.log(`\n✅ Terminé !`);
console.log(`📊 ${filesProcessed} fichier(s) modifié(s)`);
console.log(`🗑️  ~${Math.round(consolesRemoved)} console.log supprimés`);
