# Configuration SMTP sur Render.com

## ⚠️ IMPORTANT : Sur Render, configurez les variables dans le Dashboard

Sur Render.com, **ne pas utiliser de fichier `.env`**. Les variables d'environnement doivent être configurées dans le **Dashboard Render**.

## 📋 Étapes pour configurer SMTP sur Render

### 1. Accédez au Dashboard Render

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service (tokana-app)
3. Allez dans l'onglet **"Environment"**

### 2. Ajoutez les variables SMTP

Cliquez sur **"Add Environment Variable"** et ajoutez :

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = tokanaservices@gmail.com
SMTP_PASS = ueuuuzlctfchwsdo
SMTP_FROM = tokanaservices@gmail.com
SMTP_REJECT_UNAUTHORIZED = true
```

**⚠️ IMPORTANT :**
- **Ne mettez PAS de guillemets** autour des valeurs
- **Pas d'espaces** avant ou après le `=`
- Le mot de passe doit être un **mot de passe d'application Gmail** (16 caractères)

### 3. Redéployez le service

Après avoir ajouté les variables, **redéployez** votre service :
- Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

## 🔧 Alternative : Utiliser SendGrid API REST (RECOMMANDÉ pour Render)

Gmail peut avoir des problèmes avec Render à cause des restrictions réseau. **SendGrid API REST** fonctionne beaucoup mieux car il utilise HTTP au lieu de SMTP :

### Configuration SendGrid API sur Render

1. Créez un compte sur https://sendgrid.com (gratuit jusqu'à 100 emails/jour)

2. Créez une API Key :
   - Settings → API Keys → Create API Key
   - Donnez-lui les permissions "Mail Send"
   - Copiez la clé API (commence par `SG.`)

3. Installez le package SendGrid dans le dossier `server` :
   ```bash
   cd server
   npm install @sendgrid/mail --save
   ```

4. Dans Render Dashboard, configurez **UNIQUEMENT** :
   ```
   SENDGRID_API_KEY = SG.votre-cle-api-sendgrid
   SENDGRID_FROM = noreply@tokana.mg
   SENDGRID_FROM_NAME = Tokana
   ```

   **⚠️ IMPORTANT :**
   - **Ne configurez PAS** les variables SMTP_HOST, SMTP_USER, SMTP_PASS si vous utilisez l'API SendGrid
   - L'API SendGrid utilise HTTP REST, donc pas de problème de connexion SMTP bloquée

### Configuration SendGrid via SMTP (Alternative, peut être bloquée)

Si vous préférez utiliser SMTP SendGrid au lieu de l'API :

## 🚨 Résolution du problème "Connection timeout" sur Render

### Problème 1 : Variables non chargées

Si vous voyez dans les logs :
```
[dotenv@17.2.3] injecting env (0) from .env
```

Cela signifie que **aucune variable n'est chargée**. Sur Render, vous **devez** configurer les variables dans le Dashboard, pas dans un fichier `.env`.

### Problème 2 : Gmail bloqué par Render

Gmail peut être bloqué par les restrictions réseau de Render. Solutions :

1. **Utilisez SendGrid** (recommandé)
2. **Utilisez Mailgun** (alternative)
3. **Utilisez le port 465 avec SSL** :

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 465
SMTP_SECURE = true
SMTP_USER = tokanaservices@gmail.com
SMTP_PASS = ueuuuzlctfchwsdo
SMTP_FROM = tokanaservices@gmail.com
```

### Problème 3 : Timeout trop court

Le code a été configuré avec des timeouts de 30 secondes pour Render. Si le problème persiste :

1. Vérifiez que les variables sont bien configurées dans Render Dashboard
2. Essayez SendGrid au lieu de Gmail
3. Vérifiez les logs Render pour plus de détails

## ✅ Vérification

Après configuration, redéployez et vérifiez les logs. 

**Si vous utilisez SendGrid API REST**, vous devriez voir :
```
[emailService] SendGrid API configurée (mode API REST)
[emailService] ✅ SendGrid API configurée (pas de vérification nécessaire)
```

**Si vous utilisez SMTP**, vous devriez voir :
```
[emailService] SMTP configuré: Gmail
[emailService] ✅ Configuration SMTP vérifiée avec succès
```

Si vous voyez toujours un timeout avec SMTP, **passez à SendGrid API REST**.

