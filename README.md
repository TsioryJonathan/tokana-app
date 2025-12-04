# 📦 Tokana App - Application de Livraison

Application complète de gestion de livraisons avec interface mobile React Native et backend Node.js/Express.

## 🎯 Vue d'ensemble

Tokana est une plateforme de livraison multi-rôles comprenant :
- **Interface Client** : Commander des livraisons, suivre en temps réel
- **Interface Livreur** : Gérer les courses, GPS tracking, règlements
- **Interface Admin** : Gestion complète (clients, livreurs, règlements, GPS)

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Expo CLI
- Android Studio / Xcode (pour émulateurs)

### Backend

```bash
cd server
npm install
```

Créer un fichier `.env` :
```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Base de données
POSTGRES_URI=postgresql://user:password@localhost:5432/tokana

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Email (SendGrid ou SMTP)
SENDGRID_API_KEY=votre_cle_sendgrid
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=votre_mot_de_passe
EMAIL_FROM=noreply@tokana.com
```

Démarrer le serveur :
```bash
npm run dev
```

### Client Mobile

```bash
cd client
npm install
```

Configurer l'API dans `app.json` :
```json
{
  "extra": {
    "API_BASE_DEV": "http://192.168.0.60:5000",
    "API_BASE_PROD": "https://tokana-app.onrender.com"
  }
}
```

Démarrer l'app :
```bash
npx expo start
```

---

## 👥 Rôles et Fonctionnalités

### 🛒 **CLIENT**

#### Inscription / Connexion
1. Ouvrir l'app → **S'inscrire**
2. Remplir : Nom, Email, Téléphone (+261...), Mot de passe
3. Vérifier l'email (code OTP envoyé)
4. Se connecter

#### Commander une Livraison
1. **Accueil** → Bouton **"Nouvelle commande"**
2. **Étape 1 - Expéditeur** :
   - Sélectionner une adresse enregistrée OU
   - Ajouter nouvelle adresse (nom, téléphone, adresse complète)
3. **Étape 2 - Destinataire** :
   - Idem expéditeur
4. **Étape 3 - Colis** :
   - Description du colis
   - Poids (kg)
   - Valeur déclarée (Ar)
   - Photo (optionnel)
5. **Étape 4 - Options** :
   - Type : Standard / Express
   - Mode paiement : Cash / Mobile Money / Prépayé
   - Frais de livraison prépayés : Oui/Non
   - Créneau horaire
6. **Récapitulatif** → Confirmer

#### Suivre une Commande
1. **Mes commandes** → Sélectionner une commande
2. Voir :
   - Statut actuel (Créée, Récupérée, En transit, Livrée)
   - Détails expéditeur/destinataire
   - Informations colis
   - Prix et paiement
3. **Tracking GPS** (si en transit) :
   - Carte avec position livreur en temps réel
   - Itinéraire estimé

#### Gérer les Adresses
1. **Profil** → **Adresses enregistrées**
2. Ajouter / Modifier / Supprimer des adresses
3. Définir une adresse par défaut

---

### 🚴 **LIVREUR**

#### Connexion
1. Se connecter avec compte livreur
2. Interface livreur s'ouvre automatiquement

#### Activer le GPS
1. **Profil** → Switch **"Tracking GPS"**
2. Autoriser la localisation
3. Position envoyée automatiquement toutes les 60s

#### Gérer les Courses
1. **Mes courses** → Liste des commandes assignées
2. Filtres : Toutes / À récupérer / En cours / Livrées
3. Sélectionner une commande :
   - **Récupérer** → Change statut à "Récupérée"
   - **En chemin** → Change statut à "En transit"
   - **Livrer** → Change statut à "Livrée"

#### Actions Avancées
Dans le détail d'une commande :
- **Reporter** :
  - Bouton "Actions avancées" → "Reporter"
  - Indiquer raison (min 5 caractères)
  - Confirmer
- **Transférer** :
  - Bouton "Actions avancées" → "Transférer"
  - Saisir ID du livreur cible
  - Raison (optionnel)
  - Confirmer
- **Ajouter remarque** :
  - Champ "Remarques"
  - Saisir et enregistrer

#### Règlement du Soir
1. **Profil** → **"Règlement du soir"**
2. Voir :
   - Total livraisons du jour
   - Montant total collecté
   - Détail par commande
3. **Déclarer versement** :
   - Saisir montant Cash
   - Saisir montant Mobile Money
   - Bouton "Déclarer le règlement"
4. Statut : DECLARED (en attente confirmation admin)

#### Versements Clients J+1 (Dispatches)
1. **Profil** → **"Versements clients J+1"**
2. Onglets :
   - **En cours** : Dispatches assignés
   - **Effectués** : Dispatches terminés
3. Pour chaque dispatch :
   - Voir client, montant net, cash, mobile money
   - Bouton **"Démarrer"** → Statut IN_PROGRESS
   - Bouton **"Confirmer"** → Statut COMPLETED

#### Historique
1. **Profil** → **"Historique"**
2. Rechercher par ID, adresse, destinataire
3. Filtrer par statut
4. Voir toutes les livraisons passées

