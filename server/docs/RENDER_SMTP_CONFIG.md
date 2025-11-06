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

## 🔧 Alternative : Utiliser SendGrid (Recommandé pour Render)

Gmail peut avoir des problèmes avec Render à cause des restrictions réseau. **SendGrid** fonctionne mieux :

### Configuration SendGrid sur Render

1. Créez un compte sur https://sendgrid.com (gratuit jusqu'à 100 emails/jour)

2. Créez une API Key :
   - Settings → API Keys → Create API Key
   - Donnez-lui les permissions "Mail Send"
   - Copiez la clé API

3. Dans Render, configurez :

```
SMTP_HOST = smtp.sendgrid.net
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = apikey
SMTP_PASS = votre-api-key-sendgrid
SMTP_FROM = noreply@tokana.mg
SMTP_REJECT_UNAUTHORIZED = true
```

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

Après configuration, redéployez et vérifiez les logs. Vous devriez voir :

```
[emailService] SMTP configuré: Gmail
[emailService] ✅ Configuration SMTP vérifiée avec succès
```

Si vous voyez toujours un timeout, **passez à SendGrid**.

