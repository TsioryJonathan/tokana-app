# Configuration SMTP pour l'envoi d'emails OTP

Ce document explique comment configurer nodemailer pour envoyer des emails OTP dans l'application Tokana.

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` dans le dossier `server/`:

```env
# Configuration SMTP de base
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
```

## Configuration Gmail (Recommandé pour le développement)

### Étape 1: Activer l'authentification à deux facteurs
1. Allez sur https://myaccount.google.com/security
2. Activez la "Validation en deux étapes"

### Étape 2: Créer un mot de passe d'application
1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)" et entrez "Tokana App"
3. Cliquez sur "Générer"
4. Copiez le mot de passe généré (16 caractères)

### Étape 3: Configurer les variables d'environnement
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application (sans espaces)
SMTP_FROM=votre-email@gmail.com
```

## Configuration avec d'autres services SMTP

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
SMTP_FROM=noreply@tokana.mg
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
SMTP_FROM=noreply@tokana.mg
```

### SMTP personnalisé
```env
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=noreply@votre-domaine.com
```

## Ports et sécurité

- **Port 587** (STARTTLS): Recommandé, utilise `SMTP_SECURE=false`
- **Port 465** (SSL/TLS): Utilise `SMTP_SECURE=true` ou `SMTP_PORT=465`
- **Port 25**: Généralement bloqué par les FAI, non recommandé

## Vérification de la configuration

Au démarrage du serveur, vous verrez un message indiquant si la configuration SMTP est correcte:

```
[emailService] SMTP configuré: Gmail:587
[emailService] Configuration SMTP vérifiée avec succès
```

Si vous voyez:
```
[emailService] Variables SMTP manquantes (SMTP_HOST, SMTP_USER, SMTP_PASS). Mode DEV: emails seront loggés uniquement.
```

Cela signifie que les variables ne sont pas configurées et les emails seront seulement loggés dans la console (mode développement).

## Dépannage

### Erreur: "Invalid login"
- Vérifiez que `SMTP_USER` et `SMTP_PASS` sont corrects
- Pour Gmail, assurez-vous d'utiliser un mot de passe d'application, pas votre mot de passe normal

### Erreur: "Connection timeout"
- Vérifiez que `SMTP_HOST` et `SMTP_PORT` sont corrects
- Vérifiez votre connexion internet
- Vérifiez que le pare-feu n'bloque pas le port SMTP

### Erreur: "Self signed certificate"
- Ajoutez `SMTP_REJECT_UNAUTHORIZED=false` dans votre `.env` (uniquement pour les tests)

### Les emails ne sont pas reçus
- Vérifiez le dossier spam/courrier indésirable
- Vérifiez les logs du serveur pour voir les erreurs détaillées
- En mode développement, les emails sont loggés dans la console

## Mode développement

Si les variables SMTP ne sont pas configurées, le serveur fonctionnera en mode développement:
- Les emails seront loggés dans la console au lieu d'être envoyés
- Aucune erreur ne sera levée
- Utile pour le développement local sans configuration SMTP

## Support HTML dans les emails

Le service email supporte maintenant les emails HTML. Vous pouvez passer un paramètre HTML optionnel:

```javascript
await sendEmail(to, subject, text, html);
```