---

### 👨‍💼 **ADMIN**

#### Connexion
1. Se connecter avec compte admin
2. Dashboard admin s'ouvre

#### Dashboard
Vue d'ensemble :
- **Disponibilités** : Fenêtres Standard/Express
- **KPIs du jour** : Commandes, livrées, en cours, retard, CA
- **Graphique** : Évolution sur 7 jours
- **Alertes** : Colis lourds, OTP en attente
- **Statut zones** : Géométries configurées

#### Gestion Clients
1. **Dashboard** → **Gestion** → **👥 Clients**
2. **Liste clients** :
   - Recherche par nom/email/téléphone
   - Filtres par zone (TANA-VILLE, PÉRIPHÉRIE, SUPER-PÉRIPHÉRIE)
   - Voir zone, adresse, notes
3. **Créer un client** :
   - Bouton **"Nouveau"**
   - Remplir : Nom, Email, Téléphone, Mot de passe (obligatoires)
   - Zone, Adresse, Notes (optionnels)
   - Bouton **"Créer le client"**
4. **Détail client** :
   - Cliquer sur un client
   - Voir toutes les infos
   - Boutons : **Modifier** / **Supprimer**

#### Gestion Livreurs
1. **Dashboard** → **Gestion** → **🚴 Livreurs**
2. **Liste livreurs** :
   - Recherche par nom/email/téléphone
   - Filtres GPS : Tous / GPS Activé / GPS Désactivé
   - Badge statut GPS + dernière position
3. **Créer un livreur** :
   - Bouton **"Nouveau"**
   - Remplir : Nom, Email, Téléphone, Mot de passe
   - Switch GPS (activé par défaut)
   - Bouton **"Créer le livreur"**
4. **Détail livreur** :
   - Cliquer sur un livreur
   - **Switch GPS** : Activer/Désactiver tracking
   - **Dernière position** : Lat/Lng + timestamp
   - **Performances** :
     - Total commandes
     - Livrées
     - En cours
     - Taux de réussite
   - Boutons : **Modifier** / **Supprimer**

#### Validation Règlements du Soir
1. **Dashboard** → **Règlements** → **Règlement du soir**
2. **En attente de confirmation** (badge amber) :
   - Voir livreur, date
   - Montants : Cash, Mobile Money, Total
   - Date de déclaration
   - Bouton **"Confirmer le règlement"**
3. **Confirmés** (badge vert) :
   - Historique des règlements validés
   - Date de confirmation

#### Gestion Dispatches J+1
1. **Dashboard** → **Règlements** → **💰 Dispatches J+1**
2. **Tabs** :
   - **En attente** (PENDING)
   - **Assigné** (ASSIGNED)
   - **En cours** (IN_PROGRESS)
   - **Terminé** (COMPLETED)
3. Pour chaque dispatch :
   - Client, Livreur
   - Montant net, Cash, Mobile Money
   - Liste des commandes incluses

#### Suivi GPS Temps Réel
1. **Dashboard** → **Règlements** → **🗺️ Suivi GPS**
2. **Carte Google Maps** :
   - Marqueurs 🚴 pour chaque livreur actif
   - Cliquer sur marqueur → Voir nom + dernière position
   - Auto-refresh toutes les 30 secondes
3. **Liste livreurs actifs** :
   - Nom, email, badge "En ligne"
   - Position GPS (Lat/Lng)
   - Timestamp dernière mise à jour
   - Stats : Commandes en cours / Livrées
4. **Liste livreurs inactifs** :
   - GPS désactivé ou aucune position

#### Gestion Commandes
1. **Dashboard** → **Commandes**
2. Filtres : Toutes / Créées / Récupérées / En transit / Livrées
3. Recherche par ID, client, livreur
4. Actions :
   - Voir détails
   - Assigner à un livreur
   - Modifier statut
   - Ajouter remarques

---

## 🔧 Configuration Avancée

### Zones de Livraison
1. **Dashboard Admin** → **Zones**
2. Configurer les zones :
   - TANA-VILLE
   - PÉRIPHÉRIE
   - SUPER-PÉRIPHÉRIE
3. Définir géométries (polygones) pour chaque zone

### Grille Tarifaire
Les tarifs sont calculés automatiquement selon :
- **Type** : Standard / Express
- **Zone** : TANA-VILLE / PÉRIPHÉRIE / SUPER-PÉRIPHÉRIE
- **Poids** : Tranches de poids (0-2kg, 2-5kg, 5-10kg, 10kg+)

Configuration dans le backend : `server/config/pricing.js`

### Créneaux Horaires
- **Standard** : 8h-18h
- **Express** : 8h-12h et 14h-18h

Configuration : `server/config/businessHours.js`

---

## 📱 Navigation dans l'App

### Client
```
Accueil
├── Nouvelle commande (4 étapes)
├── Mes commandes
│   └── Détail commande
│       └── Tracking GPS
├── Adresses
└── Profil
```

