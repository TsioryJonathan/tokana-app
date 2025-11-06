# Guide de configuration SMTP pour Tokana

## 📋 Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` dans le dossier `server/`:

### Configuration Gmail (Recommandé)

```env
# Configuration Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
SMTP_REJECT_UNAUTHORIZED=true
```

### ⚠️ IMPORTANT : Pour Gmail, vous DEVEZ utiliser un "Mot de passe d'application"

**Étapes pour créer un mot de passe d'application Gmail :**

1. **Activez la validation en deux étapes** (obligatoire)
   - Allez sur https://myaccount.google.com/security
   - Activez "Validation en deux étapes"

2. **Créez un mot de passe d'application**
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Autre (nom personnalisé)" et entrez "Tokana App"
   - Cliquez sur "Générer"
   - **Copiez le mot de passe généré** (16 caractères, format: `xxxx xxxx xxxx xxxx`)
   - **Supprimez les espaces** avant de le mettre dans le .env

3. **Dans votre .env, utilisez ce mot de passe d'application** (pas votre mot de passe Gmail normal)

```env
SMTP_PASS=abcdefghijklmnop  # Le mot de passe d'application SANS espaces
```

---

## 🔧 Autres services SMTP

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
SMTP_FROM=noreply@tokana.mg
SMTP_REJECT_UNAUTHORIZED=true
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
SMTP_FROM=noreply@tokana.mg
SMTP_REJECT_UNAUTHORIZED=true
```

### SMTP personnalisé (votre propre serveur)

```env
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=noreply@votre-domaine.com
SMTP_REJECT_UNAUTHORIZED=false  # Mettre à false si certificat auto-signé
```

---

## 🚨 Résolution du problème "Connection timeout"

### 1. Vérifiez vos variables d'environnement

Assurez-vous que toutes les variables sont bien définies dans `server/.env` :

```bash
# Vérifiez que le fichier existe
ls server/.env

# Vérifiez le contenu (sans afficher les mots de passe)
cat server/.env | grep SMTP
```

### 2. Pour Gmail spécifiquement

- ✅ Utilisez un **mot de passe d'application** (pas votre mot de passe normal)
- ✅ Activez la **validation en deux étapes** avant de créer le mot de passe d'application
- ✅ Supprimez **tous les espaces** du mot de passe d'application

### 3. Vérifiez votre connexion internet

```bash
# Testez la connexion au serveur SMTP
telnet smtp.gmail.com 587
# ou
nc -zv smtp.gmail.com 587
```

### 4. Vérifiez le pare-feu

Assurez-vous que le port 587 (ou 465) n'est pas bloqué par votre pare-feu.

### 5. Testez avec un autre port

Si le port 587 ne fonctionne pas, essayez le port 465 avec SSL :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
```

---

## 📝 Exemple complet de fichier .env

```env
# Base de données
POSTGRES_URI=postgresql://user:password@localhost:5432/tokana

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=monemail@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=monemail@gmail.com
SMTP_REJECT_UNAUTHORIZED=true

# Autres variables...
NODE_ENV=development
PORT=3000
```

---

## ✅ Vérification

Après avoir configuré votre `.env`, redémarrez le serveur. Vous devriez voir :

```
[emailService] SMTP configuré: Gmail
[emailService] Configuration SMTP vérifiée avec succès
```

Si vous voyez :
```
[emailService] Erreur vérification SMTP: Connection timeout
```

Cela signifie :
1. ❌ Les variables ne sont pas correctement chargées
2. ❌ Le mot de passe est incorrect (pour Gmail, utilisez un mot de passe d'application)
3. ❌ Le pare-feu bloque la connexion
4. ❌ Problème de connexion internet

---

## 🔍 Mode développement (sans SMTP)

Si vous ne configurez pas SMTP, le serveur fonctionnera en mode développement :
- Les emails seront **loggés dans la console** au lieu d'être envoyés
- Aucune erreur ne sera levée
- Utile pour le développement local

---

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs du serveur pour plus de détails
2. Testez la connexion SMTP avec un client email (Thunderbird, Outlook)
3. Vérifiez que votre compte email n'est pas suspendu ou limité
