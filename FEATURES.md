# 📋 Fonctionnalités - Tokana Delivery Management

## 1. Vue d'ensemble

Application de gestion de livraisons pour e-commerçants et logisticiens, avec deux rôles principaux :

- **ADMIN** : configuration, gestion des clients/livreurs, suivi des livraisons, règlements, rapports.
- **COURIER (Livreur)** : consultation et mise à jour des livraisons du jour, versements, dispatches, profil.

La plateforme couvre tout le cycle : **création de la livraison → collecte → livraison → encaissement → règlement admin → versement client J+1**.

---

## 2. Authentification & Sécurité

- **Login par email + mot de passe** (NextAuth.js).
- **Rôles** : `ADMIN`, `COURIER`.
- **Protection des routes** :
  - Accès admin uniquement pour tout le back-office.
  - Accès livreur pour l’application mobile/tablette.
- **Sessions JWT sécurisées**.
- **Mots de passe hashés** (bcryptjs).
- **Validation des données** (Zod).

---

## 3. Interface Administrateur

### 3.1 Dashboard

- **Vue d’ensemble du jour** :
  - Nombre total de livraisons.
  - Livraisons livrées / payées.
  - Livraisons reportées.
  - Livraisons annulées.
  - Livraisons en attente.
- **Compteurs globaux** : nombre total de clients, de livreurs.

### 3.2 Gestion des Clients

- **CRUD complet** sur les clients expéditeurs :
  - Création / édition / suppression.
  - Informations : nom, téléphone, adresse de récupération, zone.
- **Association des livraisons** à un client.

### 3.3 Gestion des Livreurs

- **CRUD complet** sur les livreurs :
  - Création / édition / suppression.
  - Informations : nom, email, téléphone, rôle.
- Activation du **tracking GPS** (par livreur).

### 3.4 Gestion des Livraisons

- **Création de livraisons** :
  - Sélection du client expéditeur.
  - Informations destinataire (nom, téléphone, adresse).
  - Poids, zone, type (standard / express), date planifiée.
  - Assignation éventuelle à un livreur.
- **Mise à jour des livraisons** :
  - Changement de statut (CREATED → PICKED_UP → DELIVERED → PAID, POSTPONED, CANCELED).
  - Modification des détails (tarifs, destinataire, etc.).
- **Filtrage / recherche** par statut, date, livreur, client.
- **Calcul automatique des tarifs** selon :
  - Zone (TANA-VILLE, PÉRIPHÉRIE, SUPER-PÉRIPHÉRIE).
  - Poids (≤2kg, 2–5kg, >5kg avec supplément).
  - Type : standard (J+1) ou express (même jour).
- **Gestion des livraisons prépayées** vs non prépayées.

### 3.5 Règlement du Soir (Livreur → Admin)

- **Vue “Règlement du soir”** :
  - Filtrer par date et livreur.
  - Voir toutes les livraisons payées pour un livreur.
  - Calcul automatique du **montant à remettre par le livreur** (cash + mobile money).
- **Confirmation des versements** :
  - Livreur déclare son versement depuis son app.
  - Admin confirme la réception.
- **Statistiques** :
  - Nombre de livreurs réglés / non réglés.
  - Total collecté.

### 3.6 Dispatches & Règlements J+1 (Admin → Clients)

- Regroupe automatiquement toutes les livraisons d’un même expéditeur, avec **compensation automatique** des montants positifs et négatifs.
- **Trois étapes principales** :
  1. **En attente** : clients à payer, aucun dispatch encore créé.
  2. **Assigné** : dispatchs créés, argent pas encore confirmé par le livreur.
  3. **En cours** : livreur a confirmé la réception, en train de remettre aux clients.
- **Pour chaque client** :
  - Montant net à remettre (incluant cas où le client doit de l’argent à l’entreprise).
  - Détail des livraisons (cas 1 à 5, montants verts/rouges).
- **Création de dispatches** :
  - Sélection du client à régler.
  - Choix du livreur.
  - Saisie de la répartition **Cash / Mobile Money** (somme contrôlée = montant total).
  - Enregistrement du dispatch avec liste des livraisons associées.
- **Suivi des dispatches** :
  - Statut : NON_DISPATCHED / WAITING_COURIER / IN_PROGRESS / COMPLETED.
  - Dates clés : remise admin, réception livreur, remise client, confirmation finale.

### 3.7 Rapports & Exports

- **Rapports Clients** :
  - Filtre par client, période de dates.
  - Détail de toutes les livraisons.
  - Calcul de **montant total à remettre**.
  - **Export PDF** et/ou CSV.
- **Règlements du soir** :
  - Rapport par livreur et par date.
  - Montants collectés et à remettre.