### Livreur
```
Mes courses
├── Filtres (Toutes/À récupérer/En cours/Livrées)
└── Détail commande
    ├── Changer statut (Récupérer/En chemin/Livrer)
    ├── Actions avancées (Reporter/Transférer)
    └── Remarques

Profil
├── Tracking GPS (ON/OFF)
├── Règlement du soir
├── Versements clients J+1
│   ├── En cours
│   └── Effectués
└── Historique
```

### Admin
```
Dashboard
├── KPIs + Graphiques
├── Gestion
│   ├── 👥 Clients (Liste/Créer/Détail/Modifier/Supprimer)
│   └── 🚴 Livreurs (Liste/Créer/Détail/Modifier/Supprimer/GPS)
├── Règlements
│   ├── Règlement du soir (Valider)
│   ├── 💰 Dispatches J+1 (4 statuts)
│   └── 🗺️ Suivi GPS (Carte temps réel)
├── Commandes
├── Zones
└── Profil
```

---

## 🔐 Sécurité

### Authentification
- JWT avec access token + refresh token
- Tokens stockés en SecureStore (mobile)
- Expiration : 24h (access), 7j (refresh)

### Autorisation
- Middleware `protect` : Vérifie JWT
- Middleware `authorize(role)` : Vérifie rôle (client/livreur/admin)
- Routes protégées par rôle

### Vérification Email
- Code OTP 6 chiffres envoyé par email
- Expiration : 10 minutes
- Requis pour accéder à l'app

---

## 🗄️ Base de Données

### Modèles Principaux
- **User** : Utilisateurs (client/livreur/admin)
- **Order** : Commandes
- **Dispatch** : Versements clients J+1
- **CourierSettlement** : Règlements du soir livreur→admin
- **Zone** : Zones de livraison
- **Address** : Adresses enregistrées

### Relations
```
User (client) ──1:N──> Order
User (livreur) ──1:N──> Order (assignedTo)
User (client) ──1:N──> Dispatch
User (livreur) ──1:N──> Dispatch
User (livreur) ──1:N──> CourierSettlement
Order ──N:1──> Dispatch (clientDispatchId)
```

---

## 🚀 Déploiement

### Backend (Render)
```bash
# Build
npm run build

# Start
npm start
```

Variables d'environnement sur Render :
- `NODE_ENV=production`
- `POSTGRES_URI=...`
- `JWT_SECRET=...`
- `SENDGRID_API_KEY=...`

### Mobile (EAS Build)
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Submit to stores
eas submit
```

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-email` - Vérifier email
- `POST /api/auth/refresh` - Refresh token
- `GET /api/me` - Profil utilisateur

### Orders (Client)
- `GET /api/orders` - Liste commandes
- `POST /api/orders` - Créer commande
- `GET /api/orders/:id` - Détail commande

### Courier
- `GET /api/courier/settlements/evening` - Règlement du soir
- `POST /api/courier/settlements/evening/declare` - Déclarer règlement
- `GET /api/courier/dispatches` - Liste dispatches
- `PATCH /api/courier/dispatches/:id/status` - Mettre à jour dispatch
- `POST /api/courier/orders/:id/postpone` - Reporter commande
- `POST /api/courier/orders/:id/transfer` - Transférer commande

### Admin
- `GET /api/admin/clients` - Liste clients
- `POST /api/admin/clients` - Créer client
- `GET /api/admin/couriers` - Liste livreurs
- `POST /api/admin/couriers` - Créer livreur
- `PATCH /api/admin/couriers/:id/gps` - Toggle GPS
- `GET /api/admin/settlements/evening` - Règlements du soir
- `POST /api/admin/settlements/evening/:id/confirm` - Confirmer règlement
- `GET /api/admin/dispatches` - Liste dispatches
- `GET /api/admin/gps/couriers` - Positions GPS

---

## 🐛 Dépannage

### L'app ne se connecte pas au backend
1. Vérifier que le serveur tourne : `http://localhost:5000/api/health`
2. Vérifier l'URL dans `app.json` → `extra.API_BASE_DEV`
3. Sur Android : Utiliser l'IP locale (pas localhost)
4. Redémarrer Expo : `npx expo start --clear`

### GPS ne fonctionne pas
1. Vérifier permissions localisation accordées
2. Activer GPS dans Profil livreur
3. Vérifier `gpsEnabled=true` dans la BDD
4. Tester sur appareil réel (pas émulateur)

### Erreurs de validation
- Email : Format valide requis
- Téléphone : Format Madagascar (+261... ou 0...)
- Mot de passe : Minimum 6 caractères

### Toast ne s'affiche pas
1. Vérifier `react-native-toast-message` installé
2. Vérifier `<Toast />` dans `_layout.tsx`
3. Redémarrer l'app

---

## 📞 Support

Pour toute question ou problème :
- Email : support@tokana.com
- GitHub Issues : [tokana-app/issues](https://github.com/TsioryJonathan/tokana-app/issues)

---

## 📄 Licence

MIT License - Voir fichier LICENSE

---

## 🎉 Contributeurs

- **TsioryJonathan** - Développeur principal

---

**Version:** 2.0.0  
**Dernière mise à jour:** Décembre 2025