- **Historique** :
  - Filtre par date (Aujourd’hui / 7 jours / 30 jours / personnalisé).
  - Vue des règlements et dispatches passés.

### 3.8 Suivi GPS des Livreurs

- **Carte interactive** (Leaflet + OpenStreetMap).
- **Marqueurs par livreur**, avec position, heure de dernière mise à jour, statut.
- Mise à jour automatique toutes les **1 minute**.
- Possibilité d’activer/désactiver le tracking par livreur (côté admin).

---

## 4. Interface Livreur

### 4.1 Livraisons du Jour

- Liste des livraisons du jour (groupées par statut ou par client).
- Affichage des informations clés :
  - Expéditeur, destinataire, adresses.
  - Montant à encaisser.
  - Indication prépayé / non prépayé.
- **Actions rapides sur chaque livraison** :
  - `Récupérer` (PICKED_UP).
  - `Livrer` (DELIVERED).
  - `Payer` (PAID).
  - `Reporter` (POSTPONED).
  - `Annuler` (CANCELED) si applicable.
- Saisie de **remarques** par livraison.

### 4.2 Bilan (Résumé quotidien)

- Section **“Versement à Admin”** :
  - Total collecté (cash + mobile money).
  - Détail des montants.
  - Bouton **“Confirmer versement”**.
- Section **“Dispatches Reçus”** :
  - Liste des dispatches créés par l’admin, en attente de confirmation.
  - Action **“Confirmer réception”**.
- Section **“Dispatches Confirmés”** :
  - Dispatches pour lesquels le livreur a déjà reçu l’argent.

### 4.3 Versements aux Clients (Règlements J+1)

- Vue **“Versements”** avec 2 onglets :
  - **En cours** : versements à effectuer.
  - **Effectué** : historique des versements déjà réalisés.
- **Filtre par date** : Tout / Aujourd’hui / 7j / 30j.
- Pour chaque client :
  - Montant net à remettre (peut être négatif si frais à déduire).
  - Détail des livraisons incluses.
- Action **“Valider versement”** lorsqu’il remet effectivement l’argent au client.

### 4.4 Profil Livreur & GPS

- Consultation des informations personnelles.
- **Activation du GPS** (côté mobile) pour partage de position.
- Mise à jour régulière de la position envoyée au backend.

---

## 5. Logique Métier de Règlement

- Gestion de **5 cas de livraison** selon :
  - `isPrepaid` (prépayé ou non).
  - `deliveryFeePrepaid` (frais déjà payés ou non).
- Calculs automatiques :
  - **Montant à remettre au client** (positif) ou à déduire (négatif).
  - **Montant total collecté par le livreur** (incluant frais de récupération).
  - **Net à l’admin** = total collecté – total versé aux clients.
- **Compensation automatique** par expéditeur :
  - Regroupe tous les montants positifs et négatifs d’un client pour ne faire **qu’une seule transaction nette**.
- Gestion des soldes négatifs (client qui doit de l’argent à l’entreprise).

---

## 6. Réseau, PWA & Expérience Utilisateur

- **Responsive** : mobile, tablette, desktop.
- **PWA** :
  - Installable sur mobile.
  - Mode hors ligne pour certaines sections.
  - Service Worker et manifest configurés.
- **Détection de connexion Internet** :
  - Hook `useOnline()`.
  - Badge “Hors ligne”.
  - Toasts lors de la perte / reprise de connexion.
- **Auto-refresh** : rafraîchissement de certaines vues toutes les 30 secondes (dispatches, versements, etc.).

---

## 7. Rapports, Exports & Performance

- **Exports PDF** (et table auto en PDF) pour :
  - Compte rendu client.
  - Règlements du soir.
- **CSV** pour exploitation externe (ex : Excel).
- Optimisations :
  - Requêtes Prisma optimisées (groupBy, filtres ciblés).
  - Utilisation de React Query (cache, revalidation).
  - Code splitting et lazy loading sur certaines pages.

---

## 8. Résumé Fonctionnel par Rôle

### 8.1 Admin

- Gérer : clients, livreurs, livraisons, tarifs.
- Suivre la journée en temps réel (dashboard + GPS).
- Valider les règlements des livreurs (soir).
- Créer et suivre les dispatches J+1.
- Verser l’argent aux clients (via les livreurs) avec compensation automatique.
- Générer des rapports détaillés et exports PDF/CSV.

### 8.2 Livreur

- Consulter les livraisons du jour.
- Mettre à jour les statuts des colis.
- Enregistrer et confirmer son versement à l’admin.
- Recevoir les dispatches de règlements clients.
- Remettre l’argent aux clients et valider les versements.
- Partager sa position GPS pour le suivi en temps réel.

---

**Dernière mise à jour :** 26 novembre 2025
